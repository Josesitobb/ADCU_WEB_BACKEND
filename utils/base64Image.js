const fs = require('node:fs');

exports.base64image = (imageUrl) =>{
    return fs.readFileSync(imageUrl ,"base64");
}