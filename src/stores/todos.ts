import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Todo {
  id: number
  text: string
  completed: boolean
  order: number
}

export const useTodoStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const filter = ref<'all' | 'active' | 'completed'>('all')
  const darkMode = ref(false)

  const completedTodos = computed(() => todos.value.filter((todo) => todo.completed))
  const activeTodos = computed(() => todos.value.filter((todo) => !todo.completed))
  const filteredTodos = computed({
    get: () => {
      switch (filter.value) {
        case 'active':
          return activeTodos.value
        case 'completed':
          return completedTodos.value
        default:
          return todos.value
      }
    },
    set: (value) => {
      todos.value = value
    },
  })

  const completionStats = computed(() => ({
    completed: completedTodos.value.length,
    total: todos.value.length,
    progress: todos.value.length ? (completedTodos.value.length / todos.value.length) * 100 : 0,
  }))

  function addTodo(text: string) {
    const maxOrder = Math.max(0, ...todos.value.map((t) => t.order))
    todos.value.push({
      id: Date.now(),
      text,
      completed: false,
      order: maxOrder + 1,
    })
    saveTodos()
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter((todo) => todo.id !== id)
    saveTodos()
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find((todo) => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveTodos()
    }
  }

  function updateTodoText(id: number, text: string) {
    const todo = todos.value.find((todo) => todo.id === id)
    if (todo) {
      todo.text = text
      saveTodos()
    }
  }

  function toggleAll() {
    const allCompleted = todos.value.every((todo) => todo.completed)
    todos.value.forEach((todo) => (todo.completed = !allCompleted))
    saveTodos()
  }

  function clearCompleted() {
    todos.value = todos.value.filter((todo) => !todo.completed)
    saveTodos()
  }

  function reorderTodos(fromIndex: number, toIndex: number) {
    const fromTodo = filteredTodos.value[fromIndex]
    const toTodo = filteredTodos.value[toIndex]

    const actualFromIndex = todos.value.findIndex((t) => t.id === fromTodo.id)
    const actualToIndex = todos.value.findIndex((t) => t.id === toTodo.id)

    const [removed] = todos.value.splice(actualFromIndex, 1)
    todos.value.splice(actualToIndex, 0, removed)

    todos.value.forEach((todo, index) => {
      todo.order = index
    })

    saveTodos()
  }

  function setFilter(newFilter: 'all' | 'active' | 'completed') {
    filter.value = newFilter
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    localStorage.setItem('darkMode', String(darkMode.value))
  }

  async function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  async function loadTodos() {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      todos.value = JSON.parse(savedTodos)
    }
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      darkMode.value = savedDarkMode === 'true'
    }
  }

  return {
    todos,
    filter,
    darkMode,
    filteredTodos,
    completedTodos,
    activeTodos,
    completionStats,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodoText,
    toggleAll,
    clearCompleted,
    reorderTodos,
    setFilter,
    toggleDarkMode,
    loadTodos,
  }
})
