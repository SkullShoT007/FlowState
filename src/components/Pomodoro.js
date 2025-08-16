import React, { useEffect, useMemo, useRef, useState } from "react";

// Single-file, production-ready Pomodoro timer component
// - Accurate countdown (no drift) using endTime math
// - Focus/Short/Long modes with auto-advance
// - Start/Pause/Reset/Skip controls
// - Keyboard: Space=start/pause, R=reset, S=skip
// - Persists state/settings in localStorage
// - Optional sound + desktop notifications
// - Minimal Tailwind styling

const STORAGE_KEY = "pomodoro-timer-state-v1";

const defaultSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLong: 4,
  autoStartNext: true,
  soundOn: true,
  notificationsOn: true,
};

function mmss(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function durationFor(mode, settings) {
  if (mode === "focus") return settings.focusMin * 60_000;
  if (mode === "short") return settings.shortBreakMin * 60_000;
  return settings.longBreakMin * 60_000; // long
}

export const Pomodoro = ()=> {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved?.settings ? { ...defaultSettings, ...saved.settings } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [mode, setMode] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved?.mode || "focus";
    } catch {
      return "focus";
    }
  });

  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.remainingMs != null) return saved.remainingMs;
    } catch {}
    return durationFor("focus", defaultSettings);
  });

  const [cycle, setCycle] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved?.cycle ?? 0;
    } catch {
      return 0;
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const endTimeRef = useRef(null);
  const tickRef = useRef(null);
  const audioRef = useRef(null);

  // Prepare total for the current mode (for progress ring)
  const totalMs = useMemo(() => durationFor(mode, settings), [mode, settings]);
  const progress = 1 - remainingMs / totalMs; // 0..1

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings, mode, remainingMs, cycle })
    );
  }, [settings, mode, remainingMs, cycle]);

  // Accurate timer: compute remaining from endTime
  useEffect(() => {
    if (!isRunning) return;

    // initialize end time if starting from pause
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + remainingMs;
    }

    const loop = () => {
      const now = Date.now();
      const left = Math.max(0, endTimeRef.current - now);
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(tickRef.current);
        tickRef.current = null;
        endTimeRef.current = null;
        handleComplete();
      }
    };

    // tick ~4 times/sec for smooth progress without battery drain
    tickRef.current = setInterval(loop, 250);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [isRunning]);

  // Update document title
  useEffect(() => {
    document.title = `${mmss(remainingMs)} — ${mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"}`;
  }, [remainingMs, mode]);

  // Notification permission request (lazy)
  useEffect(() => {
    if (settings.notificationsOn && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [settings.notificationsOn]);

  // Sound element
  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAA..." // very short silent-safe placeholder; replace with your own beep if desired
    );
  }, []);

  const start = () => {
    if (isRunning) return;
    endTimeRef.current = Date.now() + remainingMs;
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const reset = () => {
    pause();
    setRemainingMs(durationFor(mode, settings));
  };

  const skip = () => {
    pause();
    handleComplete(true);
  };

  const notify = (title, body) => {
    try {
      if (settings.notificationsOn && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    } catch {}
  };

  const beep = () => {
    if (!settings.soundOn) return;
    try {
      // WebAudio beep (no external file needed)
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  const handleComplete = (manualSkip = false) => {
    beep();
    const justFinished = mode;

    let nextMode = "focus";
    let nextCycle = cycle;

    if (justFinished === "focus") {
      nextCycle = cycle + 1;
      // Every N cycles, long break
      if (nextCycle % settings.cyclesBeforeLong === 0) {
        nextMode = "long";
      } else {
        nextMode = "short";
      }
    } else {
      nextMode = "focus";
    }

    setCycle(nextCycle);
    setMode(nextMode);
    const nextDuration = durationFor(nextMode, settings);
    setRemainingMs(nextDuration);

    const title = nextMode === "focus" ? "Back to Focus" : nextMode === "short" ? "Short Break" : "Long Break";
    const body = manualSkip ? "Skipped to next session" : "Session complete";
    notify(title, body);

    if (settings.autoStartNext) {
      endTimeRef.current = Date.now() + nextDuration;
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const setMinutes = (k, v) => {
    const n = Math.max(1, Math.min(180, Number(v) || 0));
    setSettings((s) => ({ ...s, [k]: n }));
    // If editing current mode, also adjust remaining proportionally to keep % progress
    if ((k === "focusMin" && mode === "focus") || (k === "shortBreakMin" && mode === "short") || (k === "longBreakMin" && mode === "long")) {
      const newTotal = n * 60_000;
      const pct = 1 - remainingMs / totalMs;
      setRemainingMs(Math.max(0, Math.round(newTotal * (1 - pct))));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        isRunning ? pause() : start();
      } else if (e.code === "KeyR") {
        reset();
      } else if (e.code === "KeyS") {
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, remainingMs, settings, mode, cycle]);

  // Progress ring geometry
  const size = 220;
  const radius = 100;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(circumference, circumference * progress));

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-mainGray p-6">
      <div className="w-full max-w-xl rounded-2xl bg-extraLightGray shadow p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="text-xl font-semibold text-myWhite">Pomodoro</div>
          <div className="flex items-center gap-2">
            <ModePill current={mode} setMode={(m) => { setMode(m); setRemainingMs(durationFor(m, settings)); setIsRunning(false); }} />
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm" onClick={() => setShowSettings(v => !v)}>
              {showSettings ? "Close" : "Settings"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
              <circle cx={size/2} cy={size/2} r={radius} strokeWidth={stroke} fill="none" className="text-slate-200" stroke="currentColor" />
              <circle
                cx={size/2}
                cy={size/2}
                r={radius}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeLinecap="round"
                className="text-blue-500 transition-all duration-200"
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-myWhite text-6xl font-bold tabular-nums mt-12">{mmss(remainingMs)}</div>
              <div className="text-sm text-slate-500 mt-2">{mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!isRunning ? (
              <button onClick={start} className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700">Start</button>
            ) : (
              <button onClick={pause} className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white shadow hover:bg-amber-600">Pause</button>
            )}
            <button onClick={reset} className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200">Reset</button>
            <button onClick={skip} className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200">Skip</button>
          </div>

          <div className="mt-3 text-xs text-slate-500">Space: Start/Pause · R: Reset · S: Skip</div>
        </div>

        {showSettings && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            <NumberField label="Focus (min)" value={settings.focusMin} onChange={(v) => setMinutes("focusMin", v)} />
            <NumberField label="Short Break (min)" value={settings.shortBreakMin} onChange={(v) => setMinutes("shortBreakMin", v)} />
            <NumberField label="Long Break (min)" value={settings.longBreakMin} onChange={(v) => setMinutes("longBreakMin", v)} />
            <NumberField label="Cycles before Long" value={settings.cyclesBeforeLong} onChange={(v) => setSettings(s => ({ ...s, cyclesBeforeLong: Math.max(1, Math.min(12, Number(v) || 1)) }))} />

            <Toggle label="Auto-start next" checked={settings.autoStartNext} onChange={(v) => setSettings(s => ({...s, autoStartNext: v}))} />
            <Toggle label="Sound" checked={settings.soundOn} onChange={(v) => setSettings(s => ({...s, soundOn: v}))} />
            <Toggle label="Desktop notifications" checked={settings.notificationsOn} onChange={(v) => setSettings(s => ({...s, notificationsOn: v}))} />

            <div className="col-span-2 text-xs text-slate-500">
              Tip: Keep this tab open for notifications. You can tweak durations while running — we keep your current progress.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <input
        type="number"
        className="px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        min={1}
        max={180}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </label>
  );
}

function ModePill({ current, setMode }) {
  const mk = (m, label) => (
    <button
      key={m}
      className={`px-3 py-1.5 rounded-xl text-sm ${current === m ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
      onClick={() => setMode(m)}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-2">
      {mk("focus", "Focus")}
      {mk("short", "Short")}
      {mk("long", "Long")}
    </div>
  );
}
