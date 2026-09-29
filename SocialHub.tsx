import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  BookOpenText,
  BriefcaseBusiness,
  Check,
  Compass,
  Clock3,
  Flame,
  Globe2,
  Landmark,
  LineChart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { checkInWithFriend, defaultProfile, readProfile, recordMatch, saveProfile, type LearnerProfile } from './profileStore';
import { CharacterAvatar, CharacterLineup, CHARACTER_ROSTER } from './CharacterStudio';
import './SocialHub.css';

const characters = CHARACTER_ROSTER;

const matchScenarios = [
  { id: 'market-crash', title: 'Market Crash Survival', description: 'Make decisions through a sharp portfolio drop.', icon: BarChart3, bot: [1, 2, 0], questions: [
    { title: 'A fast market fall', scene: 'A diversified equity fund falls 18% in one month. Your goal is 12 years away.', question: 'What is the most useful first step?', answers: ['Sell everything before it falls more', 'Check your goal, cash needs, and original risk plan', 'Borrow money to double down immediately'], correct: 1, lesson: 'A price drop alone does not tell you what to do. Revisit your goal, risk capacity, diversification, and time horizon; never assume a rebound.', },
    { title: 'Emergency cash or shares?', scene: 'You need money for a repair next month while markets are volatile.', question: 'Which money source usually fits a near-term bill better?', answers: ['Sell a long-term asset at any price', 'Use the liquid emergency reserve planned for surprises', 'Take the highest-rate loan without checking terms'], correct: 1, lesson: 'Short-term spending belongs in money that is stable and accessible. That helps avoid forced selling.', },
    { title: 'A friend’s market tip', scene: 'A friend says one sector will recover first and asks you to move all savings into it.', question: 'What should guide your decision?', answers: ['A tip from someone confident', 'Your written plan, diversification, and ability to take risk', 'The biggest one-day price move'], correct: 1, lesson: 'Confidence is not evidence. Avoid concentration and test any change against your goals and downside capacity.', },
  ] },
  { id: 'raise', title: 'Negotiate a Raise', description: 'Plan a salary conversation and turn a raise into choices.', icon: BriefcaseBusiness, bot: [0, 1, 0], questions: [
    { title: 'Prepare your case', scene: 'You want to ask for a raise after taking on more responsibility.', question: 'What preparation makes the conversation stronger?', answers: ['Document outcomes, responsibilities, and market context', 'Threaten to quit before discussing your work', 'Ask for a number without understanding total compensation'], correct: 0, lesson: 'Specific results and a researched range help you make a clear, professional case. Pay also includes benefits and working conditions.', },
    { title: 'The new take-home pay', scene: 'Your monthly take-home pay rises by ₹8,000.', question: 'What is a resilient way to use some of the increase?', answers: ['Raise every recurring expense immediately', 'Direct a planned share to goals or expensive debt', 'Invest all of it in one trending stock'], correct: 1, lesson: 'A raise can improve security and future choices when some of it is captured for goals before lifestyle costs expand.', },
    { title: 'Benefits are part of pay', scene: 'One offer pays more cash; another offers stronger health cover and retirement matching.', question: 'How do you compare them?', answers: ['Compare total value, conditions, cash flow, and personal needs', 'Only compare the headline salary', 'Choose whichever has the shorter email'], correct: 0, lesson: 'Look at total compensation, eligibility, vesting, flexibility, and the value of benefits to your situation.', },
  ] },
  { id: 'emergency', title: 'Emergency Fund Defense', description: 'Balance urgent costs, liquidity, debt, and insurance.', icon: ShieldCheck, bot: [2, 0, 1], questions: [
    { title: 'The surprise bill', scene: 'Your phone needs a ₹12,000 repair. You have ₹30,000 in emergency cash and a credit card.', question: 'What is the most careful first move?', answers: ['Use the emergency cash and rebuild it over time', 'Use the card and ignore its interest rate', 'Sell every long-term investment immediately'], correct: 0, lesson: 'A liquid reserve exists for urgent costs. High-interest credit can compound quickly, and forced selling may lock in a loss.', },
    { title: 'How much buffer?', scene: 'Your essential costs are ₹40,000 per month and your income varies seasonally.', question: 'What is a sensible way to size an emergency target?', answers: ['Use a fixed number copied from a stranger', 'Consider essential costs, income stability, dependants, and insurance', 'Keep exactly one day of expenses for every situation'], correct: 1, lesson: 'A common starting range is 3–6 months of essential expenses, adjusted to your own risks and support network.', },
    { title: 'Where to keep it?', scene: 'You have enough saved for one month of essentials and are considering locking it for a better rate.', question: 'What trade-off should you check first?', answers: ['Access time and early withdrawal penalties', 'The account’s logo', 'Whether the rate is the highest on social media'], correct: 0, lesson: 'Emergency money prioritizes access and reliability. Understand lock-ins, fees, and deposit protection before choosing.', },
  ] },
  { id: 'global', title: 'Global Investor', description: 'Practice currency, diversification, and treaty-aware decisions.', icon: Globe2, bot: [0, 2, 1], questions: [
    { title: 'Currency changes', scene: 'Your global fund rises 6% in its market while its currency falls 5% against INR.', question: 'What should you consider?', answers: ['Both asset performance and currency movement affect INR value', 'The fund is guaranteed to return 6% in INR', 'Currency changes never affect funds'], correct: 0, lesson: 'The rupee result depends on both the asset and the exchange rate, before fees and taxes.', },
    { title: 'Foreign tax withheld', scene: 'A foreign company withholds tax from a dividend paid to an Indian resident.', question: 'What should you do next?', answers: ['Assume the withholding settles every Indian tax obligation', 'Delete the broker statement', 'Keep evidence and check treaty, Indian tax, and filing rules'], correct: 2, lesson: 'A treaty may support relief, but eligibility, records, and filing rules depend on the income and current law.', },
    { title: 'Choose an entry route', scene: 'You are new to global investing and want broad exposure rather than stock tips.', question: 'What deserves a careful comparison?', answers: ['Fees, holdings, tax structure, access route, and risk', 'Only the most famous company', 'Which product promises the largest return'], correct: 0, lesson: 'Understand the investment wrapper, benchmark, costs, currency, and route before funding an account.', },
  ] },
];

