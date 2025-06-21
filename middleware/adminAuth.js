import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
// This assumes your firebase-admin config is set up somewhere accessible
// If not, you might need to add service account key here or in a config file.
// For now, I'll assume it's initialized globally or you'll provide the config.
// For example, if you have a serviceAccountKey.json, you would do:
// import serviceAccount from '../path/to/serviceAccountKey.json';
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

const adminEmails = [
  'asiffoisalaisc@gmail.com' // TODO: Replace with your actual admin emails
    // TODO: Replace with your actual admin emails
];

const protectAdminRoute = async (req, res, next) => {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!adminEmails.includes(userEmail)) {
      return res.status(403).json({ message: 'Forbidden: You do not have admin access.' });
    }

    req.user = decodedToken; // Attach decoded token to request for further use if needed
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.', error: error.message });
  }
};

export default protectAdminRoute; 