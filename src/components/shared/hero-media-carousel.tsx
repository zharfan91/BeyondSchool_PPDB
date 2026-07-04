"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroMediaSlide {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

interface HeroMediaCarouselProps {
  slides: HeroMediaSlide[];
  intervalMs?: number;
  className?: string;
}

export function HeroMediaCarousel({ slides, intervalMs = 5000, className }: HeroMediaCarouselProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const current = slides[active];

  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-container-low shadow-xl">
        {slides.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              i === active ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
          <p className="text-xs uppercase tracking-widest opacity-80">{current.title}</p>
          <h3 className="text-lg font-bold">{current.subtitle}</h3>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Tampilkan slide ${i + 1}: ${slide.title}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-8 bg-primary" : "w-2 bg-outline-variant hover:bg-primary/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
