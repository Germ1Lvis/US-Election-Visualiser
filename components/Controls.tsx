import React, { useState, useEffect } from 'react';
import { ELECTION_DATA } from '../data/electionData';
import { Search, Play, Pause, RotateCcw, Filter, Flame, Check } from 'lucide-react';

interface ControlsProps {
  selectedYears: number[];
  setSelectedYears: (years: number[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'swing' | 'dem' | 'rep';
  setActiveFilter: (filter: 'all' | 'swing' | 'dem' | 'rep') => void;
}

export const SWING_STATES_2024 = ['PA', 'MI', 'WI', 'GA', 'NC', 'AZ', 'NV'];

const Controls: React.FC<ControlsProps> = ({
  selectedYears,
  setSelectedYears,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}) => {
  const availableYears = ELECTION_DATA.map(d => d.year).sort((a, b) => b - a);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Play animation through election years (1980 -> 2024)
  useEffect(() => {
    if (!isPlaying) return;

    const chronologicalYears = [...availableYears].sort((a, b) => a - b);
    const interval = setInterval(() => {
      setSelectedYears(prev => {
        const currentYear = prev[0] || chronologicalYears[0];
        const currentIndex = chronologicalYears.indexOf(currentYear);
        const nextIndex = (currentIndex + 1) % chronologicalYears.length;
        return [chronologicalYears[nextIndex]];
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying, availableYears, setSelectedYears]);

  const handleYearClick = (year: number, isMulti: boolean) => {
    setIsPlaying(false);
    if (!isMulti) {
      setSelectedYears([year]);
      return;
    }
    const newSelection = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];

    if (newSelection.length === 0) {
      setSelectedYears([year]);
    } else {
      setSelectedYears(newSelection.sort((a, b) => b - a));
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl w-full max-w-sm space-y-5">
      {/* Search Input */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-sky-400" />
          Rechercher un État
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: Pennsylvanie, Texas, CA..."
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          Filtres rapides
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left flex items-center justify-between ${
              activeFilter === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>Tous les 50 états</span>
            {activeFilter === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setActiveFilter('swing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left flex items-center justify-between ${
              activeFilter === 'swing'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
            }`}
            title="Focus sur les 7 swing states décisifs de 2024 : PA, MI, WI, GA, NC, AZ, NV"
          >
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Swing States
            </span>
            {activeFilter === 'swing' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setActiveFilter('dem')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left flex items-center justify-between ${
              activeFilter === 'dem'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-blue-300 hover:bg-slate-700'
            }`}
          >
            <span>États Démocrates</span>
            {activeFilter === 'dem' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setActiveFilter('rep')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left flex items-center justify-between ${
              activeFilter === 'rep'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-800/80 text-red-300 hover:bg-slate-700'
            }`}
          >
            <span>États Républicains</span>
            {activeFilter === 'rep' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Year Selection & Auto-Play */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Année d'élection
          </label>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Lire chronologiquement les scrutins de 1980 à 2024"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> Animer 1980-2024
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {availableYears.map(year => {
            const isSelected = selectedYears.includes(year);
            return (
              <button
                key={year}
                onClick={(e) => handleYearClick(year, e.shiftKey || e.ctrlKey || e.metaKey)}
                className={`py-2 px-1 text-xs rounded-xl font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-400/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Cliquez pour sélectionner (Maj+Clic pour combiner)"
              >
                {year}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Astuce : Maintenez <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Maj</kbd> enfoncé pour agréger plusieurs scrutins.
        </p>
      </div>

      {/* Sources & Methodology */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <p>
          <strong className="text-slate-300 font-semibold">Sources officielles :</strong> Federal Election Commission (FEC), National Archives (NARA) et secrétariats d'État.
        </p>
        <p className="text-slate-500">
          Cartographie vectorielle basée sur le découpage officiel 10m du US Census Bureau (projection Albers USA standard).
        </p>
      </div>
    </div>
  );
};

export default Controls;
