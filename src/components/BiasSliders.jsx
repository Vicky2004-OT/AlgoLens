import React from 'react';

const BiasSliders = ({ biasFactors, onChange, disabled = false }) => {
  const handleSliderChange = (factor, value) => {
    onChange({
      ...biasFactors,
      [factor]: value / 100 // Convert percentage to decimal
    });
  };

  const sliders = [
    {
      key: 'zipCode',
      label: 'Zip Code Influence',
      description: 'Higher values give preference to applicants from high-value zip codes',
      icon: '📍'
    },
    {
      key: 'gender',
      label: 'Gender Penalty',
      description: 'Higher values penalize female applicants',
      icon: '👥'
    },
    {
      key: 'age',
      label: 'Age Penalty',
      description: 'Higher values penalize applicants over 45 years old',
      icon: '📅'
    },
    {
      key: 'name',
      label: 'Name-Based Scoring',
      description: 'Higher values give preference to certain names (proxy for ethnicity)',
      icon: '📝'
    }
  ];

  return (
    <div className="space-y-6">
      {sliders.map((slider) => (
        <div key={slider.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{slider.icon}</span>
              <label className="text-sm font-medium text-white">
                {slider.label}
              </label>
            </div>
            <span className="text-sm text-accent-primary font-medium">
              {Math.round(biasFactors[slider.key] * 100)}%
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={biasFactors[slider.key] * 100}
              onChange={(e) => handleSliderChange(slider.key, parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${biasFactors[slider.key] * 100}%, #374151 ${biasFactors[slider.key] * 100}%, #374151 100%)`
              }}
            />
          </div>
          
          <p className="text-xs text-gray-400">
            {slider.description}
          </p>
        </div>
      ))}
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #7c3aed;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #1a1d27;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #7c3aed;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #1a1d27;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .slider:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default BiasSliders;
