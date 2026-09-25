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
    id: 4,
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
    id: 5,
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
    featured: false,
    status: "published",
  },

  {
    id: 6,
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
    featured: false,
    status: "published",
  },

  {
    id: 7,
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
    id: 8,
    title: "Developer Community Meetup",
    slug: "developer-community-meetup",
    category: "Technology",
    categorySlug: "technology",
    description:
      "Meet developers, share projects, discuss modern technologies, and build meaningful connections.",
    date: "2026-11-28",
    time: "03:00 PM",
    endTime: "07:00 PM",
    location: "Microsoft Reactor, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Developers",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 0,
    capacity: 150,
    bookedSeats: 103,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },
];

/**
 * Get a single event by ID.
 */
export const getEventById = (id) => {
  return events.find(
    (event) => event.id === Number(id)
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