import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ACCENTS = {
  blue: { label: 'Blue', accent: '#0a84ff', strong: '#3395ff' },
  violet: { label: 'Violet', accent: '#8b5cf6', strong: '#a78bfa' },
  rose: { label: 'Rose', accent: '#f43f5e', strong: '#fb7185' },
  emerald: { label: 'Emerald', accent: '#10b981', strong: '#34d399' },
  amber: { label: 'Amber', accent: '#f59e0b', strong: '#fbbf24' },
  cyan: { label: 'Cyan', accent: '#06b6d4', strong: '#22d3ee' },
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      accent: 'blue',
      setAccent: (accent) => set({ accent }),
    }),
    { name: 'moovio-settings' },
  ),
)
