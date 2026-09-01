import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import BlueprintWrapper from '../components/BlueprintWrapper';
import TextReveal from '../components/anim/TextReveal';
import BannerDrawBorder from '../components/anim/BannerDrawBorder';
import Reveal from '../components/anim/Reveal';
import RichTextRenderer from '../components/RichTextRenderer';

export default function Blog() {
  const { posts: rawPosts, isLoaded } = useCMS() || {};

  const posts = useMemo(() => {
    if (!Array.isArray(rawPosts)) return [];
    return rawPosts;
  }, [rawPosts]);

  const loading = !isLoaded;

  return (
    <div className="relative z-10 pt-28 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div id="overview" data-scroll-label="INSIGHTS" className="page-title-surface relative border border-border p-8 md:p-12 mb-16 overflow-hidden">
        <BannerDrawBorder />
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
            JOURNAL &amp; ENGINEERING ARCHITECTURE
          </div>
          <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
            ARTICLES
          </div>
        </div>

        <TextReveal
          text="TECHNICAL PERSPECTIVES FROM THE FRONTLINE."
          as="h1"
          className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96] mb-4"
        />
        <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl border-l-2 border-[var(--color-accent)] pl-4 font-normal leading-[1.6]">
          Deep-dives into IIoT telemetry architectures, zero-downtime database migrations, deterministic LLM pipelines, and production engineering best practices.
        </p>
      </div>

      {loading ? (
        <div className="font-mono text-sm text-text-muted py-12 text-center">LOADING_JOURNAL...</div>
      ) : posts.length === 0 ? (
        <div className="font-mono text-sm text-text-muted py-12 text-center">NO_PUBLISHED_POSTS_FOUND</div>
      ) : (
        <div id="articles" data-scroll-label="ARTICLES" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Reveal key={post.id} index={idx}>
              <BlueprintWrapper className="card group hover:border-accent h-full">
                {post.cover_image_url && (
                  <div className="overflow-hidden border-b border-border mb-6 -mx-6 -mt-6 h-56 relative bg-black/5 dark:bg-white/5">
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover duotone" />
                    {post.category_id && (
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-bg/90 border border-border px-3 py-1 font-mono text-[13px] text-accent font-medium backdrop-blur-sm">
                        {post.category_id}
                      </div>
                    )}
                  </div>
                )}
                <div className="card-kicker font-mono text-[13px] font-medium text-accent uppercase tracking-[0.18em]">ARTICLE • {post.slug}</div>
                <h2 className="card-title text-xl md:text-2xl font-semibold uppercase group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <div className="card-body text-[15px] font-normal text-text-muted leading-[1.55] mb-6">
                    <RichTextRenderer content={post.excerpt} />
                  </div>
                )}

                <div className="card-meta text-[14px]">
                  <Link to={`/blog/${post.slug}`} className="btn btn-ghost p-0 text-accent font-mono text-[14px] uppercase font-medium flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                  <span className="font-normal text-text-muted">{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'RECENT'}</span>
                </div>
              </BlueprintWrapper>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
