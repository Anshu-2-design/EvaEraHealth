'use strict';

// Run: ALTER TABLE <table> RENAME COLUMN old_name TO new_name;


/* CREDENTIALS */

var SUPABASE_URL  = 'https://ptaklkmacvyuvuespazj.supabase.co';       
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YWtsa21hY3Z5dXZ1ZXNwYXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzU4NzgsImV4cCI6MjA5MDc1MTg3OH0.5RUzGwYJjJSqKwzKRs69IQTwI9lJ-PahAiMV_0yDIY8';  


/* SECTION 0 — PAYLOAD BUILDERS */

/* Red flag answer label maps — form stores index, DB stores readable text */
var RF1_LABELS = ['No', 'Yes', 'Not sure'];
var RF2_LABELS = ['No', 'Occasionally', 'Frequently'];
var RF3_LABELS = ['No', 'Yes'];


/* TABLE: sessions*/
function buildSessionPayload(session) {
  return {
    session_id: session.id,
    auth_id:    session.authId || null,
    is_guest:   session.id.startsWith('guest_'),
    created_at: session.ts || new Date().toISOString()
  };
}


/* TABLE: consent_records */
function buildConsentPayload(session, consentData, consentTimestamp) {
  return {
    session_id:           session.id,
    consent_timestamp:    consentTimestamp || new Date().toISOString(),
    c1_health_data:       !!consentData.c1,
    c2_wearable_data:     !!consentData.c2,
    c3_ayurvedic_profile: !!consentData.c3,
    c4_ai_processing:     !!consentData.c4,
    c5_share_hcp:         !!consentData.c5,
    c6_research:          !!consentData.c6,
    c7_corporate:         !!consentData.c7
  };
}


/* TABLE: assessments */
function buildAssessmentPayload(patient) {
  var a  = patient.answers || {};   
  var co = a.comorbidities || {};   

  return {

    /* Identity */
    patient_ref:  patient.id,
    session_id:   patient.sessionId || null,
    submitted_at: patient.timestamp || new Date().toISOString(),


    /* Section 1: Demographics  */
    full_name:         a.name       || null,
    age:               a.age        || null,
    city:              a.city       || null,
    height_cm:         a.height_cm  || null,
    weight_kg:         a.weight_kg  || null,
    bmi:               a.bmi        ? parseFloat(a.bmi.toFixed(1)) : null,
    menstrual_status:  a.stage      || null,
    marital_status:    a.marital    || null,
    occupation:        a.occupation || null,
    highest_education: a.education  || null,
    prakriti:          a.prakriti   || null,
    vikriti:           a.vikriti    || null,
    wearable_device:   a.wearable   || null,


    /* Section 2: Red Flags */
    rf1_unusual_vaginal_bleeding: RF1_LABELS[a.rf1] !== undefined ? RF1_LABELS[a.rf1] : null,
    rf2_persistent_pelvic_pain:   RF2_LABELS[a.rf2] !== undefined ? RF2_LABELS[a.rf2] : null,
    rf3_breast_changes:           RF3_LABELS[a.rf3] !== undefined ? RF3_LABELS[a.rf3] : null,


    /*  Section 3: MenQOL Vasomotor  */
    mq_v1_hot_flushes:      a.mq_v1 || null,
    mq_v2_night_sweats:     a.mq_v2 || null,
    mq_v3_daytime_sweating: a.mq_v3 || null,
    mq_v4_feeling_cold:     a.mq_v4 || null,
    mq_v5_palpitations:     a.mq_v5 || null,
    mq_v6_facial_flushing:  a.mq_v6 || null,


    /* Section 4: MenQOL Physical  */
    mq_p1_fatigue:            a.mq_p1 || null,
    mq_p2_sleep_difficulty:   a.mq_p2 || null,
    mq_p3_joint_muscle_pain:  a.mq_p3 || null,
    mq_p4_skin_changes:       a.mq_p4 || null,
    mq_p5_weight_gain:        a.mq_p5 || null,
    mq_p6_headaches:          a.mq_p6 || null,
    mq_p7_hair_loss:          a.mq_p7 || null,
    mq_p8_appearance_concern: a.mq_p8 || null,


    /* Section 5: MenQOL Psychosocial */
    mq_ps1_anxiety:          a.mq_ps1 || null,
    mq_ps2_loss_of_interest: a.mq_ps2 || null,
    mq_ps3_depression:       a.mq_ps3 || null,
    mq_ps4_irritability:     a.mq_ps4 || null,
    mq_ps5_overwhelmed:      a.mq_ps5 || null,
    mq_ps6_brain_fog:        a.mq_ps6 || null,
    mq_ps7_low_motivation:   a.mq_ps7 || null,


    /* Section 6: MenQOL Sexual (scale 1–8) */
    mq_s1_reduced_desire:    a.mq_s1 || null,
    mq_s2_vaginal_dryness:   a.mq_s2 || null,
    mq_s3_avoiding_intimacy: a.mq_s3 || null,


    /* Section 7: ISI Sleep */
    isi_0_difficulty_falling_asleep: a.isi_0 != null ? a.isi_0 : null,
    isi_1_difficulty_staying_asleep: a.isi_1 != null ? a.isi_1 : null,
    isi_2_early_awakening:           a.isi_2 != null ? a.isi_2 : null,
    isi_3_sleep_satisfaction:        a.isi_3 != null ? a.isi_3 : null,
    isi_4_noticeable_to_others:      a.isi_4 != null ? a.isi_4 : null,
    isi_5_worried_about_sleep:       a.isi_5 != null ? a.isi_5 : null,
    isi_6_daytime_interference:      a.isi_6 != null ? a.isi_6 : null,


    /* Section 8: Comorbidities */
    comor_hypertension:        co['Hypertension']        || null,
    comor_diabetes:            co['Diabetes']            || null,
    comor_hypothyroidism:      co['Hypothyroidism']      || null,
    comor_hyperthyroidism:     co['Hyperthyroidism']     || null,
    comor_hyperlipidemia:      co['Hyperlipidemia']      || null,
    comor_anaemia:             co['Anaemia']             || null,
    comor_pcod:                co['PCOD']                || null,
    comor_osteoporosis:        co['Osteoporosis']        || null,
    comor_heart_disease:       co['Heart Disease']       || null,
    comor_ckd:                 co['CKD']                 || null,
    comor_autoimmune_disorder: co['Autoimmune Disorder'] || null,
    comor_stroke_history:      co['Stroke (history)']   || null,
    comor_cancer_history:      co['Cancer (history)']   || null

  };
}


/* SECTION 1 — CORE FETCH HELPER */

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


/* SECTION 2 — SAVE FUNCTIONS */

async function sbSaveSession(session) {
  if (!session || !session.id) return;
  await sbFetch('sessions', 'POST', buildSessionPayload(session));
}

async function sbSaveConsent(session, consentData, consentTimestamp) {
  if (!session || !session.id) return;
  await sbFetch('consent_records', 'POST', buildConsentPayload(session, consentData, consentTimestamp));
}

async function sbSaveAssessment(patient) {
  if (!patient) return;
  await sbFetch('assessments', 'POST', buildAssessmentPayload(patient));
}


/* SECTION 3 — HOOKS INTO EXISTING APP FUNCTIONS */

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
  var patient     = S.patients[0];
  patient.answers = S.answers;
  sbSaveAssessment(patient);
};

console.log('[Supabase] EvaEraHealth integration loaded & hooks active');