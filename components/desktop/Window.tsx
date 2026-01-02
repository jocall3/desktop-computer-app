import React, { useRef, useState, useEffect } from 'react';
import { Feature } from '../../types';

interface WindowProps {
    feature: Feature;
    state: any; // Using simplified type for compatibility with the big file
    isActive: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onMaximize: () => void;
    onFocus: () => void;
    onUpdate: (id: string, updates: any) => void;
    telemetryService: any;
}

export const Window: React.FC<WindowProps> = ({ feature, state, isActive, onClose, onMinimize, onMaximize, onFocus, onUpdate }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        onFocus();
        if (e.target instanceof HTMLElement && e.target.closest('.window-content')) return; // Don't drag if clicking content
        
        // Simple header check
        const header = e.currentTarget.querySelector('.window-header');
        if(header && header.contains(e.target as Node)) {
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - state.position.x,
                y: e.clientY - state.position.y
            };
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                onUpdate(feature.id, {
                    position: {
                        x: e.clientX - dragOffset.current.x,
                        y: e.clientY - dragOffset.current.y
                    },
                    isDragging: true
                });
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                onUpdate(feature.id, { isDragging: false });
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, feature.id, onUpdate]);

    if (state.isMinimized) return null;

    return (
        <div
            className={`absolute flex flex-col bg-gray-800 rounded-lg overflow-hidden shadow-2xl transition-shadow duration-200 
            ${isActive ? 'ring-1 ring-white/20 shadow-blue-500/10' : 'border border-gray-700 opacity-90'}`}
            style={{
                left: state.position.x,
                top: state.position.y,
                width: state.size.width,
                height: state.size.height,
                zIndex: state.zIndex,
                transition: isDragging ? 'none' : 'width 0.2s, height 0.2s, opacity 0.2s'
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Window Header */}
            <div className="window-header h-10 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/5 select-none">
                <div className="flex items-center gap-2 text-gray-200 text-sm font-medium">
                    <span className="opacity-80">{feature.icon}</span>
                    <span>{feature.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400" title="Minimize" />
                    <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400" title="Maximize" />
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" title="Close" />
                </div>
            </div>

            {/* Window Content */}
            <div className="window-content flex-1 bg-gray-900/95 backdrop-blur-sm text-gray-300 p-4 overflow-auto relative">
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 pointer-events-none">
                    <span className="text-4xl mb-4 grayscale">{feature.icon}</span>
                    <h3 className="text-xl font-light">Application Placeholder</h3>
                    <p className="text-sm mt-2 max-w-xs">{feature.description}</p>
                    <p className="text-xs mt-4 font-mono text-gray-500">Feature ID: {feature.id}</p>
                </div>
            </div>
            
            {/* Resize Handle (Mock) */}
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-white/10 rounded-tl" />
        </div>
    );
};