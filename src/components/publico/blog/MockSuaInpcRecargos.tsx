"use client";

import ActualizarInpcRecargosSua from "@/components/publico/ActualizarInpcRecargosSua";

/**
 * Embed del buscador SUA (mes + año → recargos e INPC) dentro de un artículo.
 */
export default function MockSuaInpcRecargos({
  origen = "blog-sua",
}: {
  origen?: "blog-sua" | "blog-inpc";
}) {
  return (
    <figure className="my-8">
      <ActualizarInpcRecargosSua origen={origen} />
    </figure>
  );
}
