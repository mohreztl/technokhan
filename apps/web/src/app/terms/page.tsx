import type { Metadata } from 'next';
import { LEGAL_DOCS } from '@technokhan/shared';
import { LegalPage } from '@/components/pages/legal-page';

const doc = LEGAL_DOCS.terms;

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPage doc={doc} />;
}
