/* Form Navigation & Logic */

'use strict';

/*START FORM*/
function startForm() {
  S.currentStep = 0;
  S.answers = {}; S.scores = {}; S.triage = [];
  S.redFlagsTriggered = [];
  S.psychiatricAlert = false; S.psychiatricHardStop = false;
  S.flags = {
    menqolPsychTriggered:false, menqolSexualTriggered:false,
    sleepModerate:false, sleepSevere:false, gyneRedFlag:false,
    mentalHealthCompleted:false, psychosexualCompleted:false, sleepDeepDive:false
  };
  rebuildSteps();
  showScreen('form-screen');
  renderStepDots();
  renderStep(0);
}

/*RENDER STEP DOTS*/
function renderStepDots() {
  var html = '';
  STEPS.forEach(function(step, i) {
    if (i > 0) html += '<div class="step-line'+(i <= S.currentStep ? ' done' : '')+'" id="sline_'+i+'"></div>';
    var cls = i < S.currentStep ? 'done' : i === S.currentStep ? 'active' : step.isGate ? 'gate' : 'pending';
    html += '<div class="step-dot '+cls+'" id="sdot_'+i+'" title="'+step.title+'">'+(i < S.currentStep ? '✓' : (i+1))+'</div>';
  });
  document.getElementById('step-dots').innerHTML = html;
}

function updateDots() {
  STEPS.forEach(function(step, i) {
    var dot = document.getElementById('sdot_' + i);
    if (!dot) return;
    dot.className  = 'step-dot ' + (i < S.currentStep ? 'done' : i === S.currentStep ? 'active' : step.isGate ? 'gate' : 'pending');
    dot.textContent = i < S.currentStep ? '✓' : (i + 1);
    var line = document.getElementById('sline_' + i);
    if (line) line.className = 'step-line' + (i <= S.currentStep ? ' done' : '');
  });
}

/*RENDER STEP*/
function renderStep(idx) {
  var step = STEPS[idx];
  if (!step) { startProcessing(); return; }
  var pct = Math.round((idx / STEPS.length) * 100);
  document.getElementById('overall-prog').style.width = pct + '%';
  document.getElementById('progress-label').textContent = 'Step ' + (idx+1) + ' of ' + STEPS.length + ' — ' + step.title;
  var pathLabel = '';
  if (S.flags.menqolPsychTriggered    && !S.flags.mentalHealthCompleted)   pathLabel  = '🧠 Mental Health Branch';
  if (S.flags.menqolSexualTriggered   && !S.flags.psychosexualCompleted)   pathLabel += (pathLabel ? ' · ' : '') + '💙 Sexual Wellbeing Branch';
  document.getElementById('progress-path-label').textContent = pathLabel;
  var html = '<div class="step-card">';
  html += '<div class="step-header"><div class="step-num">'+step.icon+' Step '+(idx+1)+' of '+STEPS.length+'</div>';
  html += '<h2>'+step.title+'</h2>';
  if (step.subtitle) html += '<p>'+step.subtitle+'</p>';
  html += '</div>';
  html += buildStepContent(step.id);
  html += '</div>';
  document.getElementById('steps-container').innerHTML = html;
  updateDots();
  window.scrollTo(0, 0);
  document.getElementById('btn-next').style.display = step.isGate ? 'none' : 'block';
  document.getElementById('btn-back').style.display = idx > 0 ? 'block' : 'none';
}

/*NAVIGATION*/
function stepNext() { showConfirmModal(); }

function stepBack() {
  if (S.currentStep > 0) {
    S.currentStep--;
    renderStep(S.currentStep);
  }
}

/*CONFIRM MODAL*/
function showConfirmModal() {
  var step = STEPS[S.currentStep];
  document.getElementById('modal-title').textContent    = 'Review: ' + step.title;
  document.getElementById('modal-summary').innerHTML    = buildStepSummary(step.id);
  document.getElementById('confirm-modal').classList.add('show');
}

function closeModal() { document.getElementById('confirm-modal').classList.remove('show'); }

