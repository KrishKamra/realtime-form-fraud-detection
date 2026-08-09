import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-900/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SentryForm. Production-grade behavioral security.
          </p>
          <p className="text-[11px] text-slate-600">
            Zero-PII telemetry · Sub-ms ONNX inference · Open source
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/apply"
            className="text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          >
            Apply
          </Link>
          <Link
            href="/dashboard"
            className="text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/KrishKamra/sentry-form"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Source
          </a>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pipeline Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
