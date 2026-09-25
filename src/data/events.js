export const eventCategories = [
  {
    id: 1,
    name: "Technology",
    slug: "technology",
    icon: "💻",
  },
  {
    id: 2,
    name: "Music",
    slug: "music",
    icon: "🎵",
  },
  {
    id: 3,
    name: "Business",
    slug: "business",
    icon: "💼",
  },
  {
    id: 4,
    name: "Sports",
    slug: "sports",
    icon: "⚽",
  },
  {
    id: 5,
    name: "Education",
    slug: "education",
    icon: "🎓",
  },
  {
    id: 6,
    name: "Arts & Culture",
    slug: "arts-culture",
    icon: "🎨",
  },
  {
    id: 7,
    name: "Health & Wellness",
    slug: "health-wellness",
    icon: "🧘",
  },
  {
    id: 8,
    name: "Food & Lifestyle",
    slug: "food-lifestyle",
    icon: "🍴",
  },
  {
    id: 9,
    name: "Travel",
    slug: "travel",
    icon: "✈️",
  },
];

/*
 * System-owned events
 *
 * These are the original EventON demo events.
 * They are not owned by a real registered user.
 *
 * Organizer-created events will use the logged-in
 * organizer's user ID as organizerId.
 */

export const SYSTEM_ORGANIZER_ID = "system-organizer";

