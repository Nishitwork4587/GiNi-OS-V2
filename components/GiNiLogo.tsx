import React from 'react';

export function GiNiLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      <defs>
        {/* Rich Gold Gradient */}
        <linearGradient id="gold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="25%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="75%" stopColor="#FCE68D" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        
        {/* Deep Red Gradient */}
        <linearGradient id="red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#4A0000" />
        </linearGradient>
        
        {/* Diamond Glow Effect */}
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#E0F7FA" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Red Accent Path for the 'G' */}
      <path 
        d="M 120 40 C 180 40, 180 120, 130 110 C 100 100, 100 60, 130 60" 
        stroke="url(#red)" 
        strokeWidth="22" 
        strokeLinecap="round" 
      />
            
      {/* Foreground Sweeping Gold 'G' Path */}
      <path 
        d="M 130 40 C 60 40, 40 130, 80 160 C 130 190, 180 160, 170 100 C 160 50, 100 50, 100 90" 
        stroke="url(#gold)" 
        strokeWidth="14" 
        strokeLinecap="round" 
      />

      {/* Diamond/Sparkle Accent near the bottom curve */}
      <circle cx="85" cy="155" r="16" fill="url(#glow)" />
      <polygon points="85,142 94,155 85,168 76,155" fill="#FFFFFF" />
      <polygon points="85,146 91,155 85,164 79,155" fill="#E0F7FA" />
      
      {/* Diamond Sparkle Rays */}
      <path 
        d="M 85 132 L 85 140 M 85 170 L 85 178 M 62 155 L 70 155 M 100 155 L 108 155" 
        stroke="url(#gold)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}