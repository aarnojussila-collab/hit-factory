import { motion } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Volume2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import TrackDisplay from "./TrackDisplay";
import { createMusicPlayer, MusicPlayer } from "@/lib/musicSynth";

interface SongResultProps {
  song: {
    title: string;
    lyrics: string;
    structure: string;
    genre: string;
    tempo: string;
  };
  genreId: string;
  tempoId: string;
  onReset: () => void;
}

const SongResult = ({ song, genreId, tempoId, onReset }: SongResultProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackLevels, setTrackLevels] = useState({ vocals: 0, guitar: 0, piano: 0, bass: 0 });
  const playerRef = useRef<MusicPlayer | null>(null);
  const rafRef = useRef<number>(0);

  const updateLevels = useCallback(() => {
    if (playerRef.current?.isPlaying()) {
      setTrackLevels(playerRef.current.getTrackLevels());
      rafRef.current = requestAnimationFrame(updateLevels);
    }
  }, []);

  useEffect(() => {
    playerRef.current = createMusicPlayer(
      genreId as any,
      tempoId as any
    );
    return () => {
      playerRef.current?.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, [genreId, tempoId]);

  const handlePlay = () => {
    playerRef.current?.play();
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(updateLevels);
  };

  const handlePause = () => {
    playerRef.current?.pause();
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  };

  const handleStop = () => {
    playerRef.current?.stop();
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
    setTrackLevels({ vocals: 0, guitar: 0, piano: 0, bass: 0 });
    // Recreate player for next play
    playerRef.current = createMusicPlayer(genreId as any, tempoId as any);
  };

  const handleReset = () => {
    playerRef.current?.stop();
    cancelAnimationFrame(rafRef.current);
    onReset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.h2
          className="text-3xl font-bold text-glow text-primary mb-1"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {song.title}
        </motion.h2>
        <p className="text-muted-foreground font-mono text-sm">
          {song.genre} · {song.tempo}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {isPlaying ? (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 border-primary/30 hover:border-primary hover:neon-glow"
            onClick={handlePause}
          >
            <Pause className="w-5 h-5 text-primary" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-14 h-14 border-primary neon-glow hover:bg-primary/10"
            onClick={handlePlay}
          >
            <Play className="w-6 h-6 text-primary ml-0.5" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-muted-foreground/30 hover:border-foreground"
          onClick={handleStop}
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-muted-foreground/30 hover:border-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {!isPlaying && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground font-mono flex items-center justify-center gap-1.5"
        >
          <Volume2 className="w-3.5 h-3.5" /> Press play to hear your song
        </motion.p>
      )}

      <TrackDisplay isPlaying={isPlaying} trackLevels={trackLevels} />

      <div className="glass-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
          Song Structure & Lyrics
        </h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-foreground font-mono">
          {song.lyrics}
        </div>
      </div>
    </motion.div>
  );
};

export default SongResult;
