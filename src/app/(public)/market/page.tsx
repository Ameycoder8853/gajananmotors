'use client';

import { AdCard } from "@/components/market/AdCard";
import { AdFilters } from "@/components/market/AdFilters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collectionGroup, query, where, getDoc, doc } from "firebase/firestore";
import type { Ad, User } from "@/lib/types";
import { useEffect, useState } from "react";

export default function MarketPage() {
  const firestore = useFirestore();
  const [adsWithDealers, setAdsWithDealers] = useState<Ad[]>([]);
  
  const adsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'ads'), where('visibility', '==', 'public'));
  }, [firestore]);

  const { data: ads, isLoading: areAdsLoading } = useCollection<Ad>(adsQuery);

  useEffect(() => {
    if (ads && firestore) {
      const fetchDealers = async () => {
        const adsWithDealerInfo = await Promise.all(
          ads.map(async (ad) => {
            if (ad.dealerId) {
              const dealerRef = doc(firestore, 'users', ad.dealerId);
              const dealerSnap = await getDoc(dealerRef);
              if (dealerSnap.exists()) {
                return { ...ad, dealer: dealerSnap.data() as User };
              }
            }
            return ad;
          })
        );
        setAdsWithDealers(adsWithDealerInfo);
      };
      fetchDealers();
    }
  }, [ads, firestore]);

  const isLoading = areAdsLoading || (ads && ads.length > 0 && adsWithDealers.length === 0);

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Car Marketplace</h1>
        <p className="mt-2 text-lg text-muted-foreground">Browse and find your dream car from our trusted dealers.</p>
      </div>

      <AdFilters />

      <div className="flex justify-between items-center my-6">
        <p className="text-sm text-muted-foreground">Showing {adsWithDealers.length} results</p>
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="year-desc">Year: Newest First</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {isLoading ? (
         <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adsWithDealers.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}


      <Pagination className="mt-12">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
