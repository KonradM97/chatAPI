<template>
  <div class="message-input">
    <input 
      type="text" 
      v-model="messageText" 
      @keyup.enter="handleSend"
      placeholder="Napisz wiadomość..."
    />
    <button @click="handleSend">Wyślij</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

let messageText = ref('');

const emit = defineEmits<{
  (e: 'sendMessage', message: string): void
}>();

const handleSend = () => {
  if (messageText.value.trim()) {
    emit('sendMessage', messageText.value);
    messageText.value = '';
  }
};
</script>

<style scoped>
.message-input{
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
  background: var(--bg-header);
  border-bottom-left-radius: var(--border-radius-lg);
  border-bottom-right-radius: var(--border-radius-lg);
}

.message-input input{
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  background: var(--color-secondary);
  color: var(--text-primary);
}

.message-input input:focus{
  outline: none;
  border-color: var(--color-primary);
}

.message-input button{
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-input button:hover{
  background: var(--color-primary-hover);
}
</style> 