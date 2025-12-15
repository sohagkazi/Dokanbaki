// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBjpvvhz-laD-1MbXvREEvbLHLLy1qs4kw",
    authDomain: "dokanbaki-fd663.firebaseapp.com",
    projectId: "dokanbaki-fd663",
    storageBucket: "dokanbaki-fd663.firebasestorage.app",
    messagingSenderId: "932248769242",
    appId: "1:932248769242:web:b966458397fad75ea94be3",
    measurementId: "G-55X9YQSRL5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;

if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, analytics };
