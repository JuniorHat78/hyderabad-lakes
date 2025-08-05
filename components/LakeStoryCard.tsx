interface LakeStoryCardProps {
  name: string;
  year: string;
  story: string;
  originalArea: number;
  currentArea: number;
  lossPercentage: number;
}

export function LakeStoryCard({
  name,
  year,
  story,
  originalArea,
  currentArea,
  lossPercentage
}: LakeStoryCardProps) {
  return (
    <div className="bg-[#2a3040]/60 backdrop-blur-sm rounded-xl p-6 border border-[#3d4354]/50 opacity-0 animate-fade-in hover:border-[#86a7c8]/30 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-[#e5e5e5] mb-1">{name}</h3>
          <p className="text-sm text-[#86a7c8]">{year}</p>
        </div>
        <div className="text-lg font-light text-[#ef4444]">-{lossPercentage}%</div>
      </div>

      {/* Story */}
      <p className="text-sm text-[#a3a3a3] leading-relaxed mb-6">{story}</p>
      
      {/* Area Comparison */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-xs text-[#a3a3a3] mb-1">Original</div>
            <div className="text-lg font-medium text-[#e5e5e5]">{originalArea.toLocaleString()} ha</div>
          </div>
          <div className="px-4 text-[#ef4444]">→</div>
          <div className="flex-1 text-right">
            <div className="text-xs text-[#a3a3a3] mb-1">Current</div>
            <div className="text-lg font-medium text-[#ef4444]">{currentArea.toLocaleString()} ha</div>
          </div>
        </div>
        
        <div className="text-xs text-[#a3a3a3] text-center">
          Lost: {(originalArea - currentArea).toLocaleString()} ha
        </div>
      </div>
    </div>
  );
}