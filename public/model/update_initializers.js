const fs = require("fs");
const modelPath = "./model.json";

let modelData = JSON.parse(fs.readFileSync(modelPath, "utf8"));

// Update the initializer for all layers that use OrthogonalInitializer
modelData.modelTopology.model_config.config.layers.forEach(layer => {
  if (layer.class_name === "LSTM") {
    if (layer.config.kernel_initializer && layer.config.kernel_initializer.class_name === "OrthogonalInitializer") {
      layer.config.kernel_initializer.class_name = "Orthogonal";
    }
    if (layer.config.recurrent_initializer && layer.config.recurrent_initializer.class_name === "OrthogonalInitializer") {
      layer.config.recurrent_initializer.class_name = "Orthogonal";
    }
  }
});

fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2), "utf8");
console.log("Model initializers updated successfully.");
