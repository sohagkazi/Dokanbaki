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

admin.firestore().collection('users').get().then(snapshot => {
  const batch = admin.firestore().batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { password: '123456' });
  });
  return batch.commit();
}).then(() => {
  console.log('All passwords updated to 123456');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
