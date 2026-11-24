import { ExternalLink, Headphones, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAppUrl } from '../../config/domain';
import { useStoredState } from '../../hooks/useStoredState';
import { previews, siteCopy } from '../../lib/content';

const tracks = previews.audioTracks;

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function MusicWidget(): React.JSX.Element {
  const [index, setIndex] = useStoredState<number>('widget:music:track', 0);
  const [seconds, setSeconds] = useStoredState<number>('widget:music:second', 0);
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const track = tracks[index % tracks.length];

  const stopTone = useCallback(() => {
    try {
      oscillatorRef.current?.stop();
      void contextRef.current?.close();
    } catch {
      /* audio already stopped */
    }
    contextRef.current = null;
    oscillatorRef.current = null;
    gainRef.current = null;
  }, []);

  const startTone = useCallback((trackIndex: number) => {
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 196 + (trackIndex % tracks.length) * 36;
      gain.gain.value = 0.012;
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      contextRef.current = context;
      oscillatorRef.current = oscillator;
      gainRef.current = gain;
    } catch {
      /* audio preview is optional */
    }
  }, []);

  useEffect(() => stopTone, [stopTone]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setSeconds((previous) => previous + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing, setSeconds]);

  useEffect(() => {
    if (seconds < track.durationSeconds) return;
    setSeconds(0);
    stopTone();
    setIndex((previous) => (previous + 1) % tracks.length);
  }, [seconds, track.durationSeconds, setIndex, stopTone, setSeconds]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
      });
      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        setIndex((previous) => (previous + 1) % tracks.length);
        setSeconds(0);
      });
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch {
      /* MediaSession unsupported */
    }
    return () => {
      try {
        navigator.mediaSession.metadata = null;
      } catch {
        /* ignore */
      }
    };
  }, [track, playing, setIndex, setSeconds]);

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      stopTone();
    } else {
      setPlaying(true);
      startTone(index);
    }
  };

  return (
    <section
      aria-labelledby="music-preview"
      className="mb-8 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
    >
      <header className="flex items-center gap-2">
        <Headphones size={18} className="text-brand-600 dark:text-brand-50" aria-hidden="true" />
        <h3 id="music-preview" className="text-lg font-bold">
          Low-ad offline audio preview
        </h3>
      </header>

      <div className="mt-4 grid gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="grid size-[120px] place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 text-white shadow-lg">
          <span className="text-4xl font-black">{track.title.slice(0, 1)}</span>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-50">
            {track.playlist} · {track.album}
          </p>
          <p className="mt-1 text-xl font-extrabold">{track.title}</p>
          <p className="text-sm text-slate-500">{track.artist}</p>
          <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm italic leading-6 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            “{track.lyricLine}”
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700 active:scale-95"
            >
              {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${Math.min(100, (seconds / track.durationSeconds) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-slate-500">
                {formatTime(seconds)} / {formatTime(track.durationSeconds)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <fieldset className="mt-5 flex min-h-8 flex-wrap gap-2">
        <legend className="sr-only">Playlist tracks</legend>
        {tracks.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIndex(itemIndex);
              setSeconds(0);
              stopTone();
              if (playing) startTone(itemIndex);
            }}
            className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${itemIndex === index ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-50' : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}
          >
            {item.title}
          </button>
        ))}
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] leading-5 text-slate-500">{siteCopy.widgets.music.description}</p>
        <a
          href={getAppUrl('music')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-brand-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-50 dark:hover:bg-brand-500/10"
        >
          {siteCopy.widgets.music.cta} <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
