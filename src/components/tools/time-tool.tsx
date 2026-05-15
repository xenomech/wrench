"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ArrowCounterClockwise,
  Sun,
  Moon,
  Plus,
  X,
  GearSix,
} from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { useTimeStore, ALL_TIMEZONES, type CityZone } from "@/lib/time-store";
import { playSound } from "@/lib/sound-engine";
import { tick002Sound } from "@/sounds/tick-002";
import { useSoundStore } from "@/lib/sound-store";
import {
  format as fnsFormat,
  formatDistanceToNow,
  fromUnixTime,
  getUnixTime,
  isValid,
  parseISO,
  getHours,
  formatISO,
} from "date-fns";
import { toZonedTime, format as tzFormat } from "date-fns-tz";

function isDaytime(hour: number): boolean {
  return hour >= 6 && hour < 18;
}

function detectAndParse(input: string): Date | null {
  const t = input.trim();
  if (!t) return null;
  if (/^\d{10}$/.test(t)) return fromUnixTime(Number(t));
  if (/^\d{13}$/.test(t)) return new Date(Number(t));
  const iso = parseISO(t);
  if (isValid(iso)) return iso;
  const d = new Date(t);
  return isValid(d) ? d : null;
}

function useFormattedTime(format: "12h" | "24h", showSeconds: boolean) {
  return useCallback(
    (d: Date) => {
      const pattern =
        format === "24h"
          ? showSeconds
            ? "HH:mm:ss"
            : "HH:mm"
          : showSeconds
            ? "h:mm:ss aa"
            : "h:mm aa";
      return fnsFormat(d, pattern);
    },
    [format, showSeconds],
  );
}

function getZoneTime(
  tz: string,
  format: "12h" | "24h",
): { time: string; hour: number } {
  const zoned = toZonedTime(new Date(), tz);
  const pattern = format === "12h" ? "h:mm aa" : "HH:mm";
  return {
    time: fnsFormat(zoned, pattern),
    hour: getHours(zoned),
  };
}

