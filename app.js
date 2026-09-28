(() => {
  const BASE = JSON.parse(JSON.stringify(window.GRISI_KPI_DATA));
  const STORAGE_KEY = "grisi-maintenance-kpis-v2";
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const number = value => value === "" || value === null ? null : Number(value);
  const fmt = (value, digits=2) => Number(value).toLocaleString("es-MX", {minimumFractionDigits:digits, maximumFractionDigits:digits});
  let data = loadSaved();
  let currentPlant = "ALL";
  let draft = clone(data);

  function loadSaved() {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : clone(BASE); }
    catch (_) { return clone(BASE); }
  }
  const tmGood = p => p.tm <= p.tmGoal;
  const mpGood = p => p.mp !== null && p.mp >= 98;
  const period = d => `${d.months[d.currentMonth]} ${d.currentYear}`;
  const globalTm = d => d.global.tmTrend[d.currentMonth];
  const globalMp = d => d.global.mpTrend[d.currentMonth];
  const totalHours = d => Object.values(d.plants).reduce((sum,p) => sum + Number(p.hours||0), 0);

  function renderChips() {
    $("plantChips").innerHTML = ["ALL",...Object.keys(data.plants)].map(key => `<button class="chip ${key===currentPlant?"active":""}" data-key="${key}">${key==="ALL"?"Todas":data.plants[key].label}</button>`).join("");
    document.querySelectorAll(".chip").forEach(button => button.addEventListener("click", () => selectPlant(button.dataset.key)));
  }

  function trendSvg() {
    const valuesTm=data.global.tmTrend.slice(0,data.currentMonth+1), valuesMp=data.global.mpTrend.slice(0,data.currentMonth+1);
    const valid=valuesTm.map((v,i)=>v===null||valuesMp[i]===null?null:i).filter(v=>v!==null);
    if(!valid.length) return `<div class="notice">No hay información mensual registrada.</div>`;
    const W=850,H=300,L=42,R=48,T=25,B=34,iw=W-L-R,ih=H-T-B, count=Math.max(2,data.currentMonth+1);
    const x=i=>L+(iw/(count-1))*i, yTm=v=>T+ih-(Math.min(4,Math.max(0,v))/4)*ih, yMp=v=>T+ih-((Math.min(102,Math.max(92,v))-92)/10)*ih;
    const path=(arr,y)=>{let out="",started=false;arr.forEach((v,i)=>{if(v===null){started=false;return}out+=`${started?"L":"M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;started=true});return out};
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia mensual">`;
    [0,1,2,3,4].forEach(v=>{const yy=yTm(v);svg+=`<line class="grid-line" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/><text class="svg-label" x="5" y="${yy+4}">${v}%</text>`});
    svg+=`<line class="goal-line" x1="${L}" x2="${W-R}" y1="${yTm(1.5)}" y2="${yTm(1.5)}"/><path class="tm-line" d="${path(valuesTm,yTm)}"/><path class="mp-line" d="${path(valuesMp,yMp)}"/>`;
    for(let i=0;i<=data.currentMonth;i++){svg+=`<text class="svg-label" text-anchor="middle" x="${x(i)}" y="${H-8}">${data.months[i].slice(0,3)}</text>`;if(valuesTm[i]!==null)svg+=`<circle class="dot-tm" cx="${x(i)}" cy="${yTm(valuesTm[i])}" r="4"/>`;if(valuesMp[i]!==null)svg+=`<circle class="dot-mp" cx="${x(i)}" cy="${yMp(valuesMp[i])}" r="4"/>`}
    [92,94,96,98,100,102].forEach(v=>svg+=`<text class="svg-label" x="${W-R+7}" y="${yMp(v)+4}">${v}%</text>`);
    return svg+"</svg>";
  }

  function renderCards() {
    const total=totalHours(data), p=currentPlant==="ALL"?{label:"Todas",tm:globalTm(data),tmGoal:1.5,mp:globalMp(data),hours:total}:data.plants[currentPlant];
    const goodTm=tmGood(p), pending=p.mp===null, goodMp=mpGood(p), tmDiff=p.tm-p.tmGoal;
    $("tmValue").textContent=fmt(p.tm)+"%"; $("tmGoalText").textContent=`Meta general ≤ ${fmt(p.tmGoal)}%`;
    $("tmStatus").className=goodTm?"good":"bad"; $("tmStatus").textContent=goodTm?"CUMPLE":"FUERA DE META"; $("tmVariance").textContent=Math.abs(tmDiff)<.005?"En meta":`${tmDiff>0?"+":""}${fmt(tmDiff)} pp`;
    $("tmProgress").style.width=`${Math.min(100,p.tm/p.tmGoal*75)}%`; $("tmProgress").style.background=goodTm?"var(--green)":"var(--red)";
    $("mpValue").textContent=pending?"En proceso":fmt(p.mp)+"%"; $("mpStatus").className=pending?"pending":goodMp?"good":"bad"; $("mpStatus").textContent=pending?"PENDIENTE":goodMp?"CUMPLE":"FUERA DE META";
    $("mpVariance").textContent=pending?"Sin cierre":Math.abs(p.mp-98)<.005?"En meta":`${p.mp>98?"+":""}${fmt(p.mp-98)} pp`; $("mpProgress").style.width=pending?"28%":`${Math.min(100,p.mp)}%`; $("mpProgress").style.background=pending?"var(--amber)":goodMp?"var(--green)":"var(--red)";
    $("hoursValue").textContent=fmt(p.hours,p.hours%1?2:0); $("hoursContext").textContent=currentPlant==="ALL"?`Acumulado de ${Object.keys(data.plants).length} plantas`:`Horas registradas en ${p.label}`; $("hoursShare").textContent=`${fmt(p.hours/total*100,1)}%`;
    const bars=currentPlant==="ALL"?Object.values(data.plants).map(v=>v.hours):p.equipment.map(v=>v[1]), max=Math.max(...bars,1); $("miniBars").innerHTML=bars.map(v=>`<i style="height:${Math.max(4,v/max*24)}px"></i>`).join("");
    const worst=Object.entries(data.plants).sort((a,b)=>b[1].hours-a[1].hours)[0];
    if(currentPlant==="ALL"){$("focusValue").textContent=worst[1].label;$("focusText").textContent=`Concentra ${fmt(worst[1].hours/total*100,1)}% de las horas de paro${tmGood(worst[1])?".":" y excede la meta de tiempo muerto."}`}
    else if(!goodTm){$("focusValue").textContent="Tiempo muerto";$("focusText").textContent=`${p.label} supera la meta en ${fmt(tmDiff)} puntos porcentuales.`}
    else if(pending){$("focusValue").textContent="Cierre pendiente";$("focusText").textContent="Falta consolidar el resultado mensual de mantenimiento preventivo."}
    else if(!goodMp){$("focusValue").textContent="Cumplimiento MP";$("focusText").textContent=`${p.label} está ${fmt(98-p.mp)} puntos porcentuales debajo de la meta.`}
    else{$("focusValue").textContent="Resultado estable";$("focusText").textContent=`${p.label} cumple las metas reportadas.`}
    $("notice").hidden=!p.note; $("notice").textContent=p.note||"";
  }

  function renderRanking() {
    const total=totalHours(data), max=Math.max(...Object.values(data.plants).map(p=>p.hours),1); $("totalHours").textContent=fmt(total,2)+" h";
    $("ranking").innerHTML=Object.entries(data.plants).sort((a,b)=>b[1].hours-a[1].hours).map(([key,p])=>`<div class="rank-row ${tmGood(p)?"":"critical"}" data-key="${key}"><div class="rank-meta"><b>${p.label}</b><b>${fmt(p.hours,p.hours%1?2:0)} h</b></div><div class="rank-track"><i style="width:${p.hours/max*100}%"></i></div></div>`).join("");
    document.querySelectorAll(".rank-row").forEach(row=>row.addEventListener("click",()=>selectPlant(row.dataset.key)));
  }

  function renderTable() {
    $("resultTable").innerHTML=Object.entries(data.plants).map(([key,p])=>{const pending=p.mp===null, state=pending?"pending":tmGood(p)&&mpGood(p)?"good":"bad";return `<tr data-key="${key}" class="${currentPlant===key?"selected":""}"><td><b>${p.label}</b></td><td>${fmt(p.tm)}%</td><td>≤ ${fmt(p.tmGoal)}%</td><td>${pending?"En proceso":fmt(p.mp)+"%"}</td><td>${fmt(p.hours,p.hours%1?2:0)} h</td><td><span class="state ${state}">${state==="good"?"Cumple":state==="pending"?"En proceso":"Atención"}</span></td></tr>`}).join("");
    document.querySelectorAll("#resultTable tr").forEach(row=>row.addEventListener("click",()=>selectPlant(row.dataset.key)));
  }

  function renderEquipment() {
    let items;
    if(currentPlant==="ALL"){items=Object.values(data.plants).map(p=>[p.label,p.hours]).sort((a,b)=>b[1]-a[1]);$("equipmentTitle").textContent="Concentración de tiempo muerto";$("equipmentHint").textContent="Comparativo por planta"}
    else{items=data.plants[currentPlant].equipment;$("equipmentTitle").textContent="Equipos con mayor tiempo muerto";$("equipmentHint").textContent=data.plants[currentPlant].label}
    const max=Math.max(...items.map(v=>v[1]),1);$("equipmentChart").innerHTML=items.map(([name,value])=>`<div class="equip-col"><strong>${fmt(value,value%1?2:0)} h</strong><i style="height:${Math.max(4,value/max*170)}px"></i><span>${name}</span></div>`).join("");
  }

  function renderAll() {
    $("periodLabel").textContent=period(data); $("updatedLabel").textContent=`Actualizado: ${new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"})}`; $("trendTitle").textContent=`Indicadores enero–${data.months[data.currentMonth].toLowerCase()} ${data.currentYear}`; $("trendChart").innerHTML=trendSvg();
    renderChips();renderCards();renderRanking();renderTable();renderEquipment();
  }
  function selectPlant(key){currentPlant=key;$("plantSelect").value=key;$("viewSubtitle").textContent=key==="ALL"?"Visión consolidada de las plantas":`Consulta de indicadores · Planta ${data.plants[key].label}`;renderAll()}

  function openCapture(){draft=clone(data);fillMonthly();fillPlants();fillEquipmentPlantOptions();renderEquipmentEditor();$("captureDialog").showModal()}
  function fillMonthly(){const options=draft.months.map((m,i)=>`<option value="${i}" ${i===draft.currentMonth?"selected":""}>${m}</option>`).join("");$("editMonth").innerHTML=options;$("editYear").value=draft.currentYear;$("editGlobalTm").value=draft.global.tmTrend[draft.currentMonth]??"";$("editGlobalMp").value=draft.global.mpTrend[draft.currentMonth]??""}
  function fillPlants(){$("plantEditTable").innerHTML=Object.entries(draft.plants).map(([key,p])=>`<tr><td>${p.label}</td><td><input data-plant="${key}" data-field="tm" type="number" min="0" step="0.01" value="${p.tm}"></td><td><input data-plant="${key}" data-field="tmGoal" type="number" min="0" step="0.01" value="${p.tmGoal}"></td><td><input data-plant="${key}" data-field="mp" type="number" min="0" max="100" step="0.01" value="${p.mp??""}"></td><td><input data-plant="${key}" data-field="hours" type="number" min="0" step="0.01" value="${p.hours}"></td></tr>`).join("");document.querySelectorAll("#plantEditTable input").forEach(input=>input.addEventListener("input",()=>{draft.plants[input.dataset.plant][input.dataset.field]=number(input.value)}))}
  function fillEquipmentPlantOptions(){$("equipmentPlant").innerHTML=Object.entries(draft.plants).map(([key,p])=>`<option value="${key}">${p.label}</option>`).join("")}
  function renderEquipmentEditor(){const key=$("equipmentPlant").value||Object.keys(draft.plants)[0];$("equipmentEditTable").innerHTML=draft.plants[key].equipment.map(([name,hours],index)=>`<tr><td><input data-index="${index}" data-field="name" value="${name}"></td><td><input data-index="${index}" data-field="hours" type="number" min="0" step="0.01" value="${hours}"></td><td><button type="button" class="remove-row" data-index="${index}">Eliminar</button></td></tr>`).join("");document.querySelectorAll("#equipmentEditTable input").forEach(input=>input.addEventListener("input",()=>{const row=draft.plants[key].equipment[input.dataset.index];row[input.dataset.field==="name"?0:1]=input.dataset.field==="name"?input.value:number(input.value)}));document.querySelectorAll(".remove-row").forEach(button=>button.addEventListener("click",()=>{draft.plants[key].equipment.splice(button.dataset.index,1);renderEquipmentEditor()}))}
  function syncMonthlyDraft(){const idx=Number($("editMonth").value);draft.currentMonth=idx;draft.currentYear=Number($("editYear").value);draft.global.tmTrend[idx]=number($("editGlobalTm").value);draft.global.mpTrend[idx]=number($("editGlobalMp").value)}
  function saveLocal(){syncMonthlyDraft();data=clone(draft);localStorage.setItem(STORAGE_KEY,JSON.stringify(data));renderAll();$("captureDialog").close();alert("Información guardada en este navegador. Para publicarla, descarga data.js y reemplázalo en GitHub.")}
  function download(name,content,type="text/plain"){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
  function exportDataJs(){syncMonthlyDraft();download("data.js",`window.GRISI_KPI_DATA = ${JSON.stringify(draft,null,2)};\n`,"text/javascript")}
  function exportJson(){syncMonthlyDraft();download(`Respaldo_KPIs_${draft.currentYear}_${String(draft.currentMonth+1).padStart(2,"0")}.json`,JSON.stringify(draft,null,2),"application/json")}
  function importFile(file){const reader=new FileReader();reader.onload=()=>{try{let text=reader.result.trim();if(text.startsWith("window.GRISI_KPI_DATA"))text=text.slice(text.indexOf("=")+1).replace(/;\s*$/,"");draft=JSON.parse(text);fillMonthly();fillPlants();fillEquipmentPlantOptions();renderEquipmentEditor();alert("Información importada. Revisa los datos y presiona Guardar.")}catch(_){alert("No se pudo leer el archivo. Utiliza un respaldo JSON o data.js generado por este portal.")}};reader.readAsText(file)}
  function resetData(){if(confirm("¿Restaurar los datos originales? Se perderán los cambios guardados en este navegador.")){localStorage.removeItem(STORAGE_KEY);data=clone(BASE);draft=clone(BASE);currentPlant="ALL";fillMonthly();fillPlants();fillEquipmentPlantOptions();renderEquipmentEditor();renderAll()}}
  function exportSummary(){const total=totalHours(data),p=currentPlant==="ALL"?{label:"Todas",tm:globalTm(data),tmGoal:1.5,mp:globalMp(data),hours:total}:data.plants[currentPlant];download(`Resumen_KPIs_${currentPlant}_${data.currentYear}_${data.currentMonth+1}.txt`,["GRUPO GRISI - KPIs DE MANTENIMIENTO",`Periodo: ${period(data)}`,`Planta: ${p.label}`,`Tiempo muerto: ${fmt(p.tm)}%`,`Mantenimiento preventivo: ${p.mp===null?"En proceso":fmt(p.mp)+"%"}`,`Horas de paro: ${fmt(p.hours,p.hours%1?2:0)} h`].join("\n"))}

  $("plantSelect").addEventListener("change",e=>selectPlant(e.target.value));$("captureButton").addEventListener("click",openCapture);$("exportSummary").addEventListener("click",exportSummary);
  document.querySelectorAll(".tabs button").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll(".tabs button").forEach(v=>v.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(v=>v.classList.remove("active"));button.classList.add("active");$("tab-"+button.dataset.tab).classList.add("active")}));
  $("editMonth").addEventListener("change",()=>{draft.currentMonth=Number($("editMonth").value);fillMonthly()});$("editYear").addEventListener("input",()=>draft.currentYear=Number($("editYear").value));$("editGlobalTm").addEventListener("input",()=>draft.global.tmTrend[Number($("editMonth").value)]=number($("editGlobalTm").value));$("editGlobalMp").addEventListener("input",()=>draft.global.mpTrend[Number($("editMonth").value)]=number($("editGlobalMp").value));
  $("equipmentPlant").addEventListener("change",renderEquipmentEditor);$("addEquipment").addEventListener("click",()=>{draft.plants[$("equipmentPlant").value].equipment.push(["Nuevo equipo",0]);renderEquipmentEditor()});$("saveLocal").addEventListener("click",saveLocal);$("downloadData").addEventListener("click",exportDataJs);$("exportJson").addEventListener("click",exportJson);$("importData").addEventListener("click",()=>$("importFile").click());$("importFile").addEventListener("change",e=>e.target.files[0]&&importFile(e.target.files[0]));$("resetData").addEventListener("click",resetData);
  renderAll();
})();
