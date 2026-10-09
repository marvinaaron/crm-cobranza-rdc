"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Props = {
  open: boolean;
  /** Archivo original que eligió el usuario. */
  file: File | null;
  /** Llamado con el blob recortado (JPEG cuadrado). */
  onConfirmar: (blob: Blob) => Promise<void> | void;
  onCancelar: () => void;
};

/**
 * Modal para recortar/encuadrar una foto antes de subirla.
 *
 * - Vista cuadrada con guía circular (los avatares son redondos).
 * - Zoom y arrastre.
 * - Devuelve un JPEG de 512×512 px (peso pequeño, calidad suficiente para avatar).
 */
const SALIDA_PX = 512;

export default function CropAvatarModal({
  open,
  file,
  onConfirmar,
  onCancelar,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPx, setAreaPx] = useState<Area | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaPx(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setAreaPx(area);
  }, []);

  async function confirmar() {
    if (!imageUrl || !areaPx) return;
    setProcesando(true);
    try {
      const blob = await recortar(imageUrl, areaPx);
      await onConfirmar(blob);
    } finally {
      setProcesando(false);
    }
  }

  if (!open || !file || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !procesando) onCancelar();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Foto de perfil
          </p>
          <h2 className="text-lg font-black text-slate-800">
            Encuadra tu foto
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Arrastra para mover · usa el zoom para acercar
          </p>
        </div>

        <div className="relative w-full aspect-square bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-600"
              disabled={procesando}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelar}
              disabled={procesando}
              className="rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmar()}
              disabled={procesando || !areaPx}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {procesando ? "Subiendo…" : "Usar esta foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toma la imagen original y un área (en px del original) y devuelve un
 * blob JPEG cuadrado de SALIDA_PX×SALIDA_PX.
 */
async function recortar(src: string, area: Area): Promise<Blob> {
  const img = await cargarImagen(src);
  const canvas = document.createElement("canvas");
  canvas.width = SALIDA_PX;
  canvas.height = SALIDA_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el lienzo.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    SALIDA_PX,
    SALIDA_PX
  );
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo generar la imagen."));
        else resolve(blob);
      },
      "image/jpeg",
      0.9
    );
  });
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen."));
    img.src = src;
  });
}
