/* Sanjeev Astra Profile Manager */
import { apiFetch, showToast } from './api.js';

let activeAllergies = [];
let activeConditions = [];
let activeContacts = [];

document.addEventListener('DOMContentLoaded', () => {
  loadProfileData();

  // Bind tag inputs
  const allergyInput = document.getElementById('allergy-input');
  if (allergyInput) {
    allergyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = allergyInput.value.trim();
        if (value && !activeAllergies.includes(value)) {
          activeAllergies.push(value);
          allergyInput.value = '';
          renderAllergies();
        }
      }
    });
  }

  const conditionInput = document.getElementById('condition-input');
  if (conditionInput) {
    conditionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = conditionInput.value.trim();
        if (value && !activeConditions.includes(value)) {
          activeConditions.push(value);
          conditionInput.value = '';
          renderConditions();
        }
      }
    });
  }

  // Bind Emergency Contacts dialog modal
  const addContactBtn = document.getElementById('btn-add-contact');
  const modal = document.getElementById('contact-modal');
  const contactForm = document.getElementById('contact-form');
  const closeBtn = document.getElementById('contact-modal-close');
  const cancelBtn = document.getElementById('contact-modal-cancel');

  if (addContactBtn && modal) {
    addContactBtn.addEventListener('click', () => modal.classList.add('open'));
  }

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('open');
      contactForm.reset();
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const relationship = document.getElementById('contact-relation').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();

      if (name && relationship && phone) {
        activeContacts.push({ name, relationship, phone });
        renderContacts();
        closeModal();
        showToast('Emergency Contact Added', `${name} added temporarily. Save the profile to persist changes.`, 'warning');
      }
    });
  }

  // Form submission handler
  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('profile-name').value.trim();
      const age = parseInt(document.getElementById('profile-age').value) || null;
      const gender = document.getElementById('profile-gender').value;
      const bloodGroup = document.getElementById('profile-blood').value;
      const height = parseInt(document.getElementById('profile-height').value) || null;
      const weight = parseFloat(document.getElementById('profile-weight').value) || null;

      const payload = {
        name,
        age,
        gender,
        bloodGroup,
        height,
        weight,
        allergies: activeAllergies,
        conditions: activeConditions,
        emergencyContacts: activeContacts
      };

      const result = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: payload
      });

      if (result.success) {
        showToast('Success', 'Medical profile updated successfully', 'success');
        
        // Update user cache in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.name = result.data.name;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Sync header username display
        const usernameEl = document.getElementById('navbar-username');
        if (usernameEl) usernameEl.textContent = result.data.name.split(' ')[0];

        // Rerender summary card
        updateSummaryCard(result.data);
      } else {
        showToast('Profile Error', result.error, 'error');
      }
    });
  }
});

// Fetch values from Mongoose API
async function loadProfileData() {
  const result = await apiFetch('/auth/me');
  if (result.success && result.data) {
    const user = result.data;
    
    // Set text fields
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-age').value = user.age || '';
    document.getElementById('profile-gender').value = user.gender || '';
    document.getElementById('profile-blood').value = user.bloodGroup || '';
    document.getElementById('profile-height').value = user.height || '';
    document.getElementById('profile-weight').value = user.weight || '';

    // Assign arrays
    activeAllergies = user.allergies || [];
    activeConditions = user.conditions || [];
    activeContacts = user.emergencyContacts || [];

    // Render elements
    renderAllergies();
    renderConditions();
    renderContacts();
    updateSummaryCard(user);
  } else {
    showToast('Fetch Error', 'Failed to retrieve profile metadata.', 'error');
  }
}

// Rendering routines
function renderAllergies() {
  const container = document.getElementById('allergies-list-edit');
  if (!container) return;

  container.innerHTML = activeAllergies
    .map((alg, index) => `
      <span class="tag-item">
        ${alg}
        <span class="tag-remove" data-index="${index}">&times;</span>
      </span>
    `).join('');

  container.querySelectorAll('.tag-remove').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      activeAllergies.splice(idx, 1);
      renderAllergies();
    });
  });
}

function renderConditions() {
  const container = document.getElementById('conditions-list-edit');
  if (!container) return;

  container.innerHTML = activeConditions
    .map((cond, index) => `
      <span class="tag-item">
        ${cond}
        <span class="tag-remove" data-index="${index}">&times;</span>
      </span>
    `).join('');

  container.querySelectorAll('.tag-remove').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      activeConditions.splice(idx, 1);
      renderConditions();
    });
  });
}

function renderContacts() {
  const container = document.getElementById('contacts-container');
  if (!container) return;

  if (activeContacts.length === 0) {
    container.innerHTML = `<div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); padding: 12px; border: 1px dashed var(--border); border-radius: var(--radius-md);">No emergency contacts configured yet</div>`;
    return;
  }

  container.innerHTML = activeContacts
    .map((contact, index) => `
      <div class="contact-item">
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">${contact.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${contact.relationship} • ${contact.phone}</div>
        </div>
        <button type="button" class="btn btn-danger btn-icon btn-remove-contact" data-index="${index}">
          <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    `).join('');

  if (window.lucide) {
    window.lucide.createIcons();
  }

  container.querySelectorAll('.btn-remove-contact').forEach(el => {
    el.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const idx = parseInt(btn.getAttribute('data-index'));
      activeContacts.splice(idx, 1);
      renderContacts();
    });
  });
}

function updateSummaryCard(user) {
  document.getElementById('card-name').textContent = user.name || 'User Name';
  document.getElementById('card-email').textContent = user.email || 'user@example.com';
  document.getElementById('card-blood').textContent = user.bloodGroup || '-';
  document.getElementById('card-age').textContent = user.age ? `${user.age} yrs` : '-';
  document.getElementById('card-height').textContent = user.height ? `${user.height} cm` : '-';
  document.getElementById('card-weight').textContent = user.weight ? `${user.weight} kg` : '-';

  // Render left summary static tag lists
  const allergySummary = document.getElementById('card-allergies');
  if (allergySummary) {
    if (activeAllergies.length === 0) {
      allergySummary.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-secondary);">No active allergies</span>`;
    } else {
      allergySummary.innerHTML = activeAllergies.map(a => `<span class="badge badge-danger" style="font-size: 0.7rem; border-radius: var(--radius-sm);">${a}</span>`).join('');
    }
  }

  const condSummary = document.getElementById('card-conditions');
  if (condSummary) {
    if (activeConditions.length === 0) {
      condSummary.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-secondary);">No conditions reported</span>`;
    } else {
      condSummary.innerHTML = activeConditions.map(c => `<span class="badge badge-info" style="font-size: 0.7rem; border-radius: var(--radius-sm);">${c}</span>`).join('');
    }
  }
}
