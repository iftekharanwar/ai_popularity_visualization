const fs = require("fs");
const modelPath = "./model.json";

let modelData = JSON.parse(fs.readFileSync(modelPath, "utf8"));

// Remove the comment from the JSON file
modelData = JSON.parse(JSON.stringify(modelData).replace(/\/\/.*\n/g, ""));

fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2), "utf8");
console.log("Comment removed from JSON file successfully.");
