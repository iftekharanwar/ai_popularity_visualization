const fs = require('fs');
const { parse } = require('csv-parse/sync');

const csvFilePath = './apps.csv';
const searchAppName = 'KnownValidAppName'; // Replace with the actual app name to search for

try {
  const csvData = fs.readFileSync(csvFilePath);
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  // Log a sample of app names from the CSV file
  const sampleAppNames = records.slice(0, 10).map(record => record.App);
  console.log('Sample app names from CSV file:', sampleAppNames);

  // Search for the app by name in the records
  const appFound = records.find(record => record.App === searchAppName);

  if (appFound) {
    console.log(`App found: ${JSON.stringify(appFound)}`);
  } else {
    console.log('App not found in CSV file.');
  }

} catch (error) {
  console.error('Error processing CSV file:', error);
}
