const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    const shops = db.shops || [];
    console.log("Total Shops:", shops.length);
    console.log("Shops:", JSON.stringify(shops, null, 2));

    // Also print users to cross-reference IDs if needed
    const users = db.users || [];
    console.log("Total Users:", users.length);
    users.forEach(u => console.log(`User: ${u.name} (${u.mobile}) - ID: ${u.id}`));

} catch (err) {
    console.error("Error reading DB:", err);
}
