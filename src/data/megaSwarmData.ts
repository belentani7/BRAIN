export interface SwarmAgent {
  id: string;
  name: string;
  divisionId: string;
  role: string;
  sourceClone: string; // e.g. 'Manus / OpenManus', 'SWE-agent', 'AutoGPT'
  clonedCapability: string;
  primaryModel: string;
  tokenCostPer1k: string;
  status: 'ACTIVE' | 'STANDBY' | 'EXECUTING';
  latencyMs: number;
  successRate: number;
  toolsCount: number;
}

export interface SwarmDivision {
  id: string;
  number: number;
  name: string;
  badge: string;
  color: string;
  commander: string;
  mission: string;
  agentCount: number;
  agents: SwarmAgent[];
  keyTools: string[];
  openSourcePillar: string;
}

export interface ClonedCapabilityItem {
  id: string;
  frameworkName: string;
  authorOrOrg: string;
  githubStars: string;
  coreCapability: string;
  clonedModule: string;
  status: 'CLONED_ACTIVE' | 'SYNCED' | 'STANDBY';
  integrationPoint: string;
  efficiencyGain: string;
}

export interface HuggingFaceFreeResource {
  id: string;
  name: string;
  type: 'Dataset Libre' | 'Modelo Abierto' | 'Embedding Space' | 'Evaluación Benchmark';
  downloads: string;
  likes: string;
  size: string;
  license: string;
  link: string;
  freeUsageStrategy: string;
  integrationUseCase: string;
}

