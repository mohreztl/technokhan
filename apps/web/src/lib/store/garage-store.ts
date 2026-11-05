import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Vehicle } from '@technokhan/shared';

export interface GarageState {
  vehicles: Vehicle[];
  lastUsedId: string | null;
  /** Adds (or, when an identical vehicle exists, re-selects) a vehicle and returns the stored record. */
  addVehicle: (vehicle: Omit<Vehicle, 'id'> & { id?: string }) => Vehicle;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setLastUsed: (id: string | null) => void;
  clear: () => void;
}

export const GARAGE_STORAGE_KEY = 'autolounge_garage';
export const GARAGE_MAX_VEHICLES = 6;

const sameVehicle = (a: Omit<Vehicle, 'id'>, b: Vehicle) =>
  Boolean(a.plate && b.plate && a.plate === b.plate) ||
  (a.brand === b.brand && a.model === b.model && a.year === b.year && a.color === b.color);

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      lastUsedId: null,
      addVehicle: (vehicle) => {
        const existing = get().vehicles.find((x) => sameVehicle(vehicle, x));
        if (existing) {
          set({ lastUsedId: existing.id });
          return existing;
        }
        const v: Vehicle = {
          ...vehicle,
          id: vehicle.id ?? `veh-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        };
        set((s) => ({ vehicles: [v, ...s.vehicles].slice(0, GARAGE_MAX_VEHICLES), lastUsedId: v.id }));
        return v;
      },
      updateVehicle: (id, patch) =>
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch, id } : v)) })),
      removeVehicle: (id) =>
        set((s) => ({
          vehicles: s.vehicles.filter((v) => v.id !== id),
          lastUsedId: s.lastUsedId === id ? null : s.lastUsedId,
        })),
      setLastUsed: (lastUsedId) => set({ lastUsedId }),
      clear: () => set({ vehicles: [], lastUsedId: null }),
    }),
    {
      name: GARAGE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

/** «بی‌ام‌و سری ۳» — brand + model for chips and summaries. */
export const vehicleDisplayName = (v: Pick<Vehicle, 'brand' | 'model'>): string =>
  [v.brand, v.model].filter(Boolean).join(' ').trim();
