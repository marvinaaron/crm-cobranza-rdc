"use client";

import { useState } from "react";
import { adminBtnIcono } from "@/components/admin/AdminPageHeading";

export type ItemMenuMas = {
  id: string;
  label: string;
  onClick: () => void;
};

type Props = {
  items: ItemMenuMas[];
  etiqueta?: string;
};

export default function MenuMasAcciones({ items, etiqueta = "Más acciones" }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-haspopup="menu"
        onClick={() => setAbierto((v) => !v)}
        className={adminBtnIcono}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {abierto ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/[0.06] overflow-hidden"
          >
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setAbierto(false);
                  item.onClick();
                }}
                className={`w-full px-4 py-3 text-left text-[15px] text-slate-800 hover:bg-slate-50 ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
