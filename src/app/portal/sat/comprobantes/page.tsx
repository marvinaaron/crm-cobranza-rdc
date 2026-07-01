import { redirect } from "next/navigation";

/** Ruta anterior — redirige a Hacienda · Clientes. */
export default function ComprobantesLegacyPage() {
  redirect("/portal/hacienda/clientes");
}
