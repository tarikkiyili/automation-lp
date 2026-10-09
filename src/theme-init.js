// Apply the colour preference before Angular and CSS paint. No inline script is
// needed, so production's script-src 'self' policy can stay restrictive.
(() => {
  let theme;
  try { theme = localStorage.getItem('randevu.theme'); } catch { /* Storage is optional. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'light';
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
