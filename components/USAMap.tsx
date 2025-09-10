import React from 'react';
import { ProcessedStateData, Party, HoveredState } from '../types';
import { STATE_PATHS } from '../data/statePaths';

interface USAMapProps {
  data: { [key: string]: ProcessedStateData };
  onStateHover: (hoveredState: HoveredState | null) => void;
}

const COUNTRY_BACKGROUND_PATH = "M704 220 L702 165 L692 143 L658 133 L606 130 L567 135 L524 125 L477 124 L432 124 L384 117 L310 114 L251 90 L204 94 L154 102 L116 137 L94 186 L94 245 L113 294 L126 349 L183 423 L238 434 L310 428 L370 412 L454 366 L530 376 L594 384 L644 374 L676 352 L692 331 L701 292 Z";

const StatePath: React.FC<{
  id: string;
  d: string;
  data?: ProcessedStateData;
  onStateHover: (hoveredState: HoveredState | null) => void;
}> = ({ id, d, data, onStateHover }) => {
  
  const fillColor = data?.winner === Party.DEMOCRAT 
    ? 'fill-blue-600' 
    : data?.winner === Party.REPUBLICAN 
    ? 'fill-red-600' 
    : 'fill-slate-700';
  
  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    if (data) {
      onStateHover({ data, x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    onStateHover(null);
  };

  return (
    <path
      id={id}
      d={d}
      className={`stroke-black stroke-1 transition-all duration-150 ${fillColor} hover:fill-opacity-80 hover:stroke-yellow-300 cursor-pointer`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};


const USAMap: React.FC<USAMapProps> = ({ data, onStateHover }) => {
  return (
    <svg viewBox="0 0 960 500" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <g>
        <path
          d={COUNTRY_BACKGROUND_PATH}
          className="fill-slate-800/70"
        />
        {Object.entries(STATE_PATHS).map(([stateCode, path]) => (
          <StatePath
            key={stateCode}
            id={stateCode}
            d={path}
            data={data[stateCode]}
            onStateHover={onStateHover}
          />
        ))}
      </g>
    </svg>
  );
};

export default USAMap;