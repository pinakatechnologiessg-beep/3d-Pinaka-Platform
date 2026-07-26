const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'build' || f === '.gemini' || f === 'brain') return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFolder(folder) {
  walkDir(folder, function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;
      
      // Replace different variants of the company name
      content = content.replace(/3D Pinaka Technology Ltd\./gi, 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED');
      content = content.replace(/Pinaka Technologies SG Pvt Ltd/gi, 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED');
      content = content.replace(/Pinaka Technologies/gi, 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED');
      content = content.replace(/3D Pinaka/gi, 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED');
      content = content.replace(/3DPinaka/gi, 'PINAKA TECHNOLOGIES SG PRIVATE LIMITED');
      
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
      }
    }
  });
}

processFolder('server');
processFolder('client/public');
