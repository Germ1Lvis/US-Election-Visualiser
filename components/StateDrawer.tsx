import React from 'react';
import { ProcessedStateData, Party } from '../types';
import { X, TrendingUp, Award, Vote, Calendar, History } from 'lucide-react';

interface StateDrawerProps {
  selectedState: ProcessedStateData | null;
  onClose: () => void;
  onSelectYear: (year: number) => void;
}

const StateDrawer: React.FC<StateDrawerProps> = ({ selectedState, onClose, onSelectYear }) => {
  if (!selectedState) return null;

  const marginPct = Math.abs(selectedState.margin);
  const marginVotes = Math.abs(selectedState.marginVotes);

  // Compute flip history or swing state tendency
  const history = selectedState.history || [];
  const demWins = history.filter(h => h.winner === Party.DEMOCRAT).length;
  const repWins = history.filter(h => h.winner === Party.REPUBLICAN).length;

  let politicalStatus = 'État Pivot / Swing State';
  let statusColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  if (demWins >= 9) {
    politicalStatus = 'Bastion Démocrate ("Blue State")';
    statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  } else if (repWins >= 9) {
    politicalStatus = 'Bastion Républicain ("Red State")';
    statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 overflow-hidden">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {selectedState.stateCode}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusColor}`}>
              {politicalStatus}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5">{selectedState.stateName}</h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-amber-400 font-semibold">{selectedState.electoralVotes}</strong> Grands Électeurs au Collège Électoral
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Selected Period Results */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Vote className="w-4 h-4 text-sky-400" />
            Résultats de la sélection
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                <span className="font-semibold text-slate-200">
                  {selectedState.democratCandidateName || 'Démocrate'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-blue-400 text-lg">
                  {selectedState.democratPercentage.toFixed(1)}%
                </span>
                <span className="block text-[11px] text-slate-400 font-mono">
                  {Math.round(selectedState.democratVotes).toLocaleString('fr-FR')} voix
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                <span className="font-semibold text-slate-200">
                  {selectedState.republicanCandidateName || 'Républicain'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-red-400 text-lg">
                  {selectedState.republicanPercentage.toFixed(1)}%
                </span>
                <span className="block text-[11px] text-slate-400 font-mono">
                  {Math.round(selectedState.republicanVotes).toLocaleString('fr-FR')} voix
                </span>
              </div>
            </div>

            {/* Split Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${selectedState.democratPercentage}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${selectedState.republicanPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-700/40">
              <span>Écart : {marginVotes > 0 ? `${marginVotes.toLocaleString('fr-FR')} voix` : '0 voix'}</span>
              <span className={`font-semibold ${selectedState.winner === Party.DEMOCRAT ? 'text-blue-400' : 'text-red-400'}`}>
                +{marginPct.toFixed(1)} pts ({selectedState.winner || 'Égalité'})
              </span>
            </div>
          </div>
        </div>

        {/* Historical Track Record (1980 - 2024) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              Historique des scrutins (1980 - 2024)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              <span className="text-blue-400 font-bold">{demWins} D</span> - <span className="text-red-400 font-bold">{repWins} R</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {history.map((item) => {
              const isDem = item.winner === Party.DEMOCRAT;
              const isRep = item.winner === Party.REPUBLICAN;
              return (
                <button
                  key={item.year}
                  onClick={() => onSelectYear(item.year)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-600 transition-all text-left text-xs group"
                >
                  <span className="font-mono font-bold text-slate-300 group-hover:text-white flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {item.year}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <span className={isDem ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                        {item.democratPercentage.toFixed(1)}%
                      </span>
                      <span className="text-slate-600">/</span>
                      <span className={isRep ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {item.republicanPercentage.toFixed(1)}%
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold min-w-[70px] text-center ${
                        isDem
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : isRep
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.winner === Party.DEMOCRAT ? 'Démocrate' : item.winner === Party.REPUBLICAN ? 'Républicain' : 'N/A'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400">
          Cliquez sur une année pour basculer instantanément la carte sur cette élection.
        </p>
      </div>
    </div>
  );
};

export default StateDrawer;
