import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, BadgeCheck, Banknote, BookOpenText, BriefcaseBusiness,
  Calculator, Check, ChevronRight, CircleDollarSign, Clock3, Coffee, Flame,
  Gem, Heart, Landmark, LockKeyhole, Play, RotateCcw, ShieldCheck,
  Sparkles, Star, Target, Timer, Trophy, TrendingUp, Users, WalletCards,
} from 'lucide-react';
import { CharacterAvatar, CharacterLineup } from './CharacterStudio';
import {
  addStudyMinutes, claimReward, completeLearningNode, readProfile,
  saveProfile, toggleReaction, type LearnerProfile,
} from './profileStore';
import { calculatePortfolioStressTest } from './SimulationEngine';
import './AcademyPages.css';

const lessonPath = [
  { id: 'vault-liquidity', section: '01 · The Liquidity Fortress', title: 'Checking or savings?', tag: 'Banking basics', icon: Landmark, checkpoint: false, intro: 'Every account has a job. Checking supports frequent spending, while savings may pay interest in exchange for different access or terms.', detail: 'Compare fees, withdrawal access, minimum balances, and how interest is calculated. Rates and protections depend on the real institution, product, and local rules.', action: 'Match account access to when the simulated money is needed.', question: 'Which quality matters most for money needed for an urgent bill?', answers: ['Reliable access', 'The longest lock-in', 'A bonus rate with extra conditions'], correct: 0, explanation: 'Liquidity is how readily money can be accessed. A high displayed rate cannot help if the money is unavailable.' },
  { id: 'vault-compare', section: '01 · The Liquidity Fortress', title: 'Open the vault carefully', tag: 'Account choices', icon: WalletIcon, checkpoint: false, intro: 'A headline rate is only one part of an account. Fees, eligibility, access rules, and rate conditions can change the result.', detail: 'Compare fictional accounts by subtracting fees and checking withdrawal rules. The simulated rates are examples, not offers or promises.', action: 'Read the conditions before comparing the simulated return.', question: 'Two fictional accounts have the same rate. What else should you compare?', answers: ['Fees and access rules', 'The color of the app', 'The account name alone'], correct: 0, explanation: 'Costs and restrictions affect whether the account fits its intended purpose.' },
  { id: 'vault-runway', section: '01 · The Liquidity Fortress', title: 'Build the emergency runway', tag: 'Unit checkpoint', icon: ShieldCheck, checkpoint: true, intro: 'An emergency reserve is a buffer for unexpected expenses. Its useful size depends on essential costs, access to support, and the situation being simulated.', detail: 'In this example, ₹30,000 in liquid cash covers about 3 months when essential expenses are ₹10,000 per month. This is a learning scenario, not a personal target.', action: 'Estimate the reserve runway using virtual numbers.', question: 'A simulation has ₹30,000 liquid cash and ₹10,000 monthly essential expenses. How long could the reserve cover?', answers: ['About 1 month', 'About 3 months', 'About 10 months'], correct: 1, explanation: 'The reserve covers about 3 months of the simulated essential expenses.' },
  { id: 'court-apr', section: '02 · The APR Courtroom', title: 'Put APR on the stand', tag: 'Credit basics', icon: Banknote, checkpoint: false, intro: 'APR describes an annualized borrowing cost. A simple example shows why revolving balances can grow, though actual issuer calculations differ.', detail: 'At a simulated 24.99% APR, a ₹1,000 balance carries about ₹20.83 in estimated interest for one month, before payments and issuer-specific terms.', action: 'Separate the amount borrowed from the cost of carrying it.', question: 'In this simplified example, what is one month’s estimated interest on ₹1,000 at 24% APR?', answers: ['About ₹2', 'About ₹20', 'About ₹240'], correct: 1, explanation: 'The estimate is about ₹20 for one month. Actual card calculations depend on the issuer and account terms.' },
  { id: 'court-minimum', section: '02 · The APR Courtroom', title: 'The minimum-payment maze', tag: 'Compounding', icon: Calculator, checkpoint: false, intro: 'Paying a minimum may keep an account current under its terms, but the unpaid balance can continue to accrue interest.', detail: 'Actual payment formulas depend on the issuer and jurisdiction. In this simulation, compare total interest and payoff time rather than just the first payment.', action: 'Notice how a smaller payment can extend a simulated repayment timeline.', question: 'Why can paying only a card’s minimum cost more over time?', answers: ['A remaining balance may keep accruing interest', 'Minimum payments erase all interest', 'The balance stops changing'], correct: 0, explanation: 'When a balance remains, interest may continue under the card agreement, extending repayment.' },
  { id: 'court-repay', section: '02 · The APR Courtroom', title: 'Choose a repayment route', tag: 'Unit checkpoint', icon: Target, checkpoint: true, intro: 'Repayment scenarios show the tradeoff between cash flow today and simulated interest over time.', detail: 'This checkpoint uses virtual numbers only. Real credit agreements include terms and rules that this simplified classroom model does not capture.', action: 'Compare repayment cost while protecting essential spending in the scenario.', question: 'Which choice generally reduces interest on a simulated revolving balance?', answers: ['Pay more than the minimum when possible', 'Pay only the minimum forever', 'Add new purchases to the balance'], correct: 0, explanation: 'A larger payment can reduce the balance used to calculate future interest, depending on the agreement.' },
  { id: 'voyage-risk', section: '03 · The Volatility Voyage', title: 'Learn the waves', tag: 'Investing basics', icon: TrendingUp, checkpoint: false, intro: 'Market values can rise and fall. Volatility describes price changes; it does not predict what happens next.', detail: 'A single-company holding depends heavily on one business. A broad fund spreads exposure across many holdings but can still lose value when markets fall.', action: 'Distinguish a possible loss from a guaranteed prediction.', question: 'What does diversification mainly try to reduce?', answers: ['Dependence on one holding or outcome', 'All possibility of loss', 'The need to understand fees'], correct: 0, explanation: 'Diversification can reduce concentration risk; it cannot guarantee profit or prevent every loss.' },
  { id: 'voyage-shock', section: '03 · The Volatility Voyage', title: 'Stress-test the fleet', tag: 'Simulated shock', icon: CircleDollarSign, checkpoint: false, intro: 'Send a fictional portfolio through a fictional market shock and see how concentration changes the simulated result.', detail: 'Example assumptions: Apex Single Tech Stock −58%, Horizon Broad Market Index Fund −22%, and Cash 0% market-price change. These are classroom assumptions, not forecasts or real securities.', action: 'Change the allocation in the stress test below.', question: 'Which holding has the largest simulated decline in this example?', answers: ['Apex Single Tech Stock', 'Horizon Broad Market Index Fund', 'Cash'], correct: 0, explanation: 'The fictional single-stock shock is −58%, versus −22% for the broad fund and 0% market-price change for cash.' },
  { id: 'voyage-checkpoint', section: '03 · The Volatility Voyage', title: 'Navigate the next decision', tag: 'Unit checkpoint', icon: BriefcaseBusiness, checkpoint: true, intro: 'A stress test explores how assumptions affect a simulated portfolio. It is not a prediction or a recommendation.', detail: 'Historical recoveries vary by market, asset, and starting point. Some holdings recover slowly or never return to previous prices. Past performance cannot guarantee future results.', action: 'Explain the risk in the scenario before making another simulated move.', question: 'What is the most accurate lesson from a simulated market shock?', answers: ['A diversified fund cannot fall', 'Past recovery guarantees the next recovery', 'Diversification can reduce concentration but cannot remove market risk'], correct: 2, explanation: 'Diversification may reduce dependence on one holding, but broad markets can decline too and recovery is never guaranteed.' },
];

