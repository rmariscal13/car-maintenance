/* Taller: mantenimiento de coches. Catálogo y datos en Supabase. */
"use strict";
const sb = window.supabase.createClient(window.APP_CONFIG.supabaseUrl, window.APP_CONFIG.supabaseKey);

const EMPTY_MODEL = { id:null, name:"", detail:"", items:[], spare:[], specs:[], sources:[] };
const SRC_TEXT = {
  fabricante:"Plazo del manual del fabricante",
  gemelo:"Plazo del plan de un modelo gemelo (mismo coche con otra marca)",
  normativa:"Lo marca la ley",
  aproximado:"Recomendación general: no se pudo confirmar con el fabricante"
};
const srcOf = it => ({ label: it.srcLabel || it.srcType, cls: it.srcType==="aproximado" ? "src-aprox" : "src-ok", text: SRC_TEXT[it.srcType] || "" });
const modelName = m => [m.make, m.model, m.version].filter(Boolean).join(" ");
// Piezas de una tarea; las que dependen del equipamiento (con o sin aire) se filtran según el coche
const partsFor = (it, c) => (it.parts||[]).filter(p => !p.condition || (p.condition==="sin_aire") === (c?.ac===false));

const state = { cars:[], logs:[], carId:null, tab:"proximos", editingLog:null, models:{}, modelList:[], user:null };

/* ===== Catálogo ===== */
async function loadModelList(){
  const { data, error } = await sb.from("vehicle_models")
    .select("id,make,model,generation,version,year_from,year_to,engine_code,engine_desc").order("make").order("model").order("year_from");
  if (error) throw error;
  state.modelList = data;
}
async function ensureModel(id){
  if (!id || state.models[id]) return;
  const [m, tasks, parts, sources] = await Promise.all([
    sb.from("vehicle_models").select("*").eq("id", id).single(),
    sb.from("maintenance_tasks").select("*").eq("model_id", id).order("sort"),
    sb.from("parts").select("*, part_refs(brand,reference,id)").eq("model_id", id).order("sort"),
    sb.from("model_sources").select("title,url").eq("model_id", id).order("id")
  ]);
  for (const r of [m, tasks, parts, sources]) if (r.error) throw r.error;
  const toPart = p => ({ label:p.name, spec:p.spec, cat:p.store_url, note:p.note, condition:p.condition, conf:p.confidence,
    refs:(p.part_refs||[]).sort((a,b)=>a.id-b.id).map(r=>[r.brand, r.reference]) });
  const items = tasks.data.map(t => ({ id:t.code, name:t.name, action:t.action, km:t.interval_km, months:t.interval_months,
    special:t.special, info:t.info_only, srcType:t.source_type, srcLabel:t.source_label, why:t.why,
    parts: parts.data.filter(p => p.task_code===t.code).map(toPart) }));
  const groups = [];
  for (const p of parts.data.filter(p => p.group_name)) {
    let g = groups.find(g => g.group===p.group_name);
    if (!g) groups.push(g = { group:p.group_name, items:[] });
    g.items.push({ ...toPart(p), name:p.name });
  }
  state.models[id] = { id, name:modelName(m.data), detail:m.data.engine_desc || modelName(m.data), specs:m.data.specs || [],
    items, spare:groups, sources:sources.data.map(s => [s.title, s.url]) };
}

/* ===== Datos del usuario ===== */
const fromCar = r => ({ id:r.id, modelId:r.model_id, name:r.name||"", plate:r.plate||"", firstReg:r.first_reg, kmNow:r.km_now, kmDate:r.km_date, ac:r.has_ac });
const fromLog = r => ({ id:r.id, carId:r.car_id, date:r.done_on, km:r.km, items:r.task_codes||[], other:r.other||"",
  cost:r.cost==null?null:Number(r.cost), where:r.place||"", notes:r.notes||"" });
