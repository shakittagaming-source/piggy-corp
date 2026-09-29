import { useState, type FormEvent } from 'react';
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { CharacterLineup } from './CharacterStudio';
import { createLocalAccount, signInLocalAccount, type AuthSession } from './authStore';
import './AuthScreen.css';

type AuthMode = 'create' | 'signin';

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<AuthMode>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (mode === 'create' && password !== confirmPassword) {
      setError('Those passwords do not match.');
      return;
    }
    if (mode === 'create' && password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    setBusy(true);
    try {
      const session = mode === 'create'
        ? await createLocalAccount(name, email, password)
        : await signInLocalAccount(email, password);
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not complete that request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-brand-panel" aria-label="Piggy Corp">
        <div className="auth-brand-lockup"><img src="/piggy-corp-logo.png" alt="" /><span>Piggy Corp<small>Play smart with money</small></span></div>
        <div className="auth-brand-copy"><span className="auth-kicker"><Sparkles size={15} /> Your money-learning studio</span><h1>Make your next money choice a smarter one.</h1><p>Pick up practical habits through short lessons, clear simulations, and memorable characters.</p></div>
        <CharacterLineup className="auth-character-lineup" />
        <div className="auth-trust-note"><ShieldCheck size={17} /><span>Your learning progress stays in this browser preview.</span></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-heading"><span className="auth-kicker">Learner access</span><h2>{mode === 'create' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'create' ? 'Set up a local learner profile to continue.' : 'Sign in to this browser profile.'}</p></div>
        <div className="auth-mode-switch" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === 'create'} className={mode === 'create' ? 'active' : ''} onClick={() => { setMode('create'); setError(''); }}>Create account</button>
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'create' && <label><span>Your name</span><div><UserRound size={17} /><input autoComplete="name" required maxLength={24} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Money Explorer" /></div></label>}
          <label><span>Email</span><div><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
          <label><span>Password</span><div><KeyRound size={17} /><input type="password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></div></label>
          {mode === 'create' && <label><span>Confirm password</span><div><KeyRound size={17} /><input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter it again" /></div></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'create' ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
        </form>
        <p className="auth-local-disclosure"><ShieldCheck size={16} /> Local preview only: account records stay on this device. This is not server-backed sign-in and cannot sync or recover accounts.</p>
      </section>
    </main>
  );
}