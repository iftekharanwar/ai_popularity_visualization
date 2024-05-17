const tf = require('@tensorflow/tfjs-node');

async function defineAndSaveModel() {
  // Define the model architecture
  const model = tf.sequential({
    layers: [
      // Input layer
      tf.layers.inputLayer({ batchInputShape: [null, 1, 4], name: 'input_layer' }), // Corrected input shape to include batch size
      // Two LSTM layers as indicated by the .h5 file inspection
      tf.layers.lstm({ units: 50, returnSequences: true, name: 'lstm' }), // First LSTM layer
      tf.layers.lstm({ units: 50, returnSequences: true, name: 'lstm_1' }), // Second LSTM layer to return sequences
      // Dense layer to output a sequence of values for time series prediction
      // Assuming we want to predict 12 time steps (e.g., monthly data points over a year)
      tf.layers.dense({ units: 12, activation: 'linear', useBias: true, name: 'output' }) // Output layer modified to have 12 units
    ]
  });

  try {
    // Save the model in TensorFlow.js format
    await model.save('file:///home/ubuntu/app_popularity_frontend/public/model');
    console.log("Model saved in TensorFlow.js format.");
  } catch (error) {
    console.error(`An error occurred while saving the model: ${error}`);
  }

  return model;
}

// Execute the function to define and save the model
defineAndSaveModel()
  .then(model => {
    // The model can now be used for inference or further training
  });
