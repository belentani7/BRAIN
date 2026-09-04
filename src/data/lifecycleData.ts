import { LifecyclePhase } from '../types';

export const LIFECYCLE_PHASES: LifecyclePhase[] = [
  {
    phase: 1,
    title: 'Fase 1: Fundación e Infraestructura Base',
    duration: 'Semanas 1 a 4',
    goal: 'Establecer la columna vertebral de persistencia (Supabase PostgreSQL + pgvector), inicializar los servidores MCP con path-jail estricto y configurar el pipeline de telemetría y auditoría WORM.',
    milestones: [
      {
        id: 'M1.1',
        title: 'Provisionamiento de Supabase & pgvector HNSW',
        deliverables: [
          'Esquema SQL público ejecutado: tablas agentes, memoria_episodica, auditoria_legal, cola_tareas_agente',
          'Índice HNSW calibrado (vector_cosine_ops, m=16, ef=64)',
          'Políticas RLS Deny-by-Default activadas'
        ],
        risk: 'Latencia en consultas de alta concurrencia; mitigado mediante pooler PgBouncer en modo transacción.',
        status: 'completed'
      },
      {
        id: 'M1.2',
        title: 'Servidor Base MCP (Filesystem & Shell Confinado)',
        deliverables: [
          'mcp-server en TypeScript bajo transporte Stdio/SSE',
          'Path-jail con validación canónica de rutas y bloqueo de symlinks',
          'Herramientas atómicas de lectura, escritura y búsqueda semántica'
        ],
        risk: 'Fuga de entorno de ejecución; mitigado con validación de prefijo de ruta absoluta inmutable.',
        status: 'completed'
      },
      {
        id: 'M1.3',
        title: 'Pipeline Inmutable de Auditoría Legal WORM',
        deliverables: [
          'Trigger PL/pgSQL que bloquea UPDATE y DELETE',
          'Función hash encadenada SHA-256 (blockchain interna)',
          'Verificación O(n) de no manipulación'
        ],
        risk: 'Cuello de botella en inserts concurrentes; resuelto mediante particionamiento declarativo mensual.',
        status: 'completed'
      },
      {
        id: 'M1.4',
        title: 'Enrutador Zero-Token (Meta-Skill Router)',
        deliverables: [
          'Clasificador semántico ultrarrápido (<12ms)',
          'Matriz de afinidad de 62 habilidades',
          '0 consumo de tokens para triaje inicial de peticiones'
        ],
        risk: 'Falso enrutamiento en prompts ambiguos; fallback con LLM ligero.',
        status: 'active'
      }
    ]
  },
  {
    phase: 2,
    title: 'Fase 2: Ingesta de Habilidades y Calibración Operativa',
    duration: 'Semanas 5 a 8',
    goal: 'Inyectar, compilar y someter a tests unitarios las 62 habilidades agénticas. Integrar el motor de chunking semántico y AST parser sobre los 470 repositorios del ecosistema.',
    milestones: [
      {
        id: 'M2.1',
        title: 'Inyección de la Taxonomía de 62 Skills',
        deliverables: [
          'Catálogo de habilidades cargado en memoria de trabajo',
          'Hooks de ejecución tipados con schemas Zod',
          'Tests unitarios de caja negra para cada skill'
        ],
        risk: 'Divergencia entre contratos de entrada y salida; mitigado con validación Zod estricta.',
        status: 'active'
      },
      {
        id: 'M2.2',
        title: 'Motor de Chunking Semántico y Grafo AST',
        deliverables: [
          'Parser Tree-Sitter multi-lenguaje (TS, Python, Go, HTML)',
          'División de código a nivel de función/clase respetando contexto sintáctico',
          'Pipeline de vectorización automática hacia memoria episódica'
        ],
        risk: 'Archivos monolíticos masivos (>10k líneas); segmentación con solapamiento controlado (15%).',
        status: 'active'
      },
      {
        id: 'M2.3',
        title: 'Integración de Pasarelas y Control de Costes',
        deliverables: [
          'Integración de Stripe Checkout / Escrow en endpoints de micro-SaaS',
          'Daemon AgentGuard para monitoreo y límite de gasto de inferencia',
          'Generador de contratos y facturas en PDF'
        ],
        risk: 'Discrepancias en webhooks de pago; verificación criptográfica de firma stripe-signature con reintentos.',
        status: 'scheduled'
      },
      {
        id: 'M2.4',
        title: 'Calibración de Autocrítica y Detección de Alucinaciones',
        deliverables: [
          'Evaluador NLI (Natural Language Inference) en tiempo real',
          'Bucle introspectivo con umbral de tolerancia de error < 0.05',
          'Generación de parches correctivos atómicos'
        ],
        risk: 'Bucles infinitos de auto-corrección; limitado a un máximo de 3 iteraciones de rectificación.',
        status: 'scheduled'
      }
    ]
  },
  {
    phase: 3,
    title: 'Fase 3: Multi-Stack Merge y Orquestación en Enjambre',
    duration: 'Semanas 9 a 14',
    goal: 'Activar el protocolo de comunicación Supervisor-Worker, sincronización masiva de 1,000 repositorios mediante webhooks y despliegue multi-cloud resiliente.',
    milestones: [
      {
        id: 'M3.1',
        title: 'Protocolo Inter-Agente Supervisor-Worker',
        deliverables: [
          'Bus de mensajería tipada con correlación de tareas y quorum',
          'Consenso estocástico con ponderación de confianza (>85%)',
          'Manejo de timeouts y conmutación por error (Circuit Breaker)'
        ],
        risk: 'Condiciones de carrera en tareas concurrentes; gestionadas con colas SKIP LOCKED en Supabase.',
        status: 'scheduled'
      },
      {
        id: 'M3.2',
        title: 'Sincronización Continua de 1,000 Repositorios',
        deliverables: [
          'Supabase Edge Function para recepción de webhooks GitHub',
          'Control de idempotencia por x-github-delivery en PostgreSQL',
          'Actualización diferencial del grafo AST en cada commit'
        ],
        risk: 'Ráfagas de commits simultáneos; mitigado con throttling y cola de prioridades.',
        status: 'scheduled'
      },
      {
        id: 'M3.3',
        title: 'Despliegue Multi-Cloud Automatizado',
        deliverables: [
          'Contenedores Docker multi-stage optimizados (<50MB)',
          'Pipelines de despliegue blue-green en Cloud Run / Vercel',
          'Rollback automático ante fallos de healthcheck de 30 segundos'
        ],
        risk: 'Cold starts en containers; escalado predictivo y precalentamiento de instancias.',
        status: 'scheduled'
      },
      {
        id: 'M3.4',
        title: 'Orquestación Omnicanal (WhatsApp / Telegram / Web)',
        deliverables: [
          'Puente de integración con WhatsApp Cloud API',
          'Bot de atención y cotizaciones en tiempo real',
          'Pipeline de síntesis de voz y transcripción de audios'
        ],
        risk: 'Límites de tasa de WhatsApp; cola con control de ráfagas token-bucket.',
        status: 'scheduled'
      }
    ]
  },
  {
    phase: 4,
    title: 'Fase 4: Hardening de Seguridad, Cumplimiento Legal y Red Teaming',
    duration: 'Semanas 15 a 20',
    goal: 'Auditoría integral de vulnerabilidades, blindaje criptográfico con mTLS, cumplimiento legal GDPR/CCPA, simulación de ataques de inyección y certificación corporativa.',
    milestones: [
      {
        id: 'M4.1',
        title: 'Red Teaming y Simulación de Inyecciones de Prompts',
        deliverables: [
          'Pruebas de estrés con 500+ vectores de ataque jailbreak',
          'Sanitización estricta de delimitadores de contexto de sistema',
          'Muro de defensa contra exfiltración de memoria de agentes'
        ],
        risk: 'Nuevos vectores de ataque zero-day; filtro heurístico en tiempo de inferencia.',
        status: 'scheduled'
      },
      {
        id: 'M4.2',
        title: 'Cifrado mTLS y Blindaje de Servidores MCP',
        deliverables: [
          'Autenticación mutua con certificados X.509 para cada herramienta MCP',
          'Cifrado de datos en reposo (AES-256) y en tránsito (TLS 1.3)',
          'Rotación automatizada de secretos cada 30 días'
        ],
        risk: 'Expiración imprevista de certificados; alertas tempranas automatizadas a 15 días.',
        status: 'scheduled'
      },
      {
        id: 'M4.3',
        title: 'Cumplimiento Legal Integral (GDPR / CCPA / EU AI Act)',
        deliverables: [
          'Pipeline de borrado en cascada para derecho al olvido con certificado digital',
          'Anonimización obligatoria de PII antes de salida a cualquier proveedor de LLM',
          'Dossier de transparencia algorítmica y categorización de riesgo de IA'
        ],
        risk: 'Sanciones regulatorias por retención involuntaria; validado con pruebas de auditoría continua.',
        status: 'scheduled'
      },
      {
        id: 'M4.4',
        title: 'Certificación Final y Conmutación a Producción',
        deliverables: [
          'Auditoría técnica externa sin hallazgos críticos',
          'Manual de operaciones y plan de contingencia ante desastres',
          'Conmutación del ecosistema a modo autónomo supervisado 24/7'
        ],
        risk: 'Fricción operativa inicial; monitoreo en guardia durante los primeros 30 días.',
        status: 'scheduled'
      }
    ]
  }
];
