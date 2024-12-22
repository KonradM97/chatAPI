<template>
  <div v-if="isVisible" class="popup-overlay">
    <div class="popup-content">
      <div class="popup-main">
        <div class="editor-section">
          <h3>Edytuj system prompt</h3>
          <textarea 
            v-model="localPrompt" 
            :placeholder="DEFAULT_SYSTEM_PROMPT"
            rows="4"
          ></textarea>
          <div class="popup-buttons">
            <button @click="handleCancel" class="btn-secondary">Anuluj</button>
            <button 
              v-if="visibleUpdate" 
              @click="handleUpdate" 
              class="btn-complementary"
              :disabled="!isEdited"
            >
              Aktualizuj
            </button>
            <button 
              @click="handleSave" 
              class="btn-primary"
            >
              {{ visibleUpdate ? 'Zapisz jako nowy' : 'Zapisz' }}
            </button>
          </div>
        </div>
        
        <div class="prompts-list">
          <h3>Zapisane prompty</h3>
          <div class="prompts-container" data-simplebar>
            <div 
              v-for="prompt in systemPrompts" 
              :key="prompt.uuid"
              class="prompt-item"
              :class="{ 'active': selectedPrompt?.uuid === prompt.uuid }"
            >
              <div class="prompt-content" @click="selectPrompt(prompt)">
                <div class="prompt-name">{{ prompt.name }}</div>
                <div class="prompt-date">{{ formatDate(prompt.created_at) }}</div>
                <div class="prompt-preview">{{ truncateText(prompt.content, 100) }}</div>
              </div>
              <button 
                class="delete-button"
                @click="handleDelete(prompt.uuid)"
                title="Usuń prompt"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      <LoadingWrapper 
        v-if="isLoading" 
        :text="loadingText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { SystemPrompt } from '@/classes/chat/SystemPrompt';
import { aiService } from '@/services/AIService';
import LoadingWrapper from '../loading/LoadingWrapper.vue';

const DEFAULT_SYSTEM_PROMPT = 'Jesteś pomocnym asystentem';

const props = defineProps<{
  isVisible: boolean;
  initialPrompt: string;
}>();

const emit = defineEmits<{
  (e: 'update:isVisible', value: boolean): void;
  (e: 'save', value: SystemPrompt): void;
}>();
 
const visibleUpdate = computed(() => {
  if(selectedPrompt.value){
    return selectedPrompt.value.content !== localPrompt.value;
  }
  return false;
});

const localPrompt = ref(props.initialPrompt || DEFAULT_SYSTEM_PROMPT);
const systemPrompts = ref<SystemPrompt[]>([]);
const selectedPrompt = ref<SystemPrompt | null>(null);
const isEdited = ref(false);
const isLoading = ref(false);
const loadingText = ref('');

watch(() => props.initialPrompt, (newValue) => {
  localPrompt.value = newValue || DEFAULT_SYSTEM_PROMPT;
});

watch(() => localPrompt.value, (newValue) => {
  if (selectedPrompt.value) {
    isEdited.value = newValue !== selectedPrompt.value.content;
  }
});

onMounted(async () => {
  try {
    systemPrompts.value = await aiService.getSystemPrompts();
  } catch (error) {
    console.error('Failed to load system prompts:', error);
  }
});

