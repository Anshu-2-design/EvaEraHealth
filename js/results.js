/*Results Screen & AI Message */

'use strict';

/*SAVE RESULT TO PATIENT STORE*/
function buildWearableRecord(a) {
  var wd = a.wearable_data || {};
  var device = a.wearable || 'Not specified';
  if (device === 'None / No wearable' || !a.wearable) return null;
  var correlations = [];
  if (wd.avg_hrv && wd.avg_hrv < 30) correlations.push('HRV '+wd.avg_hrv+'ms (low) — autonomic stress pattern');
  if (wd.avg_sleep && wd.avg_sleep < 6.5) correlations.push('Sleep '+wd.avg_sleep+'h — below recommended 7-9h');
  if (wd.night_sweats_per_night >= 2) correlations.push('Night sweats '+wd.night_sweats_per_night+'/night — significant vasomotor activity');
  return { device, period:'Last 30 days', avg_rhr:wd.avg_rhr, avg_hrv:wd.avg_hrv, avg_spo2:wd.avg_spo2, avg_sleep:wd.avg_sleep, night_sweats_per_night:wd.night_sweats_per_night, avg_steps:wd.avg_steps, avg_stress:wd.avg_stress, correlations };
}

function saveResult() {
  loadPatients();
  var a = S.answers;
  var patient = {
    id:'P'+Date.now(), name:a.name||'Anonymous', age:a.age||'–', city:a.city||'–',
    stage:a.stage||'–', prakriti:a.prakriti||'Tridosha', vikriti:a.vikriti||'–',
    scores:S.scores, triage:S.triage, psychiatricAlert:S.psychiatricAlert,
    redFlags:S.redFlagsTriggered, flags:S.flags,
    comorbidities:a.comorbidities||{}, wearable:buildWearableRecord(a),
    timestamp:new Date().toISOString(), sessionId:S.session?S.session.id:'guest',
    composite:S.scores.composite
  };
  S.patients.unshift(patient);
  savePatients();
}

