import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ELECTION_DATA } from './data/electionData';
import {
  Party,
  ProcessedStateData,
  HoveredState,
  MapViewMode,
  ColorMode,
  StateHistoryPoint
} from './types';
import Header from './components/Header';
import USAMap from './components/USAMap';
import Controls, { SWING_STATES_2024 } from './components/Controls';
import Tooltip from './components/Tooltip';
import StateDrawer from './components/StateDrawer';

const App: React.FC = () => {
  const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>('geo');
  const [colorMode, setColorMode] = useState<ColorMode>('solid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'swing' | 'dem' | 'rep'>('all');

  // Precompute 1980-2024 history for every state
  const stateHistories = useMemo(() => {
    const historyMap = new Map<string, StateHistoryPoint[]>();

    // Process all elections sorted descending (2024 down to 1980)
    const sortedElections = [...ELECTION_DATA].sort((a, b) => b.year - a.year);

    sortedElections.forEach(election => {
      election.data.forEach(st => {
        const demResult = st.results.find(r => r.party === Party.DEMOCRAT)?.popularVotes || 0;
        const repResult = st.results.find(r => r.party === Party.REPUBLICAN)?.popularVotes || 0;
        const total = demResult + repResult;
        const demPct = total > 0 ? (demResult / total) * 100 : 0;
        const repPct = total > 0 ? (repResult / total) * 100 : 0;
        const winner = demResult > repResult ? Party.DEMOCRAT : repResult > demResult ? Party.REPUBLICAN : null;

        const point: StateHistoryPoint = {
          year: election.year,
          winner,
          democratVotes: demResult,
          republicanVotes: repResult,
          democratPercentage: demPct,
          republicanPercentage: repPct,
          electoralVotes: st.electoralVotes,
          margin: demPct - repPct,
        };

        if (!historyMap.has(st.stateCode)) {
          historyMap.set(st.stateCode, []);
        }
        historyMap.get(st.stateCode)!.push(point);
      });
    });

    return historyMap;
  }, []);

  // Process data for currently selected year(s)
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
        title: "Cartographie Électorale des États-Unis",
        democratCandidate: 'Démocrate',
        republicanCandidate: 'Républicain',
      };
    }

    // Get candidate names if single year
    let democratCandidate = 'Démocrate';
    let republicanCandidate = 'Républicain';
    if (selectedYears.length === 1) {
      const singleYear = relevantElections[0];
      const sampleState = singleYear.data[0];
      const demCand = sampleState.results.find(r => r.party === Party.DEMOCRAT)?.name;
      const repCand = sampleState.results.find(r => r.party === Party.REPUBLICAN)?.name;
      if (demCand) democratCandidate = demCand;
      if (repCand) republicanCandidate = repCand;
    }

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
            margin: 0,
            marginVotes: 0,
            democratCandidateName: democratCandidate,
            republicanCandidateName: republicanCandidate,
            history: stateHistories.get(state.stateCode) || [],
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

      if (numYears > 1) {
        state.democratVotes /= numYears;
        state.republicanVotes /= numYears;
        state.electoralVotes = evArray.length > 0 ? Math.round(evArray.reduce((a, b) => a + b, 0) / evArray.length) : 0;
      } else {
        state.electoralVotes = evArray.length > 0 ? evArray[0] : 0;
      }

      state.totalVotes = state.democratVotes + state.republicanVotes;
      if (state.totalVotes > 0) {
        state.democratPercentage = (state.democratVotes / state.totalVotes) * 100;
        state.republicanPercentage = (state.republicanVotes / state.totalVotes) * 100;
        state.margin = state.democratPercentage - state.republicanPercentage;
        state.marginVotes = Math.round(state.democratVotes - state.republicanVotes);
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

    // Single-year EV exact tally vs multi-year aggregate
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
      Object.values(stateResults).forEach(state => {
        state.electoralVotes = singleYearData?.data.find(s => s.stateCode === state.stateCode)?.electoralVotes || 0;
      });
    } else {
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

    const yearsString = selectedYears.join(', ');
    const title = selectedYears.length > 1
      ? `Élections de ${yearsString} (Moyenne)`
      : `Élection Présidentielle de ${yearsString}`;

    return {
      stateResults,
      democratEV: democratEV.total,
      republicanEV: republicanEV.total,
      democratPV: Math.round(democratPV.total),
      republicanPV: Math.round(republicanPV.total),
      title,
      democratCandidate,
      republicanCandidate,
    };
  }, [selectedYears, stateHistories]);

  // Compute highlighted state codes based on search and filters
  const highlightedStateCodes = useMemo(() => {
    let list: string[] = Object.keys(processedData.stateResults);

    // Filter by active category
    if (activeFilter === 'swing') {
      list = list.filter(code => SWING_STATES_2024.includes(code));
    } else if (activeFilter === 'dem') {
      list = list.filter(code => processedData.stateResults[code]?.winner === Party.DEMOCRAT);
    } else if (activeFilter === 'rep') {
      list = list.filter(code => processedData.stateResults[code]?.winner === Party.REPUBLICAN);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(code => {
        const s = processedData.stateResults[code];
        if (!s) return false;
        return (
          s.stateCode.toLowerCase().includes(q) ||
          s.stateName.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [processedData.stateResults, activeFilter, searchQuery]);

  const handleStateHover = (hovered: HoveredState | null) => {
    setHoveredState(hovered);
  };

  const handleStateSelect = (stateData: ProcessedStateData) => {
    setSelectedStateCode(stateData.stateCode);
  };

  const handleCloseDrawer = () => {
    setSelectedStateCode(null);
  };

  const handleSelectYearFromDrawer = (year: number) => {
    setSelectedYears([year]);
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStateCode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentlySelectedState = selectedStateCode ? processedData.stateResults[selectedStateCode] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center selection:bg-sky-500 selection:text-white antialiased">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-slate-800/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center pb-12">
        <Header
          democratEV={processedData.democratEV}
          republicanEV={processedData.republicanEV}
          democratPV={processedData.democratPV}
          republicanPV={processedData.republicanPV}
          title={processedData.title}
          democratCandidate={processedData.democratCandidate}
          republicanCandidate={processedData.republicanCandidate}
          selectedYearsCount={selectedYears.length}
        />

        <main className="flex flex-col xl:flex-row items-start justify-center gap-6 w-full max-w-[1400px] px-3 sm:px-6 mt-2">
          {/* Main Map Visualization */}
          <div className="w-full xl:w-3/4">
            <USAMap
              data={processedData.stateResults}
              onStateHover={handleStateHover}
              onStateSelect={handleStateSelect}
              selectedStateCode={selectedStateCode}
              highlightedStates={highlightedStateCodes}
              viewMode={viewMode}
              colorMode={colorMode}
              onToggleViewMode={setViewMode}
              onToggleColorMode={setColorMode}
            />
          </div>

          {/* Controls & Filter Panel */}
          <div className="w-full xl:w-1/4 flex justify-center">
            <Controls
              selectedYears={selectedYears}
              setSelectedYears={setSelectedYears}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>
        </main>
      </div>

      {/* Floating Tooltip */}
      <Tooltip hoveredState={hoveredState} />

      {/* State Detail Inspection Drawer */}
      <StateDrawer
        selectedState={currentlySelectedState || null}
        onClose={handleCloseDrawer}
        onSelectYear={handleSelectYearFromDrawer}
      />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
