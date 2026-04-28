// Data Generator - Synthetic dataset generation for AlgoLens

import { getUnbiasedScore, getBiasedScore, getDecision } from './biasEngine.js';

// Diverse names for realistic dataset
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Mohammed', 'Fatima', 'Wei', 'Li', 'Carlos', 'Maria', 'Ahmed', 'Aisha',
  'Raj', 'Priya', 'Yuki', 'Hana', 'Oliver', 'Emma', 'Noah', 'Olivia'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Patel', 'Kim', 'Chen', 'Gupta', 'Singh',
  'Kumar', 'Ali', 'Mohammed', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen'
];

// Name-based bias scores (proxy for ethnicity bias)
const nameBiasScores = {
  'James': 0.8, 'Mary': 0.7, 'Robert': 0.8, 'Patricia': 0.7, 'John': 0.8,
  'Jennifer': 0.7, 'Michael': 0.8, 'Linda': 0.7, 'David': 0.8, 'Elizabeth': 0.7,
  'William': 0.8, 'Barbara': 0.7, 'Richard': 0.8, 'Susan': 0.7, 'Joseph': 0.8,
  'Jessica': 0.7, 'Thomas': 0.8, 'Sarah': 0.7, 'Charles': 0.8, 'Karen': 0.7,
  'Christopher': 0.8, 'Nancy': 0.7, 'Daniel': 0.8, 'Lisa': 0.7, 'Matthew': 0.8,
  'Betty': 0.7, 'Anthony': 0.8, 'Helen': 0.7, 'Mark': 0.8, 'Sandra': 0.7,
  'Donald': 0.8, 'Donna': 0.7, 'Steven': 0.8, 'Carol': 0.7, 'Paul': 0.8,
  'Ruth': 0.7, 'Andrew': 0.8, 'Sharon': 0.7, 'Joshua': 0.8, 'Michelle': 0.7,
  'Kenneth': 0.8, 'Laura': 0.7, 'Kevin': 0.8, 'Sarah': 0.7, 'Brian': 0.8,
  'Kimberly': 0.7, 'George': 0.8, 'Deborah': 0.7, 'Mohammed': 0.3, 'Fatima': 0.2,
  'Wei': 0.4, 'Li': 0.4, 'Carlos': 0.5, 'Maria': 0.4, 'Ahmed': 0.3, 'Aisha': 0.2,
  'Raj': 0.4, 'Priya': 0.3, 'Yuki': 0.5, 'Hana': 0.4, 'Oliver': 0.8, 'Emma': 0.7,
  'Noah': 0.8, 'Olivia': 0.7
};

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function getRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName, fullName: `${firstName} ${lastName}` };
}

function getNameScore(firstName) {
  return nameBiasScores[firstName] || 0.5; // Default to 0.5 if name not found
}

function getRandomGender() {
  const genders = ['Male', 'Female', 'Non-binary'];
  const weights = [0.48, 0.48, 0.04]; // Realistic distribution
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < genders.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) return genders[i];
  }
  return genders[0];
}

function getRandomZipTier() {
  const tiers = ['High', 'Mid', 'Low'];
  const weights = [0.3, 0.4, 0.3]; // Even distribution
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < tiers.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) return tiers[i];
  }
  return tiers[0];
}

function generateApplicant(id, biasFactors = { zipCode: 0, gender: 0, age: 0, name: 0 }) {
  const name = getRandomName();
  const age = Math.floor(Math.random() * 44) + 22; // 22-65
  const gender = getRandomGender();
  const zipTier = getRandomZipTier();
  
  // Generate income with gaussian distribution (mean 60k, std 25k, min 20k, max 120k)
  let income = gaussianRandom(60000, 25000);
  income = Math.max(20000, Math.min(120000, income));
  
  // Generate credit score with gaussian distribution (mean 650, std 100, min 300, max 850)
  let creditScore = gaussianRandom(650, 100);
  creditScore = Math.max(300, Math.min(850, creditScore));
  
  const nameScore = getNameScore(name.firstName);
  
  const applicant = {
    id,
    name: name.fullName,
    age,
    gender,
    zipTier,
    income: Math.round(income),
    creditScore: Math.round(creditScore),
    nameScore
  };
  
  // Calculate scores and decisions
  applicant.unbiasedScore = getUnbiasedScore(applicant);
  applicant.biasedScore = getBiasedScore(applicant, biasFactors);
  applicant.unbiasedDecision = getDecision(applicant.unbiasedScore);
  applicant.biasedDecision = getDecision(applicant.biasedScore);
  
  return applicant;
}

