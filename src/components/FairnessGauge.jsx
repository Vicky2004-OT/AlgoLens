import React from 'react';
import { getMetricStatusColor, getMetricStatusIcon } from '../utils/fairnessMetrics.js';

const FairnessGauge = ({ metric, size = 'medium' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-24 h-24';
      case 'large':
        return 'w-40 h-40';
      default:
        return 'w-32 h-32';
    }
  };

  const getStrokeWidth = () => {
    switch (size) {
      case 'small':
        return 6;
      case 'large':
        return 12;
      default:
        return 8;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'large':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  // Normalize the value to 0-1 scale for the gauge
  let normalizedValue = metric.value;
  
  // For disparate impact ratio, the scale is different (0-1, higher is better)
  if (metric.metric === 'Disparate Impact Ratio') {
    normalizedValue = Math.min(metric.value, 1); // Cap at 1
  } else {
    // For other metrics, lower is better (disparity), so we invert
    normalizedValue = Math.max(0, 1 - metric.value); // Invert and ensure non-negative
  }

  const percentage = Math.round(normalizedValue * 100);
  const color = getMetricStatusColor(metric.status);
  const icon = getMetricStatusIcon(metric.status);

  // Calculate the stroke dasharray for the gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue * circumference);

  return (
    <div className={`metric-gauge ${getSizeClasses()}`}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox="0 0 120 120"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={getStrokeWidth()}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth={getStrokeWidth()}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`flex items-center justify-center ${getFontSize()} font-bold`} style={{ color }}>
          {icon} {percentage}%
        </div>
        <div className="text-xs text-gray-400 text-center mt-1 px-2">
          {metric.status}
        </div>
      </div>
    </div>
  );
};

export default FairnessGauge;
