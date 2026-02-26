import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

const WaveformVisualizer = ({ isPlaying, color = "bg-primary", barCount = 24 }: WaveformVisualizerProps) => {
  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={
            isPlaying
              ? {
                  scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3],
                  opacity: [0.5, 1, 0.5],
                }
              : { scaleY: 0.15, opacity: 0.2 }
          }
          transition={
            isPlaying
              ? {
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.03,
                }
              : { duration: 0.3 }
          }
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
