const fs = require('fs');

let rawData = fs.readFileSync('config.json');
let config = JSON.parse(rawData);

console.log(config.tags[0]);