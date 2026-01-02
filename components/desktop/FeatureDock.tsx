import React from 'react';
import { ALL_FEATURES } from '../features';

interface FeatureDockProps {
    onOpen: (id: string) => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen }) => {
    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-3 bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-40 transition-all duration-300 hover:bg-gray-900/60">
            {ALL_FEATURES.map(feat => (
                <button
                    key={feat.id}
                    onClick={() => onOpen(feat.id)}
                    className="group relative flex items-center justify-center w-12 h-12 rounded-xl text-2xl transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
                    title={feat.name}
                >
                    <span className="drop-shadow-lg">{feat.icon}</span>
                    {/* Tooltip */}
                    <span className="absolute left-full ml-4 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {feat.name}
                    </span>
                </button>
            ))}
        </div>
    );
};