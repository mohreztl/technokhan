import type { Dispatch } from 'react';
import type { QuoteResult, Service } from '@technokhan/shared';
import type { BookingDraft, BookingStepIndex } from '@/lib/booking/draft';
import type { StepErrors, WizardAction } from '@/lib/booking/wizard';

export interface StepProps {
  draft: BookingDraft;
  dispatch: Dispatch<WizardAction>;
  errors: StepErrors;
  service: Service;
  quote: QuoteResult;
  /** jump to another step (used by «ویرایش» links on the review step) */
  onEdit?: (step: BookingStepIndex) => void;
}
