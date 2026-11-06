/**
 * MOHAMED KHAMIS — Theme Manager (Dark Mode & Light Mode)
 * Default: Dark Mode (Minimal Luxury), with support for Light Mode.
 */

class ThemeManager {
  constructor() {
    this.storageKey = 'mk_theme';
    this.currentTheme = localStorage.getItem(this.storageKey) || 'dark';
    this.subscribers = [];
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupListeners();
  }

  getTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
    this.notifySubscribers();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');

    // Update theme toggle icons if present
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      const icon = btn.querySelector('.theme-icon');
      if (icon) {
        icon.innerHTML = theme === 'dark' 
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }
    });
  }

  setupListeners() {
    // Listen for system preference if user hasn't set explicit manual preference
    if (!localStorage.getItem(this.storageKey)) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        this.setTheme(e.matches ? 'light' : 'dark');
      });
    }
  }

  onThemeChange(cb) {
    this.subscribers.push(cb);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try { cb(this.currentTheme); } catch (e) { console.error('Theme callback error:', e); }
    });
  }
}

export const themeManager = new ThemeManager();
