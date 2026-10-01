const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
const root = path.resolve(__dirname, '..');

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const resolve = name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts', mocks);
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(root, path.dirname(file), name)) + '.ts', mocks);
    return require(name);
  };
  new Function('require', 'module', 'exports', code)(resolve, module, module.exports);
  return module.exports;
}

const { safeRedirectPath } = load('src/lib/safe-redirect.ts');
test('safe redirects retain internal filters and reject external URLs, schemes and escaped slashes', () => {
  for (const value of [null, '', 'https://evil.test', '//evil.test', 'javascript:alert(1)', '/\\evil.test', '/%2f/evil.test', '/%5cevil.test', '/\n/evil.test', '/%00evil', '/%zz']) {
    assert.equal(safeRedirectPath(value), '/home', String(value));
  }
  assert.equal(safeRedirectPath('/classificados?ad=123#comments'), '/classificados?ad=123#comments');
});

const { nextReactionCounts } = load('src/lib/reaction-counts.ts');
test('reaction counts add, remove and switch without double keys or inflating total', () => {
  const original = { like: 2, heart: 1, laugh: 0, fire: 0, total: 3 };
  assert.deepEqual(nextReactionCounts(original, null, 'like'), { ...original, like: 3, total: 4 });
  assert.deepEqual(nextReactionCounts(original, 'like', 'like'), { ...original, like: 1, total: 2 });
  assert.deepEqual(nextReactionCounts(original, 'heart', 'like'), { ...original, heart: 0, like: 3 });
  assert.equal(original.like, 2, 'input is immutable');
  assert.equal(nextReactionCounts({ like: 0, heart: 0, laugh: 0, fire: 0, total: 0 }, 'like', 'like').total, 0);
});

const { shareLink } = load('src/lib/share-link.ts');
test('native sharing uses the real URL; cancellation is not reported as a share', async () => {
  const payload = { url: 'https://appconfilar.com.br/classificados?ad=123', title: 'Anúncio' };
  let sent;
  assert.equal(await shareLink(payload, { share: async data => { sent = data; } }), 'shared');
  assert.deepEqual(sent, payload);
  const abort = new Error('cancelled'); abort.name = 'AbortError';
  assert.equal(await shareLink(payload, { share: async () => { throw abort; } }), 'cancelled');
  assert.equal(await shareLink(payload, { clipboard: { writeText: async value => { sent = value; } } }), 'copied');
  assert.equal(sent, payload.url);
  await assert.rejects(shareLink(payload, { share: async () => { throw new Error('failure'); } }));
});

function middlewareFixture(user = null, admin = false) {
  let localeCalls = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => {
      const query = { select: () => query, eq: () => query, single: async () => ({ data: admin ? { id: 'admin' } : null }) };
      return query;
    },
  };
  const module = load('middleware.ts', {
    '@supabase/ssr': { createServerClient: (_url, _key, options) => {
      client.auth.getUser = async () => {
        options.cookies.setAll([{ name: 'refresh-a', value: 'a' }, { name: 'refresh-b', value: 'b' }]);
        return { data: { user } };
      };
      return client;
    } },
    'next-intl/middleware': () => request => { localeCalls++; return NextResponse.next(); },
    './src/i18n/routing': { routing: {} },
  });
  return { run: path => module.middleware(new NextRequest('https://confilar.test' + path)), localeCalls: () => localeCalls };
}
test('locale middleware cannot bypass protected pages and preserves filters plus refreshed cookies', async () => {
  const f = middlewareFixture();
  const response = await f.run('/en/feed?post=123');
  assert.equal(response.status, 307);
  const target = new URL(response.headers.get('location'));
  assert.equal(target.pathname, '/auth');
  assert.equal(target.searchParams.get('redirect'), '/en/feed?post=123');
  assert.equal(response.cookies.get('refresh-a').value, 'a');
  assert.equal(response.cookies.get('refresh-b').value, 'b');
});
test('API responses are not localized; unauthenticated admin requests are rejected', async () => {
  const f = middlewareFixture();
  assert.equal((await f.run('/api/gestao-confi/purchases')).status, 401);
  assert.equal(f.localeCalls(), 0);
  assert.equal((await f.run('/api/payment/paghiper/webhook')).status, 200, 'external webhook remains reachable');
});
test('non-admin users cannot reach admin APIs, while public classifieds and profiles remain accessible', async () => {
  const f = middlewareFixture({ id: 'user' });
  assert.equal((await f.run('/api/gestao-confi/purchases')).status, 403);
  assert.equal((await f.run('/classificados')).status, 200);
  assert.equal((await middlewareFixture().run('/perfil/public-user')).status, 200);
  assert.equal((await f.run('/auth/callback?code=test')).status, 200);
  const signedIn = await f.run('/auth?redirect=https://evil.test');
  assert.equal(new URL(signedIn.headers.get('location')).pathname, '/home');
});

