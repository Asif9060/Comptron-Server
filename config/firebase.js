import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Use service account (ideally loaded from environment variables)
const serviceAccount = {
  type: "service_account",
  project_id: "comptron-general-members",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "AIzaSyDSoMDR1eOn0g2wPR_FnlEPXa3i80RI15g",
  private_key: process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\ngAeSc5TMG4tR/K6LCmSIbPEX1IrrW0QHjnnpGwMlcaM5NU1G0zW3pd1Hl1/rYHr4\noDUxCV7Fqd4ePa5RIJImTU7MCQVri3nS8qccGxh7MxHBzW/SMViP1pXEOXOrd2Mv\ns6ADPj3AK5gzcWgQBJxmF4lZJjX1GkjIdYSZRL2AzllBVVzp3ITTKrpLIxmMfrAGZ\nICMwQWtAgMBAAECggEAAP0R1NBlc+R7I5zXMsP/CuUhGhQZQMFAtlanGgQB67yK\nMHYDjl9/59m8J3LT76qTXpdA0JVMqmP6kCq+1W7Y6XQuna6Qm+35kcLkRPAMqJCM\nJzGY0Hs00cCjA5BimLmLSEkWlTdiHIBajs8GHIRuDp41JfLzn8AgQLpVMaSj9X7N\n+MpwNPcJwGAMWaMHH6A2G2xM8wQlhPiY+PFmJYZlK5VhfpnMRcirJT4Qo6mCA7eV\n+ELBJ7x/ML1yFD/xO2acboTMJFJM1fTsA/cjOTWsjWOYP8BI9Eur4x5GHUcxtbXx\n5RthSKa+FYIuej8XDNRnUl3jYkVnk09qcAGiDIBfgQKBgQD8xkEITFIbpVp+8NWc\nRykQOyQrOlhB2nGEg5h3xQTB9xRaRMWhfhhMZW9LuQxjr6I7M8Ykk9G6AZiPL7Jj\nadwgJkLxQDspHdeSKRMRJzJZTYzFaNbLvIbNBQeeBYZWbZgUVAGxTjSNQtElGMJf\nSSHzJKRkfAWXLAzUs49+vsAMeQKBgQC9pNHu7uFtEVlXbG0EHbhIJRgWP5gW9tNL\nwKlxrpQs5T29Wn3gVgxJvV4+UMxbKv1Py5Mb/qwp3Miw/4UXxV7CU3GKpL8+XTaJ\n9YQ8xGZfieYEkwAV1iz3ZJT4RJq9hQjYjzPJPzXtLoqFTJZCJB/h3vJPYkJptGbw\nQDK3Af6PZQKBgG2Kne7+Z1QA9nn5wHHwlE34/mhORAN1DowH83gwLlrMpMmqIjLc\n4YQF+RbIrDW5hvKwxPQZsqVw+TAIf+qvWGXDNj3pyNHiMhVKY8LfPXPeGLKfUYq1\nrmDQ5C46fWV9+M+dD+lVhK0Ldq1+eRy9j6YkDz/DCLJxJ/k0HnPLkwK5AoGANpMC\nPBaFN7OYpXCmZx2Sp1cUmE4nvK6jYKnCCmdnTP2WUNYJUytWgY0v7KIUq2YXiADo\nYXd3JNK3wZ7GnHWsvJD8HvvJymw1WVYM0dEo0Q2QmU60/UwlSYcfg1+YHWJKbIIQ\nnQY+p6tM24fJwMEnWKYZ7NxwDJHdYmaGnZvHmOECgYEAlMgkGcgWiYoosqBjrwXg\nmyCCJvwEi87T8MA+CRYanIXmecuZTCw5UZvMeBpC+JZwGEQijsxDwZM9UdVapHDr\nbldGaIXy/YN4TpGw3UOCbVWXHEGnpuJZ5aE5QQLYYOOYJylYOHzJl2tpRNMauBkz\n9WbH4eUZGlPxVHZS+VGfdSw=\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-zz1hl@comptron-general-members.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "118060303789635964778",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zz1hl%40comptron-general-members.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default admin; 