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

const serviceAccount = {
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
  privateKey: envVars.FIREBASE_PRIVATE_KEY
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

async function updateRules() {
  try {
    const ruleset = await admin.securityRules().createRuleset({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rules
          }
        ]
      }
    });

    await admin.securityRules().releaseFirestoreRuleset(ruleset.name);
    console.log('Firebase Security Rules successfully updated to allow all access!');
  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

updateRules();
