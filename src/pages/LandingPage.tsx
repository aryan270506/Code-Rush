import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import CompetitionRounds from "../components/CompetitionRounds";
import HowItWorks from "../components/HowItWorks";
import LeaderboardPreview from "../components/LeaderboardPreview";
import BenefitsSection from "../components/BenefitsSection";
import RulesSection from "../components/RulesSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <CompetitionRounds />
        <HowItWorks />
        <LeaderboardPreview />
        <BenefitsSection />
        <RulesSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
