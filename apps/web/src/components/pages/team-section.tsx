'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { InstagramIcon, LinkedinIcon } from '@/components/icons/brands';
import { toPersianDigits, type TeamMember } from '@autolounge/shared';
import { fadeInUp, staggerContainer, viewportConfig } from '@/lib/animation-variants';
import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { SectionHeading } from '@/components/ui/premium-components';

export interface TeamSectionProps {
  members: TeamMember[];
}

/** Team cards; tapping a card opens the member's bio in a sheet/dialog. */
export function TeamSection({ members }: TeamSectionProps) {
  const [active, setActive] = React.useState<TeamMember | null>(null);

  return (
    <section className="py-16 lg:py-24" aria-labelledby="team-title">
      <div className="container-custom">
        <SectionHeading
          id="team-title"
          eyebrow="تیم ما"
          title="متخصصانی که به آن‌ها اعتماد می‌کنید"
          subtitle="برای آشنایی بیشتر روی هر عضو تیم بزنید."
        />
        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig.once}
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
        >
          {members.map((member) => (
            <motion.li key={member.id} variants={fadeInUp}>
              <button
                type="button"
                onClick={() => setActive(member)}
                aria-haspopup="dialog"
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-start transition-shadow hover:shadow-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {member.experienceYears ? (
                    <span className="absolute start-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
                      {toPersianDigits(member.experienceYears)} سال تجربه
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3 className="text-sm font-bold text-foreground sm:text-base">{member.name}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{member.role}</p>
                  {member.specialties && member.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {member.specialties.slice(0, 2).map((item) => (
                        <Badge key={item} variant="muted" size="sm">
                          {item}
                        </Badge>
                      ))}
                      {member.specialties.length > 2 && (
                        <Badge variant="outline" size="sm">
                          +{toPersianDigits(member.specialties.length - 2)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <ResponsiveDialog
        open={active !== null}
        onOpenChange={(open) => !open && setActive(null)}
        title={active?.name}
        description={active?.role}
        snapPoints={[0.7, 0.95]}
        desktopClassName="max-w-lg"
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                <Image src={active.image} alt={active.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                {active.experienceYears ? (
                  <p className="text-sm font-semibold text-foreground">{toPersianDigits(active.experienceYears)} سال تجربه</p>
                ) : null}
                {active.socials && (
                  <div className="mt-2 flex gap-2">
                    {active.socials.instagram && (
                      <IconButton asChild label="اینستاگرام" icon={<InstagramIcon />} variant="outline" size="sm">
                        <a href={active.socials.instagram} target="_blank" rel="noopener noreferrer" />
                      </IconButton>
                    )}
                    {active.socials.linkedin && (
                      <IconButton asChild label="لینکدین" icon={<LinkedinIcon />} variant="outline" size="sm">
                        <a href={active.socials.linkedin} target="_blank" rel="noopener noreferrer" />
                      </IconButton>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm leading-8 text-foreground/90">{active.bio}</p>
            {active.specialties && active.specialties.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold text-muted-foreground">تخصص‌ها</p>
                <div className="flex flex-wrap gap-2">
                  {active.specialties.map((item) => (
                    <Badge key={item} variant="gold">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </section>
  );
}
