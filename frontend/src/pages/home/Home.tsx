import { Features } from "./components/Features";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";
import { TopCampaigns } from "./components/TopCampaigns";

export function Home() {
    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Hero />
            <Stats />
            <TopCampaigns />
            <Features />
        </div>
    );
}
