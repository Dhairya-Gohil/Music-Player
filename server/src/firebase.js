const fs = require('fs');
const path = require('path');
const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load .env from project root or server folder if present
try {
  const dotenv = require('dotenv');
  const rootEnv = path.resolve(__dirname, '..', '..', '.env');
  const serverEnv = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
  if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });
} catch (e) {
  // dotenv optional in serverless environments where env vars are injected
}

let firestoreDb = null;

function findServiceAccountFile() {
  const dirs = [
    path.resolve(__dirname, '..', '..'),
    path.resolve(__dirname, '..'),
    process.cwd()
  ];

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      const directPath = path.join(dir, 'firebase-service-account.json');
      if (fs.existsSync(directPath)) return directPath;

      const files = fs.readdirSync(dir);
      const sdkFile = files.find(f => f.endsWith('.json') && f.includes('firebase-adminsdk'));
      if (sdkFile) return path.join(dir, sdkFile);
    } catch (e) {}
  }
  return null;
}

function isPlaceholder(val) {
  if (!val) return true;
  return (
    val.includes('your-firebase-project-id') ||
    val.includes('YOUR_PRIVATE_KEY_HERE') ||
    val.includes('xxxxx')
  );
}

function getServiceAccountCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.FIREBASE_SERVICE_ACCOUNT.includes('...')) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  }

  // Check local service account JSON file first if present
  const filePath = findServiceAccountFile();
  if (filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error('Error reading Firebase service account file:', err.message);
    }
  }

  if (
    !isPlaceholder(process.env.FIREBASE_PROJECT_ID) &&
    !isPlaceholder(process.env.FIREBASE_CLIENT_EMAIL) &&
    !isPlaceholder(process.env.FIREBASE_PRIVATE_KEY)
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  return null;
}

function isFirebaseConfigured() {
  return Boolean(getServiceAccountCredential());
}

function getDb() {
  if (firestoreDb) return firestoreDb;

  const serviceAccount = getServiceAccountCredential();
  if (!serviceAccount) return null;

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log(`🔥 Firebase Firestore connected (project: ${serviceAccount.project_id || serviceAccount.projectId})`);
  }

  firestoreDb = getFirestore();
  return firestoreDb;
}

module.exports = {
  isFirebaseConfigured,
  getDb
};
