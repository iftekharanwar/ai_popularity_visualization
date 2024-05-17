const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS package
const app = express();
const port = 3001; // Using a different port than the React dev server
const fs = require('fs');
const { parse } = require('csv-parse/sync'); // Corrected import statement for csv-parse

// Enable all CORS requests
app.use(cors());

// Serve all static files in the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Specific route to serve 'model.json'
app.get('/model/model.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'model', 'model.json'));
});

// API endpoint to serve app details from 'apps.csv'
app.get('/api/data/:appName', (req, res) => {
  const appName = req.params.appName;
  try {
    const appsCsv = fs.readFileSync(path.join(__dirname, 'apps.csv'), 'utf8');
    const records = parse(appsCsv, {
      columns: true,
      skip_empty_lines: true
    });

    const appDetails = records.find(app => app.App === appName);
    if (!appDetails) {
      return res.status(404).send('App not found');
    }

    // Remove any keys with empty string as key
    delete appDetails[""];

    // Ensure all numerical fields are actual numbers
    appDetails.Rating = parseFloat(appDetails.Rating);
    appDetails.Reviews = parseInt(appDetails.Reviews, 10);
    appDetails.Size = appDetails.Size ? parseFloat(appDetails.Size) : 0; // Assuming 'Size' should be a number
    appDetails.Price = parseFloat(appDetails.Price);

    // Send the app details as JSON
    res.json(appDetails);
  } catch (error) {
    console.error('Error fetching app details:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
