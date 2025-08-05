import Link from 'next/link';
import { Button } from '@/components/ui/button';

const timelineData = [
  { year: "1990-2000", title: "The IT Dream Begins", description: "HITEC City rises. 742 lakes vanish. The trade-off seemed worth it then.", stat: "23% lost" },
  { year: "2000-2010", title: "The Gold Rush", description: "Cyberabad becomes reality. Real estate booms. 1,001 more lakes disappear under concrete.", stat: "31% lost" },
  { year: "2010-2020", title: "The Awakening", description: "Citizens notice the floods. The heat. The water tankers. 581 lakes lost while we debated.", stat: "18% lost" },
  { year: "2020-2024", title: "The Fight Back", description: "HYDRAA forms. Mission Kakatiya launches. We save some, but lose 523 more.", stat: "Still losing 2% annually" }
];

export function HorizontalTimeline() {
  return (
    <div className="mt-16">
      <div className="text-center mb-16">
        <span className="text-[#86a7c8] tracking-[0.3em] text-sm font-medium uppercase">THE TIMELINE</span>
        <h3 className="text-4xl md:text-5xl font-thin mt-4 mb-8 opacity-0 animate-fade-in">
          How We Got <span className="text-[#86a7c8]">Here</span>
        </h3>
      </div>
      
      {/* Horizontal Timeline */}
      <div className="relative mb-12">
        {/* Timeline items */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {timelineData.map((item, index) => (
            <div key={index} className="relative opacity-0 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
              {/* Content card */}
              <div className="bg-gradient-to-br from-[#2a3040]/80 to-[#1c2433]/60 backdrop-blur-sm rounded-xl p-6 border border-[#3d4354]/50 hover:border-[#86a7c8]/30 transition-all duration-500 group hover:transform hover:scale-[1.02] h-full min-h-[240px] flex flex-col">
                <div className="text-[#86a7c8] text-lg font-medium mb-2">{item.year}</div>
                <h4 className="text-xl font-medium mb-3 text-[#e5e5e5]">{item.title}</h4>
                <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4 flex-grow">{item.description}</p>
                <div className="inline-block px-3 py-1 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] text-xs w-fit">
                  {item.stat}
                </div>
              </div>
              
              {/* Timeline dot positioned below card */}
              <div className="flex justify-center mt-4">
                <div className="w-4 h-4 bg-[#e05d38] rounded-full border-4 border-[#1c2433] shadow-lg" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline line - positioned below the dots */}
        <div className="relative">
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-[#86a7c8] via-[#e05d38] to-[#ef4444] top-2 transform -translate-y-1/2" />
          {/* Connection lines from dots to main line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {timelineData.map((item, index) => (
              <div key={index} className="flex justify-center">
                <div className="w-0.5 h-4 bg-[#e05d38]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* View Full Timeline Button */}
      <div className="text-center mt-16">
        <Link href="/timeline">
          <Button 
            size="lg" 
            className="group bg-[#3d4354] hover:bg-[#3d4354]/90 !text-white border-2 border-transparent hover:border-white/20 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl px-8 py-6 font-medium tracking-wider"
          >
            View Full Timeline
          </Button>
        </Link>
      </div>
    </div>
  );
}