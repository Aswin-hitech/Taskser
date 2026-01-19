export default function ProgressMeter({ percentage = 0 }) {
  const safe = Math.min(100, Math.max(0, percentage));
  
  // Dynamic sizing
  const size = 380;
  const strokeWidth = 16;
  const radius = (size / 2) - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  
  // Dynamic color based on percentage
  let gradientId = "progressGradient";
  let color;
  
  if (safe < 40) {
    color = "url(#redGradient)";
  } else if (safe < 75) {
    color = "url(#yellowGradient)";
  } else {
    color = "url(#greenGradient)";
  }

  return (
    <div className="progress-container">
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#ff0066" />
          </linearGradient>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#44ff88" />
            <stop offset="100%" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        
        {/* Background ring with glow effect */}
        <circle
          className="progress-ring__bg"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress ring */}
        <circle
          className="progress-ring__circle"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        
        {/* Inner glow effect */}
        <circle
          r={radius - strokeWidth / 2}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />
      </svg>
      
      {/* Center percentage */}
      <div className="progress-text">
        {safe}%
      </div>
      
      {/* Progress label */}
      <div className="progress-label">
        {safe === 100 ? "🎉 All tasks completed!" : 
         safe >= 75 ? "Great progress!" :
         safe >= 40 ? "Keep going!" : "Let's get started!"}
      </div>
      
      {/* Animated particles for high percentages */}
      {safe >= 75 && (
        <div className="celebration-particles">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                animationDelay: `${i * 0.2}s`,
                transform: `rotate(${i * 45}deg)`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}