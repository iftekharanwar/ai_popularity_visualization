// This script tests the formatPredictionData function from App.js

// Import dependencies
const tf = require('@tensorflow/tfjs-node');

// Define the arrays for categories, types, and genres based on the unique values from the training dataset
const categories = ['ART_AND_DESIGN', 'AUTO_AND_VEHICLES', 'BEAUTY', 'BOOKS_AND_REFERENCE', 'BUSINESS', 'COMICS', 'COMMUNICATION', 'DATING', 'EDUCATION', 'ENTERTAINMENT', 'EVENTS', 'FINANCE', 'FOOD_AND_DRINK', 'HEALTH_AND_FITNESS', 'HOUSE_AND_HOME', 'LIBRARIES_AND_DEMO', 'LIFESTYLE', 'GAME', 'FAMILY', 'MEDICAL', 'SOCIAL', 'SHOPPING', 'PHOTOGRAPHY', 'SPORTS', 'TRAVEL_AND_LOCAL', 'TOOLS', 'PERSONALIZATION', 'PRODUCTIVITY', 'PARENTING', 'WEATHER', 'VIDEO_PLAYERS', 'NEWS_AND_MAGAZINES', 'MAPS_AND_NAVIGATION', 'OTHER']; // Added 'OTHER' to match training data
const types = ['Free', 'Paid'];
const genres = ['Action', 'Adventure', 'Arcade', 'Board', 'Card', 'Casino', 'Casual', 'Educational', 'Music', 'Puzzle', 'Racing', 'Role Playing', 'Simulation', 'Sports', 'Strategy', 'Trivia', 'Word']; // Removed 'OTHER' to match expected input shape

// Updated maximum values for numerical features based on the training dataset
const maxValues = {
  Rating: 5, // Assuming the rating is out of 5
  Reviews: 78158306, // Maximum reviews from the training dataset
  Size: 100, // Assuming size is normalized out of 100
  Installs: 1000000000, // Updated maximum installs from the CSV data
  Price: 400, // Updated maximum price from the CSV data
};

// Function to normalize app details data for model prediction
function normalizeData(appDetails) {
  // Validate appDetails properties
  const validateProperties = (details) => {
    const isNumber = (value) => typeof value === 'number' && !isNaN(value);
    const isString = (value) => typeof value === 'string' && value.trim() !== '';
    const isValidCategory = (value) => categories.includes(value);
    const isValidType = (value) => types.includes(value);
    const isValidGenre = (value) => genres.includes(value.split(';')[0]);

    if (!isNumber(details.Rating) || details.Rating < 0 || details.Rating > 5 ||
        !isNumber(details.Reviews) || details.Reviews < 0 ||
        !isNumber(details.Size) || details.Size < 0 ||
        !isNumber(details.Installs) || details.Installs < 0 ||
        !isNumber(details.Price) || details.Price < 0 ||
        !isString(details.Category) || !isValidCategory(details.Category) ||
        !isString(details.Type) || !isValidType(details.Type) ||
        !isString(details.Genres) || !isValidGenre(details.Genres)) {
      throw new Error('Invalid app details');
    }
  };

  // Validate the appDetails object
  validateProperties(appDetails);

  // Normalize numerical features
  const normalizedRating = appDetails.Rating / maxValues.Rating;
  const normalizedReviews = appDetails.Reviews / maxValues.Reviews;
  const normalizedSize = appDetails.Size / maxValues.Size;
  const normalizedInstalls = appDetails.Installs / maxValues.Installs;
  const normalizedPrice = appDetails.Price / maxValues.Price;

  // One-hot encode categorical features
  const categoryEncoding = categories.map(category => appDetails.Category === category ? 1 : 0);
  const typeEncoding = types.map(type => appDetails.Type === type ? 1 : 0);
  const genreEncoding = genres.map(genre => appDetails.Genres.split(';')[0] === genre ? 1 : 0);

  // Combine all features into a single array
  const normalizedData = [
    normalizedRating,
    normalizedReviews,
    normalizedSize,
    normalizedInstalls,
    normalizedPrice,
    ...categoryEncoding,
    ...typeEncoding,
    ...genreEncoding,
  ];

  // Ensure the normalizedData array has the correct length
  const expectedLength = 5 + categories.length + types.length + genres.length;
  if (normalizedData.length !== expectedLength) {
    throw new Error(`Normalized data array has incorrect length: ${normalizedData.length}. Expected length is ${expectedLength}.`);
  }

  return normalizedData;
}

// The actual formatPredictionData function from App.js
function formatPredictionData(prediction) {
  console.log('Raw prediction data:', prediction); // Log raw prediction data for debugging

  // Convert Float32Array to regular array if necessary
  const predictionArray = prediction instanceof Float32Array ? Array.from(prediction) : prediction;
  console.log('Formatted prediction array:', predictionArray); // Log formatted prediction array for debugging

  // Ensure the prediction is an array with 12 values representing the popularity over time
  if (!Array.isArray(predictionArray) || predictionArray.length !== 12) {
    console.error('Prediction data is not in the expected format:', predictionArray);
    return { labels: [], data: [] }; // Return empty data if format is incorrect
  }

  // Create labels for each month assuming the prediction data is monthly for the past 12 months
  const labels = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
  const data = predictionArray; // Use the prediction data directly for the chart
  console.log('Final chart data:', { labels, data }); // Log final chart data for debugging

  return {
    labels: labels,
    data: data,
  };
}

// Test the formatPredictionData function with dummy prediction data
(async () => {
  // Load the TensorFlow.js model
  let model;
  try {
    // Set the backend to 'cpu'
    await tf.setBackend('cpu');
    // Wait for the backend to be ready
    await tf.ready();
    // Load the model from the specified path
    model = await tf.loadLayersModel('https://app-popularity-tracker-yznd6jop.devinapps.com/model/model.json');
  } catch (error) {
    console.error('Error loading the model', error);
  }

  try {
    // Simulate fetching and normalizing app details
    const appDetails = {
      Rating: 4.5,
      Reviews: 25924,
      Size: 25,
      Price: 0,
      Installs: 500000, // Assuming this is the normalized value
      Category: 'GAME',
      Type: 'Free',
      Genres: 'Action'
    }; // Replace with actual app details
    const normalizedData = normalizeData(appDetails);

    // Simulate making a prediction with the model
    const predictionTensor = tf.tensor2d([normalizedData], [1, normalizedData.length]);
    const prediction = await model.predict(predictionTensor).data();

    // Format the prediction data for the chart
    const formattedData = formatPredictionData(prediction);

    // Log the formatted data
    console.log('Formatted Data:', formattedData);
  } catch (error) {
    console.error('Error during test:', error);
  }
})();
