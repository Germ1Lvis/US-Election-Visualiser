import React, { useState, useMemo } from 'react';
import { ProcessedStateData, Party, HoveredState, MapViewMode, ColorMode } from '../types';
import { US_STATE_GEO, NATION_PATH } from '../data/usStateGeo';
import { ZoomIn, ZoomOut, RotateCcw, Map as MapIcon, Grid, Sparkles, Filter } from 'lucide-react';

interface USAMapProps {
  data: { [key: string]: ProcessedStateData };
  onStateHover: (hoveredState: HoveredState | null) => void;
  onStateSelect: (stateData: ProcessedStateData) => void;
  selectedStateCode?: string | null;
  highlightedStates?: string[] | null; // e.g. swing states or search query match
  viewMode: MapViewMode;
  colorMode: ColorMode;
  onToggleViewMode: (mode: MapViewMode) => void;
  onToggleColorMode: (mode: ColorMode) => void;
}

// Helper to determine state color based on colorMode and margin
export function getStateFillColor(
  stateData: ProcessedStateData | undefined,
  colorMode: ColorMode,
  isDimmed: boolean = false
): string {
  if (!stateData || !stateData.winner) {
    return isDimmed ? '#1e293b' : '#334155';
  }

  const { winner, margin } = stateData;
  const absMargin = Math.abs(margin);

  if (colorMode === 'solid') {
    if (winner === Party.DEMOCRAT) {
      return isDimmed ? '#1e3a8a80' : '#2563eb';
    } else {
      return isDimmed ? '#7f1d1d80' : '#dc2626';
    }
  }

  // Margins mode: Safe (>15%), Likely (5-15%), Lean (1-5%), Tilt (<1%)
  if (winner === Party.DEMOCRAT) {
    if (absMargin >= 15) return isDimmed ? '#1e3a8a70' : '#1d4ed8'; // Solid Dem
    if (absMargin >= 5)  return isDimmed ? '#2563eb70' : '#3b82f6'; // Likely Dem
    if (absMargin >= 1)  return isDimmed ? '#3b82f670' : '#60a5fa'; // Lean Dem
    return isDimmed ? '#60a5fa70' : '#93c5fd'; // Tilt Dem
  } else {
    if (absMargin >= 15) return isDimmed ? '#991b1b70' : '#b91c1c'; // Solid Rep
    if (absMargin >= 5)  return isDimmed ? '#dc262670' : '#ef4444'; // Likely Rep
    if (absMargin >= 1)  return isDimmed ? '#ef444470' : '#f87171'; // Lean Rep
    return isDimmed ? '#f8717170' : '#fca5a5'; // Tilt Rep
  }
}

// Generate regular flat-topped hexagon SVG points
function getHexPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = (Math.PI / 180) * (60 * i);
    const x = cx + radius * Math.cos(angleRad);
    const y = cy + radius * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

// States that are large enough on geographic map to have inline labels
const LARGE_LABEL_STATES = new Set([
  'WA', 'OR', 'CA', 'ID', 'NV', 'UT', 'AZ', 'MT', 'WY', 'CO', 'NM',
  'ND', 'SD', 'NE', 'KS', 'OK', 'TX', 'MN', 'IA', 'MO', 'AR', 'LA',
  'WI', 'IL', 'MI', 'IN', 'OH', 'KY', 'TN', 'MS', 'AL', 'GA', 'FL',
  'SC', 'NC', 'VA', 'WV', 'PA', 'NY', 'ME', 'AK', 'HI'
]);

