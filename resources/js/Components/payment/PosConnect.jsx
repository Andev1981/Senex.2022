import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";
import swal from "sweetalert";

export default function PosConnect({ connected, onConnected }) {
  const [ports, setPorts] = useState([]);
  const [activePort, setActivePort] = useState(null);

  const autoconnect = () => {
    POS.autoconnect().then((port) => {
      if (port === false) {
        swal("No se encontró ningún POS", "", "error");
        return;
      }

      onConnected(port.path);
      swal(
        "Conectado",
        `Dispositivo detectado y conectado: ${port.path}`,
        "success"
      );
    });
  };

  const listPorts = () => {
    POS.getPorts()
      .then((ports) => {
        console.log("ports", ports);
        setPorts(ports);
      })
      .catch(() => {
        swal(
          "No se pudo obtener puertos.",
          "¿Está corriendo el agente Transbank POS?",
          "error"
        );
      });
  };

  const handleSetActivePort = async (port) => {
    setActivePort(port);

    if (connected) {
      POS.closePort();
    }

    POS.openPort(port)
      .then((result) => {
        if (result === true) {
          swal("Conectado satisfactoriamente", "", "success");
          onConnected(port);
        } else {
          swal("No conectado", "", "error");
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="w-2/5 mx-auto flex flex-col">
        <span className="text-2xl font-thin mb-4 text-red-500">
          POS: {connected ? "Conectado" : "Desconectado"}
        </span>

        <div className="flex">
          <button
            onClick={listPorts}
            className="flex-1 m-2 bg-green-500 p-4 rounded shadow outline-none hover:opacity-75 text-white"
          >
            Listar puertos
          </button>

          <button
            onClick={autoconnect}
            className="flex-1 m-2 bg-blue-500 p-4 rounded shadow outline-none hover:opacity-75 text-white"
          >
            Descubrir y conectar
          </button>
        </div>
      </div>

      {!connected && ports.length > 0 && (
        <div className="mt-10">
          <hr />
          <h3 className="mx-2 font-bold text-lg">Puertos disponibles:</h3>
          <p className="mx-2 mb-2">
            Haz click en el puerto donde está conectado el POS
          </p>

          {ports.map((port) => (
            <button
              key={port.path}
              onClick={() => handleSetActivePort(port.path)}
              className="bg-blue-500 m-2 p-4 rounded shadow outline-none hover:opacity-75 text-white"
            >
              {port.path}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
