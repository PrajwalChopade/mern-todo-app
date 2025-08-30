import { useState } from "react";
import axios from 'axios';
function AddTask() {
  const [textInput, setTextInput] = useState("");
  const [descInput, setdescInput] = useState("");
  const [dateInput, setdateInput] = useState("");
  const [priority, setPriority] = useState("Medium"); // default


  const addtask = async () => {
    console.log(textInput);
    console.log(descInput);
    console.log(dateInput);

    const newTask = {
      title: textInput,
      description: descInput,
      dueDate: dateInput,
      priority: priority,
    };

    // send data to backend
    const res = await axios.post("http://localhost:5000/addTask", newTask);

    console.log("✅ Task saved:", res.data);

    setTextInput("");
    setdescInput("");
    setdateInput("");
    setPriority("");
    alert("Task added successfully!");

  }
  return (
    <div>
      <div>addTask</div>
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

        <input type="date"
          value={dateInput}
          onChange={(e) => setdateInput(e.target.value)}
          placeholder="Select the Date" />

        <select value={priority}
          onChange={(e) => setPriority(e.target.value)}>
          <option value="High">🔥 High</option>
          <option value="Medium">⭐ Medium</option>
          <option value="Low">🟢 Low</option>
        </select>


      <button onClick={addtask}>Add</button>
    </div>
    </div >
  )
}

export default AddTask