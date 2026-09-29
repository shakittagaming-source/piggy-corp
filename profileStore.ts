export type LearnerProfile = {
  name: string;
  character: string;
  experience: number;
  gems: number;
  hearts: number;
  streakDays: number;
  activeDays: number;
  lastActiveDate: string;
  currentDay: string;
  currentWeek: string;
  currentMonth: string;
  todayLessons: number;
  todayMastered: number;
  todayMinutes: number;
  weeklyExperience: number;
  monthlyQuestPoints: number;
  completedLessons: number;
  masteredLessons: number;
  studyMinutes: number;
  completedNodes: string[];
  claimedRewards: string[];
  friendQuestJoined: boolean;
  matchRating: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  topFinishes: number;
  matchHistory: MatchRecord[];
  reactions: Record<string, string>;
  friendStreaks: Record<string, FriendStreak>;
};

export type MatchRecord = {
  id: string;
  title: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  ratingChange: number;
  learnerScore: number;
  opponentScore: number;
  date: string;
};

export type FriendStreak = { days: number; lastCheckIn: string };

export const PROFILE_KEY = 'finwise-learner-profile-v1';
const todayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = (date: Date) => {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
};
const monthKey = () => new Date().toISOString().slice(0, 7);

export const defaultProfile: LearnerProfile = {
  name: 'Money Explorer', character: 'king', experience: 0, gems: 25, hearts: 5,
  streakDays: 0, activeDays: 0, lastActiveDate: '', currentDay: todayKey(),
  currentWeek: weekKey(new Date()), currentMonth: monthKey(), todayLessons: 0,
  todayMastered: 0, todayMinutes: 0, weeklyExperience: 0, monthlyQuestPoints: 0,
  completedLessons: 0, masteredLessons: 0, studyMinutes: 0, completedNodes: [],
  claimedRewards: [], friendQuestJoined: false, matchRating: 1000, matchesPlayed: 0,
  wins: 0, losses: 0, draws: 0, topFinishes: 0, matchHistory: [], reactions: {},
  friendStreaks: {},
};

function normalizedProfile(value: Partial<LearnerProfile> | null | undefined): LearnerProfile {
  const today = todayKey();
  const week = weekKey(new Date());
  const month = monthKey();
  const profile = { ...defaultProfile, ...value };
  const legacyCharacters: Record<string, string> = {
    nova: 'porkfeller', atlas: 'pigtavius', sage: 'penny', bolt: 'oinkador',
    orbit: 'grunt', astra: 'king',
  };
  const validCharacters = ['porkfeller', 'pigtavius', 'penny', 'oinkador', 'vaulty', 'grunt', 'king'];
  return {
    ...profile,
    name: typeof profile.name === 'string' ? profile.name : defaultProfile.name,
    character: validCharacters.includes(profile.character) ? profile.character : legacyCharacters[profile.character] ?? defaultProfile.character,
    experience: Number.isFinite(profile.experience) ? profile.experience : 0,
    gems: Number.isFinite(profile.gems) ? profile.gems : 25,
    hearts: Number.isFinite(profile.hearts) ? profile.hearts : 5,
    currentDay: today,
    currentWeek: week,
    currentMonth: month,
    todayLessons: profile.currentDay === today ? profile.todayLessons : 0,
    todayMastered: profile.currentDay === today ? profile.todayMastered : 0,
    todayMinutes: profile.currentDay === today ? profile.todayMinutes : 0,
    weeklyExperience: profile.currentWeek === week ? profile.weeklyExperience : 0,
    monthlyQuestPoints: profile.currentMonth === month ? profile.monthlyQuestPoints : 0,
    completedNodes: Array.isArray(profile.completedNodes) ? profile.completedNodes : [],
    claimedRewards: Array.isArray(profile.claimedRewards) ? profile.claimedRewards : [],
    matchHistory: Array.isArray(profile.matchHistory) ? profile.matchHistory : [],
    reactions: profile.reactions && typeof profile.reactions === 'object' ? profile.reactions : {},
    friendStreaks: profile.friendStreaks && typeof profile.friendStreaks === 'object' ? profile.friendStreaks : {},
  };
}