const mentorCouncil = [
  { character: 'porkfeller', name: 'Sir Porkfeller', office: 'Governor of the High-Yield Vault', voice: '“Why let your gold nap in a low-interest account?”', lesson: 'Compare access, fees, and interest. A displayed rate is never a promise.' },
  { character: 'pigtavius', name: 'Magistrate Pigtavius', office: 'Supreme Judge of Credit and APR', voice: '“Order in the courtroom! Let’s inspect that balance.”', lesson: 'Minimum payments can extend repayment while interest accrues under the account terms.' },
  { character: 'penny', name: 'Penny', office: 'Commander of Portfolio Defense', voice: '“Stay calm, recruit. First, understand the risk.”', lesson: 'Explore volatility without panic; a simulated dip is not a prediction.' },
  { character: 'oinkador', name: 'Arch-Mage Oinkador', office: 'Alchemist of Future Scenarios', voice: '“One small change. Two very different simulations.”', lesson: 'Recurring contributions and time change a hypothetical projection, not guarantee growth.' },
  { character: 'vaulty', name: 'Vaulty', office: 'Navigator of the Volatility Seas', voice: '“One ship can stumble. A whole fleet spreads the voyage’s risk.”', lesson: 'Diversification can reduce concentration but cannot prevent all losses.' },
  { character: 'grunt', name: 'Mechanic Grunt', office: 'Chief of Cash-Flow Maintenance', voice: '“Let’s find the leak before it becomes a flood.”', lesson: 'Budgeting for irregular costs and reserves can help a simulated plan absorb shocks.' },
  { character: 'king', name: 'King Piggy I', office: 'Sovereign of Financial Health', voice: '“Good habits outrank a pile of virtual coins.”', lesson: 'Reward thoughtful choices and learning, not risky simulated gains.' },
];

const chapterDescriptions: Record<string, string> = {
  '01 · The Liquidity Fortress': 'Build your cash-access foundation and calculate an emergency runway.',
  '02 · The APR Courtroom': 'Put borrowing costs on trial and compare repayment choices.',
  '03 · The Volatility Voyage': 'Navigate simulated market risk without mistaking a scenario for a forecast.',
};

function WalletIcon() { return <WalletCards size={21} />; }

function useProgress() {
  const [profile, setProfile] = useState(readProfile);
  useEffect(() => {
    const refresh = () => setProfile(readProfile());
    window.addEventListener('finwise-profile-update', refresh);
    return () => window.removeEventListener('finwise-profile-update', refresh);
  }, []);
  return profile;
}

export function LearningStatusBar({ financialHealth }: { financialHealth: number }) {
  const profile = useProgress();
  const healthHearts = Math.max(1, Math.min(5, Math.round(financialHealth / 20)));
  return <div className="learning-status-bar" aria-label="Your learning status"><div title={`${profile.streakDays} consecutive learning days`}><Flame size={17} /><strong>{profile.streakDays}</strong><span>day streak</span></div><div title={`${profile.gems} Piggy Corp gems`}><Gem size={17} /><strong>{profile.gems}</strong><span>gems</span></div><div title={`Financial health ${financialHealth} out of 100`}><Heart size={17} /><strong>{healthHearts}/5</strong><span>health</span></div></div>;
}