function useLearnerProfile() {
  const [profile, setProfile] = useState(readProfile);

  useEffect(() => {
    const refresh = () => setProfile(readProfile());
    window.addEventListener('finwise-profile-update', refresh);
    return () => window.removeEventListener('finwise-profile-update', refresh);
  }, []);

  const updateProfile = (next: LearnerProfile) => {
    saveProfile(next);
    setProfile(next);
  };
  return [profile, updateProfile] as const;
}

export function ProfilePage() {
  const [profile, updateProfile] = useLearnerProfile();
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [saveMessage, setSaveMessage] = useState('');
  const selectedCharacter = characters.find((item) => item.id === profile.character) ?? characters[0];
  const level = Math.floor(profile.experience / 100) + 1;
  const levelProgress = profile.experience % 100;
  const profileLeague = profile.weeklyExperience >= 700 ? 'Pearl' : profile.weeklyExperience >= 350 ? 'Gold' : profile.weeklyExperience >= 150 ? 'Silver' : 'Copper';
  const friendPartners = [
    { id: 'oscar', name: 'Oscar', character: 'pigtavius' },
    { id: 'mina', name: 'Mina', character: 'penny' },
    { id: 'zee', name: 'Zee', character: 'oinkador' },
  ];
  const badgeShelf = [
    { id: 'first-node', title: 'First money move', detail: 'Complete your first lesson', earned: profile.completedLessons >= 1, icon: BookOpenText },
    { id: 'safety', title: 'Safety first', detail: 'Complete emergency fund', earned: profile.completedNodes.includes('emergency'), icon: ShieldCheck },
    { id: 'global', title: 'Global thinker', detail: 'Complete global investing', earned: profile.completedNodes.includes('global'), icon: Globe2 },
    { id: 'month', title: 'Monthly explorer', detail: 'Claim a monthly quest badge', earned: profile.claimedRewards.some((reward) => reward.startsWith('monthly-')), icon: Trophy },
  ];
  const achievements = [
    { title: 'First five lessons', progress: Math.min(5, profile.completedLessons), target: 5, label: 'lessons complete' },
    { title: 'Seven-day streak', progress: Math.min(7, profile.streakDays), target: 7, label: 'consecutive days' },
    { title: 'Match winner', progress: Math.min(3, profile.wins), target: 3, label: 'rated wins' },
    { title: '300-day legend', progress: Math.min(300, profile.streakDays), target: 300, label: 'consecutive days' },
  ];

  const saveName = () => {
    const name = nameDraft.trim().slice(0, 24) || defaultProfile.name;
    updateProfile({ ...profile, name });
    setNameDraft(name);
    setSaveMessage('Profile saved on this device.');
  };

  return (
    <section className="profile-page">
      <div className="social-page-heading">
        <span className="social-eyebrow"><Sparkles size={14} /> Your learning identity</span>
        <h1>Your money journey, your character.</h1>
        <p>Choose a guide, set your learner name, and build progress as you practice. Your profile is stored locally in this browser.</p>
      </div>

      <div className="profile-layout">
        <section className="profile-card profile-identity" aria-label="Learner identity">
          <div className="profile-character-stage">
            <div className="character-orbit orbit-one" />
            <div className="character-orbit orbit-two" />
            <CharacterAvatar character={profile.character} size="large" mood="happy" />
            <span className="character-level">LVL {level}</span>
          </div>
          <span className="profile-label">Your guide</span>
          <h2>{profile.name}</h2>
          <p>{selectedCharacter.name} · {selectedCharacter.role}</p>
          <div className="profile-xp-meter">
            <div><span>Level {level} progress</span><strong>{levelProgress}/100 XP</strong></div>
            <div className="profile-xp-track"><i style={{ width: `${levelProgress}%` }} /></div>
          </div>
          <div className="profile-stats">
            <div><Trophy size={17} /><strong>{profile.experience}</strong><span>XP earned</span></div>
            <div><Flame size={17} /><strong>{Math.floor(profile.experience / 50)}</strong><span>practice turns</span></div>
            <div><BadgeCheck size={17} /><strong>{Math.floor(profile.experience / 100)}</strong><span>levels cleared</span></div>
          </div>
        </section>

        <section className="profile-card profile-customize">
          <div className="profile-section-heading"><div><span className="social-eyebrow">01 / Make it yours</span><h2>Choose your character</h2></div><Compass size={19} /></div>
          <div className="character-grid" role="group" aria-label="Choose a learning character">
            {characters.map((character) => {
              return (
                <button key={character.id} type="button" className={`character-choice ${profile.character === character.id ? 'selected' : ''}`} aria-pressed={profile.character === character.id} onClick={() => updateProfile({ ...profile, character: character.id })}>
                  <CharacterAvatar character={character.id} size="small" mood="curious" />
                  <strong>{character.name}</strong>
                  <small>{character.role}</small>
                  {profile.character === character.id && <Check className="character-selected-check" size={15} />}
                </button>
              );
            })}
          </div>
          <label className="profile-name-field">Learner name<input value={nameDraft} maxLength={24} onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveName(); }} placeholder="Choose a name" /></label>
          <button type="button" className="social-primary-button" onClick={saveName}>Save profile <Check size={16} /></button>
          <p className="profile-save-message" aria-live="polite">{saveMessage}</p>
        </section>
      </div>

      <section className="profile-card profile-next-step">
        <div><span className="social-eyebrow">02 / Learn with someone</span><h2>Practice out loud, not just alone.</h2><p>Start a same-device Money Duel. Take turns, compare your decisions, and talk through the consequences together.</p></div>
        <Link to="/duel" className="social-primary-button">Enter the duel <Users size={17} /></Link>
      </section>

      <section className="profile-collection-section">
        <div className="profile-collection-heading"><div><span className="social-eyebrow">03 / Your progress</span><h2>Performance overview</h2></div><span className="profile-mini-tier">{profileLeague} League</span></div>
        <div className="profile-overview-grid">
          <div><Flame size={17} /><strong>{profile.activeDays}</strong><span>active learning days</span></div>
          <div><Sparkles size={17} /><strong>{profile.experience.toLocaleString()} XP</strong><span>all-time experience</span></div>
          <div><Trophy size={17} /><strong>{profile.topFinishes}</strong><span>top match finishes</span></div>
          <div><Clock3 size={17} /><strong>{profile.studyMinutes} min</strong><span>focused learning</span></div>
        </div>
      </section>

      <section className="profile-collection-section">
        <div className="profile-collection-heading"><div><span className="social-eyebrow">04 / Keep showing up</span><h2>Friend streaks</h2><p>Check in once per day to practice together and grow a shared habit.</p></div><Users size={20} /></div>
        <div className="friend-streak-grid">{friendPartners.map((friend) => {
          const streak = profile.friendStreaks[friend.id];
          const checkedIn = streak?.lastCheckIn === profile.currentDay;
          return <article className="friend-streak-card" key={friend.id}><CharacterAvatar character={friend.character} size="small" mood={checkedIn ? 'celebrating' : 'happy'} /><div><strong>{friend.name}</strong><span><Flame size={13} /> {streak?.days ?? 0} day streak</span></div><button type="button" disabled={checkedIn} onClick={() => checkInWithFriend(friend.id)}>{checkedIn ? 'Done today' : 'Check in'}</button></article>;
        })}</div>
      </section>

      <section className="profile-collection-section">
        <div className="profile-collection-heading"><div><span className="social-eyebrow">05 / Collect as you learn</span><h2>Monthly badges</h2><p>Badges unlock through lessons and quests. Locked items show what to do next.</p></div><Sparkles size={20} /></div>
        <div className="profile-badge-shelf">{badgeShelf.map((badge) => { const Icon = badge.icon; return <article className={`profile-badge ${badge.earned ? 'earned' : 'locked'}`} key={badge.id}><span><Icon size={22} /></span><strong>{badge.title}</strong><small>{badge.earned ? 'Collected' : badge.detail}</small></article>; })}</div>
      </section>

      <section className="profile-collection-section">
        <div className="profile-collection-heading"><div><span className="social-eyebrow">06 / Long-game milestones</span><h2>Achievements</h2></div><BadgeCheck size={20} /></div>
        <div className="profile-achievement-list">{achievements.map((achievement) => <article className="profile-achievement" key={achievement.title}><div><strong>{achievement.title}</strong><span>{achievement.progress} / {achievement.target} {achievement.label}</span></div><div className="achievement-progress"><i style={{ width: `${achievement.progress / achievement.target * 100}%` }} /></div><span className={achievement.progress >= achievement.target ? 'achievement-state earned' : 'achievement-state'}>{achievement.progress >= achievement.target ? 'EARNED' : 'IN PROGRESS'}</span></article>)}</div>
      </section>

      <section className="profile-collection-section profile-match-history">
        <div className="profile-collection-heading"><div><span className="social-eyebrow">07 / Learn from every match</span><h2>Recent scenario matches</h2></div><Link to="/duel">All matches <ArrowRight size={14} /></Link></div>
        {profile.matchHistory.length === 0 ? <p className="profile-empty-history">Finish a financial scenario match to see your result and rating changes here.</p> : profile.matchHistory.slice(0, 3).map((match) => <article key={match.id}><span className={`profile-match-outcome ${match.result}`}>{match.result.toUpperCase()}</span><div><strong>{match.title}</strong><span>vs {match.opponent} · {match.learnerScore}–{match.opponentScore}</span></div><b>{match.ratingChange > 0 ? '+' : ''}{match.ratingChange} IQ</b></article>)}
      </section>

      <div className="profile-local-note"><ShieldCheck size={17} /><p><strong>Local prototype:</strong> profile and XP stay in this browser. Real sign-in, cross-device syncing, online friend lists, and live matchmaking require a secure shared backend; this version does not pretend to connect remote players.</p></div>
    </section>
  );
}

