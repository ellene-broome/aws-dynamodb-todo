// src/components/App.jsx
console.log("Region:", import.meta.env.VITE_AWS_REGION);

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { FaTrash, FaEdit } from "react-icons/fa";
import { scanTodos, createTodo, updateTodo, deleteTodo } from "../utils/dynamo.js";
import "../styles/App.scss";

// ---- Helper: make a UI-friendly copy of a DB item ----
function toUi(item) {
  return {
    id: item.id ?? item.Id ?? `${Date.now()}-${Math.random()}`,
    text: item.text ?? item.Text ?? "",
    isComplete: item.isComplete ?? item.IsComplete ?? false,
  };
}

// ---- Helper: make a DB-friendly copy from UI shape ----
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

  // 1) Load todos once, normalize to UI shape
  useEffect(() => {
    const fetchTodos = async () => {
      const data = await scanTodos();
      console.log("raw todos from DB:", data);
      const normalized = (data ?? []).map(toUi);
      setTodos(normalized);
    };
    fetchTodos();
  }, []);

  // 2) Input change
  const changeHandlerText = (e) => setText(e.target.value);

  // 3) Create a todo
  const createHandler = async () => {
    if (!text.trim()) return;

    // UI shape first
    const uiItem = {
      id: Date.now().toString(),
      text: text.trim(),
      isComplete: false,
    };

    // Save to DB using DB shape
    await createTodo(toDb(uiItem));

    // Optimistically add to UI
    setTodos((prev) => [uiItem, ...prev]);
    setText("");
  };

  // 4) Toggle complete (separate from delete!)
  const toggleHandler = async (todo) => {
    const nextState = !todo.isComplete;

    // Update DB (DB shape)
    const updatedDb = await updateTodo(todo.id, { IsComplete: nextState });

    // Update UI
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, isComplete: updatedDb.IsComplete ?? nextState } : t
      )
    );
  };

  // 5) Delete (only deletes)
  const deleteHandler = async (id) => {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
      <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 2, boxShadow: 6 }}>
        <CardHeader title={<Typography variant="h6">My To-Do List</Typography>} />
        <CardContent>
          <Stack spacing={2}>
            {/* Input + Add */}
            <TextField
              value={text}
              onChange={changeHandlerText}
              label="Enter a new task"
              variant="outlined"
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={createHandler}>
              Add
            </Button>

            {/* List */}
            <Stack spacing={1}>
              {todos.map((todo) => (
                <Box
                  key={todo.id}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      textDecoration: todo.isComplete ? "line-through" : "none",
                      opacity: todo.isComplete ? 0.6 : 1,
                    }}
                  >
                    {todo.text}
                  </Typography>

                  <Box>
                    {/* Toggle complete */}
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="toggle complete"
                      onClick={() => toggleHandler(todo)}
                      title="Toggle complete"
                      sx={{ mr: 1 }}
                    >
                      <FaEdit />
                    </IconButton>

                    {/* Delete */}
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="delete todo"
                      onClick={() => deleteHandler(todo.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default App;
