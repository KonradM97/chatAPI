<template>
  <div :data-theme="settingsStore.isDarkMode ? 'dark' : 'light'">
    <button class="theme-toggle" @click="settingsStore.toggleTheme">
      {{ settingsStore.isDarkMode ? '☀️' : '🌙' }}
    </button>
    <AppWrapper ref="appWrapper">
      <ChatWindow ref="chatWindow" />
    </AppWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppWrapper from './components/AppWrapper.vue';
import ChatWindow from './components/chat/ChatWindow.vue';
import { useSettingsStore } from './stores/settings';

const settingsStore = useSettingsStore();
const appWrapper = ref<InstanceType<typeof AppWrapper> | null>(null);
const chatWindow = ref<InstanceType<typeof ChatWindow> | null>(null);

onMounted(() => {
  if (appWrapper.value && chatWindow.value) {
    appWrapper.value.setChatWindowRef(chatWindow.value);
  }
});
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
