/**
 * src/teams.js
 * Interactive controller for TrackMe for Teams
 */

document.addEventListener('DOMContentLoaded', () => {
  initLeaderboardTabs();
  initCampaignGenerator();
  initPilotForm();
});

/**
 * Tab switching between Hardened and Exposed leaderboard lists
 */
function initLeaderboardTabs() {
  const tabHardened = document.getElementById('tab-hardened');
  const tabExposed = document.getElementById('tab-exposed');
  const listHardened = document.getElementById('list-hardened');
  const listExposed = document.getElementById('list-exposed');

  if (!tabHardened || !tabExposed || !listHardened || !listExposed) return;

  tabHardened.addEventListener('click', () => {
    tabHardened.classList.add('active');
    tabExposed.classList.remove('active');
    listHardened.classList.remove('hidden');
    listExposed.classList.add('hidden');
  });

  tabExposed.addEventListener('click', () => {
    tabExposed.classList.add('active');
    tabHardened.classList.remove('active');
    listExposed.classList.remove('hidden');
    listHardened.classList.add('hidden');
  });
}

/**
 * Branded Campaign Demo Link generator
 */
function initCampaignGenerator() {
  const form = document.getElementById('campaign-form');
  const inputCompany = document.getElementById('company-name');
  const inputDept = document.getElementById('department-tag');
  const inputLink = document.getElementById('demo-link-input');
  const btnCopy = document.getElementById('btn-copy-campaign');
  const btnTest = document.getElementById('btn-test-campaign');
  const toast = document.getElementById('campaign-copy-toast');
  const uploadZone = document.getElementById('upload-zone');
  const logoInput = document.getElementById('logo-input');
  const logoPreviewText = document.getElementById('logo-preview-text');

  if (!form || !inputCompany || !inputLink) return;

  function updateLink() {
    const rawCompany = inputCompany.value.trim() || 'acme-corp';
    const slug = rawCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const dept = (inputDept?.value.trim() || 'cyber-week').replace(/[^a-z0-9_-]+/gi, '');
    const base = window.location.origin;
    const generatedUrl = `${base}/?team=${slug}&campaign=${dept}`;
    inputLink.value = generatedUrl;
    if (btnTest) btnTest.href = generatedUrl;
  }

  // Update as user types
  inputCompany.addEventListener('input', updateLink);
  inputDept?.addEventListener('input', updateLink);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateLink();
    inputLink.select();
    showToast(toast, 'Branded campaign link generated!');
  });

  // Copy campaign link
  btnCopy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inputLink.value);
      showToast(toast, 'Campaign link copied to clipboard!');
    } catch {
      showToast(toast, 'Link copied!');
    }
  });

  // Logo upload preview
  uploadZone?.addEventListener('click', () => logoInput?.click());
  logoInput?.addEventListener('change', () => {
    if (logoInput.files && logoInput.files[0]) {
      const fileName = logoInput.files[0].name;
      if (logoPreviewText) {
        logoPreviewText.innerHTML = `Loaded: <strong class="accent-green">${fileName}</strong>`;
      }
    }
  });
}

/**
 * Book a pilot lead form handler
 */
function initPilotForm() {
  const form = document.getElementById('pilot-form');
  const successCard = document.getElementById('pilot-success-msg');

  if (!form || !successCard) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pilot-name')?.value;
    const org = document.getElementById('pilot-org')?.value;

    form.classList.add('hidden');
    successCard.classList.remove('hidden');

    console.log(`[PILOT BOOKING] Registered reservation for ${name} (${org})`);
  });
}

function showToast(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => {
    el.classList.add('hidden');
  }, 3000);
}
