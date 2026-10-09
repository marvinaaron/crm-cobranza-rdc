"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { generarAniosDisponibles, type Periodo } from "@/lib/clientes";
import {
  alcanceDesdeRango,
  alcanceInicialCfdi,
  resolverPresetAlcance,
  type AlcancePeriodoCfdi,
  type PresetAlcanceCfdi,
} from "@/lib/cfdi/alcance-periodo";

type AlcanceCfdiContextValue = {
  alcance: AlcancePeriodoCfdi;
  aniosDisponibles: number[];
  setPreset: (preset: Exclude<PresetAlcanceCfdi, "rango">, anioRef?: number) => void;
  setRango: (desde: Periodo, hasta: Periodo) => void;
  setAnioRef: (anio: number) => void;
};

const AlcanceCfdiContext = createContext<AlcanceCfdiContextValue | null>(null);

export function AlcanceCfdiProvider({ children }: { children: ReactNode }) {
  const [alcance, setAlcance] = useState<AlcancePeriodoCfdi>(alcanceInicialCfdi);
  const aniosDisponibles = useMemo(() => generarAniosDisponibles(), []);

  const setPreset = useCallback(
    (preset: Exclude<PresetAlcanceCfdi, "rango">, anioRef?: number) => {
      setAlcance((prev) =>
        resolverPresetAlcance(
          preset,
          new Date(),
          anioRef ?? prev.anioRef ?? prev.hasta.anio
        )
      );
    },
    []
  );

  const setRango = useCallback((desde: Periodo, hasta: Periodo) => {
    setAlcance(alcanceDesdeRango(desde, hasta));
  }, []);

  const setAnioRef = useCallback((anio: number) => {
    setAlcance((prev) => {
      if (prev.preset === "ytd" || prev.preset === "anio_completo") {
        return resolverPresetAlcance(prev.preset, new Date(), anio);
      }
      return prev;
    });
  }, []);

  const value = useMemo(
    () => ({ alcance, aniosDisponibles, setPreset, setRango, setAnioRef }),
    [alcance, aniosDisponibles, setPreset, setRango, setAnioRef]
  );

  return (
    <AlcanceCfdiContext.Provider value={value}>
      {children}
    </AlcanceCfdiContext.Provider>
  );
}

export function useAlcanceCfdi(): AlcanceCfdiContextValue {
  const ctx = useContext(AlcanceCfdiContext);
  if (!ctx) {
    throw new Error("useAlcanceCfdi debe usarse dentro de AlcanceCfdiProvider");
  }
  return ctx;
}
