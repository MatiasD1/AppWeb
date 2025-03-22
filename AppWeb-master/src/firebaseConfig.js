import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Para Firestore (base de datos)
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Para autenticación

const firebaseConfig = {
  apiKey: "AIzaSyB4xaVxaNiSki4BIHWVr91k3rj1U7H-1f0",
  authDomain: "appweb-a26dd.firebaseapp.com",
  projectId: "appweb-a26dd",
  storageBucket: "appweb-a26dd.appspot.com",
  messagingSenderId: "629323468168",
  appId: "1:629323468168:web:b36faadc2343f8f1167e3d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase inicializado:", app.name); // Debería mostrar "Firebase"
const db = getFirestore(app); // Base de datos Firestore
const auth = getAuth(app); // Autenticación

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("🔹 Persistencia de sesión activada");
  })
  .catch((error) => {
    console.error("❌ Error al establecer persistencia:", error);
  });

export { auth, db };  

