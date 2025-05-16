
'use server';

/**
 * @fileOverview A flow to generate a few random anime suggestions.
 *
 * - generateRandomAnime - A function that handles random anime suggestion generation.
 * - GenerateRandomAnimeOutput - The return type, reuses GenerateAnimeRecommendationsOutput.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnimeRecommendation } from '@/lib/types'; // Using the direct type from lib

// We can reuse the output schema from the other flow as it fits our needs
const AnimeRecommendationDetailsSchema = z.object({
  title: z.string().describe('Название аниме (на русском).'),
  genre: z.string().describe("Жанр(ы) аниме (на русском). Если жанров несколько, перечислите их через запятую (например, 'Экшен, Комедия')."),
  synopsis: z.string().describe('Краткое описание сюжета аниме (на русском).'),
  coverImage: z.string().url().optional().describe('ПОЛНЫЙ URL-адрес обложки аниме (начинающийся с http:// или https://) ИСКЛЮЧИТЕЛЬНО с сайта media.kitsu.app. Постарайтесь найти наиболее качественную и релевантную обложку. Если вы АБСОЛЮТНО не можете найти надежный URL-адрес обложки с media.kitsu.app, ПРОПУСТИТЕ это поле или установите его значение равным пустой строке. НЕ ИСПОЛЬЗУЙТЕ другие домены.'),
  dataAiHint: z.string().min(1).describe('ОБЯЗАТЕЛЬНО: Одно или два ключевых слова на английском языке для поиска обложки или для отображения на заглушке (например, "action anime" или "fantasy character"). Это поле должно быть заполнено всегда.'),
  episodes: z.string().optional().describe('Количество серий (например, "12", "24", "Фильм", "Продолжается").'),
  status: z.string().optional().describe('Статус выхода (например, "Завершён", "Выходит", "Анонсирован").'),
  ageRating: z.string().optional().describe('Возрастной рейтинг (например, "PG-13", "R - 17+", "Для всех возрастов").'),
  detailsLink: z.string().url().optional().describe('Ссылка на страницу с подробной информацией об аниме на авторитетном сайте (например, Kitsu, AniList, MyAnimeList).'),
  kitsuApprovalRating: z.string().optional().describe('Рейтинг одобрения с Kitsu (например, "85%"). Если недоступно, пропустите это поле.'),
});

const GenerateRandomAnimeOutputSchema = z.object({
  recommendations: z
    .array(AnimeRecommendationDetailsSchema)
    .describe('Массив из 3-5 случайных рекомендаций аниме.'),
});
export type GenerateRandomAnimeOutput = z.infer<typeof GenerateRandomAnimeOutputSchema>;


export async function generateRandomAnime(): Promise<GenerateRandomAnimeOutput> {
  return generateRandomAnimeFlow({}); // Pass an empty object
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'deepseek/deepseek-chat';

const generateRandomAnimeFlow = ai.defineFlow(
  {
    name: 'generateRandomAnimeFlow',
    inputSchema: z.object({}), // Changed from z.undefined()
    outputSchema: GenerateRandomAnimeOutputSchema,
  },
  async (_input: Record<string, never>): Promise<GenerateRandomAnimeOutput> => { // Adjusted input type
    console.log("Запуск потока generateRandomAnimeFlow...");
    const systemPrompt = `Ты — генератор случайных рекомендаций аниме. Твоя задача — предложить 3-5 совершенно случайных, но существующих аниме.
Твой ответ ДОЛЖЕН быть JSON объектом. Этот объект должен содержать одно поле с ключом "recommendations".
Значением поля "recommendations" должен быть массив из 3-5 объектов.
Каждый объект в массиве должен представлять рекомендуемое аниме и иметь СЛЕДУЮЩИЕ КЛЮЧИ СТРОГО на английском языке: "title", "genre", "synopsis", ОБЯЗАТЕЛЬНОЕ поле "dataAiHint", и НЕОБЯЗАТЕЛЬНЫЕ поля "coverImage", "episodes", "status", "ageRating", "detailsLink", "kitsuApprovalRating".
Значения для ключей "title", "synopsis", "genre", "episodes", "status", "ageRating", "kitsuApprovalRating" должны быть на русском языке.
Значение для "genre", если жанров несколько, перечислите их через запятую (например, 'Экшен, Комедия').
Значение для "dataAiHint" ДОЛЖНО БЫТЬ строкой из одного или двух ключевых слов на английском языке, описывающих изображение или тематику аниме (например, "action anime", "fantasy world", "school life"). Это поле должно быть заполнено всегда, даже если "coverImage" отсутствует.
Значение для "coverImage" (если предоставляется) ДОЛЖНО БЫТЬ ПОЛНЫМ URL-адресом изображения (начинающимся с http:// или https://) ИСКЛЮЧИТЕЛЬНО с сайта media.kitsu.app. Если не можете найти надежный URL с media.kitsu.app, ПРОПУСТИТЕ это поле или установите его значение равным пустой строке. НЕ ИСПОЛЬЗУЙТЕ другие домены.
Значение для "detailsLink" (если предоставляется) должно быть ПОЛНЫМ URL-адресом на страницу аниме на авторитетном сайте типа Kitsu, AniList или MyAnimeList.
Значение для "kitsuApprovalRating" (если предоставляется) должно быть строкой, представляющей процент одобрения на Kitsu (например, '78%'). Если недоступно, ПРОПУСТИТЕ это поле.
Постарайтесь предоставить как можно больше дополнительной информации (episodes, status, ageRating, detailsLink, kitsuApprovalRating).
Предложи разнообразные и интересные варианты.`;

    const userPrompt = `Пожалуйста, сгенерируй 3-5 случайных рекомендаций аниме в формате JSON.

Пример объекта для одного аниме (с coverImage с media.kitsu.app и полной доп. информацией):
{
  "title": "Случайное Название Аниме",
  "genre": "Экшен, Фэнтези",
  "synopsis": "Описание сюжета на русском.",
  "coverImage": "https://media.kitsu.app/anime/poster_images/43806/medium.jpg",
  "dataAiHint": "action fantasy",
  "episodes": "25",
  "status": "Завершён",
  "ageRating": "R - 17+",
  "detailsLink": "https://kitsu.io/anime/chainsaw-man",
  "kitsuApprovalRating": "92%"
}
Пример объекта для одного аниме (БЕЗ coverImage и БЕЗ kitsuApprovalRating, но с обязательным dataAiHint и другой доп. информацией):
{
  "title": "Другое Случайное Название",
  "genre": "Повседневность",
  "synopsis": "Другое случайное описание.",
  "dataAiHint": "slice of life comedy",
  "episodes": "12",
  "status": "Выходит",
  "ageRating": "PG-13",
  "detailsLink": "https://anilist.co/anime/123456"
}`;

    try {
      const refererUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://your-production-app-url.com');
      const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || 'AniRec';
      
      console.log('Отправка запроса к OpenRouter API (random anime) с моделью:', MODEL_NAME);
      console.log('Referer:', refererUrl, 'Title:', appTitle);

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': refererUrl,
          'X-Title': appTitle,
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 1500, // Уменьшено с 2000
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Ошибка API OpenRouter (random anime):', response.status, errorBody);
        throw new Error(`Запрос к API OpenRouter для случайных аниме завершился с ошибкой ${response.status}: ${errorBody}`);
      }

      const responseData = await response.json();
      console.log('Получен ответ от OpenRouter (random anime):', JSON.stringify(responseData, null, 2));


      if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message || !responseData.choices[0].message.content) {
        console.error('Некорректная структура ответа от OpenRouter (random anime):', responseData);
        return { recommendations: [] };
      }

      const contentStr = responseData.choices[0].message.content;
      console.log('Строка контента от LLM (random anime):', contentStr);

      let parsedContent;
      try {
        parsedContent = JSON.parse(contentStr);
      } catch (e) {
        console.warn("Не удалось напрямую распарсить строку контента LLM (random anime) как JSON, попытка извлечь из Markdown:", contentStr);
        const jsonMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
            console.log('Успешно распарсен JSON из Markdown (random anime).');
          } catch (e2) {
            console.error("Не удалось распарсить извлеченный JSON из Markdown (random anime):", jsonMatch[1], e2);
            return { recommendations: [] };
          }
        } else {
          console.error("Контент (random anime) не является валидным JSON и не в ожидаемом формате Markdown.", contentStr);
          return { recommendations: [] };
        }
      }
      
      console.log('Распарсенный контент от LLM (random anime):', JSON.stringify(parsedContent, null, 2));

      const validationResult = GenerateRandomAnimeOutputSchema.safeParse(parsedContent);

      if (!validationResult.success) {
        console.error("Ошибка валидации Zod для вывода LLM (random anime):", JSON.stringify(validationResult.error.issues, null, 2));
         if (parsedContent && Array.isArray(parsedContent.recommendations)) {
             console.warn("Ошибка валидации Zod (random anime), но массив 'recommendations' существует. Используются потенциально неполные/невалидные данные.");
             const sanitizedRecommendations: AnimeRecommendation[] = parsedContent.recommendations.map((rec: any) => ({
                title: typeof rec.title === 'string' ? rec.title : "Название отсутствует",
                genre: typeof rec.genre === 'string' ? rec.genre : "Жанр отсутствует",
                synopsis: typeof rec.synopsis === 'string' ? rec.synopsis : "Описание отсутствует",
                coverImage: typeof rec.coverImage === 'string' && rec.coverImage.startsWith('http') ? rec.coverImage : undefined,
                dataAiHint: typeof rec.dataAiHint === 'string' && rec.dataAiHint.trim() !== '' ? rec.dataAiHint.trim() : (typeof rec.title === 'string' && rec.title.trim() !== '' ? rec.title.substring(0,20).trim().toLowerCase().replace(/\s+/g, ' ') : "anime art"),
                episodes: typeof rec.episodes === 'string' ? rec.episodes : undefined,
                status: typeof rec.status === 'string' ? rec.status : undefined,
                ageRating: typeof rec.ageRating === 'string' ? rec.ageRating : undefined,
                detailsLink: typeof rec.detailsLink === 'string' && rec.detailsLink.startsWith('http') ? rec.detailsLink : undefined,
                kitsuApprovalRating: typeof rec.kitsuApprovalRating === 'string' ? rec.kitsuApprovalRating : undefined,
             }));
             console.log("Санированные рекомендации (random anime):", sanitizedRecommendations.length);
             return { recommendations: sanitizedRecommendations };
        }
        console.warn("Возвращаются пустые случайные рекомендации из-за ошибки валидации Zod и несовместимой структуры.");
        return { recommendations: [] };
      }
      
      console.log("Рекомендации (random anime) успешно распарсены и валидированы. Количество:", validationResult.data.recommendations.length);
      validationResult.data.recommendations.forEach(rec => {
        if (!rec.dataAiHint || rec.dataAiHint.trim() === '') {
            console.warn(`  WARN (random anime): Аниме "${rec.title}" не имеет dataAiHint! Устанавливается значение по умолчанию.`);
            rec.dataAiHint = rec.title ? rec.title.substring(0,20).trim().toLowerCase().replace(/\s+/g, ' ') : "random anime";
        }
      });
      return validationResult.data;

    } catch (error: any) {
      console.error('Ошибка в потоке generateRandomAnimeFlow:', error.message, error.stack);
      return { recommendations: [] };
    }
  }
);

