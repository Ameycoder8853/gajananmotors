import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
