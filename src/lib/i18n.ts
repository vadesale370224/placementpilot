export function getLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : 'en';
}

export function setLocale(locale: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  // Refresh page to apply translations dynamically
  window.location.reload();
}
