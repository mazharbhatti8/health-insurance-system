'use strict';
function applyRolePermissions() {

    document.getElementById("tabItemCreate").style.display = "none";
    document.getElementById("tabItemReview").style.display = "none";
    document.getElementById("tabItemTrack").style.display = "none";
    document.getElementById("tabItemReports").style.display = "none";

    if(currentUser.role === "admin"){
        document.getElementById("tabItemCreate").style.display = "block";
        document.getElementById("tabItemReports").style.display = "block";
    }

    if(currentUser.role === "officer"){
        document.getElementById("tabItemReview").style.display = "block";
        document.getElementById("tabItemReports").style.display = "block";
    }

    if(currentUser.role === "customer"){
        document.getElementById("tabItemTrack").style.display = "block";
    }
}
/* ===== POLICY DATABASE ===== */
const POLICY_DB = [
  { id: 'P1001', customer: 'Ali Hassan',     status: 'Active',   coverage: ['Surgery', 'Emergency', 'Cardiac'],              expiry: '2027-12-31', limit: 500000 },
  { id: 'P1002', customer: 'Sara Ahmed',     status: 'Active',   coverage: ['Maternity', 'Diagnostics', 'Physiotherapy'],    expiry: '2026-06-30', limit: 300000 },
  { id: 'P1003', customer: 'Usman Khan',     status: 'Active',   coverage: ['Cancer', 'Surgery', 'Diagnostics', 'Emergency'],expiry: '2028-03-31', limit: 1000000 },
  { id: 'P1004', customer: 'Fatima Malik',   status: 'Inactive', coverage: ['Dental', 'Physiotherapy'],                      expiry: '2024-01-01', limit: 150000 },
  { id: 'P1005', customer: 'Bilal Siddiqui', status: 'Active',   coverage: ['Surgery', 'Cardiac', 'Cancer', 'Emergency'],    expiry: '2029-09-30', limit: 750000 },
  { id: 'P1006', customer: 'Ayesha Raza',    status: 'Active',   coverage: ['Maternity', 'Dental', 'Diagnostics'],           expiry: '2027-06-30', limit: 200000 },
];

const REGISTERED_HOSPITALS = [
  'Aga Khan Hospital', 'Shaukat Khanum', 'Liaquat National',
  'South City Hospital', 'Indus Hospital'
];

const USERS = [
  { username: 'admin',    password: 'admin123',   role: 'admin',    label: 'Hospital / Admin' },
  { username: 'officer',  password: 'officer123', role: 'officer',  label: 'Insurance Officer' },
  { username: 'customer', password: 'cust123',    role: 'customer', label: 'Customer' },
];

/* ===== STATE ===== */
let currentUser  = null;
let pendingAction = { claimId: null, type: null };
let actionModalInst = null;

/* ===== LOCALSTORAGE HELPERS ===== */
function getClaims() {
  try { return JSON.parse(localStorage.getItem('mc_claims') || '[]'); } catch { return []; }
}
function saveClaims(claims) {
  localStorage.setItem('mc_claims', JSON.stringify(claims));
}
function genClaimId() {
  const claims = getClaims();
  const next   = claims.length + 1;
  return 'CLM-' + String(next).padStart(5, '0');
}

/* ===== LOGIN / LOGOUT ===== */
function doLogin() {
  const role = document.getElementById('loginRole').value.trim();
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const alertEl = document.getElementById('loginAlert');

  if (!role || !user || !pass) {
    showAlert(alertEl, 'danger', 'Please fill in all fields.');
    return;
  }

  const found = USERS.find(u => u.username === user && u.password === pass && u.role === role);
  if (!found) {
    showAlert(alertEl, 'danger', 'Invalid credentials. Please check your username, password, and role.');
    return;
  }

  currentUser = found;
  alertEl.classList.add('d-none');
  document.getElementById('loginScreen').classList.add('d-none');
  document.getElementById('appScreen').classList.remove('d-none');
  document.getElementById('navUserBadge').textContent = found.label + ': ' + found.username;

 
  applyRolePermissions();
  currentUser = found;
  applyRolePermissions();
initApp();
}

