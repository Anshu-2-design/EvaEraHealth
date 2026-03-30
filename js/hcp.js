/*HealthCareProvider Clinician Dashboard*/

'use strict';

/*SHOW HCP DASHBOARD*/
function showHCPDashboard() {
  showScreen('hcp-portal-screen');
  loadPatients();
  if (S.patients.length === 0) addDemoPatients();
  var hc = document.getElementById('hcp-content');
  if (!hc) return;
  hc.innerHTML =
    '<div style="display:grid;grid-template-columns:300px 1fr;height:calc(100vh - 64px)">' +
    '<div id="patient-list" style="overflow-y:auto;border-right:1px solid rgba(255,255,255,0.06)"></div>' +
    '<div id="patient-detail" style="overflow-y:auto">' +
    '<div style="text-align:center;padding:80px 40px">' +
    '<div style="font-size:64px;margin-bottom:20px;opacity:0.2">🩺</div>' +
    '<div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.4);font-family:Cormorant Garamond,serif">Select a Patient</div>' +
    '</div></div></div>';
  renderPatientList();
}

/*DEMO PATIENTS*/
function addDemoPatients() {
  var demos = [
    { id:'P_GYNE',name:'Meena Iyer',age:54,city:'Chennai',stage:'Post-Menopause',prakriti:'Pitta',vikriti:'Pitta_excess',
      scores:{composite:50,composite_band:'Moderate',MENQOL_vasomotor:15,MENQOL_physical:12,MENQOL_psychosocial:8,MENQOL_sexual:8,PHQ9:8,PHQ9_band:'Mild',GAD7:7,GAD7_band:'Mild',PSS8:16,PSS8_band:'Moderate',ISI:7,ISI_band:'None',FSFI:null,FSDSR:null,FSFI_band:'Not assessed',FSDSR_band:'Not assessed',rf1:'Yes',rf2:'No',rf3:'Yes',comorbidityMod:13},
      triage:[{action:'gynecology_referral',sev:'severe',rules:['RED_FLAG']},{action:'recommend_menopause_program',sev:'moderate',rules:['EVR_VM']}],
      redFlags:['Unusual vaginal bleeding','Breast changes'],flags:{gyneRedFlag:true,menqolPsychTriggered:false,mentalHealthCompleted:false,psychosexualCompleted:false,sleepModerate:false},
      psychiatricAlert:false,comorbidities:{Hypertension:'Controlled',Hyperlipidemia:'Controlled'},
      wearable:{device:'Garmin Venu 2',avg_rhr:78,avg_hrv:29,avg_sleep:5.8,night_sweats_per_night:3,avg_steps:4820,avg_stress:52,correlations:['Night sweats 3/night','HRV 29ms (low)']},timestamp:new Date().toISOString()
    },
    { id:'P_PSYCH',name:'Kavitha Nair',age:47,city:'Kochi',stage:'Perimenopause',prakriti:'Vata',vikriti:'Vata_excess',
      scores:{composite:100,composite_band:'Critical',MENQOL_vasomotor:18,MENQOL_physical:15,MENQOL_psychosocial:18,MENQOL_sexual:5,PHQ9:26,PHQ9_band:'Severe',PHQ9_item9:2,GAD7:21,GAD7_band:'Severe',PSS8:32,PSS8_band:'High',ISI:28,ISI_band:'Severe',FSFI:null,FSDSR:null,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:14},
      triage:[{action:'psychiatric_alert',sev:'severe',rules:['R1']},{action:'psychologist_referral',sev:'severe',rules:['EVR_PHQ9']},{action:'sleep_recovery_program',sev:'severe',rules:['EVR_ISI']},{action:'gurugram_clinic',sev:'severe',rules:['COMP_HIGH']}],
      redFlags:[],flags:{gyneRedFlag:false,menqolPsychTriggered:true,sleepSevere:true,mentalHealthCompleted:true,psychosexualCompleted:false},
      psychiatricAlert:true,comorbidities:{Hypothyroidism:'Controlled',Anaemia:'Uncontrolled'},
      wearable:{device:'Apple Watch Series 9',avg_rhr:88,avg_hrv:19,avg_sleep:4.9,night_sweats_per_night:4,avg_steps:3210,avg_stress:74},timestamp:new Date().toISOString()
    },
    { id:'P_NORMAL',name:'Anita Sharma',age:48,city:'Pune',stage:'Perimenopause',prakriti:'Tridosha',vikriti:'Balanced',
      scores:{composite:15,composite_band:'Mild',MENQOL_vasomotor:5,MENQOL_physical:5,MENQOL_psychosocial:5,MENQOL_sexual:5,PHQ9:0,PHQ9_band:'Minimal',GAD7:0,GAD7_band:'Minimal',PSS8:8,PSS8_band:'Low',ISI:0,ISI_band:'None',FSFI:null,FSDSR:null,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:0},
      triage:[{action:'recommend_menopause_program',sev:'mild',rules:['COMP_LOW']}],
      redFlags:[],flags:{gyneRedFlag:false,menqolPsychTriggered:false,psychosexualCompleted:false},
      psychiatricAlert:false,comorbidities:{},wearable:null,timestamp:new Date().toISOString()
    },
    { id:'P_PSYCHOSEXUAL',name:'Rekha Pillai',age:51,city:'Bengaluru',stage:'Menopause (<1yr)',prakriti:'Kapha',vikriti:'Kapha_excess',
      scores:{composite:59,composite_band:'Moderate',MENQOL_vasomotor:12,MENQOL_physical:12,MENQOL_psychosocial:10,MENQOL_sexual:18,PHQ9:16,PHQ9_band:'Moderately Severe',GAD7:14,GAD7_band:'Moderate',PSS8:17,PSS8_band:'Moderate',ISI:14,ISI_band:'Subthreshold',FSFI:7.2,FSFI_band:'Sexual Dysfunction',FSDSR:39,FSDSR_band:'Clinically Significant Distress',MCSS:5,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:20},
      triage:[{action:'sexual_therapy_pathway',sev:'severe',rules:['R2']},{action:'psychologist_referral',sev:'severe',rules:['EVR_PHQ9']},{action:'sleep_recovery_program',sev:'moderate',rules:['EVR_ISI']}],
      redFlags:[],flags:{gyneRedFlag:false,mentalHealthCompleted:true,psychosexualCompleted:true,sleepModerate:true},
      psychiatricAlert:false,comorbidities:{Diabetes:'Controlled',PCOD:'Controlled'},
      wearable:{device:'Fitbit Sense 2',avg_rhr:82,avg_hrv:24,avg_sleep:5.4,night_sweats_per_night:2,avg_steps:5640,avg_stress:63},timestamp:new Date().toISOString()
    },
  ];
  var existing = S.patients.map(function(p) { return p.id; });
  demos.forEach(function(d) { if (!existing.includes(d.id)) S.patients.push(d); });
  savePatients();
}

