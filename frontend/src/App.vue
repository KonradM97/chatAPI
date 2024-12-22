<template>
  <div :data-theme="settingsStore.isDarkMode ? 'dark' : 'light'">
    <button class="theme-toggle" @click="settingsStore.toggleTheme">
      {{ settingsStore.isDarkMode ? '☀️' : '🌙' }}
    </button>
    <AppWrapper>
      <ChatWindow />
    </AppWrapper>
  </div>
</template>

<script setup lang="ts">
import AppWrapper from './components/AppWrapper.vue';
import ChatWindow from './components/chat/ChatWindow.vue';
import { useSettingsStore } from './stores/settings';

const settingsStore = useSettingsStore();
</script>

<style>
.theme-toggle{
  position: fixed;
  top: 20px;
  right: 15px;
  padding: 10px;
  border-radius: 50%;
  border: none;
  background: var(--bg-main);
  cursor: pointer;
  font-size: 20px;
  box-shadow: var(--shadow-sm);
}

.theme-toggle:hover{
  background: var(--bg-secondary);
}
</style>
