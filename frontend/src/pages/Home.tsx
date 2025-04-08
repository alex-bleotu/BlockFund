import { Hero } from './home/Hero';
import { Stats } from './home/Stats';
import { Features } from './home/Features';
import { CTA } from './home/CTA';

export function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}