export const SWARM_DIVISIONS: SwarmDivision[] = [
  {
    id: 'div-01',
    number: 1,
    name: 'Meta-Supervisión & Orquestación HTN',
    badge: 'DIV-01 · ORQUESTACIÓN',
    color: 'emerald',
    commander: 'NEXUS-PRIME-COGNITION',
    mission: 'Descomposición recursiva de misiones complejas en DAGs mediante Hierarchical Task Networks (HTN) y ToT.',
    agentCount: 10,
    openSourcePillar: 'LangGraph + AutoGen + CrewAI',
    keyTools: ['htn_planner', 'zero_token_router', 'tot_evaluator', 'consensus_engine'],
    agents: [
      { id: 'ag-01-01', name: 'HTN-Planner-Alpha', divisionId: 'div-01', role: 'Planificador Jerárquico', sourceClone: 'LangGraph Core', clonedCapability: 'Grafos Cíclicos con Checkpointing', primaryModel: 'Gemini 2.5 Pro / DeepSeek R1', tokenCostPer1k: '0.00€ (Free Tier)', status: 'ACTIVE', latencyMs: 240, successRate: 99.4, toolsCount: 8 },
      { id: 'ag-01-02', name: 'ZeroToken-Dispatcher', divisionId: 'div-01', role: 'Enrutador Semántico', sourceClone: 'MetaSkill Routing', clonedCapability: 'Filtrado Heurístico sin Tokens', primaryModel: 'Regex + AST Local', tokenCostPer1k: '0.00€ (Zero Cost)', status: 'ACTIVE', latencyMs: 8, successRate: 99.9, toolsCount: 14 },
      { id: 'ag-01-03', name: 'ToT-Consensus-Oracle', divisionId: 'div-01', role: 'Árbitro de Consenso', sourceClone: 'Tree-of-Thoughts', clonedCapability: 'Búsqueda en Árbol Beam-Search 3-Vías', primaryModel: 'Llama 3.3 70B (Groq)', tokenCostPer1k: '0.00€ (Groq Free)', status: 'ACTIVE', latencyMs: 310, successRate: 98.7, toolsCount: 6 },
    ],
  },
  {
    id: 'div-02',
    number: 2,
    name: 'Ingesta AST & Reverse Engineering',
    badge: 'DIV-02 · PARSER AST',
    color: 'cyan',
    commander: 'AST-CHRONOS-SYNTH',
    mission: 'Extracción del árbol sintáctico de los 470 repositorios de belentani7 y proyectos open-source en Go, TS, Python.',
    agentCount: 10,
    openSourcePillar: 'Tree-Sitter + Semgrep + Sourcegraph AST',
    keyTools: ['tree_sitter_go', 'tree_sitter_ts', 'ast_chunker', 'dependency_grapher'],
    agents: [
      { id: 'ag-02-01', name: 'Go-Daemon-Decompiler', divisionId: 'div-02', role: 'Analizador Go/Cgo', sourceClone: 'Go Tree-Sitter', clonedCapability: 'Mapeo de Funciones & Structs de agentguard', primaryModel: 'Tree-Sitter WASM', tokenCostPer1k: '0.00€ (Local CPU)', status: 'ACTIVE', latencyMs: 14, successRate: 100, toolsCount: 5 },
      { id: 'ag-02-02', name: 'TS-Strict-Extractor', divisionId: 'div-02', role: 'Inspector TypeScript', sourceClone: 'TypeScript Compiler API', clonedCapability: 'Extracción de Interfaces y Rutas API', primaryModel: 'TS AST Native', tokenCostPer1k: '0.00€ (Local CPU)', status: 'ACTIVE', latencyMs: 19, successRate: 99.8, toolsCount: 7 },
      { id: 'ag-02-03', name: 'Python-CFG-Mapper', divisionId: 'div-02', role: 'Grafo de Control de Flujo', sourceClone: 'PyAST + libcst', clonedCapability: 'Desglose de Rutas FastAPI BarriServei', primaryModel: 'Python ast Module', tokenCostPer1k: '0.00€ (Local CPU)', status: 'STANDBY', latencyMs: 22, successRate: 99.5, toolsCount: 6 },
    ],
  },
  {
    id: 'div-03',
    number: 3,
    name: 'Clonación de Frameworks Globales',
    badge: 'DIV-03 · CLONACIÓN SOTA',
    color: 'violet',
    commander: 'CLONE-ARCHITECT-OMEGA',
    mission: 'Replicar las habilidades de interacción con navegador de Manus, el sandbox de SWE-agent y el loop de Cline.',
    agentCount: 12,
    openSourcePillar: 'Manus / OpenManus + SWE-agent + Cline',
    keyTools: ['browser_use_cdp', 'terminal_pty_jail', 'diff_patch_applier', 'self_reflection_loop'],
    agents: [
      { id: 'ag-03-01', name: 'Manus-Browser-Cloner', divisionId: 'div-03', role: 'Navegación Autónoma Web', sourceClone: 'OpenManus / Browser-Use', clonedCapability: 'Inspección DOM & Click Grounding CDP', primaryModel: 'Gemini 2.5 Flash Vision', tokenCostPer1k: '0.00€ (Free Tier)', status: 'ACTIVE', latencyMs: 450, successRate: 96.8, toolsCount: 12 },
      { id: 'ag-03-02', name: 'SWE-Bench-Solver', divisionId: 'div-03', role: 'Resolución de Bugs en Repos', sourceClone: 'SWE-agent / OpenCodeInterpreter', clonedCapability: 'Edición Quirúrgica por Diff Unificado', primaryModel: 'DeepSeek R1 / Qwen 2.5 Coder', tokenCostPer1k: '0.00€ (OpenRouter/Groq)', status: 'ACTIVE', latencyMs: 520, successRate: 97.4, toolsCount: 9 },
      { id: 'ag-03-03', name: 'Cline-DevLoop-Shadow', divisionId: 'div-03', role: 'Ciclo TDD Autónomo', sourceClone: 'Cline / Roo-Code', clonedCapability: 'Ejecución de Tests y Auto-Reparación', primaryModel: 'Qwen 2.5 Coder 32B', tokenCostPer1k: '0.00€ (Cerebras Cloud)', status: 'ACTIVE', latencyMs: 210, successRate: 98.9, toolsCount: 11 },
    ],
  },
  {
    id: 'div-04',
    number: 4,
    name: 'Minería Hugging Face & Datos Libres',
    badge: 'DIV-04 · DATOS LIBRES',
    color: 'amber',
    commander: 'HUGGINGFACE-HARVESTER',
    mission: 'Extracción sin coste de 3B+ archivos de código, corpus de derecho europeo y datasets instruccionales de HF Hub.',
    agentCount: 10,
    openSourcePillar: 'The Stack v2 + FineWeb + OpenAlex',
    keyTools: ['hf_hub_streaming', 'parquet_worker', 'arxiv_scraper', 'openalex_semantic_search'],
    agents: [
      { id: 'ag-04-01', name: 'Stack-V2-Streamer', divisionId: 'div-04', role: 'Extractor de Snippets de Código', sourceClone: 'BigCode The Stack v2', clonedCapability: 'Ingesta Parquet sin Descarga Completa', primaryModel: 'DuckDB + pyarrow', tokenCostPer1k: '0.00€ (Free Stream)', status: 'ACTIVE', latencyMs: 95, successRate: 99.9, toolsCount: 5 },
      { id: 'ag-04-02', name: 'EurLex-GDPR-Extractor', divisionId: 'div-04', role: 'Jurista Regulatorio', sourceClone: 'EUR-Lex Open Data', clonedCapability: 'Verificación de Artículos RGPD / LOPDGDD', primaryModel: 'bge-m3 Embeddings', tokenCostPer1k: '0.00€ (HF Free API)', status: 'ACTIVE', latencyMs: 140, successRate: 100, toolsCount: 8 },
      { id: 'ag-04-03', name: 'ArXiv-Agentic-Crawler', divisionId: 'div-04', role: 'Científico de Papers SOTA', sourceClone: 'arXiv REST API', clonedCapability: 'Descubrimiento de Arquitecturas de Agentes', primaryModel: 'Gemini Flash 2.5', tokenCostPer1k: '0.00€ (Google Free)', status: 'ACTIVE', latencyMs: 380, successRate: 98.5, toolsCount: 6 },
    ],
  },
  {
    id: 'div-05',
    number: 5,
    name: 'Compilación & Hardening de Binarios',
    badge: 'DIV-05 · COMPILADOR',
    color: 'blue',
    commander: 'GO-BINARY-FORGE',
    mission: 'Empaquetado estático de agentguard (<20MB), transpilación TypeScript a CommonJS y optimización de binarios.',
    agentCount: 8,
    openSourcePillar: 'esbuild + Go Compiler + UPX Packer',
    keyTools: ['go_build_static', 'esbuild_bundler', 'docker_multistage', 'binary_stripper'],
    agents: [
      { id: 'ag-05-01', name: 'Go-Static-Stripper', divisionId: 'div-05', role: 'Optimizador de Binarios Go', sourceClone: 'Go Toolchain', clonedCapability: 'flags -ldflags="-s -w" para agentguard', primaryModel: 'Go 1.23 Engine', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 350, successRate: 100, toolsCount: 4 },
      { id: 'ag-05-02', name: 'Docker-Micro-Packer', divisionId: 'div-05', role: 'Constructor Scratch/Alpine', sourceClone: 'Docker BuildKit', clonedCapability: 'Contenedores seguros sin shell ni root', primaryModel: 'BuildKit Daemon', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 820, successRate: 99.2, toolsCount: 6 },
    ],
  },
  {
    id: 'div-06',
    number: 6,
    name: 'Interoperabilidad MCP & Servidores Seguros',
    badge: 'DIV-06 · PROTOCOLO MCP',
    color: 'purple',
    commander: 'MCP-GATEWAY-SENTINEL',
    mission: 'Exposición de recursos y herramientas bajo el estándar Anthropic Model Context Protocol con confinamiento estricto.',
    agentCount: 10,
    openSourcePillar: 'Model Context Protocol TypeScript SDK',
    keyTools: ['mcp_stdio_bridge', 'path_jail_validator', 'sse_event_streamer', 'tool_schema_validator'],
    agents: [
      { id: 'ag-06-01', name: 'Path-Jail-Enforcer', divisionId: 'div-06', role: 'Carcelero de FileSystem', sourceClone: 'Sandbox FS / OpenJail', clonedCapability: 'Prevenir Path Traversal (../../) en MCP', primaryModel: 'Node.js path.resolve', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 2, successRate: 100, toolsCount: 4 },
      { id: 'ag-06-02', name: 'MCP-Tool-Synthesizer', divisionId: 'div-06', role: 'Expositor Dinámico de Tools', sourceClone: 'Anthropic MCP Core', clonedCapability: 'Auto-Generación de Schemas JSON-Schema', primaryModel: 'Zod Validator', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 12, successRate: 100, toolsCount: 9 },
    ],
  },
  {
    id: 'div-07',
    number: 7,
    name: 'Memoria Episódica & RAG Supabase pgvector',
    badge: 'DIV-07 · MEMORIA VECTORIAL',
    color: 'teal',
    commander: 'PGVECTOR-RETRIEVAL-CORE',
    mission: 'Persistencia distribuida en PostgreSQL 16 con HNSW para 500 repositorios y compresión de contexto episódico.',
    agentCount: 10,
    openSourcePillar: 'pgvector + Drizzle ORM + Supabase',
    keyTools: ['hnsw_cosine_search', 'cross_encoder_rerank', 'context_compressor', 'skip_locked_queue'],
    agents: [
      { id: 'ag-07-01', name: 'HNSW-Cosine-IndexMaster', divisionId: 'div-07', role: 'Indexador Vectorial 1536d', sourceClone: 'pgvector 0.7+', clonedCapability: 'Búsqueda Semántica <15ms en 500k chunks', primaryModel: 'Postgres HNSW', tokenCostPer1k: '0.00€ (Supabase Free)', status: 'ACTIVE', latencyMs: 18, successRate: 99.9, toolsCount: 7 },
      { id: 'ag-07-02', name: 'Episodic-Memory-Compressor', divisionId: 'div-07', role: 'Reductor de Tokens en RAG', sourceClone: 'MemGPT / Letta', clonedCapability: 'Compresión Recursiva de Contextos Largos', primaryModel: 'Llama 3.3 70B', tokenCostPer1k: '0.00€ (Groq Free)', status: 'ACTIVE', latencyMs: 260, successRate: 98.6, toolsCount: 8 },
    ],
  },
  {
    id: 'div-08',
    number: 8,
    name: 'Red-Teaming, WORM & Cripto-Auditoría',
    badge: 'DIV-08 · AUDITORÍA WORM',
    color: 'rose',
    commander: 'AUDIT-BLOCKCHAIN-GUARDIAN',
    mission: 'Inmutabilidad criptográfica SHA-256 encadenada, prevención de inyecciones de prompt y auditoría legal RGPD.',
    agentCount: 10,
    openSourcePillar: 'PyRIT (Microsoft) + Garak + WORM Triggers',
    keyTools: ['sha256_hash_chain', 'prompt_injection_guard', 'jailbreak_simulator', 'worm_table_trigger'],
    agents: [
      { id: 'ag-08-01', name: 'WORM-Ledger-Anchor', divisionId: 'div-08', role: 'Firmante de Bloques Inmutables', sourceClone: 'Bitcoin Merkle Chain', clonedCapability: 'Encadenamiento Criptográfico SHA-256', primaryModel: 'Node.js crypto', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 3, successRate: 100, toolsCount: 5 },
      { id: 'ag-08-02', name: 'Prompt-Injection-Shield', divisionId: 'div-08', role: 'Defensa Adversarial', sourceClone: 'Llama Guard 3 / NeMo Guardrails', clonedCapability: 'Detección de Jailbreaks y Fugas de Prompt', primaryModel: 'Llama-Guard-3-8B', tokenCostPer1k: '0.00€ (Groq Free)', status: 'ACTIVE', latencyMs: 85, successRate: 99.4, toolsCount: 7 },
    ],
  },
  {
    id: 'div-09',
    number: 9,
    name: 'Monetización Autónoma Stripe & Escrow',
    badge: 'DIV-09 · FINANZAS B2B',
    color: 'emerald',
    commander: 'STRIPE-AUTONOMOUS-CFO',
    mission: 'Gestión desatendida de pasarela de pago, licencias para agentguard, escrow para BarriServei y facturación PDF.',
    agentCount: 8,
    openSourcePillar: 'Stripe API SDK + PDFKit + Supabase Escrow',
    keyTools: ['stripe_checkout_creator', 'webhook_verifier', 'escrow_hold_release', 'invoice_pdf_signer'],
    agents: [
      { id: 'ag-09-01', name: 'Stripe-Checkout-Daemon', divisionId: 'div-09', role: 'Gestor de Pagos Únicos/Recurrentes', sourceClone: 'Stripe Elements / Checkout', clonedCapability: 'Cobro de 0.99€ a 19.99€ y B2B 499€', primaryModel: 'Stripe SDK TypeScript', tokenCostPer1k: '0.00€ (API Native)', status: 'ACTIVE', latencyMs: 180, successRate: 99.8, toolsCount: 6 },
      { id: 'ag-09-02', name: 'Escrow-Smart-Custodian', divisionId: 'div-09', role: 'Custodia de Depósitos BarriServei', sourceClone: 'Escrow.com API / OpenEscrow', clonedCapability: 'Retención y Liberación al Finalizar Obra', primaryModel: 'Supabase Row Security', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 45, successRate: 100, toolsCount: 5 },
    ],
  },
  {
    id: 'div-10',
    number: 10,
    name: 'GTM Cero Contacto Social & Omnicanalidad',
    badge: 'DIV-10 · CERO CONTACTO',
    color: 'orange',
    commander: 'COLD-ACQUISITION-DAEMON',
    mission: 'Captación de clientes y soporte 100% automatizado vía WhatsApp, CLI distribution y correos fríos sin llamadas humanas.',
    agentCount: 12,
    openSourcePillar: 'Baileys WhatsApp + Resend API + SEO Engine',
    keyTools: ['whatsapp_baileys', 'cold_email_smtp', 'seo_local_generator', 'github_release_broadcaster'],
    agents: [
      { id: 'ag-10-01', name: 'WhatsApp-Local-Dispatcher', divisionId: 'div-10', role: 'Asistente de Gremios L’Hospitalet', sourceClone: 'Baileys / WhatsApp Multi-Device', clonedCapability: 'Presupuestos y Citas Automáticas en <3 min', primaryModel: 'Gemini 2.5 Flash', tokenCostPer1k: '0.00€ (Free Tier)', status: 'ACTIVE', latencyMs: 290, successRate: 98.9, toolsCount: 8 },
      { id: 'ag-10-02', name: 'CLI-Community-Evangelist', divisionId: 'div-10', role: 'Distribuidor en Claude Code & Cline', sourceClone: 'Homebrew / npm publish', clonedCapability: 'Publicación de skills de agentguard en repos', primaryModel: 'GitHub CLI + Node.js', tokenCostPer1k: '0.00€ (Native)', status: 'ACTIVE', latencyMs: 310, successRate: 99.1, toolsCount: 7 },
    ],
  },
  {
    id: 'div-11',
    number: 11,
    name: 'Auto-Evaluación & Benchmarking Continuo',
    badge: 'DIV-11 · BENCHMARK',
    color: 'yellow',
    commander: 'SWE-BENCH-VALIDATOR',
    mission: 'Medición matemática continua del rendimiento del código generado contra tests unitarios y estándares SOTA.',
    agentCount: 8,
    openSourcePillar: 'SWE-bench + HumanEval + pytest-xdist',
    keyTools: ['test_runner_sandbox', 'coverage_analyzer', 'pass_at_k_calculator', 'mutation_tester'],
    agents: [
      { id: 'ag-11-01', name: 'Pass@K-Metric-Evaluator', divisionId: 'div-11', role: 'Calculador de Tasa de Acierto', sourceClone: 'OpenAI HumanEval / SWE-bench', clonedCapability: 'Verificación de compilación y tests 100%', primaryModel: 'Docker Test Sandbox', tokenCostPer1k: '0.00€ (Local CPU)', status: 'ACTIVE', latencyMs: 410, successRate: 99.5, toolsCount: 5 },
    ],
  },
  {
    id: 'div-12',
    number: 12,
    name: 'Auto-Evolución & Meta-Reflexión Recursiva',
    badge: 'DIV-12 · AUTO-EVOLUCIÓN',
    color: 'red',
    commander: 'PROMETHEUS-RECURSIVE-KERNEL',
    mission: 'Re-escritura autónoma de prompts de sistema, ajuste fino de pesos y síntesis de nuevas habilidades sin intervención.',
    agentCount: 10,
    openSourcePillar: 'DSPy + TextGrad + Reflexion Engine',
    keyTools: ['dspy_teleprompter', 'prompt_optimizer', 'reflexion_memory', 'skill_synthesizer'],
    agents: [
      { id: 'ag-12-01', name: 'DSPy-Prompt-Optimizer', divisionId: 'div-12', role: 'Compilador de Prompts Óptimos', sourceClone: 'DSPy MIPROv2', clonedCapability: 'Optimización de Few-Shot sin intervención', primaryModel: 'DeepSeek R1 / Llama 3.3', tokenCostPer1k: '0.00€ (Groq Free)', status: 'ACTIVE', latencyMs: 640, successRate: 98.2, toolsCount: 9 },
      { id: 'ag-12-02', name: 'Reflexion-Episodic-Loop', divisionId: 'div-12', role: 'Corrector de Errores Pasados', sourceClone: 'Reflexion (Shinn et al.)', clonedCapability: 'Memoria de Fallos para no repetirlos nunca', primaryModel: 'Supabase Vector Memory', tokenCostPer1k: '0.00€ (Free)', status: 'ACTIVE', latencyMs: 120, successRate: 99.7, toolsCount: 6 },
    ],
  },
];

