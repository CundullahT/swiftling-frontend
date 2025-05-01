interface PieTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function PieTimer({ 
  timeLeft, 
  totalTime, 
  size = 60, 
  strokeWidth = 6,
  className = ""
}: PieTimerProps) {
  // Calculate percentage of time remaining (ensure between 0-100)
  // Use the current timeLeft compared to its own starting time, not the original totalTime
  const currentTotalTime = Math.max(timeLeft, totalTime); // Use the max of timeLeft or totalTime to handle higher limits
  const percentage = Math.min(100, Math.max(0, (timeLeft / currentTotalTime) * 100));
  
  // Calculate remaining stroke dasharray and dashoffset
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on time remaining
  const getColor = () => {
    if (percentage > 60) return "#22c55e"; // Green
    if (percentage > 30) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
      </svg>
      
      {/* Timer progress circle */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-linear"
        />
      </svg>
      
      {/* Time left display */}
      <div className="text-sm font-medium">{Math.ceil(timeLeft)}</div>
    </div>
  );
}