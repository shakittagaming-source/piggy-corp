export const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.path": "Learning Path",
    "nav.quest": "Money Quest",
    "nav.goals": "Daily Goals",
    "nav.league": "League",
    "nav.duel": "Duel",
    "nav.feed": "Feed",
    "nav.assistant": "AI Assistant",
    "btn.signout": "Sign Out",
    "tax.title": "Tax Planning",
    "tax.desc": "Learn how to optimize your taxes.",
    "investment.title": "Investments",
    "investment.desc": "Grow your wealth through smart investing.",
    "loan.title": "Loans & Credit",
    "loan.desc": "Understand borrowing and credit scores.",
    "deposit.title": "Savings & Deposits",
    "deposit.desc": "Safe ways to grow your money.",
    "assistant.title": "Money Assistant",
    "assistant.desc": "Ask any financial question.",
    "assistant.voice": "Voice Assistant",
    "tax.module": "04 - Tax Planning",
    "investment.module": "05 - Investments",
    "loan.module": "06 - Loans",
    "deposit.module": "07 - Deposits",
  },
  ta: {
    "nav.home": "முகப்பு",
    "nav.path": "கற்றல் பாதை",
    "nav.quest": "பண தேடல்",
    "nav.goals": "தினசரி இலக்குகள்",
    "nav.league": "லீக்",
    "nav.duel": "போட்டி",
    "nav.feed": "ஊட்டம்",
    "nav.assistant": "AI உதவியாளர்",
    "btn.signout": "வெளியேறு",
    "tax.title": "வரி திட்டமிடல்",
    "tax.desc": "உங்கள் வரிகளை எவ்வாறு குறைப்பது என்பதை அறிக.",
    "investment.title": "முதலீடுகள்",
    "investment.desc": "ஸ்மார்ட் முதலீடு மூலம் செல்வத்தை வளர்க்கவும்.",
    "loan.title": "கடன்கள்",
    "loan.desc": "கடன் மற்றும் கடன் மதிப்பெண்களைப் புரிந்து கொள்ளுங்கள்.",
    "deposit.title": "சேமிப்பு",
    "deposit.desc": "பணத்தை வளர்க்க பாதுகாப்பான வழிகள்.",
    "assistant.title": "பண உதவியாளர்",
    "assistant.desc": "எந்த நிதி கேள்வியையும் கேளுங்கள்.",
    "assistant.voice": "குரல் உதவியாளர்",
    "tax.module": "04 - வரி திட்டமிடல்",
    "investment.module": "05 - முதலீடுகள்",
    "loan.module": "06 - கடன்கள்",
    "deposit.module": "07 - சேமிப்பு",
  }
};

export function t(key: string, lang: string): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return translations['en'][key] || key;
}