/*CONFIRM STEP*/
function confirmStep() {
  closeModal();
  var step   = STEPS[S.currentStep];
  var stepId = step.id;

  if (stepId === 'red_flags') {
    checkRedFlags();
    if (S.redFlagsTriggered.length > 0) { showGyneHardStop(); return; }
  }
  if (stepId === 'mental_health') {
    if ((S.answers.phq_8 || 0) > 0) { showPsychiatricHardStop(); return; }
    S.flags.mentalHealthCompleted = true;
  }
  if (stepId === 'psychosexual') { S.flags.psychosexualCompleted = true; }

  if (stepId === 'menqol_psychosocial') {
    var psScore = computeMenQOLDomain(['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'], 56);
    S.answers._menqol_ps_score = psScore;
    if (psScore >= 8) { S.flags.menqolPsychTriggered = true; rebuildSteps(); renderStepDots(); }
  }
  if (stepId === 'menqol_sexual') {
    var sxScore = computeMenQOLDomain(['mq_s1','mq_s2','mq_s3'], 24);
    S.answers._menqol_sx_score = sxScore;
    if (sxScore >= 8) { S.flags.menqolSexualTriggered = true; rebuildSteps(); renderStepDots(); }
  }
  if (stepId === 'sleep') {
    var isiScore = 0;
    for (var i = 0; i < 7; i++) isiScore += (S.answers['isi_' + i] || 0);
    S.answers._isi_score = isiScore;
    if (isiScore >= 15) { S.flags.sleepSevere = true; S.flags.sleepModerate = true; }
    else if (isiScore >= 8) { S.flags.sleepModerate = true; }
    if (S.flags.sleepModerate) { rebuildSteps(); renderStepDots(); }
  }

  if (stepId === 'gate_psych' || stepId === 'gate_sexual' || stepId === 'gate_sleep') return;

  if (S.currentStep < STEPS.length - 1) {
    S.currentStep++;
    renderStep(S.currentStep);
  } else {
    startProcessing();
  }
}

/*GATE CHOICE*/
function gateChoice(gateId, choice) {
  S.answers[gateId + '_choice'] = choice;
  if (gateId === 'gate_psych' && choice === 'yes') { rebuildSteps(); renderStepDots(); }
  if (gateId === 'gate_sexual' && choice === 'yes') { rebuildSteps(); renderStepDots(); }
  if (gateId === 'gate_sleep') { S.flags.sleepDeepDive = (choice === 'yes'); }
  if (S.currentStep < STEPS.length - 1) {
    S.currentStep++;
    renderStep(S.currentStep);
  } else {
    startProcessing();
  }
}

/*ANSWER SETTERS*/
function setAns(key, val)    { S.answers[key] = val; }
function setAnsNum(key, val) { S.answers[key] = parseFloat(val) || 0; }

