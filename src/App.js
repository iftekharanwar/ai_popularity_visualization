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
    // This log statement is removed as it does not accurately reflect the updated state
  };

  // Log the updated chartData state for debugging
  useEffect(() => {
    console.log('Chart data being passed to component:', chartData); // Log the chartData after state update
    console.log('Updated chartData state:', chartData);
  }, [chartData]);

  // Function to fetch data using the AI model
  async function fetchDataForApp(appName) {
    try {
      // Actual maximum values from the dataset for normalization
      const maxValues = {
        rating: 5, // Maximum rating value
        reviews: 78158306, // Maximum number of reviews
        size: 100, // Placeholder for maximum size (to be updated)
        price: 400, // Maximum price
      };

      // Actual unique categories, types, and genres from the dataset
      const uniqueCategories = [
        'ART_AND_DESIGN', 'AUTO_AND_VEHICLES', 'BEAUTY', 'BOOKS_AND_REFERENCE',
        'BUSINESS', 'COMICS', 'COMMUNICATION', 'DATING', 'EDUCATION',
        'ENTERTAINMENT', 'EVENTS', 'FINANCE', 'FOOD_AND_DRINK',
        'HEALTH_AND_FITNESS', 'HOUSE_AND_HOME', 'LIBRARIES_AND_DEMO',
        'LIFESTYLE', 'GAME', 'FAMILY', 'MEDICAL', 'SOCIAL', 'SHOPPING',
        'PHOTOGRAPHY', 'SPORTS', 'TRAVEL_AND_LOCAL', 'TOOLS',
        'PERSONALIZATION', 'PRODUCTIVITY', 'PARENTING', 'WEATHER',
        'VIDEO_PLAYERS', 'NEWS_AND_MAGAZINES', 'MAPS_AND_NAVIGATION'
      ];
      const uniqueTypes = ['Free', 'Paid'];
      const uniqueGenres = [
        'Art & Design', 'Pretend Play', 'Creativity', 'Action & Adventure',
        'Auto & Vehicles', 'Beauty', 'Books & Reference', 'Business', 'Comics',
        'Communication', 'Dating', 'Education', 'Music & Video', 'Brain Games',
        'Entertainment', 'Events', 'Finance', 'Food & Drink', 'Health & Fitness',
        'House & Home', 'Libraries & Demo', 'Lifestyle', 'Adventure', 'Arcade',
        'Casual', 'Card', 'Action', 'Strategy', 'Puzzle', 'Sports', 'Music',
        'Word', 'Racing', 'Simulation', 'Board', 'Trivia', 'Role Playing',
        'Educational', 'Music & Audio', 'Video Players & Editors', 'Medical',
        'Social', 'Shopping', 'Photography', 'Travel & Local', 'Tools',
        'Personalization', 'Productivity', 'Parenting', 'Weather',
        'News & Magazines', 'Maps & Navigation', 'Casino'
      ];

      // Placeholder for app details to be replaced with actual data retrieval logic
      const appDetails = {
        name: appName,
        category: 'Category1', // Replace with actual category
        type: 'Free', // Replace with actual type
        genres: 'Genre1', // Replace with actual genre
        rating: 4.5, // Replace with actual rating
        reviews: 100000, // Replace with actual number of reviews
        size: 50, // Replace with actual size
        price: 0, // Replace with actual price
      };

      // Normalize numeric features
      const normalizedNumericFeatures = [
        appDetails.rating / maxValues.rating,
        appDetails.reviews / maxValues.reviews,
        appDetails.size / maxValues.size,
        appDetails.price / maxValues.price,
      ];

      // One-hot encode categorical features
      const categoryOneHot = uniqueCategories.map(category => category === appDetails.category ? 1 : 0);
      const typeOneHot = uniqueTypes.map(type => type === appDetails.type ? 1 : 0);
      const genreOneHot = uniqueGenres.map(genre => genre === appDetails.genres ? 1 : 0);

      // Combine one-hot encoded and numeric features
      const inputFeatures = normalizedNumericFeatures.concat(categoryOneHot, typeOneHot, genreOneHot);

      // Convert the combined features array to a 2D tensor
      const inputTensor = tf.tensor2d(inputFeatures, [1, inputFeatures.length]);

      // Log the input tensor shape for debugging
      console.log('Input tensor shape:', inputTensor.shape);

      // Make a prediction using the model
      const prediction = await model.predict(inputTensor).data();

      // Log the prediction shape and content for debugging
      console.log('Prediction shape:', prediction.length);
      console.log('Prediction content:', prediction);

      // Format the prediction data for the chart
      const formattedData = formatPredictionData(prediction);

      // Additional log to confirm the structure of formattedData
      console.log('formattedData before return:', formattedData);

      return formattedData;
    } catch (error) {
      console.error('Error fetching data for app:', error);
      return { labels: [], data: [] }; // Return empty data on error
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
