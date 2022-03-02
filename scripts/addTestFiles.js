const path = require("path");
const { autoAddTest } = require("../src");

const relativePath = "../test";

autoAddTest(path.join(__dirname, relativePath));
