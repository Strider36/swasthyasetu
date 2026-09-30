/* Sanjeev Astra Settings Controller */
import { apiFetch, showToast } from './api.js';
import { renderLanguageSelector } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggler();
  setupDataExporter();
  setupLanguageSetting();
});

function setupLanguageSetting() {
  const container = document.getElementById('settings-lang-selector-container');
  if (container) {
    renderLanguageSelector(container);
  }
}

// Sync Theme preferences
function setupThemeToggler() {
  const toggle = document.getElementById('toggle-dark-mode');
  if (!toggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  toggle.checked = currentTheme === 'dark';

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      showToast('Theme Updated', 'Dark mode enabled', 'success');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      showToast('Theme Updated', 'Light mode enabled', 'success');
    }
  });
}

// Fetch user profile and export as file download
function setupDataExporter() {
  const btn = document.getElementById('btn-export-data');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Compiling data...';
    btn.disabled = true;

    // Fetch user details
    const userRes = await apiFetch('/auth/me');
    
    // Fetch user medicines
    const medRes = await apiFetch('/medicines');

    // Fetch appointments
    const apptRes = await apiFetch('/appointments');

    btn.innerHTML = originalText;
    btn.disabled = false;

    if (userRes.success) {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        profile: userRes.data || {},
        medications: medRes.success ? medRes.data : [],
        appointments: apptRes.success ? apptRes.data : []
      };

      // Generate downloadable JSON blob
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sanjeev-astra-profile-export-${new Date().toISOString().split('T')[0]}.json`);
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Export Completed', 'JSON profile data downloaded successfully', 'success');
    } else {
      showToast('Export Failed', 'Unable to fetch profile configurations.', 'error');
    }
  });
}
