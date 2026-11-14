import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  RotateCcw,
  RotateCw,
  Music2,
} from "lucide-react";
import cover1 from "@/assets/martin_schiff_pirata_200x300.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Deck — MP3 Player" },
      {
        name: "description",
        content:
          "Darkmode-Audioplayer für „Mein Traum“: Abspielen, zurück zum Anfang sowie 10 Sekunden vor und zurück.",
      },
      { property: "og:title", content: "Pulse Deck — MP3 Player" },
      {
        property: "og:description",
        content:
          "Darkmode-Audioplayer für „Mein Traum“: Abspielen, zurück zum Anfang sowie 10 Sekunden vor und zurück.",
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
  image: string;
}

const TRACK: Track = {
  title: "Mein Traum",
  artist: "Hans Frischknecht",
  src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  hue: "oklch(0.75 0.18 195)",
  image: cover1,
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackCard({ track }: { track: Track }) {
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
    <div className="group relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[0_0_40px_-15px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-1 sm:p-6">
      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: track.hue }}
      />

      {/* Fixed cover image — 200 x 300 px, scaled proportionally on very narrow screens */}
      <div className="relative mx-auto aspect-[2/3] w-[200px] max-w-full overflow-hidden rounded-xl border border-border bg-secondary/50">
        <img
          src={track.image}
          alt={`Cover zu ${track.title}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklch, ${track.hue} 18%, transparent)` }}
        >
          <Music2 className="h-5 w-5" style={{ color: track.hue }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Track 1
          </p>
          <h2 className="truncate text-lg font-semibold text-card-foreground">{track.title}</h2>
          <p className="text-sm text-muted-foreground">{track.artist}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
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
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={toStart}
          title="Zurück zum Anfang"
          aria-label="Zurück zum Anfang"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent sm:h-11 sm:w-11"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={() => skip(-10)}
          title="10 Sekunden zurück"
          aria-label="10 Sekunden zurück"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent sm:h-11 sm:w-11"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">10s zurück</span>
        </button>
        <button
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Abspielen"}
          aria-label={isPlaying ? "Pause" : "Abspielen"}
          className="flex h-12 w-12 items-center justify-center rounded-full text-background shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent sm:h-11 sm:w-11"
        >
          <RotateCw className="h-4 w-4" />
          <span className="sr-only">10s vorwärts</span>
        </button>
        {/* Spacer to keep play button centered */}
        <div className="h-10 w-10 sm:h-11 sm:w-11" aria-hidden="true" />
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <TrackCard track={TRACK} />
      </main>
    </div>
  );
}
