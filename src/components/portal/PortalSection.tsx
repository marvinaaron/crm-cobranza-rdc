import { type ReactNode } from "react";
import { portalCard, portalCardTitle } from "./portal-ui";

type Props = {
  title?: string;
  titleClassName?: string;
  children: ReactNode;
  className?: string;
};

export default function PortalSection({
  title,
  titleClassName,
  children,
  className = "",
}: Props) {
  return (
    <section className={`${portalCard} ${className}`}>
      {title && (
        <p className={`${portalCardTitle} mb-4 ${titleClassName ?? ""}`}>{title}</p>
      )}
      {children}
    </section>
  );
}
