const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1).replace(/\\n/g, '\n');
    }
    envVars[match[1].trim()] = val;
  }
});

const serviceAccount = {
  project_id: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  client_email: envVars.FIREBASE_CLIENT_EMAIL,
  private_key: envVars.FIREBASE_PRIVATE_KEY
};

fs.writeFileSync('service-account.json', JSON.stringify(serviceAccount, null, 2));
console.log('Created service-account.json');
