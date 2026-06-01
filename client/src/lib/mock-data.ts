export interface Singer {
  id: string;
  name: string;
  genre: string;
  image: string;
  popularSong: string;
  followers: string;
}

export const singers: Singer[] = [
  {
    id: "1",
    name: "Luna Eclipse",
    genre: "Synthwave",
    image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=800",
    popularSong: "Neon Nights",
    followers: "2.4M"
  },
  {
    id: "2",
    name: "The Velvet Tones",
    genre: "Indie Rock",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800",
    popularSong: "Underground",
    followers: "1.8M"
  },
  {
    id: "3",
    name: "Echo & The Void",
    genre: "Alternative",
    image: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=800",
    popularSong: "Hollow",
    followers: "3.1M"
  },
  {
    id: "4",
    name: "Cyber Soul",
    genre: "R&B",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800",
    popularSong: "Digital Love",
    followers: "5.2M"
  },
  {
    id: "5",
    name: "Voltage",
    genre: "Electronic",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800",
    popularSong: "High Energy",
    followers: "800K"
  },
  {
    id: "6",
    name: "Midnight Jazz",
    genre: "Jazz",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800",
    popularSong: "Blue Moon",
    followers: "1.2M"
  },
  {
    id: "7",
    name: "Solar Flare",
    genre: "Pop",
    image: "https://images.unsplash.com/photo-1514525253440-b393452de23e?auto=format&fit=crop&q=80&w=800",
    popularSong: "Sunny Days",
    followers: "12M"
  },
  {
    id: "8",
    name: "Dust & Bones",
    genre: "Country",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f436?auto=format&fit=crop&q=80&w=800",
    popularSong: "Long Road Home",
    followers: "4.5M"
  }
];