/*SHOW RESULTS*/
function showResults() {
  showScreen('results-screen');
  var a = S.answers, sc = S.scores;
  var name = a.name || 'there';
  var composite = (sc && sc.composite !== undefined) ? sc.composite : 0;
  var band = composite <= 30 ? 'Mild' : composite <= 60 ? 'Moderate' : composite <= 80 ? 'Severe' : 'Critical';
  var bandColor = composite <= 30 ? 'var(--ok)' : composite <= 60 ? 'var(--warn)' : composite <= 80 ? 'var(--danger)' : '#B71C1C';
  var html = '';

  // Crisis/Red Flag banners
  if (S.psychiatricAlert) {
    html += '<div class="psychiatric-alert-banner"><div class="pab-icon">🆘</div><div class="pab-body"><h3>Immediate Support Available</h3><div class="pab-num"><a href="tel:9152987821" style="color:var(--purple)">iCall: 9152987821</a></div><p style="font-size:11px">Vandrevala 24/7: 1860-2662-345 · NIMHANS: 080-46110007</p></div></div>';
  }
  if (S.redFlagsTriggered && S.redFlagsTriggered.length) {
    html += '<div class="redflag-banner"><div class="rf-icon">⚠️</div><div class="rf-text"><strong>Clinical Red Flags:</strong> '+S.redFlagsTriggered.join(', ')+'. <strong>Please consult a gynaecologist immediately.</strong><div style="margin-top:10px"><a href="tel:+918069050000" style="display:inline-block;background:var(--danger);color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">📞 +91 80690 50000</a></div></div></div>';
  }

  // Header
  html += '<div class="results-header"><div class="rh-greeting">Your Health Profile & Progress</div><h2>Hello, '+name+' 🌸</h2><div class="rh-sub">Your personalised adaptive wellness assessment — EvaEraHealth Clinic, Gurugram</div></div>';

  // Composite score
  html += '<div class="composite-band"><div class="cb-score" style="color:'+bandColor+'">'+Math.round(composite)+'</div><div class="cb-info"><div class="cb-band" style="color:'+bandColor+'">'+band+'</div><div class="cb-label">Modified MenQOL Composite Score / 100</div>';
  var pathItems = [];
  if (S.flags.menqolPsychTriggered    && S.flags.mentalHealthCompleted)   pathItems.push('🧠 Mental Health');
  if (S.flags.menqolSexualTriggered   && S.flags.psychosexualCompleted)   pathItems.push('💙 Sexual Wellbeing');
  if (S.flags.sleepModerate)  pathItems.push('🌙 Sleep');
  if (S.flags.gyneRedFlag)    pathItems.push('🏥 Gynaecology');
  if (pathItems.length) html += '<div style="font-size:11px;color:var(--teal);margin-top:4px">Modules completed: '+pathItems.join(' · ')+'</div>';
  html += '</div></div>';

  // AI message
  html += '<div class="ai-message-box"><div class="amb-label">✨ Your Personalised Message</div><div class="amb-text" id="ai-message-text"><span class="ai-spinner"></span> Generating your personalised message…</div></div>';

  // Wellbeing rings
  html += '<div class="rings-grid">';
  [{label:'Vasomotor',score:Math.max(0,100-(sc.MENQOL_vasomotor||0)*5),color:'#E91E8C'},{label:'Physical',score:Math.max(0,100-(sc.MENQOL_physical||0)*3-(sc.ISI||0)*2),color:'#9C27B0'},{label:'Emotional',score:Math.max(0,100-(sc.MENQOL_psychosocial||0)*3-(sc.PHQ9||0)*1.5),color:'#3F51B5'},{label:'Intimacy',score:Math.max(0,100-(sc.MENQOL_sexual||0)*5-(sc.FSDSR||0)*1),color:'#E64A19'}].forEach(function(r) {
    var pct = Math.min(100, Math.max(0, r.score));
    var circ = 2 * Math.PI * 36; var dash = circ * (pct / 100);
    html += '<div class="ring-card"><div class="rc-label">'+r.label+'</div>';
    html += '<svg class="ring-svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="#F0EBE8" stroke-width="8"/>';
    html += '<circle cx="40" cy="40" r="36" fill="none" stroke="'+r.color+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+dash.toFixed(1)+' '+circ.toFixed(1)+'" transform="rotate(-90 40 40)"/>';
    html += '<text x="40" y="45" text-anchor="middle" font-size="14" font-weight="700" fill="'+r.color+'">'+Math.round(pct)+'</text></svg>';
    html += '<div class="rc-score">'+Math.round(pct)+'/100</div><div class="rc-desc">'+(pct>=70?'😊 Good':pct>=40?'🌿 Moderate':'🌱 Needs Care')+'</div></div>';
  });
  html += '</div>';

  // Domain scores table
  html += '<div style="background:#fff;border-radius:var(--r-lg);padding:20px 24px;margin-bottom:24px;box-shadow:var(--shadow)">';
  html += '<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:18px;color:var(--navy);margin-bottom:14px">Clinical Domain Scores</h3>';
  var domainRows = [
    {label:'MenQOL Vasomotor',val:sc.MENQOL_vasomotor,max:20,band:sc.MENQOL_vasomotor<7?'Low':sc.MENQOL_vasomotor<14?'Moderate':'High'},
    {label:'MenQOL Physical',val:sc.MENQOL_physical,max:20,band:sc.MENQOL_physical<7?'Low':sc.MENQOL_physical<14?'Moderate':'High'},
    {label:'MenQOL Psychosocial',val:sc.MENQOL_psychosocial,max:20,band:sc.MENQOL_psychosocial<7?'Low':sc.MENQOL_psychosocial<14?'Moderate':'High'},
    {label:'MenQOL Sexual',val:sc.MENQOL_sexual,max:20,band:sc.MENQOL_sexual<7?'Low':sc.MENQOL_sexual<14?'Moderate':'High'},
    {label:'ISI Sleep',val:sc.ISI,max:28,band:sc.ISI_band},
  ];
  if (S.flags.mentalHealthCompleted) {
    domainRows.push({label:'PHQ-9 Depression',val:sc.PHQ9,max:27,band:sc.PHQ9_band});
    domainRows.push({label:'GAD-7 Anxiety',val:sc.GAD7,max:21,band:sc.GAD7_band});
    domainRows.push({label:'PSS-8 Stress',val:sc.PSS8,max:32,band:sc.PSS8_band});
  }
  if (S.flags.psychosexualCompleted && sc.FSFI !== null) {
    domainRows.push({label:'FSFI Sexual Function',val:sc.FSFI,max:36,band:sc.FSFI_band});
    domainRows.push({label:'FSDSR Sexual Distress',val:sc.FSDSR,max:52,band:sc.FSDSR_band});
  }
  domainRows.forEach(function(row) {
    if (row.val === undefined || row.val === null) return;
    var bc = ['Low','None','Normal','Minimal'].includes(row.band) ? 'var(--ok)' : ['High','Severe','Dysfunction','Significant'].includes(row.band) ? 'var(--danger)' : 'var(--warn)';
    html += '<div class="score-row"><span class="score-label">'+row.label+'</span><div style="display:flex;align-items:center;gap:8px"><span class="score-val">'+row.val.toFixed(0)+'/'+row.max+'</span><span class="score-band" style="background:'+bc+'22;color:'+bc+'">'+row.band+'</span></div></div>';
  });
  if (a.prakriti || a.vikriti) {
    html += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0;font-size:13px;color:var(--slate)">';
    if (a.prakriti) html += '🌿 Prakriti: <strong style="color:var(--teal)">'+a.prakriti+'</strong> &nbsp;';
    if (a.vikriti)  html += '⚖️ Vikriti: <strong style="color:var(--warn)">'+a.vikriti.replace('_',' ')+'</strong>';
    html += '</div>';
  }
  html += '</div>';

  // Care plan
  html += buildCarePlan();

  // Disclaimer
    html+='<div style="background:linear-gradient(135deg,#FFF8E7,#FFF3E0);border:2px solid #FFB300;border-radius:14px;padding:16px 18px;margin-top:20px">' +
    '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px"><span style="font-size:20px">⚕️</span><div>' +
    '<div style="font-size:12px;font-weight:800;color:#E65100;margin-bottom:4px">AI-Generated Report — Medical Disclaimer</div>' +
    '<div style="font-size:11px;color:#795548;line-height:1.6">Generated by EvaEraHealth AI (Claude, Anthropic). <strong>Not a medical diagnosis.</strong> All insights must be reviewed by a qualified clinician before any action. For emergencies, call 112.</div>' +
    '</div></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    '<span style="background:#fff;border:1px solid #FFB300;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#E65100">🤖 AI Generated</span>' +
    '<span style="background:#fff;border:1px solid #66BB6A;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#2E7D32">🔒 DPDP Compliant</span>' +
    '<span style="background:#fff;border:1px solid #42A5F5;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#1565C0">👩‍⚕️ Clinician Review Required</span>' +
    '</div></div>';
  html+='<div style="text-align:center;margin-top:24px"><button class="btn-primary" style="max-width:280px;margin:0 auto 10px;display:block" onclick="startForm()">Retake Assessment</button><button class="btn-secondary" style="max-width:280px;margin:0 auto;display:block" onclick="downloadUserReport()">📄 Download My Report</button></div>';
  html+='<p style="font-size:11px;text-align:center;color:#9ca3af;margin-top:16px">app.evaerahealth.com · EvaEraHealth Clinic, Gurugram Flagship Center · DPDP Act 2023 Compliant</p>';
  document.getElementById('results-screen').innerHTML=html;
  generateAIMessage(name,sc);
}

