import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Globe2,
  Heart,
  House,
  Landmark,
  LogOut,
  MoreHorizontal,
  PiggyBank,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  WalletCards,
} from 'lucide-react';
import MoneyQuest from './MoneyQuest';
import { DuelPage, ProfilePage } from './SocialHub';
import { FeedPage, LearningPathPage, LearningStatusBar, LeaguePage, QuestsPage } from './AcademyPages';
import { recordExperience } from './profileStore';
import AuthScreen from './AuthScreen';
import { clearLocalSession, getStoredSession, type AuthSession } from './authStore';
import MoneyAssistant from './MoneyAssistant';
import { t } from './i18n';
import './App.css';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function AppContent({ session, onSignOut }: { session: AuthSession; onSignOut: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const validPages = ['home', 'learn', 'quest', 'quests', 'global', 'tools', 'profile', 'duel', 'league', 'feed'] as const;
  const routePage = location.pathname.slice(1) || 'home';
  const activePage = validPages.includes(routePage as typeof validPages[number]) ? routePage : 'home';
  const currentLang = document.cookie.match(/googtrans=\/en\/([a-z]{2})/) ? document.cookie.match(/googtrans=\/en\/([a-z]{2})/)?.[1] : 'en';
  const [language, setLanguageState] = useState(currentLang || 'en');

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (lang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
    }
    window.location.reload();
  };

  const [income, setIncome] = useState(65000);
  const [expenses, setExpenses] = useState(28000);
  const [savings, setSavings] = useState(18000);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(7);
  const [sipAmount, setSipAmount] = useState(8000);
  const [investmentRate, setInvestmentRate] = useState(12);
  const [investmentYears, setInvestmentYears] = useState(8);
  const [lumpsum, setLumpsum] = useState(50000);
  const [taxableIncome, setTaxableIncome] = useState(900000);
  const [deductions, setDeductions] = useState(180000);
  const [goalEmergency, setGoalEmergency] = useState(50000);
  const [goalEducation, setGoalEducation] = useState(120000);
  const [goalTravel, setGoalTravel] = useState(40000);
  const [globalMode, setGlobalMode] = useState<'simulator' | 'routes' | 'rules' | 'challenge'>('simulator');
  const [globalAllocation, setGlobalAllocation] = useState(20);
  const [globalMonthly, setGlobalMonthly] = useState(10000);
  const [globalYears, setGlobalYears] = useState(10);
  const [globalMarketReturn, setGlobalMarketReturn] = useState(8);
  const [globalCurrencyMove, setGlobalCurrencyMove] = useState(3);
  const [globalRoute, setGlobalRoute] = useState<'fund' | 'lrs' | 'gift'>('fund');
  const [plannedRemittance, setPlannedRemittance] = useState(5000);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [foreignIncome, setForeignIncome] = useState(500000);
  const [foreignTaxRate, setForeignTaxRate] = useState(15);
  const [indiaTaxRateOnForeignIncome, setIndiaTaxRateOnForeignIncome] = useState(20);
  const [modelForeignTaxCredit, setModelForeignTaxCredit] = useState(true);
  const [dtaaDocuments, setDtaaDocuments] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('module-01');
  const [courseAnswer, setCourseAnswer] = useState<number | null>(null);
  const [courseChecked, setCourseChecked] = useState(false);
  const [courseSpend, setCourseSpend] = useState(2000);

  const monthlyEmi = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = loanRate / 12 / 100;
    const periods = loanYears * 12;

    if (principal <= 0) return 0;
    if (monthlyRate === 0) return principal / periods;

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, periods)) /
      (Math.pow(1 + monthlyRate, periods) - 1)
    );
  }, [loanAmount, loanRate, loanYears]);

  const totalLoanPayable = useMemo(() => monthlyEmi * loanYears * 12, [loanYears, monthlyEmi]);
  const totalInterest = totalLoanPayable - loanAmount;

  const estimatedTaxableBase = Math.max(0, taxableIncome - deductions - 125000);
  const estimatedTax = useMemo(() => Math.round(estimatedTaxableBase * 0.2), [estimatedTaxableBase]);
  const estimatedMonthlyTax = Math.round(estimatedTax / 12);

  const monthlyBudget = useMemo(() => income - expenses, [income, expenses]);

  const monthlySurplus = useMemo(
    () => income - expenses - monthlyEmi - estimatedMonthlyTax - savings,
    [income, expenses, monthlyEmi, estimatedMonthlyTax, savings],
  );

  const investmentProjection = useMemo(() => {
    const months = investmentYears * 12;
    const ratePerMonth = investmentRate / 12 / 100;
    const fvSip =
      ratePerMonth === 0
        ? sipAmount * months
        : (sipAmount * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth)) * (1 + ratePerMonth);

    const futureValue = fvSip + lumpsum * Math.pow(1 + ratePerMonth, months);
    const totalInvested = sipAmount * months + lumpsum;
    const gains = futureValue - totalInvested;

    return { futureValue, totalInvested, gains };
  }, [sipAmount, investmentRate, investmentYears, lumpsum]);

  const globalProjection = useMemo(() => {
    const months = globalYears * 12;
    const localRate = 10 / 100 / 12;
    const foreignInrAnnualRate = (1 + globalMarketReturn / 100) * (1 + globalCurrencyMove / 100) - 1;
    const foreignRate = foreignInrAnnualRate / 12;
    const blendedRate = ((100 - globalAllocation) * 0.1 + globalAllocation * foreignInrAnnualRate) / 100 / 12;
    const futureValue = (rate: number) => rate === 0
      ? globalMonthly * months
      : globalMonthly * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);

    return {
      domesticValue: futureValue(localRate),
      globalValue: futureValue(foreignRate),
      blendedValue: futureValue(blendedRate),
      foreignInrAnnualRate: foreignInrAnnualRate * 100,
      totalInvested: globalMonthly * months,
    };
  }, [globalAllocation, globalCurrencyMove, globalMarketReturn, globalMonthly, globalYears]);

  const lrsLimitUsd = 250000;
  const lrsRemainingUsd = Math.max(0, lrsLimitUsd - plannedRemittance);

  const dtaaProjection = useMemo(() => {
    const foreignTaxPaid = foreignIncome * foreignTaxRate / 100;
    const indianTaxBeforeCredit = foreignIncome * indiaTaxRateOnForeignIncome / 100;
    const potentialCredit = Math.min(foreignTaxPaid, indianTaxBeforeCredit);
    const creditApplied = modelForeignTaxCredit ? potentialCredit : 0;
    const indianTaxAfterCredit = Math.max(0, indianTaxBeforeCredit - creditApplied);
    const combinedTax = foreignTaxPaid + indianTaxAfterCredit;

    return {
      foreignTaxPaid,
      indianTaxBeforeCredit,
      potentialCredit,
      creditApplied,
      indianTaxAfterCredit,
      combinedTax,
      effectiveRate: foreignIncome > 0 ? combinedTax / foreignIncome * 100 : 0,
      foreignTaxAboveIndianCap: Math.max(0, foreignTaxPaid - indianTaxBeforeCredit),
    };
  }, [foreignIncome, foreignTaxRate, indiaTaxRateOnForeignIncome, modelForeignTaxCredit]);

  const dtaaChecklist = [
    'Foreign tax certificate or official withholding statement',
    'Broker statements showing income, dates, and gross amounts',
    'Evidence that foreign tax was paid or withheld',
    'Applicable treaty article, income type, and rate checked',
    'Indian return disclosures and current Form 67 requirements checked',
  ];

  const savingsPlan = useMemo(() => {
    const monthlyTarget = (goalEmergency + goalEducation + goalTravel) / 12;
    return { monthlyTarget, annualTarget: monthlyTarget * 12 };
  }, [goalEmergency, goalEducation, goalTravel]);

  const financialScore = useMemo(() => {
    const score =
      60 +
      income / 2000 -
      expenses / 1500 -
      monthlyEmi / 500 -
      estimatedMonthlyTax / 500 +
      savings / 1200;

    return Math.max(35, Math.min(96, Math.round(score)));
  }, [income, expenses, monthlyEmi, estimatedMonthlyTax, savings]);

  const featureCards = [
    {
      icon: WalletCards,
      title: 'Budget planner',
      description: 'See income, expenses, savings, EMI, and tax in one clear monthly dashboard.',
    },
    {
      icon: Coins,
      title: 'Investment view',
      description: 'Test SIP and long-term growth with real return projections and wealth forecasts.',
    },
    {
      icon: Landmark,
      title: 'Loan EMI calculator',
      description: 'Understand monthly repayment, total cost, and the true burden of borrowing.',
    },
    {
      icon: ShieldCheck,
      title: 'Tax planning',
      description: 'Compare taxable income and deductions to estimate tax savings before filing.',
    },
  ];

  const learningModules = [
    {
      id: 'module-01', number: '01', icon: PiggyBank, title: 'The Indian Savings Blueprint', duration: '5 minutes',
      blurb: 'Build a steady savings habit, understand India’s common savings options, and keep emergency money reachable.',
      lessons: [
        { title: 'SIP, FD, and RD: compare the job', detail: 'An SIP automates mutual-fund contributions; it does not guarantee growth and can lose value. FDs and RDs have product-specific rates and terms. Compare access, tax, inflation risk, and your time horizon instead of treating one as a universal replacement.' },
        { title: 'Compare PPF, ELSS, and NPS', detail: 'PPF, ELSS, and NPS differ in market risk, lock-in, access, and withdrawal rules. Some contributions may qualify under Section 80C in eligible cases and tax regimes, but limits and treatment change. Check official rules for the correct tax year.' },
        { title: 'Build a six-month emergency matrix', detail: 'Use six months of essential costs as a planning exercise, then adjust for income stability and dependants. Compare a sweep-in deposit with liquid mutual funds for access, fees, withdrawal timing, and risk. Liquid funds can fluctuate and are not bank deposits.' },
      ],
      experiment: { label: 'Monthly amount in a virtual SIP', initial: 2000, min: 0, max: 20000, step: 500, kind: 'monthly-five' },
      question: 'What is the main purpose of an emergency reserve?', answers: ['Keep money accessible for unexpected costs', 'Earn the highest possible return', 'Lock every rupee away for years'], correct: 0,
      feedback: 'Access and stability matter for emergency money. This is a practice concept, not a personal savings target.',
    },
    {
      id: 'module-02', number: '02', icon: TrendingUp, title: 'Decoding Dalal Street', duration: '5 minutes',
      blurb: 'Learn what an index tracks, how a Demat account works, and why diversified funds differ from single stocks.',
      lessons: [
        { title: 'Sensex and Nifty, simply', detail: 'Think of an index as a changing scorecard for a selected group of listed companies. NSE and BSE are exchanges where eligible securities trade; an index itself is not one company.' },
        { title: 'A Demat account walkthrough', detail: 'A typical process includes checking eligibility, completing identity and bank verification, reviewing charges and nomination choices, then learning order types in a practice setting. Requirements change. Zerodha, Groww, and Angel One are examples only, not endorsements.' },
        { title: 'Funds and single stocks', detail: 'A broad index fund holds many companies; a direct stock depends more on one company. Diversification can reduce company-specific concentration, but neither approach removes market risk. Avoid treating intraday trading as a beginner shortcut.' },
      ],
      experiment: { label: 'Monthly virtual market contribution', initial: 3000, min: 0, max: 25000, step: 500, kind: 'monthly-one' },
      question: 'What does a broad market index mainly represent?', answers: ['A selected basket of listed companies', 'One guaranteed-return company', 'A savings account rate'], correct: 0,
      feedback: 'An index tracks a selected group. A fund may follow it, but the index and fund can both go down.',
    },
    {
      id: 'module-03', number: '03', icon: Calculator, title: 'Modern Indian Adulting', duration: '5 minutes',
      blurb: 'Practice reading tax choices, credit reports, and insurance terms without mistaking examples for personal advice.',
      lessons: [
        { title: 'Old and new tax regimes', detail: 'Compare the rules, eligible deductions, rebates, and final tax for the same fictional profile and tax year. The better result depends on current law and individual facts; verify with official tax tools.' },
        { title: 'CIBIL and credit habits', detail: 'Payment history, credit use, account age, and applications can affect a credit score. A score above 750 is often discussed as a strong range, but lenders use different criteria and no score guarantees approval.' },
        { title: 'Health cover, term cover, and ULIPs', detail: 'Read exclusions, waiting periods, room limits, cashless hospital rules, premiums, and renewal terms. A ULIP combines insurance and investment features; compare costs and purpose rather than assuming it fits everyone.' },
      ],
      experiment: { label: 'Annual salary in a fictional profile', initial: 900000, min: 200000, max: 3000000, step: 50000, kind: 'annual' },
      question: 'What is a safe way to compare two fictional tax-regime examples?', answers: ['Use the same profile and tax year, then compare the final totals', 'Choose by the regime name alone', 'Assume last year’s rules never change'], correct: 0,
      feedback: 'A fair comparison uses the same income, deductions, and tax-year rules. Real cases need current official guidance.',
    },
    {
      id: 'module-04', number: '04', icon: House, title: 'The Indian Real Estate Dilemma', duration: '6 minutes',
      blurb: 'Compare the emotional pull of owning a home with rent, loan cash flow, and the full cost of ownership.',
      lessons: [
        { title: 'Rent versus buy: name the trade-offs', detail: 'A home can provide stability and personal value; renting can preserve flexibility and investable cash. Compare the expected stay, rent growth, home-price assumptions, opportunity cost, and the risks of concentrating wealth in one property. Neither choice wins for everyone.' },
        { title: 'Read a home loan beyond the EMI', detail: 'Separate the down payment from the loan principal, then compare the EMI, total interest, processing fees, rate-reset terms, and prepayment rules. A floating rate can change after a benchmark reset, so the payment or loan term may rise.' },
        { title: 'Count the ownership costs', detail: 'Budget for stamp duty, registration, repairs, maintenance, insurance, property tax, and society charges in addition to the purchase price. Rates, rebates, and charges vary by state, property, and date; verify them before a real decision.' },
      ],
      experiment: { label: 'Fictional home purchase price', initial: 6000000, min: 2000000, max: 30000000, step: 500000, kind: 'home-price' },
      question: 'What is the fairest first comparison between renting and buying?', answers: ['Compare total costs, time horizon, flexibility, and assumptions', 'Compare only the monthly rent with the EMI', 'Assume every home price always rises'], correct: 0,
      feedback: 'An EMI is not the full cost of buying. Include upfront charges, ongoing ownership costs, time horizon, and uncertainty.',
    },
    {
      id: 'module-05', number: '05', icon: WalletCards, title: 'Modern Digital Finance & UPI', duration: '6 minutes',
      blurb: 'Understand digital payments, gold products, the e-rupee, and common fraud traps before sending money.',
      lessons: [
        { title: 'UPI flow and fraud checks', detail: 'UPI routes a payment instruction between linked bank accounts through participating apps and providers. A UPI PIN authorizes a debit; it is not needed to receive money. Never share an OTP or PIN, and verify collect requests and payment links before approving.' },
        { title: 'Digital gold and Sovereign Gold Bonds', detail: 'Digital gold and exchange-traded gold products have different issuer, custody, fee, and liquidity risks. SGBs are government securities with scheme-specific interest and redemption terms; interest is taxable, so do not assume it is tax-free. Check current issuance, availability, and tax rules.' },
        { title: 'Crypto, CBDC, and India’s e-rupee', detail: 'The e-rupee is a central-bank digital currency; cryptocurrencies are not the same thing or an RBI-backed deposit. Virtual digital asset tax rules can be severe and can change by tax year. Learn the risks and verify current official tax treatment before transacting.' },
      ],
      experiment: { label: 'Fictional monthly UPI payments', initial: 12000, min: 1000, max: 100000, step: 1000, kind: 'monthly-upi' },
      question: 'A caller asks you to approve a UPI collect request to receive a refund. What should you do?', answers: ['Approve it and share your UPI PIN', 'Pause, verify through an official channel, and never share your PIN', 'Send a small payment to test the caller'], correct: 1,
      feedback: 'Receiving money does not require sharing a UPI PIN. Verify unexpected payment requests with the bank or merchant using a trusted contact method.',
    },
    {
      id: 'module-06', number: '06', icon: Target, title: 'Goal-Based Financial Planning', duration: '5 minutes',
      blurb: 'Turn big goals into smaller, timed steps and compare what changes when you plan early.',
      lessons: [
        { title: 'Plan a wedding without a debt spiral', detail: 'List venue, travel, food, clothing, and a contingency. Compare the total with a monthly saving path before considering borrowing.' },
        { title: 'Prepare for education costs', detail: 'Sukanya Samriddhi Yojana has eligibility and withdrawal rules for a girl child; child-focused funds have market risk. Learn the current terms before treating either as a solution.' },
        { title: 'FIRE and early retirement', detail: 'Financial Independence, Retire Early is a planning framework, not a promised outcome. Stress-test the timeline for inflation, healthcare, market declines, and changing expenses.' },
      ],
      experiment: { label: 'Monthly amount for a fictional goal', initial: 5000, min: 0, max: 50000, step: 1000, kind: 'monthly-five' },
      question: 'What should a goal plan include before choosing a product?', answers: ['Goal amount, target date, and a realistic contribution', 'Only the highest return someone mentioned', 'A loan sized to the maximum approval'], correct: 0,
      feedback: 'A goal and timeline help compare options. The simulator does not choose a product for real life.',
    },
    {
      id: 'module-07', number: '07', icon: Coins, title: 'Smart Consumerism & Debt Traps', duration: '5 minutes',
      blurb: 'Look past the monthly payment and find the costs hidden in checkout offers and vehicle loans.',
      lessons: [
        { title: 'The “no-cost EMI” check', detail: 'Compare the cash price, processing fee, lost discount, and total installment amount. “No cost” wording does not tell you the full cost by itself.' },
        { title: 'BNPL and credit reports', detail: 'Buy-now-pay-later plans can include late charges and may be reported under provider rules. Read the repayment schedule and privacy/credit-report terms before using any real service.' },
        { title: 'Car loan ownership cost', detail: 'Include depreciation, fuel, maintenance, insurance, and loan charges. A four-year loan is a comparison heuristic, not a universal rule; test the total cost and whether the payment fits after essentials and savings.' },
      ],
      experiment: { label: 'Fictional purchase price', initial: 30000, min: 5000, max: 150000, step: 5000, kind: 'purchase' },
      question: 'A “no-cost EMI” offer appears at checkout. What should you compare?', answers: ['Total installments, fees, and any cash discount you lose', 'Only the monthly amount', 'Only the product photo'], correct: 0,
      feedback: 'The total cost can include charges or a discount you give up. Check the written terms in the scenario.',
    },
    {
      id: 'module-08', number: '08', icon: Heart, title: 'Everyday Financial Psychology', duration: '5 minutes',
      blurb: 'Spot the feelings behind spending and investing, then practice a calmer next step.',
      lessons: [
        { title: 'Lifestyle inflation', detail: 'When income rises, fixed costs can quietly rise too. Try directing a portion of a fictional bonus to a chosen goal before adding a new monthly commitment.' },
        { title: 'FOMO and speculative trades', detail: 'A friend’s gain is not evidence that an asset is suitable. Pause, identify the risk and time horizon, and do not confuse options or a mid-cap rally with a guaranteed outcome.' },
        { title: 'Family money conversations', detail: 'Start with shared questions about retirement, medical cover, nominees, and document locations. Listen first; avoid pressuring anyone to share passwords or transfer control.' },
      ],
      experiment: { label: 'Daily spend in a fictional habit', initial: 120, min: 0, max: 500, step: 10, kind: 'daily-ten' },
      question: 'Friends are excited about a fast-rising speculative investment. What is the calm first step?', answers: ['Pause and understand loss risk, purpose, and time horizon', 'Borrow money so you do not miss out', 'Assume recent gains will continue'], correct: 0,
      feedback: 'A pause helps separate social pressure from your own goals. No simulated or recent return predicts what happens next.',
    },
  ];

  const selectedCourse = learningModules.find((module) => module.id === selectedCourseId) ?? learningModules[0];
  const courseMultiplier = selectedCourse.experiment.kind === 'daily-ten' ? 3650
    : selectedCourse.experiment.kind === 'monthly-five' ? 60
      : selectedCourse.experiment.kind === 'monthly-one' ? 12 : 1;
  const courseEstimate = courseSpend * courseMultiplier;
  const courseEstimateLabel = selectedCourse.experiment.kind === 'daily-ten' ? 'Possible repeated spend over 10 years'
    : selectedCourse.experiment.kind === 'monthly-five' ? 'Virtual contributions over 5 years'
      : selectedCourse.experiment.kind === 'monthly-one' ? 'Virtual contributions over 1 year'
        : selectedCourse.experiment.kind === 'annual' ? 'Salary input in this fictional profile'
          : selectedCourse.experiment.kind === 'home-price' ? 'Fictional home purchase price'
            : selectedCourse.experiment.kind === 'monthly-upi' ? 'Illustrative monthly payment total' : 'Fictional purchase amount';

  const selectCourse = (course: typeof learningModules[number]) => {
    setSelectedCourseId(course.id);
    setCourseSpend(course.experiment.initial);
    setCourseAnswer(null);
    setCourseChecked(false);
  };

  const financialChecklist = [
    'Start by making a simple monthly budget: income in, expenses out, and what is left for saving.',
    'Build an emergency fund before taking large risks with investments.',
    'Compare bank accounts, deposits, and loans before choosing one product.',
    'Do not put all your money in one investment. Diversify in simple ways.',
    'Understand the full cost of a loan, not just the monthly EMI.',
    'Use insurance to protect yourself from major shocks that could ruin your finances.',
    'Remember that inflation reduces buying power, so saving alone is not always enough.',
    'Never share OTPs, passwords, or bank details with anyone unless you fully trust them.',
  ];

  const advancedMetrics = useMemo(() => {
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const debtToIncome = income > 0 ? (monthlyEmi / income) * 100 : 0;
    const emergencyCoverage = expenses > 0 ? (goalEmergency / (expenses * 3)) * 100 : 0;
    const taxEfficiency = taxableIncome > 0 ? (deductions / taxableIncome) * 100 : 0;

    return {
      savingsRate: Math.min(100, Math.max(0, savingsRate)),
      debtToIncome: Math.min(100, Math.max(0, debtToIncome)),
      emergencyCoverage: Math.min(100, Math.max(0, emergencyCoverage)),
      taxEfficiency: Math.min(100, Math.max(0, taxEfficiency)),
    };
  }, [deductions, expenses, goalEmergency, income, monthlyEmi, savings, taxableIncome]);

  const topicExplorer = [
    {
      id: 'cash-flow',
      title: 'Cash-flow intelligence',
      short: 'Understand how much money is truly available after living costs and debt.',
      detail: 'Cash-flow planning is the real foundation of personal finance. It answers one important question: after necessities, debt, and taxes, what is left to save, invest, and protect? Strong cash flow gives freedom. Weak cash flow creates stress and keeps people trapped in short-term survival mode.',
      use: 'Use this to identify waste, improve savings rate, and create a realistic spending system before chasing big returns.',
    },
    {
      id: 'inflation',
      title: 'Inflation and real returns',
      short: 'A growing amount can still buy less if inflation outpaces returns.',
      detail: 'Inflation reduces the purchasing power of money over time. A person may feel rich because their bank balance is bigger, but if prices rise faster, their real value is lower. Investors must think in real terms, not just nominal numbers.',
      use: 'Compare returns after inflation and costs. Focus on buying power, not only account balance.',
    },
    {
      id: 'debt',
      title: 'Debt management',
      short: 'Borrowing is acceptable when the cost is understood and the benefit is real.',
      detail: 'Debt is not always bad, but expensive debt can quietly drain wealth. EMI is only the monthly symptom. The real issue is total repayment, interest burden, and how the debt fits into your risk and income profile.',
      use: 'Prioritize high-interest debt, avoid borrowing for lifestyle inflation, and make repayment part of your strategy.',
    },
    {
      id: 'risk',
      title: 'Risk and diversification',
      short: 'Returns come with volatility, and diversification helps reduce concentrated loss.',
      detail: 'Every investment carries risk. A high-return asset can be great for long-term growth, but it can also be painful in the short run. Smart planning means matching the asset to the timeline and spreading exposure across categories.',
      use: 'Use diversification to avoid relying on one stock, sector, or asset type for future goals.',
    },
    {
      id: 'foreign-investing',
      title: 'Foreign investment and global exposure',
      short: 'Global investing adds diversification but also introduces currency and macro risk.',
      detail: 'Foreign investment helps investors access global growth, stronger sectors, and diversification beyond the local market. However, currency movements, international regulation, and economic cycles can affect returns. Investors should understand both the asset and the country exposure.',
      use: 'Use global funds carefully by assessing currency risk, geopolitical exposure, and whether the investment matches your timeline and objective.',
    },
    {
      id: 'retirement',
      title: 'Retirement planning',
      short: 'Long-term wealth depends on compound growth, habit, and patience.',
      detail: 'Retirement planning is about building future freedom, not just saving for the sake of saving. Consistent contributions, tax-aware choices, and risk-adjusted growth over many years have a far greater impact than trying to time the market.',
      use: 'Start early, automate investing, and treat retirement as a multi-decade strategy rather than a last-minute decision.',
    },
  ];

  const [selectedTopic, setSelectedTopic] = useState('cash-flow');
  const activeTopic = topicExplorer.find((item) => item.id === selectedTopic) ?? topicExplorer[0];

  const roadmap = [
    'Smart personal finance dashboard for ages 15+ and above',
    'Investment and SIP planning with future value calculations',
    'Loan EMI, taxes, savings, and long-term goal tracking',
    'Clear, mobile-friendly education-first experience',
  ];

  const tips = [
    'Build a strong emergency fund before taking more risk.',
    'Reduce EMI burden early to improve monthly comfort.',
    'Use tax-saving habits to lower real cash outflow.',
  ];

  const [activeTab, setActiveTab] = useState<'budget' | 'emi' | 'investment' | 'tax'>('budget');

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const calculatorTools = {
    budget: {
      heading: 'Budget planner',
      content: (
        <div className="calculator-panel">
          <div className="control-stack">
            <label>
              <span>Monthly income</span>
              <input type="range" min="20000" max="200000" step="5000" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
              <strong>{money.format(income)}</strong>
            </label>
            <label>
              <span>Monthly expenses</span>
              <input type="range" min="10000" max="150000" step="5000" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} />
              <strong>{money.format(expenses)}</strong>
            </label>
          </div>
          <div className="metric-row">
            <span>Monthly surplus</span>
            <strong>{money.format(monthlySurplus)}</strong>
          </div>
        </div>
      ),
    },
    emi: {
      heading: 'Loan EMI',
      content: (
        <div className="calculator-panel">
          <label>
            <span>Loan amount</span>
            <input type="range" min="50000" max="2000000" step="5000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
            <strong>{money.format(loanAmount)}</strong>
          </label>
          <label>
            <span>Interest rate</span>
            <input type="range" min="2" max="20" step="0.5" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} />
            <strong>{loanRate.toFixed(1)}%</strong>
          </label>
          <div className="metric-row">
            <span>Monthly EMI</span>
            <strong>{money.format(monthlyEmi)}</strong>
          </div>
        </div>
      ),
    },
    investment: {
      heading: 'Investment growth',
      content: (
        <div className="calculator-panel">
          <label>
            <span>Monthly SIP</span>
            <input type="range" min="1000" max="50000" step="500" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))} />
            <strong>{money.format(sipAmount)}</strong>
          </label>
          <label>
            <span>Expected return</span>
            <input type="range" min="4" max="20" step="0.5" value={investmentRate} onChange={(e) => setInvestmentRate(Number(e.target.value))} />
            <strong>{investmentRate.toFixed(1)}%</strong>
          </label>
          <div className="metric-row">
            <span>Future value</span>
            <strong>{money.format(investmentProjection.futureValue)}</strong>
          </div>
        </div>
      ),
    },
    tax: {
      heading: 'Tax planner',
      content: (
        <div className="calculator-panel">
          <label>
            <span>Taxable income</span>
            <input type="range" min="200000" max="2000000" step="5000" value={taxableIncome} onChange={(e) => setTaxableIncome(Number(e.target.value))} />
            <strong>{money.format(taxableIncome)}</strong>
          </label>
          <label>
            <span>Deductions</span>
            <input type="range" min="50000" max="500000" step="5000" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} />
            <strong>{money.format(deductions)}</strong>
          </label>
          <div className="metric-row">
            <span>Estimated tax</span>
            <strong>{money.format(estimatedTax)}</strong>
          </div>
        </div>
      ),
    },
  } as const;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-box">
          <div className="brand-icon">
            <img src="/piggy-corp-logo.png" alt="Piggy Corp" />
          </div>
          <div>
            <span className="brand-name">Piggy Corp</span>
            <small>Play smart with money</small>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/" className={activePage === 'home' ? 'active' : ''}>{t('nav.home', language)}</Link>
          <Link to="/learn" className={activePage === 'learn' ? 'active' : ''}>{t('nav.path', language)}</Link>
          <Link to="/quests" className={activePage === 'quests' ? 'active' : ''}>{t('nav.goals', language)}</Link>
          <Link to="/duel" className={activePage === 'duel' ? 'active' : ''}>{t('nav.duel', language)}</Link>
          <Link to="/league" className={activePage === 'league' ? 'active' : ''}>{t('nav.league', language)}</Link>
          <Link to="/feed" className={activePage === 'feed' ? 'active' : ''}>{t('nav.feed', language)}</Link>
          <Link to="/global" className={activePage === 'global' ? 'active' : ''}>{t('nav.global', language) || 'Global'}</Link>
          <Link to="/tools" className={activePage === 'tools' ? 'active' : ''}>{t('nav.tools', language) || 'Tools'}</Link>
          <Link to="/profile" className={activePage === 'profile' ? 'active' : ''}>{t('nav.profile', language) || 'Profile'}</Link>
        </nav>

        <LearningStatusBar financialHealth={financialScore} />
        <div className="language-selector" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Globe2 size={16} />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '4px'}}>
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
            <option value="gu">Gujarati</option>
            <option value="kn">Kannada</option>
          </select>
        </div>
        <div className="account-actions"><span>{session.displayName}</span><button type="button" onClick={onSignOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></div>
        <button type="button" className="primary-btn" onClick={() => navigate('/quest')}>
          Play now <ArrowRight size={16} />
        </button>
      </header>

      <nav className="mobile-nav" aria-label="Quick navigation">
        <Link to="/" className={activePage === 'home' ? 'active' : ''} aria-label="Home"><House size={22} /><span>Home</span></Link>
        <Link to="/duel" className={activePage === 'duel' ? 'active' : ''} aria-label="Matches"><Swords size={22} /><span>Matches</span></Link>
        <Link to="/quests" className={activePage === 'quests' ? 'active' : ''} aria-label="Quests"><Target size={22} /><span>Quests</span></Link>
        <Link to="/league" className={activePage === 'league' ? 'active' : ''} aria-label="League"><Trophy size={22} /><span>League</span></Link>
        <Link to="/feed" className={activePage === 'feed' ? 'active' : ''} aria-label="Feed"><Heart size={22} /><span>Feed</span></Link>
        <Link to="/profile" className={activePage === 'profile' ? 'active' : ''} aria-label="Profile"><MoreHorizontal size={22} /><span>More</span></Link>
      </nav>

      <main className={`page-content page-${activePage}`}>
        <section className="hero-block" id="product">
          <div className="hero-copy">
            <span className="eyebrow">For ages 15+ and above</span>
            <h1>Your money story changes with every choice.</h1>
            <p>
              If you are new to money, this is the easiest place to start. Learn how income, savings, loans, investing, and emergencies work in simple everyday language.
            </p>

            <div className="cta-row">
              <button type="button" className="primary-btn" onClick={() => navigate('/quest')}>Play Money Quest</button>
              <button type="button" className="secondary-btn" onClick={() => navigate('/tools')}>Explore the tools</button>
            </div>

            <div className="fact-grid">
              <div className="fact-card">
                <span>Income</span>
                <strong>{money.format(income)}</strong>
              </div>
              <div className="fact-card">
                <span>Budget</span>
                <strong>{money.format(monthlyBudget)}</strong>
              </div>
              <div className="fact-card">
                <span>EMI</span>
                <strong>{money.format(monthlyEmi)}</strong>
              </div>
              <div className="fact-card">
                <span>Tax</span>
                <strong>{money.format(estimatedTax)}</strong>
              </div>
            </div>

            <div className="insight-grid">
              <div className="insight-card">
                <span>Savings rate</span>
                <strong>{advancedMetrics.savingsRate.toFixed(0)}%</strong>
              </div>
              <div className="insight-card">
                <span>Debt load</span>
                <strong>{advancedMetrics.debtToIncome.toFixed(0)}%</strong>
              </div>
              <div className="insight-card">
                <span>Emergency coverage</span>
                <strong>{advancedMetrics.emergencyCoverage.toFixed(0)}%</strong>
              </div>
              <div className="insight-card">
                <span>Tax efficiency</span>
                <strong>{advancedMetrics.taxEfficiency.toFixed(0)}%</strong>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <div>
                <p>Financial health</p>
                <h3>Score</h3>
              </div>
              <span className="status-pill">Live</span>
            </div>

            <div className="score-box">
              <strong>{financialScore}</strong>
              <span>/100</span>
            </div>

            <div className="mini-bars">
              {[
                { label: 'Budget', value: Math.min(100, Math.round((income - expenses) / 900)) },
                { label: 'Savings', value: Math.min(100, Math.round(savings / 250)) },
                { label: 'EMI', value: Math.max(10, 100 - Math.round((monthlyEmi / 25000) * 100)) },
                { label: 'Tax', value: Math.min(100, Math.round((taxableIncome - deductions) / 12000)) },
              ].map((item) => (
                <div className="mini-row" key={item.label}>
                  <label>{item.label}</label>
                  <div className="mini-track">
                    <span style={{ width: `${item.value}%` }} />
                  </div>
                  <b>{item.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MoneyQuest
          monthlyIncome={income}
          essentialSpend={expenses}
          onIncomeChange={setIncome}
          onEssentialSpendChange={setExpenses}
          onExperienceEarned={recordExperience}
        />

        <section className="feature-strip">
          <div className="strip-item"><BadgeCheck size={16} /> Built for everyday money decisions</div>
          <div className="strip-item"><Target size={16} /> Budget, EMI, tax, and savings in one place</div>
          <div className="strip-item"><Sparkles size={16} /> Clear for young users and serious learners</div>
        </section>

        <section className="section-block" id="features">
          <div className="section-head">
            <span className="section-tag">Core product</span>
            <h2>Everything important in one smart dashboard</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block" id="topics">
          <div className="section-head">
            <span className="section-tag">Topic explorer</span>
            <h2>Advanced finance topics that matter in the real world</h2>
          </div>

          <div className="topic-explorer-grid">
            {topicExplorer.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={selectedTopic === topic.id ? 'topic-pill active' : 'topic-pill'}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  scrollToSection('topic-detail');
                }}
              >
                {topic.title}
              </button>
            ))}
          </div>

          <div className="topic-detail-card" id="topic-detail">
            <div className="topic-detail-head">
              <span className="section-tag">Deep dive</span>
              <h3>{activeTopic.title}</h3>
            </div>
            <p className="topic-detail-summary">{activeTopic.short}</p>
            <p>{activeTopic.detail}</p>
            <div className="topic-detail-use">
              <strong>How to use this in real life</strong>
              <p>{activeTopic.use}</p>
            </div>
          </div>
        </section>

        <section className="section-block" id="learning">
          <div className="section-head">
            <span className="section-tag">Courses · India edition</span>
            <h2>Learn it. Try it. Make the next call with context.</h2>
            <p>Eight guided modules, three short lessons each, and a practice sandbox per module. Every example uses fictional values.</p>
          </div>

          <div className="course-module-layout">
            <nav className="course-module-list" aria-label="Course modules" role="tablist">
              {learningModules.map((course) => {
                const Icon = course.icon;
                const selected = selectedCourse.id === course.id;
                return <button key={course.id} type="button" role="tab" aria-selected={selected} aria-controls="course-detail-panel" className={`course-module-choice ${selected ? 'selected' : ''}`} onClick={() => selectCourse(course)}>
                  <span className="course-module-number">{course.number}</span>
                  <span className="course-module-icon"><Icon size={18} /></span>
                  <span className="course-module-choice-copy"><strong>{course.title}</strong><small>{course.duration} · 3 lessons</small></span>
                  <ChevronRight size={16} />
                </button>;
              })}
            </nav>

            <section className="course-detail-panel" id="course-detail-panel" role="tabpanel" aria-label={selectedCourse.title}>
              <div className="course-detail-heading">
                <span className="course-module-kicker">MODULE {selectedCourse.number} · {selectedCourse.duration}</span>
                <h3>{selectedCourse.title}</h3>
                <p>{selectedCourse.blurb}</p>
              </div>
              <div className="course-lesson-list">
                {selectedCourse.lessons.map((lesson, index) => <article className="course-lesson" key={lesson.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><h4>{lesson.title}</h4><p>{lesson.detail}</p></div>
                  <small>2 min</small>
                </article>)}
              </div>
              <div className="course-practice-lab">
                <div className="course-practice-heading"><span><Sparkles size={14} /> PRACTICE LAB</span><strong>Try a fictional scenario</strong></div>
                <label htmlFor="course-spend-slider"><span>{selectedCourse.experiment.label}</span><strong>{money.format(courseSpend)}</strong></label>
                <input id="course-spend-slider" type="range" min={selectedCourse.experiment.min} max={selectedCourse.experiment.max} step={selectedCourse.experiment.step} value={courseSpend} onChange={(event) => { setCourseSpend(Number(event.target.value)); setCourseAnswer(null); setCourseChecked(false); }} />
                <div className="course-practice-output"><span>{courseEstimateLabel}</span><strong>{money.format(courseEstimate)}</strong></div>
                <p>Practice model only. No interest, tax outcome, market return, or product is guaranteed.</p>
              </div>
              <div className="course-checkpoint">
                <span className="course-module-kicker">QUICK CHECK · 1 MIN</span>
                <h4>{selectedCourse.question}</h4>
                <div className="course-answer-list" role="group" aria-label={`${selectedCourse.title} checkpoint`}>
                  {selectedCourse.answers.map((option, index) => <button key={option} type="button" aria-pressed={courseAnswer === index} className={courseAnswer === index ? `course-answer${courseChecked ? index === selectedCourse.correct ? ' correct' : ' incorrect' : ''}` : 'course-answer'} onClick={() => { setCourseAnswer(index); setCourseChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}
                </div>
                {courseChecked && <p className={courseAnswer === selectedCourse.correct ? 'course-feedback correct' : 'course-feedback'} role="status">{courseAnswer === selectedCourse.correct ? `Correct. ${selectedCourse.feedback}` : 'Try again. Revisit the lesson and choose the answer that fits the scenario.'}</p>}
                <button type="button" className="course-check-button" disabled={courseAnswer === null} onClick={() => setCourseChecked(true)}>Check answer <ArrowRight size={15} /></button>
              </div>
            </section>
          </div>

          <div className="checklist-panel">
            <div className="panel-header checklist-header">
              <div>
                <p>Smart checklist</p>
                <h3>What every good financial plan should include</h3>
              </div>
              <span className="status-pill">Must know</span>
            </div>
            <div className="checklist-grid">
              {financialChecklist.map((item) => (
                <div className="checklist-item" key={item}>
                  <BadgeCheck size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block dashboard-area" id="dashboard">
          <div className="section-head">
            <span className="section-tag">Dashboard</span>
            <h2>Interactive financial planning tools</h2>
          </div>

          <div className="dash-grid">
            <div className="card large-card">
              <div className="card-header">
                <div>
                  <p>Cash flow</p>
                  <h3>Financial dashboard</h3>
                </div>
                <span className="badge-pill">Live</span>
              </div>

              <div className="calculator-switch" aria-label="Finance tools">
                {(['budget', 'emi', 'investment', 'tax'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? 'switch-btn active' : 'switch-btn'}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'budget' ? 'Budget' : tab === 'emi' ? 'EMI' : tab === 'investment' ? 'Investment' : 'Tax'}
                  </button>
                ))}
              </div>

              <div className="calculator-panel-wrap">
                <h3>{calculatorTools[activeTab].heading}</h3>
                {calculatorTools[activeTab].content}
              </div>

              <div className="money-stack">
                <div className="money-box income">
                  <span>Income</span>
                  <strong>{money.format(income)}</strong>
                </div>
                <div className="money-box expense">
                  <span>Expenses</span>
                  <strong>{money.format(expenses)}</strong>
                </div>
                <div className="money-box save">
                  <span>Saved</span>
                  <strong>{money.format(savings)}</strong>
                </div>
                <div className="money-box invest">
                  <span>Invested</span>
                  <strong>{money.format(investmentProjection.totalInvested)}</strong>
                </div>
              </div>

              <div className="summary-row">
                <div>
                  <small>Monthly surplus</small>
                  <strong>{money.format(monthlySurplus)}</strong>
                </div>
                <div>
                  <small>Monthly tax provision</small>
                  <strong>{money.format(estimatedMonthlyTax)}</strong>
                </div>
              </div>
            </div>

            <div className="card side-card">
              <div className="mini-icon blue"><WalletCards size={18} /></div>
              <p>Emergency fund</p>
              <h3>{money.format(goalEmergency)}</h3>
              <button className="action-btn" onClick={() => setGoalEmergency((value) => value + 5000)}>Add ₹5,000</button>
            </div>

            <div className="card side-card">
              <div className="mini-icon green"><PiggyBank size={18} /></div>
              <p>Goal plan</p>
              <h3>{money.format(savingsPlan.annualTarget)}</h3>
              <button className="action-btn" onClick={() => setSavings((value) => value + 2000)}>Save more</button>
            </div>

            <div className="card side-card">
              <div className="mini-icon purple"><Landmark size={18} /></div>
              <p>Loan</p>
              <h3>{money.format(loanAmount)}</h3>
              <button className="action-btn" onClick={() => setLoanAmount((value) => Math.max(0, value - 20000))}>Prepay</button>
            </div>
          </div>
        </section>

        <section className="section-block" id="emi">
          <div className="section-head">
            <span className="section-tag">Calculator</span>
            <h2>Loan EMI and repayment clarity</h2>
          </div>

          <div className="two-col-grid">
            <div className="card tool-card">
              <div className="tool-title">
                <Calculator size={18} />
                <h3>EMI calculator</h3>
              </div>

              <label>
                <span>Loan amount</span>
                <input type="range" min="50000" max="2000000" step="5000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
                <strong>{money.format(loanAmount)}</strong>
              </label>

              <label>
                <span>Interest rate</span>
                <input type="range" min="2" max="20" step="0.5" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} />
                <strong>{loanRate.toFixed(1)}%</strong>
              </label>

              <label>
                <span>Tenure</span>
                <input type="range" min="1" max="20" step="1" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} />
                <strong>{loanYears} years</strong>
              </label>
            </div>

            <div className="card metric-card">
              <div className="tool-title">
                <Coins size={18} />
                <h3>EMI result</h3>
              </div>

              <div className="big-value">{money.format(monthlyEmi)}</div>
              <div className="metric-row">
                <span>Total payment</span>
                <strong>{money.format(totalLoanPayable)}</strong>
              </div>
              <div className="metric-row">
                <span>Interest</span>
                <strong>{money.format(totalInterest)}</strong>
              </div>
              <div className="metric-row">
                <span>After costs, tax & EMI</span>
                <strong>{money.format(income - expenses - estimatedMonthlyTax - monthlyEmi)}</strong>
              </div>
              <details className="calculation-note">
                <summary>How is the EMI calculated?</summary>
                <div className="calculation-note-body">
                  <p>Your monthly payment gradually repays the loan amount and its interest, assuming the rate stays unchanged.</p>
                  <ul>
                    <li>Starting loan amount: {money.format(loanAmount)}.</li>
                    <li>Time to repay: {loanYears} years, with monthly payments.</li>
                    <li>Estimated monthly payment: {money.format(monthlyEmi)}.</li>
                    <li>Estimated interest across the full schedule: {money.format(totalInterest)}.</li>
                  </ul>
                  <p className="calculation-caveat">This simplified estimate assumes the rate stays constant. It excludes fees, insurance, and changes to the loan terms.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section-block" id="invest">
          <div className="section-head">
            <span className="section-tag">Investment plan</span>
            <h2>Grow savings through SIP and wealth planning</h2>
          </div>

          <div className="two-col-grid">
            <div className="card tool-card">
              <div className="tool-title">
                <BriefcaseBusiness size={18} />
                <h3>Wealth calculator</h3>
              </div>

              <label>
                <span>Monthly SIP</span>
                <input type="range" min="1000" max="50000" step="500" value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))} />
                <strong>{money.format(sipAmount)}</strong>
              </label>

              <label>
                <span>Expected return</span>
                <input type="range" min="4" max="20" step="0.5" value={investmentRate} onChange={(e) => setInvestmentRate(Number(e.target.value))} />
                <strong>{investmentRate.toFixed(1)}%</strong>
              </label>

              <label>
                <span>Years</span>
                <input type="range" min="1" max="30" step="1" value={investmentYears} onChange={(e) => setInvestmentYears(Number(e.target.value))} />
                <strong>{investmentYears} years</strong>
              </label>

              <label>
                <span>Initial amount</span>
                <input type="range" min="0" max="200000" step="5000" value={lumpsum} onChange={(e) => setLumpsum(Number(e.target.value))} />
                <strong>{money.format(lumpsum)}</strong>
              </label>
            </div>

            <div className="card metric-card">
              <div className="tool-title">
                <PiggyBank size={18} />
                <h3>Future value</h3>
              </div>

              <div className="big-value">{money.format(investmentProjection.futureValue)}</div>
              <div className="metric-row">
                <span>Invested total</span>
                <strong>{money.format(investmentProjection.totalInvested)}</strong>
              </div>
              <div className="metric-row">
                <span>Estimated gains</span>
                <strong>{money.format(investmentProjection.gains)}</strong>
              </div>
              <div className="metric-row">
                <span>Growth</span>
                <strong>{((investmentProjection.gains / Math.max(1, investmentProjection.totalInvested)) * 100).toFixed(1)}%</strong>
              </div>
              <div className="metric-row">
                <span>Monthly contributions</span>
                <strong>{money.format(sipAmount * investmentYears * 12)}</strong>
              </div>
              <div className="metric-row">
                <span>Starting amount</span>
                <strong>{money.format(lumpsum)}</strong>
              </div>
              <details className="calculation-note">
                <summary>How is investment growth calculated?</summary>
                <div className="calculation-note-body">
                  <p>This illustration tracks your starting amount and monthly contributions separately, then shows their combined estimated value.</p>
                  <ul>
                    <li>Starting amount: {money.format(lumpsum)}.</li>
                    <li>Monthly contribution: {money.format(sipAmount)} for {investmentYears} years.</li>
                    <li>Estimated total contributions: {money.format(sipAmount * investmentYears * 12)}.</li>
                    <li>Estimated value, including the starting amount: {money.format(investmentProjection.futureValue)}.</li>
                  </ul>
                  <p className="calculation-caveat">This example holds the selected return steady and reinvests gains. Real markets fluctuate; fees, tax, and inflation are excluded. Growth is not guaranteed.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section-block" id="tax">
          <div className="section-head">
            <span className="section-tag">Tax planner</span>
            <h2>Simple tax estimation and deduction check</h2>
          </div>

          <div className="two-col-grid">
            <div className="card tool-card">
              <div className="tool-title">
                <ShieldCheck size={18} />
                <h3>Income & deductions</h3>
              </div>

              <label>
                <span>Annual income (model input)</span>
                <input type="range" min="200000" max="2000000" step="5000" value={taxableIncome} onChange={(e) => setTaxableIncome(Number(e.target.value))} />
                <strong>{money.format(taxableIncome)}</strong>
              </label>

              <label>
                <span>Assumed deductions</span>
                <input type="range" min="50000" max="500000" step="5000" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} />
                <strong>{money.format(deductions)}</strong>
              </label>
            </div>

            <div className="card metric-card">
              <div className="tool-title">
                <CircleDollarSign size={18} />
                <h3>Estimated tax</h3>
              </div>

              <div className="big-value">{money.format(estimatedTax)}</div>
              <div className="metric-row">
                <span>Modelled taxable base</span>
                <strong>{money.format(estimatedTaxableBase)}</strong>
              </div>
              <div className="metric-row">
                <span>Monthly budget provision</span>
                <strong>{money.format(estimatedMonthlyTax)}</strong>
              </div>
              <details className="calculation-note">
                <summary>How is this tax estimate calculated?</summary>
                <div className="calculation-note-body">
                  <p>This teaching example shows an annual estimate and a monthly budgeting amount.</p>
                  <ul>
                    <li>Annual income: {money.format(taxableIncome)}.</li>
                    <li>Entered deductions: {money.format(deductions)}.</li>
                    <li>Illustrative taxable amount after the example allowance: {money.format(estimatedTaxableBase)}.</li>
                    <li>Estimated annual amount: {money.format(estimatedTax)}; monthly budget amount: {money.format(estimatedMonthlyTax)}.</li>
                  </ul>
                  <p className="calculation-caveat">This is a teaching example, not an official tax calculation. It uses an assumed ₹1,25,000 threshold and flat 20% rate; actual Indian tax depends on tax year, regime, progressive slabs, rebates, cess, and eligible deductions.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section-block" id="goals">
          <div className="section-head">
            <span className="section-tag">Goal planner</span>
            <h2>Shape your future with clear milestones</h2>
          </div>

          <div className="goal-grid">
            <div className="card goal-card">
              <p>Emergency fund</p>
              <h3>{money.format(goalEmergency)}</h3>
              <input type="range" min="20000" max="200000" step="5000" value={goalEmergency} onChange={(e) => setGoalEmergency(Number(e.target.value))} />
            </div>

            <div className="card goal-card">
              <p>Education</p>
              <h3>{money.format(goalEducation)}</h3>
              <input type="range" min="20000" max="300000" step="5000" value={goalEducation} onChange={(e) => setGoalEducation(Number(e.target.value))} />
            </div>

            <div className="card goal-card">
              <p>Travel</p>
              <h3>{money.format(goalTravel)}</h3>
              <input type="range" min="10000" max="150000" step="5000" value={goalTravel} onChange={(e) => setGoalTravel(Number(e.target.value))} />
            </div>

            <div className="card goal-card advice-card">
              <p>Smart advice</p>
              <h3>{money.format(savingsPlan.monthlyTarget)}</h3>
              <ul>
                {tips.map((tip) => (
                  <li key={tip}><ChevronRight size={16} /> {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-block" id="global-investing">
          <div className="section-head">
            <span className="section-tag">Global investing lab</span>
            <h2>Global markets, local context.</h2>
            <p>Explore diversification, compare access routes, and practice the rules with clearly labeled learning scenarios.</p>
          </div>
          <div className="global-why-grid">
            <div className="global-why-item"><span className="global-icon"><Globe2 size={19} /></span><div><strong>Look beyond one market</strong><p>Compare country and sector exposure without assuming broader means risk-free.</p></div></div>
            <div className="global-why-item"><span className="global-icon"><TrendingUp size={19} /></span><div><strong>Follow the whole picture</strong><p>See how asset changes and currency movement can affect a fictional rupee outcome.</p></div></div>
            <div className="global-why-item"><span className="global-icon"><ShieldCheck size={19} /></span><div><strong>Practice the guardrails</strong><p>Use checklists to learn about documents, fees, eligibility, and reporting questions.</p></div></div>
          </div>
          <div className="global-mode-tabs" role="tablist" aria-label="Global investing learning modes">
            <button type="button" role="tab" aria-selected={globalMode === 'simulator'} onClick={() => setGlobalMode('simulator')}>Build a portfolio</button>
            <button type="button" role="tab" aria-selected={globalMode === 'routes'} onClick={() => setGlobalMode('routes')}>Choose a route</button>
            <button type="button" role="tab" aria-selected={globalMode === 'rules'} onClick={() => setGlobalMode('rules')}>Rules and tax</button>
            <button type="button" role="tab" aria-selected={globalMode === 'challenge'} onClick={() => setGlobalMode('challenge')}>Quick check</button>
          </div>
          <div className="global-mode-content-wrap">
            {globalMode === 'simulator' && (
              <div className="global-mode-content" role="tabpanel">
                <div className="global-mode-heading">
                  <div><span className="global-kicker">01 / Portfolio simulator</span><h3>What could a global slice change?</h3></div>
                  <p>Try the commonly discussed 80/20 split, then change it. This is a learning scenario, not a recommended allocation.</p>
                </div>
                <div className="global-simulator-grid">
                  <div className="global-controls">
                    <label className="global-control"><span>Monthly amount to invest</span><strong>{money.format(globalMonthly)}</strong><input type="range" min="1000" max="50000" step="1000" value={globalMonthly} onChange={(event) => setGlobalMonthly(Number(event.target.value))} /></label>
                    <label className="global-control"><span>Global share <b>{globalAllocation}%</b></span><strong>India {100 - globalAllocation}% / Global {globalAllocation}%</strong><input type="range" min="0" max="60" step="5" value={globalAllocation} onChange={(event) => setGlobalAllocation(Number(event.target.value))} /></label>
                    <label className="global-control"><span>Time invested</span><strong>{globalYears} years</strong><input type="range" min="1" max="30" step="1" value={globalYears} onChange={(event) => setGlobalYears(Number(event.target.value))} /></label>
                    <div className="global-scenario-control">
                      <span>Try a market + currency scenario</span>
                      <label><span>Foreign market return (assumed)</span><strong>{globalMarketReturn}% / year</strong><input type="range" min="-20" max="20" step="1" value={globalMarketReturn} onChange={(event) => setGlobalMarketReturn(Number(event.target.value))} /></label>
                      <label><span>Foreign currency move vs INR</span><strong>{globalCurrencyMove > 0 ? '+' : ''}{globalCurrencyMove}% / year</strong><input type="range" min="-10" max="10" step="1" value={globalCurrencyMove} onChange={(event) => setGlobalCurrencyMove(Number(event.target.value))} /></label>
                      <p>A positive currency number means the foreign currency strengthens against the rupee; a negative number means it weakens.</p>
                    </div>
                  </div>
                  <div className="global-results">
                    <div className="global-result-top"><span>Illustrative ending values</span><strong>{globalYears}-year model</strong></div>
                    <p className="global-invested-note">You contribute {money.format(globalMonthly)} each month, or {money.format(globalProjection.totalInvested)} in total.</p>
                    <div className="global-result-row"><div><span>100% India model</span><strong>{money.format(globalProjection.domesticValue)}</strong></div><div className="global-result-track"><i style={{ width: `${Math.min(100, globalProjection.domesticValue / Math.max(globalProjection.domesticValue, globalProjection.blendedValue, globalProjection.globalValue, 1) * 100)}%` }} /></div></div>
                    <div className="global-result-row is-highlighted"><div><span>Your {100 - globalAllocation}/{globalAllocation} mix</span><strong>{money.format(globalProjection.blendedValue)}</strong></div><div className="global-result-track"><i style={{ width: `${Math.min(100, globalProjection.blendedValue / Math.max(globalProjection.domesticValue, globalProjection.blendedValue, globalProjection.globalValue, 1) * 100)}%` }} /></div></div>
                    <div className="global-result-row"><div><span>100% foreign model</span><strong>{money.format(globalProjection.globalValue)}</strong></div><div className="global-result-track"><i style={{ width: `${Math.min(100, globalProjection.globalValue / Math.max(globalProjection.domesticValue, globalProjection.blendedValue, globalProjection.globalValue, 1) * 100)}%` }} /></div></div>
                    <div className="global-formula"><strong>Currency lesson</strong><p>The simulated rupee result combines the foreign market change with the currency movement. With these inputs, the model shows {globalProjection.foreignInrAnnualRate.toFixed(2)}% a year before fees, taxes, and inflation. Currency can help or hurt; it is not a guaranteed hedge.</p></div>
                    <p className="global-model-caveat">Assumptions: India return held at 10% yearly; your sliders set foreign asset and currency changes. Monthly contributions compound at a constant rate, reinvested at month start. Actual returns fluctuate and can be negative. Costs, taxes, tracking error, and inflation are excluded. Past or modeled returns do not predict future results.</p>
                  </div>
                </div>
              </div>
            )}

            {globalMode === 'routes' && (
              <div className="global-mode-content" role="tabpanel">
                <div className="global-mode-heading"><div><span className="global-kicker">02 / Access routes</span><h3>Choose how you want to learn about access</h3></div><p>There is no single best route. Product availability, fees, taxes, limits, and paperwork differ. Compare the structure before you act.</p></div>
                <div className="global-route-grid" role="group" aria-label="Select an investment access route">
                  <button type="button" className={globalRoute === 'fund' ? 'global-route-choice active' : 'global-route-choice'} onClick={() => setGlobalRoute('fund')}><span>Route A</span><strong>India-domiciled fund</strong><small>Invest in an Indian fund that may provide overseas exposure.</small></button>
                  <button type="button" className={globalRoute === 'lrs' ? 'global-route-choice active' : 'global-route-choice'} onClick={() => setGlobalRoute('lrs')}><span>Route B</span><strong>Overseas broker via LRS</strong><small>Remit abroad and buy eligible foreign-listed investments.</small></button>
                  <button type="button" className={globalRoute === 'gift' ? 'global-route-choice active' : 'global-route-choice'} onClick={() => setGlobalRoute('gift')}><span>Route C</span><strong>GIFT City / IFSC</strong><small>Explore eligible products offered through an IFSC provider.</small></button>
                </div>
                <div className="global-route-detail">
                  {globalRoute === 'fund' && <><div className="global-icon"><Landmark size={18} /></div><div><h4>India-domiciled international fund</h4><p>You buy units in India through an eligible local fund platform. The fund handles the underlying overseas holdings. Check whether subscriptions are currently open, the benchmark, expense ratio, tracking difference, exit rules, and the fund's own tax treatment.</p><ol><li>Read the scheme information document and confirm its actual country/asset exposure.</li><li>Compare total costs and how closely the fund tracks its index.</li><li>Use an account and platform you understand; keep statements for tax records.</li></ol><p className="global-route-tradeoff"><strong>Trade-off:</strong> Easier local onboarding, but product access can be limited by fund rules or overseas investment limits. This is not the same as owning foreign-listed shares directly.</p></div></>}
                  {globalRoute === 'lrs' && <><div className="global-icon"><Globe2 size={18} /></div><div><h4>Direct overseas investing using LRS</h4><p>The Liberalised Remittance Scheme is an RBI framework that allows eligible resident individuals to remit money abroad for permitted purposes, subject to current rules. An overseas brokerage account is one possible way to invest; the remittance and the investment account have separate terms.</p><ol><li>Confirm residency, permitted purpose, broker regulation, account fees, asset eligibility, and country-specific risks.</li><li>Complete the broker's identity checks; use your PAN and the documents the provider/bank requests.</li><li>Ask your authorised dealer bank about purpose codes, paperwork, exchange rate, bank charges, and any applicable tax collection before sending funds.</li><li>Keep remittance confirmations, trade statements, dividend records, and foreign tax documents.</li></ol><p className="global-route-tradeoff"><strong>Trade-off:</strong> Direct choice and access, with more responsibility for currency conversion, records, foreign withholding, reporting, and tax compliance.</p></div></>}
                  {globalRoute === 'gift' && <><div className="global-icon"><Landmark size={18} /></div><div><h4>GIFT City and an IFSC provider</h4><p>GIFT City is home to India's International Financial Services Centre. IFSC financial services are regulated by IFSCA; other Indian authorities, including RBI, have roles in areas such as foreign exchange and remittance. A regulated location does not make every product risk-free or guarantee returns.</p><ol><li>Verify the specific entity on the official IFSCA register and confirm which legal entity holds your account/assets.</li><li>Read product documents, custody arrangements, investor protections, fees, dealing hours, and complaint process.</li><li>Ask the provider and your tax adviser how funding, LRS (if applicable), reporting, and tax work for your exact product.</li></ol><p className="global-route-tradeoff"><strong>Trade-off:</strong> Product and account structures vary. Do not assume every IFSC investment follows the same funding route or investor-protection rules.</p></div></>}
                </div>
              </div>
            )}

            {globalMode === 'rules' && (
              <div className="global-mode-content" role="tabpanel">
                <div className="global-mode-heading"><div><span className="global-kicker">03 / Guardrails</span><h3>Know the limit. Keep the paper trail.</h3></div><p>Rules change and details depend on your residency, product, and transaction. Use this as a checklist for questions, then confirm with your bank and a qualified tax professional.</p></div>
                <div className="global-rules-grid">
                  <div className="global-rule-card"><span className="global-kicker">LRS learning calculator</span><h4>Track a teaching example of your annual remittance</h4><p>RBI's commonly stated LRS ceiling is USD 250,000 per resident individual per financial year for permitted transactions. It is a combined limit across applicable LRS transactions, not a separate investment allowance. Eligibility, exclusions, tax collection, and current rules matter.</p><label className="global-control"><span>Planned / completed LRS remittance this financial year (USD)</span><strong>US$ {plannedRemittance.toLocaleString('en-US')}</strong><input type="range" min="0" max="250000" step="1000" value={plannedRemittance} onChange={(event) => setPlannedRemittance(Number(event.target.value))} /></label><div className="global-lrs-readout"><div><span>Illustrative headroom remaining</span><strong>US$ {lrsRemainingUsd.toLocaleString('en-US')}</strong></div><div className="global-lrs-track"><i style={{ width: `${Math.min(100, plannedRemittance / lrsLimitUsd * 100)}%` }} /></div><small>{(plannedRemittance / lrsLimitUsd * 100).toFixed(1)}% of the example ceiling entered. This is not bank approval or a live eligibility check.</small></div></div>
                  <div className="global-rule-card global-checklist"><span className="global-kicker">Before funding</span><h4>Pause and verify these</h4><ul><li><BadgeCheck size={17} /><span>Resident status and whether the purpose/product is permitted under current rules.</span></li><li><BadgeCheck size={17} /><span>Your total remittances across the financial year and the bank's required declarations.</span></li><li><BadgeCheck size={17} /><span>Exchange rate, transfer fee, intermediary charges, and any applicable TCS; ask how/when credit or refund works.</span></li><li><BadgeCheck size={17} /><span>KYC requirements. PAN is commonly needed; exact identity/address documents depend on the bank or provider. Aadhaar is not a universal LRS rule.</span></li><li><BadgeCheck size={17} /><span>Nominee/access arrangements, account security, custody, and how to bring funds back.</span></li></ul></div>
                </div>
                <div className="global-tax-strip"><div><span className="global-kicker">DTAA and foreign tax credit</span><h4>Tax paid abroad does not automatically erase Indian tax.</h4></div><p>A Double Taxation Avoidance Agreement may provide relief, often through a foreign tax credit subject to treaty terms, Indian law, income type, evidence, and filing procedures. Indian residents may have foreign income and asset disclosure duties. Dividends, capital gains, fund structures, holding periods, and reporting rules differ. Keep statements and withholding certificates; get advice for your facts before filing.</p></div>
                <div className="dtaa-lab">
                  <div className="dtaa-lab-heading">
                    <div>
                      <span className="global-kicker">Interactive tax scenario</span>
                      <h3>See how double-tax relief may work</h3>
                      <p>DTAA means Double Taxation Avoidance Agreement. A treaty may limit which country taxes an income type or support relief from tax paid twice. Try the numbers below to understand the mechanics.</p>
                    </div>
                    <button type="button" className="secondary-btn dtaa-reset" onClick={() => {
                      setForeignIncome(500000);
                      setForeignTaxRate(15);
                      setIndiaTaxRateOnForeignIncome(20);
                      setModelForeignTaxCredit(true);
                      setDtaaDocuments([]);
                    }}>Reset example <RotateCcw size={15} /></button>
                  </div>

                  <div className="dtaa-workbench-grid">
                    <div className="dtaa-inputs">
                      <label className="global-control">
                        <span>Foreign income (INR equivalent)</span>
                        <strong>{money.format(foreignIncome)}</strong>
                        <input type="range" min="50000" max="5000000" step="50000" value={foreignIncome} onChange={(event) => setForeignIncome(Number(event.target.value))} />
                        <small>Use the gross income amount before foreign tax. This example ignores exchange-rate conversion timing.</small>
                      </label>
                      <label className="global-control">
                        <span>Foreign tax withheld (assumption)</span>
                        <strong>{foreignTaxRate}% · {money.format(dtaaProjection.foreignTaxPaid)}</strong>
                        <input type="range" min="0" max="35" step="1" value={foreignTaxRate} onChange={(event) => setForeignTaxRate(Number(event.target.value))} />
                      </label>
                      <label className="global-control">
                        <span>Indian tax on this same income (assumption)</span>
                        <strong>{indiaTaxRateOnForeignIncome}% · {money.format(dtaaProjection.indianTaxBeforeCredit)}</strong>
                        <input type="range" min="0" max="40" step="1" value={indiaTaxRateOnForeignIncome} onChange={(event) => setIndiaTaxRateOnForeignIncome(Number(event.target.value))} />
                        <small>Enter an estimated rate for learning. This is not your full Indian tax slab calculation.</small>
                      </label>
                      <label className="dtaa-credit-toggle">
                        <input type="checkbox" checked={modelForeignTaxCredit} onChange={(event) => setModelForeignTaxCredit(event.target.checked)} />
                        <span><strong>Model a potential foreign tax credit</strong><small>Switch off to compare the simple “no credit applied” scenario. A real credit requires eligibility and compliant records.</small></span>
                      </label>
                    </div>

                    <div className="dtaa-results" aria-live="polite">
                      <div className="dtaa-results-heading"><div><span className="global-kicker">Your illustrative result</span><h4>{modelForeignTaxCredit ? 'Credit scenario' : 'No-credit scenario'}</h4></div><CircleDollarSign size={20} /></div>
                      <div className="dtaa-metric-row"><span>Tax withheld abroad</span><strong>{money.format(dtaaProjection.foreignTaxPaid)}</strong></div>
                      <div className="dtaa-metric-row"><span>Estimated Indian tax before credit</span><strong>{money.format(dtaaProjection.indianTaxBeforeCredit)}</strong></div>
                      <div className="dtaa-metric-row dtaa-credit-row"><span>Potential credit applied in this model</span><strong>− {money.format(dtaaProjection.creditApplied)}</strong></div>
                      <div className="dtaa-metric-row"><span>Illustrative Indian tax after credit</span><strong>{money.format(dtaaProjection.indianTaxAfterCredit)}</strong></div>
                      <div className="dtaa-total-row"><span>Combined tax in this example</span><strong>{money.format(dtaaProjection.combinedTax)}</strong><small>{dtaaProjection.effectiveRate.toFixed(1)}% of the assumed foreign income</small></div>
                      {dtaaProjection.foreignTaxAboveIndianCap > 0 && <p className="dtaa-alert"><strong>Compare carefully:</strong> {money.format(dtaaProjection.foreignTaxAboveIndianCap)} of foreign tax is above the Indian-tax cap used in this simplified example. Do not assume the excess is refundable or creditable; check the treaty and source-country reclaim rules.</p>}
                      <p className="dtaa-formula-note">Teaching rule only: a credit is often limited to eligible foreign tax and the Indian tax attributable to that income, whichever is lower. Actual rules, treaty articles, income classification, documentation, currency conversion, surcharge/cess, and filing requirements can change the result.</p>
                    </div>
                  </div>

                  <div className="dtaa-checklist">
                    <div className="dtaa-checklist-heading"><div><span className="global-kicker">Practical preparation</span><h4>Build your evidence checklist</h4><p>Tick items as you learn what to collect. Your progress stays in this page until it is refreshed.</p></div><strong>{dtaaDocuments.length}/{dtaaChecklist.length} ready</strong></div>
                    <div className="dtaa-checklist-grid">
                      {dtaaChecklist.map((item) => (
                        <label className="dtaa-check-item" key={item}>
                          <input type="checkbox" checked={dtaaDocuments.includes(item)} onChange={() => setDtaaDocuments((current) => current.includes(item) ? current.filter((document) => document !== item) : [...current, item])} />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                    <p className="dtaa-filing-note">For an Indian foreign tax credit claim, verify current Income-tax Rules and Form 67 instructions, including the applicable filing deadline. A treaty does not remove foreign-asset or foreign-income disclosure duties.</p>
                  </div>
                </div>
              </div>
            )}

            {globalMode === 'challenge' && (
              <div className="global-mode-content" role="tabpanel">
                <div className="global-mode-heading"><div><span className="global-kicker">04 / Decision checkpoint</span><h3>Can you spot the better next step?</h3></div><p>Imagine a friend wants to buy one famous technology stock after seeing a social-media tip. What is the most useful first response?</p></div>
                <div className="global-quiz-options">
                  {['Buy quickly before the price rises.', 'Borrow to invest more because global companies are safer.', 'Check the goal, time horizon, diversification, fees, currency exposure, and downside before choosing a product.', 'Put every investment into an ETF; ETFs cannot lose money.'].map((answer, index) => <button type="button" key={answer} className={`global-quiz-answer${quizAnswer === index ? (index === 2 ? ' correct' : ' incorrect') : ''}`} onClick={() => setQuizAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{answer}</button>)}
                </div>
                {quizAnswer !== null && <div className={quizAnswer === 2 ? 'global-quiz-feedback correct' : 'global-quiz-feedback'} role="status"><strong>{quizAnswer === 2 ? 'Good decision process.' : 'That choice skips an important risk check.'}</strong><p>{quizAnswer === 2 ? 'Start with purpose and time horizon, then assess concentration, fees, currency, tax, and what you would do in a sharp fall. Even a diversified ETF can lose value.' : 'A familiar brand, foreign listing, or ETF label does not remove risk. Compare alternatives, understand possible losses and costs, and never invest based only on a tip.'}</p><button type="button" className="secondary-btn global-reset" onClick={() => setQuizAnswer(null)}>Try again <ArrowRight size={15} /></button></div>}
                <div className="global-long-term-note"><TrendingUp size={18} /><p><strong>Long-game rule:</strong> build the emergency fund first, invest for a clear goal, diversify rather than chase a country or a stock, and review on a schedule instead of reacting to every headline.</p></div>
              </div>
            )}
          </div>
        </section>

        <section className="section-block roadmap-block">
          <div className="section-head">
            <span className="section-tag">Why it matters</span>
            <h2>Made to teach real financial confidence</h2>
          </div>

          <div className="roadmap-grid">
            {roadmap.map((step) => (
              <div className="roadmap-card" key={step}>
                <div className="road-icon"><Target size={18} /></div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <ProfilePage />
        <DuelPage />
        <LearningPathPage />
        <QuestsPage />
        <LeaguePage />
        <FeedPage />
      </main>
      <MoneyAssistant learnerName={session.displayName} language={language} />
    </div>
  );
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(getStoredSession);

  const signOut = () => {
    clearLocalSession();
    setSession(null);
  };

  if (!session) return <AuthScreen onAuthenticated={setSession} />;
  return <AppContent session={session} onSignOut={signOut} />;
}

export default App;
