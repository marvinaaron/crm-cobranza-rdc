"use client";

import { useCallback, useState } from "react";
import ChecklistAutocalificacion, {
  type ChecklistEstado,
} from "@/components/publico/ChecklistAutocalificacion";
import EmpezarForm from "@/components/publico/EmpezarForm";
import type { TonoUrgencia } from "@/lib/autocalificacion-urgencia";

/**
 * Layout cotizar: checklist (urgencia, opcional) a la izquierda + formulario a la derecha.
 * El CTA de color envía la cotización; sin checks no se bloquea el envío.
 */
export default function EmpezarCotizarSection() {
  const [tono, setTono] = useState<TonoUrgencia>("neutro");
  const [items, setItems] = useState<string[]>([]);

  const onChecklist = useCallback((estado: ChecklistEstado) => {
    setTono(estado.tono);
    setItems(estado.items);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      <div>
        <ChecklistAutocalificacion ocultarCta onChange={onChecklist} />
      </div>
      <div className="lg:sticky lg:top-24">
        <EmpezarForm tono={tono} checklistItems={items} embebido />
      </div>
    </div>
  );
}
