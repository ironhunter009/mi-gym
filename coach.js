/* Revisión de sesiones: reglas de entrenamiento, sin IA.
   Clasifica cada ejercicio por patrón de movimiento (según su nombre y músculo), compara la sesión
   con lo que debería cubrir según su tipo y sugiere ejercicios conocidos que completen lo que falta. */
(function(){
/* Patrones. El primero que calza gana, así que van de lo más específico a lo más general.
   rank: 1 multiarticular, 2 accesorio, 3 músculo pequeño (define el orden sugerido en la sesión). */
const PATTERNS = [
  {id:'pullover', name:'Pullover', rank:2, test:e=>/pullover/.test(e.n)},
  {id:'calves', name:'Pantorrillas', rank:3, test:e=>e.t==='calves'},
  {id:'traps', name:'Trapecio', rank:3, test:e=>e.t==='traps'},
  {id:'forearms', name:'Antebrazos', rank:3, test:e=>e.t==='forearms'},
  {id:'biceps', name:'Bíceps', rank:3, test:e=>e.t==='biceps'},
  {id:'triceps', name:'Tríceps', rank:3, test:e=>e.t==='triceps'},
  {id:'abs', name:'Abdomen', rank:3, test:e=>e.t==='abs'},
  {id:'hipside', name:'Aductores y abductores', rank:3, test:e=>e.t==='adductors'||e.t==='abductors'},
  {id:'pressInc', name:'Press inclinado', rank:1, test:e=>e.t==='pectorals' && /incline/.test(e.n) && /press|push/.test(e.n)},
  {id:'fly', name:'Aperturas', rank:2, test:e=>e.t==='pectorals' && /fly|flye|cross|breeding|squeeze|svend/.test(e.n)},
  {id:'press', name:'Press de pecho', rank:1, test:e=>e.t==='pectorals' && /press|push|dip/.test(e.n)},
  {id:'rear', name:'Deltoide posterior', rank:2, test:e=>/rear (delt|lateral|fly)|revers(e)? fly/.test(e.n)},
  {id:'ohp', name:'Press de hombros', rank:1, test:e=>e.t==='delts' && /press|thruster|jerk/.test(e.n)},
  {id:'lateral', name:'Elevación lateral', rank:2, test:e=>e.t==='delts' && /lateral|upright row|y-raise/.test(e.n)},
  {id:'front', name:'Elevación frontal', rank:2, test:e=>e.t==='delts' && /front|forward|raise/.test(e.n)},
  {id:'vpull', name:'Tirón vertical', rank:1, test:e=>/pull-?up|pull up|chin|pulldown|muscle up/.test(e.n) && (e.t==='lats'||e.t==='upper back')},
  {id:'row', name:'Remo', rank:1, test:e=>/\brow\b/.test(e.n) && (e.t==='lats'||e.t==='upper back')},
  {id:'legcurl', name:'Curl femoral', rank:2, test:e=>/leg curl|hamstring|glute-ham|femoral/.test(e.n)},
  {id:'legext', name:'Extensión de cuádriceps', rank:2, test:e=>/leg extension|sissy/.test(e.n)},
  {id:'hinge', name:'Bisagra de cadera', rank:1, test:e=>/deadlift|good morning|rack pull|pull through|kettlebell swing|hyperextension|back extension/.test(e.n)},
  {id:'lunge', name:'Zancada o unilateral', rank:1, test:e=>/lunge|step-up|split squat/.test(e.n)},
  {id:'glute', name:'Empuje de cadera', rank:1, test:e=>/hip thrust|bridge|hip lift|hip extension/.test(e.n) && e.c==='upper legs'},
  {id:'squat', name:'Sentadilla o prensa', rank:1, test:e=>/squat|leg press|hack/.test(e.n) && e.c==='upper legs'}
];
const byPattern = Object.fromEntries(PATTERNS.map(p=>[p.id,p]));
const patternOf = e => (e && e.c!=='cardio' && !/stretch/.test(e.n) && PATTERNS.find(p=>p.test(e))) || null;

/* Ejercicios conocidos para sugerir, del más habitual al menos habitual */
const STAPLES = {
  press:['0025','0289','0577','0662','0748'],
  pressInc:['0314','0047','1299','0757','0169'],
  fly:['0308','0596','0227','0319'],
  ohp:['0405','0091','0603','0997','2137'],
  lateral:['0334','0178','0584'],
  rear:['0383','0602','0154','0993'],
  triceps:['0201','0241','0430','0814','0061','0607','0283'],
  vpull:['0198','0652','0579','0017','1326','1013'],
  row:['0861','0293','0027','1350','0499','1345'],
  biceps:['0294','0031','0313','0868','0447','0575'],
  traps:['0406','0095','0604'],
  forearms:['0126','0247','1016'],
  squat:['0043','0739','1760','0534','0770','0743','1004','0514'],
  lunge:['0336','0054','1460','0431','2368'],
  hinge:['0085','1459','0032','0300','0489','1009','0549'],
  legcurl:['0586','0599','3193','0496'],
  legext:['0585','1489'],
  glute:['1409','3561','1408'],
  calves:['0605','0417','1373','0594','0738'],
  abs:['0872','0274','0212','0472','0276','0687']
};

/* Qué debería cubrir cada tipo de sesión. any: patrones que sirven para ese hueco */
const slot = (id, name, any, why) => ({id, name, any, why});
const S = {
  press:slot('press','Press de pecho',['press','pressInc'],'El ejercicio principal del pecho: mueve más peso y también trabaja hombro y tríceps.'),
  ohp:slot('ohp','Press de hombros',['ohp'],'Es el empuje vertical; complementa al press de pecho, que es horizontal.'),
  lateral:slot('lateral','Elevación lateral',['lateral'],'El deltoide lateral casi no trabaja en los press y da la anchura del hombro.'),
  triceps:slot('triceps','Tríceps',['triceps'],'Va al final: ya llega activado por los press.'),
  pressInc:slot('pressInc','Press inclinado',['pressInc'],'Enfatiza la parte alta del pecho.'),
  fly:slot('fly','Aperturas',['fly'],'Estiran y aíslan el pecho sin cargar tanto el tríceps.'),
  vpull:slot('vpull','Tirón vertical',['vpull'],'Dominadas o jalón: trabajan sobre todo el dorsal, la anchura de la espalda.'),
  row:slot('row','Remo',['row'],'Tirón horizontal: da grosor a la espalda y equilibra los empujes.'),
  rear:slot('rear','Deltoide posterior',['rear'],'Equilibra el hombro y ayuda a la postura; suele quedar olvidado.'),
  biceps:slot('biceps','Bíceps',['biceps'],'Va al final: ya llega activado por los tirones.'),
  traps:slot('traps','Trapecio',['traps'],'Refuerza la parte alta de la espalda.'),
  forearms:slot('forearms','Antebrazos',['forearms'],'Mejora el agarre para remos y peso muerto.'),
  squat:slot('squat','Sentadilla o prensa',['squat'],'El ejercicio base de pierna: cuádriceps y glúteos.'),
  hinge:slot('hinge','Isquiotibiales',['hinge','legcurl'],'Equilibra los cuádriceps: bisagra de cadera (peso muerto rumano) o curl femoral.'),
  calves:slot('calves','Pantorrillas',['calves'],'No trabajan lo suficiente con sentadillas y prensa.'),
  lunge:slot('lunge','Zancada o unilateral',['lunge'],'Trabaja cada pierna por separado y corrige desequilibrios.'),
  glute:slot('glute','Empuje de cadera',['glute'],'Trabaja el glúteo en su máxima contracción.'),
  abs:slot('abs','Abdomen',['abs'],'Da estabilidad para todos los ejercicios pesados.')
};
const FOCUS = {
  empuje:{name:'Empuje', need:[S.press,S.ohp,S.lateral,S.triceps], extra:[S.pressInc,S.fly]},
  tiron:{name:'Tirón', need:[S.vpull,S.row,S.rear,S.biceps], extra:[S.traps,S.forearms]},
  pierna:{name:'Pierna', need:[S.squat,S.hinge,S.calves], extra:[S.lunge,S.glute,S.abs]},
  torso:{name:'Torso', need:[S.press,S.row,S.vpull,S.ohp], extra:[S.lateral,S.biceps,S.triceps]},
  completo:{name:'Cuerpo completo', need:[S.squat,S.press,S.row,S.hinge], extra:[S.ohp,S.abs]},
  libre:{name:'Libre', need:[], extra:[]}
};
function focusOf(plan){
  if(plan.focus && FOCUS[plan.focus]) return plan.focus;
  const n = plan.name.toLowerCase();
  if(/empuj|push/.test(n)) return 'empuje';
  if(/tir[oó]n|pull/.test(n)) return 'tiron';
  if(/piern|leg/.test(n)) return 'pierna';
  if(/torso|upper/.test(n)) return 'torso';
  if(/complet|full/.test(n)) return 'completo';
  return 'libre';
}

/* Grupos que conviene tocar al menos una vez entre todas las sesiones */
const GROUPS = [
  {name:'Pecho', any:['press','pressInc','fly'], add:'press'},
  {name:'Espalda', any:['vpull','row'], add:'row'},
  {name:'Hombros', any:['ohp','lateral','rear','front'], add:'ohp'},
  {name:'Bíceps', any:['biceps'], add:'biceps'},
  {name:'Tríceps', any:['triceps'], add:'triceps'},
  {name:'Cuádriceps', any:['squat','lunge','legext'], add:'squat'},
  {name:'Isquiotibiales', any:['hinge','legcurl'], add:'hinge'},
  {name:'Glúteos', any:['glute','squat','lunge','hinge'], add:'glute'},
  {name:'Pantorrillas', any:['calves'], add:'calves'},
  {name:'Abdomen', any:['abs'], add:'abs'}
];

/* En estos patrones dos ejercicios pueden sumar si son variantes distintas */
const MULTI = new Set(['biceps','triceps','abs','calves','forearms']);
const variant = e => (e.n.match(/hammer|preacher|incline|reverse|concentration|overhead|pushdown|kickback|extension|dip|seated|hanging|twist|plank/)||[''])[0];

const MACHINE_FIRST = {'leverage machine':0,'sled machine':0,'cable':1,'smith machine':1,'dumbbell':2,'assisted':2,'band':3,'body weight':3,'kettlebell':4,'ez barbell':4,'barbell':5};
function suggest(pattern, ctx, exclude, n){
  const list = (STAPLES[pattern]||[]).map(id=>ctx.byId[id]).filter(e=>e && !exclude.has(e.i) && ctx.canDo(e));
  if(ctx.level==='principiante') list.sort((a,b)=>(MACHINE_FIRST[a.q]??3)-(MACHINE_FIRST[b.q]??3));
  return list.slice(0, n).map(e=>e.i);
}

const strength = (ids, ctx) => ids.map(id=>ctx.byId[id]).filter(e=>e && !ctx.isSpecial(e.i) && e.c!=='cardio');
const rankOf = e => { const p = patternOf(e); return p ? p.rank : 2; };
function sorted(ids, ctx){
  const r = id => { const e = ctx.byId[id]; return !e || ctx.isSpecial(id) ? 0 : e.c==='cardio' ? 4 : rankOf(e); };
  return ids.map((id,i)=>({id,i})).sort((a,b)=>r(a.id)-r(b.id) || a.i-b.i).map(x=>x.id);
}

function review(plan, ctx){
  const focus = focusOf(plan), f = FOCUS[focus], exs = strength(plan.ids, ctx), used = new Set(plan.ids);
  const pats = exs.map(e=>({e, p:patternOf(e)}));
  const inSlot = s => pats.filter(x=>x.p && s.any.includes(x.p.id)).map(x=>x.e);
  const fill = (s, n) => ({slot:s, sugg:s.any.flatMap(p=>suggest(p, ctx, used, n)).slice(0, n)});
  const covered = [...f.need, ...f.extra].map(s=>({slot:s, ex:inSlot(s)})).filter(x=>x.ex.length);
  const missing = f.need.filter(s=>!inSlot(s).length).map(s=>fill(s, 3));
  const optional = f.extra.filter(s=>!inSlot(s).length).map(s=>fill(s, 2));

  const similar = [], groups = {};
  for(const x of pats) if(x.p) (groups[x.p.id] = groups[x.p.id] || []).push(x.e);
  for(const [id, list] of Object.entries(groups)){
    if(list.length<2) continue;
    if(MULTI.has(id)){
      const seen = {};
      for(const e of list){
        const v = variant(e);
        if(seen[v]) similar.push({a:seen[v], b:e, name:byPattern[id].name}); else seen[v] = e;
      }
    } else similar.push({a:list[0], b:list[1], name:byPattern[id].name});
  }

  const order = sorted(plan.ids, ctx);
  const needsOrder = order.some((id,i)=>id!==plan.ids[i]);
  return {focus, focusName:f.name, total:exs.length, done:f.need.length-missing.length, need:f.need.length,
    covered, missing, optional, similar, order, needsOrder};
}

function weekly(plans, ctx){
  const exs = strength(plans.flatMap(p=>p.ids), ctx), used = new Set(plans.flatMap(p=>p.ids));
  const count = {};
  for(const e of exs){ const p = patternOf(e); if(p) count[p.id] = (count[p.id]||0)+1; }
  /* cada hueco va a la sesión cuyo tipo lo incluye; si ninguna, a una libre */
  const homeOf = pattern => plans.find(p=>{ const f = FOCUS[focusOf(p)]; return [...f.need, ...f.extra].some(s=>s.any.includes(pattern)); })
    || plans.find(p=>focusOf(p)==='libre') || plans[0];
  return GROUPS.map(g=>({name:g.name, n:g.any.reduce((a,p)=>a+(count[p]||0),0), sugg:suggest(g.add, ctx, used, 1)[0]||null, home:homeOf(g.add)}));
}

window.Coach = {PATTERNS, FOCUS, STAPLES, patternOf, focusOf, review, weekly};
})();
