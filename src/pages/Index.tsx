import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GenreSelector from "@/components/GenreSelector";
import TempoSelector from "@/components/TempoSelector";
import SongResult from "@/components/SongResult";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import { supabase } from "@/integrations/supabase/client";

interface Song {
  title: string;
  lyrics: string;
  structure: string;
  genre: string;
  tempo: string;
}

const Index = () => {
  const [genre, setGenre] = useState<string | null>(null);
  const [tempo, setTempo] = useState<string | null>(null);
  const [chorusLine, setChorusLine] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [song, setSong] = useState<Song | null>(null);

  const canGenerate = genre && tempo && chorusLine.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-song", {
        body: { genre, tempo, chorusLine },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSong(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate song. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSong(null);
    setGenre(null);
    setTempo(null);
    setChorusLine("");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Music className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Hit<span className="text-primary text-glow">Factory</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            AI-powered hit music creator
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {song ? (
            <SongResult key="result" song={song} onReset={handleReset} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <GenreSelector selected={genre} onSelect={setGenre} />
              <TempoSelector selected={tempo} onSelect={setTempo} />

              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Chorus Line
                </h2>
                <Textarea
                  placeholder="Write a short sentence for your chorus..."
                  value={chorusLine}
                  onChange={(e) => setChorusLine(e.target.value)}
                  className="glass-card bg-transparent border-border focus:border-primary resize-none h-24 font-mono text-sm placeholder:text-muted-foreground/50"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground mt-2 font-mono text-right">
                  {chorusLine.length}/120
                </p>
              </div>

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-lg p-6 text-center space-y-4"
                >
                  <WaveformVisualizer isPlaying={true} barCount={32} />
                  <p className="text-sm text-muted-foreground font-mono">
                    Composing your hit...
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 neon-glow disabled:opacity-30 disabled:shadow-none rounded-xl"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isGenerating ? "Creating Your Hit..." : "Generate Hit Song"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
