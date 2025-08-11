import { initializeApp } from 'firebase/app'
import { getDatabase } from "firebase/database";

export const firebaseApp = initializeApp({
        apiKey: "AIzaSyBsbGUIDkNUajXdpCplnjlH7AgyhxPFsDs",
        authDomain: "movie-wheel-b9c5f.firebaseapp.com",
        databaseURL: "https://movie-wheel-b9c5f-default-rtdb.firebaseio.com",
        projectId: "movie-wheel-b9c5f",
        storageBucket: "movie-wheel-b9c5f.firebasestorage.app",
        messagingSenderId: "926962560784",
        appId: "1:926962560784:web:def23370cbec02df7dbf95",
        measurementId: "G-BW9MBPMWQP"
    
}) // Initialize the Realtime Database