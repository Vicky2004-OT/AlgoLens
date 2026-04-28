// Fairness Metrics - Comprehensive fairness analysis for AlgoLens

export function calculateDemographicParity(dataset, groupBy) {
  // Demographic Parity — Difference in approval rates between groups
  const groups = {};
  
  dataset.forEach(applicant => {
    const group = applicant[groupBy];
    if (!groups[group]) {
      groups[group] = { total: 0, approved: 0 };
    }
    groups[group].total++;
    if (applicant.biasedDecision === 'Approved') {
      groups[group].approved++;
    }
  });
  
  const approvalRates = {};
  Object.keys(groups).forEach(group => {
    approvalRates[group] = groups[group].approved / groups[group].total;
  });
  
  const rates = Object.values(approvalRates);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const disparity = maxRate - minRate;
  
  return {
    metric: 'Demographic Parity',
    value: disparity,
    approvalRates,
    disparity,
    status: disparity > 0.1 ? 'Poor' : disparity > 0.05 ? 'Fair' : 'Good',
    explanation: `Measures whether different groups have similar approval rates. Current disparity: ${(disparity * 100).toFixed(1)}%`
  };
}

export function calculateEqualOpportunity(dataset, groupBy) {
  // Equal Opportunity — Difference in true positive rates between groups
  // For this simulation, we'll use unbiased decisions as the "ground truth"
  const groups = {};
  
  dataset.forEach(applicant => {
    const group = applicant[groupBy];
    if (!groups[group]) {
      groups[group] = { truePositives: 0, actualPositives: 0 };
    }
    
    const shouldApprove = applicant.unbiasedDecision === 'Approved';
    const didApprove = applicant.biasedDecision === 'Approved';
    
    if (shouldApprove) {
      groups[group].actualPositives++;
      if (didApprove) {
        groups[group].truePositives++;
      }
    }
  });
  
  const tprRates = {};
  Object.keys(groups).forEach(group => {
    tprRates[group] = groups[group].actualPositives > 0 
      ? groups[group].truePositives / groups[group].actualPositives 
      : 0;
  });
  
  const rates = Object.values(tprRates);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const disparity = maxRate - minRate;
  
  return {
    metric: 'Equal Opportunity',
    value: disparity,
    tprRates,
    disparity,
    status: disparity > 0.1 ? 'Poor' : disparity > 0.05 ? 'Fair' : 'Good',
    explanation: `Measures whether qualified applicants from all groups have equal approval chances. Current disparity: ${(disparity * 100).toFixed(1)}%`
  };
}

export function calculatePredictiveParity(dataset, groupBy) {
  // Predictive Parity — Difference in precision between groups
  const groups = {};
  
  dataset.forEach(applicant => {
    const group = applicant[groupBy];
    if (!groups[group]) {
      groups[group] = { truePositives: 0, predictedPositives: 0 };
    }
    
    const shouldApprove = applicant.unbiasedDecision === 'Approved';
    const didApprove = applicant.biasedDecision === 'Approved';
    
    if (didApprove) {
      groups[group].predictedPositives++;
      if (shouldApprove) {
        groups[group].truePositives++;
      }
    }
  });
  
  const precisionRates = {};
  Object.keys(groups).forEach(group => {
    precisionRates[group] = groups[group].predictedPositives > 0 
      ? groups[group].truePositives / groups[group].predictedPositives 
      : 0;
  });
  
  const rates = Object.values(precisionRates);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const disparity = maxRate - minRate;
  
  return {
    metric: 'Predictive Parity',
    value: disparity,
    precisionRates,
    disparity,
    status: disparity > 0.1 ? 'Poor' : disparity > 0.05 ? 'Fair' : 'Good',
    explanation: `Measures whether approved applicants from all groups have similar qualification rates. Current disparity: ${(disparity * 100).toFixed(1)}%`
  };
}

