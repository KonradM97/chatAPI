<template>
  <div class="app-wrapper">
    <div class="windows-container">
      <ChatHistoryWindow @select-conversation="handleConversationSelect" />
      <div class="chat-window-wrapper">
        <slot></slot>
      </div>
      <ChatConfigWindow />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatHistoryWindow from './chat-history/ChatHistoryWindow.vue';
import ChatConfigWindow from './chat-config/ChatConfigWindow.vue';
import type { Message } from '@/classes/chat/Message';

// Referencja do ChatWindow będzie przekazywana przez slot
const chatWindow = ref<any>(null); // Możemy później dodać typowanie

const handleConversationSelect = (messages: Message[], conversationId: string) => {
  // Zakładając, że ChatWindow jest dostępny przez ref z komponentu nadrzędnego
  if (chatWindow.value) {
    chatWindow.value.loadMessages(messages, conversationId);
  }
};

// Eksponujemy metodę setChatWindowRef dla komponentu nadrzędnego
const setChatWindowRef = (ref: any) => {
  chatWindow.value = ref;
};

defineExpose({ setChatWindowRef });
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