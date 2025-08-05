'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Citation } from '@/components/Citation';

interface Testimony {
  id: string;
  quote: string;
  author: string;
  age?: number;
  title: string;
  category: string;
  source: string;
  url: string;
  date?: string;
}

const testimonies: Testimony[] = [
  {
    id: '1',
    quote: "I, along with my friends, used to swim in the lake and wash clothes when I was a child. We used to get drinking water from the lake. But, now water is contaminated and can't be used for anything",
    author: "Shankar Yadav",
    age: 63,
    title: "Saroornagar resident",
    category: "Personal Memories",
    source: "The Hans India",
    url: "https://www.thehansindia.com/posts/index/Commoner/2017-08-22/Saroornagar-lake-dying-of-neglect/320776",
    date: "August 22, 2017"
  },
  {
    id: '2',
    quote: "In the 1950s when Hyderabad city had a lot of lakes, to travel in a double-decker bus was such a joy... the memory is so vivid",
    author: "Anuradha Reddy",
    title: "Indian National Trust for Art and Cultural Heritage",
    category: "Personal Memories",
    source: "The News Minute",
    url: "https://www.thenewsminute.com/telangana/hyderabad-s-double-decker-buses-fond-memories-little-scope-revival-137570",
    date: "November 2020"
  },
  {
    id: '3',
    quote: "The fish began to die last Sunday. We did not worry much then. Today, the lake was full of dead fish... My family of five earning members made Rs 7,000 per day from fish sales. Now I do not know what to do",
    author: "Mr. Bhikshapati",
    title: "Leader of Shamirpet Lake fishermen",
    category: "Fishermen's Livelihoods",
    source: "Deccan Chronicle",
    url: "https://www.deccanchronicle.com/nation/current-affairs/220517/hyderabad-huge-fish-kill-at-shamirpet-lake.html",
    date: "May 22, 2017"
  },
  {
    id: '4',
    quote: "I have got this wonderful view of Hussain Sagar Lake from my home, but unfortunately I cannot open my windows neither can I enjoy the breeze. All I am left with is the stench from tank bund... We are anxiously waiting for the government to do something",
    author: "Deepti",
    age: 28,
    title: "Hussain Sagar resident",
    category: "Health Impacts",
    source: "The News Minute",
    url: "https://www.thenewsminute.com/article/hyderabad-residents-raise-stink-about-stench-hussain-sagar-lake-39761"
  },
  {
    id: '5',
    quote: "Lakes are critical public resources, their safety is the government's responsibility. As citizens, we shall not allow this to happen",
    author: "Dr. Lubna Sarwath",
    title: "Co-convener of Save Our Urban Lakes (SOUL)",
    category: "Community Activism",
    source: "Siasat Daily",
    url: "https://www.siasat.com/realtors-encroach-lakes-not-develop-them-hyderabad-activists-2254450/",
    date: "January 7, 2022"
  },
  {
    id: '6',
    quote: "Hyderabad has become like a mosquito breeding ground. There is no fogging and no proper anti-larvae operations... Strict measures are needed to combat diseases like malaria, dengue, and typhoid",
    author: "Sai Teja",
    title: "Nizampet resident",
    category: "Health Impacts",
    source: "Hyderabad Mail",
    url: "https://hyderabadmail.com/hyderabad-faces-growing-mosquito-menace-citizens-demand-action-from-ghmc/",
    date: "February 2025"
  },
  {
    id: '7',
    quote: "The water was clean until a few months ago and could be used to take a bath. However, because of all the liquid discharged into it, the water has become dark and black in colour",
    author: "Batte Shankar",
    title: "Edulabad Lake Sarpanch",
    category: "Fishermen's Livelihoods",
    source: "The News Minute",
    url: "https://www.thenewsminute.com/telangana/pollution-hyderabad-dumpyard-allegedly-kills-thousands-fish-edulabad-lake-70379"
  },
  {
    id: '8',
    quote: "Currently, the entire lake has become a floating dump yard... Despite continuous complaints, GHMC officials have only offered false promises; each time work is initiated, it abruptly halts after a few days",
    author: "K Jagan Reddy",
    title: "President of Greenpark Colony",
    category: "Government Response",
    source: "The Hans India",
    url: "https://www.thehansindia.com/news/cities/hyderabad/now-saroornagar-lake-turns-a-floating-dump-869797",
    date: "2024"
  }
];

interface TestimoniesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestimoniesModal({ isOpen, onClose }: TestimoniesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  if (!isOpen) return null;

  const categories = ['All', ...new Set(testimonies.map(t => t.category))];
  const filteredTestimonies = selectedCategory === 'All' 
    ? testimonies 
    : testimonies.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c2433] rounded-2xl border border-[#3d4354] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#3d4354]/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-light text-[#e5e5e5] mb-2">Voices from the Past</h2>
            <p className="text-[#a3a3a3] text-sm">Personal testimonies from those who witnessed Hyderabad's lake transformation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a3040] rounded-lg transition-colors text-[#a3a3a3] hover:text-[#e5e5e5]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-[#3d4354]/30">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-[#86a7c8]/20 text-[#86a7c8] border border-[#86a7c8]/30'
                    : 'bg-[#2a3040]/60 text-[#a3a3a3] border border-[#3d4354]/50 hover:border-[#86a7c8]/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonies List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {filteredTestimonies.map((testimony) => (
              <div
                key={testimony.id}
                className="bg-[#2a3040]/40 rounded-xl p-6 border border-[#3d4354]/30"
              >
                <div className="mb-4">
                  <div className="inline-block px-3 py-1 bg-[#86a7c8]/10 text-[#86a7c8] text-xs rounded-full mb-3">
                    {testimony.category}
                  </div>
                  <blockquote className="text-lg text-[#e5e5e5] italic leading-relaxed mb-4">
                    "{testimony.quote}"
                  </blockquote>
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[#86a7c8] font-medium">
                      {testimony.author}{testimony.age ? `, ${testimony.age}` : ''}
                    </div>
                    <div className="text-sm text-[#a3a3a3]">{testimony.title}</div>
                  </div>
                  
                  <Citation
                    number={parseInt(testimony.id)}
                    title={testimony.source}
                    description={`${testimony.source}${testimony.date ? `, ${testimony.date}` : ''}`}
                    sourceUrl={testimony.url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}