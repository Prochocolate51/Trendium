import type { NextApiRequest, NextApiResponse } from 'next';
import { getOpenAIClient } from '@/lib/openai';
import { isRateLimited } from '@/lib/rateLimit';

type SimplifySuccessResponse = {
  simpleExplanation: string;
  keyPoints: string[];
  example: string;
  quickRecap: string;
};

type SimplifyErrorResponse = {
  error: string;
};

const MIN_CHARACTERS = 50;

const TONE_INSTRUCTIONS: Record<string, string> = {
  'Super Simple': 'Use very easy wording and avoid jargon.',
  'Bullet Points Only': 'Keep each section concise and heavily structured as bullets where appropriate.',
  'With Example': 'Make the EXAMPLE section concrete and relatable to daily student life.',
  'Exam Revision Mode': 'Emphasize exam-ready clarity, include memory-friendly phrasing, and focus on recall.'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimplifySuccessResponse | SimplifyErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'anonymous';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
  }

  const { text, tone } = req.body as { text?: string; tone?: string };

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  if (text.trim().length < MIN_CHARACTERS) {
    return res.status(400).json({ error: `Text must be at least ${MIN_CHARACTERS} characters.` });
  }

  try {
    const prompt = `You are an expert teacher.
Explain the following content clearly and simply for a 15-year-old student.

Structure your response EXACTLY like this:

SIMPLE_EXPLANATION:
[clear paragraph]

KEY_POINTS:
- point
- point
- point

EXAMPLE:
[real-world example]

QUICK_RECAP:
[2–3 sentence summary]

Content:
"""
${text.trim()}
"""

Make it accurate but easy to understand.

Tone preference: ${tone && TONE_INSTRUCTIONS[tone] ? `${tone} - ${TONE_INSTRUCTIONS[tone]}` : TONE_INSTRUCTIONS['Super Simple']}`;

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return res.status(502).json({ error: 'No response from AI model.' });
    }

    const parsed = parseSections(raw);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Simplify API error:', error);
    return res.status(500).json({ error: 'Unable to simplify text right now.' });
  }
}

function parseSections(raw: string): SimplifySuccessResponse {
  const lines = raw.split(/\r?\n/);
  const sections: Record<string, string[]> = {
    SIMPLE_EXPLANATION: [],
    KEY_POINTS: [],
    EXAMPLE: [],
    QUICK_RECAP: []
  };

  let currentKey: keyof typeof sections | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed in sections) {
      currentKey = trimmed as keyof typeof sections;
      continue;
    }

    if (currentKey) {
      sections[currentKey].push(line);
    }
  }

  const keyPoints = sections.KEY_POINTS
    .map((line) => line.replace(/^[-*]\s?/, '').trim())
    .filter(Boolean);

  return {
    simpleExplanation: sections.SIMPLE_EXPLANATION.join('\n').trim(),
    keyPoints,
    example: sections.EXAMPLE.join('\n').trim(),
    quickRecap: sections.QUICK_RECAP.join('\n').trim()
  };
}
