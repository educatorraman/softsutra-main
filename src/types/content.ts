import type { AppKey } from '../config/domain';

export interface AppMeta {
  key: AppKey;
  subdomain: string;
  name: string;
  fullName: string;
  category: string;
  tagline: string;
  summary: string;
  features: string[];
  audience: string[];
  icon: string;
  accent: string;
  ctaLabel: string;
  guideKey: string;
  status?: 'live' | 'expanding';
}

export interface Mcq {
  id: string;
  category: 'national' | 'state';
  exam: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface PanchangPreview {
  dateContext: string;
  tithi: string;
  nakshatra: string;
  sunrise: string;
  sunset: string;
  moonPhase: string;
  note: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  lyricLine: string;
  playlist: string;
}

export interface PreviewData {
  mcqs: Mcq[];
  panchang: PanchangPreview;
  cafeChecklist: ChecklistItem[];
  audioTracks: AudioTrack[];
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface EditorialGuide {
  appKey: AppKey;
  kicker: string;
  title: string;
  intro: string;
  sections: GuideSection[];
  conclusion: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface SiteCopy {
  home: {
    metaTitle: string;
    metaDescription: string;
    ecosystemKicker: string;
    ecosystemTitle: string;
    ecosystemDescription: string;
    previewsKicker: string;
    previewsTitle: string;
    previewsDescription: string;
    closingTitle: string;
    closingDescription: string;
    trust: Array<{ title: string; text: string }>;
  };
  widgets: Record<
    'calculator' | 'speed' | 'exam' | 'jap' | 'music' | 'cafe',
    { description: string; cta: string }
  >;
  chrome: Record<string, string>;
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}

export interface LegalData {
  about: LegalDocument;
  contact: LegalDocument & { responseTime: string };
  privacy: LegalDocument;
  terms: LegalDocument;
  disclaimer: LegalDocument;
}
