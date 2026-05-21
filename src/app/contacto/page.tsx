import PublicShell from "@/components/publico/PublicShell";
import ContactoSection from "@/components/publico/ContactoSection";

export const metadata = {
  title: "Contacto · RDC Contadores",
  description:
    "Escríbenos por correo o WhatsApp. Respondemos en menos de 24 horas hábiles.",
};

export default function ContactoPage() {
  return (
    <PublicShell>
      <ContactoSection />
    </PublicShell>
  );
}
