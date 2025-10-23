
'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, limit, getDoc, doc } from 'firebase/firestore';
import { AdCard } from '../market/AdCard';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FeaturedCars() {
  const firestore = useFirestore();
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  
  const adsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'cars'), where('visibility', '==', 'public'), limit(4));
  }, [firestore]);

  const { data: ads, isLoading } = useCollection<Ad>(adsQuery);

  useEffect(() => {
    if (ads && firestore) {
      const fetchDealers = async () => {
        const adsWithDealerInfo = await Promise.all(
          ads.map(async (ad) => {
            const dealerRef = doc(firestore, 'users', ad.dealerId);
            const dealerSnap = await getDoc(dealerRef);
            return {
              ...ad,
              dealer: dealerSnap.exists() ? dealerSnap.data() : undefined
            };
          })
        );
        setFeaturedAds(adsWithDealerInfo);
      };
      fetchDealers();
    }
  }, [ads, firestore]);

  return (
    <section className="py-16 sm:py-24 bg-secondary">
      <div className="px-8">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Featured Listings
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Get a glimpse of the quality cars available in our marketplace right now.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                </div>
            ))
          ) : (
            featuredAds.map((ad, index) => (
              <div key={ad.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <AdCard ad={ad} />
              </div>
            ))
          )}
        </div>
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/market">
                    View All Cars <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
