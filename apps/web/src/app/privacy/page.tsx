import type { Metadata } from 'next';
import { LEGAL_DOCS } from '@technokhan/shared';
import { LegalPage } from '@/components/pages/legal-page';

const doc = LEGAL_DOCS.privacy;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPage doc={doc} />;
}
