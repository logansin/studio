
export interface QuizQuestionOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'checkbox' | 'radio' | 'text';
  options?: QuizQuestionOption[];
  fieldName: string; // Corresponds to react-hook-form field name
  required?: boolean;
  description?: string; // Optional description for the question
}

export interface AnimeRecommendation {
  title: string;
  genre: string;
  synopsis: string;
  coverImage?: string; // URL - truly optional
  dataAiHint: string; // For image search/placeholder hint - required
  popularityReason?: string; // Optional reason for why it's popular, for trending section
  episodes?: string; // e.g., "12", "24", "Ongoing"
  status?: string; // e.g., "Finished Airing", "Currently Airing"
  ageRating?: string; // e.g., "PG-13", "R - 17+"
  detailsLink?: string; // URL to a detailed page (Kitsu, AniList, MAL)
  kitsuApprovalRating?: string; // e.g., "85%"
}

// Used for the form data structure
export type QuizFormData = Record<string, string | string[] | undefined>;
