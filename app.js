(() => {
  const W=window.WEDDINGBOOK_DATA.venues, I=window.IWEDDING_DATA.venues, $=id=>document.getElementById(id);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=x=>String(x??'').toLowerCase().replace(/[\s_().,·-]/g,'');
  const nums=x=>[...String(x??'').matchAll(/\d[\d,]*/g)].map(y=>+y[0].replaceAll(',',''));
  const num=x=>nums(x)[0]??null, fmt=x=>x===null||x===undefined||x===''?'<span class="muted">미공개</span>':esc(x);
  const name=x=>norm(x).replace(/(강남|영등포|여의도)(점)?$/,'').replace(/웨딩홀$/,'');
  const road=x=>String(x??'').replace(/\s/g,'').replace(/^서울(?:특별시|시)?(?:강남|영등포)구/,'').match(/[가-힣0-9]+(?:대로|로|길)\d+(?:-\d+)?/)?.[0]||'';
  const basic=(i,k)=>i?.basic?.[k]||'', addr=i=>basic(i,'주소').split('\n')[0];
  const val=(r,k)=>{const p=r?.fields?.indexOf(k)??-1;return p<0?'':r.fields[p+1]||''};
  const section=(r,k)=>r?.fields?.find(x=>x.startsWith(k))?.replace(new RegExp('^'+k.replace(/[()]/g,'\\$&')+'\\s*'),'').replace(/\s+/g,' ')||'';
  const hall=r=>r?.heading?.split(' / ')[0]||'', floor=r=>r?.heading?.split(' / ')[1]||'';
  const guests=(r,k)=>num(val(r,'수용 인원').match(new RegExp(k+'\\s*([\\d,]+)명'))?.[1]);
  const meal=r=>val(r,'메뉴/식대').match(/[\d,]+원(?:\s*~\s*[\d,]+원)?/s)?.[0]?.replace(/\s+/g,' ')||'';
  const food=r=>val(r,'메뉴/식대').split('\n')[0];
  const ctext=r=>val(r,'홀타입\n예식 형태/간격'), interval=r=>ctext(r).match(/(?:동시(?:,분리)?|분리)\s*\/\s*(\d+분)/)?.[1]||'';
  const style=r=>ctext(r).match(/(동시(?:,분리)?|분리)\s*\//)?.[1]||'';
  const type=r=>ctext(r).replace(/\s*(동시(?:,분리)?|분리)\s*\/\s*\d+분.*/s,'').replace(/\s+/g,', ');
  const rental=r=>section(r,'대관료 (필수)'), flower=r=>section(r,'꽃장식 (필수)'), production=r=>section(r,'연출료 (필수)'), alcohol=r=>val(r,'음주류').replace(/\s+/g,' ');
  const parkW=w=>w?.parking?.match(/내부\s*[\d,]+대/)?.[0]||'', parkI=i=>basic(i,'주차 형태').match(/주차 수용 대수\s*:\s*[\d,]+/)?.[0]||'';
  const compare=(w,i)=>{if(!w&&!i)return fmt();if(!w)return '<span class="source-i">'+fmt(i)+'</span>';if(!i)return '<span class="source-w">'+fmt(w)+'</span>';
    const a=nums(w),b=nums(i),same=norm(w)===norm(i)||(a.length===1&&b.length===1&&a[0]===b[0]);
    return same?fmt(w)+'<small class="same">두 사이트 일치</small>':'<span class="source-w">웨딩북 '+fmt(w)+'</span><span class="source-i">아이웨딩 '+fmt(i)+'</span>'};
  const used=new Set(), venues=[];
  const aliases={'호텔삼정':'삼정호텔_강남','아모리스_역삼점(GS타워)':'아모리스 역삼점_강남','드레스가든청담':'드레스가든_강남'};
  for(const i of I){let c=W.filter(w=>!used.has(w)&&w.region===i.region&&(name(w.name)===name(i.name)||w.name===aliases[i.name]));
    if(c.length!==1){const street=road(addr(i));c=W.filter(w=>!used.has(w)&&w.region===i.region&&road(w.address)===street);
      if(c.length!==1||['여의대로24','문래로164'].includes(street))c=[]}
    const w=c[0]||null;if(w)used.add(w);venues.push({w,i})}
  for(const w of W)if(!used.has(w))venues.push({w,i:null});
  const rows=[];for(const v of venues){const rest=[...(v.w?.rooms||[])];for(const ir of v.i?.rooms||[]){
      let n=rest.findIndex(wr=>norm(wr.name).replace(/(?:26|27)년.*$/,'').replace(/홀$/,'')===norm(hall(ir)).replace(/홀$/,''));
      if(n<0&&rest.length===1&&v.i.rooms.length===1)n=0;rows.push({...v,wr:n<0?null:rest.splice(n,1)[0],ir})}
    for(const wr of rest)rows.push({...v,wr,ir:null});if(!v.i?.rooms?.length&&!v.w?.rooms?.length)rows.push({...v,wr:null,ir:null})}
  const ids=['query','area','source','meal-type','min-recommended','max-recommended','guest-target','min-guarantee','max-guarantee','min-seated','max-seated','min-capacity','max-capacity','max-meal','max-rental','min-parking'];
  const rowName=r=>r.w?.name||r.i?.name||'', region=r=>r.w?.region||r.i?.region||'';
  const dong=r=>r.w?.neighborhood||(/여의도|여의대로|의사당|국제금융|여의나루|은행로|63로/.test(addr(r.i))?'여의도동':'');
  const values=(...items)=>items.map(num).filter(x=>x!==null);
  const low=(...items)=>{const n=values(...items);return n.length?Math.min(...n):null};
  const high=(...items)=>{const n=values(...items);return n.length?Math.max(...n):null};
  const parking=r=>high(parkW(r.w),parkI(r.i));
  const nval=(r,k)=>({recommended:num(r.wr?.['추천인원']),guarantee:guests(r.ir,'최소'),seated:guests(r.ir,'착석'),capacity:guests(r.ir,'최대'),meal:low(r.wr?.['식대'],meal(r.ir)),rental:low(r.wr?.['대관료'],rental(r.ir)),parking:parking(r)})[k];
  $('venue-count').textContent=venues.length;$('room-count').textContent=rows.length;$('overlap-count').textContent=venues.filter(v=>v.w&&v.i).length;
  for(const t of [...new Set(rows.flatMap(r=>[r.wr?.['식사형태'],food(r.ir)].filter(Boolean)))].sort((a,b)=>a.localeCompare(b,'ko'))){const o=document.createElement('option');o.value=o.textContent=t;$('meal-type').append(o)}
  let visible=[],csvGroups=[],sortKey='name';
  const storageKey='wedding-hall-index:filters:v1';
  function saveFilters(){
    try{localStorage.setItem(storageKey,JSON.stringify({filters:Object.fromEntries(ids.map(id=>[id,$(id).value])),sortKey}))}catch{}
  }
  function restoreFilters(){
    try{
      const saved=JSON.parse(localStorage.getItem(storageKey));
      for(const id of ids){const input=$(id),value=saved?.filters?.[id];
        if(typeof value==='string'&&(input.tagName!=='SELECT'||[...input.options].some(option=>option.value===value)))input.value=value}
      const key=saved?.sortKey;
      if(typeof key==='string'&&[...document.querySelectorAll('th[data-sort]')].some(th=>key===th.dataset.sort||key===th.dataset.sort+'-desc'))sortKey=key;
    }catch{}
  }
  function matches(r){const q=norm($('query').value);if(q&&!norm([rowName(r),r.i?.name,r.w?.address,addr(r.i),r.w?.subway,r.w?.amenities,r.i?.intro,r.wr?.name,r.ir?.heading].join(' ')).includes(q))return false;
    const a=$('area').value,rg=region(r),d=dong(r);if(a==='강남구'&&rg!=='서울 강남구'||a==='영등포구'&&rg!=='서울 영등포구'||a==='여의도동'&&d!=='여의도동'||a==='영등포구-여의도외'&&(rg!=='서울 영등포구'||d==='여의도동'))return false;
    const s=$('source').value;if(s==='both'&&!(r.paired||r.w&&r.i)||s==='wb'&&!r.w||s==='iw'&&!r.i)return false;
    if($('meal-type').value&&![r.wr?.['식사형태'],food(r.ir)].includes($('meal-type').value))return false;
    if($('guest-target').value){const n=+$('guest-target').value,min=guests(r.ir,'최소'),max=guests(r.ir,'최대');if(min===null||max===null||n<min||n>max)return false}
    for(const [id,k,op] of [['min-recommended','recommended',1],['max-recommended','recommended',-1],['min-guarantee','guarantee',1],['max-guarantee','guarantee',-1],['min-seated','seated',1],['max-seated','seated',-1],['min-capacity','capacity',1],['max-capacity','capacity',-1],['max-meal','meal',-1],['max-rental','rental',-1],['min-parking','parking',1]]){const x=$(id).value;if(x){const n=nval(r,k),v=+x*(id==='max-rental'?10000:1);if(n==null||op*(n-v)<0)return false}}return true}
  const venueKey=r=>r.venueId||(r.w?'w:'+r.w.id:'i:'+r.i.id);
  const allByVenue=new Map();
  for(const r of rows){const key=venueKey(r);if(!allByVenue.has(key))allByVenue.set(key,[]);allByVenue.get(key).push(r)}
  function groupRows(matched){const grouped=new Map();for(const r of matched){const key=venueKey(r);if(!grouped.has(key))grouped.set(key,{w:r.w,i:r.i,rows:[],all:allByVenue.get(key)});grouped.get(key).rows.push(r)}return [...grouped.values()]}
  const roomName=r=>r.wr?.name||hall(r.ir)||'홀 정보 미공개';
  const byName=(a,b)=>rowName(a.r).localeCompare(rowName(b.r),'ko')||roomName(a.r).localeCompare(roomName(b.r),'ko')||a.source.localeCompare(b.source,'ko');
  function sortRooms(a,b){if(sortKey==='name'||sortKey==='name-desc'){const n=byName(a,b);return sortKey.endsWith('-desc')?-n:n}
    const key=sortKey.replace('-desc',''),descending=sortKey.endsWith('-desc'),x=nval(a.r,key),y=nval(b.r,key);
    if(x===null)return y===null?byName(a,b):1;if(y===null)return -1;
    return (descending?y-x:x-y)||byName(a,b)}
  const item=(k,v,wide=false)=>'<div class="detail-item'+(wide?' wide':'')+'"><strong>'+esc(k)+'</strong><span>'+v+'</span></div>';
  function detail(r){const {w,i,wr,ir}=r,rev=i?.intro?.match(/([\d.]+)\/10\s*\(\s*(\d+)개의 후기/),points=i?.intro?.split('Key Points!')[1]?.split('웨딩홀 소개')[0]?.trim();
    const data=[
      ['웨딩북 홀 추천인원',fmt(wr?.['추천인원'])],['웨딩북 장소 내 추천인원 범위',fmt(w?.rooms?.length?Math.min(...w.rooms.map(x=>num(x['추천인원'])).filter(x=>x!=null))+'~'+Math.max(...w.rooms.map(x=>num(x['추천인원'])).filter(x=>x!=null))+'명':'')],
      ['아이웨딩 최소 인원',fmt(guests(ir,'최소'))],['아이웨딩 착석 인원',fmt(guests(ir,'착석'))],['아이웨딩 최대 수용인원',fmt(guests(ir,'최대'))],['아이웨딩 장소 전체 보증·수용',fmt(basic(i,'보증 인원'))],
      ['웨딩북 혜택 인원 조건',fmt(w?.promotions?.match(/\d[\d,]*명\s*이상\s*보증\s*시\s*적용/)?.[0])],
      ['홀 이름',compare(wr?.name,hall(ir))],['홀 층',fmt(floor(ir))],['대관료',compare(wr?.['대관료'],rental(ir))],['식대',compare(wr?.['식대'],meal(ir))],['예식 간격',compare(wr?.['예식간격'],interval(ir))],
      ['꽃장식',compare(wr?.['꽃장식'],flower(ir))],['식사 형태',compare(wr?.['식사형태'],food(ir))],['아이웨딩 예식 형태',fmt(style(ir))],['아이웨딩 홀 유형',fmt(type(ir))],
      ['아이웨딩 연출료 (필수)',fmt(production(ir))],['아이웨딩 음주류',fmt(alcohol(ir))],['아이웨딩 장소 식대 범위',fmt(basic(i,'식사 비용'))],['아이웨딩 장소 유형',fmt(basic(i,'홀타입'))],
      ['아이웨딩 가능 행사',fmt(basic(i,'가능 행사'))],['아이웨딩 후기',rev?esc(rev[1])+'/10 · '+esc(rev[2])+'건':fmt()],['웨딩북 사이트 표시 총 정가',fmt(w?.total_regular)],
      ['웨딩북 목록 대관료',fmt(w?.list_rental)],['웨딩북 목록 식대',fmt(w?.list_meal)],['웨딩북 목록 혜택',fmt(w?.badges?.join(', '))],['웨딩북 할인',fmt(w?.discount)],
      ['주소',compare(w?.address,addr(i)),true],['주차',compare(w?.parking,basic(i,'주차 형태')),true],['웨딩북 지하철',fmt(w?.subway)],['웨딩북 운영시간',fmt(w?.hours)],
      ['웨딩북 부대시설',fmt(w?.amenities),true],['웨딩북 혜택·상담 기간',fmt(w?.promotions),true],['아이웨딩 핵심 정보',fmt(points),true]
    ];return '<div class="detail-box">'+data.map(([k,v,x])=>item(k,v,x)).join('')+(w?'<details class="raw"><summary>웨딩북 수집 원문</summary><pre>'+esc(w.raw_info_text)+'</pre></details>':'')+(ir?'<details class="raw"><summary>아이웨딩 홀 수집 원문</summary><pre>'+esc(ir.raw)+'</pre></details>':'')+'</div>'}
  const equalValue=(a,b)=>{if(!a&&!b)return true;if(!a||!b)return false;const x=nums(a),y=nums(b);return norm(a)===norm(b)||(x.length===1&&y.length===1&&x[0]===y[0])};
  function differences(r){if(!r.wr||!r.ir)return [];
    const pairs=[['홀 이름',r.wr.name,hall(r.ir)],['대관료',r.wr['대관료'],rental(r.ir)],['식대',r.wr['식대'],meal(r.ir)],['예식 간격',r.wr['예식간격'],interval(r.ir)],['꽃장식',r.wr['꽃장식'],flower(r.ir)],['식사 형태',r.wr['식사형태'],food(r.ir)]];
    const pW=num(parkW(r.w)),pI=num(parkI(r.i));if(pW!==null&&pI!==null)pairs.push(['주차 대수',pW+'대',pI+'대']);
    const aW=road(r.w?.address),aI=road(addr(r.i));if(aW&&aI)pairs.push(['주소',aW,aI]);
    return pairs.filter(([label,a,b])=>label==='주소'||label==='홀 이름'?norm(a)!==norm(b):!equalValue(a,b)).map(([label])=>label)}
  function hallRecords(r){const venueId=venueKey(r);if(!r.wr||!r.ir){const source=r.wr?'웨딩북':r.ir?'아이웨딩':r.w?'웨딩북':'아이웨딩';return [{r:{...r,w:source==='웨딩북'?r.w:null,i:source==='아이웨딩'?r.i:null,venueId},source,changes:[]}]}
    const changes=differences(r);if(!changes.length)return [{r,source:'두 사이트 일치',changes:[]}];
    return [{r:{...r,i:null,ir:null,paired:true,venueId},source:'웨딩북',changes},{r:{...r,w:null,wr:null,paired:true,venueId},source:'아이웨딩',changes}]}
  const sourceLinks=r=>[r.w&&'<a href="'+esc(r.w.url)+'" target="_blank" rel="noopener noreferrer">웨딩북 ↗</a>',r.i&&'<a href="'+esc(r.i.url)+'" target="_blank" rel="noopener noreferrer">아이웨딩 ↗</a>'].filter(Boolean).join(' · ');
  function hallRecordHtml({r,source,changes}){
    return '<tr class="hall-row"><td><div class="name">'+esc(rowName(r))+'</div><div class="room-name">'+esc(roomName(r))+'</div><div class="sub">'+esc(region(r))+' · '+esc(dong(r)||'동 미확인')+'</div></td><td><span class="source-badge">'+esc(source)+'</span>'+(changes.length?'<div class="difference-label">차이: '+esc(changes.join(' · '))+'</div>':'')+'</td><td>'+fmt(r.wr?.['추천인원'])+'</td><td>'+fmt(guests(r.ir,'최소'))+'</td><td>'+fmt(guests(r.ir,'착석'))+'</td><td>'+fmt(guests(r.ir,'최대'))+'</td><td>'+compare(r.wr?.['식대'],meal(r.ir))+'</td><td>'+compare(num(parkW(r.w))!==null?num(parkW(r.w))+'대':'',num(parkI(r.i))!==null?num(parkI(r.i))+'대':'')+'</td><td class="links">'+sourceLinks(r)+'</td></tr>'}
  const displayRows=rows.flatMap(hallRecords);
  $('room-count').textContent=displayRows.length;
  function render(){visible=displayRows.filter(({r})=>matches(r)).sort(sortRooms);csvGroups=groupRows(rows.filter(matches));$('result-count').textContent=new Set(visible.map(({r})=>venueKey(r))).size;$('matching-room-count').textContent=visible.length;$('empty').hidden=visible.length>0;
    for(const th of document.querySelectorAll('th[data-sort]')){const key=th.dataset.sort;th.setAttribute('aria-sort',sortKey===key?'ascending':sortKey===key+'-desc'?'descending':'none')}
    $('rows').innerHTML=visible.map(hallRecordHtml).join('')}
  for(const id of ids)$(id).addEventListener(id==='query'||id==='guest-target'||id.startsWith('min-')||id.startsWith('max-')?'input':'change',()=>{saveFilters();render()});
  const sortFromHeader=th=>{const key=th.dataset.sort;sortKey=sortKey===key?key+'-desc':key;saveFilters();render()};
  document.querySelector('thead').addEventListener('click',e=>{const th=e.target.closest('th[data-sort]');if(th)sortFromHeader(th)});
  document.querySelector('thead').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('th[data-sort]')){e.preventDefault();sortFromHeader(e.target)}});
  $('reset').addEventListener('click',()=>{for(const id of ids)$(id).value='';sortKey='name';saveFilters();render()});
  $('export').addEventListener('click',()=>{const h=['웨딩홀','지역','동','웨딩북 홀','아이웨딩 홀','웨딩북 추천인원','아이웨딩 최소','아이웨딩 착석','아이웨딩 최대','아이웨딩 장소 보증·수용','웨딩북 대관료','아이웨딩 대관료','웨딩북 식대','아이웨딩 식대','웨딩북 간격','아이웨딩 간격','아이웨딩 예식형태','웨딩북 꽃장식','아이웨딩 꽃장식','아이웨딩 연출료','아이웨딩 음주류','웨딩북 식사형태','아이웨딩 식사형태','아이웨딩 홀유형','아이웨딩 층','웨딩북 주소','아이웨딩 주소','웨딩북 주차','아이웨딩 주차','웨딩북 지하철','웨딩북 부대시설','웨딩북 운영시간','웨딩북 목록 대관료','웨딩북 목록 식대','웨딩북 총 정가','웨딩북 혜택','웨딩북 할인','웨딩북 혜택·상담 기간','아이웨딩 장소 식대 범위','아이웨딩 장소 유형','아이웨딩 가능 행사','아이웨딩 후기 평점/10','아이웨딩 후기 수','아이웨딩 소개·핵심 정보','웨딩북 URL','아이웨딩 URL'];
    const lines=csvGroups.map(g=>{const {w,i}=g,review=i?.intro?.match(/([\d.]+)\/10\s*\(\s*(\d+)개의 후기/),pack=fn=>g.all.map(r=>{const value=fn(r);return value===null||value===undefined||value===''?'':(r.wr?.name||hall(r.ir)||'홀 정보')+': '+value}).filter(Boolean).join('\n');
      return[rowName(g),region(g),dong(g),pack(r=>r.wr?.name),pack(r=>hall(r.ir)),pack(r=>r.wr?.['추천인원']),pack(r=>guests(r.ir,'최소')),pack(r=>guests(r.ir,'착석')),pack(r=>guests(r.ir,'최대')),basic(i,'보증 인원'),pack(r=>r.wr?.['대관료']),pack(r=>rental(r.ir)),pack(r=>r.wr?.['식대']),pack(r=>meal(r.ir)),pack(r=>r.wr?.['예식간격']),pack(r=>interval(r.ir)),pack(r=>style(r.ir)),pack(r=>r.wr?.['꽃장식']),pack(r=>flower(r.ir)),pack(r=>production(r.ir)),pack(r=>alcohol(r.ir)),pack(r=>r.wr?.['식사형태']),pack(r=>food(r.ir)),pack(r=>type(r.ir)),pack(r=>floor(r.ir)),w?.address,addr(i),w?.parking,basic(i,'주차 형태'),w?.subway,w?.amenities,w?.hours,w?.list_rental,w?.list_meal,w?.total_regular,w?.badges?.join(', '),w?.discount,w?.promotions,basic(i,'식사 비용'),basic(i,'홀타입'),basic(i,'가능 행사'),review?.[1],review?.[2],i?.intro,w?.url,i?.url]});
    const csv=x=>'"'+String(x??'').replaceAll('"','""')+'"',body='\ufeff'+[h,...lines].map(x=>x.map(csv).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='weddingbook_iwedding_2026-10-13.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
  restoreFilters();
  render();
})();