function AnimatedDigit({ value }: { value: string }) {
  return (
    <span className="relative inline-block w-[0.62em] overflow-hidden text-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: "40%", opacity: 0, filter: "blur(3px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-40%", opacity: 0, filter: "blur(3px)" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function PulsingColon() {
  return (
    <motion.span
      className="mx-[0.05em] text-white/20"
      animate={{ opacity: [0.2, 0.45, 0.2] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
    >
      :
    </motion.span>
  );
}

function AnimatedTime({ time }: { time: string }) {
  return (
    <span className="font-code inline-flex items-baseline tabular-nums">
      {time.split("").map((char, i) =>
        char === ":" ? (
          <PulsingColon key={`c-${i}`} />
        ) : char === " " ? (
          <span key={`s-${i}`} className="w-[0.3em]" />
        ) : /[APM]/.test(char) ? (
          <span key={`a-${i}`} className="text-[0.35em] text-white/25">
            {char}
          </span>
        ) : (
          <AnimatedDigit key={`d-${i}`} value={char} />
        ),
      )}
    </span>
  );
}

function CityList({
  available,
  onSelect,
}: {
  available: CityZone[];
  onSelect: (c: CityZone) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = available.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <input
        ref={(el) => {
          if (el && window.matchMedia("(pointer: fine)").matches) el.focus();
        }}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cities..."
        className="font-code mb-2 w-full bg-transparent px-3 py-2.5 text-[12px] text-white/60 outline-none placeholder:text-white/25 lg:mb-1 lg:px-2 lg:py-1.5 lg:text-[11px]"
      />
      <div className="hide-scroll max-h-[280px] overflow-auto lg:max-h-[180px]">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-[11px] text-white/30">
            No results
          </p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.tz}
              onClick={() => onSelect(c)}
              className="flex min-h-[44px] w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/[0.05] lg:min-h-0 lg:px-2 lg:py-1.5"
            >
              <span className="font-code text-[11px] font-bold text-white/40 lg:text-[10px]">
                {c.code}
              </span>
              <span className="truncate text-[11px] text-white/30 lg:text-[10px]">
                {c.label}
              </span>
              <span className="ml-auto truncate text-[10px] text-white/15 lg:text-[9px]">
                {c.tz}
              </span>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function AddCityButton({
  onAdd,
  existingTzs,
  variant = "icon",
}: {
  onAdd: (city: CityZone) => void;
  existingTzs: string[];
  variant?: "icon" | "empty";
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches,
  );
  const available = ALL_TIMEZONES.filter((c) => !existingTzs.includes(c.tz));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSelect = (c: CityZone) => {
    onAdd(c);
    setOpen(false);
  };

  const trigger = (
    <button
      onClick={() => setOpen(!open)}
      className={
        variant === "empty"
          ? "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] py-6 text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:border-white/[0.15] hover:text-white/40"
          : "flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/40"
      }
    >
      <Plus
        weight="duotone"
        className={variant === "empty" ? "h-4 w-4" : "h-3.5 w-3.5"}
      />
      {variant === "empty" && "Add a city"}
    </button>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-[#161520] outline-none">
            <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-white/10" />
            <div className="p-3 pt-4">
              <Drawer.Title className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Add City
              </Drawer.Title>
              <CityList available={available} onSelect={handleSelect} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <div className="relative">
      {trigger}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute bottom-full right-0 z-[70] mb-1 w-[280px] rounded-xl border border-white/[0.08] bg-[#161520] p-2 shadow-2xl"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
            >
              <CityList available={available} onSelect={handleSelect} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PrefsPanel({ onClose }: { onClose: () => void }) {
  const {
    timeFormat,
    setTimeFormat,
    dateFormat,
    setDateFormat,
    showSeconds,
    setShowSeconds,
    resetCities,
  } = useTimeStore();

  return (
    <motion.div
      className="overflow-hidden rounded-xl bg-white/[0.02]"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Preferences
          </span>
          <button
            onClick={onClose}
            className="text-white/20 transition-colors hover:text-white/50"
          >
            <X weight="duotone" className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Time format</span>
            <div className="flex gap-0.5 rounded-lg bg-black/20 p-0.5">
              {(["12h", "24h"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFormat(f)}
                  className={`relative rounded-md px-2.5 py-1 text-[10px] font-semibold ${timeFormat === f ? "text-white/70" : "text-white/20 hover:text-white/40"}`}
                >
                  {timeFormat === f && (
                    <motion.div
                      layoutId="prefs-time"
                      className="absolute inset-0 rounded-md bg-white/[0.08]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{f}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Date format</span>
            <div className="flex gap-0.5 rounded-lg bg-black/20 p-0.5">
              {(["short", "long", "iso"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFormat(f)}
                  className={`relative rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${dateFormat === f ? "text-white/70" : "text-white/20 hover:text-white/40"}`}
                >
                  {dateFormat === f && (
                    <motion.div
                      layoutId="prefs-date"
                      className="absolute inset-0 rounded-md bg-white/[0.08]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                  <span className="relative z-10">{f}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50">Show seconds</span>
            <div className="flex gap-0.5 rounded-lg bg-black/20 p-0.5">
              {(["On", "Off"] as const).map((v) => {
                const isActive = (v === "On") === showSeconds;
                return (
                  <button
                    key={v}
                    onClick={() => setShowSeconds(v === "On")}
                    className={`relative rounded-md px-2.5 py-1 text-[10px] font-semibold ${isActive ? "text-white/70" : "text-white/20 hover:text-white/40"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="prefs-seconds"
                        className="absolute inset-0 rounded-md bg-white/[0.08]"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative z-10">{v}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={resetCities}
            className="mt-1 self-start text-[10px] text-white/15 transition-colors hover:text-white/35"
          >
            Reset cities to default
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ConverterRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      onClick={copy}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
    >
      <span className="w-10 text-[10px] font-semibold uppercase tracking-widest text-white/35">
        {label}
      </span>
      <span className="font-code flex-1 truncate text-[12px] text-white/50 group-hover:text-white/70">
        {value}
      </span>
      {copied ? (
        <Check weight="duotone" className="h-3 w-3 shrink-0 text-emerald-400" />
      ) : (
        <Copy
          weight="duotone"
          className="h-3 w-3 shrink-0 text-white/0 group-hover:text-white/25"
        />
      )}
    </div>
  );
}

export function TimeTool() {
  const [now, setNow] = useState(() => new Date());
  const [converterInput, setConverterInput] = useState("");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { cities, addCity, removeCity, timeFormat, dateFormat, showSeconds } =
    useTimeStore();

  const formatTimeLocal = useFormattedTime(timeFormat, showSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      if (showSeconds && useSoundStore.getState().enabled) {
        playSound(tick002Sound.dataUri, { volume: 0.15 });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [showSeconds]);

  const parsed = useMemo(
    () => detectAndParse(converterInput),
    [converterInput],
  );

  const handleNow = useCallback(() => {
    setConverterInput(Math.floor(Date.now() / 1000).toString());
  }, []);

  const timeStr = formatTimeLocal(now);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const datePatterns = {
    iso: "yyyy-MM-dd",
    long: "EEEE, MMMM d, yyyy",
    short: "EEE, MMM d, yyyy",
  };
  const dateStr = fnsFormat(now, datePatterns[dateFormat]);

  return (
    <div className="hide-scroll flex h-full flex-col items-center overflow-auto">
      {/* Hero clock */}
      <div className="flex shrink-0 flex-col items-center justify-center gap-4 py-6 md:flex-1 md:py-0">
        <div className="font-code text-[2.8rem] font-medium tracking-tight text-white/90 md:text-7xl lg:text-[5.5rem]">
          <AnimatedTime time={timeStr} />
        </div>
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-2">
          <span className="font-code text-[9px] tabular-nums uppercase tracking-[0.2em] text-white/15 md:text-[10px]">
            {dateStr}
          </span>
          <span className="hidden h-2.5 w-px bg-white/10 md:block" />
          <span className="font-code text-[9px] uppercase tracking-[0.2em] text-white/10 md:text-[10px] md:text-white/30">
            {tz}
          </span>
        </div>
      </div>

      {/* Bottom section: world time + converter */}
      <div className="w-full max-w-3xl shrink-0 space-y-4 px-1 pb-4 md:space-y-5">
        {/* World time */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase tracking-widest text-white/30">
              World Time
            </span>
            <div className="flex items-center gap-1">
              <AddCityButton
                onAdd={addCity}
                existingTzs={cities.map((c) => c.tz)}
              />
              <button
                onClick={() => setPrefsOpen((p) => !p)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/15 transition-colors hover:bg-white/[0.04] hover:text-white/35"
              >
                <GearSix weight="duotone" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {prefsOpen && <PrefsPanel onClose={() => setPrefsOpen(false)} />}
          </AnimatePresence>

          {cities.length === 0 && (
            <AddCityButton onAdd={addCity} existingTzs={[]} variant="empty" />
          )}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
            <AnimatePresence>
              {cities.map((city) => {
                const { time, hour } = getZoneTime(city.tz, timeFormat);
                const day = isDaytime(hour);
                const zoned = toZonedTime(new Date(), city.tz);
                const offset = tzFormat(zoned, "OOO", { timeZone: city.tz });
                const localZoned = toZonedTime(new Date(), tz);
                const diffHours =
                  (zoned.getTime() - localZoned.getTime()) / 3600000;
                const diffLabel =
                  Math.abs(diffHours) < 0.01
                    ? "Local"
                    : `${diffHours > 0 ? "+" : ""}${diffHours % 1 === 0 ? diffHours.toFixed(0) : diffHours.toFixed(1)}h`;
                const barPos = Math.max(0, Math.min(1, (diffHours + 12) / 24));
                return (
                  <motion.div
                    key={city.tz}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative overflow-hidden rounded-xl p-3 transition-colors md:p-4 ${
                      day
                        ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.07]"
                        : "bg-blue-500/[0.04] hover:bg-blue-500/[0.07]"
                    }`}
                  >
                    {/* Header: city name + day/night + remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {day ? (
                          <Sun
                            weight="duotone"
                            className="h-2.5 w-2.5 text-amber-400/60 md:h-3 md:w-3"
                          />
                        ) : (
                          <Moon
                            weight="duotone"
                            className="h-2.5 w-2.5 text-blue-400/60 md:h-3 md:w-3"
                          />
                        )}
                        <span
                          className={`text-[8px] font-semibold uppercase tracking-[0.15em] md:text-[9px] ${day ? "text-amber-300/40" : "text-blue-300/40"}`}
                        >
                          {city.label}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCity(city.tz)}
                        className="text-white/0 transition-colors group-hover:text-white/20 hover:!text-white/50"
                      >
                        <X weight="duotone" className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Time — hero element */}
                    <p className="font-code mt-2 text-xl tabular-nums text-white/85 md:mt-3 md:text-2xl">
                      {time}
                    </p>

                    {/* Offset bar */}
                    <div className="mt-2.5 md:mt-3">
                      <div className="relative h-[3px] w-full rounded-full bg-white/[0.06]">
                        <div
                          className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${day ? "bg-amber-400/60" : "bg-blue-400/60"}`}
                          style={{ left: `calc(${barPos * 100}% - 4px)` }}
                        />
                        <div
                          className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-white/15"
                          style={{ left: "50%" }}
                        />
                      </div>
                    </div>

                    {/* Footer: code + offset label */}
                    <div className="mt-2 flex items-center justify-between md:mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-code text-[8px] font-bold text-white/25 md:text-[9px]">
                          {city.code}
                        </span>
                        <span className="font-code text-[8px] text-white/15 md:text-[9px]">
                          {offset}
                        </span>
                      </div>
                      <span
                        className={`font-code text-[8px] font-semibold md:text-[9px] ${diffHours === 0 ? "text-white/30" : diffHours > 0 ? "text-amber-400/50" : "text-blue-400/50"}`}
                      >
                        {diffLabel}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Converter */}
        <div className="flex flex-col gap-2">
          <span className="px-1 text-[10px] uppercase tracking-widest text-white/30">
            Converter
          </span>
          <div className="rounded-lg bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={converterInput}
                onChange={(e) => setConverterInput(e.target.value)}
                placeholder="Unix, ISO, or date string..."
                className="font-code flex-1 bg-transparent text-[11px] text-white/60 outline-none placeholder:text-white/25 md:text-[12px]"
              />
              <button
                onClick={handleNow}
                className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-white/15 transition-colors hover:text-white/40"
              >
                <ArrowCounterClockwise weight="duotone" className="h-3 w-3" />{" "}
                Now
              </button>
            </div>
            <AnimatePresence>
              {parsed && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="mt-2 flex flex-col gap-0.5 border-t border-white/[0.04] pt-2">
                    <ConverterRow
                      label="Unix"
                      value={getUnixTime(parsed).toString()}
                    />
                    <ConverterRow
                      label="ms"
                      value={parsed.getTime().toString()}
                    />
                    <ConverterRow label="ISO" value={formatISO(parsed)} />
                    <ConverterRow
                      label="UTC"
                      value={fnsFormat(
                        parsed,
                        "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
                        { in: undefined },
                      )}
                    />
                    <ConverterRow
                      label="Local"
                      value={fnsFormat(parsed, "PPpp")}
                    />
                    <ConverterRow
                      label="Rel"
                      value={formatDistanceToNow(parsed, { addSuffix: true })}
                    />
                    <ConverterRow
                      label="Day"
                      value={fnsFormat(parsed, "EEEE")}
                    />
                    <ConverterRow
                      label="Week"
                      value={`Week ${fnsFormat(parsed, "w")} of ${fnsFormat(parsed, "yyyy")}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
