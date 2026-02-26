import { motion } from "framer-motion";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
  intensity?: number;
}

const WaveformVisualizer = ({ isPlaying, color = "bg-primary", barCount = 24, intensity = 0 }: WaveformVisualizerProps) => {
  // Use intensity from real audio analysis when available
  const effectiveIntensity = isPlaying ? Math.max(0.2, intensity) : 0;

  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${color}`}
          animate={
            isPlaying
              ? {
                  scaleY: [
                    0.1 + effectiveIntensity * 0.3,
                    0.1 + effectiveIntensity * (0.4 + Math.sin(i * 0.5) * 0.4),
                    0.1 + effectiveIntensity * 0.3,
                  ],
                  opacity: [0.4, 0.5 + effectiveIntensity * 0.5, 0.4],
                }
              : { scaleY: 0.08, opacity: 0.15 }
          }
          transition={
            isPlaying
              ? {
                  duration: 0.3 + (i % 5) * 0.08,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.02,
                }
              : { duration: 0.4 }
          }
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
