
'use server';

/**
 * @fileOverview A flow to generate anime recommendations based on user quiz answers, using OpenRouter API.
 *
 * - generateAnimeRecommendations - A function that handles the anime recommendation generation process.
 * - GenerateAnimeRecommendationsInput - The input type for the generateAnimeRecommendations function.
 * - GenerateAnimeRecommendationsOutput - The return type for the generateAnimeRecommendations function.
 */

import {ai}from '@/ai/genkit';
import {z} from 'genkit';
import type { AnimeRecommendation } from '@/lib/types';

const GenerateAnimeRecommendationsInputSchema = z.object({
  quizAnswers: z
    .array(z.string())
    .describe('Массив строк, представляющих ответы пользователя на опрос о предпочтениях в аниме.'),
  preferences: z.string().describe('Сводка предпочтений пользователя в аниме.'),
});
export type GenerateAnimeRecommendationsInput = z.infer<
  typeof GenerateAnimeRecommendationsInputSchema
>;

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

const GenerateAnimeRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(AnimeRecommendationDetailsSchema)
    .describe('Массив рекомендаций аниме на основе ответов пользователя на опрос.'),
});
export type GenerateAnimeRecommendationsOutput = z.infer<
  typeof GenerateAnimeRecommendationsOutputSchema
>;

