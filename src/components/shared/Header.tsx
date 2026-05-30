'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun, MapPin } from 'lucide-react';
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
import { useLocation } from '@/hooks/use-location';
import { LocationSelector } from './LocationSelector';


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
      className="w-9 h-9"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}


export function Header() {
  const { user, isUserLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { location } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([
    { href: '/market', label: 'Marketplace' },
    { href: '/#features', label: 'Features' },
    { href: '/#contact', label: 'Contact' },
    { href: '/subscription', label: 'Subscription' }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    const onHashChange = () => {
        setActiveHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    
    setActiveHash(window.location.hash);

    if (!isUserLoading) {
      if (user) {
        if (user.role === 'admin') {
          setNavLinks([
            { href: '/admin/listings', label: 'All Listings' },
            { href: '/admin/dealers', label: 'Dealers' },
            { href: '/market', label: 'Market View' },
          ]);
        } else { // 'dealer'
          setNavLinks([
            { href: '/market', label: 'Marketplace' },
            { href: '/dashboard/my-listings', label: 'My Listings' },
            { href: '/#features', label: 'Features' },
            { href: '/#contact', label: 'Contact' },
            { href: '/subscription', label: 'Subscription' },
            { href: '/dashboard/verification', label: 'Verification' }
          ]);
        }
      } else {
        setNavLinks([
            { href: '/market', label: 'Marketplace' },
            { href: '/#features', label: 'Features' },
            { href: '/#contact', label: 'Contact' },
            { href: '/subscription', label: 'Subscription' }
        ]);
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [user, isUserLoading]);
  
  const isMarketingPage = pathname === '/';
  
  const headerClasses = cn(
    "sticky top-0 z-50 w-full transition-all duration-300",
    scrolled || !isMarketingPage
      ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      : "bg-transparent"
  );
  
  const linkColor = "text-foreground";
  
  const activeLinkColor = (isMarketingPage && !scrolled)
      ? "text-primary font-bold"
      : "text-primary";

  
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
    <>
    <header className={headerClasses}>
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Logo className="scale-90 sm:scale-100" />
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navLinks.map((link) => {
              const isActive = (pathname === link.href) || (isMarketingPage && link.href.startsWith('/#') && activeHash === link.href.substring(1));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                      "relative transition-colors text-sm font-medium whitespace-nowrap",
                      linkColor,
                      "hover:text-primary",
                      isActive && activeLinkColor
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in"></span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
           <Button 
            variant="ghost" 
            onClick={() => setIsLocationSelectorOpen(true)} 
            className="h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium"
           >
             <MapPin className="h-4 w-4 sm:mr-2" />
             <span className="hidden sm:inline truncate max-w-[100px]">{location.city || 'Location'}</span>
             <span className="sm:hidden">{location.city ? location.city.substring(0, 3) + '..' : 'Loc'}</span>
           </Button>
           
           <ThemeSwitcher />
           
          <div className="hidden md:flex items-center space-x-2">
            {!isUserLoading && user ? (
              <>
              {user.role === 'admin' && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              {userMenu}
              </>
            ) : !isUserLoading ? (
              <>
                <Button asChild variant={(isMarketingPage && !scrolled) ? "outline" : "ghost"} size="sm">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : <div className='h-8 w-8' />}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden w-9 h-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
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
                   {user?.role === 'admin' && (
                     <Link
                      href="/admin"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                      Admin Panel
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
                        <div className="grid grid-cols-2 gap-2">
                           <Button asChild variant="outline" size="lg">
                              <Link href="/dashboard/settings">Settings</Link>
                           </Button>
                           <Button onClick={logout} variant="outline" size="lg">Logout</Button>
                        </div>
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
    <LocationSelector open={isLocationSelectorOpen} onOpenChange={setIsLocationSelectorOpen} />
    </>
  );
}
