import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const StatTicker = () => {
  const stats = [
    {
      title: "Amazon's Hiring AI",
      description: "Penalized resumes mentioning 'women's' — scrapped 2018",
      year: "2018",
      impact: "Gender Bias"
    },
    {
      title: "COMPAS Algorithm",
      description: "Flagged Black defendants as high-risk at 2× the rate of white defendants",
      year: "2016",
      impact: "Racial Bias"
    },
    {
      title: "Healthcare Algorithm",
      description: "Deprioritized Black patients due to biased cost proxy data",
      year: "2019",
      impact: "Proxy Discrimination"
    },
    {
      title: "Facial Recognition",
      description: "Higher error rates for women and people of color",
      year: "2018",
      impact: "Demographic Bias"
    },
    {
      title: "Credit Scoring AI",
      description: "Denied loans to qualified applicants from minority neighborhoods",
      year: "2021",
      impact: "Geographic Bias"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stats.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [stats.length]);

  const currentStat = stats[currentIndex];

  return (
    <div className="glass-card p-6 max-w-4xl mx-auto">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {currentStat.title}
            </h3>
            <span className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs rounded-full">
              {currentStat.year}
            </span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              {currentStat.impact}
            </span>
          </div>
          
          <p className="text-gray-300 leading-relaxed animate-fade-in">
            {currentStat.description}
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex items-center justify-center space-x-2 mt-6">
        {stats.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-accent-primary w-8'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to stat ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default StatTicker;
