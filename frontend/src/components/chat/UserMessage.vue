<template>
  <div class="user-message" :title="`System Prompt: ${message.systemPrompt.content}`">
    <div class="message-content">
      {{ message.text }}
    </div>
    <div class="message-timestamp">
      {{ message.getFormattedTime() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserMessage } from '@/classes/chat/UserMessage';

defineProps<{
  message: UserMessage;
}>();
</script>

<style scoped>
.user-message {
  padding: 12px 16px;
  background-color: #e3f2fd;
  border-radius: var(--border-radius);
  max-width: 80%;
  width: fit-content;
  margin-left: auto;
  word-wrap: break-word;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.message-timestamp {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  position: absolute;
  bottom: 4px;
  right: 8px;
}

.message-content {
  margin-bottom: 16px;
}
</style> 