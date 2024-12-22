<template>
  <div class="ai-message" :title="`System Prompt: ${message.systemPrompt.content}`">
    <template v-if="message.text">
      <div class="message-content">
        {{ message.text }}
      </div>
      <div class="message-timestamp">
        {{ message.getFormattedTime() }}
      </div>
    </template>
    <div v-else class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIMessage } from '@/classes/chat/AIMessage';

defineProps<{
  message: AIMessage;
}>();
</script>

<style scoped>
.ai-message {
  padding: 12px 16px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  max-width: 80%;
  width: fit-content;
  margin-right: auto;
  word-wrap: break-word;
  box-shadow: var(--shadow-sm);
  min-height: 24px;
  position: relative;
}

.message-timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
  position: absolute;
  bottom: 4px;
  left: 8px;
}

.message-content {
  margin-bottom: 16px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 24px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--text-primary);
  border-radius: 50%;
  display: inline-block;
  opacity: 0.4;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style> 