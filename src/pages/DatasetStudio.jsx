import React, { useState, useRef } from 'react';
import { Upload, Download, Play, RefreshCw, Database, Settings } from 'lucide-react';
import Papa from 'papaparse';
import ApplicantTable from '../components/ApplicantTable.jsx';
import { generateDataset, generateCustomDataset, getDatasetSummary } from '../utils/dataGenerator.js';

const DatasetStudio = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'upload', 'manual'
  const [dataset, setDataset] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Generate tab state
  const [generateSize, setGenerateSize] = useState(200);

  // Manual config state
  const [manualConfig, setManualConfig] = useState({
    populationSize: 200,
    genderDistribution: { Male: 48, Female: 48, 'Non-binary': 4 },
    incomeMean: 60000,
    incomeStd: 25000,
    zipDistribution: { High: 30, Mid: 40, Low: 30 },
    existingBias: 0
  });

  const handleGenerateDataset = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDataset = generateDataset(generateSize, {
      zipCode: manualConfig.existingBias / 100,
      gender: manualConfig.existingBias / 100,
      age: manualConfig.existingBias / 100,
      name: manualConfig.existingBias / 100
    });
    
    setDataset(newDataset);
    setIsGenerating(false);
  };

  const handleGenerateCustomDataset = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const config = {
      ...manualConfig,
      genderDistribution: {
        Male: manualConfig.genderDistribution.Male / 100,
        Female: manualConfig.genderDistribution.Female / 100,
        'Non-binary': manualConfig.genderDistribution['Non-binary'] / 100
      },
      zipDistribution: {
        High: manualConfig.zipDistribution.High / 100,
        Mid: manualConfig.zipDistribution.Mid / 100,
        Low: manualConfig.zipDistribution.Low / 100
      },
      existingBias: manualConfig.existingBias / 100
    };
    
    const newDataset = generateCustomDataset(config);
    setDataset(newDataset);
    setIsGenerating(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Process the uploaded CSV data
        const processedData = results.data
          .filter(row => row.id && row.name) // Filter out empty rows
          .map((row, index) => ({
            id: parseInt(row.id) || index + 1,
            name: row.name || `Applicant ${index + 1}`,
            age: parseInt(row.age) || 30,
            gender: row.gender || 'Unknown',
            zipTier: row.zipTier || 'Mid',
            income: parseInt(row.income) || 50000,
            creditScore: parseInt(row.creditScore) || 650,
            nameScore: parseFloat(row.nameScore) || 0.5,
            unbiasedScore: parseFloat(row.unbiasedScore) || 0.5,
            biasedScore: parseFloat(row.biasedScore) || 0.5,
            unbiasedDecision: row.unbiasedDecision || 'Rejected',
            biasedDecision: row.biasedDecision || 'Rejected'
          }));
        
        setDataset(processedData);
        setIsUploading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsUploading(false);
        alert('Error parsing CSV file. Please check the format.');
      }
    });
  };

  const downloadDataset = () => {
    if (dataset.length === 0) return;

    const csv = Papa.unparse(dataset);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algolens_dataset.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const summary = dataset.length > 0 ? getDatasetSummary(dataset) : null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dataset Studio</h1>
          <p className="text-gray-300">
            Create, upload, and customize datasets for bias analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-surface/50 rounded-lg p-1">
          {[
            { id: 'generate', label: 'Use Playground Data', icon: Database },
            { id: 'upload', label: 'Upload CSV', icon: Upload },
            { id: 'manual', label: 'Manual Config', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {activeTab === 'generate' && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Generate from Playground</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dataset Size
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="500"
                      value={generateSize}
                      onChange={(e) => setGenerateSize(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  
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
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-accent-primary/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload CSV file</p>
                    <p className="text-sm text-gray-400">
                      Expected columns: id, name, age, gender, zipTier, income, creditScore, nameScore
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Manual Configuration</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Population Size
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="500"
                      value={manualConfig.populationSize}
                      onChange={(e) => setManualConfig({...manualConfig, populationSize: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender Distribution (%)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(manualConfig.genderDistribution).map(gender => (
                        <div key={gender}>
                          <label className="text-xs text-gray-400">{gender}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={manualConfig.genderDistribution[gender]}
                            onChange={(e) => setManualConfig({
                              ...manualConfig,
                              genderDistribution: {
                                ...manualConfig.genderDistribution,
                                [gender]: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-2 py-1 bg-surface border border-white/10 rounded text-white text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Income Distribution
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Mean ($)</label>
                        <input
                          type="number"
                          min="20000"
                          max="120000"
                          value={manualConfig.incomeMean}
                          onChange={(e) => setManualConfig({...manualConfig, incomeMean: parseInt(e.target.value)})}
                          className="w-full px-2 py-1 bg-surface border border-white/10 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Std Dev ($)</label>
                        <input
                          type="number"
                          min="5000"
                          max="50000"
                          value={manualConfig.incomeStd}
                          onChange={(e) => setManualConfig({...manualConfig, incomeStd: parseInt(e.target.value)})}
                          className="w-full px-2 py-1 bg-surface border border-white/10 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Zip Code Distribution (%)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.keys(manualConfig.zipDistribution).map(tier => (
                        <div key={tier}>
                          <label className="text-xs text-gray-400">{tier}</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={manualConfig.zipDistribution[tier]}
                            onChange={(e) => setManualConfig({
                              ...manualConfig,
                              zipDistribution: {
                                ...manualConfig.zipDistribution,
                                [tier]: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-2 py-1 bg-surface border border-white/10 rounded text-white text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Existing Bias Level (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={manualConfig.existingBias}
                      onChange={(e) => setManualConfig({...manualConfig, existingBias: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-accent-primary">
                      {manualConfig.existingBias}%
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateCustomDataset}
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
                </div>
              </div>
            )}

            {/* Dataset Summary */}
            {summary && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Dataset Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Applicants:</span>
                    <span className="text-white font-medium">{summary.totalApplicants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Mean Income:</span>
                    <span className="text-white font-medium">${summary.meanIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Approval Rate (Unbiased):</span>
                    <span className="text-white font-medium">{summary.approvalRate.unbiased}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Approval Rate (Biased):</span>
                    <span className="text-white font-medium">{summary.approvalRate.biased}%</span>
                  </div>
                  
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-300 mb-2">Gender Breakdown:</p>
                    {Object.entries(summary.genderBreakdown).map(([gender, count]) => (
                      <div key={gender} className="flex justify-between text-sm">
                        <span className="text-gray-400">{gender}:</span>
                        <span className="text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={downloadDataset}
                  className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-accent-secondary/20 text-accent-secondary rounded-lg hover:bg-accent-secondary/30 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download as CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Dataset Preview</h3>
            {dataset.length > 0 ? (
              <ApplicantTable 
                applicants={dataset.slice(0, 10)} 
                showBiased={true}
                maxRows={10}
              />
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No dataset loaded</p>
                <p className="text-sm text-gray-400 mt-2">
                  Generate, upload, or configure a dataset to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetStudio;
