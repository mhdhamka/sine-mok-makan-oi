import React from 'react';

export const Footer: React.FC = () => {
  const locations = [
    'Carpenter Street',
    'Jalan Ban Hock',
    'Padungan',
    'Matang Jaya',
    'Satok',
    'Tabuan Jaya',
    'Hui Sing',
  ];

  return (
    <footer className="mt-8 border-t-2 border-[#2D2424]/20 pt-4 text-center text-xs text-stone-500">
      <p className="font-serif italic text-stone-700 font-bold">
        “Sine mok makan oi?” — The eternal Sarawakian dilemma solved by location radar, brotherhood allegiances, and the sacred compromise of Lau Ya Keng.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px] font-black text-stone-400">
        {locations.map((loc, idx) => (
          <React.Fragment key={loc}>
            <span>{loc}</span>
            {idx < locations.length - 1 && <span>•</span>}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
};