const fs = require('fs');
const content = fs.readFileSync('c:/Users/kusal/Desktop/Clothstore_pos/js/app.js', 'utf8');
let inString = false;
let stringChar = '';
let lines = content.split('\n');
lines.forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (inString) {
            if (char === '\\') { j++; continue; }
            if (char === stringChar) inString = false;
        } else {
            if (char === "'" || char === '"' || char === '`') {
                inString = true;
                stringChar = char;
            }
        }
    }
});
if (inString) {
    console.log(`Unclosed string starting with ${stringChar}`);
} else {
    console.log("All strings closed.");
}
