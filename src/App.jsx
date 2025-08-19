console.log("Region:", import.meta.env.VITE_AWS_REGION);



import React, { useState, useEffect } from 'react';
import { scanTodos, createTodo } from './dynamo.js';
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
  // Aadded ccontainer for CSS
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
        <li key={t.id}>{t.Text}</li>
      ))}
    </ul>
  </div>
);
}

export default App;
