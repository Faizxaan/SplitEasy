const STORAGE_KEY = 'gqs_sessions';

export const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316',
  '#10B981', '#06B6D4', '#3B82F6', '#84CC16', '#EAB308',
  '#14B8A6', '#A855F7', '#FB923C', '#34D399', '#60A5FA',
];

export function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function loadSession(id) {
  return loadSessions().find(s => s.id === id) || null;
}

export function persistSession(session) {
  const all = loadSessions();
  const idx = all.findIndex(s => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.unshift(session);
  saveSessions(all);
}

export function removeSession(id) {
  saveSessions(loadSessions().filter(s => s.id !== id));
}

export function createNewSession(title, currency) {
  return {
    id: crypto.randomUUID(),
    title,
    currency,
    createdAt: new Date().toISOString(),
    participants: [],
    expenses: [],
  };
}

/* ── Settlement computation (same result as backend) ─────── */
export function computeSettlements(participants, expenses) {
  if (!participants.length || !expenses.length) return [];

  const balance = {};
  participants.forEach(p => { balance[p.id] = 0; });

  expenses.forEach(exp => {
    if (!Object.prototype.hasOwnProperty.call(balance, exp.paidByParticipantId)) return;
    balance[exp.paidByParticipantId] += exp.amount;

    if (!exp.splits || exp.splits.length === 0 || exp.splitType === 'EQUAL' || !exp.splitType) {
      const n = participants.length;
      const share = exp.amount / n;
      participants.forEach(p => { balance[p.id] -= share; });
    } else {
      if (exp.splitType === 'EXACT') {
        exp.splits.forEach(s => { if (balance[s.participantId] !== undefined) balance[s.participantId] -= (s.shareValue || 0); });
      } else if (exp.splitType === 'PERCENTAGE') {
        exp.splits.forEach(s => { if (balance[s.participantId] !== undefined) balance[s.participantId] -= (exp.amount * (s.shareValue || 0)) / 100; });
      } else if (exp.splitType === 'SHARES') {
        const totalShares = exp.splits.reduce((sum, s) => sum + (s.shareValue || 0), 0);
        if (totalShares > 0) {
          exp.splits.forEach(s => { if (balance[s.participantId] !== undefined) balance[s.participantId] -= (exp.amount * (s.shareValue || 0)) / totalShares; });
        }
      }
    }
  });

  const creditors = [], debtors = [];
  participants.forEach(p => {
    const b = balance[p.id];
    if (b > 0.01) creditors.push({ ...p, amount: b });
    else if (b < -0.01) debtors.push({ ...p, amount: -b });
  });
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount);
    if (amount > 0.01) {
      settlements.push({
        from: { displayName: debtors[j].displayName, avatarColor: debtors[j].avatarColor },
        to:   { displayName: creditors[i].displayName, avatarColor: creditors[i].avatarColor },
        amount: parseFloat(amount.toFixed(2)),
      });
    }
    creditors[i].amount -= amount;
    debtors[j].amount -= amount;
    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }
  return settlements;
}
