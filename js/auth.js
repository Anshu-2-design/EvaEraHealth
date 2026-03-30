/* Auth, Consent & Session*/

'use strict';

/*AUTH TAB SWITCH*/
function authTab(mode) {
  S.authMode = mode;
  document.querySelectorAll('.auth-tab').forEach(function(t, i) {
    t.classList.toggle('active', (i === 0 && mode === 'login') || (i === 1 && mode === 'register'));
  });
  document.getElementById('auth-login').style.display    = mode === 'login'    ? 'block' : 'none';
  document.getElementById('auth-register').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('auth-otp').style.display      = 'none';
}

/*SEND OTP*/
function sendOTP(mode) {
  var id = mode === 'login'
    ? document.getElementById('login-id').value
    : document.getElementById('reg-mobile').value;
  if (!id) { alert('Please enter your mobile number or email'); return; }
  S.authId = id;
  document.getElementById('auth-login').style.display    = 'none';
  document.getElementById('auth-register').style.display = 'none';
  document.getElementById('auth-otp').style.display      = 'block';
  document.querySelectorAll('#auth-screen .otp-digit')[0].focus();
}
/*OTP FOCUS CHAIN*/
function otpNext(el) {
  if (el.value.length === 1) {
    var n = el.nextElementSibling;
    if (n && n.classList.contains('otp-digit')) n.focus();
  }
}

/*VERIFY OTP*/
function verifyOTP() {
  var digits = Array.from(document.querySelectorAll('#auth-screen .otp-digit')).map(function(i) { return i.value; }).join('');
  if (digits === '1234') {
    S.session = { id:'user_'+Date.now(), ts:new Date().toISOString(), authId:S.authId };
    saveSession();
    showConsent();
  } else {
    alert('Invalid OTP. Demo OTP is 1234');
  }
}

/*GUEST MODE*/
function startGuest() {
  S.session = { id:'guest_'+Date.now(), ts:new Date().toISOString() };
  showConsent();
}

/*CONSENT SCREEN*/
function showConsent() {
  showScreen('consent-screen');
  renderConsent();
}

function renderConsent() {
  var html = '';
  CONSENT_ITEMS.forEach(function(item) {
    var checked    = S.consentData[item.id] ? 'checked' : '';
    var badgeClass = item.badge === 'Sensitive Data' ? 'sensitive' : item.badge === 'Required' ? 'required' : 'optional';
    html += '<div class="consent-item">';
    html += '<input type="checkbox" id="ci_'+item.id+'" '+(item.required?'required':'')+' '+checked+' onchange="consentChange(\''+item.id+'\',this.checked)">';
    html += '<div class="ci-body">';
    html += '<div class="ci-title">'+item.title+'<span class="ci-badge '+badgeClass+'">'+item.badge+'</span></div>';
    html += '<div class="ci-desc">'+item.desc+'</div>';
    html += '</div></div>';
  });
  document.getElementById('consent-items-container').innerHTML = html;
  checkConsentBtn();
}

function consentChange(id, val) {
  S.consentData[id] = val;
  checkConsentBtn();
}

function checkConsentBtn() {
  var allRequired = CONSENT_ITEMS
    .filter(function(i) { return i.required; })
    .every(function(i)  { return S.consentData[i.id]; });
  document.getElementById('btn-consent-proceed').disabled = !allRequired;
}

function proceedAfterConsent() {
  S.consentGiven    = true;
  S.consentTimestamp = new Date().toISOString();
  startForm();
}

/*HCP AUTH*/
function hcpSendOTP() {
  var id = document.getElementById('hcp-login-id').value;
  if (!id) { alert('Please enter your provider email or ID.'); return; }
  document.getElementById('hcp-otp-section').style.display = 'block';
  setTimeout(function() {
    var d = document.querySelectorAll('.hcp-otp-digit');
    if (d[0]) d[0].focus();
  }, 150);
}

function hcpOtpNext(el) {
  if (el.value.length === 1) {
    var all = Array.from(document.querySelectorAll('.hcp-otp-digit'));
    var idx = all.indexOf(el);
    if (idx < all.length - 1) all[idx + 1].focus();
    else document.getElementById('btn-hcp-verify').click();
  }
}

function hcpVerifyOTP() {
  var digits = document.querySelectorAll('.hcp-otp-digit');
  var otp    = Array.from(digits).map(function(d) { return d.value; }).join('');
  if (otp.length < 4) { alert('Please enter all 4 OTP digits.'); return; }
  if (otp === '1234') {
    showHCPDashboard();
  } else {
    alert('Invalid OTP. Demo: 1234');
    Array.from(digits).forEach(function(d) { d.value = ''; });
    digits[0].focus();
  }
}

/*WINDOW LOAD*/
window.onload = function() {
  CONSENT_ITEMS
    .filter(function(i) { return i.required; })
    .forEach(function(i) { S.consentData[i.id] = false; });
  if (loadSession() && S.session) { showConsent(); }
};
