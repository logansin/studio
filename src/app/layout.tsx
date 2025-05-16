
'use client';

import type { Metadata } from 'next'; // Metadata type can still be imported
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/*
// Static metadata export is not directly supported in Client Component layouts.
// You might need to use the generateMetadata API if you need to set metadata here.
// For reference, this was the previous metadata object:
export const metadata: Metadata = {
  title: 'AniRec - Рекомендации Аниме',
  description: 'Найдите персонализированные рекомендации аниме с помощью быстрого опроса.',
};
*/

const backgroundImages = [
  { url: 'https://placehold.co/1920x1080/2c3e50/ffffff', hint: 'night city anime' }, // Dark blue-grey, white text
  { url: 'https://placehold.co/1920x1080/87ceeb/333333', hint: 'sky clouds anime' }, // Sky blue, dark grey text
  { url: 'https://placehold.co/1920x1080/34495e/ecf0f1', hint: 'fantasy landscape anime' }, // Wet asphalt, light grey text
  { url: 'https://placehold.co/1920x1080/9b59b6/fdfefe', hint: 'magic forest anime' }, // Amethyst, near white text
  { url: 'https://placehold.co/1920x1080/f1c40f/2c3e50', hint: 'action explosion anime' }, // Sunflower, dark blue-grey text
  { url: 'https://placehold.co/1920x1080/e74c3c/ffffff', hint: 'sakura blossoms anime' }, // Pomegranate, white text
  { url: 'https://placehold.co/1920x1080/1abc9c/34495e', hint: 'school rooftop anime' }, // Turquoise, wet asphalt text
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentBgState, setCurrentBgState] = useState({
    url: backgroundImages[0].url,
    hint: backgroundImages[0].hint,
  });

  useEffect(() => {
    // Preload images for smoother transitions
    backgroundImages.forEach(image => {
      const img = new Image();
      img.src = image.url;
    });

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % backgroundImages.length;
      setCurrentBgState({
        url: backgroundImages[currentIndex].url,
        hint: backgroundImages[currentIndex].hint,
      });
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <html lang="ru">
      <head>
        {/* You can place basic meta tags here if needed, or use generateMetadata */}
        <title>AniRec - Рекомендации Аниме</title>
        <meta name="description" content="Найдите персонализированные рекомендации аниме с помощью быстрого опроса." />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen dynamic-body-background`}
        style={{
          backgroundImage: `url(${currentBgState.url})`,
        }}
        data-ai-hint={currentBgState.hint}
      >
        <div className="flex-grow flex flex-col bg-background/40 dark:bg-background/60"> {/* Removed backdrop-blur-sm */}
          {/* Ensure children take up available space if AppHeader is not part of this div */}
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
