import React, { useState, useEffect } from 'react';
import { Info, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import FairnessGauge from '../components/FairnessGauge.jsx';
import { generateDataset } from '../utils/dataGenerator.js';
import { getAllFairnessMetrics, compareBiasedVsUnbiased, getMetricStatusColor } from '../utils/fairnessMetrics.js';

const FairnessMetrics = () => {
  const [dataset, setDataset] = useState([]);
  const [groupBy, setGroupBy] = useState('gender');
  const [showComparison, setShowComparison] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInitialDataset();
  }, []);

  useEffect(() => {
    if (dataset.length > 0) {
      calculateMetrics();
    }
  }, [dataset, groupBy, showComparison]);

  const generateInitialDataset = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDataset = generateDataset(200, {
      zipCode: 0.3,
      gender: 0.2,
      age: 0.15,
      name: 0.25
    });
    setDataset(newDataset);
    setLoading(false);
  };

  const calculateMetrics = () => {
    if (showComparison) {
      const comp = compareBiasedVsUnbiased(dataset, groupBy);
      setComparison(comp);
      setMetrics(comp.biased);
    } else {
      const calculatedMetrics = getAllFairnessMetrics(dataset, groupBy);
      setMetrics(calculatedMetrics);
      setComparison(null);
    }
  };

  const MetricCard = ({ metric, showComparisonValue = false }) => {
    const comparisonValue = showComparison && comparison 
      ? comparison.comparison.find(c => c.metric === metric.metric)?.unbiased
      : null;

    return (
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{metric.metric}</h3>
            <p className="text-sm text-gray-400">{metric.explanation}</p>
          </div>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-3 glass-card text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {getDetailedExplanation(metric.metric)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <FairnessGauge metric={metric} size="medium" />
        </div>

        <div className="text-center">
          <div className={`text-sm font-medium ${
            metric.status === 'Good' ? 'text-green-400' :
            metric.status === 'Fair' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            Status: {metric.status}
          </div>
          
          {showComparisonValue && comparisonValue !== null && (
            <div className="mt-2 text-xs text-gray-400">
              <span>Unbiased: </span>
              <span className="text-accent-primary">
                {typeof comparisonValue === 'number' ? comparisonValue.toFixed(3) : comparisonValue}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getDetailedExplanation = (metricName) => {
    const explanations = {
      'Demographic Parity': 'Measures whether different demographic groups have similar approval rates. A value of 0 indicates perfect parity, while higher values indicate greater disparity.',
      'Equal Opportunity': 'Ensures that qualified applicants from all groups have equal chances of approval. It measures the difference in true positive rates between groups.',
      'Predictive Parity': 'Checks whether approved applicants from different groups have similar qualification rates. It measures the difference in precision between groups.',
      'Disparate Impact Ratio': 'The 4/5ths rule from employment law. A ratio below 0.8 indicates potential adverse impact. Values closer to 1.0 indicate better fairness.',
      'Individual Fairness': 'Measures whether similar individuals receive similar decisions. Higher values indicate more consistent treatment of similar cases.'
    };
    return explanations[metricName] || 'No detailed explanation available.';
  };

  const getOverallStatus = () => {
    if (metrics.length === 0) return { status: 'Unknown', color: '#6b7280' };
    
    const goodCount = metrics.filter(m => m.status === 'Good').length;
    const fairCount = metrics.filter(m => m.status === 'Fair').length;
    const poorCount = metrics.filter(m => m.status === 'Poor').length;
    
    if (poorCount > 0) return { status: 'Poor', color: '#ef4444' };
    if (fairCount > 0) return { status: 'Fair', color: '#f59e0b' };
    return { status: 'Good', color: '#10b981' };
  };

  const overallStatus = getOverallStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Calculating fairness metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fairness Metrics</h1>
          <p className="text-gray-300">
            Comprehensive analysis of algorithmic fairness using industry-standard metrics
          </p>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-white"
                >
                  <option value="gender">Gender</option>
                  <option value="zipTier">Zip Code Tier</option>
                  <option value="age">Age Group</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="flex items-center space-x-2 text-accent-primary hover:text-accent-secondary transition-colors"
                >
                  {showComparison ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                  <span className="font-medium">
                    {showComparison ? 'Show Comparison' : 'Biased vs Unbiased'}
                  </span>
                </button>
              </div>
            </div>

            <button
              onClick={generateInitialDataset}
              className="accent-button"
            >
              Generate New Dataset
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Overall Fairness Status</h2>
              <p className="text-gray-300">
                Based on {metrics.length} fairness metrics for {groupBy} grouping
              </p>
            </div>
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: overallStatus.color }}
              >
                {overallStatus.status}
              </div>
              {overallStatus.status === 'Poor' && (
                <div className="flex items-center text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>Critical fairness issues detected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard 
              key={metric.metric} 
              metric={metric} 
              showComparisonValue={showComparison}
            />
          ))}
        </div>

        {/* Comparison Table */}
        {showComparison && comparison && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Metric</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Biased</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Unbiased</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.comparison.map((item) => (
                    <tr key={item.metric} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white">{item.metric}</td>
                      <td className="py-3 px-4">
                        <span className={
                          item.status === 'Good' ? 'text-green-400' :
                          item.status === 'Fair' ? 'text-yellow-400' :
                          'text-red-400'
                        }>
                          {typeof item.biased === 'number' ? item.biased.toFixed(3) : item.biased}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-green-400">
                        {typeof item.unbiased === 'number' ? item.unbiased.toFixed(3) : item.unbiased}
                      </td>
                      <td className="py-3 px-4">
                        <span className={item.improvement > 0 ? 'text-green-400' : 'text-gray-400'}>
                          {item.improvement > 0 ? '+' : ''}
                          {typeof item.improvement === 'number' ? item.improvement.toFixed(3) : item.improvement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
              <p className="text-sm text-accent-primary">
                <strong>Key Insight:</strong> Removing bias from the algorithm improves fairness metrics across all dimensions. 
                The greatest improvements are typically seen in Demographic Parity and Disparate Impact Ratio.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FairnessMetrics;
