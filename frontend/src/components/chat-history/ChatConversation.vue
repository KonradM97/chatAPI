<template>
  <div class="chat-conversation" :class="{ active: isActive }" @click="handleClick">
    <div class="conversation-content">
      <div class="conversation-name" v-if="!isEditing">
        {{ conversation.name }}
      </div>
      <input
        v-else
        ref="nameInput"
        v-model="editedName"
        class="name-input"
        @keyup.enter="saveName"
        @blur="saveName"
        @click.stop
      />
      <div class="conversation-date">
        {{ conversation.getFormattedCreatedAt() }}
      </div>
    </div>
    <div class="buttons">
      <button class="edit-button" @click.stop="startEditing">
        <i class="fas fa-pen"></i>
      </button>
      <button class="delete-button" title="Delete" @click.stop="handleDelete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { ChatHistory } from '@/classes/chat/ChatHistory';
import { chatHistoryService } from '@/services/ChatHistoryService';

const props = defineProps<{
  conversation: ChatHistory;
  isActive: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', conversation: ChatHistory): void;
  (e: 'delete', conversation: ChatHistory): void;
}>();

const isEditing = ref(false);
const editedName = ref(props.conversation.name);
const nameInput = ref<HTMLInputElement | null>(null);

const handleClick = () => {
  emit('select', props.conversation);
};

const startEditing = () => {
  isEditing.value = true;
  editedName.value = props.conversation.name;
  // Fokus na input w następnym cyklu DOM
  setTimeout(() => {
    nameInput.value?.focus();
  });
};

const saveName = async () => {
  if (isEditing.value && editedName.value !== props.conversation.name) {
    try {
      await chatHistoryService.updateConversationName(props.conversation.id, editedName.value);
      props.conversation.updateName(editedName.value);
    } catch (error) {
      console.error('Error updating conversation name:', error);
      // Przywróć starą nazwę w przypadku błędu
      editedName.value = props.conversation.name;
    }
  }
  isEditing.value = false;
};

const handleDelete = async () => {
  try {
    await chatHistoryService.deleteConversation(props.conversation.id);
    emit('delete', props.conversation);
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
};
</script>

<style scoped>
.chat-conversation {
  padding: 12px;
  border-radius: var(--border-radius);
  background: var(--bg-main);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.chat-conversation:hover {
  background: var(--bg-secondary-hover);
}

.chat-conversation.active {
  background: var(--bg-main);
  border: 1px solid var(--color-primary);
}

.conversation-content {
  flex: 1;
  min-width: 0; /* Zapobiega przepełnieniu flex */
}

.conversation-name {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-date {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.edit-button {
  padding: 6px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-conversation:hover .edit-button {
  opacity: 1;
}

.edit-button:hover {
  color: var(--text-primary);
}

.name-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-main);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.name-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.buttons {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-conversation:hover .buttons {
  opacity: 1;
}

.edit-button,
.delete-button {
  padding: 6px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;
}

.edit-button:hover {
  color: var(--color-primary);
}

.delete-button:hover {
  color: var(--color-error);
}
</style> 