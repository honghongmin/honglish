/* 홍글리쉬 — 하루 10분 영어 */
{
const {W,SENT,ART,COMMON,LT}=window.HG;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LVN={1:"기초",2:"중급",3:"상급"},INT=[1,3,7,14,30],LS="honglish-state";
const PART=[["w","단어"],["r","복습"],["s","문장"],["k","영작"],["a","아티클"]];
const IC={say:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" stroke-linejoin="round"/></svg>'};
const NAV={today:'<path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4"/>',words:'<path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 19.2 8 13.7 4 9.8 9.5 9z"/>',test:'<path d="M9 4h6l1 2h3v15H5V6h3zM9 12l2 2 4-4"/>',rank:'<path d="M6 20V10M12 20V4M18 20v-7"/>'};
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const toN=s=>{const[a,b,c]=s.split('-').map(Number);return Math.round(Date.UTC(a,b-1,c)/864e5)};
const fromN=n=>{const d=new Date(n*864e5);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())};
const addD=(s,k)=>fromN(toN(s)+k),diff=(a,b)=>toN(b)-toN(a),md=s=>s.slice(5).replace('-','/');
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const blank=()=>({nick:'',group:'',level:0,start:'',lvDay:0,days:{},srs:{},star:{},tests:[],updated:0});
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const cleanGroup=g=>String(g||'').trim().replace(/[\/\\#?]/g,'').slice(0,20);
let S=Object.assign(blank(),lsGet(LS)||{});
let FB=null,ready=false,players=null,playersErr=false,unsubRank=null,saveT=null,wq=Promise.resolve(),pq=Promise.resolve(),lastPush='',T=null,rankGroup=null,rankAt=0,rankBusy=false;
const K={inp:{},res:{},flip:false,q:'',tr:false,pend:null};let pokes=[],pokeIds=[],unsubPoke=null;
const CA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',genCode=()=>{const a=new Uint32Array(10);crypto.getRandomValues(a);return Array.from(a,x=>CA[x%32]).join('')},fmtCode=c=>c?c.slice(0,5)+'-'+c.slice(5):'',normCode=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const $=s=>document.querySelector(s);
const urlGroup=(()=>{try{const g=new URLSearchParams(location.search).get('g');return g==null?null:cleanGroup(g)}catch(e){return null}})();

function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)}
function save(){S.updated=Date.now();lsSet(LS,S);if(!FB)return;clearTimeout(saveT);saveT=setTimeout(()=>{const body=JSON.parse(JSON.stringify(S));const{fs,db,uid}=FB;wq=wq.then(()=>S.code?fs.setDoc(fs.doc(db,'accounts',S.code),{pid:FB.pid,state:body,updated:body.updated}):fs.setDoc(fs.doc(db,'users',uid),body)).catch(()=>toast('인터넷 연결을 확인해 주세요. 기록은 이 기기에 저장돼 있어요.'))},2500)}
function flushSave(){if(!saveT||!FB)return;clearTimeout(saveT);saveT=null;const body=JSON.parse(JSON.stringify(S));const{fs,db,uid}=FB;wq=wq.then(()=>S.code?fs.setDoc(fs.doc(db,'accounts',S.code),{pid:FB.pid,state:body,updated:body.updated}):fs.setDoc(fs.doc(db,'users',uid),body)).catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});window.addEventListener('pagehide',flushSave);
const isDone=dt=>{const d=S.days[dt];return !!(d&&d.w&&d.r&&d.s&&d.k&&d.a)};
function streak(){const t=today();let c=0,lastF=-99;for(let k=0;k<500;k++){const dt=addD(t,-k);if(S.start&&dt<S.start)break;if(isDone(dt)){c++;continue}if(k===0)continue;if(k-lastF>=7&&isDone(addD(t,-(k+1)))){lastF=k;continue}break}return c}
const weekStart=t=>{const n=toN(t),dow=(new Date(n*864e5).getUTCDay()+6)%7;return fromN(n-dow)};
const weekDone=()=>{const t=today(),ws=weekStart(t);let c=0;for(let k=0;k<7;k++){const dt=addD(ws,k);if(dt>t)break;if(isDone(dt))c++}return c};
const lastDone=()=>Object.keys(S.days).filter(isDone).sort().pop()||'';
const totalDone=()=>Object.keys(S.days).filter(isDone).length;
function myEntry(){return{nick:S.nick.slice(0,12),level:S.level|0,streak:streak()|0,week:weekDone()|0,total:totalDone()|0,words:Object.keys(S.srs).length|0,last:lastDone()}}
function pushPlayer(){if(!FB||!S.nick||!S.level)return;const wk=weekStart(today());const p=myEntry();const k=wk+JSON.stringify(p);if(k===lastPush)return;lastPush=k;const{fs,db}=FB,pid=FB.pid;if(players&&rankGroup===wk){players=players.filter(x=>x.id!==pid).concat([Object.assign({id:pid},p)])}pq=pq.then(()=>fs.setDoc(fs.doc(db,'boards',wk),{[pid]:p},{merge:true})).catch(()=>{lastPush=''})}
const getW=id=>{const[l,i]=String(id).split('-');const w=W[l]&&W[l][+i];return w?{id,en:w[0],ko:w[1],use:w[2],ex:w[3],exk:w[4]}:null};
const dayN=()=>Math.max(0,diff(S.start||today(),today()));
function wordsToday(n){const l=S.level,p=W[l],b=(((n-S.lvDay)*5)%p.length+p.length)%p.length;return[0,1,2,3,4].map(j=>getW(l+'-'+((b+j)%p.length)))}
const sentFor=n=>[0,1,2].map(j=>SENT[(n*3+j)%SENT.length]);
const rng=seed=>{let s=seed%2147483647||1;return()=>(s=s*16807%2147483647)/2147483647};
function writeItems(n){if(n<=0)return sentFor(0);const learned=Math.min(n*3,SENT.length),today3=[0,1,2].map(j=>(n*3+j)%SENT.length),pool=[];for(let i=0;i<learned;i++)if(!today3.includes(i))pool.push(i);const r=rng(toN(today())*7+13),pick=[];while(pick.length<3&&pool.length){pick.push(pool.splice(Math.floor(r()*pool.length),1)[0])}return pick.map(i=>SENT[i])}
const artFor=n=>{const b=ART[n%ART.length],v=b.lv&&b.lv[S.level];return v?Object.assign({},b,v,{lvTag:S.level}):Object.assign({},b,{lvTag:b.lv?2:0})};
function plan(){const t=today();if(!S.start)S.start=t;let d=S.days[t];if(!d){const due=Object.entries(S.srs).filter(([,v])=>v.due<=t).sort((a,b)=>a[1].stage-b[1].stage).slice(0,5).map(x=>x[0]);d=S.days[t]={rq:due,ri:0,w:0,r:due.length?0:1,s:0,k:0,a:0};save()}return d}

