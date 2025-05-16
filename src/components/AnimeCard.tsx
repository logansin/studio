
"use client";

import type { AnimeRecommendation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface AnimeCardProps {
  anime: AnimeRecommendation;
  isTrending?: boolean;
  onCardClick?: (anime: AnimeRecommendation) => void;
}

export function AnimeCard({ anime, isTrending = false, onCardClick }: AnimeCardProps) {
  const [currentCoverImage, setCurrentCoverImage] = useState(anime.coverImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentCoverImage(anime.coverImage);
    setImageError(false);
  }, [anime.coverImage, anime.title]);

  const genres = anime.genre?.split(',').map(g => g.trim()).filter(g => g) || [];
  const dataAiHintText = anime.dataAiHint?.trim() || anime.title?.substring(0, 20) || "anime art";

  const handleImageError = () => {
    if (!imageError) {
      console.warn(`Error loading image: ${currentCoverImage}. Falling back to placeholder div.`);
      setImageError(true);
    }
  };

  const showPlaceholderDiv = imageError || !currentCoverImage;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(anime);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCardClick}
      className="group relative mx-auto flex aspect-[2/3] w-full flex-col overflow-hidden rounded-xl bg-muted shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl dark:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={`Подробнее о ${anime.title || 'аниме'}`}
    >
      {/* Image or Placeholder Background */}
      {!showPlaceholderDiv && currentCoverImage ? (
        <Image
          src={currentCoverImage}
          alt={`Обложка для ${anime.title || 'аниме'}`}
          fill
          className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={handleImageError}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          priority={isTrending}
        />
      ) : (
        <div
          className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-secondary p-2"
          data-ai-hint={dataAiHintText}
        >
          <p className="text-xs text-secondary-foreground/70 text-center break-words">
            {dataAiHintText}
          </p>
        </div>
      )}

      {/* Gradient Overlay and Text Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 mt-auto flex flex-col bg-gradient-to-t from-black/90 via-black/70 to-transparent px-2.5 pb-2.5 pt-16">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {anime.title || "Без названия"}
        </h3>
        {genres.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-nowrap rounded-md bg-white/20 px-1.5 py-0.5 text-[0.65rem] font-medium text-white backdrop-blur-sm border-transparent hover:bg-white/30"
              >
                {g}
              </Badge>
            ))}
          </div>
        )}
        {isTrending && anime.popularityReason && (
          <p className="mt-1.5 line-clamp-2 text-[0.7rem] text-white/80">
            {anime.popularityReason}
          </p>
        )}
      </div>

      {isTrending && (
         <div className="absolute top-1.5 right-1.5 z-20">
          <Badge className="bg-accent text-accent-foreground text-xs py-0.5 px-1.5 flex items-center shadow-md">
            <Star size={10} className="mr-1 fill-current" />
            В тренде
          </Badge>
        </div>
      )}
    </button>
  );
}
