import { MetadataRoute } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Helper function to initialize Firestore outside of a React component
let db: import('firebase/firestore').Firestore;
try {
  const { firestore } = initializeFirebase();
  db = firestore;
} catch (e) {
  console.error("Failed to initialize Firestore for sitemap generation:", e);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Static pages
  const staticRoutes = [
    '',
    '/market',
    '/subscription',
    '/login',
    '/signup',
    '/terms-of-service',
    '/privacy-policy',
    '/cancellation-refund-policy',
    '/shipping-delivery-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));


  // 2. Dynamic pages (car listings)
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  if (db) {
      try {
        const adsCollection = collection(db, 'cars');
        const adsQuery = query(adsCollection, where('visibility', '==', 'public'));
        const adsSnapshot = await getDocs(adsQuery);
      
        adsSnapshot.forEach((doc) => {
          dynamicRoutes.push({
            url: `${baseUrl}/market/${doc.id}`,
            lastModified: (doc.data().updatedAt?.toDate() || doc.data().createdAt?.toDate() || new Date()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        });

      } catch (error) {
          console.error("Error fetching car listings for sitemap:", error);
      }
  }


  return [...staticRoutes, ...dynamicRoutes];
}
