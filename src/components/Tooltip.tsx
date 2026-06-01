'use client';
import { useState, ReactNode } from 'react';
import { useTooltip } from '@/context/TooltipContext';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const { tooltipsEnabled } = useTooltip();
  const [visible, setVisible] = useState(false);

  if (!tooltipsEnabled) return <>{children}</>;

  const pos = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrow = {
    top:    'top-full left-1/2 -translate-x-1/2 border-t-[#5E1119] border-t-[6px] border-x-[6px] border-x-transparent border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#5E1119] border-b-[6px] border-x-[6px] border-x-transparent border-t-0',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-[#5E1119] border-l-[6px] border-y-[6px] border-y-transparent border-r-0',
    right:  'right-full top-1/2 -translate-y-1/2 border-r-[#5E1119] border-r-[6px] border-y-[6px] border-y-transparent border-l-0',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 ${pos[position]} pointer-events-none`}>
          <div
            style={{ backgroundColor: '#5E1119', color: '#F4EDE0' }}
            className="text-xs font-medium px-3 py-1.5 rounded shadow-lg max-w-[200px] text-center leading-snug whitespace-normal"
          >
            {text}
          </div>
          <div className={`absolute w-0 h-0 ${arrow[position]}`} />
        </div>
      )}
    </div>
  );
}
