'use client';

interface ButterflyLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function ButterflyLoader({
  size = 'md',
  text,
  className = '',
}: ButterflyLoaderProps) {
  const sizeMap = {
    sm: { box: 'w-10 h-10', img: 'w-8 h-8', text: 'text-[10px]' },
    md: { box: 'w-16 h-16', img: 'w-12 h-12', text: 'text-xs' },
    lg: { box: 'w-24 h-24', img: 'w-16 h-16', text: 'text-sm' },
    xl: { box: 'w-32 h-32', img: 'w-24 h-24', text: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      <style>{`
        @keyframes pureButterflyPulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.45));
          }
          50% {
            transform: scale(1.12) rotate(-4deg);
            filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.9));
          }
        }
        .pure-butterfly-anim {
          animation: pureButterflyPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Floating Container (Zero Background Box) */}
      <div className={`relative ${currentSize.box} flex items-center justify-center`}>
        {/* The Clean Vector Butterfly with Transparent Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/butterfly.svg"
          alt="Loading..."
          className={`${currentSize.img} object-contain select-none pure-butterfly-anim`}
        />
      </div>

      {text && (
        <span className={`font-mono text-white/50 tracking-widest ${currentSize.text} animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );
}

