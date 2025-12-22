import { create } from "zustand";

const usePatientStore = create((set) => ({
  patients: [],
  // Acción para llenar la lista inicial (desde Inertia props)
  setPatients: (patients) => set({ patients }),
  // Acción para agregar uno nuevo al principio
  addPatient: (patient) =>
    set((state) => ({
      patients: [patient, ...state.patients],
    })),
  updatePatient: (updatedPatient) =>
    set((state) => ({
      patients: state.patients.map(
        (p) => (p.id === updatedPatient.id ? { ...updatedPatient } : p) // El { ... } crea una nueva referencia
      ),
    })),
}));

export default usePatientStore;
