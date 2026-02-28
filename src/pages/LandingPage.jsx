import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CompensationSection from '../components/CompensationSection';
import RanksSection from '../components/RanksSection';
import RiskSection from '../components/RiskSection';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
      return (
            <div className="app-container">
                  <Navbar />

                  <main>
                        <HeroSection />

                        {/* Visual Seperator */}
                        <div className="app-separator"></div>

                        <AboutSection />
                        <HowItWorksSection />
                        <CompensationSection />
                        <RanksSection />
                        <RiskSection />
                  </main>

                  <Footer />
                  <AuthModal />
            </div>
      );
};

export default LandingPage;