const insuranceDB = [
    {
        policyId: "P1001",
        patientName: "Ali",
        status: "Active",
        coverage: "500,000",
        hospital: "Aga Khan Hospital"
    },
    {
        policyId: "P1002",
        patientName: "Sara",
        status: "Expired",
        coverage: "300,000",
        hospital: "Liaquat National"
    },
    {
        policyId: "P1003",
        patientName: "Ahmed",
        status: "Active",
        coverage: "1,000,000",
        hospital: "Shaukat Khanum"
    }
];
function searchInsurance() {

    if (currentUser.role !== "admin") {
        alert("Access denied: Admin only feature");
        return;
    }

    const query = document.getElementById("searchPolicy").value.toLowerCase();
    const resultDiv = document.getElementById("searchResult");

    const result = insuranceDB.find(p =>
        p.policyId.toLowerCase() === query ||
        p.patientName.toLowerCase() === query
    );

    if (!result) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                ❌ No insurance record found
            </div>
        `;
        return;
    }

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <h5>Insurance Found</h5>
            <p><b>Patient:</b> ${result.patientName}</p>
            <p><b>Policy ID:</b> ${result.policyId}</p>
            <p><b>Status:</b> ${result.status}</p>
            <p><b>Coverage:</b> ${result.coverage}</p>
            <p><b>Hospital:</b> ${result.hospital}</p>
        </div>
    `;
}

function doLogout() {
  currentUser = null;
  document.getElementById('appScreen').classList.add('d-none');
  document.getElementById('loginScreen').classList.remove('d-none');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginRole').value = '';
  document.getElementById('loginAlert').classList.add('d-none');
}

function initApp() {
  renderPolicyList();
  switchTab('create');
}

