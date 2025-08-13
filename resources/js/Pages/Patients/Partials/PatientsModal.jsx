import React from "react";

function PatientsModal({ patient }) {
  return <div>{patient?.name + " " + patient?.last_name}</div>;
}

export default PatientsModal;
