import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  collection,
  query,
  getDocs,
  limit
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBICiVeKR9D56vPkDCdzXUNJVyrO1VXmcc",
  authDomain: "issue-tracker-6b563.firebaseapp.com",
  projectId: "issue-tracker-6b563",
  storageBucket: "issue-tracker-6b563.appspot.com",
  messagingSenderId: "402366724290",
  appId: "1:402366724290:web:230145650e02800e20235b"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  auth = getAuth(app);
  console.log('Firebase Auth initialized successfully');
  
  db = getFirestore(app);
  console.log('Firebase Firestore initialized successfully');
  
  // Use emulators for local development if needed
  if (window.location.hostname === 'localhost') {
    // Uncomment these lines if you're using Firebase emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Running in local environment, emulators not enabled');
  }
  
  // Enable offline persistence (with error handling)
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Firestore persistence enabled successfully');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open. Persistence enabled in only one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence failed: Browser does not support IndexedDB.');
      } else {
        console.error('Firestore persistence error:', err);
      }
    });
  
  console.log('Firebase initialization complete');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  
  // Log more detailed error information
  if (error.code) {
    console.error('Error code:', error.code);
  }
  
  if (error.message) {
    console.error('Error message:', error.message);
  }
  
  // Check for common Firebase initialization issues
  if (!firebaseConfig.apiKey) {
    console.error('Firebase API key is missing');
  }
  
  if (!firebaseConfig.projectId) {
    console.error('Firebase project ID is missing');
  }
  
  if (!firebaseConfig.appId) {
    console.error('Firebase App ID is missing');
  }
}

// Export a function to test Firestore connection
export const testFirestoreConnection = async () => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    const testCollection = collection(db, '_connection_test');
    const testQuery = query(testCollection, limit(1));
    await getDocs(testQuery);
    return { success: true, message: 'Firestore connection successful' };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return { 
      success: false, 
      message: 'Firestore connection failed', 
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
};

export { auth, db }; 