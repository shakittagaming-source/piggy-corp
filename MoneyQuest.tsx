import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  CircleDollarSign,
  Clock3,
  Download,
  Landmark,
  Percent,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { generateMonthlyEvent, INFLATION_RATE_MONTHLY, MARKET_ASSETS, tickMarket } from './SimulationEngine';
import './MoneyQuest.css';

type AssetKey = keyof typeof MARKET_ASSETS;
type PriceMap = Record<AssetKey, number>;
type Holdings = Record<AssetKey, number>;
type ResultTone = 'steady' | 'good' | 'warning';
type BankProduct = 'savings' | 'fixed';
type FixedDeposit = { balance: number; monthsRemaining: number };
type KnowledgeCheck = { question: string; choices: string[]; answer: number; explanation: string };
type ScenarioResponse = 'cash' | 'deposit' | 'borrow' | 'bonus-save' | 'bonus-invest' | 'bonus-debt' | 'hold' | 'sell' | 'buy-more' | 'steady' | 'boost-buffer';
type ScenarioChoice = { id: ScenarioResponse; title: string; detail: string };

const SAVINGS_MONTHLY_RATE = Math.pow(1 + 0.025, 1 / 12) - 1;
const FIXED_DEPOSIT_MONTHLY_RATE = Math.pow(1 + 0.065, 1 / 12) - 1;
const FIXED_DEPOSIT_TERM = 6;
const FIXED_DEPOSIT_EARLY_EXIT_FEE = 0.01;
const INVESTMENT_FEE_RATE = 0.0025;

type GameState = {
  month: number;
  cash: number;
  debt: number;
  fixedDeposits: FixedDeposit[];
  totalInterestEarned: number;
  totalFees: number;
  totalSaved: number;
  totalInvested: number;
  prices: PriceMap;
  previousPrices: PriceMap | null;
  holdings: Holdings;
};

type MonthResult = {
  month: number;
  title: string;
  message: string;
  tone: ResultTone;
  netWorth: number;
};

const assetKeys = Object.keys(MARKET_ASSETS) as AssetKey[];

const assetProfiles: Record<AssetKey, { risk: string; horizon: string; lesson: string }> = {
  NIFTY_50: { risk: 'High', horizon: '5+ years', lesson: 'An index spreads company-specific risk across a basket, but the whole market can still fall.' },
  BLUECHIP: { risk: 'Very high', horizon: '5+ years', lesson: 'One company can rise or fail independently. A familiar brand is not a diversified portfolio.' },
  GOLD: { risk: 'Medium', horizon: '3+ years', lesson: 'Gold may diversify a portfolio, but it pays no interest and its price can move sharply.' },
  GOVT_BOND: { risk: 'Lower in this model', horizon: '1-5 years', lesson: 'Bond prices can change when interest rates change; lower volatility does not mean no risk.' },
};

const lessons = [
  { title: 'Start with money you really have', topic: 'Cash flow', text: 'Your salary is not always the same as your spending money. First, look at what is left after taxes and essentials, then decide what to save or invest.', action: 'Try this: only plan with the cash that actually stays after your monthly needs.' },
  { title: 'Emergency money must stay easy to access', topic: 'Bank accounts', text: 'Keep some money in a simple account you can use anytime. It helps when surprise costs appear and you need quick cash.', action: 'Try this: choose a liquid savings option before locking money away in a fixed deposit.' },
  { title: 'A fixed deposit is safer but less flexible', topic: 'Term deposits', text: 'A fixed deposit often pays more interest than a regular savings account, but it locks your money for a set time. Early withdrawal may cost you a penalty.', action: 'Try this: compare a safe savings account with a six-month deposit.' },
  { title: 'Investments can rise and fall', topic: 'Risk and returns', text: 'Markets move. Sometimes prices go up, and sometimes they drop. A longer timeline can help, but it never guarantees profit.', action: 'Try this: watch how different assets behave over the same month.' },
  { title: 'Do not keep all eggs in one basket', topic: 'Diversification', text: 'If you invest in more than one type of asset, one bad outcome is less likely to hurt everything. Diversification lowers dependence on one result.', action: 'Try this: compare company shares, an index, gold, and bonds in one portfolio.' },
  { title: 'Inflation quietly reduces what your money can buy', topic: 'Purchasing power', text: 'Your money may grow in number, but if prices rise faster than your return, it buys less later. That is inflation at work.', action: 'Try this: compare your balance today with what it can buy after inflation.' },
  { title: 'A loan is a price for time', topic: 'Loan interest', text: 'When you borrow money, you pay extra for using it. The interest rate, term, and fees decide the real cost of the loan.', action: 'Try this: see how a longer loan can make a small payment feel more expensive overall.' },
  { title: 'Borrowing is useful only when managed well', topic: 'Credit', text: 'Debt is not always bad, but it can become stressful if it keeps growing. The goal is to borrow carefully and repay on time.', action: 'Try this: compare a healthy plan with one where debt keeps compounding.' },
  { title: 'Look at the full cost of investing', topic: 'Fees and taxes', text: 'Fees and taxes reduce what you keep. A product with a smaller headline return may still be better after costs are considered.', action: 'Try this: check how transaction fees lower your final result.' },
  { title: 'Protection matters when money shocks happen', topic: 'Insurance and fraud', text: 'Insurance can help cover big losses. And if someone asks for your banking code or OTP, stop and verify before you act.', action: 'Try this: confirm the recipient before sending money.' },
  { title: 'Match the product to the timeline', topic: 'Goals and liquidity', text: 'Short-term needs need safer, more accessible money. Long-term goals can use more time and some market growth.', action: 'Try this: compare cash, deposits, debt, and investments based on when you need the money.' },
  { title: 'High guaranteed returns are a warning sign', topic: 'Scam awareness', text: 'If someone promises very high returns with almost no risk, be careful. Always verify the source before doing anything.', action: 'Complete this lesson: trust facts, not pressure, before you put money into anything risky.' },
];

