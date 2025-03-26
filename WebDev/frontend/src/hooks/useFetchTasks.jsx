import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const useFetchTasks = () => {
  const { getToken } = useAuth(); // Access Clerk's getToken to fetch the JWT token
  const [loading, setLoading] = useState(true); // Loading state to manage the fetching process
  const [error, setError] = useState(null); // Error state for error handling

    const fetchTasks = async (setTasks, setQueuedTasks) => {
      try {
        const token = await getToken(); // Get the JWT token
        if (!token) {
          console.error("No token found, user may not be authenticated.");
          setError("Authentication token missing.");
          setLoading(false);
          return;
        }

        // Fetch the tasks from the backend
        const response = await fetch("http://localhost:5000/api/tasks", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Pass the token in the Authorization header
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const data = await response.json();
        setTasks(data); // Set the tasks
        const inProgressTasks = data.filter((task) => task.status === "In Progress");
        setQueuedTasks(inProgressTasks); // Set the queued tasks
        setLoading(false); // Set loading to false after the fetch is complete
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Error fetching tasks");
        setLoading(false);
      }
    };
  return { fetchTasks };
};

export default useFetchTasks;
