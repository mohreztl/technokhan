'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CalendarPlus, Car, Plus, Trash2 } from 'lucide-react';
import { CAR_COLORS, ROUTES, VEHICLE_SIZES, toPersianDigits } from '@autolounge/shared';
import type { Vehicle } from '@autolounge/shared';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Skeleton } from '@/components/ui/skeleton';
import { GARAGE_MAX_VEHICLES, useGarageStore, vehicleDisplayName } from '@/lib/store/garage-store';
import { useHydrated } from '@/lib/store/hydration';
import { GarageVehicleSheet } from './garage-vehicle-sheet';

const colorHex = (name: string) => CAR_COLORS.find((c) => c.name === name)?.hex;
const sizeLabel = (id: string) => VEHICLE_SIZES.find((s) => s.id === id)?.label ?? id;

export function TabGarage() {
  const hydrated = useHydrated(useGarageStore);
  const vehicles = useGarageStore((s) => s.vehicles);
  const removeVehicle = useGarageStore((s) => s.removeVehicle);
  const addVehicle = useGarageStore((s) => s.addVehicle);
  const setLastUsed = useGarageStore((s) => s.setLastUsed);
  const [open, setOpen] = useState(false);

  const remove = (vehicle: Vehicle) => {
    removeVehicle(vehicle.id);
    toast(`«${vehicleDisplayName(vehicle)}» از گاراژ حذف شد`, {
      action: { label: 'بازگردانی', onClick: () => addVehicle(vehicle) },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">گاراژ من</h2>
          <p className="text-xs text-muted-foreground">
            {toPersianDigits(String(vehicles.length))} از {toPersianDigits(String(GARAGE_MAX_VEHICLES))} خودرو
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} disabled={hydrated && vehicles.length >= GARAGE_MAX_VEHICLES}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          افزودن خودرو
        </Button>
      </div>

      {!hydrated ? (
        <div className="space-y-3" aria-busy="true" aria-label="در حال بارگذاری گاراژ">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <Car className="h-12 w-12 text-secondary" aria-hidden="true" />
          <div>
            <p className="font-bold">گاراژ شما خالی است</p>
            <p className="mt-1 text-sm text-muted-foreground">خودروهایتان را ذخیره کنید تا رزرو بعدی با یک لمس انجام شود.</p>
          </div>
          <Button size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            افزودن خودرو
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {vehicles.map((vehicle) => {
              const hex = colorHex(vehicle.color);
              return (
                <motion.li
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-effect flex flex-col gap-3 rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 shadow-inner"
                      style={{ backgroundColor: hex ?? 'hsl(var(--muted))' }}
                    >
                      <Car className="h-6 w-6 text-white drop-shadow" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{vehicleDisplayName(vehicle)}</p>
                      <p className="text-xs text-muted-foreground">
                        {toPersianDigits(String(vehicle.year))} · {vehicle.color} · {sizeLabel(vehicle.size)}
                      </p>
                      {vehicle.plate && (
                        <p dir="rtl" className="mt-1 inline-block rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs">
                          {toPersianDigits(vehicle.plate)}
                        </p>
                      )}
                    </div>
                    <IconButton
                      label={`حذف ${vehicleDisplayName(vehicle)}`}
                      icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                      variant="ghost"
                      size="sm"
                      className="-me-2 -mt-1 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(vehicle)}
                    />
                  </div>
                  <Button variant="outline" size="sm" asChild onClick={() => setLastUsed(vehicle.id)}>
                    <Link href={`${ROUTES.BOOKING}?size=${vehicle.size}`}>
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                      رزرو با این خودرو
                    </Link>
                  </Button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <GarageVehicleSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
