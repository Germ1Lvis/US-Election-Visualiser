import React from 'react';
import { Party } from '../types';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  democratEV: number;
  republicanEV: number;
  democratPV: number;
  republicanPV: number;
  title: string;
  democratCandidate?: string;
  republicanCandidate?: string;
  selectedYearsCount: number;
}

const Header: React.FC<HeaderProps> = ({
  democratEV,
  republicanEV,
  democratPV,
  republicanPV,
  title,
  democratCandidate = 'Démocrate',
  republicanCandidate = 'Républicain',
  selectedYearsCount
}) => {
  const totalEV = 538;
  const targetEV = 270;
  const democratEVWidth = (democratEV / totalEV) * 100;
  const republicanEVWidth = (republicanEV / totalEV) * 100;

  const totalPV = democratPV + republicanPV;
  const democratPVWidth = totalPV > 0 ? (democratPV / totalPV) * 100 : 50;
  const republicanPVWidth = totalPV > 0 ? (republicanPV / totalPV) * 100 : 50;

  const demWon = democratEV >= targetEV;
  const repWon = republicanEV >= targetEV;

  return (
    <header className="w-full max-w-6xl mx-auto p-4 sm:p-6 text-center">
      {/* App & Election Title */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-sky-400 font-medium mb-3">
        <span>Cartographie Électorale des États-Unis (1980 - 2024)</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-300 tracking-tight">
        {title}
      </h1>

      {selectedYearsCount === 1 && (demWon || repWon) && (
        <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-in fade-in duration-300 border bg-slate-900/90">
          <Trophy className="w-4 h-4 text-amber-400" />
          {demWon ? (
            <span className="text-blue-400">
              Victoire de {democratCandidate} avec {democratEV} grands électeurs
            </span>
          ) : (
            <span className="text-red-400">
              Victoire de {republicanCandidate} avec {republicanEV} grands électeurs
            </span>
          )}
        </div>
      )}

      {/* 270 TO WIN RACE BAR */}
      <div className="mt-6 max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          {/* Democrat Stats */}
          <div className="flex items-center gap-3 text-left">
            <div className="w-3.5 h-3.5 rounded-sm bg-blue-500 shadow-sm shadow-blue-500/50" />
            <div>
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">
                {democratCandidate}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {democratEV}
              </span>
            </div>
          </div>

          {/* 270 Threshold Badge */}
          <div className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-bold text-amber-400 shadow-inner flex items-center gap-1.5">
            <span>Seuil : 270 pour la victoire</span>
          </div>

          {/* Republican Stats */}
          <div className="flex items-center gap-3 text-right flex-row-reverse">
            <div className="w-3.5 h-3.5 rounded-sm bg-red-500 shadow-sm shadow-red-500/50" />
            <div>
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider block">
                {republicanCandidate}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {republicanEV}
              </span>
            </div>
          </div>
        </div>

        {/* Electoral Progress Bar with 270 Needle */}
        <div className="relative w-full h-5 bg-slate-950 rounded-full flex overflow-hidden p-0.5 border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-700 to-blue-500 rounded-l-full transition-all duration-700 ease-out"
            style={{ width: `${democratEVWidth}%` }}
          />
          <div className="flex-1 bg-slate-900/60" />
          <div
            className="h-full bg-gradient-to-l from-red-700 to-red-500 rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${republicanEVWidth}%` }}
          />

          {/* 270 Center Threshold Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-10 shadow-[0_0_8px_#f59e0b]"
            style={{ left: `${(targetEV / totalEV) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-1.5 px-1">
          <span>0</span>
          <span className="text-amber-400/90 font-semibold">270 / 538</span>
          <span>538</span>
        </div>

        {/* POPULAR VOTE BREAKDOWN */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-mono text-left">
              <span className="text-slate-300 font-bold">{democratPV.toLocaleString('fr-FR')}</span>
              <span className="text-blue-400 font-semibold">({democratPVWidth.toFixed(1)}%)</span>
            </div>
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              Vote Populaire National
            </span>
            <div className="flex items-center gap-1.5 font-mono text-right flex-row-reverse">
              <span className="text-slate-300 font-bold">{republicanPV.toLocaleString('fr-FR')}</span>
              <span className="text-red-400 font-semibold">({republicanPVWidth.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-blue-500/80 transition-all duration-500"
              style={{ width: `${democratPVWidth}%` }}
            />
            <div
              className="h-full bg-red-500/80 transition-all duration-500"
              style={{ width: `${republicanPVWidth}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;