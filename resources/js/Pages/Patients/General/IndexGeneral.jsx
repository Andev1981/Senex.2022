import React from "react";
import { Calendar, Timer } from "lucide-react";
import PatientData from "./GeneralPartials/PatientData";
import MedicalInformation from "./GeneralPartials/MedicalInformation";
import Condition from "./GeneralPartials/Condition";
import EmergencyContact from "./GeneralPartials/EmergencyContact";
import NextSessions from "./GeneralPartials/NextSessions";

export default function IndexGeneral({ patient }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PatientData patient={patient} />

        <Condition patient={patient} />

        <EmergencyContact patient={patient} />
      </div>

      <div className="space-y-6">
        <MedicalInformation patient={patient} />

        <NextSessions patient={patient} />
      </div>
    </div>
  );
}
