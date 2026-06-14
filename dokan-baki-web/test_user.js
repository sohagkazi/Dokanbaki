const fs = require('fs');
const admin = require('firebase-admin');

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

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
    privateKey: envVars.FIREBASE_PRIVATE_KEY
  })
});

async function testUser() {
  const query = await admin.firestore().collection('users').get();
  console.log('TOTAL USERS IN FIRESTORE:', query.docs.length);
  query.docs.forEach(doc => {
      console.log('USER ID:', doc.id, 'MOBILE:', doc.data().mobile, 'PASSWORD:', doc.data().password);
  });
}
testUser().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