/* ===== TAB SWITCHING ===== */
function switchTab(tab) {
  const tabs   = ['create', 'review', 'track', 'reports'];
  const panels = { create: 'tabCreate', review: 'tabReview', track: 'tabTrack', reports: 'tabReports' };

  tabs.forEach(t => {
    const panel   = document.getElementById(panels[t]);
    const linkEl  = document.querySelector(`#tabItem${cap(t)} .tab-link`);
    panel.classList.add('d-none');
    if (linkEl) linkEl.classList.remove('active');
  });

  document.getElementById(panels[tab]).classList.remove('d-none');
  const activeLink = document.querySelector(`#tabItem${cap(tab)} .tab-link`);
  if (activeLink) activeLink.classList.add('active');

  if (tab === 'review')  loadReviewTab();
  if (tab === 'track')   clearTrack();
  if (tab === 'reports') loadReports();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ===== POLICY RENDERER ===== */
function renderPolicyList() {
  const el = document.getElementById('policyList');
  el.innerHTML = POLICY_DB.map(p => `
    <div class="policy-item">
      <div class="d-flex justify-content-between align-items-center">
        <span class="pid">${p.id}</span>
        <span class="policy-badge ${p.status === 'Active' ? 'active' : 'inactive'}">${p.status}</span>
      </div>
      <div class="pmeta">
        <strong>${p.customer}</strong><br>
        Coverage: ${p.coverage.join(', ')}<br>
        Limit: PKR ${p.limit.toLocaleString()} | Expires: ${p.expiry}
      </div>
    </div>`).join('');
}

/* ===== SUBMIT CLAIM ===== */
function submitClaim() {
  const alertEl = document.getElementById('claimFormAlert');
  const patientName  = document.getElementById('patientName').value.trim();
  const policyNumber = document.getElementById('policyNumber').value.trim().toUpperCase();
  const treatmentType= document.getElementById('treatmentType').value;
  const claimAmount  = parseFloat(document.getElementById('claimAmount').value);
  const hospitalName = document.getElementById('hospitalName').value;
  const docFile      = document.getElementById('claimDoc').files[0];

  // Validation
  if (!patientName || !policyNumber || !treatmentType || !hospitalName || isNaN(claimAmount) || claimAmount <= 0) {
    showAlert(alertEl, 'danger', 'Please fill in all required fields with valid values.');
    return;
  }

  alertEl.classList.add('d-none');

  // Policy verification
  const policy = POLICY_DB.find(p => p.id === policyNumber);
  const today  = new Date().toISOString().split('T')[0];
  let rejectionReason = null;

  if (!policy) {
    rejectionReason = `Policy <strong>${policyNumber}</strong> does not exist in our database.`;
  } else if (policy.status !== 'Active') {
    rejectionReason = `Policy <strong>${policyNumber}</strong> is <strong>Inactive</strong>.`;
  } else if (policy.expiry < today) {
    rejectionReason = `Policy <strong>${policyNumber}</strong> expired on <strong>${policy.expiry}</strong>.`;
  } else if (!policy.coverage.includes(treatmentType)) {
    rejectionReason = `Treatment <strong>${treatmentType}</strong> is not covered under policy <strong>${policyNumber}</strong>.<br>Covered treatments: ${policy.coverage.join(', ')}.`;
  }

  // Fraud detection
  const existingClaims = getClaims();
  let fraudScore = 0;
  const fraudFlags = [];

  if (claimAmount > 100000) {
    fraudScore += 30;
    fraudFlags.push({ rule: 'Amount exceeds PKR 100,000', score: 30 });
  }

  const isDuplicate = existingClaims.some(c =>
    c.policyNumber === policyNumber &&
    c.treatmentType === treatmentType &&
    c.status !== 'Rejected'
  );
  if (isDuplicate) {
    fraudScore += 40;
    fraudFlags.push({ rule: 'Duplicate claim for same policy & treatment', score: 40 });
  }

  if (!policy || policy.status !== 'Active' || (policy && policy.expiry < today)) {
    fraudScore += 50;
    fraudFlags.push({ rule: 'Expired or invalid policy', score: 50 });
  }

  if (!REGISTERED_HOSPITALS.includes(hospitalName)) {
    fraudScore += 20;
    fraudFlags.push({ rule: 'Unknown / unregistered hospital', score: 20 });
  }

  fraudScore = Math.min(fraudScore, 100);
  const fraudLevel = fraudScore <= 30 ? 'low' : fraudScore <= 70 ? 'medium' : 'high';
  const fraudLabel = fraudScore <= 30 ? 'Low Risk' : fraudScore <= 70 ? 'Medium Risk' : 'High Risk';

  const claimId   = genClaimId();
  const status    = rejectionReason ? 'Rejected' : 'Under Review';
  const submittedAt = new Date().toLocaleString('en-PK');
  const docName   = docFile ? docFile.name : null;

  const newClaim = {
    id: claimId,
    patientName, policyNumber, treatmentType,
    claimAmount, hospitalName, docName,
    status, rejectionReason: rejectionReason || null,
    fraudScore, fraudLevel, fraudLabel,
    fraudFlags,
    submittedBy: currentUser.username,
    submittedAt,
    officerNote: null,
    customerName: policy ? policy.customer : 'Unknown',
  };

  existingClaims.push(newClaim);
  saveClaims(existingClaims);

  // Show result
  renderClaimResult(newClaim);

  // Clear form
  document.getElementById('patientName').value = '';
  document.getElementById('policyNumber').value = '';
  document.getElementById('treatmentType').value = '';
  document.getElementById('claimAmount').value = '';
  document.getElementById('hospitalName').value = '';
  document.getElementById('claimDoc').value = '';
}

function renderClaimResult(claim) {
  const resultEl = document.getElementById('claimResult');
  const bodyEl   = document.getElementById('claimResultBody');
  resultEl.classList.remove('d-none');

  const isRejected = claim.status === 'Rejected';
  const statusClass = statusBadgeClass(claim.status);

  const flagsHtml = claim.fraudFlags.length > 0
    ? `<div class="mt-2"><strong>Fraud Flags:</strong><ul class="mb-0 mt-1">${claim.fraudFlags.map(f => `<li>${f.rule} <span class="rule-tag ${f.score >= 40 ? 'high' : 'medium'}">+${f.score}</span></li>`).join('')}</ul></div>`
    : '<div class="mt-2 text-success"><i class="bi bi-check-circle me-1"></i>No fraud flags raised.</div>';

  bodyEl.innerHTML = `
    ${isRejected
      ? `<div class="alert alert-danger mb-3"><i class="bi bi-x-circle me-2"></i><strong>Claim Rejected During Verification</strong><br>${claim.rejectionReason}</div>`
      : `<div class="alert alert-success mb-3"><i class="bi bi-check-circle me-2"></i><strong>Claim submitted successfully!</strong> It is now under officer review.</div>`
    }
    <div class="result-grid">
      <div class="result-item"><label>Claim ID</label><span class="text-primary fw-bold">${claim.id}</span></div>
      <div class="result-item"><label>Status</label><span class="status-badge ${statusClass}">${claim.status}</span></div>
      <div class="result-item"><label>Patient</label><span>${claim.patientName}</span></div>
      <div class="result-item"><label>Policy</label><span>${claim.policyNumber}</span></div>
      <div class="result-item"><label>Treatment</label><span>${claim.treatmentType}</span></div>
      <div class="result-item"><label>Hospital</label><span>${claim.hospitalName}</span></div>
      <div class="result-item"><label>Amount</label><span>PKR ${claim.claimAmount.toLocaleString()}</span></div>
      <div class="result-item"><label>Submitted</label><span>${claim.submittedAt}</span></div>
    </div>
    <div class="fraud-meter-wrap">
      <div class="fraud-meter-label">
        <span>Fraud Score</span>
        <span class="fraud-chip ${claim.fraudLevel}">${claim.fraudScore}/100 — ${claim.fraudLabel}</span>
      </div>
      <div class="fraud-meter-bar">
        <div class="fraud-meter-fill" style="width:${claim.fraudScore}%; background:${fraudColor(claim.fraudLevel)};"></div>
      </div>
    </div>
    ${flagsHtml}
    <p class="text-muted small mt-3 mb-0"><i class="bi bi-info-circle me-1"></i>Use Claim ID <strong>${claim.id}</strong> to track your claim status in the Track tab.</p>
  `;

  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== OFFICER REVIEW TAB ===== */
function loadReviewTab() {
  const denied  = document.getElementById('reviewAccessDenied');
  const wrapper = document.getElementById('reviewTableWrapper');

  if (currentUser.role !== 'officer') {
    denied.classList.remove('d-none');
    wrapper.classList.add('d-none');
  } else {
    denied.classList.add('d-none');
    wrapper.classList.remove('d-none');
    loadReviewTable();
  }
}

function loadReviewTable() {
  const claims = getClaims();
  const tbody  = document.getElementById('reviewTableBody');
  const empty  = document.getElementById('reviewEmpty');
  const count  = document.getElementById('reviewClaimCount');

  count.textContent = `${claims.length} claim${claims.length !== 1 ? 's' : ''} total`;

  if (claims.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  tbody.innerHTML = claims.slice().reverse().map(c => {
    const canAct = c.status === 'Under Review';
    return `<tr>
      <td><span class="claim-id-cell">${c.id}</span></td>
      <td>${c.patientName}</td>
      <td><strong>${c.policyNumber}</strong></td>
      <td>${c.treatmentType}</td>
      <td>PKR ${parseFloat(c.claimAmount).toLocaleString()}</td>
      <td><span class="fraud-chip ${c.fraudLevel}">${c.fraudScore} — ${c.fraudLabel}</span></td>
      <td><span class="status-badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
          <button class="action-btn approve ${canAct ? '' : 'disabled-btn'}"
            ${canAct ? `onclick="openAction('${c.id}','approve')"` : 'disabled'}>
            <i class="bi bi-check-lg"></i> Approve
          </button>
          <button class="action-btn reject ${canAct ? '' : 'disabled-btn'}"
            ${canAct ? `onclick="openAction('${c.id}','reject')"` : 'disabled'}>
            <i class="bi bi-x-lg"></i> Reject
          </button>
          <button class="action-btn info ${canAct ? '' : 'disabled-btn'}"
            ${canAct ? `onclick="openAction('${c.id}','info')"` : 'disabled'}>
            <i class="bi bi-chat-left-text"></i> Request Info
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAction(claimId, type) {
  pendingAction = { claimId, type };

  const titles = { approve: 'Approve Claim', reject: 'Reject Claim', info: 'Request Information' };
  const descs  = {
    approve: `You are about to <strong>approve</strong> claim <strong>${claimId}</strong>. The customer will be notified.`,
    reject:  `You are about to <strong>reject</strong> claim <strong>${claimId}</strong>. Please provide a reason.`,
    info:    `You are requesting <strong>additional information</strong> for claim <strong>${claimId}</strong>. Describe what is needed.`,
  };
  const confirmBtns = { approve: 'btn-success', reject: 'btn-danger', info: 'btn-warning' };

  document.getElementById('actionModalTitle').textContent = titles[type];
  document.getElementById('actionModalDesc').innerHTML    = descs[type];
  document.getElementById('actionModalNote').value = '';

  const noteWrapper = document.getElementById('actionModalNoteWrapper');
  if (type === 'approve') {
    noteWrapper.classList.add('d-none');
  } else {
    noteWrapper.classList.remove('d-none');
  }

  const confirmBtn = document.getElementById('actionModalConfirm');
  confirmBtn.className = `btn ${confirmBtns[type]}`;
  confirmBtn.textContent = titles[type];

  if (!actionModalInst) {
    actionModalInst = new bootstrap.Modal(document.getElementById('actionModal'));
  }
  actionModalInst.show();
}

function confirmAction() {
  const { claimId, type } = pendingAction;
  const note = document.getElementById('actionModalNote').value.trim();

  if ((type === 'reject' || type === 'info') && !note) {
    document.getElementById('actionModalNote').classList.add('is-invalid');
    document.getElementById('actionModalNote').focus();
    return;
  }
  document.getElementById('actionModalNote').classList.remove('is-invalid');

  const statusMap = { approve: 'Approved', reject: 'Rejected', info: 'Information Required' };
  const claims = getClaims();
  const idx    = claims.findIndex(c => c.id === claimId);

  if (idx !== -1) {
    claims[idx].status      = statusMap[type];
    claims[idx].officerNote = note || null;
    claims[idx].reviewedAt  = new Date().toLocaleString('en-PK');
    saveClaims(claims);
  }

  if (actionModalInst) actionModalInst.hide();
  loadReviewTable();
}

/* ===== TRACK CLAIM ===== */
function clearTrack() {
  document.getElementById('trackQuery').value = '';
  document.getElementById('trackResults').classList.add('d-none');
}

function trackClaim() {
  const query  = document.getElementById('trackQuery').value.trim().toUpperCase();
  const claims = getClaims();
  const resultsEl = document.getElementById('trackResults');
  const bodyEl    = document.getElementById('trackResultsBody');

  if (!query) {
    bodyEl.innerHTML = '<div class="alert alert-warning">Please enter a Policy Number or Claim ID.</div>';
    resultsEl.classList.remove('d-none');
    return;
  }

  const found = claims.filter(c =>
    c.id.toUpperCase() === query ||
    c.policyNumber.toUpperCase() === query
  );

  if (found.length === 0) {
    bodyEl.innerHTML = `<div class="alert alert-warning"><i class="bi bi-search me-2"></i>No claims found for <strong>${query}</strong>. Please check your Policy Number or Claim ID.</div>`;
    resultsEl.classList.remove('d-none');
    return;
  }

  bodyEl.innerHTML = found.map(c => renderTrackCard(c)).join('');
  resultsEl.classList.remove('d-none');
}

function renderTrackCard(c) {
  const steps = ['Submitted', 'Under Review', 'Approved'];
  const statusOrder = {
    'Submitted': 0,
    'Under Review': 1,
    'Approved': 2,
    'Rejected': 2,
    'Information Required': 1,
  };
  const currentStep = statusOrder[c.status] ?? 0;
  const isRejected  = c.status === 'Rejected';
  const isInfo      = c.status === 'Information Required';

  let timelineHtml = '';
  steps.forEach((step, i) => {
    let dotClass = '';
    let icon     = (i + 1).toString();
    if (i < currentStep) { dotClass = 'done'; icon = '✓'; }
    else if (i === currentStep) {
      if (isRejected)  { dotClass = 'rejected'; icon = '✗'; }
      else if (isInfo) { dotClass = 'active'; icon = '?'; }
      else             { dotClass = i === 2 ? 'approved' : 'active'; icon = i === 2 ? '✓' : (i + 1).toString(); }
    }

    if (i > 0) {
      timelineHtml += `<div class="timeline-connector ${i <= currentStep ? 'done' : ''}"></div>`;
    }
    const label = (i === 2 && isRejected) ? 'Rejected' : step;
    timelineHtml += `<div class="timeline-step ${dotClass}"><div class="step-dot">${icon}</div><div class="step-label">${label}</div></div>`;
  });

  const noteHtml = c.officerNote
    ? `<div class="officer-note-box"><strong><i class="bi bi-chat-quote me-1"></i>Officer Note:</strong> ${c.officerNote}</div>`
    : '';

  return `
    <div class="track-card">
      <div class="track-header">
        <div>
          <div class="track-claim-id">${c.id}</div>
          <div class="text-muted small mt-1">Submitted: ${c.submittedAt}</div>
        </div>
        <span class="status-badge ${statusBadgeClass(c.status)}">${c.status}</span>
      </div>

      <div class="track-detail-grid">
        <div class="track-detail-item"><label>Patient Name</label><span>${c.patientName}</span></div>
        <div class="track-detail-item"><label>Policy Number</label><span>${c.policyNumber}</span></div>
        <div class="track-detail-item"><label>Treatment</label><span>${c.treatmentType}</span></div>
        <div class="track-detail-item"><label>Hospital</label><span>${c.hospitalName}</span></div>
        <div class="track-detail-item"><label>Claim Amount</label><span>PKR ${parseFloat(c.claimAmount).toLocaleString()}</span></div>
        <div class="track-detail-item"><label>Fraud Risk</label><span class="fraud-chip ${c.fraudLevel}">${c.fraudScore}/100 — ${c.fraudLabel}</span></div>
      </div>

      <div class="fraud-meter-wrap">
        <div class="fraud-meter-label">
          <span style="font-size:12px;font-weight:600;color:var(--text-muted)">Fraud Score</span>
          <span style="font-size:12px;font-weight:700;">${c.fraudScore}/100</span>
        </div>
        <div class="fraud-meter-bar">
          <div class="fraud-meter-fill" style="width:${c.fraudScore}%; background:${fraudColor(c.fraudLevel)};"></div>
        </div>
      </div>

      ${c.rejectionReason ? `<div class="alert alert-danger mt-3 mb-0 py-2"><i class="bi bi-x-circle me-2"></i><strong>Rejection Reason:</strong> ${c.rejectionReason}</div>` : ''}
      ${noteHtml}

      <div class="status-timeline mt-3">${timelineHtml}</div>
    </div>`;
}

/* ===== REPORTS TAB ===== */
function loadReports() {
  const claims = getClaims();

  // Stat cards
  const total     = claims.length;
  const approved  = claims.filter(c => c.status === 'Approved').length;
  const rejected  = claims.filter(c => c.status === 'Rejected').length;
  const pending   = claims.filter(c => c.status === 'Under Review' || c.status === 'Submitted' || c.status === 'Information Required').length;
  const totalAmt  = claims.reduce((s, c) => s + parseFloat(c.claimAmount || 0), 0);

  const statsEl = document.getElementById('reportStats');
  statsEl.innerHTML = `
    <div class="col-6 col-md-4 col-lg-2-4">
      <div class="stat-card total">
        <div class="stat-icon"><i class="bi bi-folder2-open"></i></div>
        <div class="stat-content"><div class="stat-num">${total}</div><div class="stat-lbl">Total Claims</div></div>
      </div>
    </div>
    <div class="col-6 col-md-4 col-lg-2-4">
      <div class="stat-card approved">
        <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
        <div class="stat-content"><div class="stat-num">${approved}</div><div class="stat-lbl">Approved</div></div>
      </div>
    </div>
    <div class="col-6 col-md-4 col-lg-2-4">
      <div class="stat-card rejected">
        <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
        <div class="stat-content"><div class="stat-num">${rejected}</div><div class="stat-lbl">Rejected</div></div>
      </div>
    </div>
    <div class="col-6 col-md-4 col-lg-2-4">
      <div class="stat-card pending">
        <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
        <div class="stat-content"><div class="stat-num">${pending}</div><div class="stat-lbl">Pending</div></div>
      </div>
    </div>
    <div class="col-12 col-md-4 col-lg-2-4">
      <div class="stat-card amount">
        <div class="stat-icon"><i class="bi bi-currency-exchange"></i></div>
        <div class="stat-content"><div class="stat-num" style="font-size:18px">PKR ${totalAmt.toLocaleString()}</div><div class="stat-lbl">Total Claimed</div></div>
      </div>
    </div>`;

  // Claims table
  const tbody   = document.getElementById('reportTableBody');
  const emptyEl = document.getElementById('reportEmpty');

  if (claims.length === 0) {
    tbody.innerHTML = '';
    emptyEl.classList.remove('d-none');
  } else {
    emptyEl.classList.add('d-none');
    tbody.innerHTML = claims.slice().reverse().map(c => `
      <tr>
        <td><span class="claim-id-cell">${c.id}</span></td>
        <td>${c.patientName}</td>
        <td>${c.treatmentType}</td>
        <td>PKR ${parseFloat(c.claimAmount).toLocaleString()}</td>
        <td><span class="fraud-chip ${c.fraudLevel}">${c.fraudScore}</span></td>
        <td><span class="status-badge ${statusBadgeClass(c.status)}">${c.status}</span></td>
      </tr>`).join('');
  }

  // Risk distribution
  const low    = claims.filter(c => c.fraudLevel === 'low').length;
  const medium = claims.filter(c => c.fraudLevel === 'medium').length;
  const high   = claims.filter(c => c.fraudLevel === 'high').length;
  const maxR   = Math.max(low, medium, high, 1);

  document.getElementById('riskDistribution').innerHTML = total === 0
    ? '<p class="text-muted small">No data yet.</p>'
    : `
      <div class="dist-row">
        <div class="dist-label">Low Risk</div>
        <div class="dist-bar-wrap"><div class="dist-bar-fill" style="width:${(low/maxR)*100}%; background:#66BB6A;"></div></div>
        <div class="dist-count">${low}</div>
      </div>
      <div class="dist-row">
        <div class="dist-label">Medium Risk</div>
        <div class="dist-bar-wrap"><div class="dist-bar-fill" style="width:${(medium/maxR)*100}%; background:#FFA726;"></div></div>
        <div class="dist-count">${medium}</div>
      </div>
      <div class="dist-row">
        <div class="dist-label">High Risk</div>
        <div class="dist-bar-wrap"><div class="dist-bar-fill" style="width:${(high/maxR)*100}%; background:#EF5350;"></div></div>
        <div class="dist-count">${high}</div>
      </div>`;

  // Treatment breakdown
  const tCounts = {};
  claims.forEach(c => { tCounts[c.treatmentType] = (tCounts[c.treatmentType] || 0) + 1; });
  const tEntries = Object.entries(tCounts).sort((a,b) => b[1]-a[1]);
  const maxT     = tEntries.length ? tEntries[0][1] : 1;
  const tColors  = ['#42A5F5','#AB47BC','#26A69A','#EC407A','#7E57C2','#26C6DA','#D4E157','#FF7043'];

  document.getElementById('treatmentBreakdown').innerHTML = tEntries.length === 0
    ? '<p class="text-muted small">No data yet.</p>'
    : tEntries.map(([t, n], i) => `
      <div class="dist-row">
        <div class="dist-label" style="font-size:11px">${t}</div>
        <div class="dist-bar-wrap"><div class="dist-bar-fill" style="width:${(n/maxT)*100}%; background:${tColors[i % tColors.length]};"></div></div>
        <div class="dist-count">${n}</div>
      </div>`).join('');
}

/* ===== HELPERS ===== */
function statusBadgeClass(status) {
  const map = {
    'Submitted':            'submitted',
    'Under Review':         'under-review',
    'Approved':             'approved',
    'Rejected':             'rejected',
    'Information Required': 'info-required',
  };
  return map[status] || 'submitted';
}

function fraudColor(level) {
  return level === 'low' ? '#66BB6A' : level === 'medium' ? '#FFA726' : '#EF5350';
}

function showAlert(el, type, msg) {
  el.className = `alert alert-${type}`;
  el.innerHTML = msg;
  el.classList.remove('d-none');
}