export function generateDataset(size = 200, biasFactors = { zipCode: 0, gender: 0, age: 0, name: 0 }) {
  const dataset = [];
  
  for (let i = 1; i <= size; i++) {
    dataset.push(generateApplicant(i, biasFactors));
  }
  
  return dataset;
}

export function generateCustomDataset(config) {
  const {
    populationSize = 200,
    genderDistribution = { Male: 0.48, Female: 0.48, 'Non-binary': 0.04 },
    incomeMean = 60000,
    incomeStd = 25000,
    zipDistribution = { High: 0.3, Mid: 0.4, Low: 0.3 },
    existingBias = 0
  } = config;
  
  const dataset = [];
  const biasFactors = {
    zipCode: existingBias,
    gender: existingBias,
    age: existingBias,
    name: existingBias
  };
  
  for (let i = 1; i <= populationSize; i++) {
    const name = getRandomName();
    const age = Math.floor(Math.random() * 44) + 22;
    
    // Custom gender distribution
    const genderRandom = Math.random();
    let gender = 'Male';
    let cumulative = 0;
    
    Object.entries(genderDistribution).forEach(([g, weight]) => {
      cumulative += weight;
      if (genderRandom < cumulative) gender = g;
    });
    
    // Custom zip distribution
    const zipRandom = Math.random();
    let zipTier = 'High';
    cumulative = 0;
    
    Object.entries(zipDistribution).forEach(([tier, weight]) => {
      cumulative += weight;
      if (zipRandom < cumulative) zipTier = tier;
    });
    
    // Custom income distribution
    let income = gaussianRandom(incomeMean, incomeStd);
    income = Math.max(20000, Math.min(120000, income));
    
    // Generate credit score
    let creditScore = gaussianRandom(650, 100);
    creditScore = Math.max(300, Math.min(850, creditScore));
    
    const nameScore = getNameScore(name.firstName);
    
    const applicant = {
      id: i,
      name: name.fullName,
      age,
      gender,
      zipTier,
      income: Math.round(income),
      creditScore: Math.round(creditScore),
      nameScore
    };
    
    // Calculate scores and decisions
    applicant.unbiasedScore = getUnbiasedScore(applicant);
    applicant.biasedScore = getBiasedScore(applicant, biasFactors);
    applicant.unbiasedDecision = getDecision(applicant.unbiasedScore);
    applicant.biasedDecision = getDecision(applicant.biasedScore);
    
    dataset.push(applicant);
  }
  
  return dataset;
}

export function getDatasetSummary(dataset) {
  const summary = {
    totalApplicants: dataset.length,
    genderBreakdown: {},
    zipBreakdown: {},
    meanIncome: 0,
    approvalRate: { unbiased: 0, biased: 0 },
    ageDistribution: { '22-35': 0, '36-45': 0, '46-55': 0, '56-65': 0 }
  };
  
  // Calculate gender breakdown
  dataset.forEach(applicant => {
    summary.genderBreakdown[applicant.gender] = (summary.genderBreakdown[applicant.gender] || 0) + 1;
    summary.zipBreakdown[applicant.zipTier] = (summary.zipBreakdown[applicant.zipTier] || 0) + 1;
    summary.meanIncome += applicant.income;
    
    // Age distribution
    if (applicant.age <= 35) summary.ageDistribution['22-35']++;
    else if (applicant.age <= 45) summary.ageDistribution['36-45']++;
    else if (applicant.age <= 55) summary.ageDistribution['46-55']++;
    else summary.ageDistribution['56-65']++;
  });
  
  summary.meanIncome = Math.round(summary.meanIncome / dataset.length);
  
  // Calculate approval rates
  const unbiasedApproved = dataset.filter(a => a.unbiasedDecision === 'Approved').length;
  const biasedApproved = dataset.filter(a => a.biasedDecision === 'Approved').length;
  
  summary.approvalRate.unbiased = (unbiasedApproved / dataset.length * 100).toFixed(1);
  summary.approvalRate.biased = (biasedApproved / dataset.length * 100).toFixed(1);
  
  return summary;
}
