// client/src/App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/hello")
      .then(response => {
        setMessage(response.data); // Save "Hello World" in state
      })
      //error handling
      .catch(error => {
        console.error("Error fetching message:", error);
      });
  }, []);


  //Showing the message in the component
  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export default App;
