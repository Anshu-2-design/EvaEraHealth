'use strict';

/*PRAKRITI WEIGHTS*/
var PRAKRITI_WEIGHTS = {
  'Vata':       { vm:0.22, ph:0.18, ps:0.28, sx:0.28, mh:0.28, sl:0.28, se:0.25, li:0.20 },
  'Pitta':      { vm:0.30, ph:0.25, ps:0.20, sx:0.18, mh:0.22, sl:0.18, se:0.22, li:0.18 },
  'Kapha':      { vm:0.20, ph:0.22, ps:0.18, sx:0.20, mh:0.18, sl:0.20, se:0.20, li:0.25 },
  'Vata-Pitta': { vm:0.26, ph:0.22, ps:0.24, sx:0.23, mh:0.25, sl:0.23, se:0.22, li:0.19 },
  'Tridosha':   { vm:0.25, ph:0.22, ps:0.20, sx:0.20, mh:0.22, sl:0.20, se:0.22, li:0.20 }
};

/*EVR DECISION RULES*/
var EVR_RULES = [
  {id:"EVR_VM01",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:7,    sev:"mild",     action:"recommend_menopause_program"},
  {id:"EVR_VM02",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:14,   sev:"moderate", action:"recommend_menopause_program"},
  {id:"EVR_VM03",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:14,   sev:"moderate", action:"gurugram_clinic"},
  {id:"EVR_VM04",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:17,   sev:"severe",   action:"gurugram_clinic"},
  {id:"EVR_VM05",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:10,   sev:"mild",     action:"exercise_program"},
  {id:"EVR_VM06",dom:"vasomotor",    inst:"MENQOL_vasomotor",    op:">=",thresh:10,   sev:"moderate", action:"nutrition_guidance"},
  {id:"EVR_PH01",dom:"physical",     inst:"MENQOL_physical",     op:">=",thresh:7,    sev:"mild",     action:"exercise_program"},
  {id:"EVR_PH02",dom:"physical",     inst:"MENQOL_physical",     op:">=",thresh:14,   sev:"moderate", action:"exercise_program"},
  {id:"EVR_PH03",dom:"physical",     inst:"MENQOL_physical",     op:">=",thresh:14,   sev:"moderate", action:"nutrition_guidance"},
  {id:"EVR_PH04",dom:"physical",     inst:"MENQOL_physical",     op:">=",thresh:14,   sev:"moderate", action:"recommend_menopause_program"},
  {id:"EVR_PH05",dom:"physical",     inst:"MENQOL_physical",     op:">=",thresh:17,   sev:"severe",   action:"gurugram_clinic"},
  {id:"EVR_PS01",dom:"psychosocial", inst:"MENQOL_psychosocial", op:">=",thresh:7,    sev:"mild",     action:"stress_management_program"},
  {id:"EVR_PS02",dom:"psychosocial", inst:"MENQOL_psychosocial", op:">=",thresh:14,   sev:"moderate", action:"stress_management_program"},
  {id:"EVR_PS03",dom:"psychosocial", inst:"MENQOL_psychosocial", op:">=",thresh:14,   sev:"moderate", action:"psychologist_referral"},
  {id:"EVR_PS04",dom:"psychosocial", inst:"MENQOL_psychosocial", op:">=",thresh:17,   sev:"severe",   action:"psychologist_referral"},
  {id:"EVR_SX01",dom:"sexual",       inst:"MENQOL_sexual",       op:">=",thresh:7,    sev:"mild",     action:"sexual_wellbeing_program"},
  {id:"EVR_SX02",dom:"sexual",       inst:"MENQOL_sexual",       op:">=",thresh:14,   sev:"moderate", action:"sexual_wellbeing_program"},
  {id:"EVR_SX03",dom:"sexual",       inst:"MENQOL_sexual",       op:">=",thresh:14,   sev:"moderate", action:"activate_psychosexual_module"},
  {id:"EVR_SX04",dom:"sexual",       inst:"MENQOL_sexual",       op:">=",thresh:17,   sev:"severe",   action:"sexual_therapy_pathway"},
  {id:"EVR_PHQ01",dom:"depression",  inst:"PHQ9",                op:">=",thresh:5,    sev:"mild",     action:"stress_management_program"},
  {id:"EVR_PHQ02",dom:"depression",  inst:"PHQ9",                op:">=",thresh:10,   sev:"moderate", action:"stress_management_program"},
  {id:"EVR_PHQ03",dom:"depression",  inst:"PHQ9",                op:">=",thresh:10,   sev:"moderate", action:"psychologist_referral"},
  {id:"EVR_PHQ04",dom:"depression",  inst:"PHQ9",                op:">=",thresh:15,   sev:"severe",   action:"psychologist_referral"},
  {id:"EVR_PHQ05",dom:"depression",  inst:"PHQ9",                op:">=",thresh:15,   sev:"severe",   action:"gurugram_clinic"},
  {id:"EVR_GAD01",dom:"anxiety",     inst:"GAD7",                op:">=",thresh:5,    sev:"mild",     action:"stress_management_program"},
  {id:"EVR_GAD02",dom:"anxiety",     inst:"GAD7",                op:">=",thresh:10,   sev:"moderate", action:"stress_management_program"},
  {id:"EVR_GAD03",dom:"anxiety",     inst:"GAD7",                op:">=",thresh:10,   sev:"moderate", action:"psychologist_referral"},
  {id:"EVR_GAD04",dom:"anxiety",     inst:"GAD7",                op:">=",thresh:15,   sev:"severe",   action:"psychologist_referral"},
  {id:"EVR_PSS01",dom:"stress",      inst:"PSS8",                op:">=",thresh:11,   sev:"mild",     action:"stress_management_program"},
  {id:"EVR_PSS02",dom:"stress",      inst:"PSS8",                op:">=",thresh:21,   sev:"moderate", action:"stress_management_program"},
  {id:"EVR_PSS03",dom:"stress",      inst:"PSS8",                op:">=",thresh:21,   sev:"moderate", action:"exercise_program"},
  {id:"EVR_PSS04",dom:"stress",      inst:"PSS8",                op:">=",thresh:21,   sev:"moderate", action:"nutrition_guidance"},
  {id:"EVR_ISI01",dom:"sleep",       inst:"ISI",                 op:">=",thresh:8,    sev:"mild",     action:"sleep_recovery_program"},
  {id:"EVR_ISI02",dom:"sleep",       inst:"ISI",                 op:">=",thresh:15,   sev:"moderate", action:"sleep_recovery_program"},
  {id:"EVR_ISI03",dom:"sleep",       inst:"ISI",                 op:">=",thresh:22,   sev:"severe",   action:"sleep_recovery_program"},
  {id:"EVR_ISI04",dom:"sleep",       inst:"ISI",                 op:">=",thresh:15,   sev:"moderate", action:"gurugram_clinic"},
  {id:"EVR_FSD01",dom:"sexual_distress", inst:"FSDSR",           op:">=",thresh:11,   sev:"mild",     action:"sexual_wellbeing_program"},
  {id:"EVR_FSD02",dom:"sexual_distress", inst:"FSDSR",           op:">=",thresh:26,   sev:"moderate", action:"sexual_therapy_pathway"},
  {id:"EVR_FSD03",dom:"sexual_distress", inst:"FSDSR",           op:">=",thresh:41,   sev:"severe",   action:"sexual_therapy_pathway"},
  {id:"EVR_FSD04",dom:"sexual_distress", inst:"FSDSR",           op:">=",thresh:26,   sev:"moderate", action:"relationship_counselling"},
  {id:"EVR_FSF01",dom:"sexual_function", inst:"FSFI",            op:"<=",thresh:26.55,sev:"mild",     action:"sexual_wellbeing_program"},
  {id:"EVR_FSF02",dom:"sexual_function", inst:"FSFI",            op:"<=",thresh:20,   sev:"moderate", action:"sexual_therapy_pathway"},
  {id:"EVR_FSF03",dom:"sexual_function", inst:"FSFI",            op:"<=",thresh:10,   sev:"severe",   action:"sexual_therapy_pathway"},
  {id:"EVR_FSF04",dom:"sexual_function", inst:"FSFI",            op:"<=",thresh:20,   sev:"moderate", action:"relationship_counselling"},
  {id:"EVR_MCS01",dom:"relationship",    inst:"MCSS",            op:"<=",thresh:8,    sev:"mild",     action:"relationship_counselling"},
  {id:"EVR_MCS02",dom:"relationship",    inst:"MCSS",            op:"<=",thresh:8,    sev:"mild",     action:"sexual_wellbeing_program"},
  {id:"EVR_MCS03",dom:"relationship",    inst:"MCSS",            op:"<=",thresh:5,    sev:"moderate", action:"relationship_counselling"},
  {id:"EVR_MCS04",dom:"relationship",    inst:"MCSS",            op:"<=",thresh:3,    sev:"severe",   action:"psychologist_referral"},
  {id:"EVR_CMP01",dom:"composite",       inst:"composite",       op:">=",thresh:31,   sev:"mild",     action:"recommend_menopause_program"},
  {id:"EVR_CMP02",dom:"composite",       inst:"composite",       op:">=",thresh:61,   sev:"moderate", action:"gurugram_clinic"},
  {id:"EVR_CMP03",dom:"composite",       inst:"composite",       op:">=",thresh:81,   sev:"severe",   action:"gurugram_clinic"},
];

