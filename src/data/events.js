// =========================================================
// EVENT CATEGORIES
// =========================================================

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

// =========================================================
// SYSTEM ORGANIZER
// =========================================================

export const SYSTEM_ORGANIZER_ID = "system-organizer";

// =========================================================
// DATE / TIME HELPERS
// =========================================================

/**
 * Format Date object as YYYY-MM-DD
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Get a date relative to today.
 *
 * Example:
 * getDateFromToday(5)
 * = 5 days from today
 *
 * getDateFromToday(-3)
 * = 3 days before today
 */
const getDateFromToday = (daysFromToday = 0) => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);

  return formatDate(date);
};

/**
 * Format a Date object into 12-hour time.
 */
const formatTime = (date) => {
  let hours = date.getHours();

  const minutes = String(date.getMinutes()).padStart(2, "0");

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
};

/**
 * Create an event guaranteed to be Ongoing
 * when the seed data is initialized.
 *
 * Start = 1 hour before current time
 * End   = 2 hours after current time
 */
const getOngoingEventTiming = (startOffsetHours = -1, endOffsetHours = 2) => {
  const now = new Date();

  const start = new Date(
    now.getTime() + startOffsetHours * 60 * 60 * 1000
  );

  const end = new Date(
    now.getTime() + endOffsetHours * 60 * 60 * 1000
  );

  return {
    date: formatDate(now),
    time: formatTime(start),
    endTime: formatTime(end),
  };
};

// Two separate ongoing events.
// Both use today's date and times surrounding the current time.
const ongoingTiming1 = getOngoingEventTiming(-1, 2);
const ongoingTiming2 = getOngoingEventTiming(-2, 3);

// =========================================================
// DEFAULT EVENTS
// =========================================================
//
// TOTAL DEFAULT EVENTS = 15
//
// Lifecycle distribution:
//
// 1  -> Completed
// 2  -> Completed
//
// 3  -> Ongoing
// 4  -> Ongoing
//
// 5-13 -> Upcoming (9)
//
// 14 -> Cancelled
// 15 -> Cancelled
//
// =========================================================

