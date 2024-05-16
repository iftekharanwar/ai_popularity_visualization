const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS package
const app = express();
const port = 3001; // Using a different port than the React dev server

// Enable all CORS requests
app.use(cors());

// Serve all static files in the 'public/model' directory
app.use('/model', express.static(path.join(__dirname, 'public', 'model')));

// Specific route to serve 'model.json'
app.get('/model/model.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'model', 'model.json'));
});

app.listen(port, () => {
  console.log(`Model server listening at http://localhost:${port}`);
});