export async function generateAnimeRecommendations(
  input: GenerateAnimeRecommendationsInput
): Promise<GenerateAnimeRecommendationsOutput> {
  return generateAnimeRecommendationsFlow(input);
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'deepseek/deepseek-chat';

const generateAnimeRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateAnimeRecommendationsFlow',
    inputSchema: GenerateAnimeRecommendationsInputSchema,
    outputSchema: GenerateAnimeRecommendationsOutputSchema,
  },
  async (input: GenerateAnimeRecommendationsInput): Promise<GenerateAnimeRecommendationsOutput> => {
    console.log("Запуск потока generateAnimeRecommendationsFlow с данными:", input);
    const systemPrompt = `Вы — экспертная система рекомендаций аниме. Вы принимаете ответы пользователя на опрос и его предпочтения и возвращаете персонализированные рекомендации аниме.
Ваш ответ ДОЛЖЕН быть JSON объектом. Этот объект должен содержать одно поле с ключом "recommendations".
Значением поля "recommendations" должен быть массив объектов.
Каждый объект в массиве должен представлять рекомендуемое аниме и иметь СЛЕДУЮЩИЕ КЛЮЧИ СТРОГО на английском языке: "title", "genre", "synopsis", ОБЯЗАТЕЛЬНОЕ поле "dataAiHint", и НЕОБЯЗАТЕЛЬНЫЕ поля "coverImage", "episodes", "status", "ageRating", "detailsLink", "kitsuApprovalRating".
Значения для ключей "title", "synopsis", "genre", "episodes", "status", "ageRating", "kitsuApprovalRating" должны быть на русском языке.
Значение для "genre", если жанров несколько, перечислите их через запятую (например, 'Экшен, Комедия').
Значение для "dataAiHint" ДОЛЖНО БЫТЬ строкой из одного или двух ключевых слов на английском языке, описывающих изображение или тематику аниме (например, "action anime", "fantasy world", "school life"). Это поле должно быть заполнено всегда, даже если "coverImage" отсутствует.
Значение для "coverImage" (если предоставляется) ДОЛЖНО БЫТЬ ПОЛНЫМ URL-адресом изображения (начинающимся с http:// или https://) ИСКЛЮЧИТЕЛЬНО с сайта media.kitsu.app. Если не можете найти надежный URL с media.kitsu.app, ПРОПУСТИТЕ это поле или установите его значение равным пустой строке. НЕ ИСПОЛЬЗУЙТЕ другие домены.
Значение для "detailsLink" (если предоставляется) должно быть ПОЛНЫМ URL-адресом на страницу аниме на авторитетном сайте типа Kitsu, AniList или MyAnimeList.
Значение для "kitsuApprovalRating" (если предоставляется) должно быть строкой, представляющей процент одобрения на Kitsu (например, '78%'). Если недоступно, ПРОПУСТИТЕ это поле.
Постарайтесь предоставить как можно больше дополнительной информации (episodes, status, ageRating, detailsLink, kitsuApprovalRating).
Обязательно предоставьте от 3 до 5 рекомендаций, если это возможно на основе предпочтений. Если подходящих рекомендаций нет, верните пустой массив для "recommendations".`;

    const userPrompt = `Ответы на опрос: ${input.quizAnswers.join('; ')}
Предпочтения пользователя: ${input.preferences}

Пример объекта для одного аниме (с coverImage с media.kitsu.app и полной доп. информацией):
{
  "title": "Название аниме на русском",
  "genre": "Экшен, Фэнтези",
  "synopsis": "Описание сюжета на русском.",
  "coverImage": "https://media.kitsu.app/anime/poster_images/1415/medium.jpg",
  "dataAiHint": "adventure fantasy",
  "episodes": "25",
  "status": "Завершён",
  "ageRating": "R - 17+",
  "detailsLink": "https://kitsu.io/anime/code-geass-lelouch-of-the-rebellion",
  "kitsuApprovalRating": "92%"
}
Пример объекта для одного аниме (БЕЗ coverImage и БЕЗ kitsuApprovalRating, но с обязательным dataAiHint и другой доп. информацией):
{
  "title": "Другое аниме",
  "genre": "Повседневность, Романтика",
  "synopsis": "Другое описание сюжета.",
  "dataAiHint": "slice of life romance",
  "episodes": "12",
  "status": "Выходит",
  "ageRating": "PG-13",
  "detailsLink": "https://anilist.co/anime/12345"
}
Пример объекта для аниме БЕЗ coverImage, БЕЗ detailsLink и БЕЗ kitsuApprovalRating:
{
  "title": "Еще одно аниме",
  "genre": "Драма",
  "synopsis": "Очень драматичное описание.",
  "dataAiHint": "drama emotional",
  "episodes": "Фильм",
  "status": "Завершён",
  "ageRating": "PG-13"
}

Пожалуйста, сгенерируй ответ в формате JSON.`;

    try {
      console.log('Отправка запроса к OpenRouter API с моделью:', MODEL_NAME);
      const refererUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://your-production-app-url.com');
      const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || 'AniRec';
      console.log('Referer:', refererUrl);
      console.log('Title:', appTitle);

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
          temperature: 0.7,
          max_tokens: 1800, // Уменьшено с 2500
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Ошибка API OpenRouter:', response.status, errorBody);
        throw new Error(`Запрос к API OpenRouter завершился с ошибкой ${response.status}: ${errorBody}`);
      }

      const responseData = await response.json();
      console.log('Получен ответ от OpenRouter:', JSON.stringify(responseData, null, 2));


      if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message || !responseData.choices[0].message.content) {
        console.error('Некорректная структура ответа от OpenRouter:', responseData);
        return { recommendations: [] };
      }

      const contentStr = responseData.choices[0].message.content;
      console.log('Строка контента от LLM:', contentStr);

      let parsedContent;
      try {
        parsedContent = JSON.parse(contentStr);
      } catch (e) {
        console.warn("Не удалось напрямую распарсить строку контента LLM как JSON, попытка извлечь из Markdown:", contentStr);
        const jsonMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
            console.log('Успешно распарсен JSON из Markdown.');
          } catch (e2) {
            console.error("Не удалось распарсить извлеченный JSON из Markdown:", jsonMatch[1], e2);
            return { recommendations: [] };
          }
        } else {
          console.error("Контент не является валидным JSON и не в ожидаемом формате Markdown:", contentStr);
          return { recommendations: [] };
        }
      }
      
      console.log('Распарсенный контент от LLM:', JSON.stringify(parsedContent, null, 2));

      const validationResult = GenerateAnimeRecommendationsOutputSchema.safeParse(parsedContent);

      if (!validationResult.success) {
        console.error("Ошибка валидации Zod для вывода LLM:", JSON.stringify(validationResult.error.issues, null, 2));
        if (parsedContent && Array.isArray(parsedContent.recommendations)) {
             console.warn("Ошибка валидации Zod, но массив 'recommendations' существует. Используются потенциально неполные/невалидные данные.");
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
             console.log("Санированные рекомендации:", sanitizedRecommendations.length);
             return { recommendations: sanitizedRecommendations };
        }
        console.warn("Возвращаются пустые рекомендации из-за ошибки валидации Zod и несовместимой структуры.");
        return { recommendations: [] };
      }

      console.log("Рекомендации успешно распарсены и валидированы. Количество:", validationResult.data.recommendations.length);
      validationResult.data.recommendations.forEach(rec => {
        console.log(`  - Title: ${rec.title}, CoverImage: ${rec.coverImage || 'N/A'}, DataAiHint: ${rec.dataAiHint}, KitsuRating: ${rec.kitsuApprovalRating || 'N/A'}`);
        if (!rec.dataAiHint || rec.dataAiHint.trim() === '') {
            console.warn(`  WARN: Аниме "${rec.title}" не имеет dataAiHint! Устанавливается значение по умолчанию.`);
            rec.dataAiHint = rec.title ? rec.title.substring(0,20).trim().toLowerCase().replace(/\s+/g, ' ') : "anime art";
        }
      });
      return validationResult.data;

    } catch (error: any) {
      console.error('Ошибка в потоке generateAnimeRecommendationsFlow:', error.message, error.stack);
      return { recommendations: [] };
    }
  }
);
