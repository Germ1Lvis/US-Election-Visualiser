import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ELECTION_DATA } from './data/electionData';
import { Party, ProcessedStateData, HoveredState, StateData, CandidateResult } from './types';
import Header from './components/Header';
import USAMap from './components/USAMap';
import Controls from './components/Controls';
import Tooltip from './components/Tooltip';

const App: React.FC = () => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null);

  const processedData = useMemo(() => {
    const stateResults: { [key: string]: ProcessedStateData } = {};
    const democratEV = { total: 0 };
    const republicanEV = { total: 0 };
    const democratPV = { total: 0 };
    const republicanPV = { total: 0 };

    const relevantElections = ELECTION_DATA.filter(e => selectedYears.includes(e.year));
    const numYears = relevantElections.length;

    if (numYears === 0) {
      return { 
        stateResults: {}, 
        democratEV: 0, 
        republicanEV: 0, 
        democratPV: 0, 
        republicanPV: 0, 
        title: "Visualiseur d'élections américaines" 
      };
    }

    // Initialize with all states from the first selected election to ensure all states are represented
    const allStatesMap = new Map<string, { stateName: string; electoralVotes: number[] }>();
    ELECTION_DATA[0].data.forEach(state => {
      allStatesMap.set(state.stateCode, { stateName: state.stateName, electoralVotes: [] });
    });


    relevantElections.forEach(election => {
      election.data.forEach(state => {
        const stateInfo = allStatesMap.get(state.stateCode);
        if (stateInfo) {
          stateInfo.electoralVotes.push(state.electoralVotes);
        }

        if (!stateResults[state.stateCode]) {
          stateResults[state.stateCode] = {
            stateCode: state.stateCode,
            stateName: state.stateName,
            winner: null,
            democratVotes: 0,
            republicanVotes: 0,
            totalVotes: 0,
            electoralVotes: 0,
            democratPercentage: 0,
            republicanPercentage: 0,
          };
        }

        const democratResult = state.results.find(r => r.party === Party.DEMOCRAT)?.popularVotes || 0;
        const republicanResult = state.results.find(r => r.party === Party.REPUBLICAN)?.popularVotes || 0;

        stateResults[state.stateCode].democratVotes += democratResult;
        stateResults[state.stateCode].republicanVotes += republicanResult;
      });
    });

    Object.values(stateResults).forEach(state => {
        const stateInfo = allStatesMap.get(state.stateCode);
        const evArray = stateInfo?.electoralVotes || [];

        if (numYears > 1) { // Always average for multiple years
            state.democratVotes /= numYears;
            state.republicanVotes /= numYears;
            state.electoralVotes = evArray.length > 0 ? Math.round(evArray.reduce((a, b) => a + b, 0) / evArray.length) : 0;
        } else { // Single year
            state.electoralVotes = evArray.length > 0 ? evArray[0] : 0;
        }

        state.totalVotes = state.democratVotes + state.republicanVotes;
        if (state.totalVotes > 0) {
            state.democratPercentage = (state.democratVotes / state.totalVotes) * 100;
            state.republicanPercentage = (state.republicanVotes / state.totalVotes) * 100;
        }

        if (state.democratVotes > state.republicanVotes) {
            state.winner = Party.DEMOCRAT;
        } else if (state.republicanVotes > state.democratVotes) {
            state.winner = Party.REPUBLICAN;
        } else {
            state.winner = null;
        }

        democratPV.total += state.democratVotes;
        republicanPV.total += state.republicanVotes;
    });

    // Calculate total electoral votes based on single-year wins, not aggregated results
    if (selectedYears.length === 1) {
        const singleYearData = ELECTION_DATA.find(e => e.year === selectedYears[0]);
        singleYearData?.data.forEach(state => {
            const demVotes = state.results.find(r => r.party === Party.DEMOCRAT)?.popularVotes || 0;
            const repVotes = state.results.find(r => r.party === Party.REPUBLICAN)?.popularVotes || 0;
            if (demVotes > repVotes) {
                democratEV.total += state.electoralVotes;
            } else if (repVotes > demVotes) {
                republicanEV.total += state.electoralVotes;
            }
        });
        // Use the per-state calculated EV for the bar display
        Object.values(stateResults).forEach(state => {
            state.electoralVotes = singleYearData?.data.find(s => s.stateCode === state.stateCode)?.electoralVotes || 0;
        });

    } else {
        // For multiple years, we assign the aggregated EV for the map coloration 
        // and calculate totals based on the aggregated winner of each state.
        Object.values(stateResults).forEach(state => {
            const avgElectoralVotes = Math.round(allStatesMap.get(state.stateCode)!.electoralVotes.reduce((a, b) => a + b, 0) / numYears);
            if (state.winner === Party.DEMOCRAT) {
                democratEV.total += avgElectoralVotes;
            } else if (state.winner === Party.REPUBLICAN) {
                republicanEV.total += avgElectoralVotes;
            }
            state.electoralVotes = avgElectoralVotes;
        });
    }

    let title;
    const yearsString = selectedYears.join(', ');

    if (selectedYears.length > 1) {
        title = `Élections de ${yearsString} (Moyenne)`;
    } else {
        title = `Élection de ${yearsString}`;
    }

    return { 
      stateResults, 
      democratEV: democratEV.total, 
      republicanEV: republicanEV.total, 
      democratPV: Math.round(democratPV.total), 
      republicanPV: Math.round(republicanPV.total),
      title 
    };
  }, [selectedYears]);

  const handleStateHover = (hovered: HoveredState | null) => {
    setHoveredState(hovered);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 antialiased">
      <Header 
        democratEV={processedData.democratEV} 
        republicanEV={processedData.republicanEV}
        democratPV={processedData.democratPV}
        republicanPV={processedData.republicanPV}
        title={processedData.title} 
      />
      <main className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-7xl mx-auto mt-4">
        <div className="w-full lg:w-2/3">
            <USAMap data={processedData.stateResults} onStateHover={handleStateHover} />
        </div>
        <div className="w-full lg:w-1/3 flex justify-center">
            <Controls
                selectedYears={selectedYears}
                setSelectedYears={setSelectedYears}
            />
        </div>
      </main>
      <Tooltip hoveredState={hoveredState} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
