<template>
  <div class="message system-message">
    <div class="message-content">
      <span>System Prompt: </span>
      <span class="prompt-text">{{ message.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemMessage } from '@/classes/chat/SystemMessage';

defineProps<{
  message: SystemMessage;
}>();
</script>

<style scoped>
.system-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  max-width: 80%;
}

.message-content {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1rem;
}

.prompt-text {
  font-style: italic;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style> 