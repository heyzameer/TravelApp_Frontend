import { Hero } from '@/components/home/Hero';
import { DestinationCarousel } from '@/components/home/DestinationCarousel';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';

export default function Home() {
  return (
    <main className="min-h-screen bg-white" suppressHydrationWarning>
      <Hero />
      <DestinationCarousel />
      <FeaturedProperties />

      {/* Newsletter / Footer CTA */}
      <section className="py-24 bg-gray-900 text-center px-4" suppressHydrationWarning>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to Explore?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join thousands of travelers finding their perfect nature stays with TravelHub.</p>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-95">
          Start Your Journey
        </button>
      </section>
    </main>
  );
}
