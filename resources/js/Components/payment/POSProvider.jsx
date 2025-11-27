import { createContext, useContext, useEffect, useState } from "react";
import POS from "transbank-pos-sdk-web";

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activePort, setActivePort] = useState(null);

  useEffect(() => {
    const initPOS = async () => {
      try {
        POS.on("socket_connected", () => setSocketConnected(true));
        POS.on("socket_disconnected", () => setSocketConnected(false));

        POS.on("port_opened", (port) => {
          setActivePort(port);
          setConnected(true);
        });

        POS.on("port_closed", () => {
          setActivePort(null);
          setConnected(false);
        });

        await POS.connect();

        const status = await POS.getPortStatus();
        setConnected(status.connected);
        setActivePort(status.activePort);
      } catch (err) {
        console.error("No se pudo conectar al agente:", err);
      }
    };

    initPOS();
  }, []);

  return (
    <POSContext.Provider
      value={{
        POS,
        socketConnected,
        connected,
        activePort,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

// Hook para usar fácilmente el POS en cualquier componente
export function usePOS() {
  return useContext(POSContext);
}
