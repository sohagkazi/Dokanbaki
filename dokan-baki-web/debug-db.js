const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);

    let output = '';
    output += '--- USERS ---\n';
    db.users.forEach(u => output += `User: ${u.name} (Mobile: ${u.mobile}, ID: ${u.id})\n`);

    output += '\n--- SHOPS ---\n';
    db.shops.forEach(s => output += `Shop: ${s.name} (OwnerID: ${s.ownerId}, ID: ${s.id})\n`);

    fs.writeFileSync('debug_output.txt', output);
    console.log('Debug output written to debug_output.txt');

} catch (e) {
    console.error('Error reading DB:', e.message);
}