export function readProfile(): LearnerProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return defaultProfile;
    return normalizedProfile(JSON.parse(stored) as Partial<LearnerProfile>);
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: LearnerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(normalizedProfile(profile)));
  window.dispatchEvent(new Event('finwise-profile-update'));
}

export function recordExperience(points: number) {
  const profile = readProfile();
  const today = todayKey();
  const last = profile.lastActiveDate;
  const daysSinceLast = last ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 86400000) : 0;
  const streakDays = last === today ? profile.streakDays : daysSinceLast === 1 ? profile.streakDays + 1 : 1;
  const activeDays = last === today ? profile.activeDays : profile.activeDays + 1;
  saveProfile({
    ...profile,
    experience: profile.experience + points,
    weeklyExperience: profile.weeklyExperience + points,
    monthlyQuestPoints: profile.monthlyQuestPoints + points,
    gems: profile.gems + Math.max(1, Math.floor(points / 10)),
    streakDays,
    activeDays,
    lastActiveDate: today,
  });
}

export function completeLearningNode(nodeId: string, score: number, experiencePoints?: number) {
  const profile = readProfile();
  if (profile.completedNodes.includes(nodeId)) return false;
  saveProfile({
    ...profile,
    completedNodes: [...profile.completedNodes, nodeId],
    completedLessons: profile.completedLessons + 1,
    todayLessons: profile.todayLessons + 1,
    masteredLessons: profile.masteredLessons + Number(score >= 90),
    todayMastered: profile.todayMastered + Number(score >= 90),
  });
  recordExperience(experiencePoints ?? (score >= 90 ? 25 : 15));
  return true;
}

export function addStudyMinutes(minutes: number) {
  if (minutes <= 0) return;
  const profile = readProfile();
  saveProfile({ ...profile, studyMinutes: profile.studyMinutes + minutes, todayMinutes: profile.todayMinutes + minutes });
}

export function claimReward(rewardId: string, gemAmount: number) {
  const profile = readProfile();
  if (profile.claimedRewards.includes(rewardId)) return false;
  saveProfile({ ...profile, claimedRewards: [...profile.claimedRewards, rewardId], gems: profile.gems + gemAmount });
  return true;
}

export function joinFriendQuest(joined: boolean) {
  saveProfile({ ...readProfile(), friendQuestJoined: joined });
}

export function recordMatch(title: string, opponent: string, result: MatchRecord['result'], learnerScore: number, opponentScore: number, opponentRating = 1000) {
  const profile = readProfile();
  const expectedScore = 1 / (1 + 10 ** ((opponentRating - profile.matchRating) / 400));
  const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const ratingChange = Math.round(24 * (actualScore - expectedScore));
  const record: MatchRecord = { id: `${Date.now()}`, title, opponent, result, ratingChange, learnerScore, opponentScore, date: todayKey() };
  saveProfile({
    ...profile,
    matchRating: Math.max(600, profile.matchRating + ratingChange),
    matchesPlayed: profile.matchesPlayed + 1,
    wins: profile.wins + Number(result === 'win'),
    losses: profile.losses + Number(result === 'loss'),
    draws: profile.draws + Number(result === 'draw'),
    topFinishes: profile.topFinishes + Number(result === 'win' && profile.matchRating >= 1200),
    matchHistory: [record, ...profile.matchHistory].slice(0, 20),
  });
  recordExperience(result === 'win' ? 30 : result === 'draw' ? 20 : 10);
  return record;
}

export function toggleReaction(postId: string, reaction: string) {
  const profile = readProfile();
  const reactions = { ...profile.reactions };
  if (reactions[postId] === reaction) delete reactions[postId];
  else reactions[postId] = reaction;
  saveProfile({ ...profile, reactions });
}

export function checkInWithFriend(friendId: string) {
  const profile = readProfile();
  const today = todayKey();
  const previous = profile.friendStreaks[friendId];
  if (previous?.lastCheckIn === today) return false;
  const daysSince = previous?.lastCheckIn
    ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${previous.lastCheckIn}T00:00:00Z`)) / 86400000)
    : 0;
  const days = !previous ? 1 : daysSince === 1 ? previous.days + 1 : 1;
  saveProfile({ ...profile, friendStreaks: { ...profile.friendStreaks, [friendId]: { days, lastCheckIn: today } } });
  return true;
}