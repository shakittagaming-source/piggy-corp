// Comprehensive Advanced Financial Simulation Engine

export const INFLATION_RATE_MONTHLY = 0.06 / 12;

// Legacy teaching-market subset used by the MoneyQuest campaign UI.
export const MARKET_ASSETS = {
  NIFTY_50: { name: "Nifty 50 Index", basePrice: 22000, volatility: 0.04, drift: 0.01, type: "Mutual Fund" },
  BLUECHIP: { name: "Bluechip Stock", basePrice: 3000, volatility: 0.08, drift: 0.012, type: "Equity" },
  GOLD: { name: "Digital Gold", basePrice: 65000, volatility: 0.02, drift: 0.005, type: "Commodity" },
  GOVT_BOND: { name: "Government Bond", basePrice: 1000, volatility: 0.01, drift: 0.004, type: "Fixed income" }
};

// Advanced market universe retained for deeper finance learning and future expansion.
export const ADVANCED_MARKET_ASSETS = {
  NIFTY_50: { name: "Nifty 50 Index (Domestic)", basePrice: 22000, volatility: 0.04, drift: 0.01, type: "Equity Index", risk: "Medium-High" },
  S_AND_P_500: { name: "S&P 500 (International)", basePrice: 5000, volatility: 0.035, drift: 0.011, type: "Equity Index", risk: "Medium-High" },
  BLUECHIP: { name: "Bluechip Stock", basePrice: 3000, volatility: 0.07, drift: 0.012, type: "Direct Equity", risk: "High" },
  SMALLCAP: { name: "Smallcap Fund", basePrice: 150, volatility: 0.1, drift: 0.015, type: "Mutual Fund", risk: "Very High" },
  GOLD: { name: "Digital Gold", basePrice: 65000, volatility: 0.02, drift: 0.005, type: "Commodity", risk: "Medium" },
  REAL_ESTATE_REIT: { name: "Commercial REIT", basePrice: 400, volatility: 0.015, drift: 0.007, type: "Real Estate", risk: "Medium" },
  BITCOIN: { name: "Bitcoin (Crypto)", basePrice: 5000000, volatility: 0.15, drift: 0.02, type: "Cryptocurrency", risk: "Extreme" },
  P2P_LENDING: { name: "P2P Lending", basePrice: 100, volatility: 0.05, drift: 0.01, type: "Alternative Debt", risk: "High" },
  GOVT_BOND: { name: "10-Year Govt Bond", basePrice: 1000, volatility: 0.005, drift: 0.006, type: "Fixed Income", risk: "Low" },
  CORP_BOND: { name: "Corporate Bond (AA)", basePrice: 1000, volatility: 0.01, drift: 0.008, type: "Fixed Income", risk: "Medium-Low" }
};

// STATIC GUARANTEED INSTRUMENTS
export const FIXED_INSTRUMENTS = {
  SAVINGS_A_C: { rate: 0.03 / 12, lockInMonths: 0, penalty: 0 },
  FIXED_DEPOSIT: { rate: 0.07 / 12, lockInMonths: 12, penalty: 0.01 },
  PPF: { rate: 0.071 / 12, lockInMonths: 180, penalty: 0.05 }, // Public Provident Fund
  EPF: { rate: 0.0825 / 12, lockInMonths: 600, penalty: 0.1 } // Employee Provident Fund
};

// MACRO ECONOMICS
export const getDynamicInflation = (month: number) => {
  // Base 6%, oscillating slightly over time
  return (0.06 + Math.sin(month / 12) * 0.02) / 12; 
};

// ADVANCED TAX CALCULATOR (Old vs New Regime)
export const calculateTax = (annualIncome: number, regime: 'OLD' | 'NEW', deductions80C = 0, standardDeduction = 50000) => {
  let tax = 0;
  
  if (regime === 'NEW') {
    // New Regime (Post 2023 Rules)
    let taxable = Math.max(0, annualIncome - standardDeduction);
    if (taxable <= 700000) return 0; // Rebate under 87A
    
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.30;
    if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.20;
    if (taxable > 900000) tax += Math.min(taxable - 900000, 300000) * 0.15;
    if (taxable > 600000) tax += Math.min(taxable - 600000, 300000) * 0.10;
    if (taxable > 300000) tax += Math.min(taxable - 300000, 300000) * 0.05;
  } else {
    // Old Regime
    let taxable = Math.max(0, annualIncome - standardDeduction - Math.min(deductions80C, 150000));
    if (taxable <= 500000) return 0; // Rebate under 87A
    
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30 + 112500;
    else if (taxable > 500000) tax += (taxable - 500000) * 0.20 + 12500;
    else if (taxable > 250000) tax += (taxable - 250000) * 0.05;
  }
  
  // Add 4% Health & Education Cess
  return (tax * 1.04) / 12; // Return monthly tax
};