const must = ({ data, error }) => { if (error) throw error; return data; };
const store = {
  async reload(){
    const [cars, logs] = await Promise.all([ sb.from("cars").select("*").order("created_at"), sb.from("service_logs").select("*") ]);
    state.cars = must(cars).map(fromCar); state.logs = must(logs).map(fromLog);
    await Promise.all(state.cars.map(c => ensureModel(c.modelId)));
    render();
  },
  async saveCar(c){
    const row = { model_id:c.modelId, name:c.name||null, plate:c.plate||null, first_reg:c.firstReg||null, km_now:c.kmNow, km_date:c.kmDate||null, has_ac:c.ac!==false };
    if (c.id) { must(await sb.from("cars").update(row).eq("id", c.id)); return c.id; }
    return must(await sb.from("cars").insert(row).select("id").single()).id;
  },
  async deleteCar(id){ must(await sb.from("cars").delete().eq("id", id)); },
  async saveLog(l){
    const row = { car_id:l.carId, done_on:l.date, km:l.km, task_codes:l.items, other:l.other||null, cost:l.cost, place:l.where||null, notes:l.notes||null };
    if (l.id) must(await sb.from("service_logs").update(row).eq("id", l.id));
    else must(await sb.from("service_logs").insert(row));
  },
  async deleteLog(id){ must(await sb.from("service_logs").delete().eq("id", id)); }
};

/* ===== Utilidades ===== */
const $ = s => document.querySelector(s);
const DAY = 86400000;
const nf = new Intl.NumberFormat("es-ES");
const df = new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric"});
const mf = new Intl.DateTimeFormat("es-ES",{month:"long",year:"numeric"});
const todayISO = () => new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const parse = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const addMonths = (d,n) => { const r=new Date(d); r.setMonth(r.getMonth()+n); return r; };
const iso = d => new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const km = n => nf.format(Math.round(n))+" km";
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>t.hidden=true,2200); }

