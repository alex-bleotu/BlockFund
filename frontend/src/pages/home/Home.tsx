import { Features } from "./components/Features";
import { Hero } from "./components/Hero";
import { Stats } from "./components/Stats";

export function Home() {
    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Hero />
            <Stats />
            <Features />
        </div>
    );
}