/*CORE CLINICAL RULES*/
var CORE_RULES = [
  { id:"R1", condition:function(sc){ return sc.PHQ9_item9 > 0; },                                                                                    action:"psychiatric_alert",      sev:"severe"   },
  { id:"R2", condition:function(sc){ return sc.FSFI6!==null&&sc.FSFI6!==undefined&&sc.FSDSR!==null&&sc.FSDSR!==undefined&&sc.FSFI6<=19&&sc.FSDSR>=11; }, action:"sexual_therapy_pathway", sev:"moderate" },
  { id:"R3", condition:function(sc){ return sc.MENQOL_sexual > 6; },                                                                                 action:"activate_psychosexual_module", sev:"mild" },
  { id:"R4", condition:function(sc){ return sc.rf1 === 'Yes'; },                                                                                      action:"gynecology_referral",    sev:"severe"   }
];

/*COMORBIDITY TABLE*/
var COMORBIDITY_TABLE = {
  'Hypertension':        { Controlled:8,  Uncontrolled:16 },
  'Diabetes':            { Controlled:10, Uncontrolled:18 },
  'Hypothyroidism':      { Controlled:6,  Uncontrolled:12 },
  'Hyperthyroidism':     { Controlled:4,  Uncontrolled:8  },
  'Hyperlipidemia':      { Controlled:5,  Uncontrolled:10 },
  'Anaemia':             { Controlled:4,  Uncontrolled:8  },
  'PCOD':                { Controlled:10, Uncontrolled:10 },
  'Osteoporosis':        { Controlled:8,  Uncontrolled:8  },
  'Heart Disease':       { Controlled:14, Uncontrolled:14 },
  'CKD':                 { Controlled:10, Uncontrolled:10 },
  'Autoimmune Disorder': { Controlled:8,  Uncontrolled:8  },
  'Stroke (history)':    { Controlled:12, Uncontrolled:12 },
  'Cancer (history)':    { Controlled:12, Uncontrolled:12 },
};

