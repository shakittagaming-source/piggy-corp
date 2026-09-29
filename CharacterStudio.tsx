import './CharacterStudio.css';

export const CHARACTER_ROSTER = [
  { id: 'porkfeller', name: 'Sir Porkfeller', role: 'Savings strategist', image: '/characters/porkfeller-cutout.png' },
  { id: 'pigtavius', name: 'Magistrate Pigtavius', role: 'Credit and APR judge', image: '/characters/pigtavius-cutout.png' },
  { id: 'penny', name: 'Penny', role: 'Portfolio defender', image: '/characters/penny-cutout.png' },
  { id: 'oinkador', name: 'Arch-Mage Oinkador', role: 'Future-scenario alchemist', image: '/characters/oinkador-cutout.png' },
  { id: 'vaulty', name: 'Vaulty', role: 'Volatility navigator', image: '/characters/vaulty-cutout.png' },
  { id: 'grunt', name: 'Mechanic Grunt', role: 'Cash-flow mechanic', image: '/characters/grunt-cutout.png' },
  { id: 'king', name: 'King Piggy I', role: 'Financial-health sovereign', image: '/characters/king-piggy-cutout.png' },
] as const;

export type CharacterId = typeof CHARACTER_ROSTER[number]['id'];
export type CharacterSize = 'small' | 'large' | 'portrait';
export type CharacterMood = 'curious' | 'happy' | 'thinking' | 'celebrating' | 'wrong';

export function CharacterAvatar({
  character,
  size = 'small',
  mood = 'happy',
}: {
  character: string;
  size?: CharacterSize;
  mood?: CharacterMood;
}) {
  const details = CHARACTER_ROSTER.find((item) => item.id === character) ?? CHARACTER_ROSTER[0];

  return (
    <span className={`mascot-avatar mascot-${details.id} mascot-size-${size} mascot-mood-${mood}`} role="img" aria-label={`${details.name}, ${details.role}`}>
      <span className="mascot-aura" />
      <span className="mascot-shadow" />
      <img className="mascot-image" src={details.image} alt="" draggable={false} />
      <span className="mascot-reaction" aria-hidden="true">{mood === 'wrong' ? 'TRY AGAIN!' : mood === 'celebrating' ? 'NICE!' : ''}</span>
    </span>
  );
}

export function CharacterLineup({ className = '' }: { className?: string }) {
  const character = CHARACTER_ROSTER[2]; // Penny
  return (
    <div className={`character-lineup ${className}`} aria-label="One Piggy Corp character">
      <figure className="character-lineup-item" key={character.id}>
        <CharacterAvatar character={character.id} size="large" />
        <figcaption>{character.name}</figcaption>
      </figure>
    </div>
  );
}