import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
}

function Updatetask() {
  const { id } = useParams<{ id: string }>();
  const [textInput, setTextInput] = useState("");
  const [descInput, setdescInput] = useState("");
  const [dateInput, setdateInput] = useState("");
  const [priority, setPriority] = useState("");

  // // Fetch existing task data
  // useEffect(() => {
  //   const fetchTask = async () => {
  //     try {
  //       const res = await axios.get(`https://mern-todo-app-0f8z.onrender.com/task/${id}`);
  //       const task: Task = res.data;
  //       setTextInput(task.title || "");  // ✅ Handle undefined values
  //       setdescInput(task.description || "");  // ✅ Handle undefined values
  //       setdateInput(task.dueDate);

  //     } catch (err) {
  //       console.error("❌ Error fetching task:", err);
  //     }
  //   };

  //   if (id) {
  //     fetchTask();
  //   }
  // }, [id]);

  // ...existing code...

// Fetch existing task data
useEffect(() => {
  const fetchTask = async () => {
    try {
      const res = await axios.get(`https://mern-todo-app-0f8z.onrender.com/task/${id}`);
      const task: Task = res.data;
      setTextInput(task.title || "");
      setdescInput(task.description || "");

      
      // ✅ Format date for HTML date input
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        const formattedDate = date.toISOString().split('T')[0]; // Gets 'YYYY-MM-DD'
        setdateInput(formattedDate);
      } else {
        setdateInput("");
      }
      setPriority(task.priority);

    } catch (err) {
      console.error("❌ Error fetching task:", err);
    }
  };

  if (id) {
    fetchTask();
  }
}, [id]);

// ...existing code...

  const updateTask = async () => {
    try {
      await axios.put(`https://mern-todo-app-0f8z.onrender.com/updateTask/${id}`, {
        title: textInput,
        description: descInput,
        dueDate: dateInput,
        priority: priority
      });
      console.log("Task updated successfully!");
    } catch (err) {
      console.error("❌ Error updating task:", err);
    }
  };

  return (
    <div>
      <div>Update Task</div>
      <div>
        <input
          type='text'
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='Enter the Task' />

        <input
          type='text'
          value={descInput}
          onChange={(e) => setdescInput(e.target.value)}
          placeholder='Enter the Description' />

        <input
          type="date"
          value={dateInput}
          onChange={(e) => setdateInput(e.target.value)}
          placeholder="Select the Date" />

        <select value={priority}
          onChange={(e) => setPriority(e.target.value)}>
          <option value="High">🔥 High</option>
          <option value="Medium">⭐ Medium</option>
          <option value="Low">🟢 Low</option>
        </select>
        <button onClick={updateTask}>Update</button>
      </div>
    </div>
  );
}

export default Updatetask;