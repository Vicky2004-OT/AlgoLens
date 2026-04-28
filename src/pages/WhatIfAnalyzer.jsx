import React, { useState, useEffect } from 'react';
import { Search, User, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateDataset } from '../utils/dataGenerator.js';
import { getUnbiasedScore, getBiasedScore, getDecision, getFeatureImportance } from '../utils/biasEngine.js';

const WhatIfAnalyzer = () => {
  const [dataset, setDataset] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scenarios, setScenarios] = useState({
    incomeIncrease: 0,
    zipUpgrade: false,
    ignoreGender: false,
    ignoreAge: false
  });

  useEffect(() => {
    // Generate initial dataset
    const newDataset = generateDataset(200, {
      zipCode: 0.3,
      gender: 0.2,
      age: 0.15,
      name: 0.25
    });
    setDataset(newDataset);
  }, []);

  const filteredApplicants = dataset.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.id.toString().includes(searchTerm)
  );

  const applyScenarios = (applicant) => {
    const modifiedApplicant = { ...applicant };
    const biasFactors = {
      zipCode: 0.3,
      gender: 0.2,
      age: 0.15,
      name: 0.25
    };

    // Apply income increase
    if (scenarios.incomeIncrease > 0) {
      modifiedApplicant.income = Math.round(applicant.income * (1 + scenarios.incomeIncrease / 100));
    }

    // Apply zip code upgrade
    if (scenarios.zipUpgrade) {
      if (applicant.zipTier === 'Low') modifiedApplicant.zipTier = 'Mid';
      else if (applicant.zipTier === 'Mid') modifiedApplicant.zipTier = 'High';
    }

    // Apply modified bias factors
    const modifiedBiasFactors = { ...biasFactors };
    if (scenarios.ignoreGender) modifiedBiasFactors.gender = 0;
    if (scenarios.ignoreAge) modifiedBiasFactors.age = 0;

    // Recalculate scores
    modifiedApplicant.unbiasedScore = getUnbiasedScore(modifiedApplicant);
    modifiedApplicant.biasedScore = getBiasedScore(modifiedApplicant, modifiedBiasFactors);
    modifiedApplicant.unbiasedDecision = getDecision(modifiedApplicant.unbiasedScore);
    modifiedApplicant.biasedDecision = getDecision(modifiedApplicant.biasedScore);

    return modifiedApplicant;
  };

  const getScenarioResults = () => {
    if (!selectedApplicant) return null;

    const original = selectedApplicant;
    const modified = applyScenarios(selectedApplicant);

    return { original, modified };
  };

  const getFeatureImportanceData = () => {
    if (!selectedApplicant) return [];

    const importance = getFeatureImportance(selectedApplicant, {
      zipCode: 0.3,
      gender: 0.2,
      age: 0.15,
      name: 0.25
    });

    return Object.entries(importance).map(([feature, value]) => ({
      feature: feature.charAt(0).toUpperCase() + feature.slice(1),
      importance: parseFloat(value.toFixed(1))
    })).sort((a, b) => b.importance - a.importance);
  };

  const scenarioResults = getScenarioResults();
  const featureImportanceData = getFeatureImportanceData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="glass-card p-3">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-sm text-accent-primary">{`Importance: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">What-If Analyzer</h1>
          <p className="text-gray-300">
            Explore how changing applicant attributes affects AI decisions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Applicant Selection */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Select Applicant</h3>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredApplicants.slice(0, 20).map(applicant => (
                  <button
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedApplicant?.id === applicant.id
                        ? 'bg-accent-primary/20 border border-accent-primary/30'
                        : 'bg-surface/50 hover:bg-surface/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{applicant.name}</div>
                        <div className="text-sm text-gray-400">ID: {applicant.id}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        applicant.biasedDecision === 'Approved' 
                          ? 'bg-green-400/20 text-green-400'
                          : 'bg-red-400/20 text-red-400'
                      }`}>
                        {applicant.biasedDecision}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Importance */}
            {selectedApplicant && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-accent-primary" />
                  Feature Importance
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={featureImportanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="feature" type="category" stroke="#9ca3af" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Shows which features most influenced the current decision
                </p>
              </div>
            )}
          </div>

          {/* Middle Panel - Scenarios */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-accent-primary" />
                What-If Scenarios
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Income Increase: {scenarios.incomeIncrease}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={scenarios.incomeIncrease}
                    onChange={(e) => setScenarios({...scenarios, incomeIncrease: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>+50%</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scenarios.zipUpgrade}
                      onChange={(e) => setScenarios({...scenarios, zipUpgrade: e.target.checked})}
                      className="w-4 h-4 text-accent-primary bg-surface border-white/10 rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      Upgrade Zip Code Tier
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1 ml-7">
                    Low → Mid → High
                  </p>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scenarios.ignoreGender}
                      onChange={(e) => setScenarios({...scenarios, ignoreGender: e.target.checked})}
                      className="w-4 h-4 text-accent-primary bg-surface border-white/10 rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      Ignore Gender in Decision
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scenarios.ignoreAge}
                      onChange={(e) => setScenarios({...scenarios, ignoreAge: e.target.checked})}
                      className="w-4 h-4 text-accent-primary bg-surface border-white/10 rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      Ignore Age in Decision
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Comparison */}
          <div className="space-y-6">
            {scenarioResults && (
              <>
                {/* Original Profile */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-400" />
                    Original Profile
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Name:</span>
                      <span className="text-white">{scenarioResults.original.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Age:</span>
                      <span className="text-white">{scenarioResults.original.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gender:</span>
                      <span className="text-white">{scenarioResults.original.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Zip Tier:</span>
                      <span className="text-white">{scenarioResults.original.zipTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Income:</span>
                      <span className="text-white">${scenarioResults.original.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Credit Score:</span>
                      <span className="text-white">{scenarioResults.original.creditScore}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Score:</span>
                        <span className="text-white">{scenarioResults.original.biasedScore.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Decision:</span>
                        <span className={`font-medium ${
                          scenarioResults.original.biasedDecision === 'Approved' 
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {scenarioResults.original.biasedDecision}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modified Profile */}
                <div className="glass-card p-6 border-2 border-accent-primary/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-accent-primary" />
                    Modified Profile
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Name:</span>
                      <span className="text-white">{scenarioResults.modified.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Age:</span>
                      <span className="text-white">{scenarioResults.modified.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gender:</span>
                      <span className="text-white">{scenarioResults.modified.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Zip Tier:</span>
                      <span className="text-white">{scenarioResults.modified.zipTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Income:</span>
                      <span className="text-white">
                        ${scenarioResults.modified.income.toLocaleString()}
                        {scenarioResults.modified.income !== scenarioResults.original.income && (
                          <span className="text-accent-primary ml-2">
                            (+{scenarios.incomeIncrease}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Credit Score:</span>
                      <span className="text-white">{scenarioResults.modified.creditScore}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Score:</span>
                        <span className="text-white">
                          {scenarioResults.modified.biasedScore.toFixed(3)}
                          {scenarioResults.modified.biasedScore !== scenarioResults.original.biasedScore && (
                            <span className={`ml-2 ${
                              scenarioResults.modified.biasedScore > scenarioResults.original.biasedScore
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {scenarioResults.modified.biasedScore > scenarioResults.original.biasedScore ? '+' : ''}
                              {(scenarioResults.modified.biasedScore - scenarioResults.original.biasedScore).toFixed(3)}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Decision:</span>
                        <span className={`font-medium ${
                          scenarioResults.modified.biasedDecision === 'Approved' 
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {scenarioResults.modified.biasedDecision}
                          {scenarioResults.modified.biasedDecision !== scenarioResults.original.biasedDecision && (
                            <span className="ml-2 text-xs">
                              ({scenarioResults.original.biasedDecision} → {scenarioResults.modified.biasedDecision})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!selectedApplicant && (
              <div className="glass-card p-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">Select an applicant to analyze</p>
                <p className="text-sm text-gray-400 mt-2">
                  Choose from the list to see detailed profile and what-if scenarios
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfAnalyzer;