/*PATIENT LIST*/
function renderPatientList() {
  var html = '<div class="pl-header"><input class="pl-search" type="text" placeholder="Search patients..." oninput="filterPatients(this.value)"><div class="pl-count">'+S.patients.length+' patient'+(S.patients.length!==1?'s':'')+'</div></div>';
  S.patients.forEach(function(p) {
    var sc        = p.scores || {};
    var composite = sc.composite || p.composite || 0;
    var band      = composite >= 80 ? 'critical' : composite >= 61 ? 'severe' : composite >= 31 ? 'moderate' : 'mild';
    var flag      = p.psychiatricAlert ? 'red' : (p.redFlags && p.redFlags.length ? 'orange' : 'green');
    var isActive  = S.selectedPatient && S.selectedPatient.id === p.id;
    var nm        = p.name || '?';
    var initials  = nm.split(' ').map(function(w) { return w[0]||''; }).join('').slice(0,2).toUpperCase();
    html += '<div class="patient-item' + (isActive ? ' active' : '') + '" onclick="selectPatient(\'' + p.id + '\')">';
    html += '<span class="pi-flag '+flag+'"></span>';
    html += '<div class="pi-avatar">'+initials+'</div>';
    html += '<div class="pi-info"><div class="pi-name">'+p.name+'<span class="pi-score '+band+'">'+composite+'</span></div>';
    html += '<div class="pi-meta">'+p.age+'y · '+p.city+'</div>';
    html += '<div class="pi-meta">'+p.stage+'</div></div></div>';
  });
  if (!S.patients.length) html += '<div style="padding:32px;text-align:center;color:rgba(255,255,255,0.22);font-size:12px">No patients yet</div>';
  var el = document.getElementById('patient-list');
  if (el) el.innerHTML = html;
}

