import { Logo } from "@/components/shared/Logo";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Your trusted partner in buying and selling used cars. Quality vehicles, transparent pricing.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/market" className="text-sm text-muted-foreground hover:text-primary">Marketplace</Link></li>
                <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-primary">Become a Dealer</Link></li>
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link></li>
                <li><Link href="/#contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/shipping-delivery-policy" className="text-sm text-muted-foreground hover:text-primary">Shipping & Delivery</Link></li>
                <li><Link href="/cancellation-refund-policy" className="text-sm text-muted-foreground hover:text-primary">Cancellation & Refund</Link></li>
                <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Gajanan Motors. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
