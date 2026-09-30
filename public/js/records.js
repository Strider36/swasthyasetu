/* Sanjeev Astra Health Records Controller */
import { apiFetch, showToast } from './api.js';

let activeCategory = 'All';
let searchQuery = '';
let userRecords = [];

document.addEventListener('DOMContentLoaded', () => {
  loadRecords();
  setupFilters();
  setupSearch();

  // Bind modals
  const addBtn = document.getElementById('btn-open-record-modal');
  const modal = document.getElementById('record-modal');
  const closeBtn = document.getElementById('record-modal-close');
  const cancelBtn = document.getElementById('record-modal-cancel');
  const form = document.getElementById('record-form');

  // Default date in form to today
  const dateInput = document.getElementById('rec-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const openModal = () => {
    if (modal) {
      form.reset();
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      modal.classList.add('open');
    }
  };

  const closeModal = () => {
    if (modal) modal.classList.remove('open');
  };

  if (addBtn) addBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Form submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('rec-name').value.trim();
      const category = document.getElementById('rec-cat').value;
      const date = document.getElementById('rec-date').value;
      const notes = document.getElementById('rec-notes').value.trim();
      const fileInput = document.getElementById('rec-file');

      if (!fileInput.files || fileInput.files.length === 0) {
        showToast('File Error', 'Please select a file attachment', 'warning');
        return;
      }

      // Prepare FormData payload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('date', date);
      formData.append('notes', notes);
      formData.append('file', fileInput.files[0]);

      const submitBtn = document.getElementById('btn-record-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Uploading Document...';
      submitBtn.disabled = true;

      const result = await apiFetch('/records', {
        method: 'POST',
        body: formData
      });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (result.success) {
        showToast('Document Uploaded', 'Document added to your Health Locker', 'success');
        closeModal();
        loadRecords();
      } else {
        showToast('Upload Failed', result.error, 'error');
      }
    });
  }

  // Bind delete record action globally
  window.deleteRecord = async (id) => {
    if (confirm('Are you sure you want to permanently delete this document from your locker?')) {
      const res = await apiFetch(`/records/${id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Record Deleted', 'Document deleted successfully', 'success');
        loadRecords();
      } else {
        showToast('Failed to Delete', res.error, 'error');
      }
    }
  };
});

// Configure category selector buttons
function setupFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      loadRecords();
    });
  });
}

// Configure search input (with debounce delay)
function setupSearch() {
  const searchInput = document.getElementById('record-search-input');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.trim();
      loadRecords();
    }, 400); // 400ms delay
  });
}

// Fetch records from Mongoose API with category and search filters
async function loadRecords() {
  const grid = document.getElementById('records-grid-container');
  if (!grid) return;

  const endpoint = `/records?category=${activeCategory}&search=${encodeURIComponent(searchQuery)}`;
  const result = await apiFetch(endpoint);

  if (result.success) {
    userRecords = result.data;

    if (userRecords.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state">
          <div class="empty-icon"><i data-lucide="folder-heart" style="width: 48px; height: 48px;"></i></div>
          <div class="empty-title">No documents found</div>
          <div class="empty-subtitle">Your search query or category filter returned empty results.</div>
          <button class="btn btn-primary" onclick="document.getElementById('btn-open-record-modal').click()"><i data-lucide="plus"></i> Upload Document</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = userRecords.map(rec => {
      // Determine file extension icon
      let fileIcon = 'file-text';
      const ext = rec.fileUrl.split('.').pop().toLowerCase();
      if (['png', 'jpg', 'jpeg'].includes(ext)) fileIcon = 'file-image';
      if (ext === 'pdf') fileIcon = 'file-check';

      let catBadgeClass = 'badge-info';
      if (rec.category === 'Prescription') catBadgeClass = 'badge-success';
      if (rec.category === 'Bill') catBadgeClass = 'badge-warning';
      if (rec.category === 'Insurance') catBadgeClass = 'badge-success';

      return `
        <div class="glass-card record-card">
          <div>
            <div style="display: flex; align-items: start; gap: 12px;">
              <div style="width: 40px; height: 40px; background-color: rgba(59, 130, 246, 0.08); color: var(--primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i data-lucide="${fileIcon}"></i>
              </div>
              <div style="overflow: hidden; width: 100%;">
                <div class="record-title" title="${rec.name}">${rec.name}</div>
                <div class="record-meta">
                  <span class="badge ${catBadgeClass}" style="font-size: 0.65rem;">${rec.category}</span>
                  <span>• ${new Date(rec.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${rec.notes || 'No description'}">
              ${rec.notes || 'No description listed'}
            </div>
          </div>

          <div class="record-footer">
            <a href="${rec.fileUrl}" target="_blank" class="btn btn-secondary btn-icon" style="padding: 6px 12px; font-size: 0.75rem; border-radius: var(--radius-sm);" title="Open / Preview Attachment">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Preview
            </a>
            <button class="btn btn-danger btn-icon" onclick="deleteRecord('${rec._id}')" title="Delete record">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } else {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--error); padding: 48px;">Failed to retrieve document locker databases.</div>`;
  }
}
