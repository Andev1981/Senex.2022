import React from "react";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";

export default function JsonResult({ resultData }) {
  if (resultData == null) return null;

  return (
    <div>
      <h2 className="text-2xl">Respuesta:</h2>
      <JSONPretty data={resultData} />
    </div>
  );
}