type DuelPhase = 'setup' | 'answer' | 'handoff' | 'review' | 'complete';

export function DuelPage() {
  const [profile] = useLearnerProfile();
  const [playerOneDraft, setPlayerOneDraft] = useState<string | null>(null);
  const [playerTwo, setPlayerTwo] = useState('Friend');
  const [scenarioId, setScenarioId] = useState('market-crash');
  const [opponentMode, setOpponentMode] = useState<'coach' | 'friend'>('coach');
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [phase, setPhase] = useState<DuelPhase>('setup');
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState(0);
  const [selection, setSelection] = useState<number | null>(null);
  const [roundScores, setRoundScores] = useState<[boolean | null, boolean | null]>([null, null]);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const scenario = matchScenarios.find((item) => item.id === scenarioId) ?? matchScenarios[0];
  const rival = { name: 'Match Coach', character: 'porkfeller' };
  const opponentName = opponentMode === 'coach' ? rival.name : playerTwo.trim() || 'Friend';
  const opponentCharacter = opponentMode === 'coach' ? rival.character : characters[(round + 1) % characters.length].id;
  const question = scenario.questions[round];
  const playerOne = playerOneDraft ?? profile.name;
  const names = [playerOne.trim() || 'Player 1', opponentName];

  const startDuel = () => {
    setRound(0);
    setTurn(0);
    setSelection(null);
    setRoundScores([null, null]);
    setScores([0, 0]);
    setPhase('answer');
  };

  const submitDuelAnswer = () => {
    if (selection === null) return;
    const correct = selection === question.correct;
    if (turn === 0 && opponentMode === 'coach') {
      const botChoice = scenario.bot[round] ?? 0;
      const botCorrect = botChoice === question.correct;
      setScores((current) => [current[0] + Number(correct), current[1] + Number(botCorrect)]);
      setRoundScores([correct, botCorrect]);
      setSelection(null);
      setPhase('review');
      return;
    }
    setScores((current) => {
      const next: [number, number] = [...current] as [number, number];
      if (correct) next[turn] += 1;
      return next;
    });
    setRoundScores((current) => {
      const next: [boolean | null, boolean | null] = [...current] as [boolean | null, boolean | null];
      next[turn] = correct;
      return next;
    });
    setSelection(null);
    if (turn === 0) setPhase('handoff');
    else setPhase('review');
  };

  const nextRound = () => {
    if (round === scenario.questions.length - 1) {
      const result = scores[0] === scores[1] ? 'draw' : scores[0] > scores[1] ? 'win' : 'loss';
      recordMatch(scenario.title, names[1], result, scores[0], scores[1], opponentMode === 'coach' ? 1050 : 1000);
      setPhase('complete');
      return;
    }
    setRound((current) => current + 1);
    setTurn(0);
    setRoundScores([null, null]);
    setPhase('answer');
  };

  const winner = scores[0] === scores[1] ? 'It’s a tie' : `${scores[0] > scores[1] ? names[0] : names[1]} wins`;

  return (
    <section className="duel-page">
      <div className="duel-intro-banner">
        <div className="social-page-heading duel-heading">
          <span className="social-eyebrow"><Users size={14} /> Piggy Corp practice arena</span>
          <h1>Money Duel</h1>
          <p>Two players. Five real-life money decisions. One shared screen. Compare your reasoning, not just your score.</p>
        </div>
        <CharacterLineup className="duel-mentor-lineup" />
      </div>

      {phase === 'setup' && (
        <section className="duel-panel duel-setup">
          <div className="match-rating-strip"><div><span className="social-eyebrow">Adaptive Financial IQ</span><strong><LineChart size={18} /> {profile.matchRating} <small>Elo</small></strong></div><span>{profile.wins} wins · {profile.losses} losses · {profile.draws} draws</span></div>
          <div className="match-setup-heading"><span className="social-eyebrow">01 / Choose your challenge</span><h2>What money situation will you practice?</h2><p>Each match is a short scenario with choices, consequences, and a review.</p></div>
          <div className="match-scenario-grid" role="group" aria-label="Choose a financial scenario">
            {matchScenarios.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.id} aria-pressed={scenarioId === item.id} className={`match-scenario-choice ${scenarioId === item.id ? 'selected' : ''}`} onClick={() => { setScenarioId(item.id); setRound(0); }}><span className="match-scenario-icon"><Icon size={20} /></span><strong>{item.title}</strong><small>{item.description}</small><span className="match-round-count">{item.questions.length} rounds · practice</span></button>;
            })}
          </div>
          <div className="match-setup-heading"><span className="social-eyebrow">02 / Choose an opponent</span></div>
          <div className="match-opponent-grid" role="group" aria-label="Choose opponent type">
            <button type="button" className={opponentMode === 'coach' ? 'match-opponent selected' : 'match-opponent'} aria-pressed={opponentMode === 'coach'} onClick={() => setOpponentMode('coach')}><div className="match-opponent-art"><CharacterAvatar character="oinkador" size="large" mood="curious" /></div><span><strong>Match Coach</strong><small>Practice bot with a modeled strategy</small></span>{opponentMode === 'coach' && <BadgeCheck size={16} />}</button>
            <button type="button" className={opponentMode === 'friend' ? 'match-opponent selected' : 'match-opponent'} aria-pressed={opponentMode === 'friend'} onClick={() => setOpponentMode('friend')}><Users size={22} /><span><strong>Friend · Pass and play</strong><small>Two people, one shared screen</small></span>{opponentMode === 'friend' && <BadgeCheck size={16} />}</button>
          </div>
          {opponentMode === 'friend' && <div className="duel-player-setup"><label>Player one<input value={playerOne} maxLength={20} onChange={(event) => setPlayerOneDraft(event.target.value)} /></label><span className="duel-versus">VS</span><label>Player two<input value={playerTwo} maxLength={20} onChange={(event) => setPlayerTwo(event.target.value)} /></label></div>}
          <div className="duel-rules"><BookOpenText size={19} /><div><strong>How rating works</strong><p>Correct decisions earn points. Your Adaptive Elo changes by expected match result and opponent strength: beating a stronger rival moves your rating more than beating a weaker one. It is a practice score, not a measure of real financial ability.</p></div></div>
          <button type="button" className="social-primary-button" onClick={startDuel}>Play {scenario.title} <ArrowRight size={17} /></button>
        </section>
      )}

      {(phase === 'answer' || phase === 'handoff' || phase === 'review') && question && (
        <section className="duel-panel duel-round-panel">
          <div className="duel-topline"><span>{scenario.title.toUpperCase()} · ROUND {String(round + 1).padStart(2, '0')} / {scenario.questions.length}</span><div className="duel-scoreboard"><span>{names[0]} <strong>{scores[0]}</strong></span><i /> <span>{names[1]} <strong>{scores[1]}</strong></span></div></div>
          <div className="duel-progress"><i style={{ width: `${((round + (phase === 'review' ? 1 : 0)) / scenario.questions.length) * 100}%` }} /></div>

          {phase === 'answer' && (
            <div className="duel-question-stage">
              <div className="duel-turn-label"><CharacterAvatar character={turn === 0 ? profile.character : opponentCharacter} size="small" mood="curious" /><span>{names[turn]}’s turn</span></div>
              <span className="duel-scenario-title">{question.title}</span>
              <p className="duel-scenario-copy">{question.scene}</p>
              <h2>{question.question}</h2>
              <div className="duel-answer-list" role="group" aria-label={`${names[turn]} answer choices`}>
                {question.answers.map((answer, index) => <button type="button" key={answer} className={selection === index ? 'duel-answer selected' : 'duel-answer'} aria-pressed={selection === index} onClick={() => setSelection(index)}><span>{String.fromCharCode(65 + index)}</span>{answer}</button>)}
              </div>
              <button type="button" className="social-primary-button" disabled={selection === null} onClick={submitDuelAnswer}>Lock answer <ShieldCheck size={16} /></button>
            </div>
          )}

          {phase === 'handoff' && (
            <div className="duel-handoff"><CharacterAvatar character={characters[(round + 1) % characters.length].id} size="large" mood="celebrating" /><span className="social-eyebrow">Pass the screen</span><h2>Hand it to {names[1]}.</h2><p>{names[0]}’s answer is locked. {names[1]}, make your own call before you see the explanation.</p><button type="button" className="social-primary-button" onClick={() => { setTurn(1); setPhase('answer'); }}>I’m {names[1]} <ArrowRight size={16} /></button></div>
          )}

          {phase === 'review' && (
            <div className="duel-review"><span className="social-eyebrow">The decision, decoded</span><h2>{question.title}</h2><div className="duel-answer-review"><div><span>{names[0]}</span><strong className={roundScores[0] ? 'is-correct' : 'is-wrong'}>{roundScores[0] ? 'Correct · 1 point' : 'Not this time · 0 points'}</strong></div><div><span>{names[1]}</span><strong className={roundScores[1] ? 'is-correct' : 'is-wrong'}>{roundScores[1] ? 'Correct · 1 point' : 'Not this time · 0 points'}</strong></div></div><p>{question.lesson}</p><button type="button" className="social-primary-button" onClick={nextRound}>{round === scenario.questions.length - 1 ? 'See final result' : 'Next scenario'} <ArrowRight size={16} /></button></div>
          )}
        </section>
      )}

      {phase === 'complete' && (
        <section className="duel-panel duel-final-result"><div className="duel-trophy"><Trophy size={32} /></div><span className="social-eyebrow">{scenario.title} · rated match complete</span><h2>{winner}</h2><p>Review one decision you might change after seeing the reasoning. Your Adaptive Financial IQ updates from the match result.</p><div className="duel-final-scores"><div><strong>{scores[0]}</strong><span>{names[0]}</span></div><i>:</i><div><strong>{scores[1]}</strong><span>{names[1]}</span></div></div><div className="duel-xp-earned"><Sparkles size={16} /> Rating {profile.matchRating} · XP and match result saved to profile.</div><button type="button" className="social-primary-button" onClick={() => setPhase('setup')}>Choose another match <RotateCcw size={16} /></button></section>
      )}

      <section className="match-history-panel"><div className="match-history-heading"><div><span className="social-eyebrow">Your rated practice</span><h2>Match history</h2></div><span>{profile.matchesPlayed} played · {profile.matchRating} IQ</span></div>{profile.matchHistory.length === 0 ? <p className="match-history-empty">Your first reviewed match will appear here.</p> : profile.matchHistory.slice(0, 6).map((match) => <article className="match-history-row" key={match.id}><div className="match-history-result">{match.result === 'win' ? <Check size={16} /> : match.result === 'draw' ? '=' : '×'}</div><div className="match-history-copy"><strong>{match.title}</strong><span>vs {match.opponent} · {match.date} · {match.learnerScore}–{match.opponentScore}</span>{historyOpen === match.id && <small>Rating change: {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}. This practice rating reflects this simulated match only.</small>}</div><strong className={match.ratingChange >= 0 ? 'rating-up' : 'rating-down'}>{match.ratingChange > 0 ? '+' : ''}{match.ratingChange}</strong><button type="button" onClick={() => setHistoryOpen(historyOpen === match.id ? null : match.id)}>{historyOpen === match.id ? 'Hide' : 'Review'}</button></article>)}</section>

      <div className="duel-footer-note"><Landmark size={16} /><p>Designed for pass-and-play in person. Online rooms, friend lists, remote scoring, and shared profiles require accounts and a secure backend that this prototype does not yet include.</p></div>
    </section>
  );
}