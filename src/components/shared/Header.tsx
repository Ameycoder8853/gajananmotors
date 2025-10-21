"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Car } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

// This is a placeholder for auth state. In a real app, you'd use a hook.
const useAuth = () => ({ isAuthenticated: false, user: null });

const navLinks = [
  { href: "/market", label: "Marketplace" },
  { href: "/#features", label: "Features" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 ml-10 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button>Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <Logo />
                </div>
                <nav className="grid gap-4 py-6 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6">
                  {isAuthenticated ? (
                     <div className="grid gap-4">
                        <Button asChild size="lg">
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button variant="outline" size="lg">Logout</Button>
                     </div>
                  ) : (
                    <div className="grid gap-4">
                        <Button asChild size="lg">
                          <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
