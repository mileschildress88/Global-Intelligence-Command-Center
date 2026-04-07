import React, { useRef } from 'react';
import { useGlobe } from '../hooks/useGlobe';

const Globe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useGlobe(containerRef);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(10,12,20,0)_0%,rgba(10,12,20,1)_90%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.5)_3px)]" />
    </div>
  );
};

export default Globe3D;