export function LearningPathPage() {
  const profile = useProgress();
  const navigate = useNavigate();
  const [singleStockPercent, setSingleStockPercent] = useState(25);
  const [broadFundPercent, setBroadFundPercent] = useState(55);
  const nextAvailable = lessonPath.findIndex((node) => !profile.completedNodes.includes(node.id));
  const [selectedId, setSelectedId] = useState(lessonPath[Math.max(0, nextAvailable)]?.id ?? lessonPath[0].id);
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [earnedReward, setEarnedReward] = useState<number | null>(null);
  const [dailyCoffeeSpend, setDailyCoffeeSpend] = useState(120);
  const selectedIndex = lessonPath.findIndex((node) => node.id === selectedId);
  const lesson = lessonPath[selectedIndex] ?? lessonPath[0];
  const unlocked = profile.completedNodes.includes(lessonPath[selectedIndex]?.id ?? '') || (nextAvailable >= 0 && selectedIndex <= nextAvailable);
  const complete = profile.completedNodes.includes(lesson.id);
  const sections = [...new Set(lessonPath.map((node) => node.section))];
  const LessonIcon = lesson.icon;
  const simulatedPortfolioTotal = 100000;
  const cashPercent = 100 - singleStockPercent - broadFundPercent;
  const stressTest = calculatePortfolioStressTest({
    singleStock: simulatedPortfolioTotal * singleStockPercent / 100,
    broadFund: simulatedPortfolioTotal * broadFundPercent / 100,
    cash: simulatedPortfolioTotal * cashPercent / 100,
  });
  const money = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;
  const habitMilestones = [1, 5, 10].map((years) => ({ years, total: dailyCoffeeSpend * 365 * years }));
  const tenYearSetAside = habitMilestones[2].total;

  const chooseNode = (id: string) => { setSelectedId(id); setAnswer(null); setChecked(false); setEarnedReward(null); };
  const checkAnswer = () => {
    if (answer === null) return;
    setChecked(true);
    if (answer === lesson.correct && completeLearningNode(lesson.id, 100, lesson.checkpoint ? 300 : undefined)) {
      setEarnedReward(lesson.checkpoint ? 300 : 25);
    }
  };
  const continueRoadmap = () => {
    const next = lessonPath[selectedIndex + 1];
    setEarnedReward(null);
    setAnswer(null);
    setChecked(false);
    if (next) setSelectedId(next.id);
  };

  return (
    <section id="learning" className="learning-path-page">
      <div className="path-heading"><div><span className="academy-eyebrow"><Sparkles size={14} /> Piggy Corp · Three-unit roadmap</span><h1>Three chapters. One stronger money instinct.</h1><p>Build a cash fortress, put APR on trial, and navigate a simulated market shock.</p></div><div className="path-total-progress"><strong>{profile.completedNodes.filter((id) => lessonPath.some((lesson) => lesson.id === id)).length}<small>/{lessonPath.length}</small></strong><span>lessons complete</span></div></div>
      <div className="path-health-strip" aria-label="Financial learning progress">
        <div className="path-health-score"><span className="path-health-ring"><Heart size={19} fill="currentColor" /><strong>{Math.max(1, Math.min(99, 53 + profile.completedLessons * 3))}</strong></span><div><span>Financial health</span><strong>{profile.completedLessons >= 5 ? 'Building momentum' : 'Just getting started'}</strong></div></div>
        <div className="path-mini-stat"><Flame size={18} /><div><strong>{profile.streakDays || 1} day</strong><span>learning streak</span></div></div>
        <div className="path-mini-stat"><Gem size={18} /><div><strong>{profile.gems} gems</strong><span>ready to spend</span></div></div>
        <div className="path-mini-stat"><Trophy size={18} /><div><strong>{profile.weeklyExperience} XP</strong><span>this week</span></div></div>
      </div>
      <div className="path-character-banner"><div className="path-banner-copy"><span className="academy-eyebrow"><Sparkles size={14} /> Piggy Corp · Your money learning voyage</span><h2>Build your foundation. Put debt on trial. Navigate market risk.</h2><p>Three chapters, nine decisions, and a council of mentors. Every number in the simulations is virtual.</p><button type="button" className="academy-primary" onClick={() => chooseNode(lessonPath[0].id)}>Enter the first chapter <ArrowRight size={16} /></button></div><div className="path-crew-art"><CharacterLineup className="path-crew-lineup" /><span><strong>Seven mentors</strong><small>One money-learning crew</small></span></div><div className="path-world-art" aria-label="Your route: Liquidity Fortress, APR Courtroom, Volatility Voyage"><div className="path-world-stop path-world-vault"><span>01</span><Landmark size={23} /><small>FORTRESS</small></div><i /><div className="path-world-stop path-world-court"><span>02</span><Banknote size={23} /><small>COURTROOM</small></div><i /><div className="path-world-stop path-world-voyage"><span>03</span><TrendingUp size={23} /><small>VOYAGE</small></div></div></div>
      <div className="path-layout">
        <div className="path-map" aria-label="Financial learning path">
          {sections.map((section, sectionIndex) => {
            const chapterLessons = lessonPath.filter((node) => node.section === section);
            const chapterComplete = chapterLessons.filter((node) => profile.completedNodes.includes(node.id)).length;
            const ChapterIcon = chapterLessons[0].icon;
            return <section className={`path-section path-chapter path-chapter-${sectionIndex + 1}`} key={section}>
              <header className="path-chapter-header"><span className="path-chapter-emblem"><ChapterIcon size={23} /></span><div className="path-chapter-title"><span>ZONE {String(sectionIndex + 1).padStart(2, '0')} · {chapterComplete}/{chapterLessons.length} CLEARED</span><h2>{section.replace(/^\d+ · /, '')}</h2><p className="path-chapter-description">{chapterDescriptions[section]}</p></div><span className="path-chapter-percent">{Math.round(chapterComplete / chapterLessons.length * 100)}%</span></header>
              <div className="path-chapter-track" aria-hidden="true"><span style={{ width: `${chapterComplete / chapterLessons.length * 100}%` }} /></div>
              <div className="path-nodes">
            {lessonPath.filter((node) => node.section === section).map((node) => {
              const index = lessonPath.findIndex((item) => item.id === node.id);
              const done = profile.completedNodes.includes(node.id);
              const locked = !done && nextAvailable >= 0 && index > nextAvailable;
              const Icon = node.icon;
              return <button key={node.id} type="button" disabled={locked} className={`path-node ${done ? 'done' : ''} ${selectedId === node.id ? 'selected' : ''} ${locked ? 'locked' : ''}`} aria-label={`${locked ? 'Locked: ' : ''}${node.title}`} aria-pressed={selectedId === node.id} onClick={() => chooseNode(node.id)}><span className="path-node-icon">{done ? <Check size={22} /> : locked ? <LockKeyhole size={17} /> : <Icon size={22} />}</span><span className="path-node-copy"><small>{node.checkpoint ? 'BOSS CHECKPOINT' : `MISSION ${String(chapterLessons.indexOf(node) + 1).padStart(2, '0')}`}</small><span className="path-node-label">{node.title}</span><b>{done ? 'CLEARED' : locked ? 'LOCKED' : selectedId === node.id ? 'PLAYING NOW' : 'READY'}</b></span><span className="path-node-xp">+{node.checkpoint ? 300 : 25}<small>XP</small></span></button>;
            })}
              </div>
            </section>;
          })}
        </div>

        <aside className="path-lesson-panel" aria-live="polite"><div className="path-lesson-art"><div className="path-lesson-emblem"><LessonIcon size={34} /><span>MISSION {String(selectedIndex + 1).padStart(2, '0')}</span></div><div className="path-lesson-reward"><span>{lesson.checkpoint ? 'Boss checkpoint' : 'Mission reward'}</span><strong><Sparkles size={14} /> +{lesson.checkpoint ? 300 : 25} XP</strong></div><span className="path-lesson-tag">{lesson.tag}</span></div><span className="academy-eyebrow">Lesson {String(selectedIndex + 1).padStart(2, '0')} of {lessonPath.length} · 3 minutes</span><h2>{lesson.title}</h2><p className="path-lesson-intro">{lesson.intro}</p><div className="path-lesson-detail"><BookOpenText size={17} /><p>{lesson.detail}</p></div><div className="path-action-note"><ArrowDown size={16} /><span>{lesson.action}</span></div>
          {!unlocked ? <p className="path-locked-note"><LockKeyhole size={16} /> Finish the previous mission to unlock this route.</p> : earnedReward !== null ? <div className="mission-clear"><span><Check size={18} /> MISSION CLEARED</span><h3>{lesson.checkpoint ? 'Chapter checkpoint passed.' : 'Good call. Keep your momentum.'}</h3><p>{lesson.explanation}</p><strong>+{earnedReward} virtual XP</strong><button type="button" className="academy-primary" onClick={continueRoadmap}>{selectedIndex === lessonPath.length - 1 ? 'Finish roadmap' : 'Continue journey'} <ArrowRight size={16} /></button></div> : complete ? <div className="path-completed-note"><BadgeCheck size={18} /><div><strong>Mission cleared</strong><span>You can replay this checkpoint any time.</span></div></div> : <div className="path-mastery-check"><h3>{lesson.checkpoint ? 'Boss checkpoint · +300 XP' : 'Choose your move · +25 XP'}</h3><p>{lesson.question}</p><div role="group" aria-label="Lesson answers" className="path-answer-list">{lesson.answers.map((option, index) => <button key={option} type="button" className={answer === index ? `path-answer selected${checked ? index === lesson.correct ? ' correct' : ' incorrect' : ''}` : 'path-answer'} aria-pressed={answer === index} onClick={() => { setAnswer(index); setChecked(false); }}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{checked && answer !== lesson.correct && <p className="path-wrong-hint"><strong>Try another route.</strong> {lesson.explanation}</p>}<button className="academy-primary" type="button" disabled={answer === null} onClick={checkAnswer}>Lock in my answer <ArrowRight size={16} /></button></div>}
          <button className="path-quest-link" type="button" onClick={() => navigate('/quest')}><Play size={15} /> Practice choices in Money Quest</button>
        </aside>
      </div>
      <section className="habit-sandbox" aria-labelledby="habit-sandbox-title">
        <div className="habit-sandbox-heading">
          <span className="academy-eyebrow"><Coffee size={15} /> Daily habit sandbox</span>
          <h2 id="habit-sandbox-title">A small daily choice, a longer runway.</h2>
          <p>Slide the daily spend and see how much could be set aside over time. This simple example assumes the same amount each day and includes no interest.</p>
        </div>
        <div className="habit-sandbox-controls">
          <label htmlFor="daily-coffee-spend"><span>Daily coffee or treat spend</span><strong>{money(dailyCoffeeSpend)} per day</strong></label>
          <input id="daily-coffee-spend" type="range" min="0" max="400" step="10" value={dailyCoffeeSpend} onChange={(event) => setDailyCoffeeSpend(Number(event.target.value))} aria-describedby="habit-sandbox-note" />
          <div className="habit-range-labels"><span>₹0</span><span>₹400</span></div>
        </div>
        <div className="habit-sandbox-total"><span>Possible set-aside after 10 years</span><strong>{money(tenYearSetAside)}</strong><small>Illustrative total only. It is not a forecast or a savings recommendation.</small></div>
        <div className="habit-milestones" role="group" aria-label="Possible amount set aside at different times">
          {habitMilestones.map(({ years, total }) => <div className="habit-milestone" key={years}>
            <div className="habit-milestone-label"><span>{years} {years === 1 ? 'year' : 'years'}</span><strong>{money(total)}</strong></div>
            <div className="habit-progress-track" role="img" aria-label={`At ${years} ${years === 1 ? 'year' : 'years'}: ${money(total)} possible set-aside`}><span style={{ width: `${years * 10}%` }} /></div>
          </div>)}
        </div>
        <p className="habit-sandbox-note" id="habit-sandbox-note">The bars show time passing toward the 10-year view. Interest, inflation, and changing habits are not included.</p>
      </section>
      <section className="stress-test-panel" aria-labelledby="stress-test-title">
        <div className="stress-test-heading"><div><span className="academy-eyebrow"><ShieldCheck size={14} /> Fictional portfolio lab</span><h2 id="stress-test-title">Stress-test the fleet</h2><p>Start with ₹1,00,000 in virtual money. Adjust allocations and see how this example shock changes the result.</p></div><div className={`stress-grade stress-grade-${stressTest.survivalGrade.replace('+', 'plus')}`}><span>Survival grade</span><strong>{stressTest.survivalGrade}</strong></div></div>
        <div className="stress-test-controls">
          <label><span>Apex single tech stock <strong>{singleStockPercent}% · {money(simulatedPortfolioTotal * singleStockPercent / 100)}</strong></span><input type="range" min="0" max="100" value={singleStockPercent} onChange={(event) => { const value = Number(event.target.value); setSingleStockPercent(value); setBroadFundPercent((fund) => Math.min(fund, 100 - value)); }} /></label>
          <label><span>Horizon broad market index fund <strong>{broadFundPercent}% · {money(simulatedPortfolioTotal * broadFundPercent / 100)}</strong></span><input type="range" min="0" max={100 - singleStockPercent} value={broadFundPercent} onChange={(event) => setBroadFundPercent(Number(event.target.value))} /></label>
          <div className="stress-cash-row"><span>Cash <strong>{cashPercent}% · {money(simulatedPortfolioTotal * cashPercent / 100)}</strong></span><span>Simulated market-price change: 0%</span></div>
        </div>
        <div className="stress-shocks" aria-label="Simulated shock assumptions"><span>Apex single stock <strong>−58%</strong></span><span>Horizon broad fund <strong>−22%</strong></span><span>Cash <strong>0%</strong></span></div>
        <div className="stress-results"><div><span>Simulated loss</span><strong>{money(stressTest.lossAmount)} · {stressTest.lossPercent.toFixed(1)}%</strong></div><div><span>Virtual value after shock</span><strong>{money(stressTest.valueAfterShock)}</strong></div></div>
        <p className="stress-test-note">Example assumptions only, not forecasts or real securities. The grade rewards a broad-fund share of at least 50%, single-stock exposure no more than 20%, and a cash buffer; cash-heavy, low-concentration allocations also score well. Cash has no simulated market-price change here; real deposit insurance depends on the institution, account, eligibility, and applicable limits. Diversification cannot prevent all losses.</p>
      </section>
      <section className="mentor-council" aria-labelledby="mentor-council-title"><div className="mentor-council-heading"><div><span className="academy-eyebrow"><Users size={14} /> Your advisory council</span><h2 id="mentor-council-title">Seven mentors. Seven useful angles.</h2></div><p>Pick up a different way to think about each money decision.</p></div><div className="mentor-council-grid">{mentorCouncil.map((mentor) => <article className="mentor-council-member" key={mentor.name}><CharacterAvatar character={mentor.character} size="large" mood="happy" /><div className="mentor-council-copy"><h3>{mentor.name}</h3><span>{mentor.office}</span><blockquote>{mentor.voice}</blockquote><p>{mentor.lesson}</p></div></article>)}</div></section>
      <div className="path-bonus-row"><article className="path-bonus-card path-bonus-coral"><span className="path-bonus-icon"><ShieldCheck size={20} /></span><div><span>Quick challenge</span><strong>Spot the money trap</strong><small>Jump to the Money Quest arena</small></div><button type="button" onClick={() => navigate('/duel')} aria-label="Open quick challenge"><ArrowRight size={17} /></button></article><article className="path-bonus-card path-bonus-gold"><span className="path-bonus-icon"><Landmark size={20} /></span><div><span>Vault challenge</span><strong>Build your safety net</strong><small>Play the Unit 01 checkpoint</small></div><button type="button" onClick={() => chooseNode('vault-runway')} aria-label="Open emergency fund checkpoint"><ArrowRight size={17} /></button></article><article className="path-bonus-card path-bonus-blue"><span className="path-bonus-icon"><TrendingUp size={20} /></span><div><span>Market challenge</span><strong>Stress-test the fleet</strong><small>Adjust your simulated allocation</small></div><button type="button" onClick={() => document.getElementById('stress-test-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} aria-label="Open portfolio stress test"><ArrowRight size={17} /></button></article></div>
    </section>
  );
}

const dailyTasks = [
  { id: 'daily-lessons', title: 'Complete 2 lessons', goal: 2, reward: 15, icon: BookOpenText, value: (profile: LearnerProfile) => profile.todayLessons },
  { id: 'daily-master', title: 'Score 90% in a lesson', goal: 1, reward: 15, icon: Target, value: (profile: LearnerProfile) => profile.todayMastered },
  { id: 'daily-minutes', title: 'Spend 10 minutes learning', goal: 10, reward: 20, icon: Timer, value: (profile: LearnerProfile) => profile.todayMinutes },
  { id: 'daily-review', title: 'Review one past decision', goal: 1, reward: 10, icon: RotateCcw, value: (profile: LearnerProfile) => Math.min(1, profile.matchHistory.length) },
  { id: 'daily-safety', title: 'Open your safety-net lesson', goal: 1, reward: 10, icon: ShieldCheck, value: (profile: LearnerProfile) => Number(profile.completedNodes.includes('vault-runway')) },
];

export function QuestsPage() {
  const profile = useProgress();
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [timerComplete, setTimerComplete] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const monthlyGoal = 45;
  const monthlyRewardId = `monthly-${profile.currentMonth}`;
  const monthlyClaimed = profile.claimedRewards.includes(monthlyRewardId);
  const monthlyProgress = Math.min(monthlyGoal, profile.monthlyQuestPoints);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          setTimerComplete(true);
          addStudyMinutes(10);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const copyInvite = async () => {
    const invite = `FIN-${profile.character.toUpperCase()}-${String(profile.experience + 17).padStart(3, '0')}`;
    try {
      await navigator.clipboard.writeText(invite);
      setInviteMessage(`Invite code ${invite} copied. This local preview cannot connect remote accounts yet.`);
    } catch {
      setInviteMessage(`Share code: ${invite}. Remote friend syncing requires an online account service.`);
    }
  };

  return (
    <section className="academy-page quests-page">
      <div className="quest-season-banner">
        <div><span className="academy-eyebrow"><Sparkles size={14} /> This month · {new Date().toLocaleString('en', { month: 'long' })} quest</span><h1>Small lessons. A stronger money life.</h1><p>Earn 45 Quest Points this month to unlock the Financial Explorer badge.</p></div>
        <div className="season-trophy"><Trophy size={31} /><span>FINANCIAL<br />EXPLORER</span></div>
        <div className="season-progress"><div><strong>{monthlyProgress}<small> / {monthlyGoal} XP</small></strong><span>{monthlyClaimed ? 'Reward claimed' : `${Math.max(0, monthlyGoal - monthlyProgress)} XP to badge`}</span></div><div className="season-progress-track"><i style={{ width: `${monthlyProgress / monthlyGoal * 100}%` }} /></div>{monthlyProgress >= monthlyGoal && <button type="button" disabled={monthlyClaimed} onClick={() => claimReward(monthlyRewardId, 80)}>{monthlyClaimed ? 'Badge added to profile' : 'Claim badge +80 gems'}</button>}</div>
      </div>

      <div className="academy-page-heading"><span className="academy-eyebrow">Your daily plan</span><h2>Three tiny moves for today.</h2><p>Finish a task to open its chest. Rewards can only be claimed once per day.</p></div>
      <section className="daily-quest-list" aria-label="Daily financial quests">
        {dailyTasks.map((task) => {
          const Icon = task.icon;
          const progress = Math.min(task.goal, task.value(profile));
          const rewardId = `${task.id}-${profile.currentDay}`;
          const claimed = profile.claimedRewards.includes(rewardId);
          const ready = progress >= task.goal;
          return <article className={`daily-quest-row ${ready ? 'ready' : ''}`} key={task.id}><div className="daily-quest-icon"><Icon size={21} /></div><div className="daily-quest-copy"><div><h3>{task.title}</h3><span>{progress} / {task.goal}{task.id === 'daily-minutes' ? ' min' : ''}</span></div><div className="daily-quest-track"><i style={{ width: `${progress / task.goal * 100}%` }} /></div><small>{ready ? 'Challenge complete. Claim your reward.' : task.id === 'daily-minutes' ? 'Start a focus session below.' : 'Complete a lesson in your Path.'}</small></div><button className={`treasure-chest ${ready ? 'unlocked' : ''}`} type="button" disabled={!ready || claimed} aria-label={claimed ? 'Reward claimed' : ready ? `Claim ${task.reward} gems` : `Locked reward: ${task.reward} gems`} onClick={() => claimReward(rewardId, task.reward)}>{claimed ? <Check size={22} /> : ready ? <Sparkles size={22} /> : <LockKeyhole size={20} />}<span>{claimed ? 'Claimed' : `+${task.reward}`}</span></button></article>;
        })}
      </section>

      <section className="focus-session-panel"><div className="focus-session-icon"><Timer size={23} /></div><div className="focus-session-copy"><span className="academy-eyebrow">Focus room · earns daily quest minutes</span><h3>{timerComplete ? 'Focus session complete!' : timerRunning ? 'Stay with one money skill.' : 'Ten quiet minutes, one useful skill.'}</h3><p>{timerComplete ? 'Ten focused minutes added to your daily quest.' : 'Read a lesson, use a calculator, or review your campaign. Minutes count after the full 10-minute session.'}</p></div><div className="focus-timer-actions"><strong>{timerComplete ? '10:00' : `${Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`}</strong><button type="button" className="academy-primary" disabled={timerComplete} onClick={() => setTimerRunning((running) => !running)}>{timerComplete ? <Check size={16} /> : timerRunning ? 'Pause' : <><Play size={15} /> Start focus</>}{timerComplete ? 'Done' : ''}</button><button type="button" className="focus-reset" onClick={() => { setTimerRunning(false); setSecondsLeft(600); setTimerComplete(false); }}>Reset timer</button></div></section>

      <section className="friend-quest-panel"><div className="friend-quest-art"><CharacterAvatar character="sage" size="large" mood="celebrating" /><CharacterAvatar character="bolt" size="small" mood="happy" /></div><div className="friend-quest-copy"><span className="academy-eyebrow"><Users size={14} /> Crew quest · local preview</span><h2>Build a 6-lesson safety net together.</h2><p>Your completed lessons add to the shared goal. Invite codes are a preview only; real cross-device teams need accounts and a server.</p><div className="friend-quest-progress"><span>{Math.min(6, profile.completedLessons)} / 6 lessons</span><div><i style={{ width: `${Math.min(100, profile.completedLessons / 6 * 100)}%` }} /></div></div><div className="friend-quest-buttons"><button type="button" className="academy-primary" onClick={() => saveProfile({ ...profile, friendQuestJoined: !profile.friendQuestJoined })}>{profile.friendQuestJoined ? 'Leave crew quest' : 'Join crew quest'} <Users size={15} /></button><button type="button" className="academy-secondary" onClick={copyInvite}>Copy invite code <ChevronRight size={15} /></button></div>{inviteMessage && <p className="invite-status" role="status">{inviteMessage}</p>}</div></section>
      <p className="quests-footnote">Gems, streaks, XP, and rewards are practice-game mechanics; they do not represent real currency or investment performance.</p>
    </section>
  );
}

const leagueTiers = [
  { name: 'Copper', threshold: 0, accent: 'copper' },
  { name: 'Silver', threshold: 150, accent: 'silver' },
  { name: 'Gold', threshold: 350, accent: 'gold' },
  { name: 'Pearl', threshold: 700, accent: 'pearl' },
  { name: 'Aurora', threshold: 1200, accent: 'aurora' },
];

const leaguePlayers = [
  { name: 'Sir Porkfeller', xp: 286, character: 'porkfeller', note: 'Debt strategist' },
  { name: 'Magistrate Pigtavius', xp: 241, character: 'pigtavius', note: 'Steady saver' },
  { name: 'Penny', xp: 194, character: 'penny', note: 'Market watcher' },
  { name: 'Arch-Mage Oinkador', xp: 156, character: 'oinkador', note: 'Goal builder' },
  { name: 'Vaulty', xp: 119, character: 'vaulty', note: 'New this week' },
  { name: 'Mechanic Grunt', xp: 82, character: 'grunt', note: 'Cash-flow learner' },
];

export function LeaguePage() {
  const profile = useProgress();
  const navigate = useNavigate();
  const currentTierIndex = leagueTiers.reduce((result, tier, index) => profile.weeklyExperience >= tier.threshold ? index : result, 0);
  const tier = leagueTiers[currentTierIndex];
  const nextTier = leagueTiers[currentTierIndex + 1];
  const table = useMemo(() => [...leaguePlayers, { name: profile.name, xp: profile.weeklyExperience, character: profile.character, note: 'You' }].sort((a, b) => b.xp - a.xp), [profile.character, profile.name, profile.weeklyExperience]);
  const yourRank = table.findIndex((player) => player.note === 'You') + 1;
  const promotionCut = Math.min(3, table.length);
  const demotionCut = table.length - 2;
  const promotionXp = table[promotionCut - 1]?.xp ?? 0;
  const demotionXp = table[demotionCut]?.xp ?? 0;
  const toPromotion = Math.max(0, promotionXp - profile.weeklyExperience + 1);
  const aboveDemotion = Math.max(0, profile.weeklyExperience - demotionXp);

  return (
    <section className="academy-page league-page">
      <div className={`league-banner league-${tier.accent}`}><span className="academy-eyebrow"><Trophy size={14} /> Weekly financial learning league</span><h1>{tier.name} League</h1><p>Earn XP from lessons and challenges. Standings refresh weekly in this local practice league.</p><div className="league-season-meta"><span><Clock3 size={15} /> Week of {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span><span><Star size={15} /> Your weekly XP: {profile.weeklyExperience}</span></div></div>
      <div className="league-layout">
        <section className="league-table-panel"><div className="league-panel-heading"><div><span className="academy-eyebrow">Current standings</span><h2>{tier.name} division</h2></div><span className="league-rank-chip">Your rank #{yourRank}</span></div><div className="league-zones"><div className="promotion-zone"><ArrowDown size={15} /><span>Top {promotionCut} promote to {nextTier?.name ?? 'the next division'}</span></div><div className="demotion-zone"><ArrowDown size={15} /><span>Bottom 2 move down next week</span></div></div><ol className="league-table">{table.map((player, index) => <li className={`${player.note === 'You' ? 'your-league-row' : ''} ${index < promotionCut ? 'promotion-row' : index >= demotionCut ? 'demotion-row' : ''}`} key={player.note === 'You' ? 'you' : player.name}><span className="league-place">{index === 0 ? <Trophy size={17} /> : `#${index + 1}`}</span><CharacterAvatar character={player.character} size="small" /><span className="league-player"><strong>{player.name}{player.note === 'You' && <em>YOU</em>}</strong><small>{player.note}</small></span><strong className="league-xp">{player.xp} <small>XP</small></strong></li>)}</ol><div className="league-threshold-note">{toPromotion ? `${toPromotion} more XP to overtake the current promotion line.` : 'You are currently in the promotion zone.'} {aboveDemotion ? `You are ${aboveDemotion} XP above the current demotion line.` : 'Earn more XP to create a safety margin.'}</div></section>
        <aside className="league-side-panel"><div className="league-emblem"><Trophy size={31} /><span>{tier.name.toUpperCase()}</span></div><span className="academy-eyebrow">Promotion goal</span><h2>{nextTier ? `${nextTier.threshold} XP` : 'Top division'}</h2><p>Earn XP by mastering lessons, completing a Money Quest month, and reviewing financial scenarios.</p><button type="button" className="academy-primary" onClick={() => navigate('/learn')}>Continue learning <ArrowRight size={15} /></button><div className="league-policy"><ShieldCheck size={16} /><span>This friendly demo uses sample learners. No real users or private information are shown.</span></div></aside>
      </div>
    </section>
  );
}

const feedPosts = [
  { id: 'streak-400', name: 'Sir Porkfeller', character: 'porkfeller', time: '1 hour ago', text: 'Completed a 400-day learning streak!', art: 'streak', reactions: ['🔥', '👏', '💚'] },
  { id: 'badge-month', name: 'Magistrate Pigtavius', character: 'pigtavius', time: '3 hours ago', text: 'Unlocked the Calm Planner monthly badge.', art: 'badge', reactions: ['🎉', '⭐', '👏'] },
  { id: 'crew-50', name: 'Penny', character: 'penny', time: 'Yesterday', text: 'Reached a 50-day friend learning streak together.', art: 'crew', reactions: ['🤝', '🔥', '💚'] },
  { id: 'global-lesson', name: 'Arch-Mage Oinkador', character: 'oinkador', time: 'Yesterday', text: 'Finished the global investing lesson and learned why currency can help or hurt returns.', art: 'globe', reactions: ['🌍', '💡', '👏'] },
  { id: 'reserve-plan', name: 'Vaulty', character: 'vaulty', time: '2 days ago', text: 'Compared access and total cost before choosing a savings goal.', art: 'badge', reactions: ['💡', '👏', '💚'] },
];

export function FeedPage() {
  const profile = useProgress();
  return (
    <section className="academy-page feed-page">
      <div className="academy-page-heading"><span className="academy-eyebrow"><Users size={14} /> Learning community</span><h1>Good money habits are worth sharing.</h1><p>Celebrate practice, ask better questions, and cheer on the people learning beside you.</p></div>
      <div className="feed-local-banner"><img className="feed-intro-art" src="/characters/feed-cutout.png" alt="Piggy Corp community mentor" /><ShieldCheck size={17} /><p><strong>Community preview:</strong> these are sample learner stories. Your reactions are saved in this browser; posts are not sent to real users.</p></div>
      <div className="feed-list">{feedPosts.map((post) => {
        const activeReaction = profile.reactions[post.id];
        return <article className="feed-post" key={post.id}><div className="feed-post-head"><CharacterAvatar character={post.character} size="small" mood="happy" /><div><strong>{post.name}</strong><span>{post.time}</span></div><BadgeCheck size={16} /></div><div className={`feed-story-art art-${post.art}`}><CharacterAvatar character={post.character} size="large" mood="celebrating" /><Sparkles size={18} /></div><p className="feed-post-copy">{post.text}</p><div className="feed-reaction-row" role="group" aria-label={`React to ${post.name}'s update`}>{post.reactions.map((reaction) => <button key={reaction} type="button" aria-pressed={activeReaction === reaction} className={activeReaction === reaction ? 'feed-reaction active' : 'feed-reaction'} onClick={() => toggleReaction(post.id, reaction)}>{reaction}<span>{activeReaction === reaction ? 'You + 8' : '8'}</span></button>)}</div></article>;
      })}</div>
    </section>
  );
}