// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDDYZrcySb-ourouaQsRxlVXb8Et1i6Xs8",
    authDomain: "dokanbakikhata.firebaseapp.com",
    projectId: "dokanbakikhata",
    storageBucket: "dokanbakikhata.firebasestorage.app",
    messagingSenderId: "49866951058",
    appId: "1:49866951058:web:549ab8821f1b3f8740594b",
    measurementId: "G-Q1881GH08D"
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
