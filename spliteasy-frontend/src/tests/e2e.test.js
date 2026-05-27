/**
 * SplitEasy E2E Test Suite
 * Covers all phases (1–9) + Draft Mode (Phase 10)
 *
 * Run with: npx vitest run src/tests/e2e.test.js
 * Or:        npm test
 *
 * Prerequisites:
 *   - Backend running at http://localhost:8080
 *   - Frontend dev server at http://localhost:5173  (or preview at 4173)
 *   - Uses the fetch API (Node 18+)
 *
 * This is an integration test against the real HTTP API.
 * It creates and cleans up its own data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API = 'http://localhost:8080/api';

/* ─────────────────── helpers ─────────────────────────────── */
let token1 = '', token2 = '';
let user1Id, user2Id;
let groupId, inviteCode;
let expenseId, settlementId;
let draftId, draftParticipantId, draftExpenseId;

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, data: json };
}

/* ─────────────────── Phase 1: Auth ─────────────────────────── */
describe('Phase 1: Authentication', () => {
  const ts = Date.now();
  const email1 = `user1_${ts}@test.com`;
  const email2 = `user2_${ts}@test.com`;

  it('registers user1', async () => {
    const r = await req('POST', '/auth/register', { fullName: 'User One', email: email1, password: 'Test1234!' });
    expect(r.status).toBe(201);
    expect(r.data.accessToken).toBeTruthy();
    token1 = r.data.accessToken;
    user1Id = r.data.userId;
  });

  it('registers user2', async () => {
    const r = await req('POST', '/auth/register', { fullName: 'User Two', email: email2, password: 'Test1234!' });
    expect(r.status).toBe(201);
    token2 = r.data.accessToken;
    user2Id = r.data.userId;
  });

  it('rejects duplicate email', async () => {
    const r = await req('POST', '/auth/register', { fullName: 'Dup', email: email1, password: 'Test1234!' });
    expect(r.status).toBe(400);
  });

  it('logs in user1', async () => {
    const r = await req('POST', '/auth/login', { email: email1, password: 'Test1234!' });
    expect(r.status).toBe(200);
    expect(r.data.accessToken).toBeTruthy();
    token1 = r.data.accessToken;
  });

  it('rejects wrong password', async () => {
    const r = await req('POST', '/auth/login', { email: email1, password: 'wrongpassword' });
    expect(r.status).toBe(400);
  });

  it('returns current user with valid token', async () => {
    const r = await req('GET', '/auth/me', null, token1);
    expect(r.status).toBe(200);
    expect(r.data.email).toContain('user1_');
  });
});

/* ─────────────────── Phase 2: Groups ───────────────────────── */
describe('Phase 2: Groups', () => {
  it('creates a group', async () => {
    const r = await req('POST', '/groups', { name: 'Test Group', category: 'TRIP', currency: 'INR' }, token1);
    expect(r.status).toBe(201);
    groupId = r.data.id;
    inviteCode = r.data.inviteCode;
    expect(groupId).toBeTruthy();
    expect(inviteCode).toBeTruthy();
  });

  it('lists user groups', async () => {
    const r = await req('GET', '/groups', null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.some(g => g.id === groupId)).toBe(true);
  });

  it('gets group detail', async () => {
    const r = await req('GET', `/groups/${groupId}`, null, token1);
    expect(r.status).toBe(200);
    expect(r.data.name).toBe('Test Group');
  });

  it('gets group preview (public)', async () => {
    const r = await req('GET', `/groups/join/${inviteCode}`);
    expect(r.status).toBe(200);
    expect(r.data.name).toBe('Test Group');
  });

  it('user2 joins group via invite', async () => {
    const r = await req('POST', `/groups/join/${inviteCode}`, null, token2);
    expect(r.status).toBe(200);
    expect(r.data.id).toBe(groupId);
  });

  it('gets group members', async () => {
    const r = await req('GET', `/groups/${groupId}/members`, null, token1);
    expect(r.status).toBe(200);
    expect(r.data.length).toBe(2);
  });

  it('updates group name', async () => {
    const r = await req('PUT', `/groups/${groupId}`, { name: 'Updated Group', category: 'TRIP', currency: 'INR' }, token1);
    expect(r.status).toBe(200);
    expect(r.data.name).toBe('Updated Group');
  });
});

