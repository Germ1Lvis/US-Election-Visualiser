import React from 'react';
import { Party } from '../types';

interface HeaderProps {
  democratEV: number;
  republicanEV: number;
  democratPV: number;
  republicanPV: number;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ democratEV, republicanEV, democratPV, republicanPV, title }) => {
  const totalEV = 538;
  const democratEVWidth = totalEV > 0 ? (democratEV / totalEV) * 100 : 0;
  const republicanEVWidth = totalEV > 0 ? (republicanEV / totalEV) * 100 : 0;

  const totalPV = democratPV + republicanPV;
  const democratPVWidth = totalPV > 0 ? (democratPV / totalPV) * 100 : 50;
  const republicanPVWidth = totalPV > 0 ? (republicanPV / totalPV) * 100 : 50;


  return (
    <header className="w-full max-w-4xl mx-auto p-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">
        {title}
      </h1>
      <p className="text-slate-400 mt-2">
        Un candidat doit obtenir 270 grands électeurs sur 538 pour remporter les élections.
      </p>

      <div className="mt-6 space-y-2">
        <p className="text-slate-400 text-sm font-semibold tracking-wider">GRANDS ÉLECTEURS</p>
        <div className="flex justify-between items-center text-lg font-bold">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>
            <span className="text-blue-400">{Party.DEMOCRAT}</span>
            <span className="ml-3 text-white">{democratEV}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-3 text-white">{republicanEV}</span>
            <span className="text-red-400">{Party.REPUBLICAN}</span>
            <div className="w-4 h-4 rounded-sm bg-red-500 ml-2"></div>
          </div>
        </div>
        <div className="w-full h-4 bg-slate-700 rounded-full flex overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${democratEVWidth}%` }}
          ></div>
          <div 
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${republicanEVWidth}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <p className="text-slate-400 text-sm font-semibold tracking-wider">VOTE POPULAIRE</p>
        <div className="flex justify-between items-center text-lg font-bold">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-sm bg-blue-500 mr-2"></div>
            <span className="text-blue-400">{Party.DEMOCRAT}</span>
            <div className="ml-3 flex items-baseline">
                <span className="text-white">{democratPV.toLocaleString('fr-FR')}</span>
                {totalPV > 0 && <span className="text-slate-400 text-xs font-medium ml-1.5">({democratPVWidth.toFixed(1)}%)</span>}
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-3 flex items-baseline">
                <span className="text-white">{republicanPV.toLocaleString('fr-FR')}</span>
                {totalPV > 0 && <span className="text-slate-400 text-xs font-medium ml-1.5">({republicanPVWidth.toFixed(1)}%)</span>}
            </div>
            <span className="text-red-400">{Party.REPUBLICAN}</span>
            <div className="w-4 h-4 rounded-sm bg-red-500 ml-2"></div>
          </div>
        </div>
        <div className="w-full h-4 bg-slate-700 rounded-full flex overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${democratPVWidth}%` }}
          ></div>
          <div 
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${republicanPVWidth}%` }}
          ></div>
        </div>
      </div>

    </header>
  );
};

export default Header;