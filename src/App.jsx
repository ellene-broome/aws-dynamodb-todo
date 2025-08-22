console.log("Region:", import.meta.env.VITE_AWS_REGION);

import React, { useState, useEffect } from 'react';
import { scanTodos, createTodo, updateTodo, deleteTodo } from './dynamo.js';
import './App.scss';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    async function loadTodos() {
      const data = await scanTodos();
      setTodos(data);
    }
    loadTodos();
  }, []);

  const changeHandlerText = (event) => {
    setText(event.target.value);
  };

  const createHandler = async () => {
    if (!text.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      Text: text,
      IsComplete: false
    };

    await createTodo(newItem);
    setTodos((prev) => [...prev, newItem]);
    setText('');
  };

  const toggleHandler = async (todo) => {
    const update = await updateTodo(todo.id, { IsComplete: !todo.IsComplete });
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, IsComplete: update.IsComplete } : t))
    );
  };

  const deleteHandler = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      {/* Section One: Header and Input */}
      <div className="section-one">
        <h2>To_Do App</h2>
        <input
          value={text}
          onChange={changeHandlerText}
          placeholder="Enter a todo"
        />
        <button onClick={createHandler}>Send Data</button>
      </div>

      {/* Section Two: Todo List */}
      <div className="section-two">
        <p>Your Todos:</p>
        <ul>
          {todos.map((t) => (
            <li key={t.id}>
              <input
                type="checkbox"
                checked={t.IsComplete}
                onChange={() => toggleHandler(t)}
              />
              <span style={{ textDecoration: t.IsComplete ? 'line-through' : 'none' }}>
                {t.Text}
              </span>
              <button onClick={() => deleteHandler(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Section Three: Footer / Extra Info */}
      <div className="section-three">
        <p>Manage your tasks efficiently!</p>
      </div>
    </div>
  );
}

export default App;
