<template>
  <div class="history-window">
    <div class="history-header">
      <h2>Historia czatów</h2>
      <button class="new-chat-button" @click="createNewConversation">
        <i class="fas fa-plus"></i>
      </button>
    </div>
    
    <div class="history-content" data-simplebar>
      <div class="chat-list">
        <ChatConversation
          v-for="conversation in conversations"
          :key="conversation.id"
          :conversation="conversation"
          :is-active="activeConversationId === conversation.id"
          @select="handleConversationSelect"
          @delete="handleConversationDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue';
import ChatConversation from './ChatConversation.vue';
import { chatHistoryService } from '@/services/ChatHistoryService';
import type { ChatHistory } from '@/classes/chat/ChatHistory';
import type { Message } from '@/classes/chat/Message';

const emit = defineEmits<{
  (e: 'select-conversation', messages: Message[], conversationId: string, systemPrompt: SystemPrompt): void;
}>();

const conversations = ref<ChatHistory[]>([]);
const activeConversationId = ref<string | null>(null);

const loadConversations = async () => {
  try {
    conversations.value = await chatHistoryService.getAllConversations();
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
};

const handleConversationSelect = async (conversation: ChatHistory) => {
  try {
    activeConversationId.value = conversation.id;
    const { messages, systemPrompt } = await chatHistoryService.getConversationById(conversation.id);
    emit('select-conversation', messages, conversation.id, systemPrompt);
  } catch (error) {
    console.error('Error loading conversation:', error);
  }
};

const createNewConversation = async () => {
  try {
    const newConversation = await chatHistoryService.createConversation('Nowa konwersacja');
    conversations.value.unshift(newConversation); // Dodaj na początek listy
    handleConversationSelect(newConversation); // Od razu wybierz nową konwersację
  } catch (error) {
    console.error('Error creating new conversation:', error);
  }
};

const handleConversationDelete = (conversation: ChatHistory) => {
  conversations.value = conversations.value.filter(c => c.id !== conversation.id);
  if (activeConversationId.value === conversation.id) {
    activeConversationId.value = null;
  }
};

onMounted(() => {
  loadConversations();
});
</script>

<style scoped>
.history-window{
  width: 19%;
  height: 100%;
  background: var(--bg-main);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.history-header{
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-header);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header h2{
  color: var(--text-primary);
  font-weight: 500;
}

.history-content{
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.chat-list{
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-chat-button {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.new-chat-button:hover {
  background: var(--bg-secondary-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.new-chat-button i {
  font-size: 14px;
}
</style> 