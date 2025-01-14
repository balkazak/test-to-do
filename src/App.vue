<template>
  <div id="app" :class="{ 'dark-mode': todoStore.darkMode }">
    <TodoList />
  </div>
</template>

<script setup lang="ts">
import TodoList from '@/components/TodoList.vue'
import { useTodoStore } from '@/stores/todos'

const todoStore = useTodoStore()
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #8b9fff 0%, #a989ff 100%);
  min-height: 100vh;
  overflow: hidden;
}

#app {
  min-height: 100vh;
  min-width: 100vw;
  padding: 2rem 1rem;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

* {
  box-sizing: border-box;
}

button {
  font-family: inherit;
}
</style>