export const events = [
  // =========================================================
  // 1. TECHNOLOGY
  // =========================================================

  {
    id: 1,
    title: "Tech Innovators Summit 2026",
    slug: "tech-innovators-summit-2026",
    category: "Technology",
    categorySlug: "technology",
    description:
      "A technology conference bringing developers, innovators, founders, and technology enthusiasts together.",
    date: "2026-10-10",
    time: "09:00 AM",
    endTime: "05:00 PM",
    location: "HICC, Hyderabad",
    city: "Hyderabad",
    organizer: "EventON Tech",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 999,
    capacity: 500,
    bookedSeats: 342,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 2,
    title: "Future of AI Conference",
    slug: "future-of-ai-conference",
    category: "Technology",
    categorySlug: "technology",
    description:
      "Explore artificial intelligence, machine learning, generative AI, and the future of intelligent systems.",
    date: "2026-10-18",
    time: "10:00 AM",
    endTime: "04:30 PM",
    location: "T-Hub, Hyderabad",
    city: "Hyderabad",
    organizer: "AI Community Hyderabad",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 799,
    capacity: 300,
    bookedSeats: 187,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 3,
    title: "Developer Community Meetup",
    slug: "developer-community-meetup",
    category: "Technology",
    categorySlug: "technology",
    description:
      "Meet developers, share projects, discuss modern technologies, and build meaningful professional connections.",
    date: "2026-10-31",
    time: "03:00 PM",
    endTime: "07:00 PM",
    location: "Microsoft Reactor, Bengaluru",
    city: "Bengaluru",
    organizer: "Developer Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 0,
    capacity: 200,
    bookedSeats: 126,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 4,
    title: "Cloud & DevOps Connect",
    slug: "cloud-devops-connect",
    category: "Technology",
    categorySlug: "technology",
    description:
      "A practical technology meetup covering cloud computing, DevOps, containers, CI/CD, and modern infrastructure.",
    date: "2026-11-21",
    time: "10:00 AM",
    endTime: "04:00 PM",
    location: "NIMHANS Convention Centre, Bengaluru",
    city: "Bengaluru",
    organizer: "Cloud Engineering Community",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 699,
    capacity: 350,
    bookedSeats: 214,
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 2. BUSINESS
  // =========================================================

  {
    id: 5,
    title: "Startup & Founders Meetup",
    slug: "startup-founders-meetup",
    category: "Business",
    categorySlug: "business",
    description:
      "Connect with startup founders, entrepreneurs, investors, and professionals building the next generation of businesses.",
    date: "2026-10-24",
    time: "02:00 PM",
    endTime: "07:00 PM",
    location: "Novotel HICC, Hyderabad",
    city: "Hyderabad",
    organizer: "Startup Hyderabad",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 499,
    capacity: 250,
    bookedSeats: 121,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 6,
    title: "Entrepreneurship Leadership Forum",
    slug: "entrepreneurship-leadership-forum",
    category: "Business",
    categorySlug: "business",
    description:
      "A leadership-focused forum featuring discussions on entrepreneurship, management, business strategy, and innovation.",
    date: "2026-11-07",
    time: "09:30 AM",
    endTime: "05:00 PM",
    location: "Taj Lands End, Mumbai",
    city: "Mumbai",
    organizer: "Business Leaders Forum",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1499,
    capacity: 450,
    bookedSeats: 286,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 7,
    title: "Digital Marketing Masterclass",
    slug: "digital-marketing-masterclass",
    category: "Business",
    categorySlug: "business",
    description:
      "Learn practical digital marketing strategies covering content, social media, analytics, branding, and customer growth.",
    date: "2026-12-05",
    time: "10:00 AM",
    endTime: "03:30 PM",
    location: "Pune International Convention Centre",
    city: "Pune",
    organizer: "Growth Marketing India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 899,
    capacity: 300,
    bookedSeats: 174,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 3. MUSIC
  // =========================================================

  {
    id: 8,
    title: "Hyderabad Music Festival",
    slug: "hyderabad-music-festival",
    category: "Music",
    categorySlug: "music",
    description:
      "An evening of live performances, independent artists, great music, and an unforgettable festival experience.",
    date: "2026-11-01",
    time: "05:00 PM",
    endTime: "10:00 PM",
    location: "Gachibowli Stadium, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Live",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1299,
    capacity: 2000,
    bookedSeats: 1450,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 9,
    title: "Indie Music Night",
    slug: "indie-music-night",
    category: "Music",
    categorySlug: "music",
    description:
      "Enjoy an intimate evening featuring independent musicians, acoustic performances, and emerging artists.",
    date: "2026-10-17",
    time: "06:00 PM",
    endTime: "10:00 PM",
    location: "Phoenix Marketcity, Mumbai",
    city: "Mumbai",
    organizer: "Indie Sounds India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 699,
    capacity: 800,
    bookedSeats: 526,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  {
    id: 10,
    title: "Sunset EDM Festival",
    slug: "sunset-edm-festival",
    category: "Music",
    categorySlug: "music",
    description:
      "A high-energy electronic music festival featuring DJs, live visuals, food, and a spectacular sunset experience.",
    date: "2026-12-12",
    time: "04:00 PM",
    endTime: "11:00 PM",
    location: "Vagator Beach, Goa",
    city: "Goa",
    organizer: "Sunset Events India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1799,
    capacity: 3000,
    bookedSeats: 2180,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 4. SPORTS
  // =========================================================

  {
    id: 11,
    title: "Hyderabad Marathon 2026",
    slug: "hyderabad-marathon-2026",
    category: "Sports",
    categorySlug: "sports",
    description:
      "Join runners from across the city for a professionally organized marathon and fitness experience.",
    date: "2026-11-15",
    time: "06:00 AM",
    endTime: "11:00 AM",
    location: "Necklace Road, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Runners",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 599,
    capacity: 1500,
    bookedSeats: 920,
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 12,
    title: "City Football Championship",
    slug: "city-football-championship",
    category: "Sports",
    categorySlug: "sports",
    description:
      "Watch local football teams compete in a city-level championship featuring exciting matches and sporting talent.",
    date: "2026-10-25",
    time: "04:00 PM",
    endTime: "09:00 PM",
    location: "Jawaharlal Nehru Stadium, Chennai",
    city: "Chennai",
    organizer: "City Sports Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 399,
    capacity: 5000,
    bookedSeats: 3125,
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 5. EDUCATION
  // =========================================================

  {
    id: 13,
    title: "Career & Placement Bootcamp",
    slug: "career-placement-bootcamp",
    category: "Education",
    categorySlug: "education",
    description:
      "A practical career preparation event covering resumes, interviews, coding, communication, and placement strategies.",
    date: "2026-11-08",
    time: "10:00 AM",
    endTime: "05:00 PM",
    location: "JNTUH Campus, Hyderabad",
    city: "Hyderabad",
    organizer: "Career Launch",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 299,
    capacity: 400,
    bookedSeats: 275,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  {
    id: 14,
    title: "Study Abroad Education Fair",
    slug: "study-abroad-education-fair",
    category: "Education",
    categorySlug: "education",
    description:
      "Explore international education opportunities, universities, scholarships, application processes, and career pathways.",
    date: "2026-10-11",
    time: "11:00 AM",
    endTime: "05:00 PM",
    location: "Chennai Trade Centre, Chennai",
    city: "Chennai",
    organizer: "Global Education Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 0,
    capacity: 1000,
    bookedSeats: 624,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 6. ARTS & CULTURE
  // =========================================================

  {
    id: 15,
    title: "Creative Arts Exhibition",
    slug: "creative-arts-exhibition",
    category: "Arts & Culture",
    categorySlug: "arts-culture",
    description:
      "Discover paintings, photography, digital art, installations, and creative works from emerging artists.",
    date: "2026-11-20",
    time: "11:00 AM",
    endTime: "07:00 PM",
    location: "State Art Gallery, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Arts Collective",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 199,
    capacity: 300,
    bookedSeats: 98,
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  {
    id: 16,
    title: "Heritage & Culture Festival",
    slug: "heritage-culture-festival",
    category: "Arts & Culture",
    categorySlug: "arts-culture",
    description:
      "Experience traditional art, cultural performances, crafts, history, and local heritage in one vibrant festival.",
    date: "2026-12-06",
    time: "10:00 AM",
    endTime: "08:00 PM",
    location: "Albert Hall Museum, Jaipur",
    city: "Jaipur",
    organizer: "Indian Heritage Foundation",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 299,
    capacity: 1200,
    bookedSeats: 734,
    image:
      "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 7. HEALTH & WELLNESS
  // =========================================================

  {
    id: 17,
    title: "Wellness & Fitness Expo",
    slug: "wellness-fitness-expo",
    category: "Health & Wellness",
    categorySlug: "health-wellness",
    description:
      "Explore fitness, nutrition, wellness practices, healthy living, and modern approaches to personal wellbeing.",
    date: "2026-10-31",
    time: "09:00 AM",
    endTime: "06:00 PM",
    location: "Hitex Exhibition Centre, Hyderabad",
    city: "Hyderabad",
    organizer: "Wellness India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 499,
    capacity: 1500,
    bookedSeats: 816,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 8. FOOD & LIFESTYLE
  // =========================================================

  {
    id: 18,
    title: "Hyderabad Food Carnival",
    slug: "hyderabad-food-carnival",
    category: "Food & Lifestyle",
    categorySlug: "food-lifestyle",
    description:
      "Taste local favourites, street food, desserts, international flavours, and creative dishes from popular food brands.",
    date: "2026-11-29",
    time: "12:00 PM",
    endTime: "10:00 PM",
    location: "NTR Gardens, Hyderabad",
    city: "Hyderabad",
    organizer: "Food Carnival India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 149,
    capacity: 2500,
    bookedSeats: 1630,
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 9. TRAVEL
  // =========================================================

  {
    id: 19,
    title: "India Travel & Adventure Expo",
    slug: "india-travel-adventure-expo",
    category: "Travel",
    categorySlug: "travel",
    description:
      "Discover destinations, adventure experiences, travel communities, tour operators, and unique Indian getaways.",
    date: "2026-12-19",
    time: "10:00 AM",
    endTime: "06:00 PM",
    location: "Bandra Kurla Complex, Mumbai",
    city: "Mumbai",
    organizer: "Travel India Expo",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 399,
    capacity: 2000,
    bookedSeats: 1120,
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 10. MIXED / TECHNOLOGY
  // =========================================================

  {
    id: 20,
    title: "Future Builders Conference",
    slug: "future-builders-conference",
    category: "Technology",
    categorySlug: "technology",
    description:
      "A cross-industry conference exploring technology, entrepreneurship, innovation, careers, and the future of work.",
    date: "2026-12-20",
    time: "09:30 AM",
    endTime: "05:30 PM",
    location: "Bharat Mandapam, New Delhi",
    city: "New Delhi",
    organizer: "Future Builders India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1199,
    capacity: 1800,
    bookedSeats: 1048,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },
];

/*
 * ============================================================
 * EVENT HELPERS
 * ============================================================
 */

/**
 * Get a single event by ID.
 */
export const getEventById = (id) => {
  return events.find(
    (event) => String(event.id) === String(id)
  );
};

/**
 * Get all featured events.
 */
export const getFeaturedEvents = () => {
  return events.filter(
    (event) => event.featured
  );
};

/**
 * Get events belonging to a category.
 */
export const getEventsByCategory = (
  categorySlug
) => {
  return events.filter(
    (event) =>
      event.categorySlug === categorySlug
  );
};

/**
 * Get available seats.
 */
export const getAvailableSeats = (event) => {
  if (!event) {
    return 0;
  }

  return Math.max(
    Number(event.capacity || 0) -
      Number(event.bookedSeats || 0),
    0
  );
};

/**
 * Check whether an event is sold out.
 */
export const isEventSoldOut = (event) => {
  return getAvailableSeats(event) === 0;
};

/**
 * Get events created by a specific organizer.
 *
 * This will be used by the Organizer Dashboard.
 */
export const getEventsByOrganizer = (
  organizerId
) => {
  return events.filter(
    (event) =>
      event.organizerId === organizerId
  );
};