/* ─────────────────── Phase 3: Expenses ─────────────────────── */
describe('Phase 3: Expenses', () => {
  it('creates an EQUAL expense', async () => {
    const r = await req('POST', `/groups/${groupId}/expenses`, {
      description: 'Dinner',
      amount: 1000,
      paidById: user1Id,
      splitType: 'EQUAL',
      category: 'FOOD',
      expenseDate: new Date().toISOString().split('T')[0],
      splits: [{ userId: user1Id }, { userId: user2Id }],
    }, token1);
    expect(r.status).toBe(201);
    expenseId = r.data.id;
    expect(expenseId).toBeTruthy();
    expect(r.data.amount).toBe(1000);
  });

  it('gets expenses list', async () => {
    const r = await req('GET', `/groups/${groupId}/expenses`, null, token1);
    expect(r.status).toBe(200);
    const items = Array.isArray(r.data) ? r.data : (r.data.content ?? []);
    expect(items.some(e => e.id === expenseId)).toBe(true);
  });

  it('gets single expense', async () => {
    const r = await req('GET', `/groups/${groupId}/expenses/${expenseId}`, null, token1);
    expect(r.status).toBe(200);
    expect(r.data.description).toBe('Dinner');
  });

  it('updates expense description', async () => {
    const r = await req('PUT', `/groups/${groupId}/expenses/${expenseId}`, {
      description: 'Team Dinner',
      amount: 1000,
      paidById: user1Id,
      splitType: 'EQUAL',
      category: 'FOOD',
      expenseDate: new Date().toISOString().split('T')[0],
      splits: [{ userId: user1Id }, { userId: user2Id }],
    }, token1);
    expect(r.status).toBe(200);
    expect(r.data.description).toBe('Team Dinner');
  });
});

