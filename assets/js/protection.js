/** Casual-inspection deterrents only; browser developer tools cannot be securely disabled. */
(() => {
  if (window.__mkProtectionLoaded) return;
  window.__mkProtectionLoaded = true;

  document.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('keydown', event => {
    const key = String(event.key || '').toLowerCase();
    const blocked = key === 'f12' ||
      (event.ctrlKey && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) ||
      (event.ctrlKey && ['u'].includes(key)) ||
      (event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key));
    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
})();
