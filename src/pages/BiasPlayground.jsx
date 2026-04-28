import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import BiasSliders from '../components/BiasSliders.jsx';
import ApplicantTable from '../components/ApplicantTable.jsx';
import { generateDataset } from '../utils/dataGenerator.js';
import { calculateBiasDelta } from '../utils/biasEngine.js';

const BiasPlayground = () => {
  const [domain, setDomain] = useState('Loan Approval');
  const [isBiased, setIsBiased] = useState(false);
  const [biasFactors, setBiasFactors] = useState({
    zipCode: 0,
    gender: 0,
    age: 0,
    name: 0
  });
  const [dataset, setDataset] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const domains = ['Loan Approval', 'Job Hiring', 'Medical Priority'];

  useEffect(() => {
    handleGenerateDataset();
  }, []);

  const handleGenerateDataset = async () => {
    setIsGenerating(true);
    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDataset = generateDataset(200, isBiased ? biasFactors : { zipCode: 0, gender: 0, age: 0, name: 0 });
    setDataset(newDataset);
    setIsGenerating(false);
  };

  const getApprovalRateByGroup = (groupBy) => {
    const groups = {};
    
    dataset.forEach(applicant => {
      const group = applicant[groupBy];
      const decision = isBiased ? applicant.biasedDecision : applicant.unbiasedDecision;
      
      if (!groups[group]) {
        groups[group] = { total: 0, approved: 0 };
      }
      groups[group].total++;
      if (decision === 'Approved') {
        groups[group].approved++;
      }
    });

    return Object.keys(groups).map(group => ({
      group,
      approvalRate: (groups[group].approved / groups[group].total * 100).toFixed(1),
      total: groups[group].total
    }));
  };

  const getOverallApprovalRate = () => {
    if (dataset.length === 0) return 0;
    const approved = dataset.filter(applicant => 
      (isBiased ? applicant.biasedDecision : applicant.unbiasedDecision) === 'Approved'
    ).length;
    return (approved / dataset.length * 100).toFixed(1);
  };

  const getBiasDeltaIndicator = () => {
    if (dataset.length === 0) return 0;
    
    const maleData = dataset.filter(a => a.gender === 'Male');
    const femaleData = dataset.filter(a => a.gender === 'Female');
    
    if (maleData.length === 0 || femaleData.length === 0) return 0;
    
    const maleDecisions = maleData.map(a => ({
      decision: isBiased ? a.biasedDecision : a.unbiasedDecision
    }));
    
    const femaleDecisions = femaleData.map(a => ({
      decision: isBiased ? a.biasedDecision : a.unbiasedDecision
    }));
    
    return calculateBiasDelta(maleDecisions, femaleDecisions);
  };

  const genderData = getApprovalRateByGroup('gender');
  const ageData = getApprovalRateByGroup('age').map(item => ({
    ...item,
    group: item.group <= 35 ? '22-35' : item.group <= 45 ? '36-45' : item.group <= 55 ? '46-55' : '56-65'
  }));
  const zipData = getApprovalRateByGroup('zipTier');
  
  const overallRate = getOverallApprovalRate();
  const biasDelta = getBiasDeltaIndicator();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="glass-card p-3">
          <p className="text-sm font-medium text-white">{`${label}`}</p>
          <p className="text-sm text-accent-primary">{`Approval Rate: ${payload[0].value}%`}</p>
          {payload[0].payload.total && (
            <p className="text-xs text-gray-400">{`Total: ${payload[0].payload.total}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bias Playground</h1>
          <p className="text-gray-300">
            Simulate how bias affects AI decision-making in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Domain Selector */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Domain</h3>
              <div className="grid grid-cols-3 gap-2">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDomain(d)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      domain === d
                        ? 'bg-accent-primary text-white'
                        : 'bg-surface/50 text-gray-300 hover:bg-surface/70'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Bias Mode Toggle */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bias Mode</h3>
                <button
                  onClick={() => setIsBiased(!isBiased)}
                  className="flex items-center space-x-2 text-accent-primary hover:text-accent-secondary transition-colors"
                >
                  {isBiased ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                  <span className="font-medium">{isBiased ? 'Biased' : 'Unbiased'}</span>
                </button>
              </div>

              {isBiased && (
                <BiasSliders
                  biasFactors={biasFactors}
                  onChange={setBiasFactors}
                />
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateDataset}
              disabled={isGenerating}
              className="w-full accent-button flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Dataset</span>
                </>
              )}
            </button>

            {/* Sample Table */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Sample Applicants</h3>
              <ApplicantTable 
                applicants={dataset} 
                showBiased={isBiased}
                maxRows={10}
              />
            </div>
          </div>

          {/* Right Panel - Dashboard */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card text-center">
                <div className="text-2xl font-bold text-accent-primary mb-1">
                  {overallRate}%
                </div>
                <div className="text-sm text-gray-300">Overall Approval Rate</div>
              </div>
              
              <div className="stat-card text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  biasDelta > 10 ? 'text-red-400' : biasDelta > 5 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {biasDelta.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Bias Delta</div>
                {biasDelta > 10 && (
                  <div className="text-xs text-red-400 mt-1">High disparity detected</div>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">
                Approval Rate by Gender
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Shows how approval rates differ across gender groups
              </p>
            </div>

            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">
                Approval Rate by Age Group
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Shows how approval rates differ across age groups
              </p>
            </div>

            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">
                Approval Rate by Zip Code Tier
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={zipData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Shows how approval rates differ by geographic location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasPlayground;
