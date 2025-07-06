
const express = require('express') // Import express 
const cors = require('cors') // Import cors for cross-origin resource sharing
const app = express() // Create an instance of express
const port = 5000 // Define the port to listen on

app.use(cors()) // Use cors middleware to allow cross-origin requests


//Hello World Test function
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Create a route to handle the POST request
app.listen(port, () => {})
console.log(`Server is running on http://localhost:${port}`) // Log the server URL to the console
