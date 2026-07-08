import React, { useState } from "react";

const App = () => {

  // State
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Add or Update Todo
  const handleSubmit = () => {

    if (input === "") return;

    // Update
    if (editIndex !== null) {

      const updatedTodos = todos.map((todo, index) => {
        if (index === editIndex) {
          return input;
        } else {
          return todo;
        }
      });

      setTodos(updatedTodos);
      setEditIndex(null);

    }

    // Add
    else {

      setTodos([...todos, input]);

    }

    setInput("");

  };

  // Delete Todo
  const handleDelete = (index) => {

    const newTodos = todos.filter((todo, i) => {
      return i !== index;
    });

    setTodos(newTodos);

  };

  // Edit Todo
  const handleEdit = (index) => {

    setInput(todos[index]);
    setEditIndex(index);

  };

  return (

    <div>

      <h1>Todo CRUD App</h1>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter Todo"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Button */}
      <button onClick={handleSubmit}>
        {editIndex !== null ? "Update" : "Add"}
      </button>

      <hr />

      {/* Todo List */}

      {
        todos.length > 0 ? (

          todos.map((todo, index) => (

            <div key={index}>

              <h3>{todo}</h3>

              <button onClick={() => handleEdit(index)}>
                Edit
              </button>

              <button onClick={() => handleDelete(index)}>
                Delete
              </button>

            </div>

          ))

        ) : (

          <h3>No Todos Added</h3>

        )
      }

    </div>

  );

};

export default App;