/* Sanjeev Astra Medicines Controller */
import { apiFetch, showToast } from './api.js';

let userMedicines = [];

document.addEventListener('DOMContentLoaded', () => {
  loadMedicines();

  // Bind modals
  const addBtn = document.getElementById('btn-open-med-modal');
  const modal = document.getElementById('med-modal');
  const closeBtn = document.getElementById('med-modal-close');
  const cancelBtn = document.getElementById('med-modal-cancel');
  const form = document.getElementById('med-form');

  // Set default start date in form to today
  const startInput = document.getElementById('med-start');
  if (startInput) {
    startInput.value = new Date().toISOString().split('T')[0];
  }

  const openModal = (mode = 'add', med = null) => {
    if (!modal) return;
    
    form.reset();
    document.getElementById('med-id').value = '';
    
    // Default checked boxes
    document.querySelectorAll('input[name="med-timings"]').forEach(cb => {
      cb.checked = cb.value === 'Morning';
    });

    if (startInput) {
      startInput.value = new Date().toISOString().split('T')[0];
    }

    if (mode === 'edit' && med) {
      document.getElementById('med-modal-title').textContent = 'Edit Medication Schedule';
      document.getElementById('btn-med-submit').textContent = 'Save Changes';
      document.getElementById('med-id').value = med._id;
      document.getElementById('med-name').value = med.name;
      document.getElementById('med-dose').value = med.dosage;
      document.getElementById('med-freq').value = med.frequency;
      document.getElementById('med-start').value = med.startDate.split('T')[0];
      document.getElementById('med-end').value = med.endDate ? med.endDate.split('T')[0] : '';
      document.getElementById('med-reminder').value = med.reminderTime || '08:00';
      document.getElementById('med-instructions').value = med.instructions || '';

      // Set timings checkboxes
      document.querySelectorAll('input[name="med-timings"]').forEach(cb => {
        cb.checked = med.timings.includes(cb.value);
      });
    } else {
      document.getElementById('med-modal-title').textContent = 'Schedule Medication';
      document.getElementById('btn-med-submit').textContent = 'Schedule Medicine';
    }

    modal.classList.add('open');
  };

  const closeModal = () => {
    if (modal) modal.classList.remove('open');
  };

  if (addBtn) addBtn.addEventListener('click', () => openModal('add'));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Form submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('med-id').value;
      const name = document.getElementById('med-name').value.trim();
      const dosage = document.getElementById('med-dose').value.trim();
      const frequency = document.getElementById('med-freq').value;
      const startDate = document.getElementById('med-start').value;
      const endDate = document.getElementById('med-end').value || null;
      const reminderTime = document.getElementById('med-reminder').value;
      const instructions = document.getElementById('med-instructions').value.trim();

      // Read checkboxes
      const timings = [];
      document.querySelectorAll('input[name="med-timings"]:checked').forEach(cb => {
        timings.push(cb.value);
      });

      if (timings.length === 0) {
        showToast('Schedule Error', 'Please select at least one daily time slot', 'warning');
        return;
      }

      const payload = {
        name,
        dosage,
        frequency,
        timings,
        startDate,
        endDate,
        reminderTime,
        instructions
      };

      let result;
      if (id) {
        // Edit mode
        result = await apiFetch(`/medicines/${id}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        // Add mode
        result = await apiFetch('/medicines', {
          method: 'POST',
          body: payload
        });
      }

      if (result.success) {
        showToast('Success', id ? 'Medication schedule updated' : 'Medication scheduled successfully', 'success');
        closeModal();
        loadMedicines();
      } else {
        showToast('Operation Failed', result.error, 'error');
      }
    });
  }

  // Bind edit/delete clicks to dynamic grid
  window.editMed = (id) => {
    const med = userMedicines.find(m => m._id === id);
    if (med) openModal('edit', med);
  };

  window.deleteMed = async (id) => {
    if (confirm('Are you sure you want to stop and delete this medication schedule?')) {
      const res = await apiFetch(`/medicines/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Deleted', 'Medication schedule removed', 'success');
        loadMedicines();
      } else {
        showToast('Failed', res.error, 'error');
      }
    }
  };
});

// Load medicines from backend API
async function loadMedicines() {
  const grid = document.getElementById('medications-grid');
  if (!grid) return;

  const result = await apiFetch('/medicines');
  if (result.success) {
    userMedicines = result.data;

    if (userMedicines.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state">
          <div class="empty-icon"><i data-lucide="pill" style="width: 48px; height: 48px;"></i></div>
          <div class="empty-title">No medications scheduled</div>
          <div class="empty-subtitle">Get started by scheduling your first prescription or OTC drug tracker.</div>
          <button class="btn btn-primary" onclick="document.getElementById('btn-open-med-modal').click()"><i data-lucide="plus"></i> Schedule Medication</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = userMedicines.map(med => {
      // Calculate individual compliance rate
      const totalLogs = med.history.length;
      const takenLogs = med.history.filter(h => h.status === 'Taken').length;
      const rate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;
      
      let rateBadgeClass = 'badge-success';
      if (rate < 80) rateBadgeClass = 'badge-warning';
      if (rate < 50) rateBadgeClass = 'badge-danger';

      return `
        <div class="glass-card med-card">
          <div class="med-header">
            <div>
              <div class="med-title">${med.name}</div>
              <div class="med-dose">${med.dosage}</div>
            </div>
            <span class="badge ${rateBadgeClass}">${rate}% adherence</span>
          </div>

          <div class="med-details">
            <div class="med-meta-row">
              <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
              <span>Starts: ${new Date(med.startDate).toLocaleDateString()} ${med.endDate ? `• Ends: ${new Date(med.endDate).toLocaleDateString()}` : '• Continuous'}</span>
            </div>
            <div class="med-meta-row">
              <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
              <span>Slots: ${med.timings.join(', ')} (Remind: ${med.reminderTime || '08:00'})</span>
            </div>
            <div class="med-meta-row">
              <i data-lucide="info" style="width: 14px; height: 14px;"></i>
              <span>Instructions: ${med.instructions || 'None provided'}</span>
            </div>
          </div>

          <div class="med-footer-actions">
            <button class="btn btn-secondary btn-icon" onclick="editMed('${med._id}')" title="Edit Schedule">
              <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
            </button>
            <button class="btn btn-danger btn-icon" onclick="deleteMed('${med._id}')" title="Delete Schedule">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } else {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--error); padding: 48px;">Failed to retrieve medications databases.</div>`;
  }
}