/*CARE PLAN*/
function buildCarePlan() {
  var actionMeta = {
    psychiatric_alert:         {icon:'🆘', title:'Immediate Mental Health Support',    desc:'Please speak to a mental health professional as soon as possible.',                                    cta:'📞 Book Now: +91 80690 50000', ctaHref:'tel:+918069050000'},
    psychologist_referral:     {icon:'🧠', title:'Expert Referral — Psychologist',     desc:'A clinical psychologist can provide evidence-based support for your emotional wellbeing.',             cta:'📞 Book Now: +91 80690 50000', ctaHref:'tel:+918069050000'},
    gynecology_referral:       {icon:'👩‍⚕️',title:'Expert Referral — Gynaecologist',  desc:'A menopause specialist at EvaEraHealth Clinic, Gurugram.',                                                 cta:'📞 Book Now: +91 80690 50000', ctaHref:'tel:+918069050000'},
    gurugram_clinic:           {icon:'🏥', title:'EvaEraHealth Clinic — Gurugram',     desc:'Book an in-person consultation at our Gurugram Flagship Center.',                                       cta:'📞 Book Now: +91 80690 50000', ctaHref:'tel:+918069050000'},
    sexual_therapy_pathway:    {icon:'💜', title:'Sexual Therapy Pathway',              desc:'Integrated psychosexual therapy combining CBT and body-awareness techniques.',                         cta:'📞 Book Now: +91 80690 50000', ctaHref:'tel:+918069050000'},
    sexual_wellbeing_program:  {icon:'🌺', title:'Sexual Wellness Programme',           desc:'Specialised support for sexual health through therapy, education and community.'},
    relationship_counselling:  {icon:'💑', title:'Relationship Counselling',            desc:'Couples or individual counselling to navigate intimacy changes during menopause.'},
    sleep_recovery_program:    {icon:'🌙', title:'Sleep Recovery Programme',            desc:'Evidence-based CBT-I and relaxation techniques for better rest.'},
    stress_management_program: {icon:'🧘', title:'Stress Management Programme',         desc:'Mindfulness, breathing techniques and structured stress reduction practices.'},
    recommend_menopause_program:{icon:'🌸',title:'Menopause Wellness Programme',        desc:'Your personalised EvaEraHealth menopause support journey begins here.'},
    exercise_program:          {icon:'🏃‍♀️',title:'Movement & Exercise',                  desc:'Targeted movement plan for joint health, energy and mood.'},
    nutrition_guidance:        {icon:'🥗', title:'Nutrition Guidance',                  desc:'Personalised dietary advice supporting hormonal balance and bone health.'},
    activate_psychosexual_module:{icon:'💭',title:'Psychosexual Support',               desc:'Integrated mind-body support for sexual and psychological wellbeing.'},
  };
  var html = '<div class="care-plan-section"><h3>Your Personalised Care Plan</h3><div class="section-sub">Based on your adaptive assessment — '+STEPS.length+' sections completed</div><div class="care-cards">';
  var shown = 0;
  (S.triage || []).forEach(function(t) {
    if (shown >= 7) return;
    var m = actionMeta[t.action]; if (!m) return;
    var sevClass = t.sev === 'severe' ? 'urgent' : t.sev === 'moderate' ? 'moderate' : 'mild';
    html += '<div class="care-card '+sevClass+'">';
    html += '<div class="cc-icon">'+m.icon+'</div><div class="cc-title">'+m.title+'</div><div class="cc-desc">'+m.desc+'</div>';
    html += '<span class="cc-badge" style="background:'+(t.sev==='severe'?'var(--danger-lt);color:var(--danger)':t.sev==='moderate'?'var(--warn-lt);color:var(--warn)':'var(--ok-lt);color:var(--ok)')+'" >'+t.sev+'</span>';
    if (m.cta) html += '<a href="'+m.ctaHref+'" class="cc-cta">'+m.cta+'</a>';
    html += '</div>'; shown++;
  });
  if (shown === 0) html += '<div class="care-card mild"><div class="cc-icon">✨</div><div class="cc-title">Wellness Maintenance</div><div class="cc-desc">Your results look positive. Continue your healthy lifestyle and schedule regular check-ins.</div></div>';
  return html + '</div></div>';
}

