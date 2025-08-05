'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowDown, Pause, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { Citation } from '@/components/Citation';
import { ParallaxLakeAnimation } from '@/components/ParallaxLakeAnimation';
import { ParallaxLakeOverlay } from '@/components/ParallaxLakeOverlay';

export default function StoryPage() {
  const searchParams = useSearchParams();
  const shouldAutoplay = searchParams.get('autoplay') === 'true';
  const [isPlaying, setIsPlaying] = useState(false); // Will be set based on autoplay param
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | null>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const isPlayingRef = useRef(isPlaying);
  const [shouldPauseAtLakes, setShouldPauseAtLakes] = useState(true);
  const [hasReachedLakeSection, setHasReachedLakeSection] = useState(false);

  // Memoized callbacks to prevent infinite re-renders
  const handleAnimationComplete = useCallback(() => {
    // Resume scroll after lakes appear
    setTimeout(() => {
      setIsPlaying(true);
    }, 1000); // Wait 1 second after lakes appear before resuming
  }, []);

  const handleDisappearComplete = useCallback(() => {
    // Optional: handle when all lakes have disappeared
  }, []);
  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const autoScroll = () => {
    console.log('autoScroll called, isPlaying:', isPlayingRef.current); // Debug log
    if (!isPlayingRef.current) return;

    // Check if we should pause at section 2 (lake section)
    if (shouldPauseAtLakes && currentSection === 2 && !hasReachedLakeSection) {
      // Pause auto-scroll when reaching lake section
      setIsPlaying(false);
      setHasReachedLakeSection(true);
      return;
    }

    // Much slower, more cinematic scroll that doesn't interfere with manual scrolling
    const scrollSpeed = 1.2; // pixels per frame - slightly increased for smoother motion
    window.scrollBy({
      top: scrollSpeed,
      behavior: 'auto' // Use 'auto' to allow manual override
    });

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      setIsPlaying(false);
    } else {
      animationRef.current = requestAnimationFrame(autoScroll);
    }
  };
  const togglePlayPause = () => {
    console.log('Toggle play/pause, current state:', isPlaying); // Debug log
    setIsPlaying(!isPlaying);
  };

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrolled / totalHeight) * 100;
      setScrollProgress(progress);

      // Update current section based on scroll
      const sections = sectionsRef.current;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i] && scrolled >= sections[i].offsetTop - window.innerHeight / 2) {
          setCurrentSection(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fade in on mount and check autoplay
  useEffect(() => {
    setIsVisible(true);
    
    // If coming from homepage, start autoplay after a delay
    if (shouldAutoplay) {
      const autoplayTimer = setTimeout(() => {
        setIsPlaying(true);
      }, 1500); // Give time for page to load
      
      return () => clearTimeout(autoplayTimer);
    }
  }, [shouldAutoplay]);

  // Start auto-scroll when component mounts or when isPlaying changes
  useEffect(() => {
    console.log('isPlaying changed to:', isPlaying); // Debug log
    
    if (isPlaying) {
      // Start auto-scroll after a short delay
      const timer = setTimeout(() => {
        console.log('Starting auto-scroll'); // Debug log
        autoScroll();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (animationRef.current) {
      // Cancel animation if playing stops
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [isPlaying]); // Run when isPlaying changes

  return (
    <>
      {/* Parallax Lake Overlay - Fixed position for true parallax */}
      <ParallaxLakeOverlay 
        isActive={currentSection === 2}
        currentSection={currentSection}
        onAnimationComplete={handleAnimationComplete}
        onDisappearComplete={handleDisappearComplete}
      />
      
      {/* Fixed Navigation Bar - Outside of the main content div */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1c2433]/95 backdrop-blur-lg border-b border-[#3d4354]/50">
        <div className="flex justify-between items-center p-4">
          {/* Back Button - Top Left */}
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#1c2433]/90 backdrop-blur-sm border-[#3d4354] !text-[#e5e5e5] hover:bg-[#2a3656] hover:border-[#e05d38] shadow-lg transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          {/* Play/Pause Button - Top Right */}
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="icon"
            className="bg-[#1c2433]/90 backdrop-blur-sm border-[#3d4354] !text-[#e5e5e5] hover:bg-[#2a3656] hover:border-[#e05d38] shadow-lg transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Progress Bar - At bottom of nav */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          <div 
            className="h-full bg-[#e05d38] transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen bg-[#1c2433] text-[#e5e5e5] overflow-x-hidden transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

      {/* Scroll Indicator - Hide on last section */}
      {!isPlaying && currentSection < 11 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-gray-400 tracking-widest">SCROLL</span>
            <ArrowDown className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Story Content - Proper padding for fixed nav */}
      <main className="relative pt-[73px]">
        {/* Chapter 1: The Beginning */}
        <section 
          ref={el => sectionsRef.current[0] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="mb-8 opacity-0 animate-fade-in">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">CHAPTER 1</span>
              <h2 className="text-5xl font-light mt-4 mb-8 text-[#e5e5e5]">The Blue Heritage</h2>
            </div>
            <p className="text-3xl font-light leading-relaxed opacity-0 animate-fade-in-delay text-[#a3a3a3]">
              For over 400 years, Hyderabad wasn't just a city.
            </p>
            <p className="text-3xl font-light leading-relaxed mt-6 opacity-0 animate-fade-in-delay-2 text-[#a3a3a3]">
              It was an <span className="text-[#86a7c8]">oasis</span> in the Deccan plateau
              <Citation 
                number={1}
                title="Deccan Plateau"
                description="One of the oldest and most stable land formations in India, the Deccan Plateau is a large plateau covering most of South India. Its semi-arid climate made water conservation crucial for ancient civilizations."
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Deccan%2C_India.png/250px-Deccan%2C_India.png"
                sourceUrl="https://en.wikipedia.org/wiki/Deccan_Plateau"
              />.
            </p>
          </div>
        </section>

        {/* The Golden Era */}
        <section 
          ref={el => sectionsRef.current[1] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/30 to-[#1c2433]" />
            <WaterRippleEffect />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <p className="text-xl font-light mb-12 opacity-0 animate-fade-in text-[#a3a3a3]">
              The Nizams
              <Citation 
                number={2}
                title="Nizams of Hyderabad"
                description="The Nizams were the rulers of Hyderabad State from 1724 to 1948. They were among the wealthiest people in the world and were known for their patronage of arts, culture, and infrastructure, including extensive water conservation systems."
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/9/94/Hyderabad_Coat_of_Arms.jpg"
                sourceUrl="https://en.wikipedia.org/wiki/Nizam_of_Hyderabad"
              />
              understood something we've forgotten:
            </p>
            <blockquote className="text-5xl font-light italic leading-tight opacity-0 animate-fade-in-delay text-[#e5e5e5]">
              "A city without water<br/>
              is a city without a <span className="text-[#86a7c8]">soul</span>"
            </blockquote>
            <p className="text-sm text-[#a3a3a3] mt-8 opacity-0 animate-fade-in-delay-2">
              — Ancient Hyderabadi proverb
            </p>
          </div>
        </section>

        {/* The Numbers Reveal */}
        <section 
          ref={el => sectionsRef.current[2] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-radial from-[#2a3656]/20 via-[#1c2433] to-[#1c2433]" />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-light mb-8 opacity-0 animate-fade-in">
              In 1984, when satellites first mapped our waters...
            </p>
            <div className="my-16 relative">
              <ParallaxLakeAnimation 
                target={4032} 
                duration={3000} 
                sectionIndex={2} 
                currentSection={currentSection}
                onAnimationComplete={handleAnimationComplete}
                onDisappearComplete={handleDisappearComplete}
              />
              <p className="text-3xl font-light text-[#86a7c8] mt-4 opacity-0 animate-fade-in-delay-2">
                lakes and water bodies
              </p>
            </div>
            <p className="text-xl font-light mt-12 opacity-0 animate-fade-in-delay-3 text-[#a3a3a3]">
              Each one a <span className="text-[#86a7c8]">lifeline</span>. Each one a <span className="text-[#86a7c8]">story</span>.
            </p>
          </div>
        </section>

        {/* The Transformation */}
        <section 
          ref={el => sectionsRef.current[3] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#ef4444]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <p className="text-3xl font-light leading-relaxed opacity-0 animate-fade-in text-[#a3a3a3]">
              Then came the whispers of <span className="text-[#e6a08f]">change</span>.
            </p>
            <p className="text-xl font-light leading-relaxed mt-8 opacity-0 animate-fade-in-delay text-[#a3a3a3]">
              "Cyberabad,"
              <Citation 
                number={4}
                title="Cyberabad"
                description="Cyberabad is the IT corridor of Hyderabad, established in the late 1990s. It houses major tech companies and has been instrumental in transforming Hyderabad into 'Cyberabad' - India's leading IT destination."
                imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Durgam_Cheruvu_Panorama_V2.jpg/1920px-Durgam_Cheruvu_Panorama_V2.jpg"
                sourceUrl="https://en.wikipedia.org/wiki/HITEC_City"
                mapUrl="https://maps.google.com/?q=17.4486,78.3802&ll=17.4486,78.3802&z=13"
              />
              they called it.<br/>
              The city of the future.
            </p>
            <p className="text-xl font-light leading-relaxed mt-8 opacity-0 animate-fade-in-delay-2 text-[#a3a3a3]">
              But futures are built on <span className="text-[#ef4444]">foundations</span>.<br/>
              And ours were drowning in concrete.
            </p>
          </div>
        </section>

        {/* The Shocking Reality */}
        <section 
          ref={el => sectionsRef.current[4] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#ef4444]/30 to-[#1c2433]" />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-light mb-8 opacity-0 animate-fade-in">
              Today, in 2024, we count what remains:
            </p>
            <div className="my-16 relative">
              <div className="text-8xl font-thin text-[#ef4444] opacity-0 animate-scale-in">
                224
              </div>
              <p className="text-3xl font-light text-[#ef4444] mt-4 opacity-0 animate-fade-in-delay">
                That's all. Just 224.
              </p>
            </div>
            <div className="mt-12 opacity-0 animate-fade-in-delay-2">
              <p className="text-6xl md:text-7xl font-thin text-[#ef4444]">94.4%</p>
              <p className="text-xl text-[#a3a3a3] mt-4">of our water heritage — erased</p>
            </div>
          </div>
        </section>


        {/* Personal Stories */}
        <section 
          ref={el => sectionsRef.current[5] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">VOICES FROM THE PAST</span>
              <h3 className="text-4xl md:text-5xl font-thin mt-4 mb-8 opacity-0 animate-fade-in text-[#e5e5e5]">
                Stories that <span className="text-[#86a7c8]">remain</span>
              </h3>
            </div>
            <div className="space-y-16">
              <div className="opacity-0 animate-fade-in">
                <p className="text-[#a3a3a3] mb-4">Rameeza, 67, Retired Teacher</p>
                <blockquote className="text-2xl md:text-3xl font-light italic text-[#e5e5e5]">
                  "I learned to swim in Safilguda Lake. My children ask me where it is now. 
                  I point to the <span className="text-[#86a7c8]">shopping mall</span>."
                </blockquote>
              </div>
              
              <div className="opacity-0 animate-fade-in-delay">
                <p className="text-[#a3a3a3] mb-4">Krishnamurthy, 45, IT Professional</p>
                <blockquote className="text-2xl md:text-3xl font-light italic text-[#e5e5e5]">
                  "My office stands where Madhapur Lake used to be. Sometimes, during monsoons, 
                  the basement floods. The lake <span className="text-[#86a7c8]">remembers</span>."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Water Quality Crisis - Enhanced */}
        <section 
          ref={el => sectionsRef.current[6] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#ef4444]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">THE WATER THAT REMAINS</span>
              <h3 className="text-4xl md:text-5xl font-thin mt-4 mb-8 opacity-0 animate-fade-in text-[#e5e5e5]">
                Is <span className="text-[#ef4444]">dying</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <WaterQualityCard
                title="Hussain Sagar"
                subtitle="The Heart of the City"
                stat="2.3 mg/L"
                label="Dissolved Oxygen"
                normal="Minimum needed: 5 mg/L"
                description="Fish gasp for air. The lake suffocates."
                delay="0"
              />
              <WaterQualityCard
                title="Durgam Cheruvu"
                subtitle="The Secret Lake"
                stat="24,000"
                label="Coliform Count"
                normal="Safe limit: 2,500 MPN/100ml"
                description="Sewage flows where lotus bloomed."
                delay="200"
              />
              <WaterQualityCard
                title="Saroornagar Lake"
                subtitle="The People's Lake"
                stat="8x"
                label="Phosphorus Levels"
                normal="Above safe limits"
                description="Algae chokes the water. Green death spreads."
                delay="400"
              />
              <WaterQualityCard
                title="All Major Lakes"
                subtitle="Heavy Metal Contamination"
                stat="3.2x"
                label="WHO Limits Exceeded"
                normal="Lead, Mercury, Cadmium"
                description="Poison in every drop."
                delay="600"
              />
            </div>
          </div>
        </section>

        {/* The Four Giants */}
        <section 
          ref={el => sectionsRef.current[7] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">CASE STUDIES</span>
              <h3 className="text-4xl md:text-5xl font-thin mt-4 mb-4 opacity-0 animate-fade-in">
                The Four <span className="text-[#86a7c8]">Giants</span>
              </h3>
              <p className="text-xl text-[#a3a3a3] opacity-0 animate-fade-in-delay">
                Even our largest lakes couldn't escape
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LakeStoryCard
                name="Hussain Sagar"
                year="Built 1562"
                story="Once the pride of the Qutb Shahi dynasty"
                originalArea={540}
                currentArea={425}
                lossPercentage={21.3}
                image="/api/placeholder/600/400"
              />
              <LakeStoryCard
                name="Osman Sagar"
                year="Built 1920"
                story="Created to prevent floods, now struggles to survive"
                originalArea={2460}
                currentArea={2178}
                lossPercentage={11.5}
                image="/api/placeholder/600/400"
              />
              <LakeStoryCard
                name="Himayat Sagar"
                year="Built 1927"
                story="The Nizam's gift to the city, slowly shrinking"
                originalArea={1940}
                currentArea={1608}
                lossPercentage={17.1}
                image="/api/placeholder/600/400"
              />
              <LakeStoryCard
                name="Shamirpet Lake"
                year="Built 1897"
                story="From irrigation lifeline to struggling survivor"
                originalArea={580}
                currentArea={492}
                lossPercentage={15.2}
                image="/api/placeholder/600/400"
              />
            </div>
          </div>
        </section>

        {/* Timeline of Destruction */}
        <section 
          ref={el => sectionsRef.current[8] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">THE TIMELINE</span>
              <h3 className="text-4xl md:text-5xl font-thin mt-4 opacity-0 animate-fade-in">
                How We Got <span className="text-[#86a7c8]">Here</span>
              </h3>
            </div>
            
            <div className="space-y-24">
              <TimelineEvent
                year="1990-2000"
                title="The IT Dream Begins"
                description="HITEC City rises. 742 lakes vanish. The trade-off seemed worth it then."
                stat="23% lost"
                color="blue"
              />
              <TimelineEvent
                year="2000-2010"
                title="The Gold Rush"
                description="Cyberabad becomes reality. Real estate booms. 1,001 more lakes disappear under concrete."
                stat="31% lost"
                color="orange"
              />
              <TimelineEvent
                year="2010-2020"
                title="The Awakening"
                description="Citizens notice the floods. The heat. The water tankers. 581 lakes lost while we debated."
                stat="18% lost"
                color="red"
              />
              <TimelineEvent
                year="2020-2024"
                title="The Fight Back"
                description="HYDRAA forms. Mission Kakatiya launches. We save some, but lose 523 more."
                stat="Still losing 2% annually"
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* The Human Cost */}
        <section 
          ref={el => sectionsRef.current[9] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#ef4444]/30 to-[#1c2433]" />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-thin mb-16 opacity-0 animate-fade-in">
              The Price We Pay <span className="text-[#ef4444]">Every Day</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <div className="space-y-8">
                <HumanCostItem
                  number="6 Million"
                  description="People depend on expensive water tankers"
                  subtext="₹200 per tanker, every other day"
                />
                <HumanCostItem
                  number="37,000"
                  description="Families displaced by floods"
                  subtext="Lakes gone, drainage lost"
                />
              </div>
              <div className="space-y-8">
                <HumanCostItem
                  number="+3.8°C"
                  description="Temperature increase in lake areas"
                  subtext="Urban heat islands expand"
                />
                <HumanCostItem
                  number="₹1,272 Cr"
                  description="Annual ecosystem service loss"
                  subtext="The invisible economic drain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* The Future Choice */}
        <section 
          ref={el => sectionsRef.current[10] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
            <div className="absolute inset-0 opacity-30">
              <RainEffect />
            </div>
          </div>
          <div className="relative z-10 text-center space-y-12 max-w-5xl mx-auto">
            <div className="mb-8 opacity-0 animate-fade-in">
              <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">THE FUTURE</span>
              <h3 className="text-4xl md:text-5xl font-thin mt-4 mb-8 text-[#e5e5e5]">A <span className="text-[#86a7c8]">Choice</span> Remains</h3>
            </div>
            <div className="opacity-0 animate-fade-in">
              <p className="text-2xl md:text-3xl font-light text-[#a3a3a3]">By 2030, at current rates,</p>
              <p className="text-4xl md:text-5xl font-thin text-[#ef4444] mt-4">
                only 168 lakes will remain
              </p>
            </div>
            
            <div className="opacity-0 animate-fade-in-delay">
              <p className="text-2xl md:text-3xl font-light text-[#a3a3a3]">By 2050,</p>
              <p className="text-4xl md:text-5xl font-thin text-[#ef4444] mt-4">
                less than 100
              </p>
            </div>
            
            <div className="opacity-0 animate-fade-in-delay-2">
              <p className="text-3xl md:text-4xl font-light mt-16 text-[#e5e5e5]">
                Unless we <span className="text-[#86a7c8]">act now</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section 
          ref={el => sectionsRef.current[11] = el!}
          className="min-h-screen flex items-center justify-center px-4 py-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a3656]/30 via-[#1c2433] to-[#1c2433]" />
          <div className="relative z-10 text-center max-w-5xl mx-auto">
            <div className="mb-12 opacity-0 animate-fade-in">
              <h2 className="text-4xl md:text-6xl font-thin mb-6 text-[#e5e5e5]">
                This is <span className="text-[#86a7c8]">Our Story</span>
              </h2>
              <p className="text-xl md:text-2xl font-light text-[#a3a3a3] mb-4">
                But it doesn't have to be our ending.
              </p>
              <p className="text-2xl md:text-3xl font-light text-[#a3a3a3]">
                224 lakes still breathe. Still hope.
              </p>
            </div>
            
            <div className="space-y-6 opacity-0 animate-fade-in-delay">
              <p className="text-xl text-[#a3a3a3]">Join the fight. Save what remains.</p>
              
              <div className="flex flex-row gap-6 justify-center mt-12 flex-wrap">
                <Link href="/lakes">
                  <Button 
                    size="lg" 
                    className="group bg-[#e05d38] hover:bg-[#e05d38]/90 !text-white border-2 border-transparent hover:border-white/20 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl px-8 py-6 font-medium tracking-wider"
                  >
                    Explore Lake Data
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button 
                    size="lg" 
                    className="group bg-[#3d4354] hover:bg-[#3d4354]/90 !text-white border-2 border-transparent hover:border-white/20 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl px-8 py-6 font-medium tracking-wider"
                  >
                    Full Timeline
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-24 pt-24 border-t border-white/10 opacity-0 animate-fade-in-delay-2">
              <p className="text-gray-500 text-sm">
                Data sources: HMDA, TSPCB, Mission Kakatiya, Sentinel Satellite Imagery
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Last updated: November 2024
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}

// Enhanced Lake Dots Animation
function EnhancedLakeDotsAnimation() {
  const [phase, setPhase] = useState<'initial' | 'disappearing' | 'final'>('initial');
  const [lakeCount, setLakeCount] = useState(3232);
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; disappeared: boolean }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const startAnimation = () => {
    // Create dots with deterministic positions based on index
    const initialDots = Array.from({ length: 3232 }, (_, i) => ({
      id: i,
      x: ((i * 7) % 100) + ((i * 13) % 10) / 10, // Deterministic x position
      y: ((i * 11) % 100) + ((i * 17) % 10) / 10, // Deterministic y position
      disappeared: false
    }));
    setDots(initialDots);
    setPhase('initial');

    // Start disappearing after 2 seconds
    setTimeout(() => {
      setPhase('disappearing');
      const dotsToRemove = Math.floor(3232 * 0.943);
      let removed = 0;
      
      const interval = setInterval(() => {
        if (removed >= dotsToRemove) {
          clearInterval(interval);
          setPhase('final');
          return;
        }

        const removeCount = Math.min(50, dotsToRemove - removed);
        removed += removeCount;

        setDots(prev => {
          const updated = [...prev];
          let count = 0;
          for (let i = 0; i < updated.length && count < removeCount; i++) {
            if (!updated[i].disappeared) {
              updated[i].disappeared = true;
              count++;
            }
          }
          return updated;
        });

        setLakeCount(prev => Math.max(224, prev - removeCount));
      }, 50);
    }, 2000);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-[600px] bg-gradient-to-br from-[#001220] to-[#000510] rounded-2xl overflow-hidden border border-white/10"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 to-transparent animate-pulse" />
      </div>

      {/* Dots container */}
      <div className="absolute inset-0 p-8">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-1000 ${
              dot.disappeared 
                ? 'bg-red-500 scale-0 opacity-0' 
                : 'bg-cyan-400 opacity-90 animate-pulse'
            }`}
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              boxShadow: dot.disappeared ? 'none' : '0 0 10px rgba(34, 211, 238, 0.5)',
              animationDelay: `${dot.id * 0.001}s`
            }}
          />
        ))}
      </div>

      {/* Counter overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className={`transition-all duration-1000 ${
            phase === 'disappearing' ? 'scale-110' : 'scale-100'
          }`}>
            <div className={`text-7xl md:text-8xl font-thin mb-2 ${
              phase === 'final' ? 'text-[#ef4444]' : 'text-white'
            }`}>
              {lakeCount.toLocaleString()}
            </div>
            <div className="text-xl md:text-2xl text-gray-400">
              {phase === 'initial' ? 'lakes in 1990' : 
               phase === 'disappearing' ? 'disappearing...' : 
               'lakes remaining'}
            </div>
          </div>
          {phase === 'final' && (
            <div className="mt-8 opacity-0 animate-fade-in">
              <p className="text-4xl font-thin text-[#ef4444]">94.4% lost forever</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Water Quality Card Component
function WaterQualityCard({ 
  title, 
  subtitle,
  stat, 
  label,
  normal, 
  description,
  delay = "0"
}: { 
  title: string;
  subtitle: string;
  stat: string;
  label: string;
  normal: string;
  description: string;
  delay?: string;
}) {
  return (
    <div 
      className="bg-gradient-to-br from-red-950/20 to-black/50 backdrop-blur-sm rounded-xl p-8 border border-red-500/20 opacity-0 animate-fade-in hover:border-red-500/40 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4">
        <h4 className="text-xl font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="text-5xl font-thin text-[#ef4444] mb-2">{stat}</div>
      <div className="text-sm text-red-300 mb-1">{label}</div>
      <div className="text-xs text-gray-500 mb-4">{normal}</div>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

// Lake Story Card Component
function LakeStoryCard({
  name,
  year,
  story,
  originalArea,
  currentArea,
  lossPercentage,
  image
}: {
  name: string;
  year: string;
  story: string;
  originalArea: number;
  currentArea: number;
  lossPercentage: number;
  image: string;
}) {
  return (
    <div className="group bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all duration-500 opacity-0 animate-fade-in">
      <div className="relative h-64 bg-gradient-to-br from-blue-950/50 to-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h3 className="text-2xl font-light text-white mb-1">{name}</h3>
          <p className="text-sm text-gray-400">{year}</p>
        </div>
        <div className="absolute top-4 right-4">
          <div className="text-3xl font-thin text-[#ef4444]">-{lossPercentage}%</div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-300 mb-4 leading-relaxed">{story}</p>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm text-gray-400">Then</div>
            <div className="text-2xl font-light">{originalArea} ha</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-thin text-[#ef4444] mb-1">→</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Now</div>
            <div className="text-2xl font-light text-cyan-400">{currentArea} ha</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Event Component
function TimelineEvent({ 
  year, 
  title, 
  description, 
  stat, 
  color 
}: { 
  year: string; 
  title: string; 
  description: string; 
  stat: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500 text-orange-400 border-orange-500/30',
    red: 'bg-red-500 text-[#ef4444] border-red-500/30',
    purple: 'bg-purple-500 text-[#86a7c8] border-purple-500/30'
  };

  return (
    <div className="relative flex items-start gap-8 opacity-0 animate-fade-in">
      <div className="flex-shrink-0">
        <div className={`w-4 h-4 rounded-full ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} ring-4 ring-black`} />
      </div>
      <div className="flex-grow">
        <div className={`text-3xl font-light mb-2 ${colorClasses[color as keyof typeof colorClasses].split(' ')[1]}`}>
          {year}
        </div>
        <h4 className="text-2xl font-medium mb-3">{title}</h4>
        <p className="text-lg text-gray-300 leading-relaxed mb-4">{description}</p>
        <div className={`inline-block px-4 py-2 rounded-full border ${colorClasses[color as keyof typeof colorClasses].split(' ')[2]} ${colorClasses[color as keyof typeof colorClasses].split(' ')[1]}`}>
          {stat}
        </div>
      </div>
    </div>
  );
}

// Human Cost Item Component
function HumanCostItem({ 
  number, 
  description, 
  subtext 
}: { 
  number: string; 
  description: string; 
  subtext: string; 
}) {
  return (
    <div className="opacity-0 animate-fade-in">
      <div className="text-5xl font-thin text-[#ef4444] mb-2">{number}</div>
      <div className="text-xl font-light mb-1">{description}</div>
      <div className="text-sm text-gray-500">{subtext}</div>
    </div>
  );
}

// Visual Effects Components
function WaterRippleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-500/30"
          style={{
            width: `${(i + 1) * 400}px`,
            height: `${(i + 1) * 400}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `ripple ${3 + i}s ease-out infinite ${i * 0.5}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function RainEffect() {
  // Use deterministic values based on index instead of Math.random()
  const generatePosition = (index: number) => {
    const positions = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
    return positions[index % positions.length] + (index % 5);
  };
  
  const generateDelay = (index: number) => {
    return (index * 0.04) % 2;
  };
  
  const generateDuration = (index: number) => {
    const durations = [0.5, 0.6, 0.7, 0.8, 0.9];
    return durations[index % durations.length];
  };

  return (
    <div className="rain-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${generatePosition(i)}%`,
            animationDelay: `${generateDelay(i)}s`,
            animationDuration: `${generateDuration(i)}s`
          }}
        />
      ))}
      <style jsx>{`
        .rain-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .rain-drop {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.6), transparent);
          animation: rain-fall linear infinite;
        }
        @keyframes rain-fall {
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
}

// Count Up Animation Component with Real Lake Outlines
function CountUpAnimation({ target, duration }: { target: number; duration: number }) {
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [visibleLakes, setVisibleLakes] = useState<number>(0);
  const [lakesData, setLakesData] = useState<any[]>([]);
  const countRef = useRef<HTMLDivElement>(null);

  // Load actual lake data from 1990
  useEffect(() => {
    fetch('/data/lakes/lakes_1990.geojson')
      .then(res => res.json())
      .then(data => {
        if (data.features) {
          // Use ALL lakes, sorted by area (bigger first)
          const sortedLakes = data.features
            .filter((f: any) => f.geometry && f.geometry.type === 'Polygon')
            .sort((a: any, b: any) => (b.properties?.area_km2 || 0) - (a.properties?.area_km2 || 0));
          setLakesData(sortedLakes);
        }
      })
      .catch(err => console.error('Error loading lake data:', err));
  }, []);

  useEffect(() => {
    if (!countRef.current || lakesData.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCount();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(countRef.current);

    return () => observer.disconnect();
  }, [lakesData.length]); // Only depend on length, not the whole array

  const animateCount = () => {
    let start = 0;
    const minTarget = 3000;
    const maxTarget = 7000;
    const increment = maxTarget / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= maxTarget) {
        setMinCount(minTarget);
        setMaxCount(maxTarget);
        setVisibleLakes(lakesData.length);
        clearInterval(timer);
      } else {
        // Animate both numbers proportionally
        const progress = start / maxTarget;
        setMinCount(Math.floor(minTarget * progress));
        setMaxCount(Math.floor(start));
        // Show lakes proportionally to count
        const lakesToShow = Math.floor(progress * lakesData.length);
        setVisibleLakes(lakesToShow);
      }
    }, 16);
  };

  // Convert lake coordinates to simplified path
  const getSimplifiedPath = (coordinates: number[][][]) => {
    if (!coordinates || !coordinates[0]) return '';
    
    const ring = coordinates[0];
    if (ring.length < 3) return '';
    
    // Get bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ring.forEach(coord => {
      minX = Math.min(minX, coord[0]);
      maxX = Math.max(maxX, coord[0]);
      minY = Math.min(minY, coord[1]);
      maxY = Math.max(maxY, coord[1]);
    });
    
    // Normalize to 0-100 range
    const normalize = (coord: number[]) => {
      const x = ((coord[0] - minX) / (maxX - minX)) * 100;
      const y = ((coord[1] - minY) / (maxY - minY)) * 100;
      return `${x},${y}`;
    };
    
    // Create simplified path (take every nth point)
    const step = Math.max(1, Math.floor(ring.length / 20));
    let path = `M ${normalize(ring[0])}`;
    
    for (let i = step; i < ring.length; i += step) {
      path += ` L ${normalize(ring[i])}`;
    }
    
    return path + ' Z';
  };

  return (
    <>
      {/* Lake outlines in background - full screen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {lakesData.slice(0, visibleLakes).map((lake, index) => {
          if (!lake.geometry || lake.geometry.type !== 'Polygon') return null;
          
          // Vary sizes based on actual lake area
          const area = lake.properties?.area_km2 || 0.1;
          const baseSize = area > 10 ? 100 : area > 2 ? 70 : area > 0.5 ? 40 : 20;
          const size = baseSize + (index % 5) * 5;
          
          // Dense packing algorithm - fill viewport more completely
          const viewportWidth = window.innerWidth || 1920;
          const viewportHeight = window.innerHeight || 1080;
          const cols = Math.floor(viewportWidth / 60); // Approximate spacing
          const rows = Math.floor(viewportHeight / 60);
          
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Add organic positioning offsets
          const xOffset = ((index * 13) % 7) - 3;
          const yOffset = ((index * 17) % 7) - 3;
          const x = (col / cols) * 100 + xOffset;
          const y = (row / rows) * 100 + yOffset;
          
          return (
            <svg
              key={lake.properties?.id || index}
              className="absolute transition-all duration-700 ease-out"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: visibleLakes > index ? 0.4 : 0,
                transform: visibleLakes > index ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-10deg)',
                transition: 'all 0.5s ease-out',
                transitionDelay: `${(index % 20) * 50}ms`
              }}
              viewBox="0 0 100 100"
            >
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="none"
                stroke="#a3c5d8"
                strokeWidth="1"
                strokeOpacity="0.5"
              />
              <path
                d={getSimplifiedPath(lake.geometry.coordinates)}
                fill="#a3c5d8"
                fillOpacity="0.08"
              />
            </svg>
          );
        })}
      </div>
      
      {/* Count number - positioned in the section */}
      <div ref={countRef} className="relative z-20">
        <div className="text-7xl md:text-8xl font-thin text-[#86a7c8]">
          ~{minCount.toLocaleString()}-{maxCount.toLocaleString()}
        </div>
      </div>
    </>
  );
}