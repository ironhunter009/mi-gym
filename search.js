/* Búsqueda: español e inglés, sinónimos y palabras de uso común, plurales, errores de tipeo,
   palabras en cualquier orden. Ordena por relevancia (nombre > otros datos) y prioriza los ejercicios más habituales. */
(function(){
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set('de del con en el la los las para y a al un una unos unas por sin mi mis que'.split(' '));
const stem = w => w.length>5 && w.endsWith('es') ? w.slice(0,-2) : w.length>3 && w.endsWith('s') ? w.slice(0,-1) : w;
const tokens = s => norm(s).split(/[^a-z0-9]+/).filter(t => t && !STOP.has(t));

/* palabras con que la gente busca -> términos que sí aparecen en los datos */
const SYN = {
  pecho:'pectorales', pectoral:'pectorales', espalda:'dorsales', dorsal:'dorsales', hombro:'hombros deltoides',
  brazo:'biceps triceps', pierna:'piernas cuadriceps isquiotibiales', gluteo:'gluteos', cola:'gluteos', poto:'gluteos',
  trasero:'gluteos', nalga:'gluteos', abdomen:'abdominales', guata:'abdominales', core:'abdominales', abs:'abdominales',
  abdominal:'abdominales crunch', abdominales:'crunch', pantorrilla:'pantorrillas', gemelo:'pantorrillas', femoral:'isquiotibiales',
  isquio:'isquiotibiales', cuadricep:'cuadriceps', antebrazo:'antebrazos', trapecio:'trapecios', lumbar:'lumbares',
  pesa:'mancuernas', mancuerna:'mancuernas', elastico:'banda', elastica:'banda', liga:'banda', polea:'polea cable',
  maquina:'maquina', lagartija:'flexion', flexione:'flexion', estocada:'zancada', barra:'barra dominada', dominada:'dominada',
  plano:'banca', banco:'banca', militar:'militar hombros', jalon:'jalon', elongacion:'estiramiento', elongar:'estiramiento',
  estirar:'estiramiento', elongue:'estiramiento', calentar:'calentamiento', calentamiento:'movilidad activacion',
  correr:'carrera trote', trotar:'carrera trote', bici:'bicicleta', casa:'peso corporal', corporal:'corporal'
};
/* distancia de edición acotada (-1 si supera max) */
function lev(a, b, max){
  if(Math.abs(a.length-b.length) > max) return -1;
  let prev = Array.from({length:b.length+1}, (_,i)=>i);
  for(let i=1; i<=a.length; i++){
    const cur = [i]; let low = i;
    for(let j=1; j<=b.length; j++){
      cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1));
      low = Math.min(low, cur[j]);
    }
    if(low > max) return -1;
    prev = cur;
  }
  return prev[b.length] <= max ? prev[b.length] : -1;
}
const toSet = s => new Set(tokens(s).map(stem));
function index(e, f){
  e._ix = {name:toSet(f.name), en:toSet(f.en), other:toSet(f.other)};
  e._nameNorm = norm(f.name);
}
function expand(t){
  const alts = new Set([stem(t)]);
  const syn = SYN[t] || SYN[stem(t)];
  if(syn) for(const x of tokens(syn)) alts.add(stem(x));
  return [...alts];
}
function matchTok(q, set){
  let best = 0;
  for(const t of set){
    if(t===q) return 1;
    if(t.startsWith(q)) best = Math.max(best, q.length>=3 ? .85 : .5);
    else if(q.length>=4){
      const d = lev(q, t.slice(0, q.length+1), q.length>=7 ? 2 : 1);
      if(d>=0) best = Math.max(best, .55);
    }
  }
  return best;
}
function find(q, list, boost){
  const qt = tokens(q);
  if(!qt.length) return list;
  const groups = qt.map(expand), qn = norm(q).trim();
  const out = [];
  for(const e of list){
    if(!e._ix) continue;
    let total = 0, ok = true;
    for(const alts of groups){
      let s = 0;
      for(const a of alts) s = Math.max(s, matchTok(a, e._ix.name)*3, matchTok(a, e._ix.en)*2, matchTok(a, e._ix.other)*1.2);
      if(!s){ ok = false; break; }
      total += s;
    }
    if(!ok) continue;
    if(e._nameNorm.startsWith(qn)) total += 2;
    out.push([e, total + (boost ? boost(e) : 0) - e._nameNorm.length*.005]);
  }
  return out.sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
}
window.Search = {index, find};
})();