export const CLONED_CAPABILITIES: ClonedCapabilityItem[] = [
  {
    id: 'clone-01',
    frameworkName: 'OpenManus / Manus AI',
    authorOrOrg: 'mannaandpoem / Manus Community',
    githubStars: '42,000+ ⭐',
    coreCapability: 'Navegación web multi-paso con CDP, capturas automáticas e interacción DOM resiliente.',
    clonedModule: 'div-03 / Manus-Browser-Cloner',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'Navegación e inspección visual con Gemini Flash Vision.',
    efficiencyGain: '+350% en automatización de trámites online',
  },
  {
    id: 'clone-02',
    frameworkName: 'SWE-agent',
    authorOrOrg: 'princeton-nlp',
    githubStars: '16,500+ ⭐',
    coreCapability: 'Edición quirúrgica de repositorios basada en ACI (Agent-Computer Interface) con búsqueda grep/find contextual.',
    clonedModule: 'div-03 / SWE-Bench-Solver',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'AST Indexer y reparación de fallos en 470 repositorios.',
    efficiencyGain: 'Resolución de bugs de código en < 2 minutos',
  },
  {
    id: 'clone-03',
    frameworkName: 'Cline (Autonomous Dev)',
    authorOrOrg: 'cline',
    githubStars: '38,000+ ⭐',
    coreCapability: 'Bucle TDD continuo: ejecuta comando terminal, analiza salida, crea test y corrige hasta salida limpia.',
    clonedModule: 'div-03 / Cline-DevLoop-Shadow',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'Desarrollo en local de daemons Go y componentes TS.',
    efficiencyGain: 'Cero intervención manual en compilaciones y tests',
  },
  {
    id: 'clone-04',
    frameworkName: 'MetaGPT',
    authorOrOrg: 'FoundationModel',
    githubStars: '46,000+ ⭐',
    coreCapability: 'SOPs (Procedimientos Operativos Estándar) multi-rol: Arquitecto, PM, Coder, QA trabajando en cadena síncrona.',
    clonedModule: 'div-01 / HTN-Planner-Alpha',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'Desglose jerárquico de misiones de negocio.',
    efficiencyGain: 'Diseño arquitectónico completo en 30 segundos',
  },
  {
    id: 'clone-05',
    frameworkName: 'DSPy (Declarative Self-Improving)',
    authorOrOrg: 'stanfordnlp',
    githubStars: '22,000+ ⭐',
    coreCapability: 'Compilación programática de prompts y pesos basada en métricas de evaluación matemática (sin ingeniería manual).',
    clonedModule: 'div-12 / DSPy-Prompt-Optimizer',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'Auto-afinación del Meta-Prompt Prometeo-Ω.',
    efficiencyGain: '+28% precisión en llamadas a herramientas',
  },
  {
    id: 'clone-06',
    frameworkName: 'Smolagents',
    authorOrOrg: 'huggingface',
    githubStars: '14,000+ ⭐',
    coreCapability: 'Code-as-action: los agentes generan bloques de código ejecutables directos en lugar de JSON verbosos.',
    clonedModule: 'div-05 / Go-Static-Stripper',
    status: 'CLONED_ACTIVE',
    integrationPoint: 'Reducción drástica del consumo de tokens y latencia.',
    efficiencyGain: '-60% consumo de tokens en tareas operativas',
  },
];