function filterPatients(q) {
  document.querySelectorAll('.patient-item').forEach(function(item) {
    item.style.display = item.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function selectPatient(id) {
  S.selectedPatient = S.patients.find(function(p) { return p.id === id; });
  if (!S.selectedPatient) return;
  renderPatientList();
  renderPatientDetail(S.selectedPatient);
}

/*PATIENT DETAIL*/
function renderPatientDetail(p) {
  var sc       = p.scores || {};
  var composite = sc.composite || 0;
  var bandTag  = composite >= 61 ? 'tag-rose' : composite >= 31 ? 'tag-gold' : 'tag-teal';
  var bandLabel = composite >= 80 ? 'Critical' : composite >= 61 ? 'Severe' : composite >= 31 ? 'Moderate' : 'Mild';
  var gaugeCol = composite >= 61 ? '#EF5350' : composite >= 31 ? '#FF9800' : '#4CAF50';
  var html = '';

  // Header
  html += '<div class="pd-header"><div><h2>'+p.name+(p.psychiatricAlert?' <span style="color:#EF5350;font-size:13px">🚨</span>':'')+'</h2>';
  html += '<div class="pd-meta">'+p.age+' yrs · '+p.city+' · '+p.stage+'<br>Prakriti: '+p.prakriti+(p.vikriti?' · Vikriti: '+p.vikriti.replace(/_/g,' '):'')+'</div></div>';
  html += '<div class="pd-header-right"><span class="tag '+bandTag+'">'+composite+'/100 — '+bandLabel+'</span>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.25)">'+new Date(p.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+'</div></div></div>';

  // Alerts
  if (p.psychiatricAlert) html += '<div class="hcp-alert-banner"><div class="hab-icon">🚨</div><div class="hab-body"><strong>PSYCHIATRIC ALERT</strong> — PHQ-9 Item 9 positive. Immediate clinical follow-up required. iCall: 9152987821</div></div>';
  if (p.redFlags && p.redFlags.length) html += '<div class="hcp-alert-banner" style="border-color:rgba(255,152,0,0.4);background:rgba(255,152,0,0.09)"><div class="hab-icon">⚠️</div><div class="hab-body" style="color:#FFCC80"><strong>Red Flags: </strong>'+p.redFlags.join(' · ')+'</div></div>';

  // Tabs
  html += '<div class="pd-tabs">';
  ['Overview','Scores','Triage','Care Plan','Data'].forEach(function(t, i) { html += '<div class="pd-tab'+(i===0?' active':'')+'" onclick="switchPDTab(this,'+i+')">'+t+'</div>'; });
  html += '</div><div class="pd-body">';

  // Tab 0: Overview
  html += '<div class="pd-tab-content" id="tab0">';
  html += '<div style="text-align:center;padding:18px"><div style="font-size:54px;font-weight:900;color:'+gaugeCol+';line-height:1">'+composite+'<span style="font-size:18px;color:rgba(255,255,255,0.22)">/100</span></div>';
  html += '<div style="font-size:13px;font-weight:700;color:#fff;margin:6px 0 2px">Modified MenQOL Composite</div><div style="font-size:11px;color:rgba(255,255,255,0.35)">'+bandLabel+' Symptom Burden</div>';
  html += '<div class="mc-bar" style="max-width:220px;margin:10px auto 0"><div class="mc-bar-fill" style="width:'+composite+'%;background:'+gaugeCol+'"></div></div></div>';
  html += '<div class="metrics-grid">';
  [{k:'MENQOL_vasomotor',l:'Vasomotor',e:'🌡',m:20},{k:'MENQOL_physical',l:'Physical',e:'💪',m:20},{k:'MENQOL_psychosocial',l:'Emotional',e:'🧠',m:20},{k:'MENQOL_sexual',l:'Intimate',e:'💙',m:20}].forEach(function(d) {
    var v = sc[d.k]||0; var col = v>=14?'#EF5350':v>=7?'#FF9800':'#4CAF50';
    html += '<div class="metric-card"><div class="mc-label">'+d.e+' '+d.l+'</div><div class="mc-value" style="color:'+col+'">'+v+'</div><div class="mc-sub">/'+d.m+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(v/d.m*100)+'%;background:'+col+'"></div></div></div>';
  });
  var isiV = sc.ISI||0; var isiC = isiV>=15?'#EF5350':isiV>=8?'#FF9800':'#4CAF50';
  html += '<div class="metric-card"><div class="mc-label">😴 Sleep (ISI)</div><div class="mc-value" style="color:'+isiC+'">'+isiV+'</div><div class="mc-sub">/28 · '+(sc.ISI_band||'—')+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(isiV/28*100)+'%;background:'+isiC+'"></div></div></div>';
  if (sc.PHQ9!==null&&sc.PHQ9!==undefined) { var phqC=(sc.PHQ9||0)>=15?'#EF5350':(sc.PHQ9||0)>=10?'#FF9800':'#4CAF50'; html += '<div class="metric-card"><div class="mc-label">🧠 PHQ-9</div><div class="mc-value" style="color:'+phqC+'">'+(sc.PHQ9||0)+'</div><div class="mc-sub">/27 · '+(sc.PHQ9_band||'')+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round((sc.PHQ9||0)/27*100)+'%;background:'+phqC+'"></div></div></div>'; }
  if (sc.FSFI!==null&&sc.FSFI!==undefined) { var fsfiC = sc.FSFI<=10?'#EF5350':sc.FSFI<=26.55?'#FF9800':'#4CAF50'; html += '<div class="metric-card"><div class="mc-label">💙 FSFI</div><div class="mc-value" style="color:'+fsfiC+'">'+sc.FSFI+'</div><div class="mc-sub">/36</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(sc.FSFI/36*100)+'%;background:'+fsfiC+'"></div></div></div>'; }
  html += '</div>';
  if (p.comorbidities && Object.keys(p.comorbidities).length) {
    html += '<div class="section-hcp" style="margin-top:14px"><h4>Comorbidities</h4>';
    Object.entries(p.comorbidities).forEach(function(e) { var col = e[1]==='Uncontrolled'?'#EF9A9A':e[1]==='Not Sure'?'#90CAF9':'#A5D6A7'; html += '<div class="score-row"><span class="score-label">'+e[0]+'</span><span class="score-val" style="color:'+col+'">'+e[1]+'</span></div>'; });
    html += '</div>';
  }
  html += '</div>';

  // Tab 1: Scores
  html += '<div class="pd-tab-content" id="tab1" style="display:none">';
  html += '<table class="instrument-table"><thead><tr><th>Instrument</th><th>Score</th><th>Bar</th><th>Band</th></tr></thead><tbody>';
  var rows = [{l:'MenQOL Vasomotor',v:sc.MENQOL_vasomotor||0,m:20,c:sc.MENQOL_vasomotor>=14?'#EF9A9A':sc.MENQOL_vasomotor>=7?'#FFCC80':'#A5D6A7'},{l:'MenQOL Physical',v:sc.MENQOL_physical||0,m:20,c:sc.MENQOL_physical>=14?'#EF9A9A':sc.MENQOL_physical>=7?'#FFCC80':'#A5D6A7'},{l:'MenQOL Psychosocial',v:sc.MENQOL_psychosocial||0,m:20,c:sc.MENQOL_psychosocial>=14?'#EF9A9A':sc.MENQOL_psychosocial>=7?'#FFCC80':'#A5D6A7'},{l:'MenQOL Sexual',v:sc.MENQOL_sexual||0,m:20,c:sc.MENQOL_sexual>=14?'#EF9A9A':sc.MENQOL_sexual>=7?'#FFCC80':'#A5D6A7'},{l:'ISI Sleep',v:sc.ISI||0,m:28,c:(sc.ISI||0)>=15?'#EF9A9A':(sc.ISI||0)>=8?'#FFCC80':'#A5D6A7'}];
  if (sc.PHQ9!==null&&sc.PHQ9!==undefined) rows = rows.concat([{l:'PHQ-9',v:sc.PHQ9||0,m:27,c:(sc.PHQ9||0)>=15?'#EF9A9A':(sc.PHQ9||0)>=10?'#FFCC80':'#A5D6A7'},{l:'GAD-7',v:sc.GAD7||0,m:21,c:(sc.GAD7||0)>=15?'#EF9A9A':(sc.GAD7||0)>=10?'#FFCC80':'#A5D6A7'},{l:'PSS-8',v:sc.PSS8||0,m:32,c:(sc.PSS8||0)>=21?'#EF9A9A':(sc.PSS8||0)>=11?'#FFCC80':'#A5D6A7'}]);
  if (sc.FSFI!==null&&sc.FSFI!==undefined) rows = rows.concat([{l:'FSFI',v:sc.FSFI,m:36,c:sc.FSFI<=10?'#EF9A9A':sc.FSFI<=26.55?'#FFCC80':'#A5D6A7'},{l:'FSDSR',v:sc.FSDSR||0,m:52,c:(sc.FSDSR||0)>=26?'#EF9A9A':(sc.FSDSR||0)>=11?'#FFCC80':'#A5D6A7'}]);
  rows.push({l:'Comorbidity Modifier',v:'+'+(sc.comorbidityMod||0),m:null,c:'rgba(255,255,255,0.38)'});
  rows.forEach(function(r) {
    var pct = r.m ? Math.round(Math.min((parseFloat(r.v)||0)/r.m,1)*100) : 0;
    html += '<tr><td>'+r.l+'</td><td><span style="color:'+r.c+';font-weight:800;font-size:15px">'+r.v+'</span>'+(r.m?'<span style="color:rgba(255,255,255,0.2);font-size:11px"> /'+r.m+'</span>':'')+'</td>';
    html += '<td>'+(r.m?'<div style="width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+r.c+';border-radius:2px"></div></div>':'—')+'</td>';
    html += '<td style="color:'+r.c+';font-size:11px;font-weight:700">'+(r.b||'')+'</td></tr>';
  });
  html += '</tbody></table></div>';

  // Tab 2: Triage
  html += '<div class="pd-tab-content" id="tab2" style="display:none">';
  var icons = {psychiatric_alert:'🚨',gynecology_referral:'👩‍⚕️',psychologist_referral:'🧠',sexual_therapy_pathway:'💙',sleep_recovery_program:'😴',stress_management_program:'🌿',recommend_menopause_program:'🌸',gurugram_clinic:'🏥',exercise_program:'🏃',nutrition_guidance:'🥗',sexual_wellbeing_program:'💜',activate_psychosexual_module:'💙',relationship_counselling:'🤝'};
  html += '<div class="triage-list">';
  (p.triage||[]).forEach(function(t) {
    var cls = t.sev==='severe'?'sev':t.sev==='moderate'?'mod':'norm'; var lbl = t.sev==='severe'?'Urgent':t.sev==='moderate'?'Recommended':'Advisory';
    html += '<div class="triage-item '+cls+'"><div class="ti-icon">'+(icons[t.action]||'✦')+'</div><div class="ti-body"><div class="ti-action">'+t.action.replace(/_/g,' ')+'</div><div class="ti-rules">'+t.rules.slice(0,4).join(', ')+'</div></div><div class="ti-sev">'+lbl+'</div></div>';
  });
  if (!(p.triage||[]).length) html += '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22)">No triage actions — wellness baseline</div>';
  html += '</div></div>';

  // Tab 3: Care Plan
  html += '<div class="pd-tab-content" id="tab3" style="display:none"><div style="display:flex;flex-direction:column;gap:8px">';
  (p.triage||[]).forEach(function(t) {
    var col = t.sev==='severe'?'rgba(183,28,28,0.14)':t.sev==='moderate'?'rgba(255,152,0,0.1)':'rgba(76,175,80,0.08)';
    var brd = t.sev==='severe'?'rgba(183,28,28,0.35)':t.sev==='moderate'?'rgba(255,152,0,0.3)':'rgba(76,175,80,0.2)';
    var tcol = t.sev==='severe'?'#EF9A9A':t.sev==='moderate'?'#FFCC80':'#A5D6A7';
    html += '<div style="background:'+col+';border:1px solid '+brd+';border-radius:12px;padding:14px 16px"><div style="font-size:13px;font-weight:800;color:#fff;text-transform:capitalize;margin-bottom:3px">'+t.action.replace(/_/g,' ')+'</div><span style="background:'+brd+';color:'+tcol+';padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700">'+t.sev+'</span></div>';
  });
  html += '</div><div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px"><a href="tel:+918069050000" style="background:var(--rose-deep);color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">📞 +91 80690 50000</a><a href="mailto:clinic@evaerahealth.in" style="background:rgba(0,188,212,0.13);color:#00BCD4;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid rgba(0,188,212,0.3);font-size:13px">✉ Email Clinic</a></div></div>';

  // Tab 4: Raw Data
  html += '<div class="pd-tab-content" id="tab4" style="display:none">';
  html += '<div class="download-bar"><button class="btn-download" onclick="downloadHCPReport()">⬇ Download Report</button><button class="btn-download" onclick="downloadHCPJSON()">{ } Export JSON</button></div>';
  var raw = {name:p.name,age:p.age,stage:p.stage,prakriti:p.prakriti,scores:p.scores,triage:p.triage,redFlags:p.redFlags,comorbidities:p.comorbidities};
  html += '<pre style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;font-size:11px;color:rgba(255,255,255,0.5);overflow:auto;max-height:400px;line-height:1.5">'+JSON.stringify(raw,null,2)+'</pre></div>';
  html += '</div>'; // pd-body

  var el = document.getElementById('patient-detail');
  if (el) el.innerHTML = '<div class="pd-panel">'+html+'</div>';
}

/*TAB SWITCHER*/
function switchPDTab(el, idx) {
  document.querySelectorAll('.pd-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.querySelectorAll('.pd-tab-content').forEach(function(t) { t.style.display = 'none'; });
  document.getElementById('tab' + idx).style.display = 'block';
}

/*DOWNLOADS*/
function downloadHCPJSON() {
  var p = S.selectedPatient;
  if (!p) { alert('No patient selected'); return; }
  var blob = new Blob([JSON.stringify(p, null, 2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'EvaEraHealth_'+(p.name||'Patient').replace(/\s/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

function downloadHCPReport() {
  var p = S.selectedPatient; if (!p) return;
  var sc = p.scores || {};
  var lines = ['EvaEraHealth Clinical Report','Generated: '+new Date().toLocaleString(),'',
    'Patient: '+p.name+' | Age: '+p.age+' | '+p.stage+' | Prakriti: '+(p.prakriti||'-'),'','COMPOSITE: '+(sc.composite||0)+'/100 ['+(sc.composite_band||'-')+']',
    'MenQOL: VM='+(sc.MENQOL_vasomotor||0)+' Ph='+(sc.MENQOL_physical||0)+' PS='+(sc.MENQOL_psychosocial||0)+' Sx='+(sc.MENQOL_sexual||0),
    'PHQ9='+(sc.PHQ9||0)+'('+sc.PHQ9_band+') GAD7='+(sc.GAD7||0)+' ISI='+(sc.ISI||0)+'('+sc.ISI_band+')','','TRIAGE:'];
  (p.triage||[]).forEach(function(t) { lines.push('  • '+t.action+' ['+t.sev+']'); });
  lines.push('','Red Flags: '+(p.redFlags&&p.redFlags.length?p.redFlags.join(', '):'None'));
  lines.push('','EvaEraHealth Clinic, Gurugram | +91 80690 50000 | clinic@evaerahealth.in','AI-generated clinical summary — for qualified HCP use only');
  var blob = new Blob([lines.join('\n')],{type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'EvaEraHealth_'+p.name.replace(/\s/g,'_')+'.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}
