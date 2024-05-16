# Project Documentation - App Popularity AI Model and Frontend Application

## Introduction
This document provides a comprehensive guide to the App Popularity AI Model and Frontend Application. The application serves as a search engine for app popularity data, integrating an AI model to analyze and graphically represent the data over time. Users can search for web and mobile applications to view popularity metrics such as downloads, user ratings, and active users from app stores, social media, and web analytics.

## Prerequisites
- Node.js (v14.17.0 or higher) and npm (v6.14.13 or higher)
  - Download and install Node.js from [the official website](https://nodejs.org/).
  - npm is included with Node.js installation.
  - Check Node.js version: `node -v`
  - Check npm version: `npm -v`
- React (v17.0.2 or higher)
  - Ensure Node.js and npm are installed.
  - Use `npx create-react-app my-app` to create a new React application.
  - Check React version within a project: `npm list react`
- Chakra UI (v1.6.5 or higher)
  - After setting up the React application, install Chakra UI by running `npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion`.
  - Check Chakra UI version: `npm list @chakra-ui/react`
- TensorFlow.js (v3.9.0 or higher)
  - Install TensorFlow.js by running `npm install @tensorflow/tfjs`.
  - Check TensorFlow.js version: `npm list @tensorflow/tfjs`

## Setup
To set up the development environment and run the application locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/iftekharanwar/ai_popularity_visualization.git
   cd ai_popularity_visualization
   ```
2. Install the necessary dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
   This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment
To deploy the frontend application to Netlify and expose the Express server to the internet, follow these steps:

1. Build the React application for production:
   ```
   npm run build
   ```
   This command creates an optimized production build of your app in the `build` directory.

2. Deploy the build to Netlify:
   - Ensure you have the Netlify CLI installed by running `npm install netlify-cli -g`.
   - Login to your Netlify account using `netlify login`.
   - Deploy the application using `netlify deploy --prod --dir=build`.
   - Note the unique URL provided by Netlify after deployment.
   - Ensure the Netlify CLI is up to date by running `npm update netlify-cli -g`.

3. Expose the Express server:
   - Run the Express server on your local machine.
   - Use the command `<expose_port local_port="3001"/>` to expose the server's port to the internet.
   - Note the exposed URL and update the frontend application's API endpoint configuration to use this URL.

## Usage
To use the application, follow these steps:

1. Navigate to the deployed application URL in your web browser.
2. Enter the name of the app you wish to search for in the search bar.
3. Click the 'Search' button or press 'Enter' to submit your query.
4. The application will display a graphical representation of the app's popularity data over time, including metrics such as downloads, user ratings, and active users.
5. If an error occurs or the app name is not found, an error message will be displayed on the screen.
6. Include screenshots for each step to guide users visually.

Below is a screenshot of the application's interface showing the search bar and an example of an error message when no data is found for a specified app name:

![Application Screenshot showing the search bar and an error message "No data found for the specified app name."](https://app-popularity-tracker-tdl0r057.devinapps.com/fb474efa-1afb-406e-b504-8e097d8192bb.png)

## Error Handling
The application has been designed with robust error handling to provide clear feedback to the user. If an error occurs during data fetching or processing, the application will display an error message on the screen. Common error messages include "No data found for the specified app name," "Server error, please try again later," and "Invalid input, please enter a valid app name."

## Troubleshooting
If you encounter issues while using the application, consider the following troubleshooting steps:

- Ensure that the application URL is correct and that you have an active internet connection.
- Verify that the Express server is running and properly exposed if you are running the server locally.
- Clear your browser cache or try using the application in an incognito window to avoid issues with cached data.
- Check the browser console for any error messages that can provide more insight into the issue.
- If you receive a "Server not responding" error, ensure that the server is not down for maintenance and that the exposed URL is correct.
- For "App not found" errors, double-check the spelling of the app name and try different variations or spellings.

If problems persist, please consult the application logs or contact support for further assistance.