const selectPrompt = (prompt: SystemPrompt) => {
  selectedPrompt.value = prompt;
  localPrompt.value = prompt.content;
};

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const handleSave = async () => {
  isLoading.value = true;
  loadingText.value = 'Tworzenie nowego promptu...';
  try {
    const existingPrompt = systemPrompts.value.find(p => p.content === localPrompt.value);
    if (existingPrompt) {
      selectedPrompt.value = existingPrompt;
      emit('save', existingPrompt);
      emit('update:isVisible', false);
      return;
    }

    if (selectedPrompt.value && selectedPrompt.value.content === localPrompt.value) {
      emit('save', selectedPrompt.value);
      emit('update:isVisible', false);
      return;
    }

    let name = await aiService.sendChatMessage({
      systemPrompt: 'Pomagasz w tworzeniu nazwy dla promptu systemowego. Nazwa ta musi być krótka i związana z tematem promptu. Napisz nazwę w jednym zdaniu.',
      userPrompt: `Oto system prompt: "${localPrompt.value}". Odpowiedz proszę tylko nazwą promptu.`
    });

    const prompt = await aiService.createSystemPrompt(name, localPrompt.value);
    systemPrompts.value.unshift(prompt);
    selectedPrompt.value = prompt;
    
    emit('save', prompt);
    emit('update:isVisible', false);
    isLoading.value = false;
  } catch (error) {
    console.error('Error saving system prompt:', error);
  }
};

const handleDelete = async (uuid: string) => {
  try {
    await aiService.deleteSystemPrompt(uuid);
    systemPrompts.value = systemPrompts.value.filter(p => p.uuid !== uuid);
    if (selectedPrompt.value?.uuid === uuid) {
      selectedPrompt.value = null;
      localPrompt.value = DEFAULT_SYSTEM_PROMPT;
    }
  } catch (error) {
    console.error('Error deleting system prompt:', error);
  }
};

const handleCancel = () => {
  localPrompt.value = props.initialPrompt;
  isLoading.value = false;
  emit('update:isVisible', false);
};

const handleUpdate = async () => {
  try {
    if (!selectedPrompt.value) return;

    isLoading.value = true;
    loadingText.value = 'Aktualizuję prompt...';

    let name = await aiService.sendChatMessage({
      systemPrompt: 'Pomagasz w tworzeniu nazwy dla promptu systemowego. Nazwa ta musi być krótka i związana z tematem promptu. Napisz nazwę w jednym zdaniu.',
      userPrompt: `Oto system prompt: "${localPrompt.value}". Odpowiedz proszę tylko nazwą promptu.`
    });

    const updatedPrompt = await aiService.updateSystemPrompt(
      selectedPrompt.value.uuid,
      name,
      localPrompt.value
    );

    // Aktualizuj prompt w lokalnej liście
    const index = systemPrompts.value.findIndex(p => p.uuid === updatedPrompt.uuid);
    if (index !== -1) {
      systemPrompts.value[index] = updatedPrompt;
    }

    selectedPrompt.value = updatedPrompt;
    isEdited.value = false;
    isLoading.value = false;
    emit('save', updatedPrompt);
    emit('update:isVisible', false);
  } catch (error) {
    console.error('Error updating system prompt:', error);
  }
};

watch(() => props.isVisible, (newValue) => {
  if (!newValue) {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: var(--bg-main);
  padding: 24px;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 1000px;
  box-shadow: var(--shadow-lg);
}

h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

textarea {
  width: 100%;
  padding: 12px;
  min-height: 300px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
  margin-bottom: 16px;
}

textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary:hover {
  background: var(--bg-secondary-hover);
}

.popup-main {
  display: flex;
  gap: 24px;
  height: 100%;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.prompts-list {
  width: 300px;
  border-left: 1px solid var(--border-color);
  padding-left: 24px;
}

.prompts-container {
  height: 400px;
  overflow-y: auto;
}

.prompt-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.prompt-item:hover {
  background: var(--bg-secondary-hover);
}

.prompt-item.active {
  border-color: var(--color-primary);
  background: var(--bg-secondary);
}

.prompt-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.prompt-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.prompt-preview {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

textarea {
  min-height: 400px;
}

.prompt-content {
  flex: 1;
  cursor: pointer;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: var(--border-radius);
  opacity: 0.6;
  transition: all 0.2s ease;
}

.delete-button:hover {
  opacity: 1;
  background: var(--bg-secondary);
}

.btn-complementary {
  background: var(--color-complementary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-complementary:hover {
  background: var(--color-complementary-hover);
}
</style> 