type JsonLdProps = {
  data: unknown | unknown[];
};

/**
 * Inserta JSON-LD en el HTML para rich results de Google.
 * Soporta uno o varios schemas; cada uno se emite como su propio
 * `<script type="application/ld+json">`. Los `<` se escapan para evitar
 * que cierren accidentalmente la etiqueta de script.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
