import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExplainItSimple | Turn complex text into clear explanations',
  description:
    'ExplainItSimple rewrites difficult content into easy explanations, key points, real-life examples, and quick recaps for fast learning.',
  keywords: ['study tool', 'text simplifier', 'education', 'AI tutor', 'exam revision'],
  openGraph: {
    title: 'ExplainItSimple',
    description: 'Turn complex text into simple, student-friendly explanations in seconds.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
