import { motion } from "framer-motion";
import { Mic, Guitar, Piano, Music } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

const tracks = [
  { name: "Vocals", key: "vocals", icon: Mic, color: "bg-primary" },
  { name: "Guitar", key: "guitar", icon: Guitar, color: "bg-accent" },
  { name: "Piano", key: "piano", icon: Piano, color: "bg-[hsl(45,90%,55%)]" },
  { name: "Bass", key: "bass", icon: Music, color: "bg-[hsl(200,80%,55%)]" },
];

interface TrackDisplayProps {
  isPlaying: boolean;
  trackLevels?: { vocals: number; guitar: number; piano: number; bass: number };
}

const TrackDisplay = ({ isPlaying, trackLevels }: TrackDisplayProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Tracks
      </h2>
      {tracks.map((track, i) => {
        const Icon = track.icon;
        const level = trackLevels?.[track.key as keyof typeof trackLevels] ?? 0;
        return (
          <motion.div
            key={track.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-lg p-3 flex items-center gap-4"
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${track.color} bg-opacity-20`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium w-16 text-secondary-foreground">{track.name}</span>
            <div className="flex-1">
              <WaveformVisualizer isPlaying={isPlaying} color={track.color} barCount={32} intensity={level} />
            </div>
            {isPlaying && (
              <div className="w-8 text-right">
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round(level * 100)}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default TrackDisplay;
