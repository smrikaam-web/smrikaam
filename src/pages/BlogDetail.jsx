import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import api from '../api';
import BlueprintWrapper from '../components/BlueprintWrapper';
import ReadingProgressBar from '../components/anim/ReadingProgressBar';
import TextReveal from '../components/anim/TextReveal';
import Reveal from '../components/anim/Reveal';
import RichTextRenderer from '../components/RichTextRenderer';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultPostsMap = {
    'iiot-telemetry-coimbatore': {
      title: 'Architecting Low-Latency IIoT Telemetry for High-Speed Manufacturing',
      slug: 'iiot-telemetry-coimbatore',
      category_id: 'Industrial IoT',
      excerpt: 'How edge telemetry pipelines capture 17M+ data points per day from Modbus/OPC-UA machine controllers with under 50ms latency.',
      published_at: new Date().toISOString(),
      content: `In high-precision discrete manufacturing, real-time machine telemetry is the difference between proactive yield optimization and costly line stoppages. At SMRIKAAM, our BitXhift edge telemetry engine interfaces directly with Modbus RTU/TCP, OPC-UA, and Siemens S7 controllers to ingest sensor telemetry continuously.\n\nBy performing protocol normalization directly at the edge layer, we stream clean JSON/MQTT payloads into centralized time-series storage without saturating plant network bandwidth.\n\nKey Engineering Pillars:\n- Deterministic sub-50ms ingestion latency across 50+ concurrent CNC and PLC controllers.\n- Store-and-forward edge buffer mechanism ensuring zero data loss during network dropouts.\n- Automated anomaly detection for motor vibration, thermal thresholds, and spindle load.`,
      secondary_keywords: ['IIoT', 'Modbus', 'OPC UA', 'MQTT', 'BitXhift', 'Coimbatore']
    },
    'cloud-data-warehouse-migration': {
      title: 'Zero-Downtime Data Lakehouse Migration for Enterprise Systems',
      slug: 'cloud-data-warehouse-migration',
      category_id: 'Data Engineering',
      excerpt: 'Automated schema transformation and row-level validation patterns for legacy ERP database cutovers.',
      published_at: new Date().toISOString(),
      content: `Migrating legacy RDBMS schemas to modern cloud data lakehouses like Snowflake and Databricks presents significant challenges in schema divergence, transaction consistency, and operational downtime.\n\nUsing SMRIKAAM's MigrateMax accelerator, engineering teams automate schema mapping, execute streaming CDC (Change Data Capture) validation, and achieve zero-downtime cutovers.\n\nMigration Strategy:\n- Automated DDL translation and data type mapping across PostgreSQL, SAP HANA, and Snowflake.\n- Row-level checksum verification verifying 100% data integrity before DNS cutover.\n- Continuous CDC streaming ensuring zero operational interruption to production ERP modules.`,
      secondary_keywords: ['Data Engineering', 'Snowflake', 'MigrateMax', 'CDC', 'dbt', 'Databricks']
    },
    'generative-ai-agentic-automation': {
      title: 'Deploying Deterministic LLM Agents in Regulated Enterprise Environments',
      slug: 'generative-ai-agentic-automation',
      category_id: 'Generative AI',
      excerpt: 'Building context-aware Retrieval-Augmented Generation (RAG) pipelines with strict data governance and DPDP compliance.',
      published_at: new Date().toISOString(),
      content: `Generative AI offers immense productivity gains for document processing, contract auditing, and technical troubleshooting. However, hallucination risks and data privacy concerns prevent enterprise adoption.\n\nSMRIKAAM's agentic AI framework combines domain-tuned LLMs with vector search, strict role-based access control (RBAC), and deterministic output validation.\n\nArchitecture Highlights:\n- Hybrid vector index (Pinecone/PostgreSQL pgvector) with dense-sparse hybrid retrieval.\n- PII redaction and DPDP compliance guardrails executing on enterprise premises.\n- Multi-agent orchestration for multi-step workflow execution and automated QA verification.`,
      secondary_keywords: ['Generative AI', 'Agentic AI', 'RAG', 'DPDP Compliance', 'LangChain', 'LLM']
    }
  };

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await api.get(`/posts/${slug}`);
        if (res.data && (res.data.status === 'published' || !res.data.status)) {
          setPost(res.data);
          setError(null);
        } else {
          setPost(null);
          setError('The requested article is currently unavailable, in draft, or archived.');
        }
      } catch (err) {
        setPost(null);
        setError('The requested article is currently unavailable, in draft, or archived.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return <div className="font-mono text-sm text-text-muted pt-32 pb-24 text-center">LOADING_ARTICLE...</div>;
  }

  if (error || !post) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-center">
        <BlueprintWrapper className="p-12">
          <div className="font-mono text-xs text-accent uppercase mb-4">404 NOT FOUND</div>
          <h1 className="font-heading text-3xl text-text mb-4">ARTICLE NOT FOUND</h1>
          <p className="text-text-muted mb-6">{error}</p>
          <Link to="/blog" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Journal
          </Link>
        </BlueprintWrapper>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-28 pb-24 px-6 md:px-16 max-w-4xl mx-auto">
      <ReadingProgressBar />

      <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-accent uppercase mb-8 hover:underline font-semibold">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Journal
      </Link>

      <article id="overview" data-scroll-label="ARTICLE">
        <BlueprintWrapper className="service-detail-surface p-8 md:p-12 mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {(post.category || post.category_id) && (
              <span className="tag tag-accent">{post.category || post.category_id}</span>
            )}
            <span className="text-xs text-text-muted flex items-center gap-1 font-normal">
              <Calendar className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              {post.created_at || post.published_at ? new Date(post.created_at || post.published_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <TextReveal
            text={post.title}
            as="h1"
            className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-6 leading-[0.96]"
          />

          {post.excerpt && (
            <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] font-normal border-l-2 border-[var(--color-accent)] pl-4 mb-8 leading-[1.6]">
              {post.excerpt}
            </p>
          )}

          {post.cover_image_url && (
            <Reveal className="mb-10 overflow-hidden border border-border h-80 relative bg-black/5 dark:bg-white/5">
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
            </Reveal>
          )}

          {/* Post Body */}
          {post.content && (
            <div id="content" data-scroll-label="INSIGHTS">
              <Reveal className="mb-12">
                <div className="text-[14px] md:text-[15px] font-normal text-text-muted leading-[1.6] text-left">
                  <RichTextRenderer content={post.content} />
                </div>
              </Reveal>
            </div>
          )}

          {/* Keywords / Tags */}
          {((post.tags && post.tags.length > 0) || (post.secondary_keywords && post.secondary_keywords.length > 0)) && (
            <div className="border-t border-border pt-6 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-accent" strokeWidth={1.5} />
              {(post.tags || post.secondary_keywords).map((kw, i) => (
                <span key={i} className="tag tag-neutral text-xs font-mono font-medium">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </BlueprintWrapper>
      </article>
    </div>
  );
}
