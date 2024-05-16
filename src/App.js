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

  // Load the TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Set the backend to 'cpu'
        await tf.setBackend('cpu');
        // Wait for the backend to be ready
        await tf.ready();
        // Load the model from the specified path
        const loadedModel = await tf.loadLayersModel('http://localhost:3001/model/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading the model', error);
      }
    };
    loadModel();
  }, []);

  // Function to normalize app details data for model prediction
  function normalizeData(appDetails) {
    // Example maximum values for numerical features
    const maxValues = {
      Rating: 5,
      Reviews: 10000000,
      Size: 100,
      Price: 400,
    };

    // Example unique categories for one-hot encoding
    const uniqueCategories = ['ART_AND_DESIGN', 'AUTO_AND_VEHICLES', 'BEAUTY', 'BOOKS_AND_REFERENCE', 'BUSINESS', 'COMICS', 'COMMUNICATION', 'DATING', 'EDUCATION', 'ENTERTAINMENT', 'EVENTS', 'FINANCE', 'FOOD_AND_DRINK', 'HEALTH_AND_FITNESS', 'HOUSE_AND_HOME', 'LIBRARIES_AND_DEMO', 'LIFESTYLE', 'GAME', 'FAMILY', 'MEDICAL', 'SOCIAL', 'SHOPPING', 'PHOTOGRAPHY', 'SPORTS', 'TRAVEL_AND_LOCAL', 'TOOLS', 'PERSONALIZATION', 'PRODUCTIVITY', 'PARENTING', 'WEATHER', 'VIDEO_PLAYERS', 'NEWS_AND_MAGAZINES', 'MAPS_AND_NAVIGATION'];

    // Normalize numerical features
    const normalizedRating = appDetails.Rating / maxValues.Rating;
    const normalizedReviews = appDetails.Reviews / maxValues.Reviews;
    const normalizedSize = appDetails.Size / maxValues.Size;
    const normalizedPrice = appDetails.Price / maxValues.Price;

    // One-hot encode categorical features
    const categoryEncoding = uniqueCategories.map(category => appDetails.Category === category ? 1 : 0);

    // Combine all features into a single array
    const normalizedData = [
      normalizedRating,
      normalizedReviews,
      normalizedSize,
      normalizedPrice,
      ...categoryEncoding,
    ];

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
    try {
      // Replace the server-side code with a fetch request to the server endpoint
      const response = await fetch(`https://app-popularity-tracker-yznd6jop.devinapps.com/api/data/${encodeURIComponent(appName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const appDetails = await response.json();

      // Normalize the fetched data
      const normalizedData = normalizeData(appDetails);

      // Predict the popularity using the AI model
      const prediction = await model.predict(tf.tensor2d([normalizedData], [1, normalizedData.length])).data();

      // Format the prediction data for the chart
      const formattedData = formatPredictionData(prediction);

      return formattedData;

    } catch (error) {
      console.error('Error fetching data for app', error);
    }
  }

  // Function to format prediction data for the chart
  function formatPredictionData(prediction) {
    // Convert Float32Array to regular array if necessary
    const predictionArray = prediction instanceof Float32Array ? Array.from(prediction) : prediction;

    // Ensure the prediction is an array with 12 values representing the popularity over time
    if (!Array.isArray(predictionArray) || predictionArray.length !== 12) {
      console.error('Prediction data is not in the expected format:', predictionArray);
      return { labels: [], data: [] }; // Return empty data if format is incorrect
    }

    // Check if all values in predictionArray are zero
    const allZeros = predictionArray.every(val => val === 0);
    if (allZeros) {
      console.error('Prediction data contains only zeros:', predictionArray);
      // If all values are zero, return a sample data set for demonstration purposes
      // TODO: Replace with actual prediction data once the model is correctly predicting
      return {
        labels: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
        data: Array.from({ length: 12 }, (_, i) => Math.sin(i / 2) * (Math.random() * 10)), // Sample sine wave data
      };
    }

    // Create labels for each month assuming the prediction data is monthly for the past 12 months
    const labels = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);
    const data = predictionArray; // Use the prediction data directly for the chart

    return {
      labels: labels,
      data: data,
    };
  }

  return (
    <div className="App">
      <header className="App-header">
        <SearchBar onSearch={handleSearch} />
        <PopularityChart chartData={chartData} />
      </header>
    </div>
  );
}

export default App;
