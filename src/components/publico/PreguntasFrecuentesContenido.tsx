"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
} from "lucide-react";
import { FAQ_PUBLICAS } from "@/lib/faq-publicas";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import FaqTemaFigura from "./FaqTemaFigura";
import "./preguntas-frecuentes.css";

const TEMAS = [
  { id: "precio", label: "Precio", indices: [0, 16, 12, 6, 9], Icon: CircleDollarSign },
  { id: "cambio", label: "Cambio", indices: [1, 13, 10, 11], Icon: ArrowRightLeft },
  { id: "sat", label: "SAT", indices: [2, 14, 7, 8], Icon: CalendarDays },
  { id: "portal", label: "Portal", indices: [5, 20, 17, 18, 19, 15, 3, 4], Icon: LayoutDashboard },
] as const;

type TemaId = (typeof TEMAS)[number]["id"];

export default function PreguntasFrecuentesContenido() {
  const [tema, setTema] = useState<TemaId>("precio");
  const [abierta, setAbierta] = useState(0);
  const [clip, setClip] = useState("inset(0 75% 0 0 round 999px)");
  const teclado = useRef(false);
  const pista = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const actual = TEMAS.find((t) => t.id === tema) ?? TEMAS[0];
  const preguntas = actual.indices.map((i) => ({
    i,
    ...FAQ_PUBLICAS[i],
  }));

  function medirClip(indice: number) {
    const track = pista.current;
    const tab = tabs.current[indice];
    if (!track || !tab) return;
    const t = track.getBoundingClientRect();
    const b = tab.getBoundingClientRect();
    const left = Math.max(0, b.left - t.left);
    const right = Math.max(0, t.right - b.right);
    setClip(`inset(0 ${right}px 0 ${left}px round 999px)`);
  }

  useLayoutEffect(() => {
    const i = TEMAS.findIndex((t) => t.id === tema);
    medirClip(i < 0 ? 0 : i);
    const track = pista.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const j = TEMAS.findIndex((t) => t.id === tema);
      medirClip(j < 0 ? 0 : j);
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, [tema]);

  function irTema(id: TemaId, conTeclado = false) {
    teclado.current = conTeclado;
    setTema(id);
    setAbierta(0);
    const i = TEMAS.findIndex((t) => t.id === id);
    requestAnimationFrame(() => medirClip(i < 0 ? 0 : i));
  }

  function irPregunta(indice: number, conTeclado = false) {
    teclado.current = conTeclado;
    setAbierta(indice);
  }

  function onTeclaTabs(e: React.KeyboardEvent) {
    const i = TEMAS.findIndex((t) => t.id === tema);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = TEMAS[(i + 1) % TEMAS.length];
      irTema(next.id, true);
      tabs.current[(i + 1) % TEMAS.length]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = TEMAS[(i - 1 + TEMAS.length) % TEMAS.length];
      irTema(prev.id, true);
      tabs.current[(i - 1 + TEMAS.length) % TEMAS.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      irTema(TEMAS[0].id, true);
      tabs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      irTema(TEMAS[TEMAS.length - 1].id, true);
      tabs.current[TEMAS.length - 1]?.focus();
    }
  }

  function onTeclaLista(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      irPregunta((abierta + 1) % preguntas.length, true);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      irPregunta((abierta - 1 + preguntas.length) % preguntas.length, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      irPregunta(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      irPregunta(preguntas.length - 1, true);
    }
  }

  const instant = teclado.current;

  return (
    <div className="faq-page">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <h1 className="text-[clamp(2.5rem,5vw,4.25rem)] font-black tracking-tight leading-[0.92] text-slate-900">
          <span className="faq-line">
            <span data-line style={{ "--i": 0 } as React.CSSProperties}>
              Antes de
            </span>
          </span>
          <span className="faq-line">
            <span
              data-line
              className="faq-grad"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              cambiarte
            </span>
          </span>
        </h1>
        <p
          className="faq-rise mt-8 max-w-[40ch] text-[17px] leading-snug text-[var(--faq-soft)]"
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          Cuatro temas. Toca una pregunta y se abre ahí mismo.
        </p>

        <div
          className="faq-rise mt-8"
          style={{ "--d": "480ms" } as React.CSSProperties}
        >
          <div
            ref={pista}
            className="faq-tabs"
            role="tablist"
            aria-label="Temas"
            onKeyDown={onTeclaTabs}
          >
            <div className="faq-tabs-row">
              {TEMAS.map((t, i) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={tema === t.id}
                  aria-controls={`faq-panel-${t.id}`}
                  id={`faq-tab-${t.id}`}
                  className="faq-press faq-tab faq-tab-base"
                  onClick={() => irTema(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div
              className="faq-tabs-on"
              aria-hidden
              style={{ clipPath: clip }}
            >
              <div className="faq-tabs-row">
                {TEMAS.map((t) => (
                  <span key={t.id} className="faq-tab faq-tab-on flex items-center justify-center">
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="faq-rise mt-6"
          style={{ "--d": "520ms" } as React.CSSProperties}
        >
          <FaqTemaFigura tema={actual.id} instant={instant} />
        </div>

        <div
          id={`faq-panel-${actual.id}`}
          role="tabpanel"
          aria-labelledby={`faq-tab-${actual.id}`}
          className="mt-6"
          onKeyDown={onTeclaLista}
        >
          {preguntas.map((faq, idx) => {
            const on = abierta === idx;
            const Icono = actual.Icon;
            return (
              <div
                key={`${actual.id}-${faq.i}`}
                className={`faq-item ${on ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`faq-a-${faq.i}`}
                  id={`faq-q-${faq.i}`}
                  onClick={() => irPregunta(idx)}
                  className="faq-press faq-q"
                >
                  <span className="faq-ico">
                    <Icono size={15} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="faq-q-txt">{faq.pregunta}</span>
                </button>
                <div
                  id={`faq-a-${faq.i}`}
                  role="region"
                  aria-labelledby={`faq-q-${faq.i}`}
                  className={`faq-cuerpo ${on ? "is-open" : ""} ${instant ? "is-instant" : ""}`}
                >
                  <div className="faq-cuerpo-inner">
                    <p className="faq-a">
                      {faq.respuesta}
                      {faq.enlace ? (
                        <>
                          {" "}
                          <Link href={faq.enlace.href} className="faq-a-link">
                            {faq.enlace.label}
                          </Link>
                          .
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-24 sm:mt-28" aria-labelledby="faq-tuya">
          <h2 id="faq-tuya" className="text-[26px] font-medium leading-tight">
            <span className="block text-[var(--faq-soft)]">Si no está arriba,</span>
            <span className="block text-marca-navy">escríbenos.</span>
          </h2>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={CONTACTO_PUBLICO.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="faq-press inline-flex h-11 items-center justify-center rounded-full bg-marca-navy px-5 text-[15px] font-bold text-white hover:bg-marca-navy-soft"
            >
              WhatsApp
            </a>
            <Link
              href="/cotizar"
              className="faq-press inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[15px] font-bold text-marca-navy hover:bg-marca-navy/5"
            >
              Cotizar
            </Link>
            <Link
              href="/contacto"
              className="faq-press inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-bold text-marca-navy hover:underline"
            >
              Contacto
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