/*AI MESSAGE (Claude API)*/
async function generateAIMessage(name, sc) {
  var band   = sc.composite <= 30 ? 'mild' : sc.composite <= 60 ? 'moderate' : sc.composite <= 80 ? 'significant' : 'high';
  var prompt = 'You are a warm, compassionate AI wellness companion for EvaEraHealth, a menopause platform for Indian women. Write a personalised, empathetic 3-sentence wellness message for a woman named '+name+'. Her assessment shows: Modified MenQOL composite score '+sc.composite+'/100 ('+band+' burden), PHQ-9: '+sc.PHQ9+', GAD-7: '+sc.GAD7+', ISI: '+sc.ISI+'. Write in warm, encouraging English. No clinical jargon. Acknowledge her journey, validate her experience, and give one actionable thought for today. Under 80 words. No bullet points.';
  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] })
    });
    var data = await response.json();
    var text = data.content && data.content[0] ? data.content[0].text : null;
    var el = document.getElementById('ai-message-text');
    if (el) el.innerHTML = '"'+(text || '"Your wellbeing journey is unique and deeply personal. EvaEraHealth is here to walk alongside you every step of the way. Today, take one small, gentle action for yourself — you deserve it."')+'"';
  } catch(e) {
    var el = document.getElementById('ai-message-text');
    if (el) el.innerHTML = '""Your wellbeing journey is unique and deeply personal. EvaEraHealth is here to walk alongside you every step of the way. Today, take one small, gentle action for yourself — you deserve it.""';
  }
}