const knowledgeChecks: KnowledgeCheck[] = [
  { question: 'After rent, food, and bills, what should your plan use?', choices: ['Gross salary', 'Money left after essential costs', 'Your credit limit'], answer: 1, explanation: 'Use the money that is actually left after needs are covered. Do not build a plan on money you have not received yet.' },
  { question: 'Why is a savings account often better for emergency money than a fixed deposit?', choices: ['It is easier to access in a crisis', 'It always earns more', 'It cannot lose value'], answer: 0, explanation: 'Emergency money should be easy to use. A fixed deposit may pay more, but it can also lock your cash away.' },
  { question: 'What is the main trade-off with a fixed deposit?', choices: ['More access and no time limit', 'You may earn more but lose flexibility', 'It becomes a guaranteed profit every time'], answer: 1, explanation: 'A fixed deposit often pays more, but you agree to leave the money there for a set period and may pay a penalty if you withdraw early.' },
  { question: 'An investment falls 15% in one month. What is the simple lesson?', choices: ['It must recover next month', 'Investments can fall even in the short term', 'You should sell everything immediately'], answer: 1, explanation: 'Short-term market moves can be painful, so you should match your investments to your time horizon and risk tolerance.' },
  { question: 'What is the main purpose of diversification?', choices: ['To guarantee profit', 'To reduce dependence on one investment or outcome', 'To avoid every market loss forever'], answer: 1, explanation: 'Diversification spreads money across other options so one loss does not hurt the whole plan as much.' },
  { question: 'Your money grows 3%, but prices rise 6%. What happened?', choices: ['Your buying power fell', 'Your buying power rose 9%', 'Your buying power stayed the same'], answer: 0, explanation: 'Inflation means your cash may rise in number but buy less in real life. That is why inflation matters.' },
  { question: 'What gives the clearest picture of loan cost?', choices: ['Only the monthly payment', 'Total repayment, rate, fees, and term', 'Only the advertised interest rate'], answer: 1, explanation: 'A small EMI can still be expensive if the loan lasts a long time or has high fees.' },
  { question: 'Why is taking a loan only to improve a credit score a bad idea?', choices: ['It can add cost and repayment stress', 'Credit history never matters', 'Every loan helps money grow'], answer: 0, explanation: 'Borrowing for the sake of the score can create debt without solving a real need. It is better to borrow only when useful and manageable.' },
  { question: 'Why should you consider fees and taxes when choosing an investment?', choices: ['They reduce what you keep', 'They always increase returns', 'They remove all risk'], answer: 0, explanation: 'Fees and taxes eat into your gains. The real return matters more than the advertised number.' },
  { question: 'What is insurance mainly for?', choices: ['To guarantee investment growth', 'To protect against major financial shocks', 'To replace all emergency savings'], answer: 1, explanation: 'Insurance helps protect you when unexpected events create large costs. It is financial protection, not a money-making tool.' },
  { question: 'A goal is due in six months. What matters most?', choices: ['The highest advertised return', 'When you need the money and how much risk you can handle', 'What performed best last year'], answer: 1, explanation: 'A short-term goal needs safer choices. A long-term goal can take more risk because it has more time to recover.' },
  { question: 'A stranger promises a very high, guaranteed return. What is the safest response?', choices: ['Invest immediately', 'Verify independently and never share banking codes', 'Share a one-time code to confirm'], answer: 1, explanation: 'High guaranteed returns are a warning sign. Real financial decisions need checking, not pressure or urgency.' },
];

const createInitialGame = (): GameState => ({
  month: 0,
  cash: 25000,
  debt: 0,
  fixedDeposits: [],
  totalInterestEarned: 0,
  totalFees: 0,
  totalSaved: 0,
  totalInvested: 0,
  prices: Object.fromEntries(assetKeys.map((key) => [key, MARKET_ASSETS[key].basePrice])) as PriceMap,
  previousPrices: null,
  holdings: Object.fromEntries(assetKeys.map((key) => [key, 0])) as Holdings,
});

