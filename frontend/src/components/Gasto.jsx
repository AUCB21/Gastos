import React from "react";

const Gasto = ({ gasto, onDelete, onEdit }) => {
    const formattedDate = new Date(gasto.fecha_gasto).toLocaleDateString("es-AR");

  return (
    <div
      key={gasto.id}
      className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
    >
      <div className="flex-1">
        <p className="text-lg font-semibold text-gray-700">
          <span className="text-purple-600">${gasto.monto} {gasto.moneda} - </span>{gasto.vendedor} -
          <span className="text-gray-500"> {gasto.pagos_realizados} / {gasto.pagos_totales}</span>
        </p>
        {/* <p className="text-gray-500">Moneda: {gasto.moneda}</p> */}
        <p className="text-gray-500">Categoría: {gasto.categoria.name || gasto.categoria}</p>
        {/* <p className="text-gray-500">Vendedor: {gasto.vendedor}</p> */}
        <p className="text-gray-500">Fecha: {formattedDate}</p>
      </div>
      <button
        onClick={() => onEdit(gasto.id)}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mr-2"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(gasto.id)}
        className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
      >
        Eliminar
      </button>
    </div>
  );
};

export default Gasto;