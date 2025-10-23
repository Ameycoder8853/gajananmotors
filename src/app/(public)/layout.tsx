import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 container">{children}</main>
      <Footer />
    </>
  );
}
