'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowDown, Pause, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { Citation } from '@/components/Citation';
import { ParallaxLakeAnimation } from '@/components/ParallaxLakeAnimation';
import { ParallaxLakeOverlay } from '@/components/ParallaxLakeOverlay';
import { LakeStoryCard } from '@/components/LakeStoryCard';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';
import { TestimoniesModal } from '@/components/TestimoniesModal';

function StoryContent() {
  const searchParams = useSearchParams();
  const shouldAutoplay = searchParams.get('autoplay') === 'true';
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | null>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const isPlayingRef = useRef(isPlaying);
  const [shouldPauseAtLakes, setShouldPauseAtLakes] = useState(true);
  const [hasReachedLakeSection, setHasReachedLakeSection] = useState(false);
  const [isTestimoniesModalOpen, setIsTestimoniesModalOpen] = useState(false);

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
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[#a3a3a3]">Shankar Yadav, 63, Saroornagar resident</p>
                  <Citation 
                    number={11}
                    title="Saroornagar lake dying of neglect"
                    description="The Hans India, August 22, 2017. Personal testimony from long-time resident about the transformation of Saroornagar Lake from a source of drinking water to contaminated water body."
                    sourceUrl="https://www.thehansindia.com/posts/index/Commoner/2017-08-22/Saroornagar-lake-dying-of-neglect/320776"
                  />
                </div>
                <blockquote className="text-2xl md:text-3xl font-light italic text-[#e5e5e5]">
                  "I, along with my friends, used to swim in the lake and wash clothes when I was a child. We used to get drinking water from the lake. But, now water is contaminated and <span className="text-[#ef4444]">can't be used for anything</span>."
                </blockquote>
              </div>
              
              <div className="opacity-0 animate-fade-in-delay">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[#a3a3a3]">Anuradha Reddy, Indian National Trust for Art and Cultural Heritage</p>
                  <Citation 
                    number={12}
                    title="Hyderabad's double decker buses"
                    description="The News Minute, November 2020. Memories of cleaner Hyderabad when the city had abundant lakes and clean air during the 1950s era."
                    sourceUrl="https://www.thenewsminute.com/telangana/hyderabad-s-double-decker-buses-fond-memories-little-scope-revival-137570"
                  />
                </div>
                <blockquote className="text-2xl md:text-3xl font-light italic text-[#e5e5e5]">
                  "In the 1950s when Hyderabad city had a lot of lakes, to travel in a double-decker bus was such a joy... the memory is <span className="text-[#86a7c8]">so vivid</span>."
                </blockquote>
              </div>
            </div>
            
            {/* Read More Button */}
            <div className="text-center mt-16 opacity-0 animate-fade-in-delay-2">
              <Button
                onClick={() => setIsTestimoniesModalOpen(true)}
                size="lg"
                className="group bg-[#2a3040]/80 hover:bg-[#2a3040] !text-[#e5e5e5] border-2 border-[#3d4354]/50 hover:border-[#86a7c8]/30 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl px-8 py-6 font-medium tracking-wider"
              >
                Read More Testimonies
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
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
              />
              <LakeStoryCard
                name="Osman Sagar"
                year="Built 1920"
                story="Created to prevent floods, now struggles to survive"
                originalArea={2460}
                currentArea={2178}
                lossPercentage={11.5}
              />
              <LakeStoryCard
                name="Himayat Sagar"
                year="Built 1927"
                story="The Nizam's gift to the city, slowly shrinking"
                originalArea={1940}
                currentArea={1608}
                lossPercentage={17.1}
              />
              <LakeStoryCard
                name="Shamirpet Lake"
                year="Built 1897"
                story="From irrigation lifeline to struggling survivor"
                originalArea={580}
                currentArea={492}
                lossPercentage={15.2}
              />
            </div>
          </div>
        </section>

        {/* Timeline of Destruction - Now Horizontal */}
        <section 
          ref={el => sectionsRef.current[8] = el!}
          className="min-h-screen flex items-center justify-center px-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c2433] via-[#2a3656]/20 to-[#1c2433]" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <HorizontalTimeline />
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

        {/* Call to Action - Removed timeline button */}
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
    
    {/* Testimonies Modal */}
    <TestimoniesModal 
      isOpen={isTestimoniesModalOpen} 
      onClose={() => setIsTestimoniesModalOpen(false)} 
    />
    </>
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
      className="bg-[#2a3040]/60 backdrop-blur-sm rounded-xl p-6 border border-[#3d4354]/50 opacity-0 animate-fade-in hover:border-[#ef4444]/30 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-medium text-[#e5e5e5] mb-1">{title}</h4>
          <p className="text-sm text-[#a3a3a3]">{subtitle}</p>
        </div>
        <div className="w-3 h-3 bg-[#ef4444] rounded-full"></div>
      </div>
      
      <div className="mb-4">
        <div className="text-4xl font-light text-[#ef4444] mb-2">{stat}</div>
        <div className="text-sm text-[#ef4444] mb-1">{label}</div>
        <div className="text-xs text-[#a3a3a3]">{normal}</div>
      </div>
      
      <p className="text-sm text-[#a3a3a3] leading-relaxed">{description}</p>
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

export default function StoryPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1c2433] flex items-center justify-center">
        <div className="text-[#86a7c8] text-lg">Loading...</div>
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}