/*HELPER: AVERAGE*/
function avg(keys, a) {
  var sum = 0;
  keys.forEach(function(k) { sum += (a[k] || 1); });
  return sum / keys.length;
}

/*COMORBIDITY MODIFIER*/
function calcComorbidityMod(comor) {
  var mod = 0;
  Object.keys(comor || {}).forEach(function(cond) {
    var status = comor[cond];
    if (COMORBIDITY_TABLE[cond] && COMORBIDITY_TABLE[cond][status]) {
      mod += COMORBIDITY_TABLE[cond][status];
    }
  });
  return mod;
}

/*MENQOL DOMAIN SCORE*/
function computeMenQOLDomain(keys, maxRaw) {
  var n = keys.length;
  var total = keys.reduce(function(s, k) { return s + (S.answers[k] || 1); }, 0);
  return Math.round((total - n) / (maxRaw - n) * 20);
}

/*COMPUTE ALL SCORES*/
function computeScores() {
  var a = S.answers;
  var sc = {};
  var vm = ['mq_v1','mq_v2','mq_v3','mq_v4','mq_v5','mq_v6'];
  var ph = ['mq_p1','mq_p2','mq_p3','mq_p4','mq_p5','mq_p6','mq_p7','mq_p8'];
  var ps = ['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'];
  var sx = ['mq_s1','mq_s2','mq_s3'];

  sc.MENQOL_vasomotor    = Math.round(avg(vm, a) / 8 * 20);
  sc.MENQOL_physical     = Math.round(avg(ph, a) / 8 * 20);
  sc.MENQOL_psychosocial = Math.round(avg(ps, a) / 8 * 20);
  sc.MENQOL_sexual       = Math.round(avg(sx, a) / 8 * 20);

  sc.PHQ9 = 0;
  for (var i = 0; i < 9; i++) sc.PHQ9 += (a['phq_' + i] || 0);
  sc.PHQ9_item9 = a['phq_8'] || 0;
  sc.PHQ9_band = sc.PHQ9 <= 4 ? 'Minimal' : sc.PHQ9 <= 9 ? 'Mild' : sc.PHQ9 <= 14 ? 'Moderate' : sc.PHQ9 <= 19 ? 'Moderately Severe' : 'Severe';

  sc.GAD7 = 0;
  for (var i = 0; i < 7; i++) sc.GAD7 += (a['gad_' + i] || 0);
  sc.GAD7_band = sc.GAD7 <= 4 ? 'Minimal' : sc.GAD7 <= 9 ? 'Mild' : sc.GAD7 <= 14 ? 'Moderate' : 'Severe';

  var pssReverse = [false, false, false, true, true, true, true, false];
  sc.PSS8 = 0;
  for (var i = 0; i < 8; i++) {
    var raw = a['pss_' + i] !== undefined ? a['pss_' + i] : 2;
    sc.PSS8 += pssReverse[i] ? (4 - raw) : raw;
  }
  sc.PSS8_band = sc.PSS8 <= 10 ? 'Low' : sc.PSS8 <= 20 ? 'Moderate' : 'High';

  sc.ISI = 0;
  for (var i = 0; i < 7; i++) sc.ISI += (a['isi_' + i] || 0);
  sc.ISI_band = sc.ISI <= 7 ? 'None' : sc.ISI <= 14 ? 'Subthreshold' : sc.ISI <= 21 ? 'Moderate' : 'Severe';

  if (!a.psychosexual_skipped) {
    var fsfi_desire       = ((a['fsfi_1']||0)  + (a['fsfi_2']||0))  * 0.6;
    var fsfi_arousal      = ((a['fsfi_3']||0)  + (a['fsfi_4']||0)  + (a['fsfi_5']||0)  + (a['fsfi_6']||0))  * 0.3;
    var fsfi_lubrication  = ((a['fsfi_7']||0)  + (a['fsfi_8']||0)  + (a['fsfi_9']||0)  + (a['fsfi_10']||0)) * 0.3;
    var fsfi_orgasm       = ((a['fsfi_11']||0) + (a['fsfi_12']||0) + (a['fsfi_13']||0)) * 0.4;
    var fsfi_satisfaction = ((a['fsfi_14']||0) + (a['fsfi_15']||0) + (a['fsfi_16']||0)) * 0.4;
    var fsfi_pain         = ((a['fsfi_17']||0) + (a['fsfi_18']||0) + (a['fsfi_19']||0)) * 0.4;
    sc.FSFI  = Math.round((fsfi_desire + fsfi_arousal + fsfi_lubrication + fsfi_orgasm + fsfi_satisfaction + fsfi_pain) * 10) / 10;
    sc.FSFI6 = Math.round(fsfi_pain * 10) / 10;
    sc.FSFI_band = sc.FSFI <= 26.55 ? 'Sexual Dysfunction' : 'Normal Function';
    sc.FSDSR = 0;
    for (var i = 0; i < 13; i++) sc.FSDSR += (a['fsdsr_' + i] || 0);
    sc.FSDSR_band = sc.FSDSR >= 11 ? 'Clinically Significant Distress' : 'No Significant Distress';
    sc.MCSS = 0;
    for (var i = 1; i <= 5; i++) sc.MCSS += (a['mcss_' + i] || 0);
    sc.MCSS_band = sc.MCSS <= 8 ? 'Poor' : sc.MCSS <= 14 ? 'Fair' : 'Good';
  } else {
    sc.FSFI = null; sc.FSFI6 = null; sc.FSDSR = null; sc.MCSS = null;
    sc.FSFI_band = 'Not assessed'; sc.FSDSR_band = 'Not assessed'; sc.MCSS_band = 'Not assessed';
  }

  sc.rf1 = a.rf1 === 1 ? 'Yes' : a.rf1 === 2 ? 'Not sure' : 'No';
  sc.rf2 = a.rf2 === 2 ? 'Frequently' : a.rf2 === 1 ? 'Occasionally' : 'No';
  sc.rf3 = a.rf3 === 1 ? 'Yes' : 'No';
  sc.comorbidityMod = calcComorbidityMod(a.comorbidities || {});

  var prakriti = a.prakriti || 'Tridosha';
  var W = PRAKRITI_WEIGHTS[prakriti] || PRAKRITI_WEIGHTS['Tridosha'];
  var menopauseN = (sc.MENQOL_vasomotor/20*0.35 + sc.MENQOL_physical/20*0.35 + sc.MENQOL_psychosocial/20*0.20 + sc.MENQOL_sexual/20*0.10);
  var mentalN    = (sc.PHQ9/27 * 0.55 + sc.GAD7/21 * 0.45);
  var sleepN     = sc.ISI / 28;
  var stressN    = sc.PSS8 / 32;
  var sexualN    = sc.FSFI !== null ? Math.max(0, Math.min(1, (1 - sc.FSFI/36)*0.5 + (sc.FSDSR/52)*0.5)) : stressN;
  var lifestyleN = 0.1;
  var prakritiMul = { menopause: W.vm + W.ph, mental: W.mh, sleep: W.sl, sexual: W.se, lifestyle: W.li, stress: 1.0 };
  var raw =
    (menopauseN * 0.30 * (prakritiMul.menopause / 0.40)) +
    (mentalN    * 0.25 * (prakritiMul.mental    / 0.25)) +
    (sleepN     * 0.15 * (prakritiMul.sleep     / 0.20)) +
    (sexualN    * 0.15 * (prakritiMul.sexual    / 0.20)) +
    (stressN    * 0.05) +
    (lifestyleN * 0.10);
  sc.composite = Math.max(0, Math.min(100, Math.round(raw * 100 + sc.comorbidityMod * 0.3)));
  sc.composite_band = sc.composite <= 30 ? 'Mild' : sc.composite <= 60 ? 'Moderate' : sc.composite <= 80 ? 'Severe' : 'Critical';
  return sc;
}

