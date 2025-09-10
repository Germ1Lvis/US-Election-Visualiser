
import React from 'react';
import { ELECTION_DATA } from '../data/electionData';

interface ControlsProps {
  selectedYears: number[];
  setSelectedYears: (years: number[]) => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedYears,
  setSelectedYears,
}) => {
  const availableYears = ELECTION_DATA.map(d => d.year).sort((a, b) => b - a);

  const handleYearChange = (year: number) => {
    const newSelection = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];
    
    if (newSelection.length === 0) {
        setSelectedYears([year]); // Prevent empty selection, default to the one just clicked.
    } else {
        setSelectedYears(newSelection.sort((a, b) => b - a));
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg w-full max-w-sm">
      <div className="mb-1">
        <h3 className="font-semibold text-lg mb-2 text-slate-300">Années d'élection</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 ${
                selectedYears.includes(year)
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-700">
         <h4 className="font-semibold text-sm mb-2 text-slate-300">Sources des données</h4>
         <div className="text-xs text-slate-400 space-y-1">
            <p><strong className="font-semibold text-slate-300">2024 :</strong> Résultat non-officialisés suivant Associated Press.</p>
            <p><strong className="font-semibold text-slate-300">1980-2020 :</strong> Résultats officiels issus des archives de la Commission électorale fédérale (FEC).</p>
         </div>
      </div>
    </div>
  );
};

export default Controls;