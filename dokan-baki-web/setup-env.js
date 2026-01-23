const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const apiKey = 'AIzaSyC011uSdAfckpymckccsTvjKqDh1xI0qlI';
const envVar = `GOOGLE_GENERATIVE_AI_API_KEY=${apiKey}`;

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    if (!content.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
        fs.appendFileSync(envPath, `\n${envVar}\n`);
        console.log('Appended API Key to .env.local');
    } else {
        console.log('API Key already exists in .env.local');
    }
} catch (e) {
    console.error('Error writing .env.local:', e);
}
