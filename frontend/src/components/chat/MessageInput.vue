<template>
  <div class="message-input">
    <div class="input-container">
      <input 
        type="text" 
        v-model="messageText" 
        @keyup.enter="handleSend"
        placeholder="Napisz wiadomość..."
      />
      <button class="attach-button" @click="triggerFileInput">
        <img src="/clip.svg" alt="Paperclip" />
      </button>
    </div>
    <button class="send-button" @click="handleSend">Wyślij</button>
    <input 
      type="file"
      ref="fileInput"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fileManagerService } from '@/services/FileManagerService';

let messageText = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  (e: 'sendMessage', message: string): void
}>();

const handleSend = () => {
  if (messageText.value.trim()) {
    emit('sendMessage', messageText.value);
    messageText.value = '';
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    try {
      const file = input.files[0];
      const uploadedFile = await fileManagerService.uploadFile(file);
      console.log('File uploaded:', uploadedFile);
      // Tutaj możemy dodać logikę wysyłania wiadomości z informacją o pliku
      messageText.value = `[Plik: ${uploadedFile.original_name}]`;
    } catch (error) {
      console.error('Upload failed:', error);
    }
    // Wyczyść input, żeby można było wybrać ten sam plik ponownie
    input.value = '';
  }
};
</script>

<style scoped>
.message-input {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
  background: var(--bg-header);
  border-bottom-left-radius: var(--border-radius-lg);
  border-bottom-right-radius: var(--border-radius-lg);
}

.input-container {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 10px;
  background: var(--color-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.input-container input {
  flex: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  background: transparent;
  color: var(--text-primary);
}

.input-container input:focus {
  outline: none;
}

.attach-button {
  height: 1rem;
  width: 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.attach-button:hover {
  background: var(--color-secondary-t30);
}

.attach-button img {
  height: 1rem;
  width: 1rem;
}

.hidden {
  display: none;
}

.send-button{
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background: var(--color-primary-hover);
}
</style> 