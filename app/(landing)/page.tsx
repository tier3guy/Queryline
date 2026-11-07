import CTA from "@/features/landing/components/cta";
import Hero from "@/features/landing/components/hero";
import Footer from "@/features/landing/components/footer";
import Header from "@/features/landing/components/header";
import Features from "@/features/landing/components/features";
import Workflow from "@/features/landing/components/workflow";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <CTA />
      </main>
      <Footer />
    </>
  );
}