/* ─────────────────── Phase 4: Balances ─────────────────────── */
describe('Phase 4: Balances', () => {
  it('gets group balances', async () => {
    const r = await req('GET', `/groups/${groupId}/balances`, null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBe(2);
  });

  it('gets simplified debts', async () => {
    const r = await req('GET', `/groups/${groupId}/balances/simplified`, null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBeGreaterThanOrEqual(1);
    const debt = r.data[0];
    expect(debt.from).toBeTruthy();
    expect(debt.to).toBeTruthy();
    expect(Number(debt.amount)).toBe(500);
  });
});

/* ─────────────────── Phase 5: Settlements ──────────────────── */
describe('Phase 5: Settlements', () => {
  it('creates a settlement', async () => {
    const r = await req('POST', `/groups/${groupId}/settlements`, {
      paidToId: user1Id,
      amount: 500,
      settledAt: new Date().toISOString(),
    }, token2);
    expect(r.status).toBe(201);
    settlementId = r.data.id;
    expect(settlementId).toBeTruthy();
  });

  it('lists group settlements', async () => {
    const r = await req('GET', `/groups/${groupId}/settlements`, null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.some(s => s.id === settlementId)).toBe(true);
  });

  it('simplified debts are 0 after settlement', async () => {
    const r = await req('GET', `/groups/${groupId}/balances/simplified`, null, token1);
    expect(r.status).toBe(200);
    expect(r.data.length).toBe(0);
  });
});

/* ─────────────────── Phase 6: Dashboard ────────────────────── */
describe('Phase 6: Dashboard', () => {
  it('gets dashboard summary', async () => {
    const r = await req('GET', '/dashboard', null, token1);
    expect(r.status).toBe(200);
    expect(r.data).toHaveProperty('youAreOwed');
    expect(r.data).toHaveProperty('youOwe');
    expect(r.data).toHaveProperty('overallBalance');
  });
});

/* ─────────────────── Phase 7: Group leave/delete ───────────── */
describe('Phase 7: Group management', () => {
  it('non-creator cannot delete group', async () => {
    const r = await req('DELETE', `/groups/${groupId}`, null, token2);
    expect(r.status).toBe(403);
  });

  it('user2 can leave group', async () => {
    const r = await req('POST', `/groups/${groupId}/leave`, null, token2);
    expect(r.status).toBe(204);
  });

  it('user1 deletes expense', async () => {
    const r = await req('DELETE', `/groups/${groupId}/expenses/${expenseId}`, null, token1);
    expect(r.status).toBe(204);
  });

  it('user1 deletes group', async () => {
    const r = await req('DELETE', `/groups/${groupId}`, null, token1);
    expect(r.status).toBe(204);
  });
});

/* ─────────────────── Phase 10: Draft Mode ──────────────────── */
describe('Phase 10: Draft Mode (Guest Splits)', () => {
  it('creates a draft session', async () => {
    const r = await req('POST', '/drafts', { title: 'Goa Trip', currency: 'INR' }, token1);
    expect(r.status).toBe(201);
    draftId = r.data.id;
    expect(draftId).toBeTruthy();
    expect(r.data.title).toBe('Goa Trip');
    expect(r.data.currency).toBe('INR');
    expect(r.data.participants.length).toBe(1);
    expect(r.data.participants[0].isCreator).toBe(true);
    expect(r.data.shareToken).toBeTruthy();
    draftParticipantId = r.data.participants[0].id;
  });

  it('lists draft sessions', async () => {
    const r = await req('GET', '/drafts', null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.some(d => d.id === draftId)).toBe(true);
  });

  it('adds a guest participant', async () => {
    const r = await req('POST', `/drafts/${draftId}/participants`, { displayName: 'Alice' }, token1);
    expect(r.status).toBe(201);
    expect(r.data.displayName).toBe('Alice');
    expect(r.data.isCreator).toBe(false);
    draftParticipantId = r.data.id;
  });

  it('rejects duplicate participant name', async () => {
    const r = await req('POST', `/drafts/${draftId}/participants`, { displayName: 'Alice' }, token1);
    expect(r.status).toBe(400);
  });

  it('adds another participant', async () => {
    const r = await req('POST', `/drafts/${draftId}/participants`, { displayName: 'Bob' }, token1);
    expect(r.status).toBe(201);
    expect(r.data.displayName).toBe('Bob');
  });

  it('gets draft session detail with participants', async () => {
    const r = await req('GET', `/drafts/${draftId}`, null, token1);
    expect(r.status).toBe(200);
    expect(r.data.participants.length).toBe(3);
  });

  it('adds an EQUAL expense', async () => {
    const creatorParticipantId = (await req('GET', `/drafts/${draftId}`, null, token1)).data.participants.find(p => p.isCreator).id;
    const r = await req('POST', `/drafts/${draftId}/expenses`, {
      description: 'Dinner at hotel',
      amount: 900,
      paidByParticipantId: creatorParticipantId,
      category: 'FOOD',
      splitType: 'EQUAL',
      expenseDate: new Date().toISOString().split('T')[0],
    }, token1);
    expect(r.status).toBe(201);
    draftExpenseId = r.data.id;
    expect(r.data.description).toBe('Dinner at hotel');
    expect(Number(r.data.amount)).toBe(900);
    expect(r.data.splits.length).toBe(3);
  });

  it('gets settlements for draft', async () => {
    const r = await req('GET', `/drafts/${draftId}/settlements`, null, token1);
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBeGreaterThanOrEqual(1);
    const totalOwed = r.data.reduce((sum, d) => sum + Number(d.amount), 0);
    expect(totalOwed).toBeCloseTo(600, 0);
  });

  it('updates draft expense', async () => {
    const draft = (await req('GET', `/drafts/${draftId}`, null, token1)).data;
    const creatorId = draft.participants.find(p => p.isCreator).id;
    const r = await req('PUT', `/drafts/${draftId}/expenses/${draftExpenseId}`, {
      description: 'Updated Dinner',
      amount: 1200,
      paidByParticipantId: creatorId,
      splitType: 'EQUAL',
      category: 'FOOD',
      expenseDate: new Date().toISOString().split('T')[0],
    }, token1);
    expect(r.status).toBe(200);
    expect(r.data.description).toBe('Updated Dinner');
    expect(Number(r.data.amount)).toBe(1200);
  });

  it('updates draft session title', async () => {
    const r = await req('PATCH', `/drafts/${draftId}`, { title: 'Goa Trip 2025' }, token1);
    expect(r.status).toBe(200);
    expect(r.data.title).toBe('Goa Trip 2025');
  });

  it('cannot remove creator', async () => {
    const creatorParticipantId = (await req('GET', `/drafts/${draftId}`, null, token1)).data.participants.find(p => p.isCreator).id;
    const r = await req('DELETE', `/drafts/${draftId}/participants/${creatorParticipantId}`, null, token1);
    expect(r.status).toBe(403);
  });

  it('public share endpoint returns draft without auth', async () => {
    const shareToken = (await req('GET', `/drafts/${draftId}`, null, token1)).data.shareToken;
    const r = await fetch(`${API}/share/${shareToken}`);
    const data = await r.json();
    expect(r.status).toBe(200);
    expect(data.title).toBe('Goa Trip 2025');
    expect(data.participants).toBeTruthy();
    expect(data.expenses).toBeTruthy();
  });

  it('returns 404 for unknown share token', async () => {
    const r = await fetch(`${API}/share/nonexistenttoken12345`);
    expect(r.status).toBe(404);
  });

  it('deletes draft expense', async () => {
    const r = await req('DELETE', `/drafts/${draftId}/expenses/${draftExpenseId}`, null, token1);
    expect(r.status).toBe(204);
  });

  it('removes a guest participant', async () => {
    const r = await req('DELETE', `/drafts/${draftId}/participants/${draftParticipantId}`, null, token1);
    expect(r.status).toBe(204);
  });

  it('deletes draft session', async () => {
    const r = await req('DELETE', `/drafts/${draftId}`, null, token1);
    expect(r.status).toBe(204);
  });
});

/* ─────────────────── Security ───────────────────────────────── */
describe('Security', () => {
  it('rejects unauthenticated access to /drafts', async () => {
    const r = await req('GET', '/drafts');
    expect(r.status).toBe(403);
  });

  it('rejects access to another user\'s draft', async () => {
    const createR = await req('POST', '/drafts', { title: 'Private', currency: 'INR' }, token1);
    const id = createR.data.id;
    const r = await req('GET', `/drafts/${id}`, null, token2);
    expect(r.status).toBe(403);
    await req('DELETE', `/drafts/${id}`, null, token1);
  });
});
