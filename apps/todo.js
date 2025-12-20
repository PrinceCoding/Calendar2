// Todo List Widget
(function() {
  'use strict';

  const floatingTodo = document.getElementById('floatingTodo');
  const todoInput = document.getElementById('todoInput');
  const todoAddBtn = document.getElementById('todoAddBtn');
  const todoList = document.getElementById('todoList');

  const TODO_KEY = 'calendar_todos';

  function saveTodos(arr) {
    localStorage.setItem(TODO_KEY, JSON.stringify(arr));
  }

  function loadTodos() {
    return JSON.parse(localStorage.getItem(TODO_KEY) || '[]');
  }

  function renderTodos() {
    const todos = loadTodos();
    if (!todoList) return;
    todoList.innerHTML = '';
    todos.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'todo-item' + (t.done ? ' done' : '');
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = t.done;
      check.onchange = () => {
        todos[i].done = check.checked;
        saveTodos(todos);
        renderTodos();
      };
      const span = document.createElement('span');
      span.textContent = t.text;
      const del = document.createElement('button');
      del.className = 'todo-delete';
      del.textContent = '✕';
      del.onclick = () => {
        todos.splice(i, 1);
        saveTodos(todos);
        renderTodos();
      };
      div.appendChild(check);
      div.appendChild(span);
      div.appendChild(del);
      todoList.appendChild(div);
    });
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    const todos = loadTodos();
    todos.push({ text, done: false });
    saveTodos(todos);
    todoInput.value = '';
    renderTodos();
  }

  if (todoAddBtn) todoAddBtn.onclick = addTodo;
  if (todoInput) {
    todoInput.onkeydown = (e) => {
      if (e.key === 'Enter') addTodo();
    };
  }

  renderTodos();

  // Export for main script
  window.TodoWidget = {
    element: floatingTodo,
    render: renderTodos,
    add: addTodo
  };
})();
