import { useEffect, useState } from "react";
import POS from "transbank-pos-sdk-web";
import swal from "sweetalert";

// Importa tus componentes React equivalentes
import PosConnect from "@/Components/payment/PosConnect";
import DoSale from "@/Components/payment/DoSale";
import GetLastSale from "@/Components/payment/GetLastSale";
import LoadKeys from "@/Components/payment/LoadKeys";
import SetNormalMode from "@/Components/payment/SetNormalMode";
import CloseDay from "@/Components/payment/CloseDay";
import GetDaySales from "@/Components/payment/GetDaySales";
import Refund from "@/Components/payment/Refund";
import GetTotals from "@/Components/payment/GetTotals";
import Poll from "@/Components/payment/Poll";
import OperationResult from "@/Components/payment/OperationResult";

export default function Index() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activePort, setActivePort] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const initPOS = async () => {
      try {
        const res = await fetch("/transbank-pos-config.json");
        const config = await res.json();

        await POS.configure(config);

        POS.on("socket_connected", () => {
          setSocketConnected(true);
        });

        POS.on("socket_disconnected", () => {
          setSocketConnected(false);
        });

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
      } catch (e) {
        console.error("No se pudo conectar al agente:", e);
        swal(
          "No se pudo conectar con el agente Transbank POS",
          "Verifique que el agente esté iniciado en este computador",
          "error"
        );
      }
    };

    initPOS();
  }, []);

  const closeConnection = async () => {
    await POS.closePort();
    setConnected(false);
    setActivePort(null);
  };

  return (
    <div className="container mx-auto p-2 py-10">
      <div className="flex items-baseline">
        <h1 className="text-2xl font-thin">
          Punto de venta demo - SDK Web POS
        </h1>

        {activePort && (
          <h3 className="ml-auto font-thin">
            Conectado a POS en puerto{" "}
            <span className="text-gray-500 mr-2">{activePort}</span> |
          </h3>
        )}

        {connected && (
          <span
            className="font-normal hover:underline cursor-pointer text-red-500 ml-2 mr-2"
            onClick={closeConnection}
          >
            Cerrar conexión
          </span>
        )}

        <span className="font-normal ml-auto">
          Conexión con agente:{" "}
          <span className="font-bold">
            {socketConnected ? "Conectado" : "No conectado"}
          </span>
        </span>
      </div>

      <div className="shadow rounded bg-white p-2 mt-2">
        {!connected && (
          <div className="flex my-64 items-center flex-col justify-center">
            <PosConnect
              connected={connected}
              onConnected={(port) => {
                setActivePort(port);
                setConnected(true);
              }}
            />
          </div>
        )}

        {connected && (
          <div className="px-10 pb-20">
            <DoSale onSaleResponse={setResultData} />

            <div className="border-t">
              <OperationResult resultData={resultData} />
            </div>

            <div className="flex flex-wrap border-t">
              <div className="box">
                <Poll onPollResponse={setResultData} />
              </div>

              <div className="box">
                <GetLastSale onLastSaleResponse={setResultData} />
              </div>

              <div className="box">
                <LoadKeys onLoadKeyResponse={setResultData} />
              </div>

              <div className="box">
                <SetNormalMode onNormalModeResponse={setResultData} />
              </div>

              <div className="box">
                <CloseDay onCloseDayResponse={setResultData} />
              </div>

              <div className="box">
                <GetDaySales onGetSales={setResultData} />
              </div>

              <div className="box">
                <Refund onRefundResponse={setResultData} />
              </div>

              <div className="box">
                <GetTotals onGetTotalsResponse={setResultData} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* estilos inline porque venían en el <style> de Vue */}
      <style>{`
                .box {
                    width: 100%;
                    margin-top: 1.25rem;
                }
                .box > div {
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    padding: 1.25rem;
                    border-radius: 0.5rem;
                }
                @media (min-width: 768px) {
                    .box {
                        width: 33.333%;
                        padding: 1.25rem;
                    }
                }
            `}</style>
    </div>
  );
}