export const HUGGINGFACE_FREE_RESOURCES: HuggingFaceFreeResource[] = [
  {
    id: 'hf-01',
    name: 'BigCode / The Stack v2',
    type: 'Dataset Libre',
    downloads: '1.2M+ descargas',
    likes: '2,400+ ❤️',
    size: '67.5 TB (Streamable vía Parquet)',
    license: 'Permisiva / OpenRAIL-M',
    link: 'https://huggingface.co/datasets/bigcode/the-stack-v2',
    freeUsageStrategy: 'Streaming de fragmentos vía huggingface_hub Python SDK sin descargar todo el disco.',
    integrationUseCase: 'Minería de patrones de daemons en Go y servidores MCP para clonar arquitecturas en segundos.',
  },
  {
    id: 'hf-02',
    name: 'HuggingFaceFW / FineWeb',
    type: 'Dataset Libre',
    downloads: '850k+ descargas',
    likes: '1,850+ ❤️',
    size: '15 Trillones de Tokens',
    license: 'Open Data Commons (ODC-By)',
    link: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb',
    freeUsageStrategy: 'Acceso a subconjuntos filtrados (FineWeb-Edu) con calidad curricular de razonamiento sintético.',
    integrationUseCase: 'Alimentación de memoria de contexto para la redacción de contratos, auditoría legal y RGPD.',
  },
  {
    id: 'hf-03',
    name: 'Qwen/Qwen2.5-Coder-32B-Instruct-GGUF',
    type: 'Modelo Abierto',
    downloads: '640k+ descargas',
    likes: '3,100+ ❤️',
    size: 'Cuantización Q4_K_M (19 GB) / Q8 (34 GB)',
    license: 'Apache 2.0',
    link: 'https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF',
    freeUsageStrategy: 'Ejecutable con Ollama / llama.cpp en hardware local o en servidores Cloud con CPU/GPU gratis.',
    integrationUseCase: 'Sustituto gratuito de GPT-4o / Claude 3.5 Sonnet para refactorizar código de repositorios privados.',
  },
  {
    id: 'hf-04',
    name: 'HuggingFaceH4 / ultrafeedback_binarized',
    type: 'Dataset Libre',
    downloads: '420k+ descargas',
    likes: '1,100+ ❤️',
    size: '64,000 comparaciones humanas',
    license: 'MIT',
    link: 'https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized',
    freeUsageStrategy: 'Dataset para DPO (Direct Preference Optimization) abierto.',
    integrationUseCase: 'Evaluación adversarial de respuestas del agente supervisor para garantizar cero texto de relleno.',
  },
  {
    id: 'hf-05',
    name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    type: 'Modelo Abierto',
    downloads: '1.8M+ descargas',
    likes: '5,600+ ❤️',
    size: 'Cuantizaciones libres GGUF',
    license: 'MIT Permissive',
    link: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    freeUsageStrategy: 'Disponible gratis vía Groq Cloud, Cerebras y OpenRouter Free.',
    integrationUseCase: 'Motor de razonamiento profundo ToT para validación de arquitectura, criptografía y contratos.',
  },
];
