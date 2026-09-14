import React from "react";

export const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export interface OffersAlphabetBarProps {
  selectedLetter: string;
  onSelectLetter: (letter: string) => void;
  ariaLabel?: string;
  className?: string;
}

export const OffersAlphabetBar = React.memo(function OffersAlphabetBar({
  selectedLetter,
  onSelectLetter,
  ariaLabel = "Brand alphabet filter",
  className = "",
}: OffersAlphabetBarProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 ${className}`}
    >
      {ALPHABET.map((letter) => {
        const isSelected = selectedLetter === letter;
        return (
          <button
            key={letter}
            type="button"
            role="button"
            aria-pressed={isSelected}
            aria-label={`Filter by letter ${letter}`}
            onClick={() => onSelectLetter(letter)}
            className={`inline-flex items-center justify-center shrink-0 min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
});