export function calculateDisparateImpact(dataset, groupBy) {
  // Disparate Impact Ratio — ratio of approval rates (flag if < 0.8 per 4/5ths rule)
  const groups = {};
  
  dataset.forEach(applicant => {
    const group = applicant[groupBy];
    if (!groups[group]) {
      groups[group] = { total: 0, approved: 0 };
    }
    groups[group].total++;
    if (applicant.biasedDecision === 'Approved') {
      groups[group].approved++;
    }
  });
  
  const approvalRates = {};
  Object.keys(groups).forEach(group => {
    approvalRates[group] = groups[group].approved / groups[group].total;
  });
  
  const rates = Object.values(approvalRates);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const ratio = minRate / maxRate;
  
  return {
    metric: 'Disparate Impact Ratio',
    value: ratio,
    approvalRates,
    ratio,
    status: ratio < 0.8 ? 'Poor' : ratio < 0.9 ? 'Fair' : 'Good',
    explanation: `Ratio of approval rates between groups. Values below 0.8 violate the 4/5ths rule. Current ratio: ${ratio.toFixed(3)}`
  };
}

export function calculateIndividualFairness(dataset) {
  // Individual Fairness Score — how often similar applicants get same decision
  let similarPairs = 0;
  let consistentDecisions = 0;
  
  for (let i = 0; i < dataset.length; i++) {
    for (let j = i + 1; j < dataset.length; j++) {
      const a1 = dataset[i];
      const a2 = dataset[j];
      
      // Check if applicants are similar (within 20% income, 50 credit score, same age group)
      const incomeSimilar = Math.abs(a1.income - a2.income) / Math.max(a1.income, a2.income) < 0.2;
      const creditSimilar = Math.abs(a1.creditScore - a2.creditScore) < 50;
      const ageSimilar = Math.abs(a1.age - a2.age) < 5;
      
      if (incomeSimilar && creditSimilar && ageSimilar) {
        similarPairs++;
        if (a1.biasedDecision === a2.biasedDecision) {
          consistentDecisions++;
        }
      }
    }
  }
  
  const fairnessScore = similarPairs > 0 ? consistentDecisions / similarPairs : 1;
  
  return {
    metric: 'Individual Fairness',
    value: fairnessScore,
    similarPairs,
    consistentDecisions,
    status: fairnessScore < 0.8 ? 'Poor' : fairnessScore < 0.9 ? 'Fair' : 'Good',
    explanation: `Measures whether similar applicants receive similar decisions. Score: ${(fairnessScore * 100).toFixed(1)}%`
  };
}

export function getAllFairnessMetrics(dataset, groupBy = 'gender') {
  // Calculate all fairness metrics for a given grouping
  const metrics = [
    calculateDemographicParity(dataset, groupBy),
    calculateEqualOpportunity(dataset, groupBy),
    calculatePredictiveParity(dataset, groupBy),
    calculateDisparateImpact(dataset, groupBy),
    calculateIndividualFairness(dataset)
  ];
  
  return metrics;
}

export function getMetricStatusColor(status) {
  switch (status) {
    case 'Good': return '#10b981'; // green
    case 'Fair': return '#f59e0b'; // amber
    case 'Poor': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
}

export function getMetricStatusIcon(status) {
  switch (status) {
    case 'Good': return '✓';
    case 'Fair': return '⚠';
    case 'Poor': return '✗';
    default: return '?';
  }
}

export function compareBiasedVsUnbiased(dataset, groupBy = 'gender') {
  // Compare fairness metrics between biased and unbiased decisions
  const biasedMetrics = getAllFairnessMetrics(dataset, groupBy);
  
  // Create unbiased version of dataset for comparison
  const unbiasedDataset = dataset.map(applicant => ({
    ...applicant,
    biasedDecision: applicant.unbiasedDecision,
    biasedScore: applicant.unbiasedScore
  }));
  
  const unbiasedMetrics = getAllFairnessMetrics(unbiasedDataset, groupBy);
  
  return {
    biased: biasedMetrics,
    unbiased: unbiasedMetrics,
    comparison: biasedMetrics.map((biased, index) => ({
      metric: biased.metric,
      biased: biased.value,
      unbiased: unbiasedMetrics[index].value,
      improvement: unbiasedMetrics[index].value - biased.value,
      status: biased.status
    }))
  };
}
