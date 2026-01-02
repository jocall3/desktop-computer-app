import React from 'react';
import { Feature } from '../../types';

interface TaskbarProps {
    minimizedWindows: Feature[];
    openWindows: Feature[];
    onRestore: (id: string) => void;
    onOpenSearch: () => void;
    onSwitchDesktop: (id: string) => void;
    activeDesktopId: string;
    allDesktops: any[];
    onLogout: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ openWindows, onRestore, onOpenSearch, onLogout }) => {
    return (
        <div className="absolute bottom-4 left-4 right-4 h-14 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center justify-between px-4 z-50 shadow-2xl">
            <div className="flex items-center gap-3">
                 <button 
                    onClick={onOpenSearch} 
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white flex items-center gap-2 font-semibold"
                 >
                    <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-md"></div>
                    <span>Start</span>
                 </button>
                 
                 <div className="h-6 w-px bg-white/10 mx-2" />
                 
                 <div className="flex items-center gap-2">
                    {openWindows.map(feat => (
                        <button 
                            key={feat.id} 
                            onClick={() => onRestore(feat.id)} 
                            className="group relative p-2 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center gap-2 transition-all active:scale-95"
                        >
                            <span className="text-lg">{feat.icon}</span>
                            <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors max-w-[100px] truncate">{feat.name}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                        </button>
                    ))}
                 </div>
            </div>

            <div className="flex items-center gap-4 text-white/80">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-[10px] opacity-70">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <button 
                    onClick={onLogout} 
                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-xs font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};