import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const CodigoQr = ({ valor }) => {
    return (
        <QRCodeCanvas
            value={valor} // El valor que se codificará en el QR
            size={200} // Tamaño del QR
            bgColor={"#ffffff"} // Color de fondo
            fgColor={"#000000FF"} // Color del código
            level={"H"} // Nivel de corrección de errores (L, M, Q, H)
        />
    );
};

export default CodigoQr;