function routeFixture(file, adminClient, authClient = {}) {
  const user = { id: 'test-user', email: 'test@example.test' };
  return load(file, {
    '@/lib/authenticatedRoute': { withAuth: handler => request => handler(request, authClient, user) },
    '@/lib/supabase': { createAdminSupabaseClient: () => adminClient },
    '@supabase/supabase-js': { createClient: () => adminClient },
  });
}
test('payment status queries require the authenticated purchase owner', async () => {
  const filters = [];
  const query = { select: () => query, eq: (key, value) => { filters.push([key, value]); return query; },
    single: async () => ({ data: null, error: null }) };
  const route = routeFixture('src/app/api/payment/paghiper/check/route.ts', { from: () => query });
  const response = await route.GET(new NextRequest('https://confilar.test/api/payment/paghiper/check?purchase_id=another-users-purchase'));
  assert.equal(response.status, 404);
  assert.deepEqual(filters, [['id', 'another-users-purchase'], ['user_id', 'test-user']]);
});
test('client emailVerified cannot authorize account deletion; verification happens before all deletes', async () => {
  let writes = 0;
  const route = routeFixture('src/app/api/lgpd/delete-account/route.ts', { from: () => { writes++; throw new Error('must never write'); } },
    { auth: { getClaims: async () => ({ data: { claims: { sub: 'test-user', amr: [] } }, error: null }) } });
  const request = new NextRequest('https://confilar.test/api/lgpd/delete-account', {
    method: 'POST', body: JSON.stringify({ emailVerified: true, confirmation: 'DELETAR CONTA' }),
  });
  assert.equal((await route.POST(request)).status, 401);
  assert.equal(writes, 0);
});
test('missing share tables are errors, duplicate shares are not counted again', async () => {
  async function run(error) {
    const adQuery = { select: () => adQuery, eq: () => adQuery, single: async () => ({ data: { id: 'ad' } }) };
    const shareQuery = { insert: () => shareQuery, select: () => shareQuery, single: async () => ({ error }) };
    const route = routeFixture('src/app/api/classifieds/share/record/route.ts', { from: table => table === 'classified_ads' ? adQuery : shareQuery });
    return route.POST(new NextRequest('https://confilar.test/api/classifieds/share/record', { method: 'POST', body: JSON.stringify({ adId: 'ad', shareType: 'link' }) }));
  }
  assert.equal((await run({ code: 'PGRST205' })).status, 503);
  assert.equal((await (await run({ code: '23505' })).json()).isNew, false);
  assert.equal((await (await run(null)).json()).isNew, true);
});

// Small hook runtime, compiling the actual engagement hook. All writes are fake.
function engagementFixture(failWrite = false) {
  const slots = []; const effects = []; let cursor = 0; let writes = 0; let release;
  const deferred = new Promise(resolve => { release = resolve; });
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], update => { slots[i] = typeof update === 'function' ? update(slots[i]) : update; }]; },
    useRef(initial) { const [ref] = react.useState({ current: initial }); return ref; },
    useMemo(fn) { cursor++; return fn(); }, useCallback(fn) { cursor++; return fn; },
    useEffect(fn) { cursor++; effects.push(fn); },
  };
  const client = { from(table) {
    let operation = 'select';
    const query = {
      select: () => query, in: () => query, eq: () => query, single: () => query,
      upsert: (_value, options) => { assert.equal(options.ignoreDuplicates, true); operation = 'write'; return query; },
      delete: () => { operation = 'write'; return query; },
      then(resolve, reject) {
        if (operation === 'write') { writes++; return deferred.then(() => resolve({ error: failWrite ? { code: 'failed' } : null }), reject); }
        return Promise.resolve(table === 'classified_ads' ? { data: [{ id: 'ad', likes_count: writes ? 1 : 0, comments_count: 2 }] } : { data: [] }).then(resolve, reject);
      },
    }; return query;
  } };
  const fakeWindow = { addEventListener() {}, removeEventListener() {} };
  const fakeDocument = { ...fakeWindow, visibilityState: 'visible' };
  const source = ts.transpileModule(fs.readFileSync(path.join(root, 'src/hooks/useClassifiedEngagement.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'window', 'document', source)(name => ({
    react, sonner: { toast: { error() {}, info() {} } },
    '@/contexts/AuthContext': { useAuthContext: () => ({ user: { id: 'test-user' } }) },
    '@/lib/supabase': { supabase: client },
  })[name], module, module.exports, fakeWindow, fakeDocument);
  const ads = [{ id: 'ad' }];
  return { render() { cursor = 0; effects.length = 0; return module.exports.useClassifiedEngagement(ads); },
    start() { effects.forEach(fn => fn()); }, release, writes: () => writes, ad: ads[0] };
}
test('rapid classified likes submit once and release pending state after success', async () => {
  const f = engagementFixture(); f.render(); f.start();
  await new Promise(resolve => setImmediate(resolve));
  const hook = f.render();
  assert.equal(hook.isAvailable, true);
  const first = hook.toggleLike(f.ad); const second = hook.toggleLike(f.ad);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.writes(), 1);
  f.release(); await Promise.all([first, second]);
  const settled = f.render(); assert.equal(settled.isLikePending('ad'), false);
  assert.equal(settled.getEngagement(f.ad).isLiked, true);
});
test('failed classified likes roll back without discarding a concurrent comment', async () => {
  const f = engagementFixture(true); f.render(); f.start();
  await new Promise(resolve => setImmediate(resolve));
  const hook = f.render(); const first = hook.toggleLike(f.ad);
  hook.changeCommentsCount('ad', 1); f.release(); await first;
  const settled = f.render();
  assert.equal(settled.isLikePending('ad'), false);
  assert.deepEqual(settled.getEngagement(f.ad), { likesCount: 0, commentsCount: 3, isLiked: false });
});

test('classified migration matches profile embeds and enforces RLS, uniqueness and server counters', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261001_add_classified_engagement.sql'), 'utf8');
  assert.match(sql, /REFERENCES public\.profiles\(id\)/);
  assert.match(sql, /UNIQUE \(ad_id, user_id\)/);
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /GRANT UPDATE \(content\)/);
  assert.match(sql, /AFTER INSERT OR DELETE/);
  assert.match(sql, /SET search_path = public/);
});
