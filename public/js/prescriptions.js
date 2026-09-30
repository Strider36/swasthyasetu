/* Sanjeev Astra Prescriptions Archive Controller */
import { apiFetch, showToast } from './api.js';

let prescriptionsList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPrescriptions();

  window.deletePrescription = async (id) => {
    if (confirm('Are you sure you want to permanently delete this prescription record? Attached files will also be removed.')) {
      const res = await apiFetch(`/prescriptions/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Prescription Deleted', 'Record removed successfully', 'success');
        loadPrescriptions();
      } else {
        showToast('Operation Failed', res.error, 'error');
      }
    }
  };
});

// Load prescriptions from database
async function loadPrescriptions() {
  const grid = document.getElementById('rx-grid');
  if (!grid) return;

  const result = await apiFetch('/prescriptions');
  if (result.success) {
    prescriptionsList = result.data;

    if (prescriptionsList.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state">
          <div class="empty-icon"><i data-lucide="file-signature" style="width: 48px; height: 48px;"></i></div>
          <div class="empty-title">No prescriptions archived</div>
          <div class="empty-subtitle">Digitize your physical doctor prescription forms using the AI scanner.</div>
          <button class="btn btn-primary" onclick="window.location.href='/scanner.html?mode=prescription'"><i data-lucide="scan-line"></i> Scan Prescription</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = prescriptionsList.map(rx => {
      // Build medicine table rows
      const medRows = rx.medicines.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.dosage || '-'}</td>
          <td>${m.frequency || 'Daily'}</td>
          <td>${m.duration || '-'}</td>
        </tr>
      `).join('');

      return `
        <div class="glass-card rx-card">
          <div>
            <div class="rx-header">
              <div>
                <div class="rx-doctor">${rx.doctorName}</div>
                <div style="font-size: 0.75rem; color: var(--primary); font-weight: 500;">${rx.hospitalName || 'Clinic'}</div>
              </div>
              <span class="badge badge-info">${new Date(rx.date).toLocaleDateString()}</span>
            </div>

            <div class="rx-details">
              ${rx.notes ? `<div style="margin-bottom: 8px;"><strong>Notes:</strong> ${rx.notes}</div>` : ''}
              
              <table class="rx-med-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose</th>
                    <th>Freq</th>
                    <th>Dur</th>
                  </tr>
                </thead>
                <tbody>
                  ${medRows}
                </tbody>
              </table>
            </div>
          </div>

          <div class="rx-footer">
            <div>
              ${rx.fileUrl ? `
                <a href="${rx.fileUrl}" target="_blank" class="rx-image-link">
                  <i data-lucide="image" style="width: 14px; height: 14px;"></i> View Attachment
                </a>
              ` : '<span style="font-size: 0.8rem; color: var(--text-secondary);">No attachment</span>'}
            </div>
            <button class="btn btn-danger btn-icon" onclick="deletePrescription('${rx._id}')" title="Delete Prescription">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } else {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--error); padding: 48px;">Failed to retrieve prescriptions from the database.</div>`;
  }
}
