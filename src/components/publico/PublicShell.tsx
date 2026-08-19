import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import VolverArriba from "./VolverArriba";
import { getPostsParaNav } from "@/lib/blog/posts";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const blogRecientes = getPostsParaNav(3);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <PublicHeader blogRecientes={blogRecientes} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <VolverArriba />
    </div>
  );
}
