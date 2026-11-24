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
let FB=null,ready=false,players=null,playersErr=false,unsubRank=null,saveT=null,wq=Promise.resolve(),pq=Promise.resolve(),lastPush='',T=null,rankGroup=null;
const K={inp:{},res:{},flip:false};
const $=s=>document.querySelector(s);
const urlGroup=(()=>{try{const g=new URLSearchParams(location.search).get('g');return g==null?null:cleanGroup(g)}catch(e){return null}})();

function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)}
function save(){S.updated=Date.now();lsSet(LS,S);if(!FB)return;clearTimeout(saveT);saveT=setTimeout(()=>{const body=JSON.parse(JSON.stringify(S));const{fs,db,uid}=FB;wq=wq.then(()=>fs.setDoc(fs.doc(db,'users',uid),body)).catch(()=>toast('인터넷 연결을 확인해 주세요. 기록은 이 기기에 저장돼 있어요.'))},800)}
const isDone=dt=>{const d=S.days[dt];return !!(d&&d.w&&d.r&&d.s&&d.k&&d.a)};
function streak(){const t=today();let c=0,lastF=-99;for(let k=0;k<500;k++){const dt=addD(t,-k);if(S.start&&dt<S.start)break;if(isDone(dt)){c++;continue}if(k===0)continue;if(k-lastF>=7&&isDone(addD(t,-(k+1)))){lastF=k;continue}break}return c}
const weekDone=()=>{let c=0;for(let k=0;k<7;k++)if(isDone(addD(today(),-k)))c++;return c};
const totalDone=()=>Object.keys(S.days).filter(isDone).length;
function pushPlayer(){if(!FB||!S.nick||!S.level)return;const p={nick:S.nick.slice(0,12),group:'',level:S.level|0,streak:streak()|0,week:weekDone()|0,total:totalDone()|0,words:Object.keys(S.srs).length|0,last:today()};const k=JSON.stringify(p);if(k===lastPush)return;lastPush=k;const{fs,db,uid}=FB;pq=pq.then(()=>fs.setDoc(fs.doc(db,'players',uid),p)).catch(()=>{lastPush=''})}
const getW=id=>{const[l,i]=String(id).split('-');const w=W[l]&&W[l][+i];return w?{id,en:w[0],ko:w[1],use:w[2],ex:w[3],exk:w[4]}:null};
const dayN=()=>Math.max(0,diff(S.start||today(),today()));
function wordsToday(n){const l=S.level,p=W[l],b=(((n-S.lvDay)*5)%p.length+p.length)%p.length;return[0,1,2,3,4].map(j=>getW(l+'-'+((b+j)%p.length)))}
const sentFor=n=>[0,1,2].map(j=>SENT[(n*3+j)%SENT.length]);
const artFor=n=>ART[n%ART.length];
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
function vToday(){const d=plan(),n=dayN(),ws=wordsToday(n),ss=sentFor(n),ks=sentFor(Math.max(0,n-1)),A=artFor(n);
let h=`<section><h2>오늘의 단어 ${ck(d.w)}</h2><p class="sub">${n+1}일째 · 5개만. 소리 내서 한 번씩 읽어보세요. 별을 누르면 단어장에 들어가요.</p>`;
h+=ws.map(w=>`<div class="card"><div class="wrow"><span class="en grow">${esc(w.en)}</span>${sayB(w.en)}${starB(w.id,w.en,w.ko)}</div><div class="ko">${esc(w.ko)}</div><div class="use">${esc(w.use)}</div><div class="ex"><div class="wrow"><span class="e">${esc(w.ex)}</span>${sayB(w.ex)}</div><div class="k">${esc(w.exk)}</div></div></div>`).join('');
h+=`<button class="btn wide" data-act="wdone" ${d.w?'disabled':''}>${d.w?'오늘 단어 완료':'다 봤어요'}</button></section>`;
h+=`<section><h2>복습 ${ck(d.r)}</h2>`;
if(!d.rq.length)h+=`<p class="sub">오늘은 복습할 단어가 없어요. 오늘 본 단어는 내일부터 1·3·7·14·30일 간격으로 다시 나와요.</p>`;
else if(d.r)h+=`<p class="sub">복습 ${d.rq.length}개 끝! 몰랐던 단어는 단어장에 넣어뒀어요.</p>`;
else{const w=getW(d.rq[d.ri])||{en:'?',ko:'?'};h+=`<p class="sub">${d.ri+1} / ${d.rq.length} · 뜻을 떠올린 뒤 확인하세요.</p><div class="card flash"><div class="en">${esc(w.en)}</div><div style="margin:10px 0">${sayB(w.en)}</div>${K.flip?`<div class="ko" style="font-size:20px">${esc(w.ko)}</div><div class="row" style="justify-content:center"><button class="btn cor" data-act="rno">몰랐어요</button><button class="btn" data-act="rok">알았어요</button></div>`:`<button class="btn ghost" data-act="rflip">뜻 보기</button>`}</div>`}
h+=`</section><section><h2>오늘의 문장 ${ck(d.s)}</h2><p class="sub">듣고, 따라서 소리 내어 두세 번 말해보세요.</p>`;
h+=ss.map(s=>`<div class="card"><div class="wrow"><span class="en grow" style="font-size:20px">${esc(s[1])}</span>${sayB(s[1])}</div><div class="use">${esc(s[0])}</div></div>`).join('');
h+=`<button class="btn wide" data-act="sdone" ${d.s?'disabled':''}>${d.s?'문장 완료':'따라 말해봤어요'}</button></section>`;
h+=`<section><h2>영작 연습 ${ck(d.k)}</h2><p class="sub">${n?'어제 배운 문장이에요.':'오늘 배운 문장이에요.'} 한국어를 보고 영어로 써보세요.</p>`;
h+=ks.map((s,i)=>{const r=K.res[i];return `<div class="card"><div class="ko" style="margin-bottom:8px">${esc(s[0])}</div><textarea data-ki="${i}" aria-label="영어로 쓰기" placeholder="영어로 써보세요" autocapitalize="sentences" autocomplete="off" spellcheck="false">${esc(K.inp[i]||'')}</textarea><div class="row"><button class="btn ghost" data-act="kchk" data-i="${i}">확인</button></div>${r?`<div class="res">${r.sim>=.9?'<b>완벽해요!</b>':r.sim>=.6?'<b>거의 맞았어요.</b>':'<span class="no">정답과 비교해보세요.</span>'}<div class="ans"><strong>${esc(s[1])}</strong>${sayB(s[1])}</div><div class="note">다른 표현도 정답일 수 있어요.</div></div>`:''}</div>`}).join('');
h+=`</section><section><h2>오늘의 아티클 ${ck(d.a)}</h2><p class="sub">모르는 단어를 누르면 뜻이 나와요. 점선 밑줄은 묶어서 외우면 좋은 표현이에요.</p><div class="card"><div class="wrow"><span class="en grow" style="font-size:21px">${esc(A.t)}</span>${sayB(A.t+'. '+A.x.replace(/[\[\]]/g,''))}</div><div class="use" style="margin-bottom:10px">${esc(A.k)}</div><div class="art">${artHTML(A)}</div></div><button class="btn wide" data-act="adone" ${d.a?'disabled':''}>${d.a?'아티클 완료':'다 읽었어요'}</button><p class="note">가볍게 읽기 좋게 쓴 글이에요. 실제 뉴스 기사는 아니에요.</p></section>`;
if(isDone(today()))h+=`<section><h2>오늘 다섯 칸 다 채웠어요</h2><p class="sub">내일 또 만나요. 하루를 놓쳐도 일주일에 한 번은 연속 기록이 유지돼요.</p></section>`;
return h}
const splitS=x=>x.match(/[^.!?]+[.!?]+["']?\s*/g)||[x];
function artHTML(A){return splitS(A.x).map((s,si)=>s.replace(/\[([^\]]+)\]|([A-Za-z]+(?:['’-][A-Za-z]+)*)|([^A-Za-z\[]+)/g,(m,ph,w,o)=>o!=null?esc(o):`<span class="tk${ph?' ph':''}" data-act="tk" data-w="${esc(ph||w)}" data-s="${si}" role="button" tabindex="0">${esc(ph||w)}</span>`)).join('')}
const poolMap={};for(const l in W)W[l].forEach((w,i)=>{poolMap[w[0].toLowerCase()]=l+'-'+i});
function lookup(w,A){const k=w.toLowerCase().replace(/’/g,"'");const forms=[k,k.replace(/'s$/,''),k.replace(/ies$/,'y'),k.replace(/es$/,''),k.replace(/s$/,''),k.replace(/ed$/,''),k.replace(/d$/,''),k.replace(/ing$/,''),k.replace(/ing$/,'e')];for(const f of forms)if(A.g[f])return{ko:A.g[f],key:'x:'+f,en:f};for(const f of forms)if(poolMap[f]){const p=getW(poolMap[f]);return{ko:p.ko,key:p.id,en:p.en}}for(const f of forms)if(COMMON[f])return{ko:COMMON[f],key:'x:'+f,en:f};return null}
function openPop(el){const w=el.dataset.w,si=+el.dataset.s,A=artFor(dayN());const ctx=(splitS(A.x)[si]||'').replace(/[\[\]]/g,'').trim();const r=lookup(w,A);document.querySelectorAll('.tk.sel').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');const q=encodeURIComponent((r?r.en:w).toLowerCase());
$('#pop').innerHTML=`<div class="wrow"><span class="en grow">${esc(w)}</span>${sayB(w)}${r?starB(r.key,r.en,r.ko):''}<button class="ib" data-act="pclose" aria-label="닫기">✕</button></div><div class="ko" style="font-size:18px;margin-top:4px">${r?esc(r.ko):'뜻 정보가 없어요'}</div><div class="note" style="margin-top:8px">${esc(ctx)}</div><div style="margin-top:8px"><a href="https://en.dict.naver.com/#/search?query=${q}" target="_blank" rel="noopener">네이버 사전에서 더 보기 →</a></div>`;$('#pop').classList.add('on')}
function closePop(){$('#pop').classList.remove('on');document.querySelectorAll('.tk.sel').forEach(x=>x.classList.remove('sel'))}
const CON=[[/\bi'm\b/g,'i am'],[/\bit's\b/g,'it is'],[/\bdon't\b/g,'do not'],[/\bcan't\b/g,'can not'],[/\bcannot\b/g,'can not'],[/\bi'll\b/g,'i will'],[/\blet's\b/g,'let us'],[/\bwhat's\b/g,'what is'],[/\bwhere's\b/g,'where is'],[/\bdidn't\b/g,'did not'],[/\bthat's\b/g,'that is'],[/\byou're\b/g,'you are'],[/\bi've\b/g,'i have'],[/\bisn't\b/g,'is not'],[/\bhaven't\b/g,'have not'],[/\bwon't\b/g,'will not'],[/\btoday's\b/g,'today is']];
const norm=s=>{let x=String(s).toLowerCase().replace(/[’`]/g,"'");CON.forEach(([r,v])=>x=x.replace(r,v));return x.replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean)};
function sim(a,u){const A=norm(a),U=norm(u);if(!U.length)return 0;const pool=A.slice();let c=0;U.forEach(t=>{const i=pool.indexOf(t);if(i>=0){c++;pool.splice(i,1)}});return 2*c/(A.length+U.length)}
function vWords(){const st=Object.entries(S.star),lr=Object.entries(S.srs).map(([id,v])=>({w:getW(id),v})).filter(x=>x.w).sort((a,b)=>a.v.due<b.v.due?-1:1);
let h=`<section><h2>내 단어장</h2><p class="sub">별표한 단어 ${st.length}개 · 복습이나 테스트에서 틀린 단어도 여기에 들어와요.</p>`;
h+=st.length?st.map(([k,v])=>`<div class="card"><div class="wrow"><span class="en grow" style="font-size:20px">${esc(v.en)}</span>${sayB(v.en)}${starB(k,v.en,v.ko)}</div><div class="ko">${esc(v.ko)}</div></div>`).join(''):`<div class="card note">아직 비어 있어요. 오늘의 단어나 아티클에서 별을 눌러보세요.</div>`;
h+=`</section><section><h2>배운 단어</h2><p class="sub">${lr.length}개 · 단계가 오를수록 복습 간격이 길어져요 (1→3→7→14→30일).</p>`;
h+=lr.length?lr.map(x=>`<div class="rk" style="grid-template-columns:minmax(0,1fr) auto"><div><b>${esc(x.w.en)}</b> <span class="use">${esc(x.w.ko)}</span></div><div class="num" style="font-size:14px">${x.v.stage+1}단계<small>${x.v.due<=today()?'복습 대기':'다음 '+md(x.v.due)}</small></div></div>`).join(''):`<div class="card note">오늘의 단어에서 ‘다 봤어요’를 누르면 여기에 쌓여요.</div>`;
return h+`</section>`}
function testItems(){const it=Object.entries(S.srs).map(([id,v])=>{const w=getW(id);return w?{key:id,en:w.en,ko:w.ko,st:v.stage}:null}).filter(Boolean);Object.entries(S.star).forEach(([k,v])=>{if(!S.srs[k])it.push({key:k,en:v.en,ko:v.ko,st:0})});return it}
function buildQs(){const all=testItems(),it=all.slice().sort((a,b)=>a.st-b.st||Math.random()-.5).slice(0,10),dis=W[S.level].map(w=>({en:w[0],ko:w[1]})).concat(all);return shuf(it).map(x=>{const ek=Math.random()<.5,f=ek?'ko':'en',others=shuf(dis.filter(d=>d[f]!==x[f]).map(d=>d[f])).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3),o=shuf([x[f]].concat(others));return{q:ek?`"${x.en}" 의 뜻은?`:`"${x.ko}" 를 영어로?`,o,a:o.indexOf(x[f]),it:x}})}
const lastTest=()=>S.tests.filter(t=>t.official).slice(-1)[0];
function weekState(){const n=testItems().length,lt=lastTest(),next=lt?addD(lt.date,7):addD(S.start||today(),6);return{n,next,open:n>=4&&today()>=next}}
function vQuiz(){const q=T.qs[T.i],p=T.pick;let h=`<section><p class="sub">${T.kind==='level'?'레벨테스트':T.kind==='week'?'주간 테스트':'연습 테스트'} · ${T.i+1} / ${T.qs.length}</p><h2 style="font-size:23px">${esc(q.q)}</h2>`;h+=q.o.map((o,j)=>`<button class="opt${p!=null?(j===q.a?' r':j===p?' w':''):''}" data-act="qa" data-o="${j}" ${p!=null?'disabled':''}>${esc(o)}</button>`).join('');if(p!=null)h+=`<button class="btn wide" style="margin-top:8px" data-act="qn">${T.i+1<T.qs.length?'다음':'결과 보기'}</button>`;return h+`</section>`}
function vResult(){const tot=T.qs.length,sc=T.score,pct=Math.round(sc/tot*100);let h=`<section><h2 style="font-size:28px">${sc} / ${tot}</h2>`;
if(T.kind==='level'){const l=sc<=5?1:sc<=9?2:3;h+=`<p class="sub">추천 레벨은 <b>Lv.${l} ${LVN[l]}</b>이에요. 다른 레벨로 시작해도 돼요.</p><div class="row">${[1,2,3].map(x=>`<button class="btn${x===l?'':' ghost'}" data-act="lvset" data-l="${x}">Lv.${x} ${LVN[x]}</button>`).join('')}</div>`}
else{h+=`<p class="sub">정답률 ${pct}%. 틀린 단어는 단어장에 넣어뒀어요.</p>`;if(T.kind==='week'&&pct>=90&&S.level<3)h+=`<div class="card">거의 다 맞혔어요. 한 단계 올려볼까요?<div class="row"><button class="btn" data-act="lvset" data-l="${S.level+1}">Lv.${S.level+1}로 올리기</button></div></div>`;if(T.kind==='week'&&pct<=40&&S.level>1)h+=`<div class="card">조금 어려웠나요? 한 단계 내려도 괜찮아요.<div class="row"><button class="btn ghost" data-act="lvset" data-l="${S.level-1}">Lv.${S.level-1}로 내리기</button></div></div>`;h+=`<div class="row"><button class="btn ghost" data-act="qend">닫기</button></div>`}
return h+`</section>`}
function vTest(){if(T)return T.done?vResult():vQuiz();const ws=weekState(),lt=lastTest();let h=`<section><h2>주간 단어 테스트</h2><p class="sub">일주일에 한 번, 배운 단어와 별표 단어 중에서 10문제가 나와요.</p><div class="card">`;
if(ws.n<4)h+=`단어를 4개 이상 배우면 테스트를 볼 수 있어요. 지금 ${ws.n}개.`;else if(ws.open)h+=`이번 주 테스트가 열렸어요.<div class="row"><button class="btn" data-act="wstart">테스트 시작</button></div>`;else h+=`다음 테스트는 <b>${md(ws.next)}</b>에 열려요.<div class="row"><button class="btn ghost" data-act="pstart">연습 테스트 (기록 안 됨)</button></div>`;
h+=`</div>${lt?`<p class="note">지난 테스트: ${md(lt.date)} · ${lt.score}/${lt.total}</p>`:''}</section><section><h2>레벨테스트 다시 보기</h2><p class="sub">지금 Lv.${S.level} ${LVN[S.level]}. 12문제로 레벨을 다시 정할 수 있어요.</p><button class="btn ghost" data-act="lstart">레벨테스트 시작</button></section>`;return h}
function inviteLink(){return location.origin+location.pathname}
function vRank(){let h=`<section><h2>랭킹</h2><p class="sub">연속 학습일이 먼저, 같으면 이번 주에 다섯 칸을 채운 날 수로 순위를 매겨요. 실력이 아니라 꾸준함 대결이에요.</p>`;
if(!window.FIREBASE_CONFIG)h+=`<div class="card note">랭킹 서버가 아직 연결되지 않았어요. 지금은 내 기록만 이 기기에 저장돼요.</div>`;
else if(!FB)h+=`<div class="card note">${ready?'랭킹 서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.':'랭킹 불러오는 중…'}</div>`;
else if(playersErr)h+=`<div class="card note">랭킹을 불러오지 못했어요. 잠시 후 다시 열어주세요.</div>`;
else if(!players)h+=`<div class="card note">랭킹 불러오는 중…</div>`;
else{const ps=players.map(p=>({id:p.id,nick:String(p.nick||'친구').slice(0,12),level:Number(p.level)||1,streak:Number(p.streak)||0,week:Math.min(7,Number(p.week)||0),total:Number(p.total)||0,words:Number(p.words)||0,last:String(p.last||'')})).map(p=>{if(p.last&&diff(p.last,today())>1)p.streak=0;return p}).sort((a,b)=>b.streak-a.streak||b.week-a.week||b.total-a.total);h+=ps.length?ps.slice(0,100).map((p,i)=>`<div class="rk${p.id===FB.uid?' me':''}"><span class="n">${i+1}</span><div><b>${esc(p.nick)}</b> <span class="use">Lv.${p.level} · 단어 ${p.words}개</span><div class="bar"><i style="width:${p.week/7*100}%"></i></div><div class="note">이번 주 ${p.week}/7일</div></div><div class="num">${p.streak}일<small>연속</small></div></div>`).join(''):`<div class="card note">아직 아무도 없어요. 오늘 다섯 칸을 채우면 첫 번째로 올라가요.</div>`}
h+=`</section><section><h2>친구 초대</h2><p class="sub">이 링크를 보내면 친구가 바로 들어와서 같은 랭킹에 올라가요.</p><div class="copy"><input type="text" id="lnk" readonly value="${esc(inviteLink())}" aria-label="초대 링크"><button class="btn" data-act="share">공유</button></div></section>`;
h+=`<section><h2>내 기록</h2><div class="stats"><div><b>${streak()}</b>연속일</div><div><b>${weekDone()}/7</b>이번 주</div><div><b>${totalDone()}</b>총 완료일</div></div></section><section><h2>설정</h2><form id="nf"><label for="nick">닉네임</label><input type="text" id="nick" maxlength="12" value="${esc(S.nick)}" autocomplete="nickname"><div class="row"><button class="btn ghost wide">저장</button></div></form><p class="note">기록은 이 기기의 브라우저에 연결돼 있어요. 브라우저 데이터를 지우거나 다른 폰에서 열면 새로 시작해요.</p></section>`;return h}
function vOnboard(){return `<div class="wrap hero"><img class="logo" src="icon-192.png" alt=""><h1>홍글리쉬</h1><p class="sub" style="font-size:16px">하루 10분, 친구들이랑 영어 습관 만들기. 매일 단어 5개, 문장 3개, 영작 3개, 짧은 아티클 1개를 채우면 끝이에요.</p><form id="nf" class="card"><label for="nick" style="margin-top:4px">랭킹에 보일 닉네임</label><input type="text" id="nick" maxlength="12" placeholder="예: 영어왕" autocomplete="nickname"><div class="row"><button class="btn wide">레벨테스트 하러 가기</button></div><p class="note">12문제, 2분 정도 걸려요. 회원가입은 필요 없어요.</p></form></div>`}
function render(){const app=$('#app');let v=(location.hash||'#today').slice(1);if(!['today','words','test','rank'].includes(v))v='today';document.body.classList.toggle('has-nav',!!(S.nick&&S.level));
if(!S.nick){app.innerHTML=vOnboard();return}
if(!S.level){if(!T||T.kind!=='level')T={kind:'level',qs:LT,i:0,score:0,pick:null};app.innerHTML=`<div class="wrap" style="padding-top:var(--safe-t)">${T.done?vResult():vQuiz()}</div>`;return}
const y=window.scrollY;app.innerHTML=header()+`<main class="wrap">${v==='today'?vToday():v==='words'?vWords():v==='test'?vTest():vRank()}</main>`+tabs(v);window.scrollTo(0,y);if(ready)pushPlayer()}
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
else if(a==='kchk'){const i=+el.dataset.i,s=sentFor(Math.max(0,dayN()-1))[i],u=K.inp[i]||'';if(!u.trim()){toast('영어로 먼저 써보세요');return}K.res[i]={sim:sim(s[1],u)};if([0,1,2].every(j=>K.res[j]))d.k=1}
else if(a==='adone'){d.a=1;closePop()}
else if(a==='lstart')T={kind:'level',qs:LT,i:0,score:0,pick:null};
else if(a==='wstart'||a==='pstart')T={kind:a==='wstart'?'week':'practice',qs:buildQs(),i:0,score:0,pick:null};
else if(a==='qa'){if(T.pick!=null)return;const q=T.qs[T.i],o=+el.dataset.o;T.pick=o;if(o===q.a)T.score++;else if(q.it)S.star[q.it.key]={en:q.it.en,ko:q.it.ko}}
else if(a==='qn'){T.i++;T.pick=null;if(T.i>=T.qs.length){T.done=true;if(T.kind==='week')S.tests.push({date:t,score:T.score,total:T.qs.length,official:true})}window.scrollTo(0,0)}
else if(a==='qend')T=null;
else if(a==='lvset'){const l=+el.dataset.l;if(!S.start)S.start=t;S.level=l;S.lvDay=dayN();T=null;if(location.hash!=='#today')location.hash='#today';toast(`Lv.${l} ${LVN[l]}로 공부해요`)}
save();render()}
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;e.preventDefault();act(el.dataset.act,el)});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&e.target.dataset.act==='tk'){e.preventDefault();openPop(e.target)}if(e.key==='Escape')closePop()});
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.ki!=null)K.inp[e.target.dataset.ki]=e.target.value});
document.addEventListener('submit',e=>{if(e.target.id!=='nf')return;e.preventDefault();const v=$('#nick').value.trim().slice(0,12);if(!v){toast('닉네임을 입력해 주세요');$('#nick').focus();return}S.nick=v;S.group='';lastPush='';save();toast('저장했어요');render()});
window.addEventListener('hashchange',()=>{closePop();render()});

/* 카카오톡·인스타 등 앱 안 브라우저 안내 */
if(/KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\//i.test(navigator.userAgent)){const b=$('#inapp');b.textContent='앱 안 브라우저에서는 발음 듣기나 기록 저장이 잘 안 될 수 있어요. 메뉴에서 ‘다른 브라우저로 열기’를 눌러 크롬이나 사파리로 열어주세요.';b.hidden=false}

/* Firebase */
function subRank(){if(!FB)return;if(unsubRank){unsubRank();unsubRank=null}players=null;playersErr=false;rankGroup=S.group||'';const{fs,db}=FB;unsubRank=fs.onSnapshot(fs.collection(db,'players'),s=>{players=s.docs.map(x=>Object.assign({id:x.id},x.data()));if((location.hash||'#today')==='#rank')render()},()=>{playersErr=true;render()})}
async function initFB(){const cfg=window.FIREBASE_CONFIG;if(!cfg||!cfg.apiKey)return;const B='https://www.gstatic.com/firebasejs/10.12.2/';const[a,au,fs]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-auth.js'),import(B+'firebase-firestore.js')]);const app=a.initializeApp(cfg);const auth=au.getAuth(app);const cur=await new Promise(res=>{const un=au.onAuthStateChanged(auth,u=>{un();res(u)})});const user=cur||(await au.signInAnonymously(auth)).user;const db=fs.getFirestore(app);FB={fs,db,uid:user.uid};
try{const snap=await fs.getDoc(fs.doc(db,'users',user.uid));if(snap.exists()){const r=snap.data();if(r&&r.nick&&(!S.nick||(r.updated||0)>(S.updated||0))){S=Object.assign(blank(),r);lsSet(LS,S)}else if(S.nick)save()}else if(S.nick)save()}catch(e){}}
(async()=>{render();
try{await Promise.race([initFB(),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),15000))])}catch(e){console.warn('Firebase',e)}
ready=true;subRank();render()})();
}