function toggleCard(key, val, el) {
  S.answers[key] = val;
  el.parentElement.querySelectorAll('.card-opt').forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
}
function setLikert(key, val, btn) {
  S.answers[key] = val;
  btn.closest('.likert-scale').querySelectorAll('.likert-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
}
function setRadio(key, val, opt) {
  S.answers[key] = val;
  opt.closest('.radio-group').querySelectorAll('.radio-opt').forEach(function(o) { o.classList.remove('selected'); });
  opt.classList.add('selected');
}

/*BMI CALCULATION*/
function calcBMI() {
  var h = parseFloat(S.answers.height_cm) || 0;
  var w = parseFloat(S.answers.weight_kg) || 0;
  if (h > 0 && w > 0) {
    var bmi = w / ((h / 100) * (h / 100));
    S.answers.bmi = bmi;
    var d = document.getElementById('bmi-display');
    if (d) {
      d.style.display = 'block';
      d.textContent = 'BMI: ' + bmi.toFixed(1) + ' kg/m²  (' + (bmi < 18.5 ? 'Underweight' : bmi < 23 ? 'Normal' : bmi < 27.5 ? 'Overweight' : 'Obese') + ')';
    }
  }
}

/*COMORBIDITY SETTER*/
function setComordiity(name, val, cardId) {
  if (!S.answers.comorbidities) S.answers.comorbidities = {};
  S.answers.comorbidities[name] = val;
  var card = document.getElementById(cardId);
  if (!card) return;
  var cols = { No:'#2E7D32', Controlled:'#E65100', Uncontrolled:'#C62828', 'Not Sure':'#5C6BC0' };
  card.querySelectorAll('div[onclick]').forEach(function(b) {
    var m = b.getAttribute('onclick').match(/'([^']+)','([^']+)'/);
    if (!m) return;
    var bval = m[1]; var col = cols[bval]; var sel = bval === val;
    b.style.borderColor = sel ? col : '#E5E7EB';
    b.style.background  = sel ? col + '20' : '#fff';
    b.style.color       = sel ? col : '#9CA3AF';
  });
  card.style.borderColor = (val && val !== 'No') ? (cols[val] || '#E65100') : '#E5E7EB';
}

/*WEARABLE SETTERS*/
function setWFld(k, v) {
  if (!S.answers.wearable_data) S.answers.wearable_data = {};
  S.answers.wearable_data[k] = parseFloat(v) || v;
}
function toggleWearableInputs(d) {
  var el = document.getElementById('wearable-inputs');
  if (el) el.style.display = (d && d !== 'None / No wearable') ? 'block' : 'none';
}

/*GYNE HARD STOP*/
function showGyneHardStop() {
  S.flags.gyneRedFlag = true;
  showScreen('gyne-stop-screen');
  var flagList = S.redFlagsTriggered.map(function(f) { return '<li>'+f+'</li>'; }).join('');
  document.getElementById('gyne-stop-body').innerHTML =
    '<div class="hard-stop-card">' +
    '<span class="hs-icon">🏥</span>' +
    '<h2>Immediate Gynaecology Consultation Required</h2>' +
    '<p>Your responses indicate symptoms that require prompt medical evaluation.</p>' +
    '<div class="hs-flags"><strong>Symptoms flagged:</strong><ul>'+flagList+'</ul></div>' +
    '<a href="tel:+918069050000" style="display:block;background:var(--rose-deep);color:#fff;text-align:center;padding:14px 20px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:8px">📞 Call EvaEraHealth Clinic: +91 80690 50000</a>' +
    '<a href="mailto:clinic@evaerahealth.in?subject=Urgent+Gynaecology+Consultation" style="display:block;background:var(--teal);color:#fff;text-align:center;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;margin-bottom:20px">✉️ clinic@evaerahealth.in</a>' +
    '<button onclick="overrideGyneStop()" style="background:linear-gradient(135deg,var(--rose-deep),var(--rose));color:#fff;border:none;padding:14px 28px;border-radius:24px;font-size:15px;font-weight:700;cursor:pointer;width:100%;margin-bottom:10px">→ Continue Assessment (Red Flag Retained)</button>' +
    '<button onclick="startProcessing()" style="background:transparent;color:var(--teal);border:1.5px solid var(--teal);padding:10px 24px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;width:100%">📋 View Partial Wellness Report</button>' +
    '</div>';
}

function overrideGyneStop() {
  showScreen('form-screen');
  S.currentStep++;
  if (S.currentStep >= STEPS.length) { startProcessing(); return; }
  renderStepDots(); renderStep(S.currentStep); updateDots();
}

/*PSYCHIATRIC HARD STOP*/
function showPsychiatricHardStop() {
  showScreen('psych-stop-screen');
  document.getElementById('psych-stop-body').innerHTML =
    '<div class="hard-stop-card">' +
    '<span class="hs-icon">💙</span>' +
    '<h2>You Are Not Alone</h2>' +
    '<p>You mentioned thoughts about self-harm. Please reach out for immediate support.</p>' +
    '<div class="crisis-box"><h3>🆘 Immediate Support Lines</h3>' +
    '<div class="crisis-num">iCall: <a href="tel:9152987821" style="color:var(--danger)">9152987821</a></div>' +
    '<p>Vandrevala Foundation 24/7: <strong><a href="tel:18602662345" style="color:var(--danger)">1860-2662-345</a></strong></p>' +
    '<p>NIMHANS Helpline: <strong><a href="tel:08046110007" style="color:var(--danger)">080-46110007</a></strong></p>' +
    '</div>' +
    '<a href="tel:+918069050000" style="display:block;background:#6A1B9A;color:#fff;text-align:center;padding:14px 20px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:8px">📞 EvaEraHealth Clinic: +91 80690 50000</a>' +
    '<button onclick="overridePsychStop()" style="background:linear-gradient(135deg,#4A148C,#7B1FA2);color:#fff;border:none;padding:14px 28px;border-radius:24px;font-size:15px;font-weight:700;cursor:pointer;width:100%;margin-bottom:10px">→ Continue Assessment (Crisis Flag Retained)</button>' +
    '<button onclick="startProcessing()" style="background:transparent;color:var(--teal);border:1.5px solid var(--teal);padding:10px 24px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;width:100%">📋 View Partial Wellness Report</button>' +
    '</div>';
}

function overridePsychStop() {
  showScreen('form-screen');
  S.psychiatricHardStop = true;
  S.currentStep++;
  if (S.currentStep >= STEPS.length) { startProcessing(); return; }
  renderStepDots(); renderStep(S.currentStep); updateDots();
}

/*PROCESSING / LOADING*/
function startProcessing() {
  showScreen('loading-screen');
  setTimeout(function() {
    S.scores = computeScores();
    S.scores.menqolPsychTriggered  = S.flags.menqolPsychTriggered  ? 1 : 0;
    S.scores.menqolSexualTriggered = S.flags.menqolSexualTriggered ? 1 : 0;
    S.scores.sleepModerate         = S.flags.sleepModerate         ? 1 : 0;
    S.scores.gyneRedFlag           = S.flags.gyneRedFlag           ? 1 : 0;
    S.triage = runRuleEngine(S.scores);
    S.psychiatricAlert = S.triage.some(function(t) { return t.action === 'psychiatric_alert'; });
    saveResult();
    setTimeout(function() { showResults(); }, 1500);
  }, 3000);
}

/*STEP SUMMARY (for review modal)*/
function buildStepSummary(stepId) {
  var a = S.answers; var lines = [];
  if (stepId === 'demographics') {
    var flds = [['name','Name'],['age','Age','years'],['city','City'],['stage','Stage']];
    flds.forEach(function(f) { if (a[f[0]] !== undefined && a[f[0]] !== '') lines.push({l:f[1], v:a[f[0]]+(f[2]?' '+f[2]:'')});});
    if (a.height_cm && a.weight_kg) { var bmi = a.weight_kg / ((a.height_cm/100)*(a.height_cm/100)); lines.push({l:'BMI', v:bmi.toFixed(1)+' kg/m²'}); }
  } else if (stepId === 'red_flags') {
    var rfOpts = [['No','Yes','Not sure'],['No','Occasionally','Frequently'],['No','Yes']];
    var rfQ    = ['Unusual vaginal bleeding','Persistent pelvic pain','Breast changes'];
    ['rf1','rf2','rf3'].forEach(function(id, i) { if (a[id] !== undefined) { var v = rfOpts[i][a[id]]||'-'; lines.push({l:rfQ[i], v:v, flag:v==='Yes'||v==='Frequently'}); }});
  } else if (stepId.startsWith('menqol_')) {
    var kMap = { menqol_vasomotor:['mq_v1','mq_v2','mq_v3','mq_v4','mq_v5','mq_v6'], menqol_physical:['mq_p1','mq_p2','mq_p3','mq_p4','mq_p5','mq_p6','mq_p7','mq_p8'], menqol_psychosocial:['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'], menqol_sexual:['mq_s1','mq_s2','mq_s3'] };
    var qMap = { menqol_vasomotor:['Hot flushes','Night sweats','Sweating','Feeling flushed','Chills','Heart racing'], menqol_physical:['Aches & pains','Feel tired','Poor sleep','Decreased fitness','Bloating','Low backache','Urinary frequency','Vaginal dryness'], menqol_psychosocial:['Low patience','Anxious/nervous','Memory lapses','Low confidence','Mood changes','Feeling depressed','Want to be alone'], menqol_sexual:['Vaginal dryness (sex)','Avoid intimacy','Low interest'] };
    var qs = qMap[stepId]||[]; var ks = kMap[stepId]||[];
    qs.forEach(function(q, i) { var v = a[ks[i]]; if (v !== undefined) lines.push({l:q, v:v+'/8 '+(v<=3?'Low':v<=5?'Moderate':'High'), flag:v>=6}); });
  } else if (stepId === 'mental_health') {
    var phqQ = ['Little interest','Feeling down','Sleep problems','Tired','Appetite','Feel bad','Concentration','Slowed','Self-harm thoughts'];
    phqQ.forEach(function(q, i) { var v = a['phq_'+i]; if (v !== undefined) lines.push({l:'PHQ: '+q, v:['Never','Few days','>Half days','Nearly daily'][v]||v, flag:i===8&&v>0}); });
  } else if (stepId === 'sleep') {
    var isiQ = ['Falling asleep','Staying asleep','Waking early','Satisfaction','Others notice','Worry','Daytime impact'];
    isiQ.forEach(function(q, i) { var v = a['isi_'+i]; if (v !== undefined) lines.push({l:q, v:v+'/4'}); });
  } else if (stepId === 'psychosexual') {
    lines.push({l:'FSFI (19 items)', v:'Completed'});
    lines.push({l:'FSDSR (13 items)', v:'Completed'});
    lines.push({l:'Relationship (5 items)', v:'Completed'});
  } else if (stepId === 'prakriti') {
    if (a.prakriti) lines.push({l:'Your Prakriti', v:a.prakriti});
  } else if (stepId === 'vikriti') {
    if (a.vikriti) lines.push({l:'Your Vikriti', v:a.vikriti.replace(/_/g,' ')});
  } else if (stepId === 'wearable_data') {
    if (!a.wearable || a.wearable === 'None / No wearable') { lines.push({l:'Device', v:'None'}); }
    else { var wd = a.wearable_data||{}; lines.push({l:'Device', v:a.wearable}); if (wd.avg_rhr) lines.push({l:'Resting HR', v:wd.avg_rhr+' bpm'}); if (wd.avg_sleep) lines.push({l:'Avg Sleep', v:wd.avg_sleep+'h'}); }
  } else if (stepId === 'comorbidities') {
    var comor = a.comorbidities||{};
    var active = Object.entries(comor).filter(function(e) { return e[1] && e[1] !== 'No'; });
    if (active.length) active.forEach(function(e) { lines.push({l:e[0], v:e[1], flag:e[1]==='Uncontrolled'}); });
    else lines.push({l:'Comorbidities', v:'None reported'});
  } else {
    lines.push({l:'Status', v:'Responses recorded'});
  }
  if (!lines.length) lines.push({l:'Status', v:'All responses recorded'});
  return '<div style="max-height:300px;overflow-y:auto">' +
    lines.map(function(l) {
      var col = l.flag ? '#C62828' : '#1E3A5F';
      return '<div style="display:flex;justify-content:space-between;padding:7px 2px;border-bottom:1px solid #F0F0F0"><span style="font-size:12px;color:#555;flex:1">'+l.l+'</span><span style="font-size:13px;font-weight:700;color:'+col+';margin-left:12px">'+l.v+'</span></div>';
    }).join('') +
    '</div><div style="margin-top:10px;padding:8px 12px;background:#FFF8E7;border-radius:8px;font-size:11px;color:#795548;text-align:center">✏️ Click <strong>← Edit</strong> to change any answer before confirming</div>';
}
