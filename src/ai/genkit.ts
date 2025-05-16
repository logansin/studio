import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Community plugin for Google AI (Gemini)
import { config } from 'dotenv';

config(); // Load environment variables from .env file

export const ai = genkit({
  plugins: [
    googleAI(), // Assumes GEMINI_API_KEY or GOOGLE_API_KEY is picked from process.env
  ],
  // Specify a default Gemini model
  model: 'gemini-1.5-flash-latest',
});
