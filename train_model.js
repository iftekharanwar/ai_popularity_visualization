const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const Papa = require('papaparse');

// Function to load and preprocess the dataset
function preprocessData(filePath) {
  // Read the CSV file
  const file = fs.readFileSync(filePath, 'utf8');
  // Parse CSV file with PapaParse
  const parsed = Papa.parse(file, { header: true, dynamicTyping: true });
  const data = parsed.data;

  // Extract relevant columns and preprocess data
  const apps = data.map(app => ({
    name: app.App,
    category: app.Category,
    rating: app.Rating,
    reviews: app.Reviews,
    size: app.Size,
    installs: parseInt(app.Installs ? app.Installs.replace(/,/g, '').replace('+', '') : '0'),
    type: app.Type,
    price: parseFloat(app.Price ? app.Price.replace('$', '') : '0'),
    genres: app.Genres.split(';')[0] // Take the first genre if there are multiple
  }));

  // Normalize numerical data
  const maxInstalls = Math.max(...apps.map(app => app.installs));
  const maxReviews = Math.max(...apps.map(app => app.reviews));
  const maxPrice = Math.max(...apps.map(app => app.price));

  const normalizedApps = apps.map(app => ({
    ...app,
    installs: app.installs / maxInstalls,
    reviews: app.reviews / maxReviews,
    price: app.price / maxPrice
  }));

  // One-hot encode categorical data
  const categories = [...new Set(apps.map(app => app.category))];
  const types = [...new Set(apps.map(app => app.type))];
  const genres = [...new Set(apps.map(app => app.genres))];

  const oneHotEncodedApps = normalizedApps.map(app => {
    const categoryOneHot = categories.map(category => category === app.category ? 1 : 0);
    const typeOneHot = types.map(type => type === app.type ? 1 : 0);
    const genreOneHot = genres.map(genre => genre === app.genres ? 1 : 0);

    return {
      ...app,
      category: categoryOneHot,
      type: typeOneHot,
      genres: genreOneHot
    };
  });

  // Return the preprocessed apps along with the lengths of the one-hot encoded arrays
  return {
    oneHotEncodedApps,
    categoriesLength: categories.length,
    typesLength: types.length,
    genresLength: genres.length
  };
}

// Function to define the model architecture
function defineModel(inputShape) {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [inputShape], units: 64, activation: 'relu' }),
      tf.layers.dense({ units: 64, activation: 'relu' }),
      tf.layers.dense({ units: 1, activation: 'linear' })
    ]
  });
  return model;
}

// Function to compile the model
function compileModel(model) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
    metrics: ['mse']
  });
}

// Function to train the model
async function trainModel(model, xs, ys) {
  await model.fit(xs, ys, {
    epochs: 100,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });
}

// Function to evaluate the model
function evaluateModel(model, xs, ys) {
  const preds = model.predict(xs);
  console.log('Prediction: ', preds.dataSync());
  console.log('Actual: ', ys.dataSync());
}

// Function to save the trained model
function saveModel(model) {
  const savePath = 'file:///home/ubuntu/app_popularity_frontend/public/model';
  model.save(savePath).then(() => console.log(`Model saved to ${savePath}`));
}

// Main function to execute the training script
async function main() {
  const { oneHotEncodedApps, categoriesLength, typesLength, genresLength } = preprocessData('/home/ubuntu/app_popularity_frontend/apps.csv');

  // Calculate the input shape based on the structure of the preprocessed data
  const numericFeatureCount = 4; // There are 4 numeric features: rating, reviews, size, price
  const inputShape = numericFeatureCount + categoriesLength + typesLength + genresLength;

  const model = defineModel(inputShape);
  compileModel(model);

  // Flatten the preprocessed data to match the input shape
  const xsData = oneHotEncodedApps.map(app => {
    // Extract numeric values and concatenate with one-hot encoded arrays
    const numericValues = [app.rating, app.reviews, app.size, app.price];
    const categoryArray = app.category;
    const typeArray = app.type;
    const genreArray = app.genres;
    return numericValues.concat(categoryArray, typeArray, genreArray);
  });
  const xs = tf.tensor2d(xsData, [oneHotEncodedApps.length, inputShape]);

  const ysData = oneHotEncodedApps.map(app => app.installs);
  const ys = tf.tensor2d(ysData, [oneHotEncodedApps.length, 1]);

  await trainModel(model, xs, ys);
  evaluateModel(model, xs, ys);
  saveModel(model);
}

main();
