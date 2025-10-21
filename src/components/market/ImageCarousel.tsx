"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type ImageCarouselProps = {
  images: string[];
  title: string;
};

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden">
                <CardContent className="p-0 aspect-video relative flex items-center justify-center">
                  <Image
                    src={src}
                    alt={`${title} - image ${index + 1}`}
                    width={1200}
                    height={800}
                    className="object-cover w-full h-full"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {count}
      </div>
      <div className="flex gap-2 justify-center mt-2">
        {images.map((_, index) => (
             <button key={index} onClick={() => api?.scrollTo(index)} className="w-full">
                 <Card className={`overflow-hidden transition-opacity ${index === current - 1 ? 'opacity-100 border-primary' : 'opacity-50 hover:opacity-75'}`}>
                     <CardContent className="p-0 aspect-video relative">
                         <Image src={images[index]} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                     </CardContent>
                 </Card>
             </button>
        ))}
      </div>
    </div>
  );
}
