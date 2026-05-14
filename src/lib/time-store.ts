import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CityZone = {
  code: string;
  tz: string;
  label: string;
};

const LABEL_OVERRIDES: Record<string, string> = {
  'Asia/Calcutta': 'Kolkata',
  'Asia/Saigon': 'Ho Chi Minh',
  'Pacific/Ponape': 'Pohnpei',
  'Asia/Katmandu': 'Kathmandu',
  'Asia/Rangoon': 'Yangon',
};

function tzToLabel(tz: string): string {
  if (LABEL_OVERRIDES[tz]) return LABEL_OVERRIDES[tz];
  const city = tz.split('/').pop()!;
  return city.replace(/_/g, ' ');
}

function tzToCode(tz: string): string {
  const city = tz.split('/').pop()!.replace(/_/g, '');
  return city.slice(0, 3).toUpperCase();
}

function buildTimezones(): CityZone[] {
  try {
    const tzs = Intl.supportedValuesOf('timeZone');
    const seen = new Set<string>();
    return tzs
      .filter(tz => tz.includes('/') && !tz.startsWith('Etc/'))
      .map(tz => {
        let code = tzToCode(tz);
        while (seen.has(code)) code = code.slice(0, 2) + String.fromCharCode(code.charCodeAt(2) + 1);
        seen.add(code);
        return { code, tz, label: tzToLabel(tz) };
      });
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

const FALLBACK_TIMEZONES: CityZone[] = [
  { code: 'NYC', tz: 'America/New_York', label: 'New York' },
  { code: 'LON', tz: 'Europe/London', label: 'London' },
  { code: 'TYO', tz: 'Asia/Tokyo', label: 'Tokyo' },
  { code: 'SYD', tz: 'Australia/Sydney', label: 'Sydney' },
  { code: 'DXB', tz: 'Asia/Dubai', label: 'Dubai' },
  { code: 'SFO', tz: 'America/Los_Angeles', label: 'Los Angeles' },
  { code: 'CHI', tz: 'America/Chicago', label: 'Chicago' },
  { code: 'BER', tz: 'Europe/Berlin', label: 'Berlin' },
  { code: 'PAR', tz: 'Europe/Paris', label: 'Paris' },
  { code: 'SIN', tz: 'Asia/Singapore', label: 'Singapore' },
  { code: 'DEL', tz: 'Asia/Calcutta', label: 'Kolkata' },
  { code: 'SHA', tz: 'Asia/Shanghai', label: 'Shanghai' },
  { code: 'AKL', tz: 'Pacific/Auckland', label: 'Auckland' },
  { code: 'SAO', tz: 'America/Sao_Paulo', label: 'Sao Paulo' },
  { code: 'CAI', tz: 'Africa/Cairo', label: 'Cairo' },
  { code: 'NBO', tz: 'Africa/Nairobi', label: 'Nairobi' },
];

export const ALL_TIMEZONES: CityZone[] = buildTimezones();

function findByTz(tz: string): CityZone | undefined {
  return ALL_TIMEZONES.find(c => c.tz === tz);
}

function getLocalCity(): CityZone | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return findByTz(tz);
  } catch {
    return undefined;
  }
}

const DEFAULT_CITIES: CityZone[] = [
  getLocalCity(),
  findByTz('Europe/London'),
  findByTz('Australia/Sydney'),
  findByTz('Asia/Dubai'),
].filter((c): c is CityZone => !!c);

type TimeFormat = '12h' | '24h';
type DateFormat = 'short' | 'long' | 'iso';

type TimeStore = {
  cities: CityZone[];
  timeFormat: TimeFormat;
  dateFormat: DateFormat;
  showSeconds: boolean;

  addCity: (city: CityZone) => void;
  removeCity: (code: string) => void;
  reorderCities: (cities: CityZone[]) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setDateFormat: (format: DateFormat) => void;
  setShowSeconds: (show: boolean) => void;
  resetCities: () => void;
};

export const useTimeStore = create<TimeStore>()(
  persist(
    (set) => ({
      cities: DEFAULT_CITIES,
      timeFormat: '12h',
      dateFormat: 'short',
      showSeconds: false,

      addCity: (city) =>
        set((s) => {
          if (s.cities.some((c) => c.tz === city.tz)) return s;
          return { cities: [...s.cities, city] };
        }),
      removeCity: (code) =>
        set((s) => ({ cities: s.cities.filter((c) => c.code !== code) })),
      reorderCities: (cities) => set({ cities }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      resetCities: () => set({ cities: DEFAULT_CITIES }),
    }),
    { name: 'wrenchkit-time-prefs' }
  )
);