function MoneyQuest({
  monthlyIncome,
  essentialSpend,
  onIncomeChange,
  onEssentialSpendChange,
  onExperienceEarned,
}: {
  monthlyIncome: number;
  essentialSpend: number;
  onIncomeChange: (value: number) => void;
  onEssentialSpendChange: (value: number) => void;
  onExperienceEarned: (points: number) => void;
}) {
  const [game, setGame] = useState(createInitialGame);
  const [monthlySaving, setMonthlySaving] = useState(8000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [monthlyRepayment, setMonthlyRepayment] = useState(0);
  const [bankProduct, setBankProduct] = useState<BankProduct>('savings');
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>('NIFTY_50');
  const [lastResult, setLastResult] = useState<MonthResult | null>(null);
  const [selectedKnowledgeAnswer, setSelectedKnowledgeAnswer] = useState<number | null>(null);
  const [knowledgeAttempted, setKnowledgeAttempted] = useState(false);
  const [knowledgePassed, setKnowledgePassed] = useState(false);
  const [monthRevealed, setMonthRevealed] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<ReturnType<typeof generateMonthlyEvent>>(null);
  const [selectedResponse, setSelectedResponse] = useState<ScenarioResponse | null>(null);
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [history, setHistory] = useState<MonthResult[]>([]);

  const monthlyRoom = monthlyIncome - essentialSpend;
  const flexibleIncome = Math.max(0, monthlyRoom);
  const lifestyleSpend = Math.max(0, flexibleIncome - monthlySaving - monthlyInvestment - monthlyRepayment);
  const portfolioValue = useMemo(
    () => assetKeys.reduce((total, key) => total + game.holdings[key] * game.prices[key], 0),
    [game.holdings, game.prices],
  );
  const fixedDepositBalance = game.fixedDeposits.reduce((total, deposit) => total + deposit.balance, 0);
  const netWorth = game.cash + fixedDepositBalance + portfolioValue - game.debt;
  const inflationAdjustedNetWorth = netWorth / Math.pow(1 + INFLATION_RATE_MONTHLY, game.month);
  const bufferTarget = Math.max(1, essentialSpend * 3);
  const bufferProgress = Math.min(100, (game.cash / bufferTarget) * 100);
  const currentLesson = lessons[Math.min(game.month, lessons.length - 1)];
  const currentKnowledgeCheck = knowledgeChecks[Math.min(game.month, knowledgeChecks.length - 1)];
  const liquidMonths = game.cash / Math.max(1, essentialSpend);
  const heldAssetCount = assetKeys.filter((key) => game.holdings[key] > 0).length;
  const purchasingPowerGap = netWorth - inflationAdjustedNetWorth;
  const overBudget = monthlySaving + monthlyInvestment + monthlyRepayment > flexibleIncome;
  const campaignComplete = game.month === lessons.length;
  const turnStatus = campaignComplete
    ? 'Your year is complete. Start a new campaign to practice another strategy.'
    : monthlyRoom < 0
      ? 'Your essential costs exceed take-home pay. Adjust the income or essential-cost sliders first.'
      : overBudget
        ? 'Your plan is above the available amount. Reduce goals, investing, or debt repayment to continue.'
        : !monthRevealed
          ? `Your plan is ready. Begin month ${game.month + 1} to discover a life event. The lesson checkpoint is optional practice for bonus XP.`
          : !selectedResponse
            ? 'Event revealed. Choose a response to see how it affects your money.'
            : 'Decision selected. Resolve the month to apply its financial consequences.';
    const scenarioChoices: ScenarioChoice[] = !monthRevealed
      ? []
      : pendingEvent && 'cost' in pendingEvent
        ? [
          { id: 'cash', title: 'Use liquid cash first', detail: `Pay up to ${money.format(game.cash)} from cash. Any shortfall becomes debt; fixed deposits stay locked.` },
          { id: 'deposit', title: 'Use cash, then break deposits', detail: `Use available cash, then redeem fixed deposits with the model’s 1% early-exit penalty. Any remaining shortfall becomes debt. Current deposits: ${money.format(fixedDepositBalance)}.` },
          { id: 'borrow', title: 'Borrow for the full cost', detail: `Keep your cash and deposits, but add ${money.format(pendingEvent.cost ?? 0)} to debt. Interest continues in later months.` },
        ]
        : pendingEvent && 'amount' in pendingEvent
          ? [
            { id: 'bonus-save', title: 'Add bonus to liquid savings', detail: `Keep all ${money.format(pendingEvent.amount ?? 0)} accessible for emergencies and near-term needs.` },
            { id: 'bonus-invest', title: `Invest bonus in ${MARKET_ASSETS[selectedAsset].name}`, detail: `Invest the bonus after the model’s ${ (INVESTMENT_FEE_RATE * 100).toFixed(2) }% purchase fee. Value can rise or fall.` },
            { id: 'bonus-debt', title: 'Pay down debt first', detail: game.debt > 0 ? `Use the bonus to reduce your ${money.format(game.debt)} debt; any leftover goes to cash.` : 'You have no debt, so this choice adds the bonus to liquid savings.' },
          ]
          : pendingEvent?.type === 'MARKET_CRASH'
            ? [
              { id: 'hold', title: 'Stay invested through the fall', detail: 'Keep your holdings. The market may recover or fall further; no outcome is guaranteed.' },
              { id: 'sell', title: 'Sell the portfolio after the drop', detail: 'Turn current holdings into cash at this month’s modeled prices and lock in the simulated loss or gain.' },
              ...(lifestyleSpend >= 5000 ? [{ id: 'buy-more' as const, title: 'Invest ₹5,000 more from lifestyle money', detail: `Buy more ${MARKET_ASSETS[selectedAsset].name} units at this month’s modeled price. This reduces lifestyle spending.` }] : []),
            ]
            : [
              { id: 'steady', title: 'Keep the plan as it is', detail: 'Continue your chosen saving, investment, and spending plan. No surprise event occurred this month.' },
              ...(lifestyleSpend >= 5000 ? [{ id: 'boost-buffer' as const, title: 'Move ₹5,000 to emergency cash', detail: 'Use part of this month’s lifestyle amount to strengthen your liquid reserve.' }] : []),
            ];
  const reportCsv = useMemo(() => {
    const rows = [
      ['Money Quest campaign report'],
      ['Months completed', String(game.month)],
      ['Knowledge checks correct', `${knowledgeScore}/12`],
      ['Liquid bank balance', money.format(game.cash)],
      ['Fixed deposits', money.format(fixedDepositBalance)],
      ['Investment portfolio', money.format(portfolioValue)],
      ['Total contributed to investments', money.format(game.totalInvested)],
      ['Debt remaining', money.format(game.debt)],
      ['Bank interest earned', money.format(game.totalInterestEarned)],
      ['Fees and penalties paid', money.format(game.totalFees)],
      ['Nominal net position', money.format(netWorth)],
      ['Inflation-adjusted net position', money.format(inflationAdjustedNetWorth)],
      [],
      ['Month', 'Event', 'Net position', 'What happened'],
      ...[...history].reverse().map((item) => [String(item.month), item.title, money.format(item.netWorth), item.message]),
    ];
    return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  }, [fixedDepositBalance, game, history, inflationAdjustedNetWorth, knowledgeScore, netWorth, portfolioValue]);

  const resetCampaign = () => {
    setGame(createInitialGame());
    setMonthlySaving(8000);
    setMonthlyInvestment(5000);
    setMonthlyRepayment(0);
    setBankProduct('savings');
    setSelectedAsset('NIFTY_50');
    setLastResult(null);
    setSelectedKnowledgeAnswer(null);
    setKnowledgeAttempted(false);
    setKnowledgePassed(false);
    setMonthRevealed(false);
    setPendingEvent(null);
    setSelectedResponse(null);
    setKnowledgeScore(0);
    setHistory([]);
  };

  const submitKnowledgeAnswer = () => {
    if (selectedKnowledgeAnswer === null || knowledgePassed) return;
    setKnowledgeAttempted(true);
    if (selectedKnowledgeAnswer === currentKnowledgeCheck.answer) {
      setKnowledgePassed(true);
      setKnowledgeScore((score) => score + 1);
      onExperienceEarned(10);
    }
  };

  const revealMonth = () => {
    if (monthlyRoom < 0 || overBudget || monthRevealed) return;
    setPendingEvent(generateMonthlyEvent(game.month));
    setSelectedResponse(null);
    setMonthRevealed(true);
  };

  const resolveMonth = () => {
    if (campaignComplete) {
      resetCampaign();
      return;
    }

    if (monthlyRoom < 0 || overBudget || !monthRevealed || !selectedResponse) return;

    const event = pendingEvent;
    const nextPrices = tickMarket(
      game.prices,
      event?.type === 'MARKET_CRASH' ? event.impact : 1,
    ) as PriceMap;
    const nextHoldings = { ...game.holdings };
    let investmentFees = monthlyInvestment * INVESTMENT_FEE_RATE;
    let investedThisMonth = monthlyInvestment;
    let extraInvestmentNote = '';
    const investmentFee = investmentFees;
    const investedAfterFee = monthlyInvestment - investmentFee;
    nextHoldings[selectedAsset] += investedAfterFee / game.prices[selectedAsset];

    const savingsInterest = game.cash * SAVINGS_MONTHLY_RATE;
    let interestEarned = savingsInterest;
    let cash = game.cash + savingsInterest;
    let fixedDeposits: FixedDeposit[] = [];
    let maturedDeposits = 0;

    game.fixedDeposits.forEach((deposit) => {
      const interest = deposit.balance * FIXED_DEPOSIT_MONTHLY_RATE;
      interestEarned += interest;
      const balance = deposit.balance + interest;
      if (deposit.monthsRemaining <= 1) {
        cash += balance;
        maturedDeposits += balance;
      } else {
        fixedDeposits.push({ balance, monthsRemaining: deposit.monthsRemaining - 1 });
      }
    });

    if (bankProduct === 'savings') {
      cash += monthlySaving;
    } else if (monthlySaving > 0) {
      fixedDeposits.push({ balance: monthlySaving, monthsRemaining: FIXED_DEPOSIT_TERM });
    }

    let debt = Math.max(0, game.debt + Math.round(game.debt * 0.015) - monthlyRepayment);
    let title = 'A steady month';
    let message = 'No surprise event this month. Your planned saving and investing stayed on track.';
    let tone: ResultTone = 'steady';
    let earlyExitPenalty = 0;

    if (event && typeof event.cost === 'number') {
      title = event.title;
      if (selectedResponse === 'borrow') {
        debt += event.cost;
        message = `${event.msg} You chose to borrow the full cost, preserving cash and deposits but adding ${money.format(event.cost)} to debt.`;
        tone = 'warning';
      } else {
        const covered = Math.min(cash, event.cost);
        cash -= covered;
        let remainingShortfall = event.cost - covered;
        let depositCoverage = 0;
        if (selectedResponse === 'deposit') {
          const retainedDeposits: FixedDeposit[] = [];
          fixedDeposits.forEach((deposit) => {
            if (remainingShortfall <= 0) {
              retainedDeposits.push(deposit);
              return;
            }
            const availableAfterPenalty = deposit.balance * (1 - FIXED_DEPOSIT_EARLY_EXIT_FEE);
            const used = Math.min(remainingShortfall, availableAfterPenalty);
            const redeemedBalance = used / (1 - FIXED_DEPOSIT_EARLY_EXIT_FEE);
            earlyExitPenalty += redeemedBalance - used;
            remainingShortfall -= used;
            depositCoverage += used;
            const unredeemedBalance = deposit.balance - redeemedBalance;
            if (unredeemedBalance > 0.01) retainedDeposits.push({ ...deposit, balance: unredeemedBalance });
          });
          fixedDeposits = retainedDeposits;
        }
        debt += remainingShortfall;
        message = `${event.msg} You chose ${selectedResponse === 'deposit' ? 'cash, then fixed deposits' : 'liquid cash only'}. Cash covered ${money.format(covered)}${depositCoverage > 0 ? `; deposits covered ${money.format(depositCoverage)} with a ${money.format(earlyExitPenalty)} early-exit penalty` : ''}${remainingShortfall > 0 ? `; ${money.format(remainingShortfall)} became debt` : ''}.`;
        tone = remainingShortfall > 0 ? 'warning' : 'good';
      }
    } else if (event && typeof event.amount === 'number') {
      title = event.title;
      if (selectedResponse === 'bonus-invest') {
        const fee = event.amount * INVESTMENT_FEE_RATE;
        investmentFees += fee;
        investedThisMonth += event.amount;
        nextHoldings[selectedAsset] += (event.amount - fee) / game.prices[selectedAsset];
        message = `${event.msg} You invested the bonus in ${MARKET_ASSETS[selectedAsset].name}; the purchase fee was ${money.format(fee)}.`;
      } else if (selectedResponse === 'bonus-debt' && debt > 0) {
        const paid = Math.min(event.amount, debt);
        debt -= paid;
        cash += event.amount - paid;
        message = `${event.msg} You used ${money.format(paid)} to reduce debt${event.amount > paid ? ` and saved the remaining ${money.format(event.amount - paid)}` : ''}.`;
      } else {
        cash += event.amount;
        message = `${event.msg} You chose to add the bonus to accessible cash.`;
      }
      tone = selectedResponse === 'bonus-debt' || selectedResponse === 'bonus-save' ? 'good' : 'steady';
    } else if (event?.type === 'MARKET_CRASH') {
      title = event.title;
      if (selectedResponse === 'sell') {
        const saleValue = assetKeys.reduce((total, key) => total + nextHoldings[key] * nextPrices[key], 0);
        cash += saleValue;
        assetKeys.forEach((key) => { nextHoldings[key] = 0; });
        message = `${event.msg} You sold the portfolio for ${money.format(saleValue)} at the modeled post-drop prices. The market loss is now realized in this simulation.`;
        tone = 'warning';
      } else if (selectedResponse === 'buy-more') {
        const extraAmount = 5000;
        const fee = extraAmount * INVESTMENT_FEE_RATE;
        investmentFees += fee;
        investedThisMonth += extraAmount;
        nextHoldings[selectedAsset] += (extraAmount - fee) / nextPrices[selectedAsset];
        extraInvestmentNote = ` You also invested an extra ${money.format(extraAmount)} from lifestyle spending after the price drop; fee ${money.format(fee)}.`;
        message = `${event.msg} You stayed invested and bought extra units at this month’s modeled lower price.`;
        tone = 'warning';
      } else {
        message = `${event.msg} You chose to stay invested; the portfolio value changed, but no units were sold.`;
        tone = 'warning';
      }
    } else if (selectedResponse === 'boost-buffer') {
      cash += 5000;
      title = 'A steady month · stronger reserve';
      message = 'No surprise event occurred. You moved ₹5,000 from lifestyle spending into your accessible emergency cash.';
      tone = 'good';
    }

    const planNotes = [
      bankProduct === 'savings'
        ? `You added ${money.format(monthlySaving)} to liquid savings.`
        : `You locked ${money.format(monthlySaving)} in a six-month fixed deposit.`,
      `Bank interest this month: ${money.format(interestEarned)}${maturedDeposits > 0 ? `; ${money.format(maturedDeposits)} in fixed deposits matured and returned to liquid cash` : ''}.`,
      monthlyInvestment > 0
        ? `${money.format(investedAfterFee)} went into ${MARKET_ASSETS[selectedAsset].name}; purchase fee ${money.format(investmentFee)}.`
        : 'No investment purchase this month.',
      extraInvestmentNote,
      monthlyRepayment > 0 ? `Debt payment: ${money.format(monthlyRepayment)}.` : '',
    ].filter(Boolean);
    message = `${message} ${planNotes.join(' ')}`;

    const nextGame: GameState = {
      month: game.month + 1,
      cash,
      debt,
      fixedDeposits,
      totalInterestEarned: game.totalInterestEarned + interestEarned,
      totalFees: game.totalFees + investmentFees + earlyExitPenalty,
      totalSaved: game.totalSaved + monthlySaving,
      totalInvested: game.totalInvested + investedThisMonth,
      prices: nextPrices,
      previousPrices: game.prices,
      holdings: nextHoldings,
    };
    const nextPortfolio = assetKeys.reduce(
      (total, key) => total + nextHoldings[key] * nextPrices[key],
      0,
    );
    const result: MonthResult = {
      month: nextGame.month,
      title,
      message,
      tone,
      netWorth: cash + fixedDeposits.reduce((total, deposit) => total + deposit.balance, 0) + nextPortfolio - debt,
    };

    setGame(nextGame);
    onExperienceEarned(15);
    setLastResult(result);
    setSelectedKnowledgeAnswer(null);
    setKnowledgeAttempted(false);
    setKnowledgePassed(false);
    setMonthRevealed(false);
    setPendingEvent(null);
    setSelectedResponse(null);
    setHistory((items) => [result, ...items].slice(0, lessons.length));
  };

  return (
    <section className="section-block money-quest" id="quest" aria-labelledby="quest-title">
      <div className="quest-heading">
        <div>
          <span className="section-tag"><Sparkles size={14} /> Interactive campaign</span>
          <h2 id="quest-title">Money moves. Life happens. What’s your plan?</h2>
          <p>Play through one year of choices, market swings, and real-world money lessons.</p>
        </div>
        <div className="quest-season"><Clock3 size={16} /> 12 months · 12 lessons</div>
      </div>

      <div className="quest-progress-row">
        <div>
          <strong>{campaignComplete ? 'Campaign complete' : `Month ${String(Math.min(game.month + 1, 12)).padStart(2, '0')} of 12`}</strong>
          <span>{game.month} {game.month === 1 ? 'month' : 'months'} played · {knowledgeScore}/12 checks correct</span>
        </div>
        <div className="quest-progress" role="progressbar" aria-label="Campaign progress" aria-valuemin={0} aria-valuemax={12} aria-valuenow={game.month}>
          <span style={{ width: `${(game.month / 12) * 100}%` }} />
        </div>
        <button type="button" className="quest-reset" onClick={resetCampaign} aria-label="Reset campaign" title="Reset campaign">
          <RotateCcw size={17} />
        </button>
      </div>

      <div className="quest-layout">
        <div className="quest-play-area">
          <div className="quest-metrics">
            <div className="quest-metric">
              <span>Bank balance</span>
              <strong>{money.format(game.cash)}</strong>
              <div className="quest-mini-track"><span style={{ width: `${bufferProgress}%` }} /></div>
              <small>{(game.cash / Math.max(1, essentialSpend)).toFixed(1)} months liquid · {money.format(game.totalInterestEarned)} interest earned</small>
            </div>
            <div className="quest-metric">
              <span>Fixed deposits</span>
              <strong>{money.format(fixedDepositBalance)}</strong>
              <small>{game.fixedDeposits.length ? `${game.fixedDeposits.length} active · six-month lock` : 'No locked deposits'}</small>
            </div>
            <div className="quest-metric quest-net-worth">
              <span>Net position</span>
              <strong>{money.format(netWorth)}</strong>
              <small>Inflation-adjusted {money.format(inflationAdjustedNetWorth)} · Debt {money.format(game.debt)}</small>
            </div>
          </div>

          <div className="quest-investment-summary">
            <div><span>Portfolio value</span><strong>{money.format(portfolioValue)}</strong></div>
            <div><span>Total invested</span><strong>{money.format(game.totalInvested)}</strong></div>
            <div><span>Fees paid</span><strong>{money.format(game.totalFees)}</strong></div>
            <div><span>Debt cost this turn</span><strong>{game.debt > 0 ? `${money.format(game.debt)} balance` : 'No debt'}</strong></div>
          </div>

          <div className="quest-decision-area">
            <div className="quest-subhead">
              <div>
                <span className="quest-step">Your starting point</span>
                <h3>Set the month’s money plan</h3>
              </div>
              <span className="quest-currency">INR · monthly</span>
            </div>

            <div className="quest-scenario-controls">
              <label>
                <span>Take-home pay <strong>{money.format(monthlyIncome)}</strong></span>
                <input type="range" min="20000" max="200000" step="5000" value={monthlyIncome} disabled={monthRevealed} onChange={(event) => onIncomeChange(Number(event.target.value))} />
              </label>
              <label>
                <span>Essential costs <strong>{money.format(essentialSpend)}</strong></span>
                <input type="range" min="10000" max="150000" step="5000" value={essentialSpend} disabled={monthRevealed} onChange={(event) => onEssentialSpendChange(Number(event.target.value))} />
              </label>
            </div>

            <div className="quest-available">
              <span>Available after essentials</span>
              <strong className={monthlyRoom < 0 ? 'negative' : ''}>{money.format(monthlyRoom)}</strong>
              {monthlyRoom < 0 && <small>Costs exceed income. Adjust the plan before continuing.</small>}
            </div>

            <div className="quest-allocation-controls">
              <label>
                <span>Put aside for goals <strong>{money.format(monthlySaving)}</strong></span>
                <input type="range" min="0" max={flexibleIncome} step="1000" value={Math.min(monthlySaving, flexibleIncome)} disabled={monthRevealed} onChange={(event) => setMonthlySaving(Number(event.target.value))} />
              </label>
              <label>
                <span>Invest for later <strong>{money.format(monthlyInvestment)}</strong></span>
                <input type="range" min="0" max={flexibleIncome} step="1000" value={Math.min(monthlyInvestment, flexibleIncome)} disabled={monthRevealed} onChange={(event) => setMonthlyInvestment(Number(event.target.value))} />
              </label>
            </div>

            <div className="quest-asset-picker" role="group" aria-label="Choose an investment for this month">
              <span className="quest-field-title">Choose where this month’s investment goes</span>
              <div className="quest-asset-options">
                {assetKeys.map((key) => (
                  <button
                    type="button"
                    key={key}
                    className={selectedAsset === key ? 'quest-asset active' : 'quest-asset'}
                    aria-pressed={selectedAsset === key}
                    disabled={monthRevealed}
                    onClick={() => setSelectedAsset(key)}
                  >
                    <strong>{MARKET_ASSETS[key].name}</strong>
                    <small>{MARKET_ASSETS[key].type} · {assetProfiles[key].risk} risk</small>
                  </button>
                ))}
              </div>
              <div className="quest-asset-explainer">
                <strong>{assetProfiles[selectedAsset].horizon} horizon</strong>
                <span>{assetProfiles[selectedAsset].lesson}</span>
              </div>
            </div>

            <div className="quest-bank-picker" role="group" aria-label="Choose a bank savings product">
              <div className="quest-subhead">
                <div><span className="quest-step">Banking decision</span><h3>Where should savings live?</h3></div>
                <Landmark size={19} />
              </div>
              <div className="quest-bank-options">
                <button type="button" className={bankProduct === 'savings' ? 'quest-bank-option active' : 'quest-bank-option'} aria-pressed={bankProduct === 'savings'} disabled={monthRevealed} onClick={() => setBankProduct('savings')}>
                  <span><strong>Liquid savings account</strong><small>Illustrative 2.5% annual interest · withdraw anytime</small></span>
                  <Percent size={17} />
                </button>
                <button type="button" className={bankProduct === 'fixed' ? 'quest-bank-option active' : 'quest-bank-option'} aria-pressed={bankProduct === 'fixed'} disabled={monthRevealed} onClick={() => setBankProduct('fixed')}>
                  <span><strong>Six-month fixed deposit</strong><small>Illustrative 6.5% annual interest · early break costs 1%</small></span>
                  <Clock3 size={17} />
                </button>
              </div>
              <p className="quest-disclaimer">Practice rates only. Actual rates, deposit protection, tax, and account terms vary by provider and location.</p>
            </div>

            {game.debt > 0 && (
              <div className="quest-debt-control">
                <label>
                  <span>Extra debt payment this month <strong>{money.format(monthlyRepayment)}</strong></span>
                  <input type="range" min="0" max={Math.min(game.debt, flexibleIncome)} step="1000" value={Math.min(monthlyRepayment, game.debt, flexibleIncome)} disabled={monthRevealed} onChange={(event) => setMonthlyRepayment(Number(event.target.value))} />
                </label>
                <small>Outstanding debt grows by 1.5% per turn in this simplified model. Payments reduce the balance after interest.</small>
              </div>
            )}

            <div className="quest-allocation-summary">
              <div className="quest-allocation-bar" aria-hidden="true">
                <span className="allocation-saving" style={{ width: `${flexibleIncome ? (monthlySaving / flexibleIncome) * 100 : 0}%` }} />
                <span className="allocation-investing" style={{ width: `${flexibleIncome ? (monthlyInvestment / flexibleIncome) * 100 : 0}%` }} />
                <span className="allocation-lifestyle" style={{ width: `${flexibleIncome ? (lifestyleSpend / flexibleIncome) * 100 : 0}%` }} />
              </div>
              <div className="quest-allocation-legend">
                <span><i className="allocation-saving" /> Goals {money.format(monthlySaving)}</span>
                <span><i className="allocation-investing" /> Invest {money.format(monthlyInvestment)}</span>
                {monthlyRepayment > 0 && <span><i className="allocation-debt" /> Debt {money.format(monthlyRepayment)}</span>}
                <span><i className="allocation-lifestyle" /> Lifestyle {money.format(lifestyleSpend)}</span>
              </div>
            </div>

            {monthRevealed && (
              <div className="quest-event-stage" aria-live="polite">
                <div className="quest-event-heading">
                  <span className="quest-step">Month {game.month + 1} · Decision moment</span>
                  <h3>{pendingEvent?.title ?? 'A steady month'}</h3>
                  <p>{pendingEvent?.msg ?? 'No surprise event appeared. You can stay with your plan or strengthen your emergency reserve.'}</p>
                  <small className="quest-event-plan-lock">Your monthly plan is locked while you make this decision.</small>
                </div>
                <div className="quest-event-choices" role="group" aria-label="Choose how to respond to this month's event">
                  {scenarioChoices.map((choice) => (
                    <button
                      type="button"
                      key={choice.id}
                      className={selectedResponse === choice.id ? 'quest-event-choice active' : 'quest-event-choice'}
                      aria-pressed={selectedResponse === choice.id}
                      onClick={() => setSelectedResponse(choice.id)}
                    >
                      <span className="quest-event-radio" aria-hidden="true">{selectedResponse === choice.id && <BadgeCheck size={14} />}</span>
                      <span className="quest-event-choice-copy"><strong>{choice.title}</strong><small>{choice.detail}</small></span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
                {selectedResponse && <p className="quest-event-confirmation">Decision selected. You can still change it before resolving the month.</p>}
              </div>
            )}

            <div className="quest-turn-footer">
              <div className="quest-turn-status" id="quest-turn-help" aria-live="polite">
                <strong>{turnStatus}</strong>
                <span>Bank interest: {bankProduct === 'fixed' ? '6.5% fixed' : '2.5% liquid'} · practice rates and returns only.</span>
              </div>
              <button type="button" className="primary-btn quest-turn-button" aria-describedby="quest-turn-help" onClick={monthRevealed ? resolveMonth : revealMonth} disabled={((monthlyRoom < 0 || overBudget || (monthRevealed && !selectedResponse)) && !campaignComplete)}>
                {campaignComplete ? 'Play again' : monthRevealed ? `Resolve month ${game.month + 1}` : `Begin month ${game.month + 1}`}
                {campaignComplete ? <RotateCcw size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>

          <div className={`quest-result ${lastResult ? `tone-${lastResult.tone}` : 'tone-steady'}`} aria-live="polite">
            <div className="quest-result-icon">{lastResult?.tone === 'warning' ? <TrendingDown size={19} /> : <BadgeCheck size={19} />}</div>
            <div>
              <span>{lastResult ? `Month ${String(lastResult.month).padStart(2, '0')} · Result` : 'Your first month is ready'}</span>
              <strong>{lastResult?.title ?? 'Make a plan, then see what life brings.'}</strong>
              <p>{lastResult?.message ?? 'Your run starts with ₹25,000 in reserve. Choose how to use the money left after essentials.'}</p>
            </div>
          </div>

          {campaignComplete && (
            <div className="quest-debrief" aria-labelledby="quest-debrief-title">
              <div className="quest-debrief-heading">
                <div>
                  <span className="quest-step">Your year, decoded · {knowledgeScore}/12 checkpoints</span>
                  <h3 id="quest-debrief-title">The choices behind your outcome</h3>
                  <p>Not just a final balance: here is what your strategy protected, paid, and put at risk.</p>
                </div>
                <a className="quest-report-button" href={`data:text/csv;charset=utf-8,${encodeURIComponent(reportCsv)}`} download="money-quest-campaign-report.csv">
                  <Download size={16} /> Export report
                </a>
              </div>
              <div className="quest-debrief-metrics">
                <div><span>Liquid runway</span><strong>{liquidMonths.toFixed(1)} months</strong><small>how long cash could cover essential costs</small></div>
                <div><span>Portfolio change</span><strong>{money.format(portfolioValue - game.totalInvested)}</strong><small>value minus contributions</small></div>
                <div><span>Interest earned</span><strong>{money.format(game.totalInterestEarned)}</strong><small>bank account and active deposits</small></div>
                <div><span>Fees paid</span><strong>{money.format(game.totalFees)}</strong><small>investment fees and deposit penalties</small></div>
                <div><span>Net position</span><strong>{money.format(netWorth)}</strong><small>today’s rupees</small></div>
                <div><span>Buying-power gap</span><strong>{money.format(purchasingPowerGap)}</strong><small>nominal vs. inflation-adjusted</small></div>
              </div>
              <div className="quest-debrief-insights">
                <strong><Sparkles size={16} /> What your run suggests</strong>
                <p>{liquidMonths < 3
                  ? `Your ending cash covers ${liquidMonths.toFixed(1)} months of essentials. A next practice run could prioritize a more accessible emergency reserve before locking money away.`
                  : `Your ending cash covers ${liquidMonths.toFixed(1)} months of essentials, giving the plan a meaningful liquid buffer.`}</p>
                <p>{game.debt > 0
                  ? `You ended with ${money.format(game.debt)} in debt. Try directing more monthly surplus to repayment and compare the interest cost.`
                  : 'You finished with no outstanding debt. Compare this run with one that uses borrowing to see how interest changes the outcome.'}</p>
                <p>{heldAssetCount < 2
                  ? 'Your investment contributions ended in one asset type. A diversified mix can reduce dependence on one market outcome, though it cannot remove risk.'
                  : `Your contributions reached ${heldAssetCount} asset types. Compare their different risks and remember that diversification does not guarantee gains.`}</p>
              </div>
            </div>
          )}
        </div>

        <aside className="quest-learning" aria-label="Lessons and campaign progress">
          <div className="quest-lesson">
            <div className="quest-lesson-top"><BookOpenText size={18} /><span>{currentLesson.topic} · Lesson {Math.min(game.month + 1, 12)} of 12</span></div>
            <h3>{currentLesson.title}</h3>
            <p>{currentLesson.text}</p>
            <strong>{currentLesson.action}</strong>
          </div>

          {!campaignComplete && (
            <div className="quest-knowledge-check">
              <div className="quest-subhead">
                <div><span className="quest-step">Optional · +10 XP · {Math.min(game.month + 1, 12)} of 12</span><h3>Make the money call</h3></div>
                <BookOpenText size={19} />
              </div>
              <p className="quest-question">{currentKnowledgeCheck.question}</p>
              <div className="quest-answer-options" role="group" aria-label="Answer choices">
                {currentKnowledgeCheck.choices.map((choice, index) => (
                  <button
                    type="button"
                    key={choice}
                    className={selectedKnowledgeAnswer === index ? 'quest-answer active' : 'quest-answer'}
                    aria-pressed={selectedKnowledgeAnswer === index}
                    disabled={knowledgePassed}
                    onClick={() => {
                      setSelectedKnowledgeAnswer(index);
                      setKnowledgeAttempted(false);
                    }}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>{choice}
                  </button>
                ))}
              </div>
              <p className="quest-optional-hint">Play the month whenever you’re ready. Answer this checkpoint for feedback and bonus XP.</p>
              {selectedKnowledgeAnswer !== null && knowledgeAttempted && (
                <div className={knowledgePassed ? 'quest-answer-feedback correct' : 'quest-answer-feedback'} aria-live="polite">
                  <strong>{knowledgePassed ? 'Correct. Checkpoint cleared.' : `Not quite. The best answer is: ${currentKnowledgeCheck.choices[currentKnowledgeCheck.answer]}`}</strong>
                  <p>{currentKnowledgeCheck.explanation}</p>
                </div>
              )}
              <button type="button" className="quest-check-answer" onClick={submitKnowledgeAnswer} disabled={selectedKnowledgeAnswer === null || knowledgePassed}>
                {knowledgePassed ? 'Ready for the next month' : 'Check answer'}
              </button>
            </div>
          )}

          <div className="quest-market">
            <div className="quest-subhead">
              <div><span className="quest-step">Market watch</span><h3>Four assets, four stories</h3></div>
              <CircleDollarSign size={19} />
            </div>
            {assetKeys.map((key) => {
              const change = game.previousPrices
                ? ((game.prices[key] / game.previousPrices[key]) - 1) * 100
                : null;
              const holdingValue = game.holdings[key] * game.prices[key];
              return (
                <div className="quest-market-row" key={key}>
                  <div>
                    <strong>{MARKET_ASSETS[key].name}</strong>
                    <small>{money.format(game.prices[key])} per unit · held {money.format(holdingValue)}</small>
                  </div>
                  <span className={change === null ? 'market-change' : change >= 0 ? 'market-change up' : 'market-change down'}>
                    {change === null ? 'START' : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                  </span>
                </div>
              );
            })}
            <p className="quest-disclaimer">Illustrative market simulation, not a forecast or investment recommendation.</p>
          </div>

          <div className="quest-principles">
            <div className="quest-subhead"><div><span className="quest-step">Your money map</span><h3>Four rules worth keeping</h3></div></div>
            <div><strong>Liquidity</strong><span>Can you access the money when needed?</span></div>
            <div><strong>Risk</strong><span>Could the value fall before your goal?</span></div>
            <div><strong>Cost</strong><span>What do interest, fees, and penalties take?</span></div>
            <div><strong>Time</strong><span>Does the product fit when you need the money?</span></div>
          </div>

          <div className="quest-achievements">
            <div className="quest-subhead"><div><span className="quest-step">Milestones</span><h3>Skills you’re building</h3></div><ShieldCheck size={19} /></div>
            <div className="quest-badges">
              <span className={game.totalSaved > 0 ? 'earned' : ''}><BadgeCheck size={15} /> Pay yourself first</span>
              <span className={portfolioValue > 0 ? 'earned' : ''}><TrendingUp size={15} /> First investment</span>
              <span className={game.cash >= bufferTarget ? 'earned' : ''}><ShieldCheck size={15} /> 3-month cushion</span>
              <span className={knowledgeScore > 0 ? 'earned' : ''}><BookOpenText size={15} /> {knowledgeScore}/12 knowledge checks</span>
              <span className={campaignComplete ? 'earned' : ''}><Sparkles size={15} /> Full year played</span>
            </div>
          </div>

          <div className="quest-history">
            <div className="quest-subhead"><div><span className="quest-step">Recent turns</span><h3>Campaign log</h3></div></div>
            {history.length === 0 ? (
              <p className="quest-empty-log">Your month-by-month story will appear here.</p>
            ) : history.slice(0, 4).map((item) => (
              <div className="quest-history-row" key={item.month}>
                <span>Month {String(item.month).padStart(2, '0')}</span>
                <strong>{item.title}</strong>
                <small>Net position {money.format(item.netWorth)}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default MoneyQuest;