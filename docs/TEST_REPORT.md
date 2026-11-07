# Local code checks

Run `npm test` from the project root. The test script checks the Firebase-only browser integration, public form writes, admin Firestore operations, ImgBB upload configuration, Firestore rules presence, and developer-tools deterrent loading.

Local static checks do not prove that Firebase rules have been published or that live credentials, account permissions, or third-party services are working. Verify those after publishing the Firestore rules.
