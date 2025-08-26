// src/components/App.jsx
// src/components/App.jsx
console.log("Region:", import.meta.env.VITE_AWS_REGION);

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { FaTrash, FaEdit } from "react-icons/fa";
import { scanTodos, createTodo, updateTodo, deleteTodo } from "../utils/dynamo.js";

// 👇 bring in your Sass
import "../styles/App.scss";

// ---- map DB item -> UI item (all lowercase fields for the UI) ----
function toUi(item) {
  return {
    id: item.id ?? item.Id ?? `${Date.now()}-${Math.random()}`,
    text: item.text ?? item.Text ?? "",
    isComplete: item.isComplete ?? item.IsComplete ?? false,
  };
}

// ---- map UI item -> DB item (DB expects capitalized fields) ----
function toDb(ui) {
  return {
    id: ui.id,
    Text: ui.text,
    IsComplete: ui.isComplete,
  };
}

function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]);

  // load + normalize
  useEffect(() => {
    const fetchTodos = async () => {
      const data = await scanTodos();
      const normalized = (data ?? []).map(toUi);
      setTodos(normalized);
    };
    fetchTodos();
  }, []);

  // input change
  const changeHandlerText = (e) => setText(e.target.value);

  // add todo
  const createHandler = async () => {
    if (!text.trim()) return;

    const uiItem = {
      id: Date.now().toString(),
      text: text.trim(),
      isComplete: false,
    };

    await createTodo(toDb(uiItem));        // save in DB shape
    setTodos((prev) => [uiItem, ...prev]); // show immediately
    setText("");
  };

  // toggle complete
  const toggleHandler = async (todo) => {
    const next = !todo.isComplete;
    const updatedDb = await updateTodo(todo.id, { IsComplete: next });
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, isComplete: updatedDb.IsComplete ?? next } : t
      )
    );
  };

  // delete
  const deleteHandler = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="app-container">
      {/* Section One: Header + Input + Button (Sass controls layout; MUI provides components) */}
      <div className="section-one">
        <h2>To_Do App</h2>

        {/* MUI TextField still renders an <input> inside, so your Sass rules on .section-one input will apply */}
        <TextField
          value={text}
          onChange={changeHandlerText}
          placeholder="Enter a new task"
          variant="outlined"
          size="small"
          // optional: fullWidth if you prefer MUI sizing over your Sass width:
          // fullWidth
        />

        {/* MUI Button; Sass rule .section-one button still applies (it renders a <button>) */}
        <Button variant="contained" color="primary" onClick={createHandler}>
          Add
        </Button>
      </div>

      {/* Section Two: Todos list (Sass handles ul/li look; we sprinkle MUI for icons) */}
      <div className="section-two">
        <p>Your Tasks</p>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {/* Checkbox (plain HTML so your Sass rule input[type="checkbox"] applies) */}
              <input
                type="checkbox"
                checked={todo.isComplete}
                onChange={() => toggleHandler(todo)}
              />

              <span style={{
                textDecoration: todo.isComplete ? "line-through" : "none",
                opacity: todo.isComplete ? 0.6 : 1,
              }}>
                {todo.text}
              </span>

              <div>
                {/* MUI IconButtons with your Sass class hooks for colors/hover */}
                <IconButton
                  className="edit-btn"
                  aria-label="toggle complete"
                  size="small"
                  onClick={() => toggleHandler(todo)}
                  title="Toggle complete"
                >
                  <FaEdit />
                </IconButton>

                <IconButton
                  className="delete-btn"
                  aria-label="delete todo"
                  size="small"
                  onClick={() => deleteHandler(todo.id)}
                  title="Delete"
                >
                  <FaTrash />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Section Three: Footer (pure Sass) */}
      <div className="section-three">
        <p>Manage your tasks efficiently!</p>
      </div>
    </div>
  );
}

export default App;
