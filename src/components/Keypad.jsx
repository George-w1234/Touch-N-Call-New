"use client";

export default function Keypad({ onDigit, onClear, onBackspace }) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          onClick={() => onDigit(digit.toString())}
          className="w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg transition-colors duration-150"
        >
          {digit}
        </button>
      ))}
      <button
        onClick={onClear}
        className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors duration-150"
      >
        CLR
      </button>
      <button
        onClick={() => onDigit("0")}
        className="w-16 h-16 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold rounded-lg transition-colors duration-150"
      >
        0
      </button>
      <button
        onClick={onBackspace}
        className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors duration-150"
      >
        ⌫
      </button>
    </div>
  );
}
