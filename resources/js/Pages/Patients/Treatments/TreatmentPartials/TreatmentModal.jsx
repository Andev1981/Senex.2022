import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { TrendingUp, Activity, Award, Calendar } from "lucide-react";
import TableTreatments from "./TableTreatments";

export default function TreatmentModal({
  treatments,
  handleTreatmentModal,
  setOpenTreatmentModal,
}) {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="space-y-4">
          {treatments.length > 0 && (
            <TableTreatments
              treatments={treatments}
              handleTreatmentModal={handleTreatmentModal}
              setOpenTreatmentModal={setOpenTreatmentModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
