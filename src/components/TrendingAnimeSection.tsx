
import type { AnimeRecommendation } from '@/lib/types';
import { AnimeCard } from './AnimeCard';
import { Flame } from 'lucide-react';

export const trendingAnimeData: AnimeRecommendation[] = [
  {
    title: "Магическая битва",
    genre: "Экшен, Тёмное фэнтези, Сёнэн",
    synopsis: "Юдзи Итадори — необычайно сильный старшеклассник, живущий обычной жизнью. Однажды, чтобы спасти друга, на которого напало проклятие, он съедает палец Двуликого Сукуны, сильнейшего из проклятий, и сам становится проклятым. С этого момента Юдзи делит тело с Сукуной и поступает в Токийский магический колледж, организацию, борющуюся с проклятиями.",
    coverImage: "https://media.kitsu.app/anime/poster_images/42937/large.jpg",
    dataAiHint: "Jujutsu Kaisen dark fantasy",
    popularityReason: "Захватывающие бои и уникальная система проклятой энергии.",
    episodes: "24 + Фильм + 2 сезон (23)",
    status: "Выходит 2 сезон",
    ageRating: "R - 17+",
    detailsLink: "https://kitsu.io/anime/jujutsu-kaisen-tv",
    kitsuApprovalRating: "86%"
  },
  {
    title: "Семья шпиона",
    genre: "Комедия, Экшен, Повседневность",
    synopsis: "Шпион мирового класса под кодовым именем «Сумрак» должен выполнить сверхсекретную миссию по предотвращению войны. Ему нужно создать фальшивую семью, чтобы подобраться к своей цели. Он удочеряет девочку-телепата Аню и заключает фиктивный брак с наёмной убийцей Йор, не подозревая об их истинных личностях.",
    coverImage: "https://media.kitsu.app/anime/poster_images/44809/large.jpg",
    dataAiHint: "Spy x Family comedy action",
    popularityReason: "Очаровательные персонажи и идеальный баланс комедии и экшена.",
    episodes: "25 + 12",
    status: "Завершён (2 сезона)",
    ageRating: "PG-13",
    detailsLink: "https://kitsu.io/anime/spy-x-family",
    kitsuApprovalRating: "88%"
  },
  {
    title: "Человек-бензопила",
    genre: "Экшен, Тёмное фэнтези, Ужасы",
    synopsis: "Дэндзи — молодой человек, живущий в нищете и обременённый долгами своего покойного отца. Он работает охотником на демонов для якудза вместе со своим псом-демоном Почитой. После предательства Дэндзи сливается с Почитой, превращаясь в Человека-бензопилу — гибрида человека и демона с бензопилами вместо конечностей.",
    coverImage: "https://media.kitsu.app/anime/poster_images/43806/large.jpg",
    dataAiHint: "Chainsaw Man action horror",
    popularityReason: "Мрачный юмор, безумный экшен и непредсказуемый сюжет.",
    episodes: "12",
    status: "Завершён (1 сезон)",
    ageRating: "R - 17+",
    detailsLink: "https://kitsu.io/anime/chainsaw-man",
    kitsuApprovalRating: "84%"
  },
   {
    title: "Ребёнок айдола", // Oshi no Ko
    genre: "Драма, Сверхъестественное, Детектив",
    synopsis: "Гинеколог Горо Амамия и его недавно умершая пациентка Сараса перерождаются близнецами у популярной 16-летней поп-идола Ай Хосино. Горо (теперь Аквамарин) и Сараса (теперь Руби) пытаются ориентироваться в жестоком мире шоу-бизнеса, одновременно расследуя тайну смерти своей матери.",
    coverImage: "https://media.kitsu.app/anime/poster_images/46046/large.jpg",
    dataAiHint: "Oshi no Ko drama idol",
    popularityReason: "Интригующий взгляд на индустрию развлечений и неожиданные повороты.",
    episodes: "11",
    status: "Завершён (1 сезон), анонсирован 2 сезон",
    ageRating: "PG-13",
    detailsLink: "https://kitsu.io/anime/oshi-no-ko",
    kitsuApprovalRating: "89%"
  },
  {
    title: "Code Geass: Lelouch of the Rebellion",
    genre: "Экшен, Фантастика, Драма, Меха",
    synopsis: "В альтернативной временной линии Священная Британская Империя завоевала Японию, переименовав её в Зону 11. Лелуш Ламперуж, изгнанный британский принц, получает сверхъестественную силу 'Гиасс' от таинственной девушки C.C. Используя эту силу, он начинает восстание против империи под маской загадочного Зеро.",
    coverImage: "https://media.kitsu.app/anime/poster_images/1415/large.jpg",
    dataAiHint: "Code Geass mecha drama",
    popularityReason: "Сложный главный герой, стратегические битвы и моральные дилеммы.",
    episodes: "25 (1 сезон) + 25 (2 сезон) + фильмы",
    status: "Завершён",
    ageRating: "R - 17+",
    detailsLink: "https://kitsu.io/anime/code-geass-lelouch-of-the-rebellion",
    kitsuApprovalRating: "92%"
  }
];

interface TrendingAnimeSectionProps {
  onCardClick: (anime: AnimeRecommendation) => void;
}

export function TrendingAnimeSection({ onCardClick }: TrendingAnimeSectionProps) {
  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start mb-5 sm:mb-6">
          <div className="flex items-center">
            <Flame size={20} className="mr-2 text-accent" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Популярное Аниме</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Примечание: Эта подборка популярных аниме формируется ИИ.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {trendingAnimeData.map((anime) => (
            <AnimeCard key={anime.title + "-trending"} anime={anime} isTrending={true} onCardClick={onCardClick} />
          ))}
        </div>
      </div>
    </section>
  );
}
