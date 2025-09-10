
import React from 'react';
import { HoveredState, Party } from '../types';

interface TooltipProps {
  hoveredState: HoveredState | null;
}

const Tooltip: React.FC<TooltipProps> = ({ hoveredState }) => {
  if (!hoveredState) {
    return null;
  }

  const { data, x, y } = hoveredState;
  const tooltipWidth = 240; // approx width in px

  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${y + 20}px`,
    left: `${x - (tooltipWidth / 2)}px`,
    transform: 'translateX(0)',
    width: `${tooltipWidth}px`,
  };
  
  return (
    <div
      style={positionStyle}
      className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 text-white pointer-events-none transition-opacity duration-200 z-50"
    >
      <h3 className="font-bold text-xl mb-2 text-center">{data.stateName}</h3>
      <div className="text-sm">
        <p className="flex justify-between">
          <span>Grands électeurs:</span>
          <span className="font-semibold">{data.electoralVotes}</span>
        </p>
        <hr className="my-2 border-slate-700" />
        <div className="space-y-2">
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                        <span>{Party.DEMOCRAT}</span>
                    </div>
                    <span className="font-mono text-blue-400">{data.democratPercentage.toFixed(1)}%</span>
                </div>
                <p className="text-right text-sm text-slate-300 font-mono">{Math.round(data.democratVotes).toLocaleString('fr-FR')} voix</p>
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span>{Party.REPUBLICAN}</span>
                    </div>
                    <span className="font-mono text-red-400">{data.republicanPercentage.toFixed(1)}%</span>
                </div>
                 <p className="text-right text-sm text-slate-300 font-mono">{Math.round(data.republicanVotes).toLocaleString('fr-FR')} voix</p>
            </div>
        </div>
        <hr className="my-2 border-slate-700" />
        <p className="flex justify-between text-xs">
            <span>Total Votants:</span>
            <span className="font-semibold">{Math.round(data.totalVotes).toLocaleString('fr-FR')}</span>
        </p>
      </div>
    </div>
  );
};

export default Tooltip;
