import { useEffect, useMemo, useState } from "react";
import heroBg from "@/assets/hero-bg.png";
import { motion } from "framer-motion";
import { MapPin, Mic2, Music, Search, Sparkles } from "lucide-react";

type ApiSinger = {
  id: number;
  first_name: string;
  last_name: string;
  primary_voice_type?: string | null;
  primary_fach?: string | null;
  headshot_url?: string | null;
  city?: string | null;
  state?: string | null;
};

function matchesQuery(singer: ApiSinger, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    singer.first_name,
    singer.last_name,
    singer.primary_voice_type,
    singer.primary_fach,
    singer.city,
    singer.state,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function FeaturedSingerCard({ singer, index }: { singer: ApiSinger; index: number }) {
  const name = `${singer.first_name} ${singer.last_name}`.trim();
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/5] bg-muted relative">
        {singer.headshot_url ? (
          <img
            src={singer.headshot_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Mic2 className="w-10 h-10 opacity-40" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {singer.primary_fach || singer.primary_voice_type || "Professional singer"}
        </p>
        {(singer.city || singer.state) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {[singer.city, singer.state].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </motion.article>
  );
}

type FeaturedSingersProps = {
  limit?: number;
  searchQuery?: string;
  className?: string;
};

export function FeaturedSingers({ limit, searchQuery = "", className = "" }: FeaturedSingersProps) {
  const [singers, setSingers] = useState<ApiSinger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/search");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load singers");
        if (!cancelled) setSingers(data.results || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load singers");
          setSingers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSingers = useMemo(() => {
    const filtered = singers.filter((s) => matchesQuery(s, searchQuery));
    return limit ? filtered.slice(0, limit) : filtered;
  }, [singers, searchQuery, limit]);

  if (loading) {
    return (
      <div className={`text-center py-16 text-muted-foreground ${className}`}>
        Loading singers…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-16 text-destructive ${className}`}>
        {error}
      </div>
    );
  }

  if (filteredSingers.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
          <Music className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">No singers found</h3>
        <p className="text-muted-foreground">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {filteredSingers.map((singer, index) => (
        <FeaturedSingerCard key={singer.id} singer={singer} index={index} />
      ))}
    </div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Concert Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

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
              Explore professional vocalists from the Singer Search database.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto w-full"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, voice type, fach, or location…"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-background/80 backdrop-blur border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Mic2 className="text-primary w-5 h-5" />
            Featured Singers
          </h2>
        </div>

        <FeaturedSingers searchQuery={searchQuery} />
      </section>

      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
