
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '../components/home-sections/HeroSection';
import Footer from "../components/Footer";
import FeaturedPets from "../components/FeaturedPets";
import AnimatedSection from '../components/home-sections/AnimatedPetOptionSection';
import CallToActionSection from "../components/home-sections/CallToActionSection";
import HowStraySpotWorksSection from '../components/home-sections/HowStraySpotWorksSection';
import WaysToHelpSection from '../components/home-sections/WaysToHelpSection';
import OurImpactSection from '../components/home-sections/OurImpactSection';

export default async function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Enhanced Quick Search Section */}
      <AnimatedSection />

      {/* Featured Pets Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Pets Looking for Homes</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Meet some of our adorable pets waiting to find their forever families.</p>

          <FeaturedPets />

          <div className="text-center mt-10">
            <Link href="/browse/pets" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
              View All Pets
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowStraySpotWorksSection />

      {/* Ways to Help Section */}
      <WaysToHelpSection />


      {/* Impact Stats Section  */}
      <OurImpactSection />

      {/* CTA Section */}
      <CallToActionSection />

      <Footer />
    </>
  );
}


