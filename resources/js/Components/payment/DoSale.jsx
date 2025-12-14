import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";
import swal from "sweetalert";

export default function DoSale({ onSaleResponse }) {
  const [total, setTotal] = useState(0);

  const products = [
    {
      name: "Hamburguesa + papas + bebida",
      price: 5500,
      image: "/img/combo1.png",
    },
    { name: "Hamburguesa sola", price: 3500, image: "/img/sandwich1.png" },
    { name: "Chocolate", price: 50, image: "/img/chocolate1.png" },
    { name: "Café", price: 50, image: "/img/coffee1.png" },
  ];

  const addProduct = (p) => setTotal(total + p.price);
  const clearTotal = () => setTotal(0);

  const doSale = () => {
    onSaleResponse(null);
    swal("Solicite al cliente que opere el POS", { buttons: false });

    POS.doSale(total, "ticket1", (data) => {
      swal(data.responseMessage, { buttons: false });
    }).then((response) => {
      if (response.responseCode === 0) {
        swal("Transacción aprobada", "", "success");
        clearTotal();
      } else {
        swal("Error", "Transacción rechazada", "error");
      }
      onSaleResponse(response);
    });
  };

  const doMulticodeSale = () => {
    onSaleResponse(null);
    swal("Solicite al cliente que opere el POS", { buttons: false });

    POS.doMulticodeSale(total, "ticket12", "597029414301", (data) => {}).then(
      (response) => {
        if (response.responseCode === 0) {
          swal("Transacción aprobada", "", "success");
          clearTotal();
        } else {
          swal("Fallo", "No fue aprobada", "error");
        }
        onSaleResponse(response);
      }
    );
  };

  return (
    <div>
      <h2 className="text-2xl">Realizar venta</h2>

      <div className="flex flex-wrap -ml-2">
        {products.map((p, i) => (
          <div
            key={i}
            onClick={() => addProduct(p)}
            className="cursor-pointer w-64 rounded-lg shadow-lg border m-2 p-2 text-center"
          >
            <img className="w-full" src={p.image} alt={p.name} />
            {p.name}
          </div>
        ))}
      </div>

      <div className="flex mt-4 border-t-2 pt-4 items-center">
        <span>
          Total venta: <span className="text-2xl">${total}</span>
        </span>

        {total > 0 && (
          <a className="ml-2 text-red-600 cursor-pointer" onClick={clearTotal}>
            Borrar venta
          </a>
        )}

        {total > 0 && (
          <button
            className="ml-auto bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
            onClick={doSale}
          >
            Realizar venta
          </button>
        )}

        {total > 0 && (
          <button
            className="ml-2 bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
            onClick={doMulticodeSale}
          >
            Venta multicódigo
          </button>
        )}
      </div>
    </div>
  );
}
