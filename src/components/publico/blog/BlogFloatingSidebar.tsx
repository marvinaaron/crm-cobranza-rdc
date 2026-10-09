"use client";

import { useEffect, useState, useCallback } from "react";

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function CopyLinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function BlogFloatingSidebar({ titulo }: { titulo: string }) {
  const [progreso, setProgreso] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const articulo = document.getElementById("articulo-blog");
    if (!articulo) return;

    let frame = 0;
    const calcular = () => {
      frame = 0;
      const rect = articulo.getBoundingClientRect();
      const alturaViewport = window.innerHeight;
      const total = rect.height - alturaViewport;
      if (total <= 0) {
        setProgreso(rect.top <= 0 ? 100 : 0);
        setShowTop(rect.top < -200);
        return;
      }
      const recorrido = Math.min(Math.max(-rect.top, 0), total);
      setProgreso((recorrido / total) * 100);
      setShowTop(recorrido > 200);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(calcular);
    };

    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const copyLink = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Volver arriba"
        className={`text-slate-400 hover:text-slate-700 transition-all ${
          showTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronUpIcon />
      </button>

      {/* Vertical progress bar */}
      <div className="relative w-1 h-24 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-indigo-500 via-violet-500 to-fuchsia-500 transition-[height] duration-150 ease-out"
          style={{ height: `${progreso}%` }}
        />
      </div>

      {/* Social sharing icons */}
      <div className="flex flex-col items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          aria-label="Compartir en LinkedIn"
          className="text-slate-400 hover:text-[#0A66C2] transition-colors"
        >
          <LinkedInIcon />
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          aria-label="Compartir en Facebook"
          className="text-slate-400 hover:text-[#1877F2] transition-colors"
        >
          <FacebookIcon />
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open(
              `https://api.whatsapp.com/send?text=${encodeURIComponent(titulo + " " + getUrl())}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          aria-label="Compartir en WhatsApp"
          className="text-slate-400 hover:text-[#25D366] transition-colors"
        >
          <WhatsAppIcon />
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copiar enlace"
          className={`transition-colors ${
            copied
              ? "text-emerald-500"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          {copied ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <CopyLinkIcon />
          )}
        </button>
      </div>
    </div>
  );
}
