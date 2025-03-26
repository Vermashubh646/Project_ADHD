import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

// Fetch all tasks
export const getTasks = async (token) => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Pass token in headers
    },
  });
  return res.data;
};

// 🔹 Create a new task
export const createTask = async (task, token) => {
  const res = await axios.post(API_URL, task, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Token added here
    },
  });
  return res.data;
};

// 🔹 Update a task
export const updateTask = async (id, task, token) => {
  const res = await axios.put(`${API_URL}/${id}`, task, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Token added here
    },
  });
  return res.data;
};

// 🔹 Delete a task
export const deleteTask = async (id, token) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Token added here
    },
  });
};
