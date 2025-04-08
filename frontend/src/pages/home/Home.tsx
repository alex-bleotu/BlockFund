import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Features } from './components/Features';

export function Home() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}