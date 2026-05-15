import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CityZone = {
  code: string;
  tz: string;
  label: string;
};

const LABEL_OVERRIDES: Record<string, string> = {
  "Asia/Calcutta": "Kolkata",
  "Asia/Saigon": "Ho Chi Minh",
  "Pacific/Ponape": "Pohnpei",
  "Asia/Katmandu": "Kathmandu",
  "Asia/Rangoon": "Yangon",
};

function tzToLabel(tz: string): string {
  if (LABEL_OVERRIDES[tz]) return LABEL_OVERRIDES[tz];
  const city = tz.split("/").pop()!;
  return city.replace(/_/g, " ");
}

function tzToCode(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  } catch {
    return "GMT";
  }
}

function buildTimezones(): CityZone[] {
  try {
    const tzs = Intl.supportedValuesOf("timeZone");
    return tzs
      .filter((tz) => tz.includes("/") && !tz.startsWith("Etc/"))
      .map((tz) => ({ code: tzToCode(tz), tz, label: tzToLabel(tz) }));
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

const FALLBACK_TIMEZONES: CityZone[] = [
  { code: "GMT-4", tz: "America/New_York", label: "New York" },
  { code: "GMT", tz: "Europe/London", label: "London" },
  { code: "GMT+9", tz: "Asia/Tokyo", label: "Tokyo" },
  { code: "GMT+11", tz: "Australia/Sydney", label: "Sydney" },
  { code: "GMT+4", tz: "Asia/Dubai", label: "Dubai" },
  { code: "GMT-7", tz: "America/Los_Angeles", label: "Los Angeles" },
  { code: "GMT-5", tz: "America/Chicago", label: "Chicago" },
  { code: "GMT+2", tz: "Europe/Berlin", label: "Berlin" },
  { code: "GMT+2", tz: "Europe/Paris", label: "Paris" },
  { code: "GMT+8", tz: "Asia/Singapore", label: "Singapore" },
  { code: "GMT+5:30", tz: "Asia/Calcutta", label: "Kolkata" },
  { code: "GMT+8", tz: "Asia/Shanghai", label: "Shanghai" },
  { code: "GMT+12", tz: "Pacific/Auckland", label: "Auckland" },
  { code: "GMT-3", tz: "America/Sao_Paulo", label: "Sao Paulo" },
  { code: "GMT+3", tz: "Africa/Cairo", label: "Cairo" },
  { code: "GMT+3", tz: "Africa/Nairobi", label: "Nairobi" },
];

export const ALL_TIMEZONES: CityZone[] = buildTimezones();

function findByTz(tz: string): CityZone | undefined {
  return ALL_TIMEZONES.find((c) => c.tz === tz);
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
  findByTz("Europe/London"),
  findByTz("Australia/Sydney"),
  findByTz("Asia/Dubai"),
].filter((c): c is CityZone => !!c);

type TimeFormat = "12h" | "24h";
type DateFormat = "short" | "long" | "iso";

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
      timeFormat: "12h",
      dateFormat: "short",
      showSeconds: false,

      addCity: (city) =>
        set((s) => {
          if (s.cities.some((c) => c.tz === city.tz)) return s;
          return { cities: [...s.cities, city] };
        }),
      removeCity: (tz) =>
        set((s) => ({ cities: s.cities.filter((c) => c.tz !== tz) })),
      reorderCities: (cities) => set({ cities }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      resetCities: () => set({ cities: DEFAULT_CITIES }),
    }),
    { name: "wrenchkit-time-prefs" },
  ),
);
