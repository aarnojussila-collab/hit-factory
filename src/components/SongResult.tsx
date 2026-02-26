import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import TrackDisplay from "./TrackDisplay";

interface SongResultProps {
  song: {
    title: string;
    lyrics: string;
    structure: string;
    genre: string;
    tempo: string;
  };
  onReset: () => void;
}

const SongResult = ({ song, onReset }: SongResultProps) => {
  const [isPlaying, setIsPlaying] = useState(true);

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
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-primary/30 hover:border-primary hover:neon-glow"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-5 h-5 text-primary" /> : <Play className="w-5 h-5 text-primary" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-muted-foreground/30 hover:border-foreground"
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      <TrackDisplay isPlaying={isPlaying} />

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
