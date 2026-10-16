import Link from "next/link";
import Logo from "@/components/publico/Logo";
import {
  ligaLoginComprobantePortal,
  type TipoLigaComprobante,
} from "@/lib/portal/liga-comprobante";

type Props = {
  clienteId: number | null;
  tipo: TipoLigaComprobante;
};

export default function SubirPagoLanding({ clienteId, tipo }: Props) {
  const href = ligaLoginComprobantePortal(clienteId, tipo);
  const deHonorarios = tipo === "honorarios";

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 gap-6"
      style={{
        background: "#f2f2f7",
        ["--portal-navy" as string]: "#1a164d",
      }}
    >
      <Link href="/" aria-label="RDC Contadores">
        <Logo mark="rdc" variante="black" alto={36} className="opacity-90" />
      </Link>

      <div className="w-full max-w-[420px] rounded-[1.75rem] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)] ring-1 ring-slate-200 p-6 sm:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Portal de clientes
        </p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-slate-900 leading-tight">
          Sube tu captura de pago
        </h1>
        <p className="mt-2 text-[15px] text-slate-500 leading-relaxed">
          {deHonorarios
            ? "Si ya transferiste o pagaste con tarjeta, súbelo aquí (foto o PDF) para que tu contador lo valide."
            : "Si ya pagaste tus impuestos, súbelo aquí (foto o PDF) para que tu contador lo valide."}
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-100 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-2.5">
            Transferencia · tarjeta · wallets
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <img src="/og-pago/chip-bbva.png" alt="BBVA" className="h-9 w-auto" />
            <img src="/og-pago/chip-spei.png" alt="SPEI" className="h-9 w-auto" />
            <img src="/og-pago/chip-apple-pay.png" alt="Apple Pay" className="h-9 w-auto" />
            <img src="/og-pago/chip-google-pay.png" alt="Google Pay" className="h-9 w-auto" />
          </div>
        </div>

        <a
          href={href}
          className="mt-6 flex items-center justify-center w-full py-3.5 rounded-xl bg-[var(--portal-navy)] text-white text-[15px] font-semibold hover:bg-[#231f55] transition-colors"
        >
          Ir a subir comprobante
        </a>
        <p className="mt-3 text-[13px] text-slate-400 text-center leading-relaxed">
          Entras a tu portal y tocas Subir comprobante. Si no recuerdas tu
          acceso, avísale a tu contador.
        </p>
      </div>
    </div>
  );
}
