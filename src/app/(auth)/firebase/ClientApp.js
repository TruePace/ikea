// File: firebase/clientApp.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBs5Cit5VhbKKLns4zrkfGm4AmFrpnXELE",
    authDomain: "trupace-user-username-password.firebaseapp.com",
    projectId: "trupace-user-username-password",
    storageBucket: "trupace-user-username-password.appspot.com",
    messagingSenderId: "157754909516",
    appId: "1:157754909516:web:bea7e2577bbfd09cb5e5e9",
    measurementId: "G-LWS2XY407D"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

export {auth}