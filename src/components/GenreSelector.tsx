import { motion } from "framer-motion";
import { Guitar, Music, Piano, Drum, Radio, Mic } from "lucide-react";

const genres = [
  { id: "rock", label: "Rock", icon: Guitar },
  { id: "jazz", label: "Jazz", icon: Music },
  { id: "classical", label: "Classical", icon: Piano },
  { id: "pop", label: "Pop", icon: Mic },
  { id: "electronic", label: "Electronic", icon: Radio },
  { id: "rnb", label: "R&B", icon: Drum },
];

interface GenreSelectorProps {
  selected: string | null;
  onSelect: (genre: string) => void;
}

const GenreSelector = ({ selected, onSelect }: GenreSelectorProps) => {
  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Genre
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {genres.map((genre) => {
          const Icon = genre.icon;
          const isSelected = selected === genre.id;
          return (
            <motion.button
              key={genre.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(genre.id)}
              className={`glass-card rounded-lg p-4 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary neon-glow"
                  : "hover:border-muted-foreground/30"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-sm font-medium ${isSelected ? "text-primary" : "text-secondary-foreground"}`}
              >
                {genre.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreSelector;
