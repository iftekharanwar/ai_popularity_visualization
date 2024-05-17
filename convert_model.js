const tf = require('@tensorflow/tfjs-node');
const tfjsConverter = require('@tensorflow/tfjs-converter');

async function convertModel() {
  // Define the path to the original Keras model file
  const modelPath = 'file:///home/ubuntu/app_popularity_model.h5';
  // Define the output directory where the converted model will be saved
  const outputDir = '/home/ubuntu/app_popularity_frontend/public/model';

  try {
    // Load the Keras model
    const model = await tf.loadLayersModel(modelPath);
    // Define the inputShape for the InputLayer before saving the model
    const inputShape = [1, 4];
    // Update the first layer's input shape
    model.layers[0].batchInputShape = inputShape;
    // Save the model in TensorFlow.js format
    await model.save(tfjsConverter.io.fileSystem(outputDir));
    console.log('Model conversion complete.');
  } catch (error) {
    console.error('Model conversion failed:', error);
  }
}

// Execute the model conversion function
convertModel();
