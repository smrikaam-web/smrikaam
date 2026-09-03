import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import BlueprintWrapper from '../components/BlueprintWrapper';

export default function GonePage() {
  useEffect(() => {
    document.title = '410 Gone - Page Removed | SMRIKAAM Technologies';

    // Inject noindex, nofollow meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';

    return () => {
      if (metaRobots) {
        metaRobots.content = 'index, follow';
      }
    };
  }, []);

  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto text-center relative z-10">
      <BlueprintWrapper className="service-detail-surface p-12 md:p-16">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 text-red-500 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="font-mono text-xs text-red-400 uppercase tracking-widest mb-2">410 GONE</div>
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-text mb-4 uppercase">
          PAGE PERMANENTLY REMOVED
        </h1>
        <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto mb-8">
          The requested service page has been intentionally retired and is no longer available. Please refer to SMRIKAAM’s primary Integration Services.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/services/integration-services" className="btn btn-primary">
            View Integration Services
          </Link>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Homepage
          </Link>
        </div>
      </BlueprintWrapper>
    </div>
  );
}
