
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

  const src = resolvedTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg';

  return (
    <Link href="/" className={cn('flex items-center gap-3', className)}>
      {mounted ? (
        <Image 
          src={src} 
          alt="Gajanan Motors Logo" 
          width={80} 
          height={60} 
          priority
          className=""
          style={{ width: '60', height: '50' }}
        />
      ) : (
        <div style={{ width: '28px', height: '28px' }} /> // Placeholder to prevent layout shift
      )}
      <span className="font-bold text-xl">Gajanan Motors</span>
    </Link>
  );
}
