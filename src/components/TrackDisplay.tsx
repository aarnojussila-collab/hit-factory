import { motion } from "framer-motion";
import { Mic, Guitar, Piano, Music } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

const tracks = [
  { name: "Vocals", icon: Mic, color: "bg-primary" },
  { name: "Guitar", icon: Guitar, color: "bg-accent" },
  { name: "Piano", icon: Piano, color: "bg-[hsl(45,90%,55%)]" },
  { name: "Bass", icon: Music, color: "bg-[hsl(200,80%,55%)]" },
];

interface TrackDisplayProps {
  isPlaying: boolean;
}

const TrackDisplay = ({ isPlaying }: TrackDisplayProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Tracks
      </h2>
      {tracks.map((track, i) => {
        const Icon = track.icon;
        return (
          <motion.div
            key={track.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-lg p-3 flex items-center gap-4"
          >
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${track.color} bg-opacity-20`}>
              <Icon className="w-4 h-4" style={{ color: "inherit" }} />
            </div>
            <span className="text-sm font-medium w-16 text-secondary-foreground">{track.name}</span>
            <div className="flex-1">
              <WaveformVisualizer isPlaying={isPlaying} color={track.color} barCount={32} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TrackDisplay;
