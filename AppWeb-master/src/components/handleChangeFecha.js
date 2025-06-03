import { Timestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Swal from "sweetalert2";

export const HandleChangeFecha = async (id, campo, valor) => {    
    try {
      const confirmed = await Swal.fire({
        title: "¿Guardar cambios?",
        text: "Esta acción actualizará la fecha.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
      });
      
      if (!confirmed.isConfirmed) return null;
      
      Swal.fire({
        title: "Actualizando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const usuarioRef = doc(db, "usuarios", id);
      const usuarioDoc = await getDoc(usuarioRef);
      if (!usuarioDoc.exists()) {
        throw new Error("Usuario no encontrado");
      }
      const data = usuarioDoc.data();
      const nuevoValor = valor !== null ? Timestamp.fromDate(new Date(ajustarFechaBuenosAires(valor))) : null;
      const updateData = {
        [campo]: nuevoValor
      };
      await updateDoc(usuarioRef, updateData);
      Swal.fire("Cambios guardados", "", "success");
      return {
        id,
        ...data,
        ...updateData,
        fechaDeInicio: nuevoValor||data.fechaDeInicio,
        fechaVencimiento: nuevoValor||data.fechaVencimientoDate,
      };
      
    } catch (error) {
      console.error("Error al cambiar fecha:", error);
      Swal.fire("Error", "No se pudo actualizar la fecha", "error");
      return null;
    }
  };
  
const ajustarFechaBuenosAires = (fechaStr) => {
    const fecha = new Date(fechaStr);
    fecha.setUTCHours(3, 0, 0, 0); // Ajustar a medianoche en Buenos Aires (UTC-3)
    return fecha;
};
