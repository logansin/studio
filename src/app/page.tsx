
"use client";

import { useState, useEffect } from 'react';
import { QuizForm } from '@/components/QuizForm';
import { AnimeCard } from '@/components/AnimeCard';
import { AnimeDetailDialog } from '@/components/AnimeDetailDialog';
import { TrendingAnimeSection } from '@/components/TrendingAnimeSection';
import type { AnimeRecommendation } from '@/lib/types';
import { Loader2, ListX, SearchCheck, WandSparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateRandomAnime } from '@/ai/flows/generateRandomAnime';
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [recommendations, setRecommendations] = useState<AnimeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [recommendationType, setRecommendationType] = useState<'quiz' | 'summoned' | null>(null);
  const { toast } = useToast();

  const [selectedAnime, setSelectedAnime] = useState<AnimeRecommendation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Load recommendations from localStorage on initial mount
  useEffect(() => {
    try {
      const storedRecommendations = localStorage.getItem('animeRecommendations');
      const storedRecommendationType = localStorage.getItem('animeRecommendationType') as ('quiz' | 'summoned' | null);

      if (storedRecommendations) {
        setRecommendations(JSON.parse(storedRecommendations));
      }
      if (storedRecommendationType) {
        setRecommendationType(storedRecommendationType);
      }
    } catch (error) {
      // console.error("Error loading from localStorage:", error);
      // Clear potentially corrupted localStorage items
      localStorage.removeItem('animeRecommendations');
      localStorage.removeItem('animeRecommendationType');
    }
  }, []);

  // Save recommendations to localStorage whenever they change
  useEffect(() => {
    try {
      if (recommendations.length > 0 || recommendationType) {
        localStorage.setItem('animeRecommendations', JSON.stringify(recommendations));
        if (recommendationType) {
          localStorage.setItem('animeRecommendationType', recommendationType);
        } else {
          localStorage.removeItem('animeRecommendationType'); // Remove if null
        }
      } else {
        // Clear localStorage if there are no recommendations and no type
        localStorage.removeItem('animeRecommendations');
        localStorage.removeItem('animeRecommendationType');
      }
    } catch (error) {
      // console.error("Error saving to localStorage:", error);
    }
  }, [recommendations, recommendationType]);


  const handleCardClick = (anime: AnimeRecommendation) => {
    setSelectedAnime(anime);
    setIsDetailDialogOpen(true);
  };

  const handleQuizComplete = (newRecommendations: AnimeRecommendation[]) => {
    setRecommendations(newRecommendations);
    setIsLoading(false);
    setRecommendationType('quiz');
    setActiveTab("recommendations"); 
    if (newRecommendations.length > 0) {
      toast({
        title: "Рекомендации готовы!",
        description: `Мы нашли ${newRecommendations.length} аниме специально для вас.`,
      });
      setTimeout(() => {
        const resultsElement = document.getElementById('recommendations-section');
        resultsElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
       toast({
        title: "Увы, пусто...",
        description: "По вашим критериям подходящих аниме не найдено. Попробуйте изменить ответы!",
        variant: "default",
      });
    }
  };

  const handleSummonAnime = async () => {
    setIsLoading(true);
    setRecommendations([]); 
    setRecommendationType(null); 
    
    try {
      const result = await generateRandomAnime();
      if (result && result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
        setRecommendationType('summoned');
        toast({
          title: "Аниме Призвано!",
          description: `Мы наколдовали ${result.recommendations.length} случайных аниме для вас.`,
        });
      } else {
        setRecommendations([]);
        setRecommendationType('summoned'); 
        toast({
          title: "Магия не сработала",
          description: "Не удалось призвать случайные аниме. Похоже, духи аниме сегодня не в настроении. Попробуйте еще раз!",
          variant: "default",
        });
      }
    } catch (error: any) {
      setRecommendations([]); 
      setRecommendationType('summoned');
      toast({
        title: "Ошибка магии",
        description: error.message || "Произошла ошибка при попытке призвать аниме. Пожалуйста, проверьте консоль.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setActiveTab("recommendations"); 
      if (recommendations.length > 0 || (recommendationType === 'summoned' && recommendations.length === 0) ) {
        setTimeout(() => {
            const resultsElement = document.getElementById('recommendations-section');
            resultsElement?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      }
    }
  };

  const handleLoadingChange = (loadingState: boolean) => {
    setIsLoading(loadingState);
  };

  const handleStartQuiz = () => {
    setRecommendations([]); 
    setRecommendationType(null);
    localStorage.removeItem('animeRecommendations'); // Clear stored on starting new quiz
    localStorage.removeItem('animeRecommendationType');
    setActiveTab("quiz");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRecommendationTitle = () => {
    if (recommendationType === 'quiz') return "Ваши Персональные Рекомендации";
    if (recommendationType === 'summoned') return "Призванные Аниме";
    return "Рекомендации";
  }

  // Effect to clear recommendations if user switches to quiz tab and there were summoned recommendations
  useEffect(() => {
    if (activeTab === 'quiz' && recommendationType === 'summoned') {
      setRecommendations([]);
      setRecommendationType(null);
      localStorage.removeItem('animeRecommendations');
      localStorage.removeItem('animeRecommendationType');
    }
  }, [activeTab, recommendationType]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 pt-6 pb-6 sm:pt-8 sm:pb-8 flex flex-col">
        <div className="mb-6 text-left">
          <h1 className="text-4xl font-bold text-primary-foreground">AniRec</h1>
          <p className="text-lg text-white dark:text-slate-300 mt-1">Открой для себя следующее любимое аниме!</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8 sm:mb-10">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/30 dark:bg-card/30"> {/* Removed backdrop-blur-sm */}
            <TabsTrigger value="recommendations">✨ Рекомендации</TabsTrigger>
            <TabsTrigger value="quiz">📝 Пройти Опрос</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations">
            <Card className="shadow-xl rounded-xl bg-card/50 dark:bg-card/60"> {/* Removed backdrop-blur-sm */}
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-semibold text-center text-foreground">
                  {(recommendations.length > 0 && recommendationType) ? getRecommendationTitle() : "Магия Аниме Ждет!"}
                </CardTitle>
                {!(recommendations.length > 0 && recommendationType) && !isLoading && (
                   <CardDescription className="text-center text-muted-foreground">
                    Нажмите кнопку ниже, чтобы призвать случайные аниме, или пройдите опрос для точных рекомендаций!
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div id="loading-section" className="flex flex-col items-center justify-center text-center py-10 sm:py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Колдуем рекомендации...</p>
                  </div>
                )}

                {!isLoading && !(recommendations.length > 0 && recommendationType) && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Button onClick={handleSummonAnime} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-accent/50 transform hover:scale-105 transition-all duration-300">
                      <WandSparkles size={24} className="mr-2.5" />
                      Призвать Аниме!
                    </Button>
                  </div>
                )}
                
                {!isLoading && (recommendations.length > 0 || (recommendationType && recommendations.length === 0)) && ( // Show section if there are recommendations OR if a type is set (e.g. summoned but no results)
                  <section id="recommendations-section" className="mt-2 mb-6">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <div className="flex items-center mb-3 sm:mb-0">
                            <SearchCheck size={22} className="mr-2 text-primary" />
                            <h3 className="text-xl sm:text-2xl font-semibold text-foreground">{getRecommendationTitle()}</h3>
                        </div>
                         <div className="flex items-center gap-2">
                            {recommendationType === 'summoned' && (
                                <Button onClick={handleSummonAnime} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <WandSparkles size={16} className="mr-1.5" />
                                    Призвать еще
                                </Button>
                            )}
                            <Button 
                              onClick={handleStartQuiz} 
                              variant={recommendationType === 'quiz' ? "default" : "outline"} 
                              size="sm" 
                              className={`${recommendationType === 'quiz' ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-card/70 hover:bg-card/90"}`}
                            >
                                {recommendationType === 'quiz' ? "Пройти опрос заново" : "Уточнить (опрос)"}
                            </Button>
                        </div>
                    </div>
                    {recommendations.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {recommendations.map((anime, index) => (
                          <AnimeCard
                            key={anime.title + (recommendationType || '') + index}
                            anime={anime}
                            onCardClick={handleCardClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-10 bg-card/60 p-6 rounded-lg shadow-inner">
                        <ListX className="h-12 w-12 text-destructive mb-4" />
                        <p className="text-lg text-card-foreground">Рекомендаций не найдено.</p>
                        <p className="text-sm text-muted-foreground">
                          {recommendationType === 'quiz'
                            ? "Мы не смогли найти рекомендации по вашему опросу. Попробуйте изменить свои предпочтения."
                            : "Мы не смогли призвать случайные аниме. Попробуйте еще раз."}
                        </p>
                      </div>
                    )}
                  </section>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <QuizForm
              onQuizComplete={handleQuizComplete}
              onLoadingChange={handleLoadingChange}
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-8 sm:my-10 bg-border/50" />
        <TrendingAnimeSection onCardClick={handleCardClick} />
      </main>
      <footer className="text-center py-4 sm:py-5 border-t border-border/30 bg-background/30 dark:bg-background/50"> {/* Removed backdrop-blur-sm */}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AniRec. Все права защищены. Данные об аниме могут быть получены из различных API.
        </p>
        <p className="text-xs text-muted-foreground mt-1 px-4">
          Примечание: Изображения и информация об аниме предоставляются ИИ и могут не всегда точно соответствовать действительности или друг другу по неизвестным причинам.
        </p>
      </footer>
      {selectedAnime && (
        <AnimeDetailDialog
          anime={selectedAnime}
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </div>
  );
}
