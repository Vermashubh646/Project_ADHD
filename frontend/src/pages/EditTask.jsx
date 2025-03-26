import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import Axios
import { useAuth } from "@clerk/clerk-react"; 

function EditTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();  // Clerk's method to get JWT token
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
  });

  // 📚 Fetch task details using Axios
  useEffect(() => {
    console.log("Task ID:", taskId); // ✅ Check if taskId is correct
    if (!taskId) {
      setError("Invalid Task ID");
      setLoading(false);
      return;
    }
  
    const fetchTask = async () => {
      try {
        const token = await getToken(); // Get the JWT Token from Clerk
        if (!token) {
          console.error("No token found, user may not be authenticated.");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
            "Content-Type": "application/json",
          },
        });

        const data = res.data;
        setTask(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          priority: data.priority || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching task:", error);
        setError(error.response?.data?.message || "Failed to fetch task");
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId, getToken]);

  // 🎯 Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Handle form submission using Axios PUT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken(); // Get JWT Token from Clerk
      if (!token) {
        console.error("No token found, user may not be authenticated.");
        return;
      }

      const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in header
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        alert("Task updated successfully!");
        navigate("/tasks"); // ✅ Redirect to /tasks after successful update
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task Title"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task Description"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Update Task
        </button>
      </form>
    </div>
  );
}

export default EditTask;