/*DOWNLOAD USER REPORT*/
async function downloadUserReport() {
  var sc = S.scores || {}, a = S.answers || {}, name = a.name || 'Patient';
  var band = sc.composite <= 30 ? 'Mild Burden' : sc.composite <= 60 ? 'Moderate Burden' : sc.composite <= 80 ? 'Significant Burden' : 'High Burden';
  var today = new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'});
  var aiText = '';
  try {
    var prompt = 'You are a senior women\'s health clinician at EvaEraHealth, Gurugram. Write a warm, professional wellness report for '+name+' (age '+a.age+', '+a.stage+', Prakriti: '+(a.prakriti||'Tridosha')+'). Scores: Composite '+sc.composite+'/100 ('+band+'), Vasomotor '+sc.MENQOL_vasomotor+'/20, Physical '+sc.MENQOL_physical+'/20, Psychosocial '+sc.MENQOL_psychosocial+'/20, Sexual '+sc.MENQOL_sexual+'/20, Sleep (ISI) '+sc.ISI+'/28. Write EXACTLY these sections: DEAR [NAME], [2 warm sentences]. YOUR WELLNESS PICTURE [3 plain-English findings]. WHAT DESERVES ATTENTION [2-3 gentle observations]. YOUR 3 STEPS THIS WEEK [3 specific actionable steps]. A GENTLE REMINDER [1 closing sentence]. 400-500 words total. Warm, no jargon.';
    var resp = await fetch('https://api.anthropic.com/v1/messages', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    var data = await resp.json();
    aiText = data.content && data.content[0] ? data.content[0].text : '';
  } catch(e) { aiText = ''; }
  if (!aiText) aiText = 'Dear '+name+',\n\nThank you for taking this important step towards your wellbeing. Your assessment reflects what many women experience during this transition.\n\nYOUR 3 STEPS THIS WEEK\n1. Begin a 15-minute morning walk daily\n2. Set a consistent sleep time\n3. Book a consultation at EvaEraHealth Clinic, Gurugram\n\nA GENTLE REMINDER\nYou are not alone — EvaEraHealth is here with you.';
  var lines = ['═══════════════════════════════════════════', '      EVAERAHEALTH PERSONAL WELLNESS REPORT','═══════════════════════════════════════════','Patient: '+name+'  |  Age: '+(a.age||'—')+'  |  Date: '+today,'Stage: '+(a.stage||'—')+'  |  Prakriti: '+(a.prakriti||'Tridosha'),'','',aiText,'','───────────────────────────────────────────','CLINICAL REFERENCE SCORES','Composite: '+sc.composite+'/100 ['+band+']','Vasomotor: '+sc.MENQOL_vasomotor+'/20  Physical: '+sc.MENQOL_physical+'/20','Psychosocial: '+sc.MENQOL_psychosocial+'/20  Sexual: '+sc.MENQOL_sexual+'/20','Sleep (ISI): '+sc.ISI+'/28 ['+sc.ISI_band+']'];
  if (S.flags && S.flags.mentalHealthCompleted) { lines.push('PHQ-9: '+sc.PHQ9+'/27 ['+sc.PHQ9_band+']  GAD-7: '+sc.GAD7+'/21 ['+sc.GAD7_band+']'); lines.push('PSS-8: '+sc.PSS8+'/32 ['+sc.PSS8_band+']'); }
  lines.push('','DISCLAIMER: AI-generated. Not a medical diagnosis. Clinician review required.','EvaEraHealth Clinic, Gurugram | +91 80690 50000 | clinic@evaerahealth.in','DPDP Act 2023 Compliant  |  © EvaEraHealth '+new Date().getFullYear(),'═══════════════════════════════════════════');
  var blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
  var a2 = document.createElement('a');
  a2.href = URL.createObjectURL(blob);
  a2.download = 'EvaEraHealth_Report_'+name.replace(/\s/g,'_')+'_'+today.replace(/[\s,]/g,'')+'.txt';
  document.body.appendChild(a2); a2.click(); document.body.removeChild(a2); URL.revokeObjectURL(a2.href);
}
