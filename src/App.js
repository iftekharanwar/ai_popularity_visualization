import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import './App.css';
import SearchBar from './components/SearchBar';
import PopularityChart from './components/PopularityChart';

function App() {
  const [chartData, setChartData] = useState({
    labels: [], // Placeholder for time labels (e.g., months, years)
    datasets: [
      {
        label: 'User Rating Count',
        data: [], // Placeholder for data points
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });

  const [model, setModel] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  // Load the TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Set the backend to 'cpu'
        await tf.setBackend('cpu');
        // Wait for the backend to be ready
        await tf.ready();
        // Load the model from the specified path
        const loadedModel = await tf.loadLayersModel('https://app-popularity-tracker-tdl0r057.devinapps.com/model/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading the model', error);
      }
    };
    loadModel();
  }, []);

  // Function to normalize app details data for model prediction
  function normalizeData(appDetails) {
    // Validate appDetails properties
    const validateProperties = (details) => {
      const isNumber = (value) => typeof value === 'number' && !isNaN(value);
      const isString = (value) => typeof value === 'string' && value.trim() !== '';
      // Relaxing the validation for categories, types, and genres
      const isValidCategory = (value) => !value || categories.includes(value);
      const isValidType = (value) => !value || types.includes(value);
      const isValidGenre = (value) => !value || genres.includes(value.split(';')[0]);

      // Provide default values for missing numerical fields and allow strings to be empty
      details.Rating = isNumber(details.Rating) ? details.Rating : 0;
      details.Reviews = isNumber(details.Reviews) ? details.Reviews : 0;
      details.Size = isNumber(details.Size) ? details.Size : 0;
      details.Price = isNumber(details.Price) ? details.Price : 0;
      details.Category = isString(details.Category) && isValidCategory(details.Category) ? details.Category : 'UNKNOWN';
      details.Type = isString(details.Type) && isValidType(details.Type) ? details.Type : 'UNKNOWN';
      details.Genres = isString(details.Genres) && isValidGenre(details.Genres) ? details.Genres : 'UNKNOWN';
    };

    // Static maximum values for numerical features based on the training dataset
    const maxValues = {
      Rating: 5, // Assuming the rating is out of 5
      Reviews: 10000000, // Actual maximum value from the training dataset
      Size: 100, // Actual maximum value from the training dataset
      Price: 400, // Actual maximum value from the training dataset
    };

    // Unique categories, types, and genres based on the training dataset
    const categories = ['ART_AND_DESIGN', 'AUTO_AND_VEHICLES', 'BEAUTY', 'BOOKS_AND_REFERENCE', 'BUSINESS', 'COMICS', 'COMMUNICATION', 'DATING', 'EDUCATION', 'ENTERTAINMENT', 'EVENTS', 'FINANCE', 'FOOD_AND_DRINK', 'HEALTH_AND_FITNESS', 'HOUSE_AND_HOME', 'LIBRARIES_AND_DEMO', 'LIFESTYLE', 'GAME', 'FAMILY', 'MEDICAL', 'SOCIAL', 'SHOPPING', 'PHOTOGRAPHY', 'SPORTS', 'TRAVEL_AND_LOCAL', 'TOOLS', 'PERSONALIZATION', 'PRODUCTIVITY', 'PARENTING', 'WEATHER', 'VIDEO_PLAYERS', 'NEWS_AND_MAGAZINES', 'MAPS_AND_NAVIGATION'];
    const types = ['Free', 'Paid'];
    const genres = ['Action', 'Puzzle', 'Strategy', 'Casual', 'Arcade', 'Card', 'Board', 'Simulation', 'Word', 'Trivia', 'Adventure', 'Music', 'Role Playing', 'Racing', 'Sports', 'Family', 'Educational', 'Casino']; // Actual genres from the training dataset

    // Validate the appDetails object
    validateProperties(appDetails);

    // Normalize numerical features
    const normalizedRating = appDetails.Rating / maxValues.Rating;
    const normalizedReviews = appDetails.Reviews / maxValues.Reviews;
    const normalizedSize = appDetails.Size / maxValues.Size;
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
      normalizedPrice,
      ...categoryEncoding,
      ...typeEncoding,
      ...genreEncoding,
    ];

    // Check if the length of normalizedData matches the expected model input length (87 features)
    if (normalizedData.length !== 87) {
      // Log the length discrepancy for debugging
      console.error(`Normalized data length mismatch: expected 87, got ${normalizedData.length}`);
      // Pad the array with zeros to match the expected length
      while (normalizedData.length < 87) {
        normalizedData.push(0);
      }
    }

    return normalizedData;
  }

  // Function to handle search and update chart data
  const handleSearch = async (appName) => {
    if (!model) {
      console.error('Model not loaded yet');
      return;
    }
    // Fetch data for the app name using the AI model
    const fetchedData = await fetchDataForApp(appName);

    // Check if fetchedData is undefined before proceeding
    if (fetchedData === undefined) {
      // If fetchedData is undefined, do not attempt to update chartData
      // Set error message and flag
      setErrorMessage('No data found for the specified app name.');
      setHasError(true);
      return; // Exit the function early
    }

    // Log the fetched data for debugging
    console.log('Fetched data:', fetchedData);

    // Update chartData state with the fetched results
    setChartData((prevChartData) => {
      const updatedChartData = {
        labels: fetchedData.labels, // Replace with actual labels from fetched data
        datasets: [
          {
            ...prevChartData.datasets[0],
            data: fetchedData.data, // Replace with actual data points from fetched data
          },
        ],
      };
      console.log('Updated chartData within setChartData:', updatedChartData); // Log the updated chartData for debugging
      return updatedChartData;
    });
  };

  // Log the updated chartData state for debugging
  useEffect(() => {
    console.log('Chart data being passed to component:', chartData); // Log the chartData after state update
  }, [chartData]);

  // Function to fetch data using the AI model
  async function fetchDataForApp(appName) {
    // Reset error state before initiating a new search
    setErrorMessage('');
    setHasError(false);

    try {
      // Replace the server-side code with a fetch request to the server endpoint
      const response = await fetch(`https://app-popularity-tracker-tdl0r057.devinapps.com/api/data/${encodeURIComponent(appName)}`);
      if (!response.ok) {
        // Set error message and flag
        setErrorMessage(`HTTP error! status: ${response.status}`);
        setHasError(true);
        return; // Exit the function if there is an HTTP error
      }
      const appDetails = await response.json();

      // Normalize the fetched data
      const normalizedData = normalizeData(appDetails);
      // Log the normalized data for debugging
      console.log('Normalized data for prediction:', normalizedData);
      const prediction = await model.predict(tf.tensor2d([normalizedData], [1, normalizedData.length])).data();
      // Log the prediction data before formatting for debugging
      console.log('Raw prediction data:', prediction);

      // Format the prediction data for the chart
      const formattedData = formatPredictionData(prediction);

      return formattedData;

    } catch (error) {
      // Set error message and flag
      setErrorMessage('Error fetching data for app: ' + error.message);
      setHasError(true);
      console.error('Error fetching data for app', error);
    }
  }

  // Function to format prediction data for the chart
  function formatPredictionData(prediction) {
    // Log raw prediction data for debugging
    console.log('Raw prediction data:', prediction);

    // Convert Float32Array to regular array if necessary
    const predictionArray = prediction instanceof Float32Array ? Array.from(prediction) : prediction;
    // Log formatted prediction array for debugging
    console.log('Formatted prediction array:', predictionArray);

    // Log the length of the prediction array for debugging
    console.log('Length of prediction array:', predictionArray.length);

    // Check if the prediction array length is not as expected
    if (!Array.isArray(predictionArray) || predictionArray.length !== 12) {
      console.error('Prediction data is not in the expected format or length:', predictionArray);
    }

    // Check if all values in predictionArray are zero
    const allZeros = predictionArray.every(val => val === 0);
    if (allZeros) {
      console.error('Prediction data contains only zeros:', predictionArray);
    }

    // Create labels for each month based on the prediction array length
    const labels = predictionArray.map((_, i) => `Month ${i + 1}`);
    const data = predictionArray; // Use the prediction data directly for the chart

    // Log final chart data for debugging
    console.log('Final chart data:', { labels, data });

    return {
      labels: labels,
      data: data,
    };
  }

  return (
    <div className="App">
      <header className="App-header">
        {hasError && <div className="error-message">{errorMessage}</div>}
        <SearchBar onSearch={handleSearch} />
        <PopularityChart chartData={chartData} />
      </header>
    </div>
  );
}

export default App;
