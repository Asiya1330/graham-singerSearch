import { useState } from "react";
import { singers } from "@/lib/mock-data";
import { SingerCard } from "@/components/singer-card";
import { SearchBar } from "@/components/search-bar";
import heroBg from "@/assets/hero-bg.png";
import { motion } from "framer-motion";
import { Mic2, Music, Sparkles } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSingers = singers.filter((singer) =>
    singer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    singer.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    singer.popularSong.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Concert Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm font-medium backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Discover New Talent
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sound</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Explore the world's most talented vocalists, performers, and rising stars.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="relative z-10 px-4 py-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Mic2 className="text-primary w-5 h-5" />
            Trending Artists
          </h2>
          <span className="text-sm text-muted-foreground">
            Showing {filteredSingers.length} results
          </span>
        </div>

        {filteredSingers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSingers.map((singer, index) => (
              <SingerCard key={singer.id} singer={singer} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No artists found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </section>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