/* ===== Cálculo del plan ===== */
const car = () => state.cars.find(c=>c.id===state.carId);
const model = c => state.models[c?.modelId] || EMPTY_MODEL;
function kmRate(c, logs){
  // km/día con la lectura más reciente frente a la matriculación (o la lectura más antigua)
  const pts=[...logs.map(l=>({d:parse(l.date),k:l.km}))];
  if(c.firstReg) pts.push({d:parse(c.firstReg),k:0});
  if(c.kmDate!=null && c.kmNow!=null) pts.push({d:parse(c.kmDate),k:c.kmNow});
  pts.sort((a,b)=>a.d-b.d);
  if(pts.length<2) return 27;
  const a=pts[0], b=pts[pts.length-1]; const days=(b.d-a.d)/DAY;
  const r = days>30 ? (b.k-a.k)/days : 27;
  return r>0 ? r : 27;
}
function latestReading(c, logs){
  let best = {d:parse(c.kmDate||c.firstReg||todayISO()), k:c.kmNow||0};
  for(const l of logs){ const d=parse(l.date); if(d>best.d || (+d===+best.d && l.km>best.k)) best={d,k:l.km}; }
  return best;
}
function itvNext(c, logs){
  if(!c.firstReg) return null;
  const reg=parse(c.firstReg);
  const last=logs.filter(l=>l.items.includes("itv")).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const ageAt = d => (d-reg)/(365.25*DAY);
  if(last){ const d=parse(last.date); return { due:addMonths(d, ageAt(d)>=10?12:24), last }; }
  let due=addMonths(reg,48); const now=new Date();
  while(due<now - 0){ due = addMonths(due, ageAt(due)>=10?12:24); if(due>now) break; }
  return { due, last:null, estimated:true };
}
function schedule(c){
  const m=model(c); const logs=state.logs.filter(l=>l.carId===c.id);
  const rate=kmRate(c,logs); const rd=latestReading(c,logs);
  const today=parse(todayISO());
  const kmToday = rd.k + rate*Math.max(0,(today-rd.d)/DAY);
  const rows = m.items.filter(it=>!it.info).map(it=>{
    const r={it};
    if(it.special==="itv"){
      const x=itvNext(c,logs);
      if(!x){ r.status="none"; r.sort=1e9; return r; }
      r.dueDate=x.due; r.last=x.last; r.estimated=x.estimated;
      const days=(x.due-today)/DAY; r.daysLeft=days;
      r.status = days<0?"bad": days<=45?"warn":"ok";
      const span = (x.last? (x.due-parse(x.last.date)) : 365*DAY);
      r.pct = Math.min(1, Math.max(0, 1 - days*DAY/span));
      r.sort=days; return r;
    }
    const last=logs.filter(l=>l.items.includes(it.id)).sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km)[0];
    let base=null;
    if(last) base={d:parse(last.date),k:last.km,from:"log"};
    else if(c.firstReg) base={d:parse(c.firstReg),k:0,from:"reg"};
    if(!base){ r.status="none"; r.sort=1e9; return r; }
    r.last=last; r.fromReg = base.from==="reg";
    let pk=0, pd=0, daysByKm=Infinity, daysByTime=Infinity;
    if(it.km){ r.dueKm=base.k+it.km; r.kmLeft=r.dueKm-kmToday; pk=(kmToday-base.k)/it.km; daysByKm=r.kmLeft/rate; }
    if(it.months){ r.dueDate=addMonths(base.d,it.months); daysByTime=(r.dueDate-today)/DAY; pd=(today-base.d)/(r.dueDate-base.d); }
    // Si nunca se registró y la tarea es por km, el plazo por tiempo desde la matriculación no aplica más allá de una vuelta
    if(r.fromReg && it.km && it.months){
      // avanzar al siguiente múltiplo, como si se hubiera hecho a su tiempo
      const n=Math.max(0,Math.floor(kmToday/it.km)); r.dueKm=(n+1)*it.km; r.kmLeft=r.dueKm-kmToday; daysByKm=r.kmLeft/rate; pk=(kmToday-n*it.km)/it.km;
      r.dueDate=null; daysByTime=Infinity; pd=0; r.unknown=true;
    } else if(r.fromReg && !it.km && it.months){
      r.unknown=true; let d=r.dueDate, prev=base.d; while(d<today){ prev=d; d=addMonths(d,it.months); }
      r.dueDate=d; daysByTime=(d-today)/DAY; pd=(today-prev)/(d-prev);
    } else if(r.fromReg && it.km && !it.months){
      r.unknown=true; const n=Math.max(0,Math.floor(kmToday/it.km)); r.dueKm=(n+1)*it.km; r.kmLeft=r.dueKm-kmToday; daysByKm=r.kmLeft/rate; pk=(kmToday-n*it.km)/it.km;
    }
    r.projDate = isFinite(daysByKm)? new Date(today.getTime()+daysByKm*DAY) : null;
    const days=Math.min(daysByKm,daysByTime); r.daysLeft=days;
    r.pct=Math.min(1,Math.max(0,Math.max(pk,pd)));
    r.status = (r.kmLeft!=null && r.kmLeft<=0) || days<0 ? "bad" : ((r.kmLeft!=null && r.kmLeft<=1500) || days<=45) ? "warn" : "ok";
    r.sort=days; return r;
  });
  rows.sort((a,b)=>a.sort-b.sort);
  return {rows, kmToday, rate, rd, logs};
}

