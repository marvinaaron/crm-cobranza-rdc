"use client";

import type { Cliente } from "@/lib/clientes";
import { inicialesNombre, tonoAvatarCliente } from "@/lib/cliente-avatar";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "h-10 w-10 text-[12px]",
  md: "h-11 w-11 text-[13px]",
  lg: "h-16 w-16 text-[18px]",
};

type Props = {
  cliente: Pick<Cliente, "id" | "razonSocial" | "fotoPerfilUrl">;
  size?: Size;
  className?: string;
};

export default function AvatarCliente({
  cliente,
  size = "md",
  className = "",
}: Props) {
  const url = cliente.fotoPerfilUrl?.trim();
  return (
    <span
      className={`${SIZE[size]} shrink-0 rounded-full inline-flex items-center justify-center overflow-hidden font-bold ${
        url ? "bg-slate-100" : tonoAvatarCliente(cliente.id)
      } ${className}`}
      aria-hidden
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        inicialesNombre(cliente.razonSocial)
      )}
    </span>
  );
}
