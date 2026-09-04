import { Octokit } from '@octokit/rest';
import prisma from '../lib/db.js';
import { auditService } from '../audit/service.js';

/**
 * GitHub Integration Service
 * States: UNCONFIGURED | AUTHENTICATION_FAILED | RATE_LIMITED | CONFIGURED
 */

interface GitHubConfig {
  token: string;
  owner: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;
  private state: 'UNCONFIGURED' | 'AUTHENTICATION_FAILED' | 'RATE_LIMITED' | 'CONFIGURED' = 'UNCONFIGURED';

  /**
   * Initialize GitHub client if credentials are available
   */
  async initialize(): Promise<void> {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;

    if (!token || !owner) {
      this.state = 'UNCONFIGURED';
      return;
    }

    try {
      this.octokit = new Octokit({ auth: token });
      this.config = { token, owner };

      // Verify authentication
      const { data: user } = await this.octokit.users.getAuthenticated();
      
      if (user.login !== owner) {
        this.state = 'AUTHENTICATION_FAILED';
        this.octokit = null;
        this.config = null;
        return;
      }

      this.state = 'CONFIGURED';

      await auditService.recordEvent({
        eventType: 'SYSTEM_EVENT',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_initialized',
        resource: 'github_integration',
        metadata: { owner: user.login },
      });
    } catch (error) {
      this.state = 'AUTHENTICATION_FAILED';
      this.octokit = null;
      this.config = null;

      await auditService.recordEvent({
        eventType: 'ERROR_OCCURRED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_init_failed',
        resource: 'github_integration',
        metadata: { error: String(error) },
      });
    }
  }