/* 발음 */
let voice=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();voice=vs.find(v=>/^en[-_]US/i.test(v.lang)&&/samantha|google|natural|aria|jenny/i.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){}}
if('speechSynthesis' in window){pickVoice();try{speechSynthesis.onvoiceschanged=pickVoice}catch(e){}}
function say(text){try{const ss=window.speechSynthesis;if(!ss){toast('이 브라우저에서는 발음 듣기가 안 돼요. 크롬이나 사파리로 열어주세요.');return}ss.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.9;if(voice)u.voice=voice;ss.speak(u)}catch(e){toast('발음을 재생하지 못했어요.')}}
const sayB=t=>`<button class="ib" data-act="say" data-t="${esc(t)}" aria-label="발음 듣기">${IC.say}</button>`;
const starB=(key,en,ko)=>`<button class="ib st${S.star[key]?' on':''}" data-act="star" data-k="${esc(key)}" data-en="${esc(en)}" data-ko="${esc(ko)}" aria-label="단어장에 추가" aria-pressed="${!!S.star[key]}">${IC.star}</button>`;

/* 화면 */
function header(){const d=S.days[today()]||{};return `<header class="top"><div class="wrap"><div class="brand">홍글리쉬</div><div class="hrow"><div class="hi">안녕하세요<b>${esc(S.nick)}</b><span class="lv">Lv.${S.level} ${LVN[S.level]}</span></div><div class="big">${streak()}<small>일 연속</small></div></div><div class="track">${PART.map(([k,n])=>`<div class="seg${d[k]?' on':''}"><i>${d[k]?'✓':'·'}</i>${n}</div>`).join('')}</div></div></header>`}
function tabs(v){return `<nav class="tabs" aria-label="메뉴"><div class="wrap" style="display:flex;width:100%;padding:0">${[["today","오늘"],["words","단어장"],["test","테스트"],["rank","랭킹"]].map(([h,n])=>`<a href="#${h}" class="${v===h?'on':''}"${v===h?' aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${NAV[h]}</svg>${n}</a>`).join('')}</div></nav>`}
const ck=on=>`<span class="ck${on?' y':''}">${on?'완료':'할 일'}</span>`;
function vToday(){const d=plan(),n=dayN(),ws=wordsToday(n),ss=sentFor(n),ks=writeItems(n),A=artFor(n);
let h=pokeBar()+`<section><h2>오늘의 단어 ${ck(d.w)}</h2><p class="sub">${n+1}일째 · 5개만. 소리 내서 한 번씩 읽어보세요. 별을 누르면 단어장에 들어가요.</p>`;
h+=ws.map(w=>`<div class="card"><div class="wrow"><span class="en grow">${esc(w.en)}</span>${sayB(w.en)}${starB(w.id,w.en,w.ko)}</div><div class="ko">${esc(w.ko)}</div><div class="use">${esc(w.use)}</div><div class="ex"><div class="wrow"><span class="e">${esc(w.ex)}</span>${sayB(w.ex)}</div><div class="k">${esc(w.exk)}</div></div></div>`).join('');
h+=`<button class="btn wide" data-act="wdone" ${d.w?'disabled':''}>${d.w?'오늘 단어 완료':'다 봤어요'}</button></section>`;
h+=`<section><h2>복습 ${ck(d.r)}</h2>`;
if(!d.rq.length)h+=`<p class="sub">오늘은 복습할 단어가 없어요. 오늘 본 단어는 내일부터 1·3·7·14·30일 간격으로 다시 나와요.</p>`;
else if(d.r)h+=`<p class="sub">복습 ${d.rq.length}개 끝! 몰랐던 단어는 단어장에 넣어뒀어요.</p>`;
else{const w=getW(d.rq[d.ri])||{en:'?',ko:'?'};h+=`<p class="sub">${d.ri+1} / ${d.rq.length} · 뜻을 떠올린 뒤 확인하세요.</p><div class="card flash"><div class="en">${esc(w.en)}</div><div style="margin:10px 0">${sayB(w.en)}</div>${K.flip?`<div class="ko" style="font-size:20px">${esc(w.ko)}</div><div class="row" style="justify-content:center"><button class="btn cor" data-act="rno">몰랐어요</button><button class="btn" data-act="rok">알았어요</button></div>`:`<button class="btn ghost" data-act="rflip">뜻 보기</button>`}</div>`}
h+=`</section><section><h2>오늘의 문장 ${ck(d.s)}</h2><p class="sub">듣고, 따라서 소리 내어 두세 번 말해보세요.</p>`;
h+=ss.map(s=>`<div class="card"><div class="wrow"><span class="en grow" style="font-size:20px">${esc(s[1])}</span>${sayB(s[1])}</div><div class="use">${esc(s[0])}</div></div>`).join('');
h+=`<button class="btn wide" data-act="sdone" ${d.s?'disabled':''}>${d.s?'문장 완료':'따라 말해봤어요'}</button></section>`;
h+=`<section><h2>영작 연습 ${ck(d.k)}</h2><p class="sub">${n?'지금까지 배운 문장 중에서 골랐어요.':'오늘 배운 문장이에요.'} 한국어를 보고 영어로 써보세요.</p>`;
h+=ks.map((s,i)=>{const r=K.res[i];return `<div class="card"><div class="ko" style="margin-bottom:8px">${esc(s[0])}</div><textarea data-ki="${i}" aria-label="영어로 쓰기" placeholder="영어로 써보세요" autocapitalize="sentences" autocomplete="off" spellcheck="false">${esc(K.inp[i]||'')}</textarea><div class="row"><button class="btn ghost" data-act="kchk" data-i="${i}">확인</button></div>${r?`<div class="res">${r.sim>=.9?'<b>완벽해요!</b>':r.sim>=.6?'<b>거의 맞았어요.</b>':'<span class="no">정답과 비교해보세요.</span>'}<div class="ans"><strong>${esc(s[1])}</strong>${sayB(s[1])}</div><div class="note">다른 표현도 정답일 수 있어요.</div></div>`:''}</div>`}).join('');
h+=`</section><section><h2>오늘의 아티클 ${ck(d.a)}</h2><p class="sub">모르는 단어를 누르면 뜻과 그 문장 해석이 나와요. 점선 밑줄은 묶어서 외우면 좋은 표현이에요.</p><div class="card"><div class="wrow"><span class="en grow" style="font-size:21px">${esc(A.t)}</span>${sayB(A.t+'. '+A.x.replace(/[\[\]]/g,''))}</div><div class="use">${esc(A.k)}${A.lvTag?` <span class="chip">Lv.${A.lvTag} ${LVN[A.lvTag]} 버전</span>`:''}</div><div class="row" style="margin:8px 0 12px"><button class="btn ghost" data-act="trtoggle" aria-pressed="${K.tr}">${K.tr?'해석 숨기기':'전체 해석 보기'}</button></div><div class="art${K.tr?' trs':''}">${artHTML(A)}</div></div><button class="btn wide" data-act="adone" ${d.a?'disabled':''}>${d.a?'아티클 완료':'다 읽었어요'}</button><p class="note">가볍게 읽기 좋게 쓴 글이에요. 실제 뉴스 기사는 아니에요.</p></section>`;
if(isDone(today()))h+=`<section><h2>오늘 다섯 칸 다 채웠어요</h2><p class="sub">내일 또 만나요. 하루를 놓쳐도 일주일에 한 번은 연속 기록이 유지돼요.</p></section>`;
return h}
const splitS=x=>x.match(/[^.!?]+[.!?]+["']?\s*/g)||[x];
function artHTML(A){return splitS(A.x).map((s,si)=>{const en=s.replace(/\[([^\]]+)\]|([A-Za-z]+(?:['’-][A-Za-z]+)*)|([^A-Za-z\[]+)/g,(m,ph,w,o)=>o!=null?esc(o):`<span class="tk${ph?' ph':''}" data-act="tk" data-w="${esc(ph||w)}" data-s="${si}" role="button" tabindex="0">${esc(ph||w)}</span>`);return K.tr?`<span class="sen">${en}<span class="tr">${esc((A.tr||[])[si]||'')}</span></span>`:en}).join('')}
const poolMap={};for(const l in W)W[l].forEach((w,i)=>{poolMap[w[0].toLowerCase()]=l+'-'+i});
function lookup(w,A){const k=w.toLowerCase().replace(/’/g,"'");const forms=[k,k.replace(/'s$/,''),k.replace(/ies$/,'y'),k.replace(/es$/,''),k.replace(/s$/,''),k.replace(/ed$/,''),k.replace(/d$/,''),k.replace(/ing$/,''),k.replace(/ing$/,'e')];for(const f of forms)if(A.g[f])return{ko:A.g[f],key:'x:'+f,en:f};for(const f of forms)if(poolMap[f]){const p=getW(poolMap[f]);return{ko:p.ko,key:p.id,en:p.en}}for(const f of forms)if(COMMON[f])return{ko:COMMON[f],key:'x:'+f,en:f};return null}
function openPop(el){const w=el.dataset.w,si=+el.dataset.s,A=artFor(dayN());const ctx=(splitS(A.x)[si]||'').replace(/[\[\]]/g,'').trim();const r=lookup(w,A);document.querySelectorAll('.tk.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');const q=encodeURIComponent((r?r.en:w).toLowerCase());
$('#pop').innerHTML=`<div class="wrow"><span class="en grow">${esc(w)}</span>${sayB(w)}${r?starB(r.key,r.en,r.ko):''}<button class="ib" data-act="pclose" aria-label="닫기">✕</button></div><div class="ko" style="font-size:18px;margin-top:4px">${r?esc(r.ko):'뜻 정보가 없어요'}</div><div class="ctx"><div>${esc(ctx)}</div>${(A.tr||[])[si]?`<div class="trl">${esc(A.tr[si])}</div>`:''}</div><div style="margin-top:8px"><a href="https://en.dict.naver.com/#/search?query=${q}" target="_blank" rel="noopener">네이버 사전에서 더 보기 →</a></div>`;$('#pop').classList.add('on')}
function closePop(){$('#pop').classList.remove('on');document.querySelectorAll('.tk.sel').forEach(x=>x.classList.remove('sel'))}
const CON=[[/\bi'm\b/g,'i am'],[/\bit's\b/g,'it is'],[/\bdon't\b/g,'do not'],[/\bcan't\b/g,'can not'],[/\bcannot\b/g,'can not'],[/\bi'll\b/g,'i will'],[/\blet's\b/g,'let us'],[/\bwhat's\b/g,'what is'],[/\bwhere's\b/g,'where is'],[/\bdidn't\b/g,'did not'],[/\bthat's\b/g,'that is'],[/\byou're\b/g,'you are'],[/\bi've\b/g,'i have'],[/\bisn't\b/g,'is not'],[/\bhaven't\b/g,'have not'],[/\bwon't\b/g,'will not'],[/\btoday's\b/g,'today is']];
const norm=s=>{let x=String(s).toLowerCase().replace(/[’`]/g,"'");CON.forEach(([r,v])=>x=x.replace(r,v));return x.replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)};
function sim(a,u){const A=norm(a),U=norm(u);if(!U.length)return 0;const pool=A.slice();let c=0;U.forEach(t=>{const i=pool.indexOf(t);if(i>=0){c++;pool.splice(i,1)}});return 2*c/(A.length+U.length)}
function vWords(){if(T&&T.kind==='star')return T.done?vResult():vQuiz();const st=Object.entries(S.star),lr=Object.entries(S.srs).map(([id,v])=>({w:getW(id),v})).filter(x=>x.w).sort((a,b)=>a.v.due<b.v.due?-1:1);
let h=`<section><h2>내 단어장</h2><p class="sub">별표한 단어 ${st.length}개 · 복습이나 테스트에서 틀린 단어도 여기에 들어와요.</p>`;
h+=st.length>=1?`<div class="card" style="background:var(--soft)"><b>별표 단어 테스트</b><div class="note">별표한 단어 중에서 최대 10문제가 나와요. 언제든 볼 수 있어요.</div><div class="row"><button class="btn" data-act="sstart">테스트 시작</button></div></div>`:`<div class="card note">별표한 단어가 생기면 여기서 별표 단어 테스트를 볼 수 있어요. 오늘의 단어나 아티클에서 ☆를 눌러보세요.</div>`;
h+=st.length?st.map(([k,v])=>`<div class="card"><div class="wrow"><span class="en grow" style="font-size:20px">${esc(v.en)}</span>${sayB(v.en)}${starB(k,v.en,v.ko)}</div><div class="ko">${esc(v.ko)}</div></div>`).join(''):`<div class="card note">아직 비어 있어요. 오늘의 단어나 아티클에서 별을 눌러보세요.</div>`;
h+=`</section><section><h2>배운 단어</h2><p class="sub">${lr.length}개 · 단계가 오를수록 복습 간격이 길어져요 (1→3→7→14→30일).</p>`;
h+=lr.length?lr.map(x=>`<div class="rk" style="grid-template-columns:minmax(0,1fr) auto"><div><b>${esc(x.w.en)}</b> <span class="use">${esc(x.w.ko)}</span></div><div class="num" style="font-size:14px">${x.v.stage+1}단계<small>${x.v.due<=today()?'복습 대기':'다음 '+md(x.v.due)}</small></div></div>`).join(''):`<div class="card note">오늘의 단어에서 ‘다 봤어요’를 누르면 여기에 쌓여요.</div>`;
return h+`</section>`}
function testItems(){const it=Object.entries(S.srs).map(([id,v])=>{const w=getW(id);return w?{key:id,en:w.en,ko:w.ko,st:v.stage}:null}).filter(Boolean);Object.entries(S.star).forEach(([k,v])=>{if(!S.srs[k])it.push({key:k,en:v.en,ko:v.ko,st:0})});return it}
function buildQs(src){const all=src||testItems(),it=all.slice().sort((a,b)=>a.st-b.st||Math.random()-.5).slice(0,10),dis=W[S.level].map(w=>({en:w[0],ko:w[1]})).concat(testItems());return shuf(it).map(x=>{const ek=Math.random()<.5,f=ek?'ko':'en',others=shuf(dis.filter(d=>d[f]!==x[f]).map(d=>d[f])).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3),o=shuf([x[f]].concat(others));return{q:ek?`"${x.en}" 의 뜻은?`:`"${x.ko}" 를 영어로?`,o,a:o.indexOf(x[f]),it:x}})}
const lastTest=()=>S.tests.filter(t=>t.official).slice(-1)[0];
function weekState(){const n=testItems().length,lt=lastTest(),next=lt?addD(lt.date,7):addD(S.start||today(),6);return{n,next,open:n>=4&&today()>=next}}
function vQuiz(){const q=T.qs[T.i],p=T.pick;let h=`<section><p class="sub">${T.kind==='level'?'레벨테스트':T.kind==='week'?'주간 테스트':T.kind==='star'?'별표 단어 테스트':'연습 테스트'} · ${T.i+1} / ${T.qs.length}</p><h2 style="font-size:23px">${esc(q.q)}</h2>`;h+=q.o.map((o,j)=>`<button class="opt${p!=null?(j===q.a?' r':j===p?' w':''):''}" data-act="qa" data-o="${j}" ${p!=null?'disabled':''}>${esc(o)}</button>`).join('');if(p!=null)h+=`<button class="btn wide" style="margin-top:8px" data-act="qn">${T.i+1<T.qs.length?'다음':'결과 보기'}</button>`;return h+`</section>`}
function vResult(){const tot=T.qs.length,sc=T.score,pct=Math.round(sc/tot*100);let h=`<section><h2 style="font-size:28px">${sc} / ${tot}</h2>`;
if(T.kind==='level'){const l=sc<=5?1:sc<=9?2:3;h+=`<p class="sub">추천 레벨은 <b>Lv.${l} ${LVN[l]}</b>이에요. 다른 레벨로 시작해도 돼요.</p><div class="row">${[1,2,3].map(x=>`<button class="btn${x===l?'':' ghost'}" data-act="lvset" data-l="${x}">Lv.${x} ${LVN[x]}</button>`).join('')}</div>`}
else{h+=`<p class="sub">정답률 ${pct}%.${T.kind==='star'?'':' 틀린 단어는 단어장에 넣어뒀어요.'}</p>`;if(T.kind==='week'&&pct>=90&&S.level<3)h+=`<div class="card">거의 다 맞혔어요. 한 단계 올려볼까요?<div class="row"><button class="btn" data-act="lvset" data-l="${S.level+1}">Lv.${S.level+1}로 올리기</button></div></div>`;if(T.kind==='week'&&pct<=40&&S.level>1)h+=`<div class="card">조금 어려웠나요? 한 단계 내려도 괜찮아요.<div class="row"><button class="btn ghost" data-act="lvset" data-l="${S.level-1}">Lv.${S.level-1}로 내리기</button></div></div>`;if(T.kind==='star'&&T.right&&T.right.length)h+=`<div class="card">맞힌 단어 ${T.right.length}개는 외운 것 같아요. 별표를 뺄까요?<div class="row"><button class="btn ghost" data-act="unstarRight">맞힌 단어 별표 빼기</button></div></div>`;h+=`<div class="row"><button class="btn ghost" data-act="qend">닫기</button>${T.kind==='star'?'<button class="btn" data-act="sstart">다시 풀기</button>':''}</div>`}
return h+`</section>`}
function vTest(){if(T&&T.kind!=='star')return T.done?vResult():vQuiz();const ws=weekState(),lt=lastTest();let h=`<section><h2>주간 단어 테스트</h2><p class="sub">일주일에 한 번, 배운 단어와 별표 단어 중에서 10문제가 나와요.</p><div class="card">`;
if(ws.n<4)h+=`단어를 4개 이상 배우면 테스트를 볼 수 있어요. 지금 ${ws.n}개.`;else if(ws.open)h+=`이번 주 테스트가 열렸어요.<div class="row"><button class="btn" data-act="wstart">테스트 시작</button></div>`;else h+=`다음 테스트는 <b>${md(ws.next)}</b>에 열려요.<div class="row"><button class="btn ghost" data-act="pstart">연습 테스트 (기록 안 됨)</button></div>`;
h+=`</div>${lt?`<p class="note">지난 테스트: ${md(lt.date)} · ${lt.score}/${lt.total}</p>`:''}</section><section><h2>레벨테스트 다시 보기</h2><p class="sub">지금 Lv.${S.level} ${LVN[S.level]}. 12문제로 레벨을 다시 정할 수 있어요.</p><button class="btn ghost" data-act="lstart">레벨테스트 시작</button></section>`;return h}
function inviteLink(){return location.origin+location.pathname}
const poked=id=>{const m=lsGet('honglish-poke')||{};return m[id]===today()};
function rankRow(p){const me=FB&&p.id===FB.pid;const st=p.doneToday?'<span class="bdg ok">오늘 완료</span>':'<span class="bdg no">오늘 아직</span>';const pk=!me&&!p.doneToday?(poked(p.id)?'<button class="btn ghost sm" disabled>찔렀어요</button>':`<button class="btn cor sm" data-act="poke" data-id="${esc(p.id)}" data-n="${esc(p.nick)}">콕 찌르기</button>`):'';return `<div class="rk${me?' me':''}"><span class="n">${p.rank}</span><div><b>${esc(p.nick)}</b>${me?' <span class="use">(나)</span>':''} ${st}<div class="bar"><i style="width:${p.week/7*100}%"></i></div><div class="note">Lv.${p.level} · 연속 ${p.streak}일 · 단어 ${p.words}개</div>${pk?`<div style="margin-top:6px">${pk}</div>`:''}</div><div class="num">${p.week}일<small>이번 주</small></div></div>`}
function vRank(){const ws=weekStart(today()),we=addD(ws,6);let h=`<section><h2>이번 주 랭킹</h2><p class="sub">${md(ws)}(월) ~ ${md(we)}(일) · 다섯 칸을 다 채운 날이 많을수록 위로 가요. 매주 월요일에 0부터 다시 시작해서 늦게 온 친구도 따라잡을 수 있어요.</p>${FB&&players?`<div class="wrow" style="margin-bottom:10px"><span class="note grow">${new Date(rankAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} 기준</span><button class="btn ghost sm" data-act="rankrefresh">새로고침</button></div>`:''}`;
if(!window.FIREBASE_CONFIG)h+=`<div class="card note">랭킹 서버가 아직 연결되지 않았어요. 지금은 내 기록만 이 기기에 저장돼요.</div>`;
else if(!FB)h+=`<div class="card note">${ready?'랭킹 서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.':'랭킹 불러오는 중…'}</div>`;
else if(playersErr)h+=`<div class="card note">랭킹을 불러오지 못했어요. 잠시 후 다시 열어주세요.</div>`;
else if(!players)h+=`<div class="card note">랭킹 불러오는 중…</div>`;
else{const t=today();let ps=players.map(p=>({id:p.id,nick:String(p.nick||'친구').slice(0,12),level:Number(p.level)||1,streak:Number(p.streak)||0,week:Math.min(7,Number(p.week)||0),total:Number(p.total)||0,words:Number(p.words)||0,last:String(p.last||'')})).map(p=>{if(!/^\d{4}-\d\d-\d\d$/.test(p.last))p.last='';if(!p.last||p.last<ws)p.week=0;if(!p.last||diff(p.last,t)>1)p.streak=0;p.doneToday=p.last===t;return p}).sort((a,b)=>b.week-a.week||(b.doneToday-a.doneToday)||b.streak-a.streak||b.total-a.total);ps.forEach((p,i)=>p.rank=i+1);const me=ps.find(p=>p.id===FB.pid);const q=K.q.trim().toLowerCase();const shown=q?ps.filter(p=>p.nick.toLowerCase().includes(q)):ps.slice(0,100);const notYet=ps.filter(p=>!p.doneToday&&p.id!==FB.pid).length;
h+=`<div class="srch"><input type="search" id="rq" placeholder="닉네임 검색" value="${esc(K.q)}" aria-label="닉네임 검색" autocomplete="off"></div>`;
if(me&&!q)h+=`<p class="note" style="margin:0 0 8px">내 순위 <b>${me.rank}위</b> / ${ps.length}명${notYet?` · 오늘 아직 안 한 친구 ${notYet}명`:''}</p>`;
h+=shown.length?shown.map(p=>rankRow(p)).join(''):`<div class="card note">${q?'그 닉네임을 찾지 못했어요.':'아직 아무도 없어요. 오늘 다섯 칸을 채우면 첫 번째로 올라가요.'}</div>`}
h+=`</section><section><h2>친구 초대</h2><p class="sub">이 링크를 보내면 친구가 바로 들어와서 같은 랭킹에 올라가요.</p><div class="copy"><input type="text" id="lnk" readonly value="${esc(inviteLink())}" aria-label="초대 링크"><button class="btn" data-act="share">공유</button></div></section>`;
h+=`<section><h2>내 기록</h2><div class="stats"><div><b>${weekDone()}/7</b>이번 주</div><div><b>${streak()}</b>연속일</div><div><b>${totalDone()}</b>총 완료일</div></div></section><section><h2>설정</h2><form id="nf"><label for="nick">닉네임</label><input type="text" id="nick" maxlength="12" value="${esc(S.nick)}" autocomplete="nickname"><div class="row"><button class="btn ghost wide">저장</button></div></form></section><section><h2>내 계정 코드</h2><p class="sub">PC나 다른 폰에서 처음 화면에 이 코드를 넣으면 같은 계정으로 이어서 할 수 있어요. 비밀번호 같은 거라 다른 사람에게는 알려주지 마세요.</p>${S.code?`<div class="copy"><input type="text" readonly id="mycode" class="codebox" value="${esc(fmtCode(S.code))}" aria-label="내 계정 코드"><button class="btn" data-act="copycode">복사</button></div>`:`<div class="card note">${FB?'코드를 만드는 중이에요…':'서버에 연결되면 코드가 생겨요.'}</div>`}<h2 style="margin-top:24px;font-size:17px">다른 기기에서 쓰던 계정 불러오기</h2>${codeUI()}</section>`;return h}
function codeUI(){if(K.pend){const st=K.pend.state||{};return `<div class="card"><b>‘${esc(st.nick||'이름 없음')}’ 계정을 찾았어요</b><div class="note">Lv.${Number(st.level)||'-'} · 이 기기에서 하던 기록 대신 이 계정 기록으로 바뀌어요.</div><div class="row"><button class="btn" data-act="usecode">이 계정으로 하기</button><button class="btn ghost" data-act="cancelcode">취소</button></div></div>`}return `<form id="cf" class="copy"><input type="text" id="codein" class="codebox" placeholder="예: ABCDE-23456" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="계정 코드"><button class="btn">불러오기</button></form>`}
function vOnboard(){return `<div class="wrap hero"><img class="logo" src="icon-192.png" alt=""><h1>홍글리쉬</h1><p class="sub" style="font-size:16px">하루 10분, 친구들이랑 영어 습관 만들기. 매일 단어 5개, 문장 3개, 영작 3개, 짧은 아티클 1개를 채우면 끝이에요.</p><form id="nf" class="card"><label for="nick" style="margin-top:4px">랭킹에 보일 닉네임</label><input type="text" id="nick" maxlength="12" placeholder="예: 영어왕" autocomplete="nickname"><div class="row"><button class="btn wide">레벨테스트 하러 가기</button></div><p class="note">12문제, 2분 정도 걸려요. 회원가입은 필요 없어요.</p></form><div class="card"><b>다른 기기에서 쓰던 계정이 있나요?</b><p class="note" style="margin:4px 0 10px">랭킹 탭 아래 ‘내 계정 코드’를 여기에 넣으면 이어서 할 수 있어요.</p>${codeUI()}</div></div>`}
function render(){const app=$('#app');let v=(location.hash||'#today').slice(1);if(!['today','words','test','rank'].includes(v))v='today';document.body.classList.toggle('has-nav',!!(S.nick&&S.level));
if(!S.nick){app.innerHTML=vOnboard();return}
if(!S.level){if(!T||T.kind!=='level')T={kind:'level',qs:LT,i:0,score:0,pick:null};app.innerHTML=`<div class="wrap" style="padding-top:var(--safe-t)">${T.done?vResult():vQuiz()}</div>`;return}
const y=window.scrollY;app.innerHTML=header()+`<main class="wrap">${v==='today'?vToday():v==='words'?vWords():v==='test'?vTest():vRank()}</main>`+tabs(v);window.scrollTo(0,y);if(ready){pushPlayer();if(v==='rank')loadRank(false)}}
function setStar(k,en,ko,on){if(on)S.star[k]={en,ko};else delete S.star[k];save()}
async function share(){const url=inviteLink(),text='홍글리쉬에서 같이 영어 공부하자!';try{if(navigator.share){await navigator.share({title:'홍글리쉬',text,url});return}}catch(e){if(e&&e.name==='AbortError')return}try{await navigator.clipboard.writeText(url);toast('초대 링크를 복사했어요')}catch(e){const i=$('#lnk');if(i){i.focus();i.select()}toast('링크를 길게 눌러 복사해 주세요')}}
function act(a,el){const t=today(),d=S.days[t];
if(a==='say')return say(el.dataset.t);
if(a==='share')return share();
if(a==='star'){const on=!S.star[el.dataset.k];setStar(el.dataset.k,el.dataset.en,el.dataset.ko,on);document.querySelectorAll('.ib.st').forEach(b=>{if(b.dataset.k===el.dataset.k){b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)}});toast(on?'단어장에 넣었어요':'단어장에서 뺐어요');return}
if(a==='tk')return openPop(el);
if(a==='pclose')return closePop();
if(a==='wdone'){wordsToday(dayN()).forEach(w=>{if(!S.srs[w.id])S.srs[w.id]={stage:0,due:addD(t,1)}});d.w=1}
else if(a==='rflip')K.flip=true;
else if(a==='rok'||a==='rno'){const id=d.rq[d.ri],s=S.srs[id]||{stage:0};if(a==='rok')s.stage=Math.min(s.stage+1,INT.length-1);else{s.stage=0;const w=getW(id);if(w)S.star[id]={en:w.en,ko:w.ko}}s.due=addD(t,INT[s.stage]);S.srs[id]=s;d.ri++;K.flip=false;if(d.ri>=d.rq.length)d.r=1}
else if(a==='sdone')d.s=1;
else if(a==='kchk'){const i=+el.dataset.i,s=writeItems(dayN())[i],u=K.inp[i]||'';if(!u.trim()){toast('영어로 먼저 써보세요');return}K.res[i]={sim:sim(s[1],u)};if([0,1,2].every(j=>K.res[j]))d.k=1}
else if(a==='adone'){d.a=1;closePop()}
else if(a==='trtoggle'){K.tr=!K.tr;closePop()}
else if(a==='sstart'){const src=Object.entries(S.star).map(([k,v])=>({key:k,en:v.en,ko:v.ko,st:0}));if(!src.length){toast('별표한 단어가 아직 없어요');return}T={kind:'star',qs:buildQs(src),i:0,score:0,pick:null,right:[]};window.scrollTo(0,0)}
else if(a==='unstarRight'){(T.right||[]).forEach(k=>delete S.star[k]);toast(`${T.right.length}개 별표를 뺐어요`);T=null}
else if(a==='poke')return poke(el.dataset.id,el.dataset.n);
else if(a==='usecode')return useCode();
else if(a==='rankrefresh'){if(Date.now()-rankAt<10000){toast('방금 새로고침했어요');return}return loadRank(true)}
else if(a==='cancelcode')K.pend=null;
else if(a==='copycode'){const c=fmtCode(S.code);(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('코드를 복사했어요')).catch(()=>{const i=$('#mycode');if(i){i.focus();i.select()}toast('코드를 길게 눌러 복사해 주세요')});return}
else if(a==='pokeclose')return clearPokes();
else if(a==='lstart')T={kind:'level',qs:LT,i:0,score:0,pick:null};
else if(a==='wstart'||a==='pstart')T={kind:a==='wstart'?'week':'practice',qs:buildQs(),i:0,score:0,pick:null};
else if(a==='qa'){if(T.pick!=null)return;const q=T.qs[T.i],o=+el.dataset.o;T.pick=o;if(o===q.a){T.score++;if(T.right&&q.it)T.right.push(q.it.key)}else if(q.it)S.star[q.it.key]={en:q.it.en,ko:q.it.ko}}
else if(a==='qn'){T.i++;T.pick=null;if(T.i>=T.qs.length){T.done=true;if(T.kind==='week')S.tests.push({date:t,score:T.score,total:T.qs.length,official:true})}window.scrollTo(0,0)}
else if(a==='qend')T=null;
else if(a==='lvset'){const l=+el.dataset.l;if(!S.start)S.start=t;S.level=l;S.lvDay=dayN();T=null;if(location.hash!=='#today')location.hash='#today';toast(`Lv.${l} ${LVN[l]}로 공부해요`)}
if(d&&isDone(t)&&pokes.length)clearPokes();
save();render()}
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;e.preventDefault();act(el.dataset.act,el)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&e.target.dataset.act==='tk'){e.preventDefault();openPop(e.target)}if(e.key==='Escape')closePop()});
document.addEventListener('input',e=>{if(e.target.id==='rq'){K.q=e.target.value;const p=e.target.selectionStart;render();const i=$('#rq');if(i){i.focus();try{i.setSelectionRange(p,p)}catch(x){}}return}if(e.target.dataset&&e.target.dataset.ki!=null)K.inp[e.target.dataset.ki]=e.target.value});
document.addEventListener('submit',e=>{if(e.target.id==='cf'){e.preventDefault();findCode($('#codein').value);return}if(e.target.id!=='nf')return;e.preventDefault();const v=$('#nick').value.trim().slice(0,12);if(!v){toast('닉네임을 입력해 주세요');$('#nick').focus();return}S.nick=v;S.group='';lastPush='';save();toast('저장했어요');render();ensureAccount()});
window.addEventListener('hashchange',()=>{closePop();render()});

/* 카카오톡·인스타 등 앱 안 브라우저 안내 */
if(/KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\//i.test(navigator.userAgent)){const b=$('#inapp');b.textContent='앱 안 브라우저에서는 발음 듣기나 기록 저장이 잘 안 될 수 있어요. 메뉴에서 ‘다른 브라우저로 열기’를 눌러 크롬이나 사파리로 열어주세요.';b.hidden=false}

/* Firebase */
function pokeBar(){if(!pokes.length||isDone(today()))return '';const names=pokes.map(p=>p.nick).slice(0,3).join(', ')+(pokes.length>3?` 외 ${pokes.length-3}명`:'');return `<div class="pokebar"><div><b>${esc(names)}</b>님이 콕 찔렀어요<div>“너 오늘 홍글리쉬 안 했네??” 👀</div></div><button class="ib" data-act="pokeclose" aria-label="닫기">✕</button></div>`}
async function poke(id,nick){if(!FB||!S.nick||id===FB.pid)return;const{fs,db}=FB;try{await fs.setDoc(fs.doc(db,'pokes',id,'from',FB.pid),{nick:S.nick.slice(0,12),at:Date.now()});const m=lsGet('honglish-poke')||{};m[id]=today();lsSet('honglish-poke',m);toast(`${nick}님을 콕 찔렀어요! 다음에 앱을 열면 알림이 보여요`);render();try{if(navigator.share)await navigator.share({title:'홍글리쉬',text:`${nick}, 너 오늘 홍글리쉬 안 했네?? 👀`,url:inviteLink()})}catch(e){}}catch(e){toast('찌르기에 실패했어요. 잠시 후 다시 해주세요')}}
async function clearPokes(){const ids=pokeIds.slice();pokes=[];pokeIds=[];render();if(!FB)return;const{fs,db}=FB;for(const id of ids){try{await fs.deleteDoc(fs.doc(db,'pokes',FB.pid,'from',id))}catch(e){}}}
function subPoke(){if(!FB||unsubPoke)return;const{fs,db}=FB;unsubPoke=fs.onSnapshot(fs.collection(db,'pokes',FB.pid,'from'),s=>{const since=Date.now()-36*3600e3;pokeIds=s.docs.map(x=>x.id);pokes=s.docs.map(x=>x.data()).filter(p=>p&&typeof p.nick==='string'&&Number(p.at)>since).sort((a,b)=>b.at-a.at);render()},()=>{})}
async function ensureAccount(){if(!FB||S.code||!S.nick)return;const{fs,db,uid}=FB;const code=genCode();try{S.updated=Date.now();const st=JSON.parse(JSON.stringify(Object.assign({},S,{code})));await fs.setDoc(fs.doc(db,'accounts',code),{pid:uid,state:st,updated:S.updated});await fs.setDoc(fs.doc(db,'links',uid),{pid:uid,code});S.code=code;FB.pid=uid;lsSet(LS,S);render()}catch(e){console.warn('account',e)}}
async function findCode(raw){const code=normCode(raw);if(code.length!==10){toast('코드 10자리를 확인해 주세요');return}if(!FB){toast('서버에 연결 중이에요. 잠시 후 다시 해주세요');return}if(code===S.code){toast('지금 쓰고 있는 계정이에요');return}try{const s=await FB.fs.getDoc(FB.fs.doc(FB.db,'accounts',code));if(!s.exists()){toast('그 코드를 찾지 못했어요');return}const r=s.data();K.pend={code,pid:String(r.pid||''),state:r.state||{}};render()}catch(e){toast('불러오지 못했어요. 잠시 후 다시 해주세요')}}
async function useCode(){const p=K.pend;if(!p||!FB||!p.pid)return;const{fs,db,uid}=FB;try{await fs.setDoc(fs.doc(db,'links',uid),{pid:p.pid,code:p.code});const old=FB.pid;FB.pid=p.pid;if(old===uid&&p.pid!==uid){try{await fs.deleteDoc(fs.doc(db,'players',uid))}catch(e){}}S=Object.assign(blank(),p.state);S.code=p.code;lsSet(LS,S);K.pend=null;lastPush='';T=null;if(unsubPoke){unsubPoke();unsubPoke=null}pokes=[];pokeIds=[];subPoke();subRank();toast(`${S.nick||''} 계정으로 이어서 할게요`);if(location.hash!=='#today')location.hash='#today';render()}catch(e){toast('계정을 연결하지 못했어요')}}
function subRank(){players=null;rankAt=0;loadRank(true)}
let legacyRows=null;
async function loadRank(force){if(!FB||rankBusy)return;if(!force&&(players||playersErr)&&Date.now()-rankAt<60000)return;rankBusy=true;playersErr=false;const wk=weekStart(today());try{const{fs,db}=FB;const[snap,leg]=await Promise.all([fs.getDoc(fs.doc(db,'boards',wk)),legacyRows?Promise.resolve(legacyRows):fs.getDocs(fs.collection(db,'players')).then(q=>legacyRows=q.docs.map(x=>Object.assign({},x.data(),{id:x.id}))).catch(()=>[])]);const d=snap.exists()?snap.data():{};const m={};(leg||[]).forEach(v=>{if(!v||!v.nick)return;const cur=v.last&&v.last>=wk;m[v.id]={id:v.id,nick:String(v.nick).slice(0,12),level:v.level|0,streak:v.last&&v.last>=addD(today(),-1)?v.streak|0:0,week:cur?v.week|0:0,total:v.total|0,words:v.words|0,last:v.last||''}});Object.entries(d||{}).forEach(([id,v])=>{if(v&&typeof v==='object')m[id]=Object.assign({},v,{id})});if(FB.pid&&S.nick&&S.level)m[FB.pid]=Object.assign(myEntry(),{id:FB.pid});players=Object.values(m);rankGroup=wk;rankAt=Date.now()}catch(e){playersErr=true;rankAt=Date.now()}rankBusy=false;if((location.hash||'#today')==='#rank')render()}
async function initFB(){const cfg=window.FIREBASE_CONFIG;if(!cfg||!cfg.apiKey)return;const B='https://www.gstatic.com/firebasejs/10.12.2/';const[a,au,fs]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);const app=a.initializeApp(cfg);const auth=au.getAuth(app);const cur=await new Promise(res=>{const un=au.onAuthStateChanged(auth,u=>{un();res(u)})});const user=cur||(await au.signInAnonymously(auth)).user;const db=fs.getFirestore(app);FB={fs,db,uid:user.uid,pid:user.uid};
try{let link=null;try{const ls=await fs.getDoc(fs.doc(db,'links',user.uid));if(ls.exists())link=ls.data()}catch(e){}const code=(link&&link.code)||S.code||'';if(code){const as=await fs.getDoc(fs.doc(db,'accounts',code));if(as.exists()){const r=as.data();FB.pid=String(r.pid||user.uid);if(r.state&&r.state.nick&&(!S.nick||(r.updated||0)>(S.updated||0)))S=Object.assign(blank(),r.state);S.code=code;lsSet(LS,S);if(!link)await fs.setDoc(fs.doc(db,'links',user.uid),{pid:FB.pid,code}).catch(()=>{})}else S.code=''}if(!S.code){const snap=await fs.getDoc(fs.doc(db,'users',user.uid)).catch(()=>null);if(snap&&snap.exists()){const r=snap.data();if(r&&r.nick&&(!S.nick||(r.updated||0)>(S.updated||0))){S=Object.assign(blank(),r);lsSet(LS,S)}}}}catch(e){}}
(async()=>{render();
try{await Promise.race([initFB(),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),15000))])}catch(e){console.warn('Firebase',e)}
ready=true;if(FB)await ensureAccount();subRank();subPoke();render()})();
}
