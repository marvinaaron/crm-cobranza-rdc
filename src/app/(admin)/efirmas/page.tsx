import { redirect } from "next/navigation";

/** Compat: /efirmas → /accesos */
export default function EfirmasRedirectPage() {
  redirect("/accesos");
}
