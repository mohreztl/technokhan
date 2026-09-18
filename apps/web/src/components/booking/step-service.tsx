'use client';

import { useCallback } from 'react';
import type { QuoteInput, WrapFinish } from '@autolounge/shared';
import { SERVICES, findWrapColor } from '@autolounge/shared';
import { Palette } from 'lucide-react';
import { QuoteConfigurator } from '@/components/creative';
import { fieldErrorClass } from '@/components/ui/input';
import type { StepProps } from './step-props';

const FINISH_LABELS: Record<WrapFinish, string> = {
  gloss: 'براق',
  satin: 'ساتن',
  matte: 'مات',
  chrome: 'کروم',
};

/** Step ۱ — service, vehicle size and add-ons via the shared QuoteConfigurator. */
export function StepService({ draft, dispatch, errors }: StepProps) {
  const wrapColor = draft.wrapColorId ? findWrapColor(draft.wrapColorId) : undefined;

  const onChange = useCallback(
    (input: QuoteInput) =>
      dispatch({ type: 'quote', serviceId: input.serviceId, size: input.size, addonIds: input.addonIds }),
    [dispatch]
  );

  return (
    <div className="space-y-6">
      {wrapColor && (
        <div className="flex items-center gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 p-3">
          <span
            aria-hidden="true"
            className="h-10 w-10 shrink-0 rounded-full border border-black/10 shadow-inner"
            style={{ backgroundColor: wrapColor.hex }}
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              رنگ انتخابی شما از ویژوالایزر
            </p>
            <p className="truncate text-sm font-bold">
              {wrapColor.name}
              {draft.wrapFinish && (
                <span className="ms-2 rounded-full bg-background/70 px-2 py-0.5 text-xs font-medium">
                  {FINISH_LABELS[draft.wrapFinish]}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <QuoteConfigurator
        services={SERVICES}
        initialServiceId={draft.serviceId}
        initialSize={draft.size}
        initialAddonIds={draft.addonIds}
        onChange={onChange}
        className="lg:grid-cols-1! [&>aside]:hidden"
      />

      {(errors.serviceId || errors.size) && (
        <p role="alert" className={fieldErrorClass}>
          {errors.serviceId ?? errors.size}
        </p>
      )}
    </div>
  );
}
