/* SwasthyaSetu Dashboard Controller */
import { apiFetch, showToast, triggerReminderAudio } from './api.js';

let activeMedicines = [];
let activeAppointments = [];
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  setupEmergencyModal();
  setupWaterTracker();
});

// Load summary metrics, checklist, and charts
async function loadDashboardData() {
  // Fetch medicines
  const medRes = await apiFetch('/medicines');
  if (medRes.success) {
    activeMedicines = medRes.data;
    document.getElementById('stat-medicines').textContent = activeMedicines.length;
  }

  // Fetch appointments
  const apptRes = await apiFetch('/appointments');
  if (apptRes.success) {
    activeAppointments = apptRes.data.filter(a => a.status === 'Scheduled');
    document.getElementById('stat-appointments').textContent = activeAppointments.length;
  }

  // Compile compliance percentages & render checklist
  buildTodayChecklist();
  calculateAdherenceTrend();
}

// Build checklist of medications scheduled for today (YYYY-MM-DD)
function buildTodayChecklist() {
  const container = document.getElementById('checklist-today');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const checklistItems = [];

  // Parse each medicine schedule to see if it qualifies for today
  activeMedicines.forEach(med => {
    // Check if within start and end dates
    const start = new Date(med.startDate).toISOString().split('T')[0];
    const end = med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : null;

    if (todayStr >= start && (!end || todayStr <= end)) {
      med.timings.forEach(slot => {
        // Find existing history log for today & slot
        const log = med.history.find(h => h.date === todayStr && h.timeSlot === slot);
        checklistItems.push({
          medId: med._id,
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          timeSlot: slot,
          status: log ? log.status : 'Pending'
        });
      });
    }
  });

  // Render checklist container
  if (checklistItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">No medications today</div>
        <div class="empty-subtitle">You have no active medications scheduled for today's slots.</div>
        <a href="/medicines.html" class="btn btn-primary btn-icon"><i data-lucide="plus"></i> Add Medicine</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    document.getElementById('checklist-summary').textContent = '0 left';
    return;
  }

  // Count pending items
  const pendingCount = checklistItems.filter(i => i.status === 'Pending').length;
  document.getElementById('checklist-summary').textContent = `${pendingCount} left`;
  document.getElementById('checklist-summary').className = `badge ${pendingCount === 0 ? 'badge-success' : 'badge-warning'}`;

  container.innerHTML = checklistItems.map(item => {
    let statusClass = '';
    let buttonsHtml = '';
    
    if (item.status === 'Taken') {
      statusClass = 'done';
      buttonsHtml = `
        <span class="badge badge-success"><i data-lucide="check" style="width: 14px; height: 14px;"></i> Taken</span>
        <button class="btn btn-secondary btn-icon btn-log" data-id="${item.medId}" data-slot="${item.timeSlot}" data-status="Pending" title="Reset Status">
          <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
        </button>
      `;
    } else if (item.status === 'Missed') {
      statusClass = 'missed';
      buttonsHtml = `
        <span class="badge badge-danger">Missed</span>
        <button class="btn btn-secondary btn-icon btn-log" data-id="${item.medId}" data-slot="${item.timeSlot}" data-status="Taken" title="Mark Taken">
          <i data-lucide="check" style="width: 14px; height: 14px;"></i>
        </button>
      `;
    } else {
      buttonsHtml = `
        <button class="btn btn-primary btn-icon btn-log" data-id="${item.medId}" data-slot="${item.timeSlot}" data-status="Taken">
          <i data-lucide="check" style="width: 14px; height: 14px;"></i> Taken
        </button>
        <button class="btn btn-danger btn-icon btn-log" data-id="${item.medId}" data-slot="${item.timeSlot}" data-status="Missed">
          <i data-lucide="x" style="width: 14px; height: 14px;"></i> Missed
        </button>
      `;
    }

    return `
      <div class="checklist-item ${statusClass}">
        <div class="checklist-info">
          <div class="checklist-title">${item.name} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-secondary);">(${item.dosage})</span></div>
          <div class="checklist-meta">${item.timeSlot} slot • ${item.instructions || 'No instructions'}</div>
        </div>
        <div class="checklist-actions">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Attach event handlers to buttons
  container.querySelectorAll('.btn-log').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.currentTarget;
      const id = target.getAttribute('data-id');
      const slot = target.getAttribute('data-slot');
      const status = target.getAttribute('data-status');

      const res = await apiFetch(`/medicines/${id}/log`, {
        method: 'POST',
        body: { date: todayStr, timeSlot: slot, status }
      });

      if (res.success) {
        if (status === 'Taken') {
          triggerReminderAudio();
          showToast('Adherence Saved', 'Medication marked as taken!', 'success');
        }
        loadDashboardData();
      } else {
        showToast('Error', res.error, 'error');
      }
    });
  });
}

// Calculate adherence over the past 7 days and draw chart.js visual
function calculateAdherenceTrend() {
  const complianceText = document.getElementById('compliance-text');
  const complianceRing = document.getElementById('compliance-ring');

  const daysLabel = [];
  const complianceData = [];

  const now = new Date();
  
  // Calculate stats for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Day label (e.g. Mon, Tue)
    daysLabel.push(d.toLocaleDateString([], { weekday: 'short' }));

    // Count scheduled medicines on this day
    let totalScheduled = 0;
    let totalTaken = 0;

    activeMedicines.forEach(med => {
      const start = new Date(med.startDate).toISOString().split('T')[0];
      const end = med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : null;

      if (dateStr >= start && (!end || dateStr <= end)) {
        med.timings.forEach(slot => {
          totalScheduled++;
          const log = med.history.find(h => h.date === dateStr && h.timeSlot === slot);
          if (log && log.status === 'Taken') {
            totalTaken++;
          }
        });
      }
    });

    const rate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;
    complianceData.push(rate);
  }

  // Calculate current today/weekly average compliance
  const sum = complianceData.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / complianceData.length);
  
  if (complianceText) complianceText.textContent = `${avg}%`;
  
  // Set SVG progress ring stroke offset (circumference = 201.06)
  if (complianceRing) {
    const offset = 201.06 - (avg / 100) * 201.06;
    complianceRing.style.strokeDashoffset = offset;
  }

  // Draw/update Chart.js Adherence Curve
  const ctx = document.getElementById('adherence-chart');
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isDark = document.body.classList.contains('dark');
  const gridColor = isDark ? '#1F2937' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: daysLabel,
      datasets: [{
        label: 'Adherence Rate (%)',
        data: complianceData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Inter' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Inter' } }
        }
      }
    }
  });
}

// Emergency Modal Drawer integration
function setupEmergencyModal() {
  const triggerBtn = document.getElementById('btn-trigger-emergency');
  const modal = document.getElementById('emergency-modal');
  const closeBtn = document.getElementById('emergency-modal-close');

  if (!triggerBtn || !modal) return;

  triggerBtn.addEventListener('click', async () => {
    // Fetch profile data
    const res = await apiFetch('/auth/me');
    if (res.success && res.data) {
      const user = res.data;
      
      document.getElementById('emerg-name').textContent = user.name || 'Patient';
      document.getElementById('emerg-avatar').textContent = (user.name || 'P').charAt(0).toUpperCase();
      document.getElementById('emerg-blood').textContent = user.bloodGroup || 'Not specified';
      
      const ageStr = user.age ? `${user.age} Years` : 'Age unknown';
      const genderStr = user.gender ? `, ${user.gender}` : '';
      document.getElementById('emerg-age').textContent = `${ageStr}${genderStr}`;

      // Render Allergies
      const allergyContainer = document.getElementById('emerg-allergies');
      if (user.allergies && user.allergies.length > 0) {
        allergyContainer.innerHTML = user.allergies.map(a => `<span class="badge badge-danger">${a}</span>`).join('');
      } else {
        allergyContainer.innerHTML = `<span class="badge badge-success">No allergies listed</span>`;
      }

      // Render Conditions
      const conditionContainer = document.getElementById('emerg-conditions');
      if (user.conditions && user.conditions.length > 0) {
        conditionContainer.innerHTML = user.conditions.map(c => `<span class="badge badge-warning">${c}</span>`).join('');
      } else {
        conditionContainer.innerHTML = `<span class="badge badge-success">No chronic conditions listed</span>`;
      }

      // Render Emergency Contacts
      const contactContainer = document.getElementById('emerg-contacts');
      if (user.emergencyContacts && user.emergencyContacts.length > 0) {
        contactContainer.innerHTML = user.emergencyContacts.map(c => `
          <div style="padding: 12px; background-color: var(--background); border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${c.name} (${c.relationship})</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Phone: ${c.phone}</div>
            </div>
            <a href="tel:${c.phone}" class="btn btn-secondary btn-icon" style="border-radius: var(--radius-full);">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--primary)" stroke-width="2" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
          </div>
        `).join('');
      } else {
        contactContainer.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; padding: 10px; border: 1px dashed var(--border); border-radius: var(--radius-md);">No emergency contacts configured. Please configure in profile settings.</div>`;
      }

      modal.classList.add('open');
    }
  });

  const closeModal = () => modal.classList.remove('open');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

// Hydration Tracker state logic (stored locally per browser session/cache)
function setupWaterTracker() {
  const countEl = document.getElementById('water-count');
  const addBtn = document.getElementById('btn-add-water');
  if (!countEl || !addBtn) return;

  const todayKey = `water_${new Date().toISOString().split('T')[0]}`;
  let glasses = parseInt(localStorage.getItem(todayKey)) || 0;

  countEl.textContent = `${glasses} / 8 glasses`;

  addBtn.addEventListener('click', () => {
    glasses = (glasses + 1) % 12; // cap at 11 or rotate
    localStorage.setItem(todayKey, glasses);
    countEl.textContent = `${glasses} / 8 glasses`;
    
    if (glasses === 8) {
      triggerReminderAudio();
      showToast('Hydrated!', 'Great job! You met your daily water intake goal of 8 glasses!', 'success');
    } else {
      showToast('Water Logged', 'Stay hydrated!', 'info');
    }
  });
}
