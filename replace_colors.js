const fs = require('fs');
const path = require('path');

const replacementMap = {
    "background: 'white'": "background: 'var(--colorful-bg)'",
    'background: "white"': 'background: "var(--colorful-bg)"',
    "background: '#ffffff'": "background: 'var(--colorful-bg)'",
    'background: "#ffffff"': 'background: "var(--colorful-bg)"',
    "background: '#fff'": "background: 'var(--colorful-bg)'",
    'background: "#fff"': 'background: "var(--colorful-bg)"',
    "backgroundColor: 'white'": "backgroundColor: 'var(--colorful-bg)'",
    'backgroundColor: "white"': 'backgroundColor: "var(--colorful-bg)"',
    "backgroundColor: '#ffffff'": "backgroundColor: 'var(--colorful-bg)'",
    'backgroundColor: "#ffffff"': 'backgroundColor: "var(--colorful-bg)"'
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const targetDir = path.join(__dirname, 'client', 'src');

walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        for (const [findStr, replaceStr] of Object.entries(replacementMap)) {
            if (content.includes(findStr)) {
                content = content.split(findStr).join(replaceStr);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated ${filePath}`);
        }
    }
});

console.log('Colorful background replacement complete.');
