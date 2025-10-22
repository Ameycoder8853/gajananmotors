'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('');
};

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


export function Header() {
  const { user, logout, isUserLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isDashboard = pathname.startsWith('/dashboard');

  const navLinkStyle = (path?: string) => cn(
    "transition-colors",
    (scrolled || pathname !== '/' || isDashboard) ? "text-muted-foreground hover:text-primary" : "text-primary-foreground/80 hover:text-primary-foreground",
    path && pathname === path && "text-primary font-semibold"
  );
  
  const publicNavLinks = [
    { href: '/market', label: 'Marketplace' },
    { href: '/#features', label: 'Features' },
    { href: '/#contact', label: 'Contact' },
  ];
  
  const dealerNavLinks = [
      { href: '/dashboard/my-listings', label: 'My Listings' },
      { href: '/dashboard/verification', label: 'Verification' },
      { href: '/dashboard/subscription', label: 'Subscription' },
  ];

  const adminNavLinks = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/listings', label: 'All Listings' },
      { href: '/dashboard/dealers', label: 'Dealers' },
      { href: '/dashboard/commissions', label: 'Commissions' },
  ]
  
  const getNavLinks = () => {
      if (isDashboard) {
          if (user?.role === 'admin') return adminNavLinks;
          if (user?.role === 'dealer') return dealerNavLinks;
      }
      return publicNavLinks;
  }

  const navLinks = getNavLinks();


  const userMenu = user ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  ) : null;


  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      (scrolled || isDashboard) ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent",
      pathname !== '/' && !isDashboard && "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 ml-10 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkStyle(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <ThemeSwitcher />
          <div className="hidden md:flex items-center space-x-2">
            {!isUserLoading && user ? (
              userMenu
            ) : !isUserLoading ? (
              <>
                <Button asChild variant={(scrolled || pathname !== '/' || isDashboard) ? "ghost" : "outline"} className={cn(!scrolled && pathname === '/' && !isDashboard && "text-white border-white/50 hover:bg-white/10 hover:text-white")}>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : null}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("md:hidden", !scrolled && pathname === '/' && !isDashboard && "text-white border-white/50 hover:bg-white/10 hover:text-white")}>
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
                  {user && (
                     <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                        Dashboard
                      </Link>
                  )}
                </nav>
                <div className="mt-auto border-t pt-6">
                  {!isUserLoading && user ? (
                     <div className="grid gap-4">
                       <div className="flex items-center gap-4 px-2.5">
                          <Avatar>
                            <AvatarImage src={user.photoURL ?? ''} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.displayName}</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                       </div>
                        <Button onClick={logout} variant="outline" size="lg">Logout</Button>
                     </div>
                  ) : !isUserLoading ? (
                    <div className="grid gap-4">
                        <Button asChild size="lg">
                          <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
