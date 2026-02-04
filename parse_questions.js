import fs from 'fs';

const content = fs.readFileSync('legacy/do-they-like-me.html', 'utf-8');
const regex = /<input type="checkbox" class="answer" data-value="(-?\d+)" id="([^"]+)">\s*<label for="[^"]+">([^<]+)<\/label>/g;
let match;
const questions = [];

while ((match = regex.exec(content)) !== null) {
  questions.push({
    id: match[2],
    value: parseInt(match[1]),
    text: match[3].trim()
  });
}

if (!fs.existsSync('src/data')){
    fs.mkdirSync('src/data', { recursive: true });
}

fs.writeFileSync('src/data/questions.json', JSON.stringify(questions, null, 2));
console.log(`Extracted ${questions.length} questions.`);
