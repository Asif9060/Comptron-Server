import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Use a simple configuration
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log("Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  // Fallback to dummy implementation if Firebase fails
  if (!admin.apps.length) {
    const dummyAdmin = {
      auth: () => ({
        createUser: async (userData) => {
          console.log("DUMMY FIREBASE: Would create user with email:", userData.email);
          return { uid: `dummy-uid-${Date.now()}` };
        },
        deleteUser: async (uid) => {
          console.log("DUMMY FIREBASE: Would delete user with UID:", uid);
          return true;
        }
      })
    };
    
    // Replace admin object with dummy if initialization fails
    admin = dummyAdmin;
    console.log("Using dummy Firebase implementation");
  }
}

export default admin; 