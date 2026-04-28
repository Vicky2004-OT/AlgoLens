// Bias Engine - Core scoring and decision logic for AlgoLens

export function getUnbiasedScore(applicant) {
  // Uses only: income (weight 0.5), creditScore (weight 0.5)
  // Normalize both to 0-1 range, return weighted sum
  
  const incomeScore = Math.min(applicant.income / 120000, 1); // Normalize income (max 120k)
  const creditScoreNormalized = (applicant.creditScore - 300) / 550; // Normalize credit score (300-850)
  
  const unbiasedScore = (incomeScore * 0.5) + (creditScoreNormalized * 0.5);
  return Math.max(0, Math.min(1, unbiasedScore)); // Clamp to 0-1
}

export function getBiasedScore(applicant, biasFactors) {
  // Start with unbiased score
  let biasedScore = getUnbiasedScore(applicant);
  
  // Add zip code influence
  const zipTierScore = applicant.zipTier === 'High' ? 1 : applicant.zipTier === 'Mid' ? 0.5 : 0;
  biasedScore += zipTierScore * biasFactors.zipCode * 0.3;
  
  // Subtract gender penalty
  if (applicant.gender === 'Female') {
    biasedScore -= biasFactors.gender * 0.2;
  }
  
  // Subtract age penalty
  if (applicant.age > 45) {
    biasedScore -= biasFactors.age * 0.15;
  }
  
  // Add name-based scoring (proxy for ethnicity bias)
  biasedScore += applicant.nameScore * biasFactors.name * 0.25;
  
  return Math.max(0, Math.min(1, biasedScore)); // Clamp to 0-1
}

export function getDecision(score) {
  // Approval threshold: score >= 0.55 = Approved, below = Rejected
  return score >= 0.55 ? 'Approved' : 'Rejected';
}

export function calculateBiasDelta(group1Data, group2Data) {
  // Calculate percentage difference in approval rates between groups
  const group1Rate = group1Data.filter(d => d.decision === 'Approved').length / group1Data.length;
  const group2Rate = group2Data.filter(d => d.decision === 'Approved').length / group2Data.length;
  
  return Math.abs(group1Rate - group2Rate) * 100; // Return as percentage
}

export function getFeatureImportance(applicant, biasFactors) {
  // Calculate feature importance for the current decision
  const baseScore = getUnbiasedScore(applicant);
  
  const importance = {
    income: 0.5,
    creditScore: 0.5,
    zipCode: 0,
    gender: 0,
    age: 0,
    name: 0
  };
  
  // Calculate additional importance from bias factors
  importance.zipCode = biasFactors.zipCode * 0.3;
  importance.gender = applicant.gender === 'Female' ? biasFactors.gender * 0.2 : 0;
  importance.age = applicant.age > 45 ? biasFactors.age * 0.15 : 0;
  importance.name = applicant.nameScore * biasFactors.name * 0.25;
  
  // Normalize to percentages
  const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
  Object.keys(importance).forEach(key => {
    importance[key] = (importance[key] / total) * 100;
  });
  
  return importance;
}
