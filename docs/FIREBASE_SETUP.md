# Firebase setup for GitHub Pages

This version uses Firebase Web SDK directly from the browser. No Cloud Functions or Netlify Functions are required.

- Firebase project: `mohamed-khamis`
- Authentication provider: Email/Password
- Database: Cloud Firestore

Before accepting public forms, publish the included `firestore.rules` from Firebase Console → Firestore Database → Rules. These rules allow visitors to create validated requests and messages, while reads and updates remain limited to active admins with the relevant permission.

The Firebase Web configuration is in `assets/js/config.js`. Keep the administrator UID in sync with the actual Firebase Authentication UID.
