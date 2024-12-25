<template>
  <div class="config-window">
    <div class="config-header">
      <h2>Konfiguracja</h2>
    </div>
    
    <div class="config-content" data-simplebar>
      <div class="config-sections">
        <!-- Tu później będą sekcje konfiguracji -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Na razie pusty setup
</script>

<style scoped>
.config-window{
  width: 21%;
  height: 100%;
  background: var(--bg-main);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.config-header{
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-header);
  border-top-left-radius: var(--border-radius-lg);
  border-top-right-radius: var(--border-radius-lg);
}

.config-header h2{
  color: var(--text-primary);
  font-weight: 500;
}

.config-content{
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.config-sections{
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style> 