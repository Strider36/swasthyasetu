/* SwasthyaSetu Shell Layout Controller */
import { isAuthenticated, apiFetch, logout, initTheme } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session Guard: Check authorization status
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  // 2. Initialize Dark Mode setting
  initTheme();

  // 3. Inject Layout Shell Components
  const sidebarContainer = document.getElementById('app-sidebar');
  const navbarContainer = document.getElementById('app-navbar');

  if (sidebarContainer) {
    injectSidebar(sidebarContainer);
  }

  if (navbarContainer) {
    injectNavbar(navbarContainer);
  }

  // 4. Trigger Lucide Icons Rendering
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 5. Load User Profile Header Information
  loadUserHeader();

  // 6. Register Navigation Interactivity
  registerNavHandlers();

  // 7. Fetch Notifications & Reminders
  loadNotifications();
});

// Sidebar Injection Helper
function injectSidebar(container) {
  const activePage = container.getAttribute('data-active') || 'dashboard';

  container.className = 'sidebar';
  container.innerHTML = `
    <div class="sidebar-logo">
      <svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      <span>SwasthyaSetu</span>
    </div>
    <ul class="sidebar-menu">
      <li class="sidebar-item ${activePage === 'dashboard' ? 'active' : ''}"><a href="/dashboard.html"><i data-lucide="layout-dashboard"></i> Dashboard</a></li>
      <li class="sidebar-item ${activePage === 'medicines' ? 'active' : ''}"><a href="/medicines.html"><i data-lucide="pill"></i> Medications</a></li>
      <li class="sidebar-item ${activePage === 'scanner' ? 'active' : ''}"><a href="/scanner.html"><i data-lucide="scan-line"></i> OCR Scanner</a></li>
      <li class="sidebar-item ${activePage === 'prescriptions' ? 'active' : ''}"><a href="/prescriptions.html"><i data-lucide="file-signature"></i> Prescriptions</a></li>
      <li class="sidebar-item ${activePage === 'records' ? 'active' : ''}"><a href="/records.html"><i data-lucide="folder-heart"></i> Health Records</a></li>
      <li class="sidebar-item ${activePage === 'appointments' ? 'active' : ''}"><a href="/appointments.html"><i data-lucide="calendar"></i> Appointments</a></li>
      <li class="sidebar-item ${activePage === 'profile' ? 'active' : ''}"><a href="/profile.html"><i data-lucide="user-cog"></i> Profile Card</a></li>
      <li class="sidebar-item ${activePage === 'settings' ? 'active' : ''}"><a href="/settings.html"><i data-lucide="settings"></i> Settings</a></li>
      <li class="sidebar-item logout"><a href="#" id="btn-logout"><i data-lucide="log-out"></i> Logout</a></li>
    </ul>
  `;
}

// Navbar Injection Helper
function injectNavbar(container) {
  const pageTitle = container.getAttribute('data-title') || 'Dashboard';
  const pageSubtitle = container.getAttribute('data-subtitle') || 'Healthcare Summary';

  container.className = 'navbar';
  container.innerHTML = `
    <div class="nav-left">
      <button class="nav-toggle" id="sidebar-toggle">
        <i data-lucide="menu"></i>
      </button>
      <div>
        <h2 class="page-title">${pageTitle}</h2>
        <p class="page-subtitle" style="margin-top: 0; font-size: 0.8rem;">${pageSubtitle}</p>
      </div>
    </div>
    <div class="nav-right">
      <div style="position: relative;">
        <button class="btn btn-secondary btn-icon" id="btn-notifications" style="border-radius: var(--radius-full); position: relative; padding: 8px;">
          <i data-lucide="bell"></i>
          <span id="notification-badge" style="display: none; position: absolute; top: 0px; right: 0px; width: 8px; height: 8px; background-color: var(--error); border-radius: 50%;"></span>
        </button>
        
        <div id="notifications-dropdown" style="display: none; position: absolute; top: 46px; right: 0; width: 320px; background-color: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 1000; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <span style="font-weight: 600; font-size: 0.9rem;">Alerts & Reminders</span>
            <button id="btn-clear-notifications" style="background: none; border: none; color: var(--primary); font-size: 0.75rem; cursor: pointer; font-weight: 500;">Clear All</button>
          </div>
          <div id="notifications-list" style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            <div style="text-align: center; color: var(--text-secondary); font-size: 0.8rem; padding: 12px;">Checking for alerts...</div>
          </div>
        </div>
      </div>
      
      <div class="nav-profile" onclick="window.location.href='/profile.html'">
        <div class="nav-avatar" id="navbar-avatar">U</div>
        <span class="nav-username" id="navbar-username">User</span>
      </div>
    </div>
  `;
}

// Bind header data
function loadUserHeader() {
  const cachedUserStr = localStorage.getItem('user');
  if (cachedUserStr) {
    try {
      const user = JSON.parse(cachedUserStr);
      const name = user.name || 'User';
      const initial = name.charAt(0).toUpperCase();

      const avatarEl = document.getElementById('navbar-avatar');
      const usernameEl = document.getElementById('navbar-username');

      if (avatarEl) avatarEl.textContent = initial;
      if (usernameEl) usernameEl.textContent = name.split(' ')[0]; // first name
    } catch (e) {
      console.error('Failed to parse cached user header:', e);
    }
  }
}

// Bind events to injected nodes
function registerNavHandlers() {
  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Sidebar toggle for smaller screens
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar clicking outside
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Notifications drawer dropdown toggle
  const notificationsBtn = document.getElementById('btn-notifications');
  const dropdown = document.getElementById('notifications-dropdown');
  if (notificationsBtn && dropdown) {
    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Notifications clear
  const clearBtn = document.getElementById('btn-clear-notifications');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const res = await apiFetch('/notifications/read-all', { method: 'PUT' });
      if (res.success) {
        loadNotifications();
      }
    });
  }
}

// Load and render dynamic notifications
export async function loadNotifications() {
  const badge = document.getElementById('notification-badge');
  const list = document.getElementById('notifications-list');
  if (!list) return;

  const response = await apiFetch('/notifications');
  if (response.success) {
    const unread = response.data.filter(n => !n.isRead);
    
    if (unread.length > 0) {
      if (badge) badge.style.display = 'block';
    } else {
      if (badge) badge.style.display = 'none';
    }

    if (response.data.length === 0) {
      list.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.8rem; padding: 12px;">No reminders found</div>`;
      return;
    }

    list.innerHTML = response.data
      .map(item => `
        <div class="notification-item" style="padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background-color: ${item.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.03)'}; display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; cursor: pointer;" data-id="${item._id}">
          <div style="font-weight: 600; display: flex; justify-content: space-between;">
            <span>${item.title}</span>
            <span style="font-size: 0.7rem; color: var(--text-secondary);">${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="color: var(--text-secondary);">${item.message}</div>
        </div>
      `).join('');

    // Bind read action triggers on notification click
    list.querySelectorAll('.notification-item').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.getAttribute('data-id');
        const res = await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        if (res.success) {
          loadNotifications();
        }
      });
    });
  } else {
    list.innerHTML = `<div style="text-align: center; color: var(--error); font-size: 0.8rem; padding: 12px;">Failed to load alerts</div>`;
  }
}

// Trigger browser reminders dynamically
export function triggerReminderAudio() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3); // play for 300ms
  } catch (err) {
    console.log('AudioContext not allowed or not supported yet:', err);
  }
}
