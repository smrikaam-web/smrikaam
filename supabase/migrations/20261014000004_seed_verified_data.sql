-- ==============================================================================
-- SMRIKAAM Technologies - Supabase PostgreSQL Schema Migration
-- Migration 04: Seed Verified Historical Data (Idempotent ON CONFLICT)
-- Target Supabase Project: bgvayvnpgzfmagsoanem
-- ==============================================================================

-- 1. Admin Users (1 Verified SuperAdmin)
INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('usr_admin_01', 'bitxhift@gmail.com', '$2b$10$ybcUqhxl1oUklIiR5GkEh.VZQnLx./2soHByt8LvIs7DZFiD34RmK', 'BitXhift SuperAdmin', 'superadmin', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 2. Blog Posts (4 Verified Articles)
INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
VALUES ('pos_1787826861055_2vur', 'High-Throughput Time-Series Architecture for Discrete Manufacturing', 'high-throughput-time-series-manufacturing', 'Industrial IoT', 'Engineering low-latency sensor ingestion pipelines capable of handling millions of telemetry points per minute.', '## Deterministic Sensor Ingestion

Modern shop floor machinery demands sub-50ms ingestion latency across distributed PLC networks.', NULL, '["IIoT","TimescaleDB","OPC-UA","Python"]'::jsonb, 'SMRIKAAM Core Engineering', '5 min read', 'High-Throughput Time-Series Architecture for Discrete Manufacturing', 'Engineering low-latency sensor ingestion pipelines capable of handling millions of telemetry points per minute.', 'published', '2026-08-27T10:34:21.055Z'::timestamptz, '2026-08-28T06:33:29.423Z'::timestamptz, '2026-08-27T10:34:21.055Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
VALUES ('post_01', 'Architecting Low-Latency IIoT Telemetry for High-Speed Manufacturing', 'iiot-telemetry-coimbatore', 'Industrial IoT', 'How edge telemetry pipelines capture 17M+ data points per day from Modbus/OPC-UA machine controllers with under 50ms latency.', '## The Challenge of Shop-Floor Telemetry
Modern industrial manufacturing environments require continuous, sub-second visibility into PLC and CNC machine parameters. Traditional batch ETL routines fail to provide the real-time operational feedback loops needed for zero-downtime manufacturing.

### High-Throughput Edge Ingestion Architecture
By deploying containerized Python and Rust edge runtimes directly adjacent to factory controllers, sensor data is normalized via standard OPC-UA and Modbus protocols before being streamed over lightweight MQTT brokers.

- **Sub-50ms latency** on telemetry feeds
- **Edge buffer queues** to withstand factory network drops
- **Automated OEE computation** streamed live to management dashboards

### Business Impact
Deploying edge telemetry across 500+ connected manufacturing lines reduced unplanned machine stoppages by 35% within the first 60 days of deployment.', 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?q=80&w=1200&auto=format&fit=crop', '["IIoT","OPC-UA","Telemetry","Manufacturing","MQTT"]'::jsonb, 'SMRIKAAM Engineering Team', '5 min read', 'Low-Latency IIoT Telemetry Architecture | SMRIKAAM Journal', 'Discover how SMRIKAAM builds high-speed edge telemetry pipelines capturing 17M+ sensor metrics daily.', 'published', '2026-08-20T10:00:00.000Z'::timestamptz, '2026-08-20T10:00:00.000Z'::timestamptz, '2026-08-20T10:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
VALUES ('post_02', 'Zero-Downtime Data Lakehouse Migration for Enterprise Systems', 'cloud-data-warehouse-migration', 'Data Engineering', 'Automated schema transformation and row-level validation patterns for legacy ERP database cutovers.', '## Overcoming Legacy Database Bottlenecks
Enterprise databases running on legacy Oracle and MSSQL clusters frequently suffer from high maintenance overhead, rigid schemas, and performance bottlenecks on analytical queries.

### Automated Schema Mapping with MigrateMax
Using automated AST parsing and Spark-based parallel Change Data Capture (CDC), database schemas are automatically translated into modern cloud-native lakehouse formats (Delta / Iceberg) with automated row-hash reconciliation.

1. **Schema DDL Translation**: Automated dialect mapping
2. **Parallel CDC Replication**: Continuous sync with zero source locking
3. **Data Quality Asserts**: 100% row-level reconciliation audit

### Results
Achieved 60% faster database migration cutover with zero downtime and complete data fidelity across 50M+ transactional records.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop', '["Data Lakehouse","Cloud Migration","Snowflake","CDC","Spark"]'::jsonb, 'SMRIKAAM Cloud Architecture Lab', '5 min read', 'Zero-Downtime Data Lakehouse Migration | SMRIKAAM', 'Automated schema transformation and row-level validation for enterprise cloud database cutovers.', 'published', '2026-08-22T14:30:00.000Z'::timestamptz, '2026-08-22T14:30:00.000Z'::timestamptz, '2026-08-22T14:30:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, title, slug, category, excerpt, content, cover_image_url, tags, author, read_time, meta_title, meta_description, status, created_at, updated_at, published_at)
VALUES ('post_03', 'Deploying Deterministic LLM Agents in Regulated Enterprise Environments', 'generative-ai-agentic-automation', 'Generative AI', 'Building context-aware Retrieval-Augmented Generation (RAG) pipelines with strict data governance and DPDP compliance.', '## Generative AI with Enterprise Governance
Deploying Large Language Models in production enterprise environments demands strict determinism, context grounding, and strict role-based access control (RBAC).

### Grounded Agentic RAG Architecture
Our agentic framework combines hybrid semantic vector search with deterministic validation gates to eliminate hallucinations and enforce zero data leakage.

- **Hybrid BM25 + Dense Embeddings** for precision retrieval
- **Zero Data Leakage Guardrails** adhering to DPDP compliance
- **Action Execution Validation** with full audit logging

### Production Deployment
Empowered internal compliance and operations teams to automate 80% of document review and policy lookup tasks with sub-second response times.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1200&auto=format&fit=crop', '["Generative AI","Agentic AI","RAG","Data Governance","LLM"]'::jsonb, 'SMRIKAAM AI Research Group', '5 min read', 'Deploying Deterministic LLM Agents | SMRIKAAM Journal', 'Context-aware RAG pipelines and intelligent agentic automation for regulated enterprise environments.', 'published', '2026-08-25T09:15:00.000Z'::timestamptz, '2026-08-25T09:15:00.000Z'::timestamptz, '2026-08-25T09:15:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 3. Services (10 Verified Offerings)
INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_01', 'Artificial Intelligence & Machine Learning', 'ai-ml', '01', 'Production-ready predictive intelligence, computer vision, forecasting, recommendation systems, and MLOps.', 'We engineer production-ready AI and machine learning solutions for predictive intelligence, intelligent decision support, computer vision, forecasting, recommendation systems, and enterprise AI applications.', 'We engineer production-ready AI and machine learning solutions for predictive intelligence, intelligent decision support, computer vision, forecasting, recommendation systems, and enterprise AI applications.', '["Operational Unpredictability: Unpredictable operational downtime and equipment failure caused by the lack of predictive anomaly detection and intelligent monitoring.","Manual Quality Bottlenecks: Manual visual inspection errors, inconsistent quality decisions, and slow throughput across high-speed production environments.","Forecast Inaccuracy: Limited demand and inventory intelligence causing stockouts, excess inventory, and unnecessary working-capital exposure.","Production ML Fragmentation: Machine-learning experiments remaining isolated in notebooks without production-grade MLOps, governance, monitoring, and continuous deployment."]'::jsonb, '["Predictive Intelligence Models","Computer Vision \u0026 Defect Detection","Demand \u0026 Inventory Forecasting","Recommendation \u0026 Decision Engines","Real-Time AI Inference","Production MLOps \u0026 Model Monitoring"]'::jsonb, '["Python","PyTorch","scikit-learn","MLflow","Azure Machine Learning","Databricks","Vector Databases","MLOps Pipelines"]'::jsonb, '["Manufacturing","BFSI","Retail \u0026 E-Commerce","Healthcare"]'::jsonb, 'Enterprises struggle to operationalize experimental machine learning models into reliable, low-latency production pipelines.', 'Deploy production-grade MLOps pipelines with sub-50ms inference, automated drift tracking, and continuous retraining.', '10x faster model deployment with sub-50ms inference, automated model monitoring, and production-grade MLOps governance.', 'ParseMaster + BitXhift', 'Smart Factory Manufacturing Transformation', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1200&auto=format&fit=crop', 'published', 1, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_02', 'Industrial IoT (IIoT)', 'industrial-iot-iiot', '02', 'Multi-protocol machine connectivity, OEE dashboards, downtime alerts, and predictive maintenance.', 'Multi-protocol machine connectivity, OEE dashboards, downtime alerts, and predictive maintenance â€” powered by BitXhift.', 'We deliver end-to-end Industrial IoT (IIoT) architectures connecting shop-floor machinery, legacy CNCs, PLCs, and SCADA networks to modern edge compute and real-time cloud analytics â€” powered by BitXhift.', '["Unplanned Machine Breakdowns: Costly factory line stoppages caused by undetected mechanical wear and thermal anomalies.","Paper-Based Shift Logs: Lack of real-time visibility into machine availability, performance, and scrap rates.","Inaccurate OEE Calculation: Misleading Overall Equipment Effectiveness metrics derived from manual operator tally sheets.","Heterogeneous Protocol Silos: Incompatible Modbus, OPC-UA, Profinet, and proprietary fieldbus communication protocols."]'::jsonb, '["Multi-Protocol Edge Ingestion","Real-Time OEE \u0026 Downtime Tracking","Vibration \u0026 Thermal Anomaly Detection","Live Factory Floor Wallboards","Modbus/OPC-UA/MQTT Telemetry","Edge Machine Connectivity"]'::jsonb, '["MQTT","OPC UA","Modbus TCP","Edge computing","Azure IoT","AWS IoT","TimescaleDB","Docker","Python"]'::jsonb, '["Automotive","Machinery \u0026 Equipment","Energy \u0026 Utilities","Heavy Manufacturing"]'::jsonb, 'Unplanned machine failures cost industrial operators millions annually due to lack of predictive vibration and telemetry intelligence.', 'Deploy BitXhift multi-protocol edge gateways streaming machine telemetry to real-time OEE dashboards.', '35% downtime reduction within 60 days of telemetry activation with 100% automated OEE tracking.', 'BitXhift', 'Smart Factory Manufacturing Transformation', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', 'published', 2, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_03', 'DevOps & Cloud Infrastructure', 'devops-cloud', '03', 'Resilient multi-cloud infrastructure, automated CI/CD pipelines, and FinOps cloud cost optimization.', 'We architect resilient, secure, and cost-optimized multi-cloud infrastructure and automated CI/CD deployment pipelines on AWS, Azure, and GCP â€” accelerated by MigrateMax.', 'We architect resilient, secure, and cost-optimized multi-cloud infrastructure and automated CI/CD deployment pipelines on AWS, Azure, and GCP â€” accelerated by MigrateMax.', '["Cloud Over-Provisioning: Uncontrolled monthly cloud bills caused by unoptimized compute sizing and idle infrastructure.","Manual Deployment Risks: Human error during production releases resulting in unexpected downtime and rollback friction.","Security \u0026 Compliance Drift: Inconsistent IAM policies, unencrypted data stores, and non-compliant cloud configurations.","Slow Release Velocity: Monolithic deployment pipelines stalling release cadence and feature delivery."]'::jsonb, '["Infrastructure as Code (IaC)","Kubernetes Container Orchestration","Automated Zero-Downtime CI/CD","Multi-Cloud Security \u0026 Compliance","Cloud Cost Optimization (FinOps)","Site Reliability Engineering (SRE)"]'::jsonb, '["Terraform","Kubernetes","Docker","AWS","Azure","GCP","GitHub Actions","Prometheus","ArgoCD"]'::jsonb, '["Software \u0026 SaaS","BFSI","Healthcare","E-Commerce"]'::jsonb, 'Legacy deployment workflows and fragmented cloud resources cause frequent outages and inflated cloud spending.', 'Implement automated IaC pipelines, GitOps continuous delivery, and FinOps resource rightsizing.', '99.99% system availability with 70% faster release cycles and 30% cloud infrastructure cost reduction.', 'MigrateMax', 'Multi-Cloud Migration & FinOps Optimization', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop', 'published', 3, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_04', 'Enterprise Data Engineering', 'data-engineering', '04', 'High-throughput data lakes, real-time streaming pipelines, and modern data stack analytics.', 'We build high-throughput data lakes, real-time streaming pipelines, automated ETL/ELT workflows, and modern data stack architectures for enterprise analytics.', 'We build high-throughput data lakes, real-time streaming pipelines, automated ETL/ELT workflows, and modern data stack architectures for enterprise analytics.', '["Data Silos \u0026 Fragmentation: Disparate database systems delaying cross-functional reporting and business intelligence.","High Pipeline Latency: Batch-only data integration causing outdated analytical reports and stale metrics.","Poor Data Quality: Inconsistent schemas and missing validation leading to unreliable business reporting.","Scalability Bottlenecks: Legacy data warehouses crashing under high query volume and large analytical workloads."]'::jsonb, '["High-Throughput Data Lakes","Real-Time Stream Processing","Automated ETL/ELT Pipelines","Modern Data Warehouse Architecture","Data Modeling \u0026 Schema Optimization","Automated Data Pipeline Monitoring"]'::jsonb, '["Apache Spark","Snowflake","BigQuery","dbt","Airflow","Kafka","PostgreSQL","Python"]'::jsonb, '["Retail \u0026 E-Commerce","BFSI","Logistics","Manufacturing"]'::jsonb, 'Stale batch data pipelines prevent real-time business decision-making and operational responsiveness.', 'Deploy real-time streaming data lakes with automated quality checks and sub-second query performance.', '10x faster query performance with zero data loss and real-time analytical pipeline latency under 5 seconds.', 'BitXhift + LinkGenX', 'Real-Time Data Pipeline Acceleration', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop', 'published', 4, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_05', 'Generative AI & LLM Systems', 'generative-ai', '05', 'Context-aware RAG pipelines, fine-tuned domain models, and autonomous enterprise AI agents.', 'We build enterprise-grade Generative AI applications, Retrieval-Augmented Generation (RAG) pipelines, fine-tuned domain models, and autonomous AI agents.', 'We build enterprise-grade Generative AI applications, Retrieval-Augmented Generation (RAG) pipelines, fine-tuned domain models, and autonomous AI agents.', '["Hallucination \u0026 Accuracy Risks: Generative AI outputs failing strict enterprise accuracy and reliability requirements.","Unstructured Data Ingestion: Inability to search and query complex technical documents, PDFs, and internal knowledge bases.","Data Privacy \u0026 Compliance: Risks of exposing sensitive corporate data to public LLM provider endpoints.","High API \u0026 Token Costs: Inefficient prompt engineering and unoptimized model selection increasing operational costs."]'::jsonb, '["Enterprise RAG Architectures","Autonomous AI Agent Systems","Domain-Specific LLM Fine-Tuning","Vector Database Integration","Prompt Engineering \u0026 Guardrails","Private Enterprise AI Deployment"]'::jsonb, '["LangChain","LlamaIndex","Pinecone","Qdrant","Python","OpenAI API","Anthropic Claude","vLLM"]'::jsonb, '["Legal \u0026 Compliance","Healthcare","BFSI","Customer Support"]'::jsonb, 'Organizations struggle to leverage LLMs securely over private unstructured document repositories without hallucination risks.', 'Architect private, context-aware RAG pipelines with deterministic guardrails and vector search.', '80% reduction in manual research effort with sub-second context retrieval and 100% data privacy compliance.', 'ParseMaster', 'Autonomous Agentic AI Automation', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', 'published', 5, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_06', 'Data Governance & Compliance', 'data-governance', '06', 'Automated data catalogs, end-to-end lineage tracking, PII masking, and regulatory compliance.', 'We implement enterprise data governance frameworks, automated metadata catalogs, data lineage tracking, and strict regulatory compliance solutions.', 'We implement enterprise data governance frameworks, automated metadata catalogs, data lineage tracking, and strict regulatory compliance solutions.', '["Regulatory Penalty Vulnerability: Inability to audit sensitive PII data access across multi-cloud environments.","Lack of Lineage Transparency: Unclear data origin and transformations impairing trust in financial and operational reports.","Uncoordinated Access Control: Over-permissioned user accounts increasing security risk and data breach exposure.","Inconsistent Data Definitions: Differing KPI metrics across departments causing conflicting business reporting."]'::jsonb, '["Automated Data Cataloging","End-to-End Lineage Tracking","Role-Based Access Control (RBAC)","PII Anonymization \u0026 Masking","Regulatory Compliance (GDPR/HIPAA)","Data Quality Auditing"]'::jsonb, '["Collibra","Apache Atlas","DataHub","Snowflake Governance","BigQuery Dataplex","Python"]'::jsonb, '["BFSI","Healthcare","Telecom","Government"]'::jsonb, 'Unclear data lineage and unmonitored PII exposure lead to severe regulatory fines and audit failures.', 'Deploy automated metadata discovery, granular RBAC policies, and real-time lineage visualization.', '100% compliance audit readiness with zero unauthorized access incidents and automated data lineage tracking.', 'ParseMaster', 'Enterprise Data Governance Transformation', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop', 'published', 6, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_07', 'Enterprise Integration & API Engineering', 'integration', '07', 'Event-driven API gateways, legacy modernization, and high-performance microservices routing.', 'We build scalable event-driven API gateways, microservices integration layers, and enterprise service bus architectures connecting legacy and modern systems â€” powered by LinkGenX.', 'We build scalable event-driven API gateways, microservices integration layers, and enterprise service bus architectures connecting legacy and modern systems â€” powered by LinkGenX.', '["Legacy System Isolation: Mainframe and legacy ERP systems unable to connect with modern cloud microservices.","API Bottlenecks \u0026 Outages: High-traffic periods crashing unthrottled API endpoints and internal services.","Complex Point-to-Point Glue: Spaghetti integrations increasing maintenance overhead and failure points.","Security Vulnerabilities: Unsecured API endpoints exposing internal business logic and databases."]'::jsonb, '["API Gateway Architecture","Event-Driven Microservices","Legacy System Modernization","OAuth2 \u0026 JWT API Security","GraphQL \u0026 RESTful API Design","Sub-Second Message Routing"]'::jsonb, '["Kong","Apigee","Kafka","RabbitMQ","Node.js","Go","Docker","Kubernetes"]'::jsonb, '["BFSI","Retail","Logistics","Healthcare"]'::jsonb, 'Monolithic, point-to-point integrations create brittle systems that fail during peak transaction volumes.', 'Engineer event-driven microservices around high-availability API gateways with automated rate limiting.', '99.999% uptime for API transactions with sub-10ms routing latency and zero system downtime.', 'LinkGenX', 'Event-Driven Microservices Integration', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop', 'published', 7, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_08', 'ServiceNow & IT Workflow Automation', 'servicenow', '08', 'ServiceNow ITSM/ITOM implementation, custom App Engine workflows, and automated incident response.', 'We implement, customize, and automate enterprise ITSM, ITOM, and custom workflow applications on the ServiceNow platform.', 'We implement, customize, and automate enterprise ITSM, ITOM, and custom workflow applications on the ServiceNow platform.', '["Slow Incident Resolution: Manual ticket assignment and triage causing high Mean Time to Resolution (MTTR).","Disjointed Asset Tracking: Inaccurate CMDB data leading to software license compliance penalties and audit issues.","High Service Desk Volume: Repeated manual request handling burdening IT support teams.","Lack of Workflow Visibility: Opaque approval cycles causing project delays and operational friction."]'::jsonb, '["ServiceNow ITSM \u0026 ITOM Implementation","Custom App Engine Workflows","CMDB \u0026 Service Graph Mapping","Automated Incident \u0026 Change Management","Service Portal Customization","REST/SOAP Integration Hub"]'::jsonb, '["ServiceNow Platform","JavaScript","Flow Designer","IntegrationHub","REST API","Service Portal"]'::jsonb, '["IT Services","BFSI","Healthcare","Telecom"]'::jsonb, 'Manual IT support processes delay incident response times and reduce enterprise workforce productivity.', 'Deploy automated ServiceNow ITSM/ITOM workflows with AI-driven ticket routing and self-service portals.', '60% reduction in incident resolution time (MTTR) with 45% automated self-service ticket resolution.', 'LinkGenX', 'ServiceNow IT Workflow Automation', 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop', 'published', 8, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_09', 'Enterprise Technology Advisory', 'advisory', '09', 'Strategic enterprise architecture, multi-year cloud roadmaps, and digital transformation consulting.', 'We provide strategic technology consulting, enterprise architecture blueprints, cloud roadmap design, and digital transformation guidance.', 'We provide strategic technology consulting, enterprise architecture blueprints, cloud roadmap design, and digital transformation guidance.', '["Misaligned Tech Roadmaps: Technology investments failing to produce tangible business ROI or competitive advantage.","High Technical Debt: Accumulation of legacy software architectures blocking new feature development.","Cloud Vendor Lock-In: Inflexible Cloud strategies increasing long-term operational costs.","Skill \u0026 Talent Gaps: Lack of in-house expertise in modern AI, Cloud, and Data architectures."]'::jsonb, '["Enterprise Architecture Blueprints","Cloud Strategy \u0026 Migration Roadmaps","Technical Debt Audit \u0026 Refactoring","Vendor Selection \u0026 Evaluation","AI Readiness Assessment","CTO \u0026 Executive Advisory"]'::jsonb, '["TOGAF","AWS Architecture","Azure Architecture","GCP Architecture","FinOps","Cybersecurity"]'::jsonb, '["Cross-Industry","BFSI","Manufacturing","Healthcare"]'::jsonb, 'Unplanned technology investments without architectural blueprints lead to technical debt and missed ROI.', 'Deliver actionable 3-year technology blueprints aligned directly with enterprise business growth goals.', 'Clear 3-year digital transformation roadmap delivering 40% efficiency gains and zero technical debt accumulation.', 'MigrateMax + BitXhift', 'Enterprise Technology Advisory Roadmap', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop', 'published', 9, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, num, tagline, summary, description, business_problems, capabilities, technology, industry_applications, problem_statement, solution_statement, outcomes, accelerator, case_study, cover_image_url, status, display_order, created_at, updated_at, published_at)
VALUES ('srv_10', 'Intelligent AI Workflow Automation', 'ai-workflow', '10', 'Intelligent document processing (IDP), RPA, and automated AI decision workflow engines.', 'We automate complex multi-step enterprise workflows using intelligent document processing, Robotic Process Automation (RPA), and AI decision agents.', 'We automate complex multi-step enterprise workflows using intelligent document processing, Robotic Process Automation (RPA), and AI decision agents.', '["Manual Document Processing: High error rates and slow turnaround times in processing invoices, contracts, and claims.","Repetitive Data Entry: Human resources trapped in mundane data extraction across disparate legacy applications.","Workflow Bottlenecks: Delayed approval chains stalling order fulfillment and customer onboarding.","Lack of Process Analytics: Inability to measure process bottlenecks and operational throughput in real time."]'::jsonb, '["Intelligent Document Processing (IDP)","AI Agentic Workflow Automation","RPA \u0026 Legacy Automation","OCR \u0026 Structural Data Extraction","Process Mining \u0026 Analytics","Human-in-the-Loop Validation"]'::jsonb, '["ParseMaster","UiPath","Python","Tesseract OCR","OpenAI API","Node.js","Docker"]'::jsonb, '["Insurance","Logistics","BFSI","Supply Chain"]'::jsonb, 'Manual document extraction and repetitive data entry slow down operations and increase error rates.', 'Deploy ParseMaster intelligent document extraction agents and automated RPA workflow engines.', '85% faster document processing times with 99.5% extraction accuracy and $1.2M annual operational savings.', 'ParseMaster', 'Intelligent Document & Workflow Automation', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop', 'draft', 10, NOW(), '2026-09-03T09:22:42.494Z'::timestamptz, NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Accelerators (4 Verified Canonical Products: BitXhift, MigrateMax, ParseMaster, LinkGenX)
INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
VALUES ('acc_01', 'BitXhift', 'bitxhift', 'Industrial IoT', 'Industrial IoT & Edge Intelligence Accelerator', 'Industrial IoT & Edge Intelligence Accelerator for real-time factory telemetry.', 'BitXhift is an edge-to-cloud IIoT telemetry framework that ingests high-frequency machine signals from Modbus and OPC-UA controllers, computes live OEE metrics, and streams predictive alerts directly to enterprise dashboards.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop', 'Factory floor machines, CNC units, and PLC controllers store data in isolated OPC-UA, Modbus, or serial protocol silos, leaving floor managers without real-time OEE visibility.', 'An edge-to-cloud IIoT telemetry framework that ingests high-frequency machine signals, computes live OEE, and streams predictive alerts directly to enterprise dashboards.', 'Edge agents connect to PLCs via Modbus/OPC-UA â†’ Parse & normalize signals â†’ Stream via MQTT to TimescaleDB â†’ Render live OEE dashboards & push alerts to SAP.', 'Distributed Edge Containers + TimescaleDB + MQTT Event Bus + React Real-Time Floor Wallboard.', '["Real-Time OEE Calculation","Vibration Anomaly Detection","Energy Load Optimization","Automated Shift Reporting"]'::jsonb, '["MQTT","OPC-UA","Node-RED","TimescaleDB","Docker Edge","React"]'::jsonb, '["CNC Floor Telemetry","Energy Consumption Monitoring","Predictive Spindle Maintenance"]'::jsonb, '35% reduction in unplanned downtime and live OEE tracking across 500+ connected machines within 48 hours.', NULL, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-28T07:32:01.220Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
VALUES ('acc_02', 'MigrateMax', 'migratemax', 'Cloud & Database Migration', 'Cloud & Data Warehouse Migration Accelerator', 'Automated schema mapping and zero-downtime database migration framework.', 'MigrateMax automates schema translation, parallel change data capture (CDC), and continuous data reconciliation for seamless transitions from legacy databases to modern cloud warehouses.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop', 'Legacy database migrations (Oracle, MSSQL, Teradata) to cloud data warehouses suffer from high downtime risk, complex schema translation errors, and data discrepancy issues.', 'An automated schema mapping, data validation, and zero-downtime cutover framework that automates translation and continuously validates row-level data consistency.', 'Automated DDL Schema Translation â†’ Parallel Change Data Capture (CDC) Sync â†’ Automated Row Hash Verification â†’ Zero-Downtime DNS Cutover.', 'Python Schema Parser + Spark Parallel CDC Extractor + Snowflake / Redshift Target Loader + Automated Diff Auditor.', '["Automated DDL \u0026 Stored Proc Conversion","Zero-Downtime CDC Stream","Automated Reconciliation Audit","Rollback Safety Net"]'::jsonb, '["Oracle","MSSQL","Snowflake","Redshift","Databricks","AWS / GCP"]'::jsonb, '["Oracle to Snowflake Cutover","On-Prem to AWS Cloud Warehouse","Legacy Teradata Migration"]'::jsonb, '60% faster database migration cutover with 100% data fidelity and zero business disruption.', NULL, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-28T07:32:01.221Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
VALUES ('acc_03', 'ParseMaster', 'parsemaster', 'Data Transformation', 'Enterprise Data Transformation Engine', 'High-throughput streaming parsing engine for complex unstructured feeds.', 'ParseMaster converts high-volume unstructured feeds (EDI 850/856, XML invoices, multi-nested JSON, sensor logs) into clean tabular schemas with automated schema drift handling.', 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop', 'High-volume unstructured feeds (EDI 850/856, XML invoices, multi-nested JSON, sensor logs) overload traditional ETL tools and cause frequent pipeline breakages.', 'A high-throughput streaming parsing engine that dynamically converts complex unstructured payload formats into clean tabular schemas for warehouse loading.', 'Schema Inference & Payload Detection â†’ Multi-Threaded Streaming Parser â†’ Schema Drift auto-fix â†’ Direct Parquet/Iceberg Warehouse Writes.', 'Rust Core Parser + Apache Spark Streaming + dbt Transformation Layers + Delta / Iceberg Storage.', '["Multi-Format Ingestion (EDI, XML, JSON)","Dynamic Schema Drift Handling","Sub-Second Payload Parsing","Built-in Data Quality Asserts"]'::jsonb, '["Rust","Apache Spark","Parquet","dbt","Snowflake","BigQuery"]'::jsonb, '["EDI B2B Supply Chain Feeds","Financial XML Clearing","Multi-Sensor JSON Normalization"]'::jsonb, '80% reduction in pipeline breakage incidents and 5x faster payload transformation rates.', NULL, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-28T07:32:01.221Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accelerators (id, name, slug, category, tagline, short_description, full_description, cover_image_url, problem, solution, how_it_works, architecture, key_features, technology, use_cases, business_outcomes, pdf_url, status, created_at, updated_at, published_at)
VALUES ('acc_04', 'LinkGenX', 'linkgenx', 'Integration & Mesh', 'SAP / ERP & Cloud Integration Framework', 'Event-driven enterprise integration mesh with prebuilt SAP connectors.', 'LinkGenX connects SAP S/4HANA, Salesforce, ServiceNow, and custom cloud apps via an event-driven mesh with automated API contract testing and dead-letter retry queues.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop', 'Building point-to-point integrations between SAP S/4HANA, Salesforce, ServiceNow, and custom cloud apps creates fragile brittle spaghetti code.', 'An event-driven integration mesh with prebuilt enterprise SAP connectors, automated API contract testing, and reliable message retry routing.', 'Event Producer (SAP IDoc / RFC) â†’ LinkGenX Event Mesh Router â†’ Schema Contract Validation â†’ Target Consumer Delivery with Retry Queue.', 'Event-Driven Microservices Mesh + RabbitMQ / Kafka Event Bus + OpenAPI Contract Validator + Prebuilt SAP RFC Connectors.', '["Prebuilt SAP S/4HANA Connectors","Event Mesh Publish-Subscribe","Contract Compatibility Guard","Automated Dead-Letter Queue"]'::jsonb, '["SAP S/4HANA","Salesforce","ServiceNow","Apache Kafka","GraphQL","Docker"]'::jsonb, '["SAP to Salesforce Order Sync","Real-Time Inventory Mesh","Cross-System Customer Master Sync"]'::jsonb, '70% reduction in integration setup effort with 99.999% message delivery reliability.', NULL, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-28T07:32:01.221Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 5. Industries (11 Verified Sectors)
INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_01', 'Manufacturing', 'manufacturing', 'Smart factory telemetry, OEE optimization, machine vision quality inspection, and supply chain visibility for discrete & process manufacturers.', 'We empower manufacturing plants to connect shop-floor PLCs, eliminate unplanned downtime with predictive maintenance, and automate production reporting across high-speed assembly lines.', 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop', '["Unplanned machine breakdowns causing costly factory line stoppages","Paper-based shift logs and disconnected operational spreadsheets","Supply chain parts stockouts and unpredicted inventory buffers"]'::jsonb, '["Edge IIoT machine telemetry via BitXhift platform","Live floor OEE management wallboards and real-time alerts","Edge computer vision defect recognition reducing manual inspection by 80%"]'::jsonb, '["OPC-UA","MQTT","BitXhift IIoT","TimescaleDB","Python","React","SAP S/4HANA"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_02', 'Energy & Utilities', 'energy-utilities', 'Smart grid monitoring, turbine anomaly prediction, load forecasting, and automated environmental compliance auditing.', 'Real-time telemetry and predictive models for power distribution networks, renewable generation plants, and municipal utilities to optimize load distribution and eliminate blackout risks.', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1200&auto=format&fit=crop', '["Grid load fluctuation instability during peak demand cycles","High maintenance overhead and unexpected field turbine component failures","Complex environmental carbon compliance and ESG data reporting pressure"]'::jsonb, '["Predictive transformer and wind/solar turbine vibration models","Sub-second SCADA and smart meter grid telemetry ingestion","Automated ESG compliance data aggregation and audit reporting"]'::jsonb, '["Modbus","SCADA","InfluxDB","TensorFlow","Apache Kafka","Grafana","ParseMaster"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_03', 'Retail & E-Commerce', 'retail-ecommerce', 'Omnichannel inventory sync, dynamic pricing engines, customer lifetime value prediction, and real-time order routing.', 'High-throughput data pipelines and predictive engines enabling unified customer journeys, zero-stockout fulfillment, and automated ERP reconciliation across retail networks.', 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1200&auto=format&fit=crop', '["Inventory stockouts and excessive carrying costs in fulfillment centers","Fragmented customer profile data across legacy POS and web channels","Slow product search latency and inaccurate demand forecasting"]'::jsonb, '["Event-driven order and inventory synchronization via LinkGenX","Real-time personalization and semantic vector product search","Automated demand forecasting and restocking recommendation pipelines"]'::jsonb, '["Snowflake","dbt","Redis","Elasticsearch","AWS Lambda","LinkGenX"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_04', 'BFSI', 'bfsi', 'Fraud anomaly detection, automated regulatory compliance, core banking ledger sync, and agentic customer verification.', 'Engineered for financial institutions requiring sub-millisecond fraud detection, strict DPDP and GDPR privacy compliance, and resilient high-frequency transaction processing.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop', '["Evolving financial fraud patterns bypassing legacy rule-based engines","Strict DPDP and regulatory compliance reporting burden on compliance teams","Legacy core banking system data isolation and slow loan underwriting cycles"]'::jsonb, '["Graph-based real-time fraud transaction scoring and anomaly detection","Automated DPDP audit logging, PII scrubbing, and column-level data lineage","Secure core banking integration mesh for sub-second account sync via LinkGenX"]'::jsonb, '["MigrateMax","ParseMaster","Apache Flink","PostgreSQL","Python ML","Kubernetes","LinkGenX"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_05', 'Healthcare', 'healthcare', 'Clinical telemetry ingestion, medical device connectivity, HIPAA/privacy compliance, and AI diagnostic assistant pipelines.', 'Connecting medical devices, EHR platforms, and laboratory research systems to deliver secure patient diagnostics, real-time clinical dashboards, and compliant data lakehouses.', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop', '["Fragmented electronic health records (EHR) across hospital networks","Strict HIPAA, DPDP, and medical data privacy regulatory constraints","Delayed clinical diagnostic feedback and slow medical document extraction"]'::jsonb, '["FHIR/HL7 streaming integration pipelines via ParseMaster","Automated de-identified patient data lakehouses with zero-trust RBAC","Grounded clinical decision support and medical document intelligence models"]'::jsonb, '["HL7/FHIR API","ParseMaster","PostgreSQL","FastAPI","Qdrant","Azure Healthcare"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_06', 'Logistics', 'logistics', 'Fleet telemetry tracking, warehouse route optimization, automated freight audit, and predictive delivery ETAs.', 'Real-time supply chain intelligence connecting vehicle IoT sensors, EDI clearance feeds, and warehouse management systems to maximize delivery throughput and reduce transit delays.', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop', '["Unpredictable freight transit delays and unmonitored cold-chain excursions","High fuel consumption and route inefficiencies across multi-regional fleets","Manual bill of lading and EDI 856 freight document reconciliation"]'::jsonb, '["GPS and CAN-bus edge telemetry ingestion with real-time transit alerts","Automated EDI 850/856 and freight document parsing via ParseMaster","Dynamic dispatch routing algorithms and predictive delivery ETA engines"]'::jsonb, '["ParseMaster","MQTT","TimescaleDB","Go","Docker","Google Maps API","Kafka"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_07', 'Telecom', 'telecom', '5G tower power telemetry, high-throughput Call Detail Record (CDR) lakehouses, subscriber churn risk scoring, and network SLA monitoring.', 'Telecom data engineering architectures handling billions of daily CDR logs, optimizing tower energy consumption, and delivering real-time network performance intelligence.', 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop', '["Escalating 5G cell tower power management costs and unmonitored battery wear","High subscriber churn rates due to undetected regional network degradation","Massive Call Detail Record (CDR) volumes overloading traditional relational databases"]'::jsonb, '["High-throughput CDR streaming lakehouse built on Apache Spark and ParseMaster","Tower battery AI energy optimization and predictive maintenance alerts","Real-time network QoS telemetry and subscriber churn risk scoring"]'::jsonb, '["ParseMaster","Apache Spark","Databricks","TimescaleDB","Python ML","Kafka"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_08', 'Infrastructure', 'infrastructure', 'Structural health monitoring, BMS building telemetry, intelligent traffic control, and municipal asset management.', 'Smart infrastructure engineering systems connecting building automation systems (BACnet, Modbus), bridge sensors, and urban utility networks for predictive maintenance and energy efficiency.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop', '["Aging physical bridge and highway structures lacking real-time strain sensors","Excessive building HVAC power waste due to unoptimized occupancy schedules","Disconnected municipal utility infrastructure and slow emergency response"]'::jsonb, '["Real-time IoT structural strain and seismic vibration sensor monitoring","Automated Building Management System (BMS) energy optimization via BitXhift","Centralized municipal asset wallboards and automated maintenance dispatch"]'::jsonb, '["BACnet","Modbus TCP","BitXhift IIoT","TimescaleDB","Grafana","React"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_09', 'Oil & Gas', 'oil-gas', 'Rig telematics, pipeline leak detection, refinery yield optimization, and hazardous environment compliance.', 'Edge IoT and predictive analytics platforms for upstream drilling rigs, midstream pipelines, and downstream refineries operating in extreme conditions.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop', '["Unplanned offshore drilling rig downtime costing up to $250,000 per day","Pipeline corrosion and unpredicted pressure drops causing environmental risk","Fragmented refinery SCADA logs preventing real-time yield optimization"]'::jsonb, '["High-pressure edge sensor telemetry ingestion via BitXhift","Acoustic and thermal pipeline leak detection algorithms with instant alerts","Real-time refinery unit mass balance and yield optimization models"]'::jsonb, '["OPC-UA","Modbus RTU","BitXhift","TimescaleDB","Python","Azure Edge"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_10', 'Media', 'media', 'Multimodal AI content tagging, high-speed digital asset indexing, real-time CDN telemetry, and streaming audience analytics.', 'AI-driven media engineering solutions enabling sub-second content discovery, automated metadata extraction from video/audio streams, and streaming CDN performance monitoring.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop', '["Millions of unindexed video assets sitting in dark media archives","Slow manual tagging of broadcast footage causing publication delays","Unmonitored CDN buffering and video playback quality drops"]'::jsonb, '["Multimodal AI asset indexing using vector embeddings and LLMs","Automated speech-to-text, face, and OCR tagging for video archives","Real-time CDN edge telemetry monitoring with automatic stream rerouting"]'::jsonb, '["Gemini API","LangGraph","ParseMaster","Qdrant Vector DB","AWS CloudFront"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO industries (id, name, slug, summary, content, cover_image_url, business_problems, solutions, technology, use_cases, status, created_at, updated_at, published_at)
VALUES ('ind_11', 'Electrical', 'electrical', 'PCB automated optical inspection (AOI), transformer test telemetry, component traceability, and high-speed SMT line OEE.', 'High-precision electronics manufacturing systems connecting Surface Mount Technology (SMT) lines, automated optical inspection cameras, and component traceability databases.', 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?q=80&w=1200&auto=format&fit=crop', '["Micro-solder defect escapes reaching downstream assembly customers","Manual barcode scanning slowing down high-speed PCB conveyor lines","Fragmented component batch tracking causing expensive recall exposure"]'::jsonb, '["Edge AI optical defect recognition on high-speed SMT inspection cameras","High-frequency test bench telemetry capture for electrical transformers and relays","Component-level serial traceability integrated directly with SAP ERP"]'::jsonb, '["BitXhift IIoT","OpenCV","PyTorch Edge","Modbus","TimescaleDB","React"]'::jsonb, '[]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 6. Case Studies (2 Verified Studies)
INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)
VALUES ('cs_01', 'Smart Factory IIoT Transformation for Automotive Component OEM', 'Tier-1 Automotive Component Manufacturer', 'smart-factory-manufacturing-transformation', 'Manufacturing', 'Coimbatore, Tamil Nadu', 'BitXhift IIoT Platform', 'Industrial IoT (IIoT)', 'The OEM operated 500+ machining centers across 3 facilities with manual paper shift logs, causing 42 hours of unexplained machine downtime per month and unverified OEE metrics.', 'Deployed BitXhift edge telemetry containers across all machine PLCs, streaming high-frequency vibration and spindle load metrics into a centralized TimescaleDB cluster with real-time floor wallboards.', 'Installed non-invasive Modbus and OPC-UA edge gateway nodes. Configured automated alert rules for spindle vibration anomalies and connected production metrics to the SAP ERP ledger.', 'Eliminated manual shift logs, reduced unplanned machine stoppage by 35%, and established 99.8% accurate real-time OEE tracking across all 3 production facilities.', '["MQTT","OPC-UA","BitXhift","TimescaleDB","Python","React"]'::jsonb, 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop', NULL, 'published', '2026-08-10T00:00:00.000Z'::timestamptz, '2026-08-10T00:00:00.000Z'::timestamptz, '2026-08-10T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO case_studies (id, title, client_name, slug, industry, location, accelerator, related_service, challenge, solution, implementation, results, technologies, cover_image_url, pdf_url, status, created_at, updated_at, published_at)
VALUES ('cs_02', 'Enterprise Zero-Downtime Data Warehouse Migration for Global Retailer', 'Multinational Retail & E-Commerce Group', 'enterprise-database-cloud-migration', 'Retail & E-Commerce', 'Bengaluru / Singapore', 'MigrateMax Cloud Engine', 'Data Engineering', 'A legacy 40TB Oracle database running critical transactional inventory queries suffered from query timeouts and excessive on-premise hardware licensing costs.', 'Utilized MigrateMax to automate schema translation, establish parallel Change Data Capture (CDC) streaming, and execute zero-downtime DNS cutover to Snowflake.', 'Converted 1,200+ DDL tables and stored procedures. Executed parallel row-hash validation audits over 2 weeks prior to final instantaneous DNS cutover.', '100% data fidelity with zero minutes of business downtime, 65% reduction in analytical query execution times, and $450k annual infrastructure savings.', '["MigrateMax","Oracle","Snowflake","Apache Spark","dbt","AWS"]'::jsonb, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop', NULL, 'published', '2026-08-15T00:00:00.000Z'::timestamptz, '2026-08-15T00:00:00.000Z'::timestamptz, '2026-08-15T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 7. Flash Reports (3 Verified Reports)
INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, category, problem_statement, solution_statement, cover_image_url, related_content, created_at, updated_at, published_at)
VALUES ('rep_1787826861040_9sh3', 'Automated Edge Telemetry & Real-Time OPC-UA Ingestion', 'automated-edge-telemetry-real-time-opc-ua-ingestion', '2026-08-27', 'FLASH', 'Weekly', 'trash', 'Legacy factory machinery lacks sub-50ms operational visibility.', 'Deployed BitXhift edge agents delivering continuous streaming telemetry.', '["Python","OPC-UA","MQTT","TimescaleDB","Docker"]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, FALSE, 'Services', 'Legacy factory machinery lacks sub-50ms operational visibility.', 'Deployed BitXhift edge agents delivering continuous streaming telemetry.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', 'Industrial IoT (IIoT)', '2026-08-27T10:34:21.040Z'::timestamptz, '2026-09-03T09:40:01.411Z'::timestamptz, '2026-08-27T10:34:21.040Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, category, problem_statement, solution_statement, cover_image_url, related_content, created_at, updated_at, published_at)
VALUES ('rep_01', 'Edge Telemetry & OPC-UA Ingestion Benchmark', 'edge-telemetry-opc-ua-ingestion-benchmark', '2026-08-27', 'FLASH', 'Weekly', 'published', 'Legacy machines lack real-time operational visibility and stream telemetry in siloed proprietary formats.', 'Deploy edge intelligence containers connecting PLCs with TimescaleDB for live OEE wallboards.', '["IIoT","Python","MQTT","TimescaleDB","OPC-UA"]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, FALSE, 'Services', 'Legacy machines lack real-time operational visibility and stream telemetry in siloed proprietary formats.', 'Deploy edge intelligence containers connecting PLCs with TimescaleDB for live OEE wallboards.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', 'Industrial IoT (IIoT)', '2026-08-27T08:00:00.000Z'::timestamptz, '2026-08-27T08:00:00.000Z'::timestamptz, '2026-08-27T08:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, title, slug, date, type, report_type, status, summary, full_content, tags, key_findings, source_file, pdf_url, docx_url, featured, category, problem_statement, solution_statement, cover_image_url, related_content, created_at, updated_at, published_at)
VALUES ('rep_02', 'MigrateMax Schema Drift Auto-Healing Engine', 'migratemax-schema-drift-auto-healing-engine', '2026-08-20', 'FLASH', 'Weekly', 'published', 'Unannounced upstream ERP schema alterations break mission-critical analytical database pipelines.', 'Automate dynamic schema inference and automated migration DDL mapping on incoming streams.', '["Spark","Rust","Snowflake","dbt","AWS"]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, FALSE, 'Accelerators', 'Unannounced upstream ERP schema alterations break mission-critical analytical database pipelines.', 'Automate dynamic schema inference and automated migration DDL mapping on incoming streams.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', 'MigrateMax', '2026-08-20T08:00:00.000Z'::timestamptz, '2026-08-20T08:00:00.000Z'::timestamptz, '2026-08-20T08:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 8. Media Assets (4 Verified Storage Assets)
INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
VALUES ('med_pdf_1788430010211_rdta', 'it_blog_article_1788430010199_qatwu9.pdf', 'it_blog_article.pdf', '/uploads/it_blog_article_1788430010199_qatwu9.pdf', 'application/pdf', 54021, 'pdf', '2026-09-03T10:06:50.211Z'::timestamptz, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
VALUES ('med_pdf_1788428569816_2rh2', 'it_blog_article_1788428569814_p7skpv.pdf', 'it_blog_article.pdf', '/uploads/it_blog_article_1788428569814_p7skpv.pdf', 'application/pdf', 54021, 'pdf', '2026-09-03T09:42:49.816Z'::timestamptz, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
VALUES ('med_pdf_1788428470103_dez8', 'it_blog_article_1788428470097_oq57nt.pdf', 'it_blog_article.pdf', '/uploads/it_blog_article_1788428470097_oq57nt.pdf', 'application/pdf', 54021, 'pdf', '2026-09-03T09:41:10.103Z'::timestamptz, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO media (id, filename, original_name, url, mime_type, size, type, uploaded_at, metadata)
VALUES ('med_pdf_1788428101090_unj4', 'it_blog_article_1788428101087_he3p4m.pdf', 'it_blog_article.pdf', '/uploads/it_blog_article_1788428101087_he3p4m.pdf', 'application/pdf', 54021, 'pdf', '2026-09-03T09:35:01.090Z'::timestamptz, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 9. Activity Logs (60 Historical Logs)
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1789126480695_chks', '11 SEP', 'Admin Login Successful', 'User "BitXhift SuperAdmin" logged in from ::1', 'auth_login', '2026-09-11T11:34:40.695Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788433373369_ixct', '3 SEP', 'New Book a Call Request: Test Company Ltd', 'Live Test Client (client.test@company.com) requested session for Artificial Intelligence & Machine Learning', 'engagement', '2026-09-03T11:02:53.369Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788432241434_4z6e', '3 SEP', 'Admin Login Successful', 'User "BitXhift SuperAdmin" logged in from 127.0.0.1', 'auth_login', '2026-09-03T10:44:01.434Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788430015247_9f2o', '3 SEP', 'Created post: "it_blog_article"', 'Status: published by BitXhift SuperAdmin', 'posts_create', '2026-09-03T10:06:55.247Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788430010214_vaaw', '3 SEP', 'Uploaded PDF Document: "it_blog_article.pdf"', 'Saved as /uploads/it_blog_article_1788430010199_qatwu9.pdf', 'pdf_upload', '2026-09-03T10:06:50.214Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428580056_dzsn', '3 SEP', 'Created post: "it_blog_article"', 'Status: published by BitXhift SuperAdmin', 'posts_create', '2026-09-03T09:43:00.056Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428569820_3s8i', '3 SEP', 'Uploaded PDF Document: "it_blog_article.pdf"', 'Saved as /uploads/it_blog_article_1788428569814_p7skpv.pdf', 'pdf_upload', '2026-09-03T09:42:49.820Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428481613_66s2', '3 SEP', 'Created staffin: "it_blog_article"', 'Status: published by BitXhift SuperAdmin', 'staffing_create', '2026-09-03T09:41:21.613Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428470108_y5kt', '3 SEP', 'Uploaded PDF Document: "it_blog_article.pdf"', 'Saved as /uploads/it_blog_article_1788428470097_oq57nt.pdf', 'pdf_upload', '2026-09-03T09:41:10.108Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428105815_vto8', '3 SEP', 'Created post: "it_blog_article"', 'Status: published by BitXhift SuperAdmin', 'posts_create', '2026-09-03T09:35:05.815Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788428101094_yz81', '3 SEP', 'Uploaded PDF Document: "it_blog_article.pdf"', 'Saved as /uploads/it_blog_article_1788428101087_he3p4m.pdf', 'pdf_upload', '2026-09-03T09:35:01.094Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427864338_ry3w', '3 SEP', 'Deleted media file: "image1.png"', 'Removed by Admin', 'media_delete', '2026-09-03T09:31:04.338Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427860102_hbgc', '3 SEP', 'Deleted media file: "smart-factory-telemetry.jpg"', 'Removed by Admin', 'media_delete', '2026-09-03T09:31:00.102Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427610191_bm92', '3 SEP', 'Deleted media file: "cloud-lakehouse.jpg"', 'Removed by Admin', 'media_delete', '2026-09-03T09:26:50.191Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427194981_u1bs', '3 SEP', 'Admin Login Successful', 'User "BitXhift SuperAdmin" logged in from ::1', 'auth_login', '2026-09-03T09:19:54.981Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427194620_hpkb', '3 SEP', 'New Book a Call Request: Apex Healthcare Cloud', 'Sunita Narayanan (sunita.n@apexhealth.io) requested session for Healthcare & Life Sciences', 'engagement', '2026-09-03T09:19:54.620Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427169915_jzzr', '3 SEP', 'New Book a Call Request: Apex', 'akil (bitxhift@gmail.com) requested session for Technology Transformation', 'engagement', '2026-09-03T09:19:29.915Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788427126084_9pa9', '3 SEP', 'Admin Login Successful', 'User "BitXhift SuperAdmin" logged in from ::1', 'auth_login', '2026-09-03T09:18:46.084Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788426929816_x6qe', '3 SEP', 'Admin Login Successful', 'User "BitXhift SuperAdmin" logged in from ::1', 'auth_login', '2026-09-03T09:15:29.816Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788426929094_t6hm', '3 SEP', 'New Book a Call Request: Apex Healthcare Cloud', 'Sunita Narayanan (sunita.n@apexhealth.io) requested session for Healthcare & Life Sciences', 'engagement', '2026-09-03T09:15:29.094Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788426398165_elwj', '3 SEP', 'New Book a Call Request: Titan Manufacturing Corp', 'Vikram Malhotra (vikram.m@titanmfg.in) requested session for Industrial IoT (IIoT)', 'engagement', '2026-09-03T09:06:38.165Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788426378303_v7bs', '3 SEP', 'New Book a Call Request: Titan Manufacturing Corp', 'Vikram Malhotra (vikram.m@titanmfg.in) requested session for Industrial IoT (IIoT)', 'engagement', '2026-09-03T09:06:18.303Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788426358694_wr03', '3 SEP', 'New Book a Call Request: Titan Manufacturing Corp', 'Vikram Malhotra (vikram.m@titanmfg.in) requested session for Industrial IoT (IIoT)', 'engagement', '2026-09-03T09:05:58.694Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788347089462_63bx', '2 SEP', 'New Engagement Inquiry: APEX', 'MUKHESH S (smukhesh11@gmail.com) - Technology Transformation', 'engagement', '2026-09-02T11:04:49.462Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788169814536_zegz', '31 AUG', 'Updated industrie: "Oil & Gas"', 'Updated by SMRIKAAM Master Admin', 'industries_update', '2026-08-31T09:50:14.536Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788169765718_uec7', '31 AUG', 'Updated industrie: "Oil & Gas"', 'Updated by SMRIKAAM Master Admin', 'industries_update', '2026-08-31T09:49:25.718Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788169692329_39dx', '31 AUG', 'Updated industrie: "Oil & Gas"', 'Updated by SMRIKAAM Master Admin', 'industries_update', '2026-08-31T09:48:12.329Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788169624876_ecs6', '31 AUG', 'Updated industrie: "Oil & Gas"', 'Updated by SMRIKAAM Master Admin', 'industries_update', '2026-08-31T09:47:04.876Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1788169576312_l43h', '31 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-31T09:46:16.312Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787909953114_u6kw', '28 AUG', 'Permanently deleted "Test PostgreSQL Service"', 'Deleted by Admin', 'services_delete_permanent', '2026-08-28T09:39:13.114Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787909953104_484m', '28 AUG', 'Created service: "Test PostgreSQL Service"', 'Status: draft by Admin', 'services_create', '2026-08-28T09:39:13.104Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787909933706_8e9g', '28 AUG', 'Created service: "Test PostgreSQL Service"', 'Status: draft by Admin', 'services_create', '2026-08-28T09:38:53.706Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787900847989_efxq', '28 AUG', 'Updated service: "Artificial Intelligence & Machine Learning"', 'Updated by SMRIKAAM Master Admin', 'services_update', '2026-08-28T07:07:27.989Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787900674080_eb07', '28 AUG', 'Status changed to published for "AI / ML"', 'Updated by SMRIKAAM Master Admin', 'services_status', '2026-08-28T07:04:34.080Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787900669426_v901', '28 AUG', 'Updated service: "AI / ML"', 'Updated by SMRIKAAM Master Admin', 'services_update', '2026-08-28T07:04:29.426Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898809429_n65o', '28 AUG', 'Status changed to published for "High-Throughput Time-Series Architecture for Discrete Manufacturing"', 'Updated by SMRIKAAM Master Admin', 'posts_status', '2026-08-28T06:33:29.429Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898804702_9zag', '28 AUG', 'Restored "High-Throughput Time-Series Architecture for Discrete Manufacturing" from Trash', 'Restored by SMRIKAAM Master Admin', 'posts_restore', '2026-08-28T06:33:24.702Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898799279_xccz', '28 AUG', 'Moved "High-Throughput Time-Series Architecture for Discrete Manufacturing" to Trash', 'Moved to trash by SMRIKAAM Master Admin', 'posts_trash', '2026-08-28T06:33:19.279Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898792262_zmjs', '28 AUG', 'Status changed to published for "High-Throughput Time-Series Architecture for Discrete Manufacturing"', 'Updated by SMRIKAAM Master Admin', 'posts_status', '2026-08-28T06:33:12.262Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898784608_un8g', '28 AUG', 'Restored "High-Throughput Time-Series Architecture for Discrete Manufacturing" from Trash', 'Restored by SMRIKAAM Master Admin', 'posts_restore', '2026-08-28T06:33:04.608Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898767790_z26j', '28 AUG', 'Moved "High-Throughput Time-Series Architecture for Discrete Manufacturing" to Trash', 'Moved to trash by SMRIKAAM Master Admin', 'posts_trash', '2026-08-28T06:32:47.790Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787898531619_140s', '28 AUG', 'Moved "Industrial IoT (IIoT)" to Trash', 'Moved to trash by SMRIKAAM Master Admin', 'services_trash', '2026-08-28T06:28:51.619Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787897959128_kb4h', '28 AUG', 'Permanently deleted "AI / ML"', 'Deleted by SMRIKAAM Master Admin', 'services_delete_permanent', '2026-08-28T06:19:19.128Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787897934005_4jg6', '28 AUG', 'Moved "AI / ML" to Trash', 'Moved to trash by SMRIKAAM Master Admin', 'services_trash', '2026-08-28T06:18:54.005Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787897917019_yhlz', '28 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-28T06:18:37.019Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787897844562_sz3m', '28 AUG', 'Password Reset Requested', 'Password reset token generated for admin@smrikaam.com', 'auth_reset', '2026-08-28T06:17:24.562Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787832376473_nzdf', '27 AUG', 'Created report: "Automated Edge Telemetry & Real-Time OPC-UA Ingestion"', 'Status: published by SMRIKAAM Master Admin', 'reports_create', '2026-08-27T12:06:16.473Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787832376434_w1h5', '27 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-27T12:06:16.433Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787827228234_teeu', '27 AUG', 'Site Settings Updated', 'System configurations adjusted by Admin', 'settings_update', '2026-08-27T10:40:28.234Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787827151727_0ji1', '27 AUG', 'Site Settings Updated', 'System configurations adjusted by Admin', 'settings_update', '2026-08-27T10:39:11.727Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787827098524_2w92', '27 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-27T10:38:18.524Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787826876436_31qu', '27 AUG', 'Imported DOCX Document: "sample_test.docx"', 'Extracted 1 images and 281 chars text', 'document_import', '2026-08-27T10:34:36.436Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787826876392_uf4c', '27 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-27T10:34:36.392Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787826861057_6h6r', '27 AUG', 'Created post: "High-Throughput Time-Series Architecture for Discrete Manufacturing"', 'Status: published by SMRIKAAM Master Admin', 'posts_create', '2026-08-27T10:34:21.057Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787826861042_zy10', '27 AUG', 'Created report: "Automated Edge Telemetry & Real-Time OPC-UA Ingestion"', 'Status: published by SMRIKAAM Master Admin', 'reports_create', '2026-08-27T10:34:21.042Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_1787826861023_hcmc', '27 AUG', 'Admin Login Successful', 'User "SMRIKAAM Master Admin" logged in from ::1', 'auth_login', '2026-08-27T10:34:21.023Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_01', '27 AUG', 'New Services flash report published', 'Report "Edge Telemetry & OPC-UA Ingestion Benchmark" published by Admin.', 'report_publish', '2026-08-27T08:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_02', '25 AUG', 'Blog article published', 'Article "Deploying Deterministic LLM Agents in Regulated Enterprise Environments" published.', 'blog_publish', '2026-08-25T09:15:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_03', '22 AUG', 'Data Lakehouse Migration Case Study added', 'Enterprise database cutover case study published to public website.', 'case_study_create', '2026-08-22T14:30:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, date, title, description, type, timestamp)
VALUES ('log_04', '20 AUG', 'BitXhift IIoT Telemetry Accelerator updated', 'Added Modbus and OPC-UA connection protocols specification.', 'accelerator_update', '2026-08-20T10:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 10. Staffing Models (4 Verified Models)
INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
VALUES ('staff_01', 'Temporary Staffing', 'temporary-staffing', 'On-demand specialists for surge capacity and short-term programs.', 'Scale your team within days with pre-vetted technology professionals for project sprints, seasonal demand, parental leave cover, or transformation programs. We handle sourcing, screening, onboarding, and payroll.', '["48â€“72h shortlist turnaround","Fully payrolled \u0026 compliant","Engineering, data, cloud \u0026 IIoT roles","Onsite, hybrid or fully remote"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
VALUES ('staff_02', 'Permanent Placement', 'permanent-placement', 'End-to-end recruitment for full-time technology hires.', 'Hire senior engineers, data scientists, architects, and product specialists who will stay and grow with you. Our multi-stage technical and behavioural screening ensures every candidate matches your stack and culture.', '["Niche AI, Data, IIoT, Cloud roles","Cultural \u0026 leadership fit screening","Replacement guarantee","Salary benchmarking \u0026 offer support"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
VALUES ('staff_03', 'Contract & Project-Based Staffing', 'contract-project-based-staffing', 'Outcome-driven pods for time-boxed transformation programs.', 'Build a dedicated delivery podâ€”engineers, data scientists, SREs, and product ownersâ€”aligned to a specific roadmap with clear milestones and outcomes. Ideal for analytics platforms, IIoT rollouts, and cloud migrations.', '["Fixed-duration engagements (3â€“18 months)","Milestone-based delivery","Dedicated pod with single accountability","Smooth handover \u0026 documentation"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO staffing (id, title, slug, subtitle, "desc", bullets, status, created_at, updated_at, published_at)
VALUES ('staff_04', 'Executive Search', 'executive-search', 'Confidential search for CXO, VP and Director-level technology leaders.', 'When you are hiring a CTO, Head of Data, VP Engineering, or transformation leader, we run a discreet executive search across India and key global marketsâ€”combining domain mapping and reference assessments.', '["CTO, CIO, CDO, VP Eng \u0026 Head of Data","Confidential market mapping","Reference-backed shortlists","Onboarding \u0026 90-day success support"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 11. Locations (3 Verified Centers)
INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)
VALUES ('loc_01', 'COIMBATORE HQ', 'coimbatore-hq', 'PRIMARY TECHNOLOGY & DELIVERY CENTER', 'No. 19, Nataraj Nagar, Koundampalayam, Coimbatore, Tamil Nadu 641030, India', 'contact@smrikaam.com', '+91 91506 84601', 'Our Coimbatore headquarters houses our core engineering teams, solutions architecture groups, and testing infrastructure for shop-floor IIoT and enterprise AI systems.', '["Industrial IoT \u0026 Edge R\u0026D Lab","Data \u0026 Lakehouse Center","Enterprise AI \u0026 Agentic Lab","Global Delivery Operations"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)
VALUES ('loc_02', 'CHENNAI CENTER', 'chennai-center', 'ENTERPRISE SOLUTIONS & CLOUD LAB', 'OMR IT Corridor, Chennai, Tamil Nadu, India', 'contact@smrikaam.com', '+91 91506 84601', 'Our Chennai facility focuses on enterprise cloud migrations, multi-tenant lakehouse architectures, and banking compliance integration pods.', '["Cloud Migration Engineering","Enterprise ServiceNow Pod","Big Data Engineering"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, slug, type, address, email, phone, description, capabilities, status, created_at, updated_at, published_at)
VALUES ('loc_03', 'BENGALURU HUB', 'bengaluru-hub', 'AI & CLIENT CONSULTING HUB', 'Outer Ring Road, Bengaluru, Karnataka, India', 'contact@smrikaam.com', '+91 91506 84601', 'Client consulting and generative AI strategy hub working directly with enterprise CTOs on architecture roadmaps.', '["AI Advisory \u0026 Roadmaps","Executive Consulting","Platform Architecture Reviews"]'::jsonb, 'published', '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz, '2026-08-01T00:00:00.000Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

-- 12. Settings (Site Settings)
INSERT INTO settings (key, value, updated_at)
VALUES ('site_settings', '{"siteName":"SMRIKAAM Technologies","contactEmail":"contact@smrikaam.com","contactPhone":"+91-9150684601","address":"Coimbatore, Tamil Nadu, India","allowPublicRegistration":false,"maintenanceMode":false}'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;

-- 13. Engagements (7 Verified Client Inquiries)
INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788430976410_56v67f', 'Supabase Test User', 'Test Enterprise Inc', 'test.user@enterprise.example', '+91 9876543210', NULL, 'Enterprise Data Engineering', 'Testing Supabase database flow', NULL, NULL, 'Public Website', 'NEW', 'MEDIUM', NULL, NULL, FALSE, '2026-09-03T10:22:56.410Z'::timestamptz, '2026-09-03T10:22:56.410Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788427194618_v6wr54', 'Sunita Narayanan', 'Apex Healthcare Cloud', 'sunita.n@apexhealth.io', '+91 91234 56789', 'Director of Platform Engineering', 'Healthcare & Life Sciences', 'Require HIPAA-compliant cloud migration & FHIR integration for 12 regional hospitals.', '2026-09-15', '02:00 PM - 04:00 PM', 'Public Web Form', 'QUALIFIED', 'URGENT', 'Dr. Ananya Sharma â€” Cloud Architect Lead', 'Verified HIPAA compliance requirements. Proposal deck sent.', TRUE, '2026-09-03T09:19:54.618Z'::timestamptz, '2026-09-03T09:19:55.005Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788427169911_i8u8d2', 'akil', 'Apex', 'bitxhift@gmail.com', '6382950334', NULL, 'Technology Transformation', 'bnm,', NULL, NULL, 'Contact Page', 'CONTACTED', 'MEDIUM', NULL, NULL, TRUE, '2026-09-03T09:19:29.911Z'::timestamptz, '2026-09-03T09:39:03.027Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788426929084_x0gpvb', 'Sunita Narayanan', 'Apex Healthcare Cloud', 'sunita.n@apexhealth.io', '+91 91234 56789', 'Director of Platform Engineering', 'Healthcare & Life Sciences', 'Require HIPAA-compliant cloud migration & FHIR integration for 12 regional hospitals.', '2026-09-15', '02:00 PM - 04:00 PM', 'Public Web Form', 'QUALIFIED', 'URGENT', 'Dr. Ananya Sharma â€” Cloud Architect Lead', 'Verified HIPAA compliance requirements. Proposal deck sent.', TRUE, '2026-09-03T09:15:29.084Z'::timestamptz, '2026-09-03T09:15:29.859Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788426398160_mlc391', 'Vikram Malhotra', 'Titan Manufacturing Corp', 'vikram.m@titanmfg.in', '+91 98765 12345', 'VP Operations', 'Industrial IoT (IIoT)', 'We operate 450 CNC machining centers in Hosur and need real-time edge telemetry and OEE tracking.', '2026-09-10', '11:00 AM - 01:00 PM', 'E2E Test Script', 'CONTACTED', 'HIGH', 'Ramesh Kumar - Lead Solution Architect', 'Initial discovery call scheduled for Sept 10th at 11:00 AM IST.', TRUE, '2026-09-03T09:06:38.160Z'::timestamptz, '2026-09-03T09:06:38.258Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788426378299_ffy88x', 'Vikram Malhotra', 'Titan Manufacturing Corp', 'vikram.m@titanmfg.in', '+91 98765 12345', 'VP Operations', 'Industrial IoT (IIoT)', 'We operate 450 CNC machining centers in Hosur and need real-time edge telemetry and OEE tracking.', '2026-09-10', '11:00 AM - 01:00 PM', 'E2E Test Script', 'NEW', 'MEDIUM', NULL, NULL, FALSE, '2026-09-03T09:06:18.299Z'::timestamptz, '2026-09-03T09:59:09.703Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagements (id, full_name, company_name, email, phone, job_title, requirement_type, message, preferred_date, preferred_time, source, status, priority, assigned_to, admin_notes, is_read, created_at, updated_at)
VALUES ('eng_1788426358688_3b4scd', 'Vikram Malhotra', 'Titan Manufacturing Corp', 'vikram.m@titanmfg.in', '+91 98765 12345', 'VP Operations', 'Industrial IoT (IIoT)', 'We operate 450 CNC machining centers in Hosur and need real-time edge telemetry and OEE tracking.', '2026-09-10', '11:00 AM - 01:00 PM', 'E2E Test Script', 'CONTACTED', 'MEDIUM', NULL, NULL, TRUE, '2026-09-03T09:05:58.688Z'::timestamptz, '2026-09-03T09:59:00.643Z'::timestamptz)
ON CONFLICT (id) DO NOTHING;

