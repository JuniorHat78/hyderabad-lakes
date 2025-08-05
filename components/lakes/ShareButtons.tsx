'use client';

import { Button } from '@/components/ui/button';
import { Facebook, Link as LinkIcon } from 'lucide-react';
import XIcon from '@/components/icons/XIcon';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

interface ShareButtonsProps {
  shareUrl: string;
  shareText: string;
}

export default function ShareButtons({ shareUrl, shareText }: ShareButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300"
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
      >
        <XIcon className="h-4 w-4" />
        <span className="hidden sm:inline">X</span>
      </button>
      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </button>
      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#25D366] hover:border-[#25D366]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')}
      >
        <WhatsAppIcon className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </button>
      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#e05d38] hover:border-[#e05d38]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300"
        onClick={() => {
          navigator.clipboard.writeText(shareUrl);
          // You might want to add a toast notification here
        }}
      >
        <LinkIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </button>
    </div>
  );
}