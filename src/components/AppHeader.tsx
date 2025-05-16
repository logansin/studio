
import { Clapperboard } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-3 sm:py-4 bg-primary/40 dark:bg-primary/30 shadow-lg"> {/* Removed backdrop-blur-md */}
      <div className="container mx-auto flex items-center justify-center px-4">
        <Clapperboard size={28} className="text-primary-foreground mr-2.5 drop-shadow-md sm:size-32" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight drop-shadow-md">
          AniRec
        </h1>
      </div>
      <p className="text-center text-primary-foreground/90 mt-1 text-xs sm:text-sm drop-shadow-sm">
        Откройте для себя следующее любимое аниме!
      </p>
    </header>
  );
}
