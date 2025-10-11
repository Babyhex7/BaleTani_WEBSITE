/**
 * BaleTani Logo Component
 * SVG logo dengan house + leaf design yang bisa di-customize
 */
const BaleTaniLogo = ({ width = 40, height = 40, className = "" }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#16a34a"/>
        </linearGradient>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
      
      {/* House structure */}
      <path 
        d="M50 120 L100 70 L150 120 L150 160 L50 160 Z" 
        fill="url(#greenGradient)" 
        strokeWidth="3" 
        stroke="#16a34a"
      />
      
      {/* House window */}
      <rect 
        x="85" 
        y="110" 
        width="30" 
        height="25" 
        rx="4" 
        fill="#16a34a"
      />
      
      {/* Large leaf */}
      <path 
        d="M120 90 Q140 70 160 85 Q150 105 130 100 Q125 95 120 90 Z" 
        fill="url(#greenGradient)" 
        strokeWidth="2" 
        stroke="#16a34a"
      />
      <path 
        d="M125 92 Q135 82 145 88" 
        fill="none" 
        stroke="#16a34a" 
        strokeWidth="2"
      />
      
      {/* Small leaf */}
      <circle 
        cx="165" 
        cy="95" 
        r="8" 
        fill="url(#greenGradient)"
      />
      
      {/* Ground/Base */}
      <path 
        d="M30 160 Q100 150 170 160 L170 170 L30 170 Z" 
        fill="url(#orangeGradient)"
      />
    </svg>
  );
};

export default BaleTaniLogo;