/* ===== Render ===== */
function partLinks(p, c){
  const refs = p.refs || [];
  const q = s => encodeURIComponent(s);
  return `<div class="part"><div><strong>${esc(p.label)}</strong></div>
    ${p.cat?`<div class="small"><a href="${esc(p.cat)}" target="_blank" rel="noopener">Ver todos los compatibles con este coche en ${p.cat.includes("oscaro")?"Oscaro":"Autodoc"} ↗</a></div>`:""}
    ${refs.length?`<div class="refs">${refs.map(([b,r])=>`<div class="ref"><span><span class="small muted">${esc(b)}</span> <b>${esc(r)}</b></span>
      <a href="https://www.autodoc.es/search?keyword=${q(r)}" target="_blank" rel="noopener">Autodoc ↗</a>
      <a href="https://www.amazon.es/s?k=${q(b+" "+r)}" target="_blank" rel="noopener">Amazon ↗</a>
      <a href="https://www.google.es/search?tbm=shop&q=${q(b+" "+r)}" target="_blank" rel="noopener">Comparar precios ↗</a></div>`).join("")}</div>`:""}
    ${p.note?`<div class="note">${esc(p.note)}</div>`:""}</div>`;
}
const statusPill = r => ({bad:'<span class="pill bad">Vencido</span>',warn:'<span class="pill warn">Pronto</span>',ok:'<span class="pill ok">Al día</span>',none:'<span class="pill none">Sin datos</span>'})[r.status];
function dueText(r){
  const parts=[];
  if(r.it.special==="itv"){
    parts.push(`<div><div class="k">Próxima ITV</div><div>${r.dueDate?esc(df.format(r.dueDate)):"—"}${r.estimated?' <span class="small muted">(estimada)</span>':""}</div></div>`);
    parts.push(`<div><div class="k">Última</div><div>${r.last?esc(df.format(parse(r.last.date))):'<span class="muted">Sin registrar</span>'}</div></div>`);
    return parts.join("");
  }
  if(r.dueKm!=null) parts.push(`<div><div class="k">Toca a los</div><div class="mono">${km(r.dueKm)}</div><div class="small muted">${r.kmLeft<=0?`pasado por ${km(-r.kmLeft)}`:`faltan ${km(r.kmLeft)}`}${r.projDate?` · hacia ${esc(mf.format(r.projDate))}`:""}</div></div>`);
  if(r.dueDate) parts.push(`<div><div class="k">O antes del</div><div>${esc(df.format(r.dueDate))}</div></div>`);
  parts.push(`<div><div class="k">Última vez</div><div>${r.last?`${esc(df.format(parse(r.last.date)))} · <span class="mono">${km(r.last.km)}</span>`:'<span class="muted">Sin registrar</span>'}</div></div>`);
  return parts.join("");
}
function render(){
  const has=state.cars.length>0;
  if(has && !car()) state.carId=state.cars[0].id;
  const c=car();
  // cabecera
  $("#carPickWrap").hidden = state.cars.length<2;
  $("#carSelect").innerHTML = state.cars.map(x=>`<option value="${esc(x.id)}" ${x.id===state.carId?"selected":""}>${esc(x.name||model(x).name)}</option>`).join("");
  $("#carTitle").textContent = c ? (c.name||model(c).name) : "Mi coche";
  $("#carSub").textContent = c ? model(c).detail + (c.plate?` · ${c.plate}`:"") : "Rellena los datos de tu coche para calcular los próximos mantenimientos";
  // pestañas
  document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected", String(b.dataset.tab===state.tab)));
  ["proximos","recambios","historial","plan","coche"].forEach(t=>$("#p-"+t).hidden = t!==state.tab);
  renderSpare(c); renderPlan(c); renderCarForm(state.addingCar?null:c); renderModelInfo(c);
  if(!c){
    $("#odo").hidden=true; $("#summary").innerHTML="";
    $("#p-proximos").innerHTML=`<div class="box empty"><h2 style="color:var(--fg)">Empieza por tu coche</h2><p>Indica la fecha de matriculación y los kilómetros actuales. Con eso la app calcula qué toca y cuándo. Después ve anotando lo que le hagas.</p><div><button class="primary" type="button" onclick="go('coche')">Añadir mi coche</button></div></div>`;
    $("#logList").innerHTML=""; $("#logForm").hidden=true;
    return;
  }
  $("#logForm").hidden=false;
  const s=schedule(c);
  // cuentakilómetros
  $("#odo").hidden=false;
  const digits=String(Math.round(s.kmToday)).padStart(6,"0");
  $("#odoDigits").innerHTML=[...digits].map(d=>`<span>${d}</span>`).join("")+'<span class="u">km</span>';
  $("#odoMeta").textContent=`Última lectura: ${km(s.rd.k)} el ${df.format(s.rd.d)} · media ${nf.format(Math.round(s.rate*365))} km/año`;
  const cnt=k=>s.rows.filter(r=>r.status===k).length;
  $("#summary").innerHTML=[cnt("bad")?`<span class="pill bad">${cnt("bad")} vencido${cnt("bad")>1?"s":""}</span>`:"",cnt("warn")?`<span class="pill warn">${cnt("warn")} pronto</span>`:"",`<span class="pill ok">${cnt("ok")} al día</span>`].join("");
  // próximos
  $("#p-proximos").innerHTML = s.rows.map(r=>`<article class="card ${r.status}">
    <div class="head"><div><h3>${esc(r.it.name)}</h3><div class="small muted">${esc(r.it.action)} · ${esc(intervalText(r.it))}</div><div style="margin-top:4px"><span class="src ${srcOf(r.it).cls}" title="${esc(srcOf(r.it).text)}">${esc(srcOf(r.it).label)}</span></div></div>${statusPill(r)}</div>
    ${r.status!=="none"?`<div class="due">${dueText(r)}</div><div class="bar" aria-hidden="true"><i style="width:${Math.round((r.pct||0)*100)}%"></i></div>`:""}
    ${r.unknown?`<div class="note">No hay registro de esta tarea; se calcula como si se hubiera hecho a su tiempo. Anótala cuando la hagas o si sabes cuándo se hizo.</div>`:""}
    <div class="note">${esc(r.it.why||"")}</div>
    <div class="row"><button type="button" class="ghost" onclick="quickLog('${r.it.id}')">+ Anotar como hecho</button></div>
    ${partsFor(r.it,c).length?`<details class="parts"><summary>Recambios para este coche</summary>${partsFor(r.it,c).map(p=>partLinks(p,c)).join("")}</details>`:""}
  </article>`).join("");
  // historial
  const items=model(c).items;
  if(!$("#logItems").dataset.model || $("#logItems").dataset.model!==c.modelId){
    $("#logItems").innerHTML=items.filter(it=>!it.info).map(it=>`<label for="li-${it.id}"><input type="checkbox" id="li-${it.id}" value="${it.id}"> ${esc(it.name)}</label>`).join("")
      +`<label for="li-otro"><input type="checkbox" id="li-otro" value="otro"> Otro trabajo</label>`;
    $("#logItems").dataset.model=c.modelId;
  }
  const logs=[...s.logs].sort((a,b)=>b.date.localeCompare(a.date)||b.km-a.km);
  const name=(id,l)=>id==="otro"?(l.other||"Otro trabajo"):(items.find(i=>i.id===id)?.name||id);
  $("#logList").innerHTML = logs.length? logs.map(l=>`<article class="card log">
      <div class="when"><h3>${esc(df.format(parse(l.date)))}</h3><span class="mono">${km(l.km)}</span>${l.cost!=null&&l.cost!==""?`<span class="mono">${esc(nf.format(l.cost))} €</span>`:""}${l.where?`<span class="muted">${esc(l.where)}</span>`:""}</div>
      <div class="tags">${l.items.map(i=>`<span class="tag">${esc(name(i,l))}</span>`).join("")}</div>
      ${l.notes?`<div class="note">${esc(l.notes)}</div>`:""}
      <div class="row"><button class="ghost" type="button" onclick="editLog('${l.id}')">Editar</button>
        <span id="del-${l.id}"><button class="ghost" type="button" onclick="askDel('${l.id}')">Borrar</button></span></div>
    </article>`).join("") : `<div class="box empty">Todavía no hay mantenimientos anotados. Usa el formulario de arriba para añadir el primero, por ejemplo el último cambio de aceite.</div>`;
}
function intervalText(it){
  if(it.special==="itv") return "según la antigüedad";
  const a=[]; if(it.km) a.push("cada "+km(it.km)); if(it.months) a.push((it.km?"o ":"cada ")+(it.months%12===0? (it.months/12===1?"1 año":it.months/12+" años") : it.months+" meses"));
  return a.join(" ");
}
function renderSpare(c){
  const m=c?model(c):EMPTY_MODEL;
  const q=($("#spareSearch").value||"").trim().toLowerCase();
  const norm=t=>t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const groups=(m.spare||[]).map(g=>({...g,items:g.items.filter(it=>!q||norm(it.name+" "+(it.spec||"")+" "+g.group).includes(norm(q)))})).filter(g=>g.items.length);
  $("#spareList").innerHTML = groups.length ? groups.map(g=>`<div class="box"><h3>${esc(g.group)}</h3>${g.note?`<div class="note">${esc(g.note)}</div>`:""}
    ${g.items.map(it=>`<details class="parts"><summary>${esc(it.name)} · <span class="mono">${esc(it.spec||"")}</span> <span class="src ${it.conf==="confirmado"?"src-ok":"src-aprox"}">${it.conf==="confirmado"?"Confirmado":"Comprobar"}</span></summary>
      ${partLinks({label:"Tipo: "+it.spec, cat:it.cat, refs:it.refs, note:it.note}, c)}</details>`).join("")}</div>`).join("")
    : `<div class="box empty">No hay ninguna pieza que coincida con «${esc(q)}».</div>`;
}
function renderPlan(c){
  const m=c?model(c):EMPTY_MODEL;
  $("#p-plan").innerHTML=`<div class="box"><h2>${esc(m.name)}</h2><div class="muted small">${esc(m.detail)}</div>
    <div class="tablewrap" style="margin-top:8px"><table><thead><tr><th>Tarea</th><th>Kilómetros</th><th>Tiempo</th><th>Qué hacer</th><th>De dónde sale</th></tr></thead><tbody>
    ${m.items.map(it=>`<tr><td><strong>${esc(it.name)}</strong><div class="small muted">${esc(it.why||"")}</div></td><td class="n">${it.km?km(it.km):"—"}</td><td class="n">${it.special==="itv"?"4 años, luego 2; anual desde 10":it.months?it.months+" meses":"—"}</td><td>${esc(it.action)}</td><td><span class="src ${srcOf(it).cls}">${esc(srcOf(it).label)}</span></td></tr>`).join("")}
    </tbody></table></div>
    <div class="legend small" style="margin-top:8px">${[...new Map(m.items.map(it=>[srcOf(it).label,srcOf(it)])).values()].map(x=>`<span><span class="src ${x.cls}">${esc(x.label)}</span> <span class="muted">${esc(x.text)}</span></span>`).join("")}</div>
    <p class="small muted">Lo que antes llegue: kilómetros o tiempo. Si usas el coche en ciudad con trayectos cortos, mucho calor o polvo, adelanta aceite y filtros.</p></div>
    <div class="box"><h3>Datos técnicos</h3><div class="tablewrap"><table style="min-width:0"><tbody>${m.specs.map(([k,v])=>`<tr><th style="width:38%">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="box small"><h3>Fuentes</h3><ul class="sources">${m.sources.map(([t,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>
    <p class="muted">Si tienes el libro de mantenimiento de tu coche, manda lo que diga ese libro.</p></div>`;
}
function renderCarForm(c){
  const f=$("#carForm");
  if(f.dataset.for===String(c?.id||"new")) return;
  f.dataset.for=String(c?.id||"new");
  $("#cModel").innerHTML=state.modelList.map(m=>`<option value="${esc(m.id)}">${esc(modelName(m))} · ${esc(m.year_from)}–${esc(m.year_to)}${m.engine_code?" · "+esc(m.engine_code):""}</option>`).join("");
  $("#cModel").value=c?.modelId||state.modelList[0]?.id||"";
  $("#cName").value=c?.name||""; $("#cPlate").value=c?.plate||"";
  $("#cReg").value=c?.firstReg||""; $("#cKm").value=c?.kmNow??""; $("#cKmDate").value=c?.kmDate||todayISO();
  $("#cAC").checked = c ? c.ac!==false : true;
  $("#carFormTitle").textContent = c? "Datos del coche" : "Añadir coche";
  $("#carDelRow").hidden=!c; $("#carDelConfirm").hidden=true;
}
function renderModelInfo(c){
  const m=c?model(c):EMPTY_MODEL;
  $("#modelInfo").innerHTML=`<strong>Modelos disponibles: ${state.modelList.length}.</strong> <span class="muted">Cada modelo del catálogo trae su plan de mantenimiento, sus piezas y de dónde sale cada dato. Si tu coche no está, pide que se añada.</span>`;
}

/* ===== Acciones ===== */
function go(t){ state.tab=t; try{localStorage.setItem("mant-tab",t)}catch{} render(); window.scrollTo({top:0}); }
window.go=go;
document.querySelectorAll("nav.tabs button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
$("#spareSearch").addEventListener("input",()=>renderSpare(car()));
$("#carSelect").addEventListener("change",e=>{ state.carId=e.target.value; try{localStorage.setItem("mant-car",state.carId)}catch{} render(); });

function resetLogForm(){
  state.editingLog=null; $("#logForm").reset(); $("#logDate").value=todayISO(); $("#logOtherWrap").hidden=true;
  const c=car(); if(c){ const s=schedule(c); $("#logKm").value=Math.round(s.rd.k); }
  $("#logFormTitle").textContent="Registrar mantenimiento"; $("#logSubmit").textContent="Guardar en el historial";
}
window.quickLog=id=>{ go("historial"); resetLogForm(); const cb=$("#li-"+id); if(cb) cb.checked=true; $("#logKm").focus(); };
window.editLog=id=>{ const l=state.logs.find(x=>x.id===id); if(!l) return; state.editingLog=id;
  $("#logDate").value=l.date; $("#logKm").value=l.km; $("#logCost").value=l.cost??""; $("#logWhere").value=l.where||""; $("#logNotes").value=l.notes||"";
  document.querySelectorAll("#logItems input").forEach(i=>i.checked=l.items.includes(i.value));
  $("#logOther").value=l.other||""; $("#logOtherWrap").hidden=!l.items.includes("otro");
  $("#logFormTitle").textContent="Editar mantenimiento"; $("#logSubmit").textContent="Guardar cambios"; $("#logForm").scrollIntoView({behavior:"smooth"}); };
window.askDel=id=>{ $("#del-"+id).innerHTML=`<span class="row small">¿Borrar este registro? <button class="danger" type="button" onclick="doDel('${id}')">Sí, borrar</button><button type="button" onclick="render()">No</button></span>`; };
window.doDel=async id=>{ try{ await store.deleteLog(id); await store.reload(); toast("Registro borrado"); }catch(e){ toast("No se pudo borrar. Prueba otra vez."); } };

$("#logItems").addEventListener("change",e=>{ if(e.target.id==="li-otro"){ $("#logOtherWrap").hidden=!e.target.checked; if(e.target.checked) $("#logOther").focus(); } });
$("#logForm").addEventListener("submit",async e=>{
  e.preventDefault(); const c=car(); if(!c) return;
  const items=[...document.querySelectorAll("#logItems input:checked")].map(i=>i.value);
  if(!items.length){ $("#logMsg").textContent="Marca al menos una tarea."; return; }
  const other=$("#logOther").value.trim();
  if(items.includes("otro") && !other){ $("#logMsg").textContent="Escribe qué otro trabajo se hizo."; $("#logOther").focus(); return; }
  $("#logMsg").textContent="";
  const costV=$("#logCost").value;
  const log={ id:state.editingLog||null, carId:c.id, date:$("#logDate").value, km:Number($("#logKm").value), items,
    other: items.includes("otro")?other:"", cost: costV===""?null:Number(costV), where:$("#logWhere").value.trim(), notes:$("#logNotes").value.trim(), updatedAt:new Date().toISOString() };
  try{
    await store.saveLog(log);
    if(log.km>(c.kmNow||0) && log.date>=(c.kmDate||"")){ await store.saveCar({...c,kmNow:log.km,kmDate:log.date}); }
    await store.reload(); toast(state.editingLog?"Cambios guardados":"Mantenimiento guardado"); resetLogForm();
  }catch(err){ $("#logMsg").textContent="No se pudo guardar. Revisa la conexión y prueba otra vez."; }
});

$("#odoBtn").addEventListener("click",()=>{ const c=car(); const s=schedule(c); $("#kmNowIn").value=Math.round(s.kmToday); $("#kmDateIn").value=todayISO(); $("#kmForm").hidden=false; $("#kmNowIn").focus(); $("#kmNowIn").select(); });
$("#kmCancel").addEventListener("click",()=>$("#kmForm").hidden=true);
$("#kmForm").addEventListener("submit",async e=>{ e.preventDefault(); const c=car();
  try{ await store.saveCar({...c,kmNow:Number($("#kmNowIn").value),kmDate:$("#kmDateIn").value}); await store.reload(); $("#kmForm").hidden=true; toast("Kilómetros actualizados"); }catch{ toast("No se pudo guardar."); } });

$("#carForm").addEventListener("submit",async e=>{
  e.preventDefault(); const c=$("#carForm").dataset.for==="new"?null:car();
  const data={ id:c?.id||null, modelId:$("#cModel").value, name:$("#cName").value.trim(), plate:$("#cPlate").value.trim().toUpperCase(),
    firstReg:$("#cReg").value, kmNow:Number($("#cKm").value), kmDate:$("#cKmDate").value, ac:$("#cAC").checked };
  try{ data.id=await store.saveCar(data); await ensureModel(data.modelId); state.addingCar=false; state.carId=data.id; try{localStorage.setItem("mant-car",data.id)}catch{}; await store.reload(); $("#carForm").dataset.for=""; toast("Coche guardado"); if(!c) go("proximos"); else render(); }
  catch{ $("#carMsg").textContent="No se pudo guardar. Prueba otra vez."; }
});
$("#carNew").addEventListener("click",()=>{ state.addingCar=true; $("#carForm").dataset.for=""; renderCarForm(null); $("#carMsg").textContent="Rellena los datos del nuevo coche."; $("#cName").focus(); });
$("#carDel").addEventListener("click",()=>$("#carDelConfirm").hidden=false);
$("#carDelNo").addEventListener("click",()=>$("#carDelConfirm").hidden=true);
$("#carDelYes").addEventListener("click",async()=>{ const c=car(); if(!c) return; try{ await store.deleteCar(c.id); await store.reload(); state.carId=null; $("#carForm").dataset.for=""; toast("Coche borrado"); go("proximos"); }catch{ toast("No se pudo borrar."); } });


/* ===== Inicio de sesión ===== */
let signUpMode = false;
function showAuth(on){
  $("#authForm").hidden = !on; $("#appBody").hidden = on; $("#signOut").hidden = on;
  if (on) { $("#carTitle").textContent = "Mantenimiento de tu coche"; $("#carSub").textContent = "Plan de mantenimiento, historial y recambios exactos para tu modelo"; $("#carPickWrap").hidden = true; }
}
$("#authToggle").addEventListener("click", () => {
  signUpMode = !signUpMode;
  $("#authTitle").textContent = signUpMode ? "Crea tu cuenta" : "Entra en tu cuenta";
  $("#authSubmit").textContent = signUpMode ? "Crear cuenta" : "Entrar";
  $("#authToggle").textContent = signUpMode ? "Ya tengo cuenta" : "Crear una cuenta nueva";
  $("#authPass").autocomplete = signUpMode ? "new-password" : "current-password";
  $("#authMsg").textContent = "";
});
$("#authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("#authEmail").value.trim(), password = $("#authPass").value;
  $("#authSubmit").disabled = true; $("#authMsg").textContent = "";
  try {
    if (signUpMode) {
      const { data, error } = await sb.auth.signUp({ email, password, options:{ emailRedirectTo: location.href.split("#")[0] } });
      if (error) throw error;
      if (!data.session) $("#authMsg").textContent = "Te hemos enviado un correo. Abre el enlace para confirmar la cuenta y después entra aquí.";
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (err) {
    const m = String(err.message||"");
    $("#authMsg").textContent = /Invalid login/i.test(m) ? "El correo o la contraseña no son correctos."
      : /not confirmed/i.test(m) ? "Falta confirmar la cuenta: abre el enlace del correo que te enviamos."
      : /already registered/i.test(m) ? "Ya existe una cuenta con ese correo. Entra con tu contraseña."
      : "No se pudo completar: " + m;
  } finally { $("#authSubmit").disabled = false; }
});
$("#signOut").addEventListener("click", () => sb.auth.signOut());

async function startSession(session){
  state.user = session?.user || null;
  if (!state.user) { state.cars = []; state.logs = []; showAuth(true); return; }
  showAuth(false);
  try { await store.reload(); }
  catch (err) { $("#storeBanner").textContent = "No se pudieron cargar tus datos. Revisa la conexión y recarga la página."; $("#storeBanner").hidden = false; }
}

/* ===== Arranque ===== */
try{ const t=localStorage.getItem("mant-tab"); if(t) state.tab=t; state.carId=localStorage.getItem("mant-car"); }catch{}
$("#logDate").value=todayISO();
(async () => {
  try { await loadModelList(); await Promise.all(state.modelList.slice(0,1).map(m => ensureModel(m.id))); }
  catch (err) { $("#storeBanner").textContent = "No se pudo cargar el catálogo de modelos. Revisa la conexión y recarga la página."; $("#storeBanner").hidden = false; }
  let current; // undefined: la primera llamada siempre arranca, también sin sesión
  sb.auth.onAuthStateChange((_ev, session) => {
    const id = session?.user?.id || null;
    if (id === current) return;
    current = id; setTimeout(() => startSession(session), 0);
  });
})();
