import React, { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api')
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        setUsers(data.users); // only works if data.users exists
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
      });
  }, []);

  return (
    <div>
      {!users ? (
        <p>Loading...</p>
      ) : (
        users.map((user, i) => (
          <p key={i}>{user}</p>
        ))
      )}
    </div>
  );
}

export default App;



