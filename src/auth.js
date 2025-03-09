// auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Función para autenticar al usuario
export const authenticateUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Usuario autenticado:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error de autenticación:", error.code, error.message);
    throw error; // Esto permite manejar el error en el componente
  }
};


// Función para registrar un nuevo usuario (con rol fijo "user")
export const registerUser = async (email, password) => {
  try {
    console.log("Intentando registrar usuario:", email, password);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("✅ Usuario registrado en Firebase Auth:", user.uid);

    // Guardar en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      role: "user",
    });

    console.log("✅ Usuario guardado en Firestore");
    return user;
  } catch (error) {
    console.error("❌ Error de registro:", error.code, error.message);
    throw error;
  }
};


// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Usuario deslogueado con éxito");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
