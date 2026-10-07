import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, RotateCcw, RotateCw, Music2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Deck — MP3 Player" },
      {
        name: "description",
        content:
          "Darkmode-Audioplayer mit drei MP3-Tracks: Abspielen, zurück zum Anfang sowie 10 Sekunden vor und zurück.",
      },
      { property: "og:title", content: "Pulse Deck — MP3 Player" },
      {
        property: "og:description",
        content:
          "Darkmode-Audioplayer mit drei MP3-Tracks: Abspielen, zurück zum Anfang sowie 10 Sekunden vor und zurück.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

interface Track {
  title: string;
  artist: string;
  src: string;
  hue: string;
}

const TRACKS: Track[] = [
  {
    title: "SoundHelix Song 1",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    hue: "oklch(0.75 0.18 195)",
  },
  {
    title: "SoundHelix Song 2",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    hue: "oklch(0.72 0.19 330)",
  },
  {
    title: "SoundHelix Song 3",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    hue: "oklch(0.78 0.16 85)",
  },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackCard({ track, index }: { track: Track; index: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(track.src);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [track.src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  const toStart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(
      Math.max(audio.currentTime + delta, 0),
      Number.isFinite(audio.duration) ? audio.duration : Infinity,
    );
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_0_40px_-15px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-1">
      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: track.hue }}
      />

      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklch, ${track.hue} 18%, transparent)` }}
        >
          <Music2 className="h-6 w-6" style={{ color: track.hue }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Track {index + 1}
          </p>
          <h2 className="truncate text-lg font-semibold text-card-foreground">{track.title}</h2>
          <p className="text-sm text-muted-foreground">{track.artist}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-200"
            style={{ width: `${progress}%`, backgroundColor: track.hue }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={toStart}
          title="Zurück zum Anfang"
          aria-label="Zurück zum Anfang"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={() => skip(-10)}
          title="10 Sekunden zurück"
          aria-label="10 Sekunden zurück"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">10s zurück</span>
        </button>
        <button
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Abspielen"}
          aria-label={isPlaying ? "Pause" : "Abspielen"}
          className="flex h-14 w-14 items-center justify-center rounded-full text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: track.hue, boxShadow: `0 0 24px -4px ${track.hue}` }}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          )}
        </button>
        <button
          onClick={() => skip(10)}
          title="10 Sekunden vorwärts"
          aria-label="10 Sekunden vorwärts"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
        >
          <RotateCw className="h-4 w-4" />
          <span className="sr-only">10s vorwärts</span>
        </button>
        {/* Spacer to keep play button centered */}
        <div className="h-11 w-11" aria-hidden="true" />
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <main className="relative mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
            Darkmode Audio
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pulse Deck
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Drei MP3-Tracks bereit zum Abspielen — mit Sprung zum Anfang sowie 10 Sekunden vor und
            zurück.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {TRACKS.map((track, i) => (
            <TrackCard key={track.src} track={track} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