export const events = [
  // =========================================================
  // 1. TECHNOLOGY - COMPLETED
  // =========================================================

  {
    id: 1,
    title: "Tech Innovators Summit 2026",
    slug: "tech-innovators-summit-2026",
    category: "Technology",
    categorySlug: "technology",
    description:
      "A technology conference bringing developers, innovators, founders, and technology enthusiasts together.",
    date: getDateFromToday(-7),
    time: "09:00 AM",
    endTime: "05:00 PM",
    location: "HICC, Hyderabad",
    city: "Hyderabad",
    organizer: "EventON Tech",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 999,
    capacity: 500,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 2. TECHNOLOGY - COMPLETED
  // =========================================================

  {
    id: 2,
    title: "Future of AI Conference",
    slug: "future-of-ai-conference",
    category: "Technology",
    categorySlug: "technology",
    description:
      "Explore artificial intelligence, machine learning, generative AI, and the future of intelligent systems.",
    date: getDateFromToday(-3),
    time: "10:00 AM",
    endTime: "04:30 PM",
    location: "T-Hub, Hyderabad",
    city: "Hyderabad",
    organizer: "AI Community Hyderabad",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 799,
    capacity: 300,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 3. TECHNOLOGY - ONGOING
  // =========================================================

  {
    id: 3,
    title: "Developer Community Meetup",
    slug: "developer-community-meetup",
    category: "Technology",
    categorySlug: "technology",
    description:
      "Meet developers, share projects, discuss modern technologies, and build meaningful professional connections.",
    date: ongoingTiming1.date,
    time: ongoingTiming1.time,
    endTime: ongoingTiming1.endTime,
    location: "Microsoft Reactor, Bengaluru",
    city: "Bengaluru",
    organizer: "Developer Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 0,
    capacity: 200,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 4. BUSINESS - ONGOING
  // =========================================================

  {
    id: 4,
    title: "Startup & Founders Meetup",
    slug: "startup-founders-meetup",
    category: "Business",
    categorySlug: "business",
    description:
      "Connect with startup founders, entrepreneurs, investors, and professionals building the next generation of businesses.",
    date: ongoingTiming2.date,
    time: ongoingTiming2.time,
    endTime: ongoingTiming2.endTime,
    location: "Novotel HICC, Hyderabad",
    city: "Hyderabad",
    organizer: "Startup Hyderabad",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 499,
    capacity: 250,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 5. BUSINESS - UPCOMING
  // =========================================================

  {
    id: 5,
    title: "Cloud & DevOps Connect",
    slug: "cloud-devops-connect",
    category: "Technology",
    categorySlug: "technology",
    description:
      "A practical technology meetup covering cloud computing, DevOps, containers, CI/CD, and modern infrastructure.",
    date: getDateFromToday(3),
    time: "10:00 AM",
    endTime: "04:00 PM",
    location: "NIMHANS Convention Centre, Bengaluru",
    city: "Bengaluru",
    organizer: "Cloud Engineering Community",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 699,
    capacity: 350,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 6. BUSINESS - UPCOMING
  // =========================================================

  {
    id: 6,
    title: "Entrepreneurship Leadership Forum",
    slug: "entrepreneurship-leadership-forum",
    category: "Business",
    categorySlug: "business",
    description:
      "A leadership-focused forum featuring discussions on entrepreneurship, management, business strategy, and innovation.",
    date: getDateFromToday(8),
    time: "09:30 AM",
    endTime: "05:00 PM",
    location: "Taj Lands End, Mumbai",
    city: "Mumbai",
    organizer: "Business Leaders Forum",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1499,
    capacity: 450,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 7. BUSINESS - UPCOMING
  // =========================================================

  {
    id: 7,
    title: "Digital Marketing Masterclass",
    slug: "digital-marketing-masterclass",
    category: "Business",
    categorySlug: "business",
    description:
      "Learn practical digital marketing strategies covering content, social media, analytics, branding, and customer growth.",
    date: getDateFromToday(12),
    time: "10:00 AM",
    endTime: "03:30 PM",
    location: "Pune International Convention Centre",
    city: "Pune",
    organizer: "Growth Marketing India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 899,
    capacity: 300,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 8. MUSIC - UPCOMING
  // =========================================================

  {
    id: 8,
    title: "Hyderabad Music Festival",
    slug: "hyderabad-music-festival",
    category: "Music",
    categorySlug: "music",
    description:
      "An evening of live performances, independent artists, great music, and an unforgettable festival experience.",
    date: getDateFromToday(16),
    time: "05:00 PM",
    endTime: "10:00 PM",
    location: "Gachibowli Stadium, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Live",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1299,
    capacity: 2000,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 9. MUSIC - UPCOMING
  // =========================================================

  {
    id: 9,
    title: "Indie Music Night",
    slug: "indie-music-night",
    category: "Music",
    categorySlug: "music",
    description:
      "Enjoy an intimate evening featuring independent musicians, acoustic performances, and emerging artists.",
    date: getDateFromToday(20),
    time: "06:00 PM",
    endTime: "10:00 PM",
    location: "Phoenix Marketcity, Mumbai",
    city: "Mumbai",
    organizer: "Indie Sounds India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 699,
    capacity: 800,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 10. MUSIC - UPCOMING
  // =========================================================

  {
    id: 10,
    title: "Sunset EDM Festival",
    slug: "sunset-edm-festival",
    category: "Music",
    categorySlug: "music",
    description:
      "A high-energy electronic music festival featuring DJs, live visuals, food, and a spectacular sunset experience.",
    date: getDateFromToday(24),
    time: "04:00 PM",
    endTime: "11:00 PM",
    location: "Vagator Beach, Goa",
    city: "Goa",
    organizer: "Sunset Events India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 1799,
    capacity: 3000,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 11. SPORTS - UPCOMING
  // =========================================================

  {
    id: 11,
    title: "Hyderabad Marathon 2026",
    slug: "hyderabad-marathon-2026",
    category: "Sports",
    categorySlug: "sports",
    description:
      "Join runners from across the city for a professionally organized marathon and fitness experience.",
    date: getDateFromToday(28),
    time: "06:00 AM",
    endTime: "11:00 AM",
    location: "Necklace Road, Hyderabad",
    city: "Hyderabad",
    organizer: "Hyderabad Runners",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 599,
    capacity: 1500,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 12. SPORTS - UPCOMING
  // =========================================================

  {
    id: 12,
    title: "City Football Championship",
    slug: "city-football-championship",
    category: "Sports",
    categorySlug: "sports",
    description:
      "Watch local football teams compete in a city-level championship featuring exciting matches and sporting talent.",
    date: getDateFromToday(32),
    time: "04:00 PM",
    endTime: "09:00 PM",
    location: "Jawaharlal Nehru Stadium, Chennai",
    city: "Chennai",
    organizer: "City Sports Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 399,
    capacity: 5000,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "published",
  },

  // =========================================================
  // 13. EDUCATION - UPCOMING
  // =========================================================

  {
    id: 13,
    title: "Career & Placement Bootcamp",
    slug: "career-placement-bootcamp",
    category: "Education",
    categorySlug: "education",
    description:
      "A practical career preparation event covering resumes, interviews, coding, communication, and placement strategies.",
    date: getDateFromToday(36),
    time: "10:00 AM",
    endTime: "05:00 PM",
    location: "JNTUH Campus, Hyderabad",
    city: "Hyderabad",
    organizer: "Career Launch",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 299,
    capacity: 400,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "published",
  },

  // =========================================================
  // 14. EDUCATION - CANCELLED
  // =========================================================

  {
    id: 14,
    title: "Study Abroad Education Fair",
    slug: "study-abroad-education-fair",
    category: "Education",
    categorySlug: "education",
    description:
      "Explore international education opportunities, universities, scholarships, application processes, and career pathways.",
    date: getDateFromToday(18),
    time: "11:00 AM",
    endTime: "05:00 PM",
    location: "Chennai Trade Centre, Chennai",
    city: "Chennai",
    organizer: "Global Education Network",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 0,
    capacity: 1000,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    status: "cancelled",
  },

  // =========================================================
  // 15. HEALTH & WELLNESS - CANCELLED
  // =========================================================

  {
    id: 15,
    title: "Wellness & Fitness Expo",
    slug: "wellness-fitness-expo",
    category: "Health & Wellness",
    categorySlug: "health-wellness",
    description:
      "Explore fitness, nutrition, wellness practices, healthy living, and modern approaches to personal wellbeing.",
    date: getDateFromToday(22),
    time: "09:00 AM",
    endTime: "06:00 PM",
    location: "Hitex Exhibition Centre, Hyderabad",
    city: "Hyderabad",
    organizer: "Wellness India",
    organizerId: SYSTEM_ORGANIZER_ID,
    price: 499,
    capacity: 1500,
    bookedSeats: 0,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    status: "cancelled",
  },
];

// =========================================================
// EVENT HELPERS
// =========================================================

export const getEventById = (id) => {
  return events.find(
    (event) => String(event.id) === String(id)
  );
};

export const getFeaturedEvents = () => {
  return events.filter((event) => event.featured);
};

export const getEventsByCategory = (categorySlug) => {
  return events.filter(
    (event) => event.categorySlug === categorySlug
  );
};

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

export const isEventSoldOut = (event) => {
  return getAvailableSeats(event) === 0;
};

export const getEventsByOrganizer = (organizerId) => {
  return events.filter(
    (event) => event.organizerId === organizerId
  );
};