console.log("Region:", import.meta.env.VITE_AWS_REGION);

import React, { useState, useEffect } from 'react';
import { scanTodos, createTodo, updateTodo, deleteTodo } from './dynamo.js';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]); // array to store DynamoDB items
  const [text, setText] = useState('');   // input value for new todo

  // Load items from DynamoDB on first render
  useEffect(() => {
    async function loadTodos() {
      const data = await scanTodos(); // returns items array
      setTodos(data);
    }
    loadTodos();
  }, []);

  // Handle input change
  const changeHandlerText = (event) => {
    setText(event.target.value);
  };

  // Handle adding a new todo
  const createHandler = async () => {
    if (!text.trim()) return; // ignore empty input

    const newItem = {
      id: Date.now().toString(),
      Text: text,
      IsComplete: false
    };

    // Send to DynamoDB
    await createTodo(newItem);

    // Update UI immediately without reloading
    setTodos((prev) => [...prev, newItem]);
    setText(''); // clear input field
  };

  // Handle toggling complete
  const toggleHandler = async (todo) => {
    const update = await updateTodo(todo.id, { IsComplete: !todo.IsComplete });
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, IsComplete: update.IsComplete } : t))
    );
  };

  // Handle deleting a todo
  const deleteHandler = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Render the component
  return (
    <div className="container"> 
      <h1>To_Do App</h1>

      <input
        value={text}
        onChange={changeHandlerText}
        placeholder="Enter a todo"
      />
      {/* Button to create a new todo */}
      <button onClick={createHandler}>Send Data</button>

      {/* List the todos */}
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
  );
}

export default App;
// This function is to scan all todos