/*RULE ENGINE*/
function runRuleEngine(scores) {
  var triggered = {};
  var sevOrder  = { severe:3, moderate:2, mild:1 };

  EVR_RULES.forEach(function(rule) {
    var v = scores[rule.inst];
    if (v === undefined || v === null) return;
    var fired = rule.op === '>=' ? v >= rule.thresh : v <= rule.thresh;
    if (fired) {
      if (!triggered[rule.action]) triggered[rule.action] = { sev:'mild', rules:[] };
      triggered[rule.action].rules.push(rule.id + '(' + rule.dom + ')');
      if (sevOrder[rule.sev] > sevOrder[triggered[rule.action].sev]) triggered[rule.action].sev = rule.sev;
    }
  });

  CORE_RULES.forEach(function(rule) {
    if (rule.condition(scores)) {
      if (!triggered[rule.action]) triggered[rule.action] = { sev:rule.sev, rules:[] };
      triggered[rule.action].rules.push(rule.id);
      if (sevOrder[rule.sev] > sevOrder[triggered[rule.action].sev]) triggered[rule.action].sev = rule.sev;
    }
  });

  if (scores.rf1 === 'Yes' || scores.rf3 === 'Yes' || scores.rf2 === 'Frequently') {
    if (!triggered['gynecology_referral']) triggered['gynecology_referral'] = { sev:'severe', rules:[] };
    triggered['gynecology_referral'].sev = 'severe';
    triggered['gynecology_referral'].rules.push('RED_FLAG');
  }
  if (scores.PHQ9_item9 > 0) {
    triggered['psychiatric_alert'] = { sev:'severe', rules:['R1_PHQ9_ITEM9'] };
  }

  var result = Object.entries(triggered).map(function(e) { return { action:e[0], sev:e[1].sev, rules:e[1].rules }; });
  result.sort(function(a, b) { return sevOrder[b.sev] - sevOrder[a.sev]; });
  return result;
}

/*RED FLAG CHECK*/
function checkRedFlags() {
  var a = S.answers;
  var opts = [['No','Yes','Not sure'], ['No','Occasionally','Frequently'], ['No','Yes']];
  S.redFlagsTriggered = [];
  if (a.rf1 !== undefined && opts[0][a.rf1] === 'Yes')         S.redFlagsTriggered.push('Unusual vaginal bleeding');
  if (a.rf2 !== undefined && opts[1][a.rf2] === 'Frequently')  S.redFlagsTriggered.push('Persistent pelvic pain');
  if (a.rf3 !== undefined && opts[2][a.rf3] === 'Yes')         S.redFlagsTriggered.push('Breast changes');
}
