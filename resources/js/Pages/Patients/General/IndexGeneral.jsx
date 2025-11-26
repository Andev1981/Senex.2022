import PatientData from "./GeneralPartials/PatientData";
import MedicalInformation from "./GeneralPartials/MedicalInformation";
import Vital from "./GeneralPartials/Vital";
import EmergencyContact from "./GeneralPartials/EmergencyContact";
import NextSessions from "./GeneralPartials/NextSessions";
import PatientAddress from "./GeneralPartials/PatientAddress";

export default function IndexGeneral({
  patient,
  communes,
  regions,
  provinces,
  address,
  vital,
  contact,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PatientData
          patient={patient}
          communes={communes}
          regions={regions}
          provinces={provinces}
        />
        <PatientAddress
          patient={patient}
          communes={communes}
          regions={regions}
          provinces={provinces}
          address={address}
        />
        <EmergencyContact patient={patient} contact={contact} />
      </div>
      <div className="space-y-6">
        <Vital patient={patient} vital={vital} />
        {/* <MedicalInformation patient={patient} /> */}
        {/* <NextSessions patient={patient} /> */}
      </div>
    </div>
  );
}
