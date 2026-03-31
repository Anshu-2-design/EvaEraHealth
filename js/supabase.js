'use strict';

/* ── YOUR SUPABASE CREDENTIALS ─────────────────────────────── */
var SUPABASE_URL  = 'https://cmrvpqaokmvqdqsgezsu.supabase.co';  // ← replace
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcnZwcWFva212cWRxc2dlenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5Mjg0MDUsImV4cCI6MjA5MDUwNDQwNX0.QJsrNrk3KvWjrfnpzZap2ld1HgAGLlpLw4RVKwe66EA';                 // ← replace
/* ─────────────────────────────────────────────────────────── */


/* ══════════════════════════════════════════════════════════
   SECTION 1 — CORE FETCH HELPER
   ══════════════════════════════════════════════════════════ */

async function sbFetch(table, method, body, query) {
  var url  = SUPABASE_URL + '/rest/v1/' + table + (query ? '?' + query : '');
  var opts = {
    method: method,
    headers: {
      'Content-Type':  'application/json',
      'apikey':         SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Prefer':        'return=representation'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    var res  = await fetch(url, opts);
    var data = await res.json();
    if (!res.ok) {
      console.error('[Supabase] ' + method + ' /' + table + ' error:', data);
      return null;
    }
    console.log('[Supabase] Saved to ' + table);
    return data;
  } catch (e) {
    console.error('[Supabase] Network error on ' + table + ':', e);
    return null;
  }
}


/* ══════════════════════════════════════════════════════════
   SECTION 2 — SAVE FUNCTIONS
   ══════════════════════════════════════════════════════════ */

async function sbSaveSession(session) {
  if (!session || !session.id) return;
  await sbFetch('sessions', 'POST', {
    session_id: session.id,
    auth_id:    session.authId || null,
    is_guest:   session.id.startsWith('guest_'),
    created_at: session.ts || new Date().toISOString()
  });
}

async function sbSaveConsent(session, consentData, consentTimestamp) {
  if (!session || !session.id) return;
  await sbFetch('consent_records', 'POST', {
    session_id:           session.id,
    consent_timestamp:    consentTimestamp || new Date().toISOString(),
    c1_health_data:       !!consentData.c1,
    c2_wearable_data:     !!consentData.c2,
    c3_ayurvedic_profile: !!consentData.c3,
    c4_ai_processing:     !!consentData.c4,
    c5_share_hcp:         !!consentData.c5,
    c6_research:          !!consentData.c6,
    c7_corporate:         !!consentData.c7
  });
}

async function sbSaveAssessment(patient) {
  if (!patient) return;
  var sc = patient.scores || {};
  await sbFetch('assessments', 'POST', {
    patient_ref:  patient.id,
    session_id:   patient.sessionId || null,
    submitted_at: patient.timestamp || new Date().toISOString(),

    patient_name:    patient.name    || null,
    age:             patient.age     || null,
    city:            patient.city    || null,
    menopause_stage: patient.stage   || null,
    prakriti:        patient.prakriti|| null,
    vikriti:         patient.vikriti || null,

    menqol_vasomotor:    sc.MENQOL_vasomotor    || 0,
    menqol_physical:     sc.MENQOL_physical     || 0,
    menqol_psychosocial: sc.MENQOL_psychosocial || 0,
    menqol_sexual:       sc.MENQOL_sexual       || 0,

    phq9_score: sc.PHQ9 || 0,  phq9_band: sc.PHQ9_band || null,
    gad7_score: sc.GAD7 || 0,  gad7_band: sc.GAD7_band || null,
    pss8_score: sc.PSS8 || 0,  pss8_band: sc.PSS8_band || null,

    isi_score: sc.ISI || 0,  isi_band: sc.ISI_band || null,

    fsfi_score:  sc.FSFI  != null ? sc.FSFI  : null,  fsfi_band:  sc.FSFI_band  || null,
    fsdsr_score: sc.FSDSR != null ? sc.FSDSR : null,  fsdsr_band: sc.FSDSR_band || null,
    mcss_score:  sc.MCSS  != null ? sc.MCSS  : null,  mcss_band:  sc.MCSS_band  || null,

    composite_score: sc.composite      || 0,
    composite_band:  sc.composite_band || null,
    comorbidity_mod: sc.comorbidityMod || 0,

    psychiatric_alert:       !!patient.psychiatricAlert,
    gyne_red_flag:           !!(patient.flags && patient.flags.gyneRedFlag),
    menqol_psych_triggered:  !!(patient.flags && patient.flags.menqolPsychTriggered),
    menqol_sexual_triggered: !!(patient.flags && patient.flags.menqolSexualTriggered),
    sleep_module_triggered:  !!(patient.flags && patient.flags.sleepModerate),
    mental_health_completed: !!(patient.flags && patient.flags.mentalHealthCompleted),
    psychosexual_completed:  !!(patient.flags && patient.flags.psychosexualCompleted),

    red_flags:          JSON.stringify(patient.redFlags      || []),
    triage_json:        JSON.stringify(patient.triage        || []),
    comorbidities_json: JSON.stringify(patient.comorbidities || {}),
    wearable_json:      JSON.stringify(patient.wearable      || null)
  });
}


/* ══════════════════════════════════════════════════════════
   SECTION 3 — HOOK INTO EXISTING FUNCTIONS
   (safe because this script loads after all others)
   ══════════════════════════════════════════════════════════ */

/* 3a. verifyOTP */
var _origVerifyOTP = verifyOTP;
verifyOTP = function () {
  var digits = Array.from(
    document.querySelectorAll('#auth-screen .otp-digit')
  ).map(function (i) { return i.value; }).join('');
  if (digits === '1234') {
    S.session = { id: 'user_' + Date.now(), ts: new Date().toISOString(), authId: S.authId };
    saveSession();
    sbSaveSession(S.session);
    showConsent();
  } else {
    alert('Invalid OTP. Demo OTP is 1234');
  }
};

/* 3b. startGuest */
var _origStartGuest = startGuest;
startGuest = function () {
  S.session = { id: 'guest_' + Date.now(), ts: new Date().toISOString() };
  sbSaveSession(S.session);
  showConsent();
};

/* 3c. proceedAfterConsent */
var _origProceedAfterConsent = proceedAfterConsent;
proceedAfterConsent = function () {
  S.consentGiven     = true;
  S.consentTimestamp = new Date().toISOString();
  sbSaveConsent(S.session, S.consentData, S.consentTimestamp);
  startForm();
};

/* 3d. saveResult */
var _origSaveResult = saveResult;
saveResult = function () {
  _origSaveResult();
  var patient = S.patients[0];
  sbSaveAssessment(patient);
};

console.log('[Supabase] EvaEraHealth integration loaded & hooks active');