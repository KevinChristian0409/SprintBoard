import API from "../services/api";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProtected = async () => {
      const { data } = await API.get("/api/protected");
      setMessage(data.message);
    };

    fetchProtected();
  }, []);

  return <h1>{message}</h1>;
};

export default Dashboard;