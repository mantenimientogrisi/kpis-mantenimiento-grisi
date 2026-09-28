(() => {
  const data = window.GRISI_KPI_DATA;
  const fmt = (n, digits = 2) => Number(n).toLocaleString("es-MX", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const el = (id) => document.getElementById(id);
  const totalHours = data.global.hours;
  let currentPlant = "ALL";

  function isTmGood(plant) { return plant.tm <= plant.tmGoal; }
  function statusClass(tmGood, mp) {
    if (mp === null) return tmGood ? "pending" : "bad";
    return tmGood && mp >= 98 ? "good" : "bad";
  }
  function statusText(cls) { return cls === "good" ? "Cumple" : cls === "pending" ? "En proceso" : "Atención"; }

  function buildChips() {
    const keys = ["ALL", ...Object.keys(data.plants)];
    el("plantChips").innerHTML = keys.map(k => `<button class="chip ${k === currentPlant ? "active" : ""}" data-plant="${k}">${k === "ALL" ? "Todas" : data.plants[k].label}</button>`).join("");
    el("plantChips").querySelectorAll("button").forEach(b => b.addEventListener("click", () => selectPlant(b.dataset.plant)));
  }

  function buildTable() {
    el("plantTable").innerHTML = Object.entries(data.plants).map(([key,p]) => {
      const cls = statusClass(isTmGood(p), p.mp);
      return `<tr data-plant="${key}" class="${currentPlant === key ? "selected" : ""}"><td><strong>${p.label}</strong></td><td>${fmt(p.tm)}%</td><td>≤ ${fmt(p.tmGoal)}%</td><td>${p.mp === null ? "En proceso" : fmt(p.mp) + "%"}</td><td>${fmt(p.hours, p.hours % 1 ? 2 : 0)} h</td><td><span class="state-pill ${cls}">${statusText(cls)}</span></td></tr>`;
    }).join("");
    el("plantTable").querySelectorAll("tr").forEach(r => r.addEventListener("click", () => selectPlant(r.dataset.plant)));
  }

  function buildRanking() {
    const max = Math.max(...Object.values(data.plants).map(p => p.hours));
    el("plantRanking").innerHTML = Object.entries(data.plants).sort((a,b) => b[1].hours-a[1].hours).map(([key,p]) => `<div class="rank-row ${p.tm > p.tmGoal ? "critical" : ""}" data-plant="${key}"><div class="rank-meta"><strong>${p.label}</strong><strong>${fmt(p.hours, p.hours % 1 ? 2 : 0)} h</strong></div><div class="rank-track"><i style="width:${p.hours/max*100}%"></i></div></div>`).join("");
    el("plantRanking").querySelectorAll(".rank-row").forEach(r => r.addEventListener("click", () => selectPlant(r.dataset.plant)));
  }

  function trendSvg() {
    const W=760,H=260,L=38,R=42,T=22,B=32, innerW=W-L-R, innerH=H-T-B;
    const x = i => L + (innerW/(data.months.length-1))*i;
    const yTm = v => T + innerH - (v/3.2)*innerH;
    const yMp = v => T + innerH - ((v-92)/10)*innerH;
    const path = (arr, y) => arr.map((v,i) => `${i?"L":"M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencia mensual de tiempo muerto y mantenimiento preventivo">`;
    [0,1,2,3].forEach(v => { const yy=yTm(v); svg+=`<line class="grid-line" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/><text class="svg-label" x="2" y="${yy+4}">${v}%</text>`; });
    svg+=`<line class="goal-line" x1="${L}" x2="${W-R}" y1="${yTm(1.5)}" y2="${yTm(1.5)}"/>`;
    svg+=`<path class="tm-line" d="${path(data.global.tmTrend,yTm)}"/><path class="mp-line" d="${path(data.global.mpTrend,yMp)}"/>`;
    data.months.forEach((m,i) => {
      svg+=`<text class="svg-label" text-anchor="middle" x="${x(i)}" y="${H-7}">${m}</text>`;
      svg+=`<circle class="chart-dot-tm" cx="${x(i)}" cy="${yTm(data.global.tmTrend[i])}" r="4"/><circle class="chart-dot-mp" cx="${x(i)}" cy="${yMp(data.global.mpTrend[i])}" r="4"/>`;
      if(i===data.months.length-1) svg+=`<text class="svg-value" x="${x(i)-7}" y="${yTm(data.global.tmTrend[i])-10}">${fmt(data.global.tmTrend[i])}%</text><text class="svg-value" x="${x(i)-7}" y="${yMp(data.global.mpTrend[i])-10}">${fmt(data.global.mpTrend[i],0)}%</text>`;
    });
    [92,94,96,98,100,102].forEach(v => svg+=`<text class="svg-label" x="${W-R+8}" y="${yMp(v)+4}">${v}%</text>`);
    return svg+`</svg>`;
  }

  function buildEquipment(plantKey) {
    let equipment;
    if (plantKey === "ALL") {
      equipment = Object.values(data.plants).map(p => [p.label, p.hours]).sort((a,b)=>b[1]-a[1]);
      el("equipmentTitle").textContent = "Concentración de tiempo muerto";
      el("equipmentHint").textContent = "Comparativo por planta";
    } else {
      const p=data.plants[plantKey]; equipment=p.equipment;
      el("equipmentTitle").textContent = "Equipos con mayor tiempo muerto";
      el("equipmentHint").textContent = p.label;
    }
    const max=Math.max(...equipment.map(d=>d[1]));
    el("equipmentChart").innerHTML=equipment.map(([name,val])=>`<div class="equip-col"><strong>${fmt(val,val%1?2:0)} h</strong><i class="equip-bar" style="height:${Math.max(4,val/max*165)}px"></i><span>${name}</span></div>`).join("");
  }

  function updateCards() {
    const p = currentPlant === "ALL" ? {tm:data.global.tm, tmGoal:1.5, mp:data.global.mp, hours:data.global.hours, label:"Todas"} : data.plants[currentPlant];
    const tmGood=isTmGood(p); const mpGood=p.mp!==null && p.mp>=98;
    el("tmValue").textContent=fmt(p.tm)+"%";
    el("tmStatus").className=`status ${tmGood?"good":"bad"}`; el("tmStatus").textContent=tmGood?"Cumple":"Fuera de meta";
    const diff=p.tm-p.tmGoal; el("tmVariance").textContent=Math.abs(diff)<.005?"En meta":`${diff>0?"+":""}${fmt(diff)} pp`;
    el("tmProgress").style.width=`${Math.min(100,p.tm/p.tmGoal*72)}%`; el("tmProgress").style.background=tmGood?"var(--green)":"var(--red)";
    el("mpValue").textContent=p.mp===null?"En proceso":fmt(p.mp)+"%";
    el("mpStatus").className=`status ${p.mp===null?"pending":mpGood?"good":"bad"}`; el("mpStatus").textContent=p.mp===null?"Pendiente":mpGood?"Cumple":"Fuera de meta";
    el("mpVariance").textContent=p.mp===null?"Sin cierre":Math.abs(p.mp-98)<.005?"En meta":`${p.mp>98?"+":""}${fmt(p.mp-98)} pp`;
    el("mpProgress").style.width=p.mp===null?"30%":`${Math.min(100,p.mp)}%`; el("mpProgress").style.background=p.mp===null?"var(--amber)":mpGood?"var(--green)":"var(--red)";
    el("hoursValue").textContent=fmt(p.hours,p.hours%1?2:0);
    el("hoursContext").textContent=currentPlant==="ALL"?"Acumulado de 4 plantas":`Horas registradas en ${p.label}`;
    el("hoursShare").textContent=`${fmt(p.hours/totalHours*100,1)}%`;
    const bars=currentPlant==="ALL"?Object.values(data.plants).map(x=>x.hours):p.equipment.map(x=>x[1]); const mx=Math.max(...bars);
    el("miniBars").innerHTML=bars.map(v=>`<i style="height:${Math.max(5,v/mx*22)}px"></i>`).join("");
    if(currentPlant==="ALL") { el("focusValue").textContent="CPA"; el("focusText").textContent="Concentra 58.4% de las horas de paro y excede la meta de tiempo muerto."; }
    else if(!tmGood) { el("focusValue").textContent="Tiempo muerto"; el("focusText").textContent=`${p.label} supera la meta en ${fmt(p.tm-p.tmGoal)} puntos porcentuales.`; }
    else if(p.mp===null) { el("focusValue").textContent="Cierre pendiente"; el("focusText").textContent="Falta consolidar el resultado mensual de mantenimiento preventivo."; }
    else if(!mpGood) { el("focusValue").textContent="Cumplimiento MP"; el("focusText").textContent=`${p.label} se encuentra ${fmt(98-p.mp)} puntos porcentuales debajo de la meta.`; }
    else { el("focusValue").textContent="Resultado estable"; el("focusText").textContent=`${p.label} cumple las metas reportadas para agosto.`; }
    el("notice").hidden=!p.note; el("notice").textContent=p.note||"";
  }

  function selectPlant(key) {
    currentPlant=key; el("plantSelect").value=key;
    el("viewSubtitle").textContent=key==="ALL"?"Visión consolidada de las plantas":`Consulta de indicadores · Planta ${data.plants[key].label}`;
    buildChips(); buildTable(); buildEquipment(key); updateCards();
  }

  function exportSummary() {
    const p=currentPlant==="ALL"?{label:"Todas las plantas",tm:data.global.tm,tmGoal:1.5,mp:data.global.mp,hours:data.global.hours}:data.plants[currentPlant];
    const lines=["GRUPO GRISI - RESUMEN DE KPIs DE MANTENIMIENTO",`Periodo: ${data.cutoff}`,`Planta: ${p.label}`,`Tiempo muerto: ${fmt(p.tm)}% | Meta: <= ${fmt(p.tmGoal)}%`,`Cumplimiento MP: ${p.mp===null?"En proceso":fmt(p.mp)+"%"} | Meta: >= 98%`,`Horas de paro: ${fmt(p.hours,p.hours%1?2:0)} h`,"Fuente: Indicadores de mantenimiento.pptx"];
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`KPIs_Mantenimiento_${currentPlant}_Ago2026.txt`; a.click(); URL.revokeObjectURL(a.href);
  }

  el("trendChart").innerHTML=trendSvg(); buildRanking();
  el("plantSelect").addEventListener("change",e=>selectPlant(e.target.value));
  el("exportButton").addEventListener("click",exportSummary);
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelector(b.dataset.section==="overview"?".kpi-grid":b.dataset.section==="plants"?".table-panel":".equipment-panel").scrollIntoView({behavior:"smooth",block:"center"});}));
  selectPlant("ALL");
})();
