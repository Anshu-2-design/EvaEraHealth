/*Global State & Step Definitions*/

'use strict';

/*GLOBAL STATE*/
var S = {
  portal: 'user', authMode: 'login', authId: '',
  session: null, consentGiven: false, consentData: {}, consentTimestamp: '',
  currentStep: 0,
  answers: {},
  scores: {},
  triage: [],
  flags: {
    menqolPsychTriggered:    false,
    menqolSexualTriggered:   false,
    sleepModerate:           false,
    sleepSevere:             false,
    gyneRedFlag:             false,
    mentalHealthCompleted:   false,
    psychosexualCompleted:   false,
    sleepDeepDive:           false,
  },
  redFlagsTriggered:  [],
  psychiatricAlert:   false,
  psychiatricHardStop: false,
  selectedPatient:    null,
  patients:           []
};

/*BASE STEPS*/
var BASE_STEPS = [
  { id:'demographics',        title:'About You',                  icon:'👩',  subtitle:'Help us personalise your care pathway' },
  { id:'red_flags',           title:'Clinical Safety Screen',     icon:'🔍',  subtitle:'A few important safety questions — please answer honestly' },
  { id:'menqol_vasomotor',    title:'Vasomotor Symptoms',         icon:'🌡️', subtitle:'Hot flushes, night sweats and related symptoms — past 4 weeks (1=Not at all · 8=Extremely)' },
  { id:'menqol_physical',     title:'Physical Symptoms',          icon:'🏃‍♀️', subtitle:'Physical discomforts over the past 4 weeks (1=Not at all · 8=Extremely)' },
  { id:'menqol_psychosocial', title:'Emotional Wellbeing',        icon:'💜',  subtitle:'Emotional and psychological experiences — past 4 weeks (1=Not at all · 8=Extremely)' },
  { id:'menqol_sexual',       title:'Intimate Wellbeing',         icon:'🌺',  subtitle:'Intimate health experiences — past 4 weeks (1=Not at all · 8=Extremely)' },
  { id:'sleep',               title:'Sleep Quality',              icon:'🌙',  subtitle:'Rate your sleep difficulties over the past 2 weeks' },
  { id:'prakriti',            title:'Ayurvedic Constitution',     icon:'🌿',  subtitle:'Your Prakriti type — choose the description that fits you most naturally' },
  { id:'vikriti',             title:'Current Imbalance',          icon:'⚖️',  subtitle:'Your Vikriti — how you feel right now, your current state' },
  { id:'wearable_data',       title:'Wearable Health Data',       icon:'⌚',  subtitle:'Enter recent data from your wearable device (all fields optional)' },
  { id:'comorbidities',       title:'Health Conditions',          icon:'🏥',  subtitle:'Please indicate any existing health conditions and their management status' },
];

/*GATE & CONDITIONAL STEPS*/
var GATE_PSYCH   = { id:'gate_psych',    title:'Mental Health Check-In',     icon:'🧠', subtitle:'', isGate:true };
var GATE_SEXUAL  = { id:'gate_sexual',   title:'Sexual Wellbeing Check-In',  icon:'💙', subtitle:'', isGate:true };
var GATE_SLEEP   = { id:'gate_sleep',    title:'Sleep Programme',            icon:'😴', subtitle:'', isGate:true };
var STEP_MENTAL  = { id:'mental_health', title:'Mental Health Assessment',   icon:'🧠', subtitle:'Over the past 2 weeks, how often have you been bothered by the following?' };
var STEP_PSYCHOSEXUAL = { id:'psychosexual', title:'Sexual Wellbeing — Full Assessment', icon:'🔒', subtitle:'All responses are strictly confidential — DPDP Act 2023. Answer based on the past 4 weeks.' };

var STEPS = BASE_STEPS.slice();

/*CONSENT ITEMS*/
var CONSENT_ITEMS = [
  { id:'c1', title:'Health & Symptom Data',               desc:'Collection and processing of your menopause symptom data, clinical scores, and health metrics.',                  required:true,  badge:'Sensitive Data' },
  { id:'c2', title:'Wearable Device Data',                desc:'Optional integration of wearable device metrics for enhanced clinical insights.',                                  required:true,  badge:'Sensitive Data' },
  { id:'c3', title:'Ayurvedic & Lifestyle Profile',        desc:'Your Prakriti type, Vikriti, and lifestyle information for personalised recommendations.',                        required:true,  badge:'Required'       },
  { id:'c4', title:'AI Processing & Clinical Scoring',    desc:'Automated scoring using MenQOL, PHQ-9, GAD-7, ISI, PSS-8, FSFI, and FSDSR instruments.',                        required:true,  badge:'Required'       },
  { id:'c5', title:'Sharing with Healthcare Professionals', desc:'Sharing your anonymised or identified data with your consulting clinician.',                                    required:true,  badge:'Required'       },
  { id:'c6', title:'Anonymised Research Contribution',    desc:'Optional contribution to menopause research in India (de-identified data only).',                                required:false, badge:'Optional'       },
  { id:'c7', title:'Corporate Wellness Reporting',        desc:'If enrolled via employer, aggregate anonymised reporting to HR.',                                                  required:false, badge:'Optional'       },
];

/*REBUILD STEPS (called after gate triggers)*/
function rebuildSteps() {
  STEPS = [];
  BASE_STEPS.forEach(function(step) {
    STEPS.push(step);
    if (step.id === 'menqol_psychosocial') {
      if (S.flags.menqolPsychTriggered) {
        STEPS.push(GATE_PSYCH);
        if (S.flags.mentalHealthCompleted === false && S.answers.gate_psych_choice === 'yes') {
          STEPS.push(STEP_MENTAL);
        }
      }
    }
    if (step.id === 'menqol_sexual') {
      if (S.flags.menqolSexualTriggered) {
        STEPS.push(GATE_SEXUAL);
        if (S.flags.psychosexualCompleted === false && S.answers.gate_sexual_choice === 'yes') {
          STEPS.push(STEP_PSYCHOSEXUAL);
        }
      }
    }
    if (step.id === 'sleep') {
      if (S.flags.sleepModerate || S.flags.sleepSevere) {
        STEPS.push(GATE_SLEEP);
      }
    }
  });
}

/*SESSION PERSISTENCE*/
function saveSession()  { try { localStorage.setItem('evr_session_v7',  JSON.stringify(S.session));  } catch(e) {} }
function loadSession()  { try { var s = localStorage.getItem('evr_session_v7');  if(s) { S.session  = JSON.parse(s); return true; } } catch(e) {} return false; }
function savePatients() { try { localStorage.setItem('evr_patients_v7', JSON.stringify(S.patients)); } catch(e) {} }
function loadPatients() { try { var p = localStorage.getItem('evr_patients_v7'); if(p)  S.patients = JSON.parse(p); } catch(e) {} }

/*SCREEN MANAGER*/
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}
