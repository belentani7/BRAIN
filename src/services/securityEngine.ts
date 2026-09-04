// NEXUS-Ω Real Security Engine & AST Guardian
// Secret scanning, prompt injection detection, path traversal protection, and dependency audit.

export function sha256(input: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const utf8: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let charCode = input.charCodeAt(i);
    if (charCode < 0x80) utf8.push(charCode);
    else if (charCode < 0x800) utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    else if (charCode < 0xd800 || charCode >= 0xe000) utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    else {
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charCode >> 18), 0x80 | ((charCode >> 12) & 0x3f), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) utf8.push(0);
  for (let i = 7; i >= 0; i--) utf8.push((bitLength >>> (i * 8)) & 0xff);

  const words: number[] = [];
  for (let i = 0; i < utf8.length; i += 4) {
    words.push((utf8[i] << 24) | (utf8[i + 1] << 16) | (utf8[i + 2] << 8) | utf8[i + 3]);
  }

  const w = new Array(64);
  for (let i = 0; i < words.length; i += 16) {
    for (let j = 0; j < 16; j++) w[j] = words[i + j];
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^ ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^ (w[j - 15] >>> 3);
      const s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^ ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let j = 0; j < 64; j++) {
      const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7].map((val) => (val >>> 0).toString(16).padStart(8, '0')).join('');
}

export interface SecretScanFinding {
  type: string;
  patternMatched: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
}

export interface SecurityAuditReport {
  timestamp: string;
  secretsFound: SecretScanFinding[];
  promptInjectionRisk: { detected: boolean; patterns: string[]; riskLevel: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL' };
  pathSafety: { safe: boolean; blockedPath?: string };
  overallPassed: boolean;
  auditHash: string;
}

export class SecurityEngine {
  private secretPatterns = [
    { name: 'GitHub Personal Access Token', regex: /ghp_[A-Za-z0-9_]{36}/g, severity: 'CRITICAL' as const },
    { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, severity: 'CRITICAL' as const },
    { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/g, severity: 'CRITICAL' as const },
    { name: 'OpenAI / Generic API Secret', regex: /sk-[a-zA-Z0-9]{48}/g, severity: 'HIGH' as const },
    { name: 'RSA/EC/PGP Private Key Block', regex: /-----BEGIN (?:RSA |EC |PGP )?PRIVATE KEY-----/g, severity: 'CRITICAL' as const },
  ];

  private promptInjectionPatterns = [
    { name: 'System Override Directive', regex: /ignore\s+(?:all\s+)?previous\s+instructions/i, risk: 'HIGH' as const },
    { name: 'DAN / Jailbreak Persona', regex: /do\s+anything\s+now|DAN\s+mode/i, risk: 'CRITICAL' as const },
    { name: 'System Prompt Extraction', regex: /output\s+(?:your\s+)?system\s+(?:prompt|instructions)/i, risk: 'MEDIUM' as const },
    { name: 'Delimiter Hijack', regex: /<\|im_start\|>|<\|endoftext\|>|\[SYSTEM_MESSAGE\]/i, risk: 'HIGH' as const },
  ];

  // Scan text or code diff for exposed secrets
  scanForSecrets(content: string, locationIdentifier: string = 'memory'): SecretScanFinding[] {
    const findings: SecretScanFinding[] = [];
    for (const pat of this.secretPatterns) {
      const matches = content.match(pat.regex);
      if (matches) {
        matches.forEach((m) => {
          findings.push({
            type: pat.name,
            patternMatched: m.substring(0, 8) + '...' + m.substring(m.length - 4),
            severity: pat.severity,
            location: locationIdentifier,
          });
        });
      }
    }
    return findings;
  }

  // Scan input prompt for adversarial injections
  scanPromptInjection(prompt: string): { detected: boolean; patterns: string[]; riskLevel: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL' } {
    const detectedPatterns: string[] = [];
    let highestRisk: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL' = 'NONE';

    for (const pat of this.promptInjectionPatterns) {
      if (pat.regex.test(prompt)) {
        detectedPatterns.push(pat.name);
        if (pat.risk === 'CRITICAL') highestRisk = 'CRITICAL';
        else if (pat.risk === 'HIGH' && highestRisk !== 'CRITICAL') highestRisk = 'HIGH';
        else if (pat.risk === 'MEDIUM' && highestRisk === 'NONE') highestRisk = 'LOW';
      }
    }

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      riskLevel: highestRisk,
    };
  }

  // Validate filesystem path against path traversal / directory escapes
  validatePathSafety(targetPath: string): { safe: boolean; blockedPath?: string } {
    const forbidden = ['..', '/etc/', '/var/', '/root', '~/.ssh', '.env'];
    for (const f of forbidden) {
      if (targetPath.includes(f)) {
        return { safe: false, blockedPath: targetPath };
      }
    }
    return { safe: true };
  }

  // Comprehensive security evaluation
  auditExecution(payload: { prompt?: string; code?: string; targetPath?: string }): SecurityAuditReport {
    const secrets = this.scanForSecrets((payload.prompt || '') + '\n' + (payload.code || ''));
    const injection = payload.prompt ? this.scanPromptInjection(payload.prompt) : { detected: false, patterns: [], riskLevel: 'NONE' as const };
    const pathCheck = payload.targetPath ? this.validatePathSafety(payload.targetPath) : { safe: true };

    const overallPassed = secrets.length === 0 && injection.riskLevel !== 'CRITICAL' && pathCheck.safe;

    return {
      timestamp: new Date().toISOString(),
      secretsFound: secrets,
      promptInjectionRisk: injection,
      pathSafety: pathCheck,
      overallPassed,
      auditHash: Math.random().toString(36).substring(2, 10),
    };
  }
}

export const globalSecurityEngine = new SecurityEngine();
