'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set a default theme to avoid errors on the server, will be updated on client
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if(resolvedTheme) {
      setTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  const src = theme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg';

  return (
    <Link href="/" className={cn('flex items-center gap-3', className)}>
      {mounted ? (
        <Image 
          src={src} 
          alt="Gajanan Motors Logo" 
          width={60}
          height={50}
          priority
          className="h-auto w-auto"
          style={{ height: '50px', width: 'auto' }}
        />
      ) : (
        <div style={{ width: '60px', height: '50px' }} /> // Placeholder to prevent layout shift
      )}
      <span className="font-bold text-xl">Gajanan Motors</span>
    </Link>
  );
}
