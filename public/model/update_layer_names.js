const fs = require("fs");
const modelPath = "./model.json";

let modelData = JSON.parse(fs.readFileSync(modelPath, "utf8"));

// Correct the layer names to match the weights provided
modelData.weightsManifest[0].weights.forEach(weight => {
  if (weight.name.includes("/dense/dense")) {
    weight.name = weight.name.replace("/dense/dense", "/dense/kernel");
  } else if (weight.name.includes("/lstm/lstm")) {
    weight.name = weight.name.replace("/lstm/lstm", "/lstm/lstm_cell/kernel");
  } else if (weight.name.includes("/lstm/lstm_1")) {
    weight.name = weight.name.replace("/lstm/lstm_1", "/lstm_1/lstm_cell/kernel");
  }
});

fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2), "utf8");
console.log("Model layer names updated successfully.");
