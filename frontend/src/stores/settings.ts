import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // Stan
  let isDarkMode = ref(loadThemeFromStorage());

  // Akcje
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
  }

  function setTheme(isDark: boolean) {
    isDarkMode.value = isDark;
  }

  // Obserwator zmian - zapisuje do localStorage
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  });

  // Helpers
  function loadThemeFromStorage(): boolean {
    // Sprawdź localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Jeśli brak zapisanego motywu, sprawdź preferencje systemowe
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return {
    isDarkMode,
    toggleTheme,
    setTheme
  };
}); 