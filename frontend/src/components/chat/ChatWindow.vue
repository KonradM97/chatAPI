<template>
  <div class="chat-window">
    <div class="chat-header">
      <div class="header-content">
        <h2>Chat</h2>
        <div class="system-prompt-input" @click="showPromptPopup = true">
          <input type="text" v-model="systemPrompt.content" placeholder="Jesteś pomocnym asystentem" @click="showPromptPopup = true"/>
        </div>
      </div>
    </div>
    <div class="chat-messages" data-simplebar>
      <div v-for="message in messages" :key="message.id" class="message-container">
        <UserMessage 
          v-if="message.isUser()" 
          :message="message" 
        />
        <SystemMessage
          v-else-if="message.isSystem()"
          :message="message"
        />
        <AIMessage 
          v-else 
          :message="message" 
        />
      </div>
    </div>

    <MessageInput @send-message="handleNewMessage" />

    <SystemPromptPopup
      v-model:is-visible="showPromptPopup"
      :initial-prompt="systemPrompt.content"
      @save="handleSystemPromptUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MessageInput from './MessageInput.vue';
import SystemPromptPopup from './SystemPromptPopup.vue';
import UserMessage from './UserMessage.vue';
import AIMessage from './AIMessage.vue';
import SystemMessage from './SystemMessage.vue';
import { aiService } from '@/services/AIService';
import { UserMessage as UserMessageClass } from '@/classes/chat/UserMessage';
import { AIMessage as AIMessageClass } from '@/classes/chat/AIMessage';
import { SystemPrompt } from '@/classes/chat/SystemPrompt';
import type { Message } from '@/classes/chat/Message';
import { SystemMessage as SystemMessageClass } from '@/classes/chat/SystemMessage';

const messages = ref<(UserMessageClass | AIMessageClass | SystemMessageClass)[]>([]);
const currentConversationId = ref<string | null>(null);
const messageCounter = ref(0);
const DEFAULT_SYSTEM_PROMPT = new SystemPrompt(
  'Jesteś pomocnym asystentem',
  'Domyślny'
);
let systemPrompt = ref<SystemPrompt>(DEFAULT_SYSTEM_PROMPT);
let showPromptPopup = ref(false);

const loadMessages = async (newMessages: Message[], conversationId: string, newSystemPrompt?: SystemPrompt) => {
  messages.value = newMessages as (UserMessageClass | AIMessageClass | SystemMessageClass)[];
  currentConversationId.value = conversationId;
  if (newSystemPrompt) {
    systemPrompt.value = newSystemPrompt;
  }
};

const handleNewMessage = async (text: string) => {
  try {
    messages.value.push(new UserMessageClass(
      ++messageCounter.value,
      text,
      new Date(),
      systemPrompt.value
    ));

    const responseId = ++messageCounter.value;
    messages.value.push(new AIMessageClass(
      responseId,
      '',
      new Date(),
      systemPrompt.value
    ));

    await aiService.streamChatMessage(
      {
        systemPrompt: systemPrompt.value.content,
        userPrompt: text,
        conversationId: currentConversationId.value
      },
      (chunk) => {
        const aiMessage = messages.value.find(m => m.id === responseId);
        if (aiMessage) {
          aiMessage.text += chunk;
        }
      }
    );
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const handleSystemPromptUpdate = (newPrompt: SystemPrompt) => {
  systemPrompt.value = newPrompt;
};

onMounted(() => {
  window.addEventListener('system-prompt-update', ((event: CustomEvent) => {
    systemPrompt.value = event.detail;
  }) as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('system-prompt-update', ((event: CustomEvent) => {
    systemPrompt.value = event.detail;
  }) as EventListener);
});

defineExpose({ loadMessages });
</script>

<style scoped>
.chat-window{
  height: 100%;
  background: var(--bg-main);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.chat-header{
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-header);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
}

.header-content{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content h2{
  color: var(--text-primary);
  font-weight: 500;
}

.system-prompt-input{
  max-height: 36px;
  flex: 1;
  padding-left: 4px;
  background: var(--color-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
}

.system-prompt-input:hover{
  background: var(--color-secondary-hover);
}

.system-prompt-input input{
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-primary);
}

.system-prompt-input input:focus{
  outline: none;
}

.system-prompt-preview{
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
  font-style: italic;
}

.chat-messages{
  flex: 1;
  overflow-y: scroll;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-container {
  margin: 8px 0;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 