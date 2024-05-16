const fs = require("fs");
const modelPath = "./model.json";

let modelData = JSON.parse(fs.readFileSync(modelPath, "utf8"));
modelData.modelTopology.model_config.config.layers[0].config.inputShape = [1, 4];
delete modelData.modelTopology.model_config.config.layers[0].config.batch_shape;

fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2), "utf8");
console.log("Model JSON updated successfully.");
