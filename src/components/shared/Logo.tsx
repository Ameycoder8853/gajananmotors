'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const src = resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg';

  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      {mounted ? (
        <Image 
          src={src} 
          alt="Gajanan Motors Logo" 
          width={180} 
          height={40} 
          priority
          className="h-7 w-auto"
        />
      ) : (
        <div style={{ width: '180px', height: '28px' }} /> // Placeholder to prevent layout shift
      )}
    </Link>
  );
}
