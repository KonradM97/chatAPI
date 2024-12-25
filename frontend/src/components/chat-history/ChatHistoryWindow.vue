<template>
  <div class="history-window">
    <div class="history-header">
      <h2>Historia czatów</h2>
    </div>
    
    <div class="history-content" data-simplebar>
      <div class="chat-list">
        <!-- Tu później będzie lista czatów -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Na razie pusty setup
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
  gap: 10px;
}
</style> 