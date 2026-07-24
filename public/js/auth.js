/* SwasthyaSetu Authentication Handlers */
import { apiFetch, setToken, isAuthenticated, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect away from login/register pages
  const currentPath = window.location.pathname;
  if (isAuthenticated() && (currentPath.includes('login') || currentPath.includes('register'))) {
    window.location.href = '/dashboard.html';
    return;
  }

  // Handle Login Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showToast('Input Error', 'Please complete all form fields', 'error');
        return;
      }

      // Show loader on button
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Signing In...';
      submitBtn.disabled = true;

      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (result.success) {
        setToken(result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        showToast('Welcome Back', 'Logging you in...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } else {
        showToast('Login Failed', result.error, 'error');
      }
    });
  }

  // Handle Registration Submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (!name || !email || !password) {
        showToast('Input Error', 'Please complete all required fields', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Security Rule', 'Password must exceed 6 characters', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Input Error', 'Passwords do not match', 'error');
        return;
      }

      // Show loader
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Creating Account...';
      submitBtn.disabled = true;

      const result = await apiFetch('/auth/register', {
        method: 'POST',
        body: { name, email, password }
      });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (result.success) {
        setToken(result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        showToast('Registration Successful', 'Account created successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } else {
        showToast('Sign Up Failed', result.error, 'error');
      }
    });
  }
});
