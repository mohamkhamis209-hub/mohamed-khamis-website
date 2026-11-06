import {initializeApp} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
const config={apiKey:"AIzaSyCPw4s-M_a8y_VvPfeMDWCTBFNGBXXzcE",authDomain:"mohamed-khamis.firebaseapp.com",projectId:"mohamed-khamis",storageBucket:"mohamed-khamis.firebasestorage.app",messagingSenderId:"534587371999",appId:"1:534587371999:web:ae906a8cd8d377571a546a"};
export const app=initializeApp(config);export const auth=getAuth(app);export const db=getFirestore(app);