// ADVANCED LOAN/EMI CALCULATOR
export const calculateEMI = (principal: number, annualRate: number, tenureMonths: number) => {
  if (principal <= 0) return 0;
  const r = annualRate / 12 / 100;
  return principal * r * (Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
};

// COMPREHENSIVE LIFE EVENTS
export const generateMonthlyEvent = (_month: number = 0) => {
  const rand = Math.random();

  if (rand < 0.05) {
    return { type: "MEDICAL", title: "Medical Emergency", cost: 150000, msg: "A family member was hospitalized. Cost: ₹1.5L." };
  }
  if (rand < 0.10) {
    return { type: "CAR_BREAKDOWN", title: "Vehicle Repair", cost: 35000, msg: "Major car engine failure. Cost: ₹35k." };
  }
  if (rand < 0.15) {
    return { type: "MARKET_CRASH", title: "Market Correction", impact: 0.85, msg: "Global markets dropped 15% due to rate hikes." };
  }
  if (rand < 0.20) {
    return { type: "BONUS", title: "Performance Bonus", amount: 50000, msg: "You received a ₹50k bonus at work!" };
  }

  return null;
};

// ADVANCED MARKET TICKER with compatibility for both legacy numeric crash multipliers and map-based override events.
export const tickMarket = (currentPrices: Record<string, number>, impactOverrides: Record<string, number> | number = 1) => {
  const newPrices: Record<string, number> = {};
  const globalSentiment = (Math.random() - 0.5) * 0.02;
  const numericImpact = typeof impactOverrides === 'number' ? impactOverrides : 1;

  Object.entries(MARKET_ASSETS).forEach(([key, asset]) => {
    const current = currentPrices[key];
    const impact = typeof impactOverrides === 'number' ? numericImpact : impactOverrides[key] || 1;
    const u1 = Math.random(), u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const driftTerm = (asset.drift + globalSentiment) - (Math.pow(asset.volatility, 2) / 2);
    const shockTerm = asset.volatility * z;

    newPrices[key] = current * Math.exp(driftTerm + shockTerm) * impact;
  });
  return newPrices;
};

export type PortfolioStressInput = {
  singleStock: number;
  broadFund: number;
  cash: number;
};

export function calculatePortfolioStressTest(allocation: PortfolioStressInput) {
  const losses = {
    singleStock: allocation.singleStock * -0.58,
    broadFund: allocation.broadFund * -0.22,
    cash: 0,
  };
  const startingValue = allocation.singleStock + allocation.broadFund + allocation.cash;
  const lossAmount = -(losses.singleStock + losses.broadFund + losses.cash);
  const lossPercent = startingValue > 0 ? lossAmount / startingValue * 100 : 0;
  const valueAfterShock = Math.max(0, startingValue - lossAmount);
  const diversified = allocation.singleStock <= startingValue * 0.2 && allocation.broadFund >= startingValue * 0.5;
  const cashBuffer = startingValue > 0 && allocation.cash >= startingValue * 0.1;
  const cashHeavy = startingValue > 0 && allocation.cash >= startingValue * 0.5 && allocation.singleStock <= startingValue * 0.2;
  const survivalGrade = startingValue <= 0 ? 'F'
    : (diversified && cashBuffer) || cashHeavy ? 'A+'
      : diversified || cashHeavy ? 'A'
        : allocation.singleStock >= startingValue * 0.5 ? 'D'
          : allocation.singleStock >= startingValue * 0.35 ? 'C' : 'B';

  return { startingValue, losses, lossAmount, lossPercent, valueAfterShock, survivalGrade };
}