  /**
   * Get current connection state
   */
  getState(): 'UNCONFIGURED' | 'AUTHENTICATION_FAILED' | 'RATE_LIMITED' | 'CONFIGURED' {
    return this.state;
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<{ remaining: number; limit: number; reset: Date }> {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const { data } = await this.octokit.rateLimit.get();
    
    const remaining = data.resources.core.remaining;
    const limit = data.resources.core.limit;
    const reset = new Date(data.resources.core.reset * 1000);

    if (remaining === 0) {
      this.state = 'RATE_LIMITED';
    }

    return { remaining, limit, reset };
  }

  /**
   * Get repository information
   */
  async getRepository(repo: string) {
    if (!this.octokit || !this.config) {
      return { state: 'UNCONFIGURED' as const };
    }

    try {
      const { data } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo,
      });

      return { state: 'CONFIGURED' as const, data };
    } catch (error) {
      return { state: 'ERROR' as const, error: String(error) };
    }
  }

  /**
   * List repositories for owner
   */
  async listRepos() {
    if (!this.octokit || !this.config) {
      return { state: 'UNCONFIGURED' as const };
    }

    try {
      const { data } = await this.octokit.repos.listForUser({
        username: this.config.owner,
        per_page: 100,
      });

      return { state: 'CONFIGURED' as const, data };
    } catch (error) {
      return { state: 'ERROR' as const, error: String(error) };
    }
  }

  /**
   * Ingest a repository (idempotent)
   */
  async ingestRepository(repoName: string): Promise<{ success: boolean; error?: string }> {
    if (!this.octokit || !this.config) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      // Check if already ingested
      const existing = await prisma.ingestedRepository.findUnique({
        where: { fullName: `${this.config.owner}/${repoName}` },
      });

      if (existing && existing.status === 'COMPLETED') {
        // Already ingested - idempotent
        return { success: true };
      }

      // Get repository info
      const repoResult = await this.getRepository(repoName);
      if (repoResult.state !== 'CONFIGURED') {
        return { success: false, error: 'Failed to get repository' };
      }

      const repoData = repoResult.data;

      // Create or update repository record
      const ingestedRepo = await prisma.ingestedRepository.upsert({
        where: { fullName: `${this.config.owner}/${repoName}` },
        update: {
          status: 'IN_PROGRESS',
          lastSyncedAt: new Date(),
        },
        create: {
          id: crypto.randomUUID(),
          owner: this.config.owner,
          name: repoName,
          fullName: `${this.config.owner}/${repoName}`,
          url: repoData.html_url,
          defaultBranch: repoData.default_branch,
          license: repoData.license?.spdx_id ?? null,
          language: repoData.language,
          topics: JSON.stringify(repoData.topics ?? []),
          status: 'IN_PROGRESS',
        },
      });

      // Get commits
      const { data: commits } = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: repoName,
        per_page: 100,
      });

      let commitCount = 0;
      let fileCount = 0;

      // Process commits (limit to recent 100 for initial ingestion)
      for (const commit of commits) {
        try {
          await prisma.ingestedCommit.upsert({
            where: {
              repositoryId_sha: {
                repositoryId: ingestedRepo.id,
                sha: commit.sha,
              },
            },
            update: {},
            create: {
              id: crypto.randomUUID(),
              repositoryId: ingestedRepo.id,
              sha: commit.sha,
              message: commit.commit.message,
              author: commit.commit.author?.name ?? 'unknown',
              authorEmail: commit.commit.author?.email,
              committedAt: new Date(commit.commit.author?.date ?? Date.now()),
            },
          });
          commitCount++;
        } catch {
          // Skip duplicate commits
        }
      }

      // Get files from latest commit
      try {
        const { data: content } = await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: repoName,
          path: '',
        });

        if (Array.isArray(content)) {
          for (const item of content.slice(0, 50)) { // Limit files for initial ingestion
            if (item.type === 'file' && item.size < 1024 * 1024) { // Skip large files
              try {
                const fileContent = await this.octokit.repos.getContent({
                  owner: this.config.owner,
                  repo: repoName,
                  path: item.path,
                });

                if ('content' in fileContent.data) {
                  const content = Buffer.from(fileContent.data.content, 'base64').toString('utf-8');
                  
                  await prisma.ingestedFile.create({
                    data: {
                      id: crypto.randomUUID(),
                      repositoryId: ingestedRepo.id,
                      path: item.path,
                      content: content.slice(0, 100000), // Limit content size
                      contentHash: crypto.randomUUID(), // Should compute actual hash
                      size: item.size ?? 0,
                      language: item.name.split('.').pop() ?? undefined,
                    },
                  });
                  fileCount++;
                }
              } catch {
                // Skip files that can't be fetched
              }
            }
          }
        }
      } catch {
        // Skip file ingestion if it fails
      }

      // Mark as completed
      await prisma.ingestedRepository.update({
        where: { id: ingestedRepo.id },
        data: {
          status: 'COMPLETED',
          commitCount,
          fileCount,
        },
      });

      await auditService.recordEvent({
        eventType: 'ARTIFACT_GENERATED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_repository_ingested',
        resource: 'repository',
        missionId: undefined,
        metadata: { 
          repository: `${this.config.owner}/${repoName}`,
          commits: commitCount,
          files: fileCount,
        },
      });

      return { success: true };
    } catch (error) {
      await auditService.recordEvent({
        eventType: 'ERROR_OCCURRED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_ingest_failed',
        resource: 'repository',
        metadata: { repository: repoName, error: String(error) },
      });

      return { success: false, error: String(error) };
    }
  }

  /**
   * Create a branch
   */
  async createBranch(repo: string, branch: string, baseBranch: string = 'main'): Promise<{ success: boolean; error?: string }> {
    if (!this.octokit || !this.config) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      // Get base branch ref
      const { data: baseRef } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo,
        ref: `heads/${baseBranch}`,
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseRef.object.sha,
      });

      await auditService.recordEvent({
        eventType: 'TOOL_EXECUTED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_create_branch',
        resource: 'branch',
        metadata: { repository: `${this.config.owner}/${repo}`, branch, baseBranch },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Create a commit
   */
  async createCommit(
    repo: string,
    branch: string,
    message: string,
    files: Array<{ path: string; content: string }>
  ): Promise<{ success: boolean; sha?: string; error?: string }> {
    if (!this.octokit || !this.config) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      // Get latest commit on branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo,
        ref: `heads/${branch}`,
      });

      const latestCommitSha = ref.object.sha;

      // Create blobs for each file
      const treeItems = [] as Array<{ path: string; mode: '100644' | '100755' | '040000' | '160000' | '120000'; type: 'blob' | 'tree' | 'commit'; sha: string }>;
      for (const file of files) {
        const { data: blob } = await this.octokit.git.createBlob({
          owner: this.config.owner,
          repo,
          content: file.content,
          encoding: 'utf-8',
        });

        treeItems.push({
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        });
      }

      // Create tree
      const { data: tree } = await this.octokit.git.createTree({
        owner: this.config.owner,
        repo,
        base_tree: latestCommitSha,
        tree: treeItems,
      });

      // Create commit
      const { data: commit } = await this.octokit.git.createCommit({
        owner: this.config.owner,
        repo,
        message,
        tree: tree.sha,
        parents: [latestCommitSha],
      });

      // Update ref
      await this.octokit.git.updateRef({
        owner: this.config.owner,
        repo,
        ref: `heads/${branch}`,
        sha: commit.sha,
      });

      await auditService.recordEvent({
        eventType: 'TOOL_EXECUTED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_create_commit',
        resource: 'commit',
        metadata: { repository: `${this.config.owner}/${repo}`, branch, sha: commit.sha },
      });

      return { success: true, sha: commit.sha };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string = 'main'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.octokit || !this.config) {
      return { success: false, error: 'GitHub not configured' };
    }

    try {
      const { data: pr } = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo,
        title,
        body,
        head,
        base,
      });

      await auditService.recordEvent({
        eventType: 'TOOL_EXECUTED',
        actor: 'system',
        actorType: 'SYSTEM',
        action: 'github_create_pull_request',
        resource: 'pull_request',
        metadata: { 
          repository: `${this.config.owner}/${repo}`,
          prNumber: pr.number,
          url: pr.html_url,
        },
      });

      return { success: true, url: pr.html_url };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

export const githubService = new GitHubService();
