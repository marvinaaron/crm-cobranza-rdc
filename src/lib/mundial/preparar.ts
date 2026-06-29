import { PARTIDOS } from "@/lib/mundial/datos";
import { prepararPartidosMundial as resolver } from "@/lib/mundial/eliminatoria";
import type { ResultadosMundial } from "@/lib/mundial/resultados";

/** Partidos con marcadores API + cruces de eliminatoria resueltos. */
export function prepararPartidosMundial(resultados: ResultadosMundial) {
  return resolver(PARTIDOS, resultados);
}
