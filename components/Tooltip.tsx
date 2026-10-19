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
  const tooltipWidth = 280;

  // Keep tooltip on screen
  const padding = 16;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  let leftPos = x + 16;
  if (leftPos + tooltipWidth > screenWidth - padding) {
    leftPos = Math.max(padding, x - tooltipWidth - 16);
  }

  let topPos = y - 40;
  if (topPos < padding) topPos = padding;
  if (topPos + 260 > screenHeight - padding) {
    topPos = Math.max(padding, screenHeight - 280);
  }

  const marginPct = Math.abs(data.margin);
  const marginVotes = Math.abs(data.marginVotes);

  const getWinnerBadge = () => {
    if (data.winner === Party.DEMOCRAT) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Avance Démocrate (+{marginPct.toFixed(1)}%)
        </span>
      );
    }
    if (data.winner === Party.REPUBLICAN) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Avance Républicaine (+{marginPct.toFixed(1)}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
        Égalité parfaite
      </span>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${topPos}px`,
        left: `${leftPos}px`,
        width: `${tooltipWidth}px`,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-4 text-white transition-opacity duration-150 animate-in fade-in"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
              {data.stateCode}
            </span>
            <h3 className="font-bold text-base text-slate-100">{data.stateName}</h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Grands Électeurs</span>
          <span className="text-base font-extrabold text-amber-400">{data.electoralVotes}</span>
        </div>
      </div>

      <div className="mt-2.5 mb-3">{getWinnerBadge()}</div>

      {/* Progress split */}
      <div className="space-y-2 text-xs">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {data.democratCandidateName ? `${data.democratCandidateName} (Dém.)` : 'Démocrate'}
            </span>
            <span className="font-mono font-bold text-blue-400">{data.democratPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Voix :</span>
            <span>{Math.round(data.democratVotes).toLocaleString('fr-FR')}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {data.republicanCandidateName ? `${data.republicanCandidateName} (Rép.)` : 'Républicain'}
            </span>
            <span className="font-mono font-bold text-red-400">{data.republicanPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Voix :</span>
            <span>{Math.round(data.republicanVotes).toLocaleString('fr-FR')}</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mt-2">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${data.democratPercentage}%` }}
          />
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${data.republicanPercentage}%` }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
          <span>Écart : {marginVotes > 0 ? `${marginVotes.toLocaleString('fr-FR')} voix` : '0'}</span>
          <span className="text-slate-500 italic">Cliquez pour l'historique</span>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
