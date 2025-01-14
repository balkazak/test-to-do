<template>
  <div class="todo-list">
    <div class="header">
      <img src="../assets/image.png" alt="Todo List" class="header-image" />
      <h1>Today I need to</h1>
    </div>

    <div class="input-container">
      <input
        v-model="newTodoText"
        @keyup.enter="addTodo"
        placeholder="Enter your task"
        type="text"
      />
      <button v-if="newTodoText.trim()" @click="addTodo" class="submit-button">Submit</button>
    </div>

    <div v-if="!todoStore.todos.length" class="empty-state">
      <div class="empty-icon">⊕</div>
      <p>No tasks yet</p>
    </div>

    <draggable
      :list="todoStore.filteredTodos"
      item-key="id"
      handle=".drag-handle"
      @end="onDragEnd"
      class="todo-items"
      :animation="200"
      ghost-class="ghost"
    >
      <template #item="{ element }">
        <div class="todo-item" :class="{ completed: element.completed }">
          <div class="todo-item-left">
            <span class="drag-handle">⋮⋮</span>
            <input
              type="checkbox"
              :checked="element.completed"
              @change="todoStore.toggleTodo(element.id)"
              class="checkbox"
            />
            <input
              v-if="editingId === element.id"
              v-model="editingText"
              @blur="finishEditing"
              @keyup.enter="finishEditing"
              @keyup.esc="cancelEditing"
              ref="editInput"
              class="edit-input"
            />
            <span v-else class="todo-text" @dblclick="startEditing(element)">
              {{ element.text }}
            </span>
          </div>
          <div class="actions">
            <button @click="startEditing(element)" class="edit">✏️</button>
            <button @click="todoStore.removeTodo(element.id)" class="delete">🗑️</button>
          </div>
        </div>
      </template>
    </draggable>

    <div v-if="todoStore.todos.length" class="controls">
      <button v-if="todoStore.activeTodos.length" @click="todoStore.toggleAll" class="check-all">
        Check all
      </button>

      <div class="filters">
        <button :class="{ active: todoStore.filter === 'all' }" @click="todoStore.setFilter('all')">
          All
        </button>
        <button
          :class="{ active: todoStore.filter === 'active' }"
          @click="todoStore.setFilter('active')"
        >
          Active
        </button>
        <button
          :class="{ active: todoStore.filter === 'completed' }"
          @click="todoStore.setFilter('completed')"
        >
          Completed
        </button>
      </div>

      <button
        v-if="todoStore.completedTodos.length"
        @click="todoStore.clearCompleted"
        class="clear-completed"
      >
        Clear completed
      </button>
    </div>

    <div class="stats-section">
      <div class="stats-block">
        <div class="stats-title">Completed</div>
        <span class="stats-count">{{ todoStore.completionStats.completed }}</span>
        <span class="stats-label">tasks</span>
        <div class="progress-bar">
          <div
            class="progress-line"
            :style="{ width: todoStore.completionStats.progress + '%' }"
          ></div>
        </div>
      </div>

      <div class="stats-block">
        <div class="stats-title">To be finished</div>
        <span class="stats-count">{{ todoStore.activeTodos.length }}</span>
        <span class="stats-label">tasks</span>
        <div class="progress-bar">
          <div
            class="progress-line"
            :style="{ width: 100 - todoStore.completionStats.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodoStore } from '@/stores/todos'
import draggable from 'vuedraggable'

const todoStore = useTodoStore()
const newTodoText = ref('')
const editingId = ref<number | null>(null)
const editingText = ref('')
const editInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  todoStore.loadTodos()
})

function addTodo() {
  const text = newTodoText.value.trim()
  if (text) {
    todoStore.addTodo(text)
    newTodoText.value = ''
  }
}

function startEditing(todo: { id: number; text: string }) {
  editingId.value = todo.id
  editingText.value = todo.text
  setTimeout(() => {
    editInput.value?.focus()
  })
}

function finishEditing() {
  if (editingId.value !== null) {
    const text = editingText.value.trim()
    if (text) {
      todoStore.updateTodoText(editingId.value, text)
    }
    editingId.value = null
  }
}

function cancelEditing() {
  editingId.value = null
}

function onDragEnd(evt: any) {
  todoStore.reorderTodos(evt.oldIndex, evt.newIndex)
}
</script>

<style scoped>
.todo-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-image {
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.input-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

input[type='text'] {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: #f8f9fa;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background: #4a7dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.todo-items {
  margin-bottom: 2rem;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
}

.todo-items::-webkit-scrollbar {
  width: 6px;
}

.todo-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.todo-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.todo-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
}

.todo-item-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #4a7dff;
  cursor: pointer;
}

.todo-text {
  color: #333;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #6c757d;
}

.drag-handle {
  cursor: move;
  color: #6c757d;
  font-size: 1.2rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  font-size: 1.1rem;
}

.actions button:hover {
  opacity: 1;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filters button {
  padding: 0.5rem 1rem;
  border: none;
  background: #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
}

.filters button.active {
  background: #4a7dff;
  color: white;
}

.check-all,
.clear-completed {
  padding: 0.5rem 1rem;
  border: none;
  background: #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stats-block {
  flex: 1;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  position: relative;
}

.stats-count {
  font-size: 2rem;
  font-weight: bold;
  color: #4a7dff;
  display: block;
  margin-bottom: 0.25rem;
}

.stats-label {
  color: #666;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 1rem;
}

.stats-title {
  color: #333;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.75rem;
}

.progress-line {
  height: 100%;
  background: #4a7dff;
  transition: width 0.3s ease;
}

.stats-block:first-child .progress-line {
  background: #4caf50;
}

.stats-block:last-child .progress-line {
  background: #ff9800;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  color: #4a7dff;
  margin-bottom: 1rem;
}

.ghost {
  opacity: 0.5;
  background: #c8e6c9;
}

@media (max-width: 600px) {
  .todo-list {
    padding: 1rem;
    border-radius: 0;
  }

  .controls {
    flex-direction: column;
  }

  .filters {
    order: -1;
    justify-content: center;
    width: 100%;
  }

  .stats-section {
    flex-direction: column;
  }
}
</style>
