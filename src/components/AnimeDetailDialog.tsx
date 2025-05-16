
"use client";

import type { AnimeRecommendation } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { ExternalLink, Tv, CalendarDays, AlertCircle, X, ThumbsUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnimeDetailDialogProps {
  anime: AnimeRecommendation | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AnimeDetailDialog({ anime, isOpen, onOpenChange }: AnimeDetailDialogProps) {
  if (!anime) return null;

  const genres = anime.genre?.split(',').map(g => g.trim()).filter(g => g) || [];
  const dataAiHintText = anime.dataAiHint?.trim() || anime.title?.substring(0, 20) || "anime art";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">{anime.title}</DialogTitle>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-1">
              {anime.coverImage ? (
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={anime.coverImage}
                    alt={`Обложка для ${anime.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    onError={(e) => {
                      // console.warn(`Next/Image error for ${anime.coverImage}, host might be misconfigured or image unavailable.`); // Removed
                      const target = e.target as HTMLImageElement;
                      // Fallback to a dummy image if the provided coverImage fails and it's not already a dummyimage
                      if (!target.src.includes('dummyimage.com')) {
                        target.src = `https://dummyimage.com/300x450/e0e0e0/343a40.png&text=${encodeURIComponent(dataAiHintText)}`;
                        target.srcset = ""; 
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg bg-secondary flex items-center justify-center" data-ai-hint={dataAiHintText}>
                   <Image
                    src={`https://dummyimage.com/300x450/e0e0e0/343a40.png&text=${encodeURIComponent(dataAiHintText)}`}
                    alt={`Заглушка для ${anime.title}: ${dataAiHintText}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Жанры:</h4>
                {genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">{g}</Badge>
                    ))}
                  </div>
                ) : <p className="text-sm text-foreground">Не указаны</p>}
              </div>

              {anime.synopsis && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Описание:</h4>
                  <DialogDescription className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {anime.synopsis}
                  </DialogDescription>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
                {anime.kitsuApprovalRating && (
                  <div className="flex items-center">
                    <ThumbsUp size={18} className="mr-2 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Рейтинг Kitsu:</p>
                      <p className="text-sm font-medium text-foreground">{anime.kitsuApprovalRating}</p>
                    </div>
                  </div>
                )}
                {anime.episodes && (
                  <div className="flex items-center">
                    <Tv size={18} className="mr-2 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Серии:</p>
                      <p className="text-sm font-medium text-foreground">{anime.episodes}</p>
                    </div>
                  </div>
                )}
                {anime.status && (
                  <div className="flex items-center">
                    <CalendarDays size={18} className="mr-2 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Статус:</p>
                      <p className="text-sm font-medium text-foreground">{anime.status}</p>
                    </div>
                  </div>
                )}
                {anime.ageRating && (
                  <div className="flex items-center">
                    <AlertCircle size={18} className="mr-2 text-primary" />
                     <div>
                      <p className="text-xs text-muted-foreground">Рейтинг:</p>
                      <p className="text-sm font-medium text-foreground">{anime.ageRating}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t flex flex-row justify-between items-center">
          {anime.detailsLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={anime.detailsLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                Узнать больше
              </a>
            </Button>
          )}
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
