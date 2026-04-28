import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Calendar, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateDataset } from '../utils/dataGenerator.js';
import { getAllFairnessMetrics } from '../utils/fairnessMetrics.js';
import { generateBiasSummary, getApiKeyFromStorage } from '../utils/openrouterApi.js';

const BiasReport = () => {
  const [dataset, setDataset] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [domain, setDomain] = useState('Loan Approval');
  const [biasMode, setBiasMode] = useState('Biased');
  const [aiSummary, setAiSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  const domains = ['Loan Approval', 'Job Hiring', 'Medical Priority'];

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Generate dataset
    const newDataset = generateDataset(200, {
      zipCode: 0.3,
      gender: 0.2,
      age: 0.15,
      name: 0.25
    });
    setDataset(newDataset);

    // Calculate metrics
    const calculatedMetrics = getAllFairnessMetrics(newDataset, 'gender');
    setMetrics(calculatedMetrics);

    // Generate AI summary
    const apiKey = getApiKeyFromStorage();
    if (apiKey) {
      try {
        const summary = await generateBiasSummary(newDataset, calculatedMetrics, apiKey);
        setAiSummary(summary);
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
        setAiSummary('Unable to generate AI summary. Please check your API key.');
      }
    } else {
      setAiSummary('AI summary requires an OpenRouter API key. Please set your key in settings.');
    }

    setIsGenerating(false);
  };

  const getApprovalRateByGroup = (groupBy) => {
    const groups = {};
    
    dataset.forEach(applicant => {
      const group = applicant[groupBy];
      const decision = biasMode === 'Biased' ? applicant.biasedDecision : applicant.unbiasedDecision;
      
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

  const getOverallStats = () => {
    if (dataset.length === 0) return { overallRate: 0, biggestDisparity: 0 };

    const approved = dataset.filter(a => 
      (biasMode === 'Biased' ? a.biasedDecision : a.unbiasedDecision) === 'Approved'
    ).length;
    const overallRate = (approved / dataset.length * 100).toFixed(1);

    // Calculate biggest disparity
    const genderData = getApprovalRateByGroup('gender');
    const rates = genderData.map(d => parseFloat(d.approvalRate));
    const biggestDisparity = Math.max(...rates) - Math.min(...rates);

    return { overallRate, biggestDisparity };
  };

  const getTopBiasedFeatures = () => {
    return [
      { feature: 'Zip Code', influence: 30 },
      { feature: 'Gender', influence: 20 },
      { feature: 'Age', influence: 15 },
      { feature: 'Name-based', influence: 25 }
    ].sort((a, b) => b.influence - a.influence);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f1117'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('AlgoLens_Report.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const overallStats = getOverallStats();
  const genderData = getApprovalRateByGroup('gender');
  const ageData = getApprovalRateByGroup('age').map(item => ({
    ...item,
    group: item.group <= 35 ? '22-35' : item.group <= 45 ? '36-45' : item.group <= 55 ? '46-55' : '56-65'
  }));
  const zipData = getApprovalRateByGroup('zipTier');
  const topFeatures = getTopBiasedFeatures();

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

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Generating bias analysis report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bias Report</h1>
            <p className="text-gray-300">
              Comprehensive analysis and documentation of algorithmic bias
            </p>
          </div>
          
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="accent-button flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export as PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="space-y-8">
          {/* Report Header */}
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold gradient-text mb-2">AlgoLens Bias Analysis Report</h2>
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-1">Domain</div>
                <div className="font-semibold text-white">{domain}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-1">Bias Mode</div>
                <div className="font-semibold text-white">{biasMode}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-1">Dataset Size</div>
                <div className="font-semibold text-white">{dataset.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-300 mb-1">Analysis Date</div>
                <div className="font-semibold text-white">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-accent-primary" />
              Key Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-primary mb-1">
                  {overallStats.overallRate}%
                </div>
                <div className="text-sm text-gray-300">Overall Approval Rate</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  overallStats.biggestDisparity > 10 ? 'text-red-400' : 
                  overallStats.biggestDisparity > 5 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {overallStats.biggestDisparity.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Biggest Disparity</div>
                {overallStats.biggestDisparity > 10 && (
                  <div className="text-xs text-red-400 mt-1">High disparity detected</div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-secondary mb-1">
                  {metrics.filter(m => m.status === 'Poor').length}
                </div>
                <div className="text-sm text-gray-300">Critical Issues</div>
              </div>
            </div>
          </div>

          {/* Fairness Metrics Summary */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Fairness Metrics Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Metric</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.metric} className="border-b border-white/5">
                      <td className="py-3 px-4 text-white">{metric.metric}</td>
                      <td className="py-3 px-4 text-white">
                        {typeof metric.value === 'number' ? metric.value.toFixed(3) : metric.value}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          metric.status === 'Good' ? 'bg-green-400/20 text-green-400' :
                          metric.status === 'Fair' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {metric.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Approval by Gender</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Approval by Age Group</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Approval by Zip Tier</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={zipData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="group" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="approvalRate" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Biased Features */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-accent-primary" />
              Top Biased Features
            </h3>
            <div className="space-y-3">
              {topFeatures.map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-accent-primary">{index + 1}</span>
                    </div>
                    <span className="text-white">{feature.feature}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-surface rounded-full h-2">
                      <div 
                        className="bg-accent-primary h-2 rounded-full"
                        style={{ width: `${feature.influence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-300 w-12 text-right">{feature.influence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-accent-primary" />
              What This Means
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {aiSummary || 'Generating AI summary...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasReport;
