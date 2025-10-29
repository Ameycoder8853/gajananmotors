import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-4 md:px-8">{children}</main>
      <Footer />
    </div>
  );
}
