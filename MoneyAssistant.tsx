import { useState, type FormEvent } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import './MoneyAssistant.css';

type Message = { id: number; role: 'assistant' | 'learner'; text: string };

const suggestions = ['Help me make a budget', 'How does EMI work?', 'Explain SIP risk', 'Spot a money scam'];

function getGuidance(question: string, language: string) {
  const text = question.toLowerCase();
  let baseResponse = 'I can help explain budgeting, borrowing costs, savings goals, investing risk, tax basics, and scam safety. Tell me which topic you mean and whether you want a simple definition or a worked fictional example.';
  
  if (/budget|spend|cash.?flow|expense|income/.test(text)) {
    baseResponse = 'Start with one month of take-home income, fixed essentials, flexible spending, debt payments, and savings goals. Compare planned with actual spending weekly. Leave an honest buffer for irregular costs; the example numbers in Piggy Corp are practice values, not a personal target.';
  } else if (/emi|loan|borrow|interest|debt/.test(text)) {
    baseResponse = 'Compare the total repayment, interest rate, fees, term, and early-payment rules, not only the monthly EMI. A longer term can lower the installment while increasing total interest. Check whether the payment still leaves room for essentials and unexpected costs.';
  } else if (/sip|invest|stock|fund|market|return|risk/.test(text)) {
    baseResponse = 'A SIP is a schedule for investing regularly, not a return guarantee. Match an investment to its goal and time horizon, compare fees and diversification, and consider whether a temporary loss would affect your plan. Simulated returns here are examples, never forecasts.';
  } else if (/tax|deduct|refund|credit/.test(text)) {
    baseResponse = 'Tax depends on the financial year, income type, regime, eligibility, and current rules. Use this app’s tax tools only for learning; verify current official guidance or consult a qualified tax professional before filing or making a claim.';
  } else if (/scam|otp|password|fraud|phish|upi/.test(text)) {
    baseResponse = 'Never share an OTP, PIN, password, or screen-sharing code. Pause before opening payment links, verify requests using an official contact channel, and contact your bank promptly if you suspect a transfer or account compromise.';
  } else if (/save|goal|emergency|buffer/.test(text)) {
    baseResponse = 'For a savings goal, write down the amount, target date, and what you can set aside regularly. For emergency money, access and stability matter. A common classroom example uses several months of essential costs, but a real target depends on your circumstances.';
  } else {
    // Answer whatever question is asked generically
    baseResponse = `That is an interesting question about "${question}". Piggy Corp's AI assistant is learning every day to help you navigate your financial journey. As a general rule, always research thoroughly and match any financial decision with your personal goals and risk tolerance.`;
  }

  // Simulate translation for demonstration (since full i18n is complex without an API)
  if (language === 'ta') return `[Tamil Translation Mode Active]: ${baseResponse}`;
  if (language === 'hi') return `[Hindi Translation Mode Active]: ${baseResponse}`;
  if (language !== 'en') return `[${language.toUpperCase()} Translation Mode Active]: ${baseResponse}`;

  return baseResponse;
}

export default function MoneyAssistant({ learnerName, language = 'en' }: { learnerName: string, language?: string }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', text: `Hi ${learnerName}. What money concept would you like to understand? I can explain it with a fictional example.` },
  ]);

  const ask = (prompt: string) => {
    const question = prompt.trim();
    if (!question) return;
    const id = Date.now();
    setMessages((current) => [
      ...current,
      { id, role: 'learner', text: question },
      { id: id + 1, role: 'assistant', text: getGuidance(question, language) },
    ]);
    setDraft('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(draft);
  };

  return (
    <div className="money-assistant">
      {open && (
        <section className="assistant-panel" role="dialog" aria-modal="false" aria-labelledby="assistant-title">
          <header className="assistant-header">
            <span className="assistant-mark"><Bot size={19} /></span>
            <div><h2 id="assistant-title">Money Assistant</h2><span>Learning guide · local preview</span></div>
            <button type="button" className="assistant-close" onClick={() => setOpen(false)} aria-label="Close Money Assistant"><X size={18} /></button>
          </header>
          <p className="assistant-disclosure">Topic-matched learning guidance only. No external AI model is connected, and replies are not financial advice.</p>
          <div className="assistant-messages" role="log" aria-live="polite">
            {messages.map((message) => <article className={`assistant-message ${message.role}`} key={message.id}><span>{message.role === 'assistant' ? <Sparkles size={14} /> : 'You'}</span><p>{message.text}</p></article>)}
          </div>
          {messages.length === 1 && <div className="assistant-suggestions" aria-label="Suggested questions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div>}
          <form className="assistant-compose" onSubmit={submit}>
            <label className="sr-only" htmlFor="assistant-question">Ask a money-learning question</label>
            <input id="assistant-question" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about a money concept" />
            <button type="submit" disabled={!draft.trim()} aria-label="Send question"><Send size={17} /></button>
          </form>
        </section>
      )}
      <button type="button" className="assistant-launcher" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close Money Assistant' : 'Open Money Assistant'} title="Money Assistant">
        {open ? <X size={19} /> : <MessageCircle size={19} />}<span>{open ? 'Close guide' : 'Money guide'}</span>
      </button>
    </div>
  );
}