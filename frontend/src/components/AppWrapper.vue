<template>
  <div class="app-wrapper">
    <div class="windows-container">
      <ChatHistoryWindow />
      <div class="chat-window-wrapper">
        <slot></slot>
      </div>
      <ChatConfigWindow />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatHistoryWindow from './chat-history/ChatHistoryWindow.vue';
import ChatConfigWindow from './chat-config/ChatConfigWindow.vue';
</script>

<style scoped>
.app-wrapper{
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
}

.windows-container{
  display: flex;
  align-items: stretch;
  height: 100%;
  width: 100%;
  gap: 20px;
}

.chat-window-wrapper{
  flex: 1;
  min-width: 0; /* ważne dla poprawnego działania flex-grow */
}
</style> 