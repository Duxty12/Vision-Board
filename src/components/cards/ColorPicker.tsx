'use client';

import { Shuffle } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export const PASTEL_COLORS = [
  '#FFF3B0', // Yellow
  '#FFD8B1', // Peach
  '#FFB3C6', // Pink
  '#E0C3FC', // Lavender
  '#B7F0D4', // Mint
  '#BAE6FD', // Sky
  '#D1FAE5', // Sage
  '#FECDD3', // Blush
];

export function ColorPicker({ selectedColor, onChange }: ColorPickerProps) {
  const handleShuffle = () => {
    const remainingColors = PASTEL_COLORS.filter(
      (c) => c.toLowerCase() !== selectedColor.toLowerCase()
    );
    const randomColor = remainingColors[Math.floor(Math.random() * remainingColors.length)];
    onChange(randomColor || PASTEL_COLORS[0]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PASTEL_COLORS.map((color) => {
        const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            className="w-7 h-7 rounded-full border border-stone-300/40 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cork-400 transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
              </span>
            )}
          </button>
        );
      })}
      <button
        type="button"
        id="color-picker-shuffle"
        onClick={handleShuffle}
        className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-50 hover:scale-110 transition-all duration-200"
        title="Shuffle Color"
      >
        <Shuffle size={12} />
      </button>
    </div>
  );
}
