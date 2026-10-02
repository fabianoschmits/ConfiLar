const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
function load(file, mocks = {}, env = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', ...Object.keys(env), source)(name => mocks[name] ?? require(name), module, module.exports, ...Object.values(env));
  return module.exports;
}
const cursor = load('src/lib/feed-cursor.ts');
test('feed cursor covers ties, featured transitions and null rows without offset', () => {
  const c = { id:'12345678-1234-4234-8234-123456789abc', created_at:'2026-10-01T00:00:00+00:00', featured:true };
  assert.match(cursor.feedCursorFilter(c), /is_featured.eq.false,is_featured.is.null/);
  assert.match(cursor.feedCursorFilter(c), /id.lt.12345678/);
  assert.ok(!cursor.feedCursorFilter({...c,featured:null}).includes('is_featured.eq.false'));
  assert.throws(()=>cursor.feedCursorFilter({...c,id:'id),malicious.eq.true'}));
  const rows = [{...c,pagination_featured:true}, {...c,id:'22345678-1234-4234-8234-123456789abc',pagination_featured:false}];
  assert.equal(cursor.oldestFeedCursor(rows).id, rows[1].id);
});
const metrics = load('src/lib/mobile-metrics.ts');
test('telemetry rejects identifiers, documents, URLs, extra fields and non-finite measurements', () => {
  const good = { name:'INP',value:110,route:'/feed',mobile:true };
  assert.ok(metrics.validMetric(good));
  for (const bad of [{...good,userId:'private'}, {...good,message:'CPF'}, {...good,value:NaN}, {...good,value:-1}, {...good,route:'/perfil/private-id'}, {...good,route:'/feed?token=secret'}]) assert.equal(metrics.validMetric(bad),false);
  assert.equal(metrics.metricRoute('/perfil/private-id'),'/perfil/:id');
  assert.equal(metrics.metricRoute('/private?token=secret'),'other');
});
function financialFixture() {
  let calls=0; let fail=false; const keys=[]; const storage=new Map(); const timers=[]; const navigator={onLine:true};
  const module=load('src/lib/financial-fetch.ts', {'@/lib/supabase':{supabase:{auth:{getSession:async()=>({data:{session:{user:{id:'fixture'}}}})}}}}, {
    navigator, crypto:webcrypto, sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    setTimeout:fn=>timers.push(fn), fetch:async(_url,init)=>{calls++;keys.push(init.headers.get('Idempotency-Key'));if(fail)throw new Error('lost response');return new Response('{"success":true}',{status:200});}
  });
  return { ...module,navigator,keys,storage,timers,get calls(){return calls;},set fail(v){fail=v;} };
}
test('simultaneous financial taps share one request and independently readable responses', async()=>{
  const f=financialFixture(); const opts={method:'POST',body:'{"item_id":"fixture"}'};
  const [a,b]=await Promise.all([f.financialFetch('/api/economy/store/purchase',opts),f.financialFetch('/api/economy/store/purchase',opts)]);
  assert.equal(f.calls,1); assert.deepEqual(await a.json(),await b.json());
});
test('lost financial response retains key; offline request never reaches the network',async()=>{
  const f=financialFixture(); const opts={method:'POST',body:'{}'}; f.fail=true;
  await assert.rejects(f.financialFetch('/purchase',opts)); f.fail=false;
  await f.financialFetch('/purchase',opts); assert.equal(f.keys[0],f.keys[1]);
  f.navigator.onLine=false; await assert.rejects(f.financialFetch('/purchase',opts)); assert.equal(f.calls,2);
});
test('purchase API requires UUID key and passes only the authenticated owner to receipt RPC',async()=>{
  const {purchaseOnce}=load('src/lib/purchase-once.ts'); let sent;
  const admin={rpc:async(name,args)=>{sent={name,args};return{data:{result:{id:'saved'},replayed:true},error:null};}};
  await assert.rejects(purchaseOnce(admin,{headers:new Headers()}, {},'store',{p_user_id:'owner'}));
  const result=await purchaseOnce(admin,{headers:new Headers({'Idempotency-Key':webcrypto.randomUUID()})},{item_id:'fixture'},'store',{p_user_id:'owner',p_item_id:'fixture'});
  assert.equal(sent.name,'execute_purchase_once');assert.equal(sent.args.p_user_id,'owner');assert.equal(result.replayed,true);assert.equal(result.data.id,'saved');
});
