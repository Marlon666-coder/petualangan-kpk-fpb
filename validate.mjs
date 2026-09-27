// Validasi logika matematika & data level (dijalankan sekali untuk QA)
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function lcm(a,b){return a*b/gcd(a,b);}
function multiplesUpTo(n,count){const r=[];for(let i=1;i<=count;i++)r.push(n*i);return r;}
function factorsOf(n){const r=[];for(let i=1;i<=n;i++)if(n%i===0)r.push(i);return r;}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function buildOptions(answer,kind){
  const opts=new Set([answer]);const pool=[];
  if(kind==='KPK')pool.push(answer+2,answer-2,answer+4,Math.round(answer/2),answer*2);
  else pool.push(answer+1,answer-1,answer+2,answer+3,Math.max(1,answer-2));
  const sh=shuffle(pool);
  for(const p of sh){if(opts.size>=4)break;if(p>0&&p!==answer)opts.add(p);}
  let n=1;while(opts.size<4){opts.add(answer+n*5);n++;}
  return shuffle([...opts].slice(0,4));
}
const LEVELS=[
  {type:'KPK',pairs:[[2,4],[2,3],[3,6]]},
  {type:'FPB',pairs:[[4,8],[6,9],[4,6]]},
  {type:'KPK',pairs:[[4,8],[2,6],[3,4]]},
  {type:'FPB',pairs:[[8,12],[9,12],[6,15]]},
  {type:'KPK',pairs:[[4,6],[6,8],[3,5]]},
  {type:'FPB',pairs:[[12,18],[10,15],[8,20]]},
  {type:'STORY_KPK',pairs:[[4,6],[5,10],[3,4]]},
  {type:'STORY_FPB',pairs:[[12,18],[8,12],[16,24]]},
  {type:'STORY_KPK',pairs:[[6,8],[4,10],[6,9]]},
  {type:'CHOOSE',pairs:[['KPK',4,6],['FPB',12,18],['KPK',3,5]]},
  {type:'CHOOSE',pairs:[['FPB',8,12],['KPK',6,8],['FPB',10,15]]},
  {type:'CHOOSE',pairs:[['KPK',4,10],['FPB',16,24],['KPK',5,6]]},
  {type:'KPK',pairs:[[6,9],[8,12],[9,12]]},
  {type:'FPB',pairs:[[18,24],[16,20],[15,20]]},
  {type:'CHOOSE',pairs:[['KPK',8,12],['FPB',18,24],['KPK',6,10]]},
];
let ok=0,fail=0;
function check(kind,a,b,answer){
  if(kind==='KPK'){
    if(!multiplesUpTo(a,6).includes(answer)||!multiplesUpTo(b,6).includes(answer)){console.log(`FAIL KPK ${a},${b}=${answer} tidak tampil di 6 kelipatan`);return false;}
  }else{
    if(!factorsOf(a).includes(answer)||!factorsOf(b).includes(answer)){console.log(`FAIL FPB ${a},${b}=${answer}`);return false;}
  }
  const opts=buildOptions(answer,kind);
  if(opts.length!==4){console.log(`FAIL jumlah opsi ${a},${b}`);return false;}
  if(new Set(opts).size!==4){console.log(`FAIL opsi duplikat ${a},${b} -> ${opts}`);return false;}
  if(!opts.includes(answer)){console.log(`FAIL opsi tanpa jawaban ${a},${b} -> ${opts}`);return false;}
  if(opts.some(o=>o<=0)){console.log(`FAIL opsi <=0 ${a},${b} -> ${opts}`);return false;}
  return true;
}
LEVELS.forEach((lv,idx)=>{
  lv.pairs.forEach(p=>{
    let kind,a,b,answer;
    if(lv.type==='CHOOSE'){const[op,x,y]=p;kind=op;a=x;b=y;answer=op==='KPK'?lcm(x,y):gcd(x,y);}
    else{[a,b]=p;kind=(lv.type.includes('KPK'))?'KPK':'FPB';answer=kind==='KPK'?lcm(a,b):gcd(a,b);}
    let good=true;
    for(let t=0;t<300;t++){ if(!check(kind,a,b,answer)){good=false;break;} }
    if(good){ok++;}else{fail++;console.log(`  ^ Level ${idx+1} type=${lv.type} pair=${JSON.stringify(p)} answer=${answer}`);}
  });
});
console.log(`\nLevels: ${LEVELS.length} (harus 15)`);
console.log(`Soal tervalidasi: ${ok} OK, ${fail} GAGAL`);
const bank=[[4,6],[6,8],[8,12],[9,12],[12,18],[10,15],[6,9],[4,10],[16,24],[6,10],[8,20],[15,20]];
let cok=0;
bank.forEach(([a,b])=>{const k=lcm(a,b);if(multiplesUpTo(a,6).includes(k)&&multiplesUpTo(b,6).includes(k))cok++;else console.log(`Bank tantangan KPK ${a},${b} lcm=${k} tidak tampil di 6 kelipatan`);});
console.log(`Bank tantangan KPK tampil di 6 kelipatan: ${cok}/${bank.length}`);
process.exit(fail>0?1:0);
