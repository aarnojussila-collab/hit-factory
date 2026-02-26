import { motion } from "framer-motion";

const tempos = [
  { id: "slow", label: "Slow", bpm: "60-80 BPM", emoji: "🐢" },
  { id: "medium", label: "Medium", bpm: "100-120 BPM", emoji: "🚶" },
  { id: "fast", label: "Fast", bpm: "140-170 BPM", emoji: "⚡" },
];

interface TempoSelectorProps {
  selected: string | null;
  onSelect: (tempo: string) => void;
}

const TempoSelector = ({ selected, onSelect }: TempoSelectorProps) => {
  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Tempo
      </h2>
      <div className="flex gap-3">
        {tempos.map((tempo) => {
          const isSelected = selected === tempo.id;
          return (
            <motion.button
              key={tempo.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(tempo.id)}
              className={`glass-card rounded-lg p-4 flex-1 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary neon-glow"
                  : "hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-2xl">{tempo.emoji}</span>
              <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-secondary-foreground"}`}>
                {tempo.label}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{tempo.bpm}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TempoSelector;
