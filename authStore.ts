export type AuthSession = { email: string; displayName: string };

type LocalAccount = AuthSession & { salt: string; passwordHash: string };

const accountsKey = 'piggy-corp-local-accounts-v1';
const sessionKey = 'piggy-corp-local-session-v1';
const encoder = new TextEncoder();

function readAccounts(): Record<string, LocalAccount> {
  try {
    return JSON.parse(localStorage.getItem(accountsKey) ?? '{}') as Record<string, LocalAccount>;
  } catch {
    return {};
  }
}

function toBase64(bytes: Uint8Array) {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBuffer, iterations: 180_000, hash: 'SHA-256' }, key, 256);
  return toBase64(new Uint8Array(bits));
}

function saveSession(account: AuthSession) {
  localStorage.setItem(sessionKey, JSON.stringify(account));
  return account;
}

export function getStoredSession(): AuthSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(sessionKey) ?? 'null') as AuthSession | null;
    return session && typeof session.email === 'string' && typeof session.displayName === 'string' ? session : null;
  } catch {
    return null;
  }
}

export async function createLocalAccount(displayName: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts[normalizedEmail]) throw new Error('An account with this email already exists on this device.');

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: LocalAccount = {
    displayName: displayName.trim(),
    email: normalizedEmail,
    salt: toBase64(salt),
    passwordHash: await hashPassword(password, salt),
  };
  localStorage.setItem(accountsKey, JSON.stringify({ ...accounts, [normalizedEmail]: account }));
  return saveSession({ displayName: account.displayName, email: account.email });
}

export async function signInLocalAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readAccounts()[normalizedEmail];
  if (!account) throw new Error('No account exists on this device yet. Create one to get started.');
  const salt = Uint8Array.from(atob(account.salt), (character) => character.charCodeAt(0));
  const candidate = await hashPassword(password, salt);
  if (candidate !== account.passwordHash) throw new Error('That password does not match this local account.');
  return saveSession({ displayName: account.displayName, email: account.email });
}

export function clearLocalSession() {
  localStorage.removeItem(sessionKey);
}