const USAMap: React.FC<USAMapProps> = ({
  data,
  onStateHover,
  onStateSelect,
  selectedStateCode,
  highlightedStates,
  viewMode,
  colorMode,
  onToggleViewMode,
  onToggleColorMode,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringCallout, setIsHoveringCallout] = useState<string | null>(null);

  const handleZoom = (factor: number) => {
    setZoomLevel(prev => {
      const next = prev * factor;
      return Math.min(Math.max(next, 0.9), 3.0);
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const isHighlighted = (code: string) => {
    if (!highlightedStates || highlightedStates.length === 0) return true;
    return highlightedStates.includes(code);
  };

  return (
    <div className="relative w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden group">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        {/* View Mode Toggle: Realistic Geo vs Equal Cartogram */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <button
            onClick={() => onToggleViewMode('geo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'geo'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Projection Albers USA géographique haute précision"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Carte Réaliste</span>
          </button>
          <button
            onClick={() => onToggleViewMode('cartogram')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'cartogram'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Cartogramme hexagonal à surface égale (1 hexagone = 1 état)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Cartogramme Hex</span>
          </button>
        </div>

        {/* Color Mode Toggle: Solid vs Margins */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shadow-inner text-xs">
            <button
              onClick={() => onToggleColorMode('solid')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                colorMode === 'solid'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vainqueur brut
            </button>
            <button
              onClick={() => onToggleColorMode('margins')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                colorMode === 'margins'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Affiche l'intensité selon la marge de victoire (Safe, Likely, Lean, Tilt)"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Nuances de Marge</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => handleZoom(1.25)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full relative overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 960 600"
          className="w-full h-auto max-h-[580px] select-none filter transition-transform duration-300"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Subtle drop shadows for states */}
            <filter id="state-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
            <filter id="hover-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
            <filter id="selected-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fbbf24" floodOpacity="1" />
            </filter>
          </defs>

          {/* Ocean Backdrop */}
          <rect width="960" height="600" fill="transparent" />

          {viewMode === 'geo' ? (
            /* REALISTIC ALBERS USA GEOGRAPHIC PROJECTION */
            <g id="geographic-layer">
              {/* Subtle National Backdrop glow */}
              <path
                d={NATION_PATH}
                className="fill-slate-950/80 stroke-slate-700/50 stroke-1"
                filter="url(#state-shadow)"
              />

              {/* State boundaries */}
              {Object.entries(US_STATE_GEO).map(([code, geo]) => {
                const stateData = data[code];
                const active = isHighlighted(code);
                const isSelected = selectedStateCode === code;
                const isHovered = isHoveringCallout === code;
                const fillColor = getStateFillColor(stateData, colorMode, !active);

                return (
                  <path
                    key={code}
                    id={`state-geo-${code}`}
                    d={geo.path}
                    fill={fillColor}
                    stroke={isSelected ? '#fbbf24' : isHovered ? '#38bdf8' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.2 : 0.8}
                    filter={isSelected ? 'url(#selected-glow)' : isHovered ? 'url(#hover-glow)' : undefined}
                    className={`cursor-pointer transition-all duration-150 ${
                      !active ? 'opacity-30' : 'hover:brightness-110'
                    }`}
                    onMouseMove={(e) => {
                      if (stateData) {
                        onStateHover({ data: stateData, x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseLeave={() => {
                      onStateHover(null);
                    }}
                    onClick={() => {
                      if (stateData) onStateSelect(stateData);
                    }}
                  />
                );
              })}

              {/* Subtle separator between insets and mainland */}
              <g className="stroke-slate-800/80 stroke-1 pointer-events-none">
                <line x1="200" y1="460" x2="200" y2="595" strokeDasharray="3,3" />
              </g>

              {/* State labels for larger states */}
              <g className="pointer-events-none select-none">
                {Object.entries(US_STATE_GEO).map(([code, geo]) => {
                  if (!LARGE_LABEL_STATES.has(code)) return null;
                  const [cx, cy] = geo.centroid;
                  const stateData = data[code];
                  const ev = stateData?.electoralVotes || 0;
                  const active = isHighlighted(code);

                  return (
                    <g key={`label-${code}`} className={`transition-opacity ${!active ? 'opacity-30' : 'opacity-90'}`}>
                      <text
                        x={cx}
                        y={cy - 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] font-black fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans"
                      >
                        {code}
                      </text>
                      <text
                        x={cx}
                        y={cy + 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[8px] font-semibold fill-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-mono"
                      >
                        {ev}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Callout badges and leader lines for tiny eastern states & DC */}
              <g id="callouts-layer">
                {Object.entries(US_STATE_GEO).map(([code, geo]) => {
                  if (!geo.callout) return null;
                  const stateData = data[code];
                  const { lineStart, target } = geo.callout;
                  const isSelected = selectedStateCode === code;
                  const isHovered = isHoveringCallout === code;
                  const active = isHighlighted(code);
                  const fillColor = getStateFillColor(stateData, colorMode, !active);
                  const ev = stateData?.electoralVotes || 0;

                  return (
                    <g
                      key={`callout-${code}`}
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        setIsHoveringCallout(code);
                        if (stateData) onStateHover({ data: stateData, x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        if (stateData) onStateHover({ data: stateData, x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setIsHoveringCallout(null);
                        onStateHover(null);
                      }}
                      onClick={() => {
                        if (stateData) onStateSelect(stateData);
                      }}
                    >
                      {/* Leader line */}
                      <path
                        d={`M ${lineStart[0]},${lineStart[1]} L ${target[0] - 22},${target[1]}`}
                        stroke={isHovered || isSelected ? '#38bdf8' : '#64748b'}
                        strokeWidth={isHovered || isSelected ? 1.8 : 1}
                        strokeDasharray={isHovered ? undefined : '2,2'}
                        fill="none"
                      />

                      {/* Callout Pin Badge */}
                      <g transform={`translate(${target[0] - 20}, ${target[1] - 11})`}>
                        <rect
                          width="38"
                          height="22"
                          rx="5"
                          fill={fillColor}
                          stroke={isSelected ? '#fbbf24' : isHovered ? '#38bdf8' : '#475569'}
                          strokeWidth={isSelected ? 2 : isHovered ? 1.8 : 1}
                          filter="url(#state-shadow)"
                          className="transition-colors"
                        />
                        <text
                          x="13"
                          y="11"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-[9px] font-black fill-white font-sans pointer-events-none"
                        >
                          {code}
                        </text>
                        <text
                          x="28"
                          y="11"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-[8px] font-bold fill-amber-300 font-mono pointer-events-none"
                        >
                          {ev}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </g>
          ) : (
            /* EQUAL-AREA HEXAGON CARTOGRAM */
            <g id="cartogram-layer">
              {Object.entries(US_STATE_GEO).map(([code, geo]) => {
                const stateData = data[code];
                const active = isHighlighted(code);
                const isSelected = selectedStateCode === code;
                const fillColor = getStateFillColor(stateData, colorMode, !active);
                const ev = stateData?.electoralVotes || 0;

                // Compute center of hexagon
                const hexRadius = 31;
                const colSpacing = 70;
                const rowSpacing = 62;
                const startX = 72;
                const startY = 72;

                const cx = startX + geo.hex.col * colSpacing + (geo.hex.row % 2 === 1 ? colSpacing * 0.5 : 0);
                const cy = startY + geo.hex.row * rowSpacing;
                const hexPolygon = getHexPoints(cx, cy, hexRadius);

                return (
                  <g
                    key={`hex-${code}`}
                    className="cursor-pointer transition-all duration-150"
                    onMouseMove={(e) => {
                      if (stateData) onStateHover({ data: stateData, x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      onStateHover(null);
                    }}
                    onClick={() => {
                      if (stateData) onStateSelect(stateData);
                    }}
                  >
                    <polygon
                      points={hexPolygon}
                      fill={fillColor}
                      stroke={isSelected ? '#fbbf24' : '#0f172a'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? 'url(#selected-glow)' : 'url(#state-shadow)'}
                      className={`transition-all duration-150 ${
                        !active ? 'opacity-30' : 'hover:brightness-110'
                      }`}
                    />
                    <text
                      x={cx}
                      y={cy - 4}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[12px] font-black fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none font-sans"
                    >
                      {code}
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] font-bold fill-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none font-mono"
                    >
                      {ev}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Cartographic Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Légende :</span>
          {colorMode === 'solid' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 shadow-sm border border-blue-400/40"></span>
                <span>Démocrate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-600 shadow-sm border border-red-400/40"></span>
                <span>Républicain</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-800"></span>
                <span className="text-[11px]">&gt;15%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-600"></span>
                <span className="text-[11px]">5-15%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-400"></span>
                <span className="text-[11px]">1-5%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-200"></span>
                <span className="text-[11px]">&lt;1%</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-200"></span>
                <span className="text-[11px]">&lt;1%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-400"></span>
                <span className="text-[11px]">1-5%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-600"></span>
                <span className="text-[11px]">5-15%</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-800"></span>
                <span className="text-[11px]">&gt;15%</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 italic">
          Projection Albers USA officielle (recensement américain) • Cliquez sur un état pour l'inspecter
        </div>
      </div>
    </div>
  );
};

export default USAMap;