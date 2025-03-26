import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const addTestData = async () => {
  try {
    const docRef = await addDoc(collection(db, "usuarios"), {
      nombre: "Usuario de prueba",
      rol: "admin",
    });
    console.log("Documento agregado con ID:", docRef.id);
  } catch (e) {
    console.error("Error al agregar documento:", e);
  }
};

addTestData();
