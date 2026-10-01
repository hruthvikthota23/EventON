import CategorySection from "../../components/events/CategorySection";
import FeaturedEvents from "../../components/events/FeaturedEvents";
import UpcomingEvents from "../../components/events/UpcomingEvents";
import WhyEventON from "../../components/home/WhyEventON";
import OrganizerCTA from "../../components/home/OrganizerCTA";
import HomeHero from "../../components/home/HomeHero";

function Home() {
  return (
    <main className="bg-white">
      <HomeHero />

      <CategorySection />
      <FeaturedEvents />
      <UpcomingEvents />
      <WhyEventON />
      <OrganizerCTA />
    </main>
  );
}

export default Home;