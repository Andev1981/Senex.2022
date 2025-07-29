import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import PrimaryButton from "@/Components/PrimaryButton";
import { MoreVertical, Search, Users } from "lucide-react";
import * as XLSX from "xlsx";

export default function TablePacientes({
  pacientes,
  handleOpenModalOptions,
  handleOpenModalContactPersons,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const columns = [
    {
      name: "Nombre",
      selector: (row) => row?.name,
      sortable: true,
    },
    {
      name: "Apellido",
      selector: (row) => row?.last_name,
      sortable: true,
    },
    {
      name: "Edad",
      selector: (row) => (row?.age ? row?.age : "N/A"),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row?.email,
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row?.phone,
      sortable: true,
    },
    {
      name: "Rut",
      selector: (row) => row?.rut,
      sortable: true,
    },
    {
      name: "Dirección",
      selector: (row) => row?.direccion,
      sortable: true,
    },
    {
      name: "Comuna",
      selector: (row) => row?.comuna_nombre || "N/A",
      sortable: true,
    },
    {
      name: "Última Atención",
      selector: (row) => row?.doctor_nombre || "N/A",
      sortable: true,
    },
    {
      name: "",
      selector: (row) => {
        return (
          <div className="flex">
            <PrimaryButton
              className="ms-2"
              onClick={() => handleOpenModalOptions(row)}
            >
              <MoreVertical className="w-4 h-4" />
            </PrimaryButton>
            <PrimaryButton
              className="ms-2"
              onClick={() => handleOpenModalContactPersons(row)}
            >
              <Users className="w-4 h-4" />
            </PrimaryButton>
          </div>
        );
      },
    },
  ];

  console.log(pacientes);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Nombre: item?.name,
        Apellido: item?.last_name,
        Edad: item?.birth
          ? new Date().getFullYear() - new Date(item.birth).getFullYear()
          : "N/A",
        Email: item?.email,
        Teléfono: item?.phone,
        Rut: item?.rut,
        Direccion: item?.address?.address + " " + item?.address?.number,
        Comuna: item?.address?.comuna?.name || "N/A",
        Ultima_Atencion: item?.last_attention?.doctor
          ? item?.last_attention?.doctor?.name +
            " " +
            item?.last_attention?.doctor?.last_name
          : "N/A",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");
    XLSX.writeFile(workbook, "pacientes.xlsx");
  };
  // Lógica de filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm || !pacientes) return pacientes || [];
    return pacientes.filter((item) =>
      Object.values(item).some((value) => {
        if (value == null) return false;
        return value
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [pacientes, searchTerm]);

  return (
    <>
      {/* Barra superior con búsqueda y toggle de filtros avanzados */}
      {pacientes.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <PrimaryButton
            onClick={exportToExcel}
            className="ml-2 bg-green-600 hover:bg-green-700"
          >
            Exportar Excel
          </PrimaryButton>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationRowsPerPageOptions={[5, 10, 15, 20, 30, 40, 50]}
        paginationPerPage={10}
        responsive
        highlightOnHover
        striped
        noDataComponent={
          <p className="my-4 text-center text-gray-500">
            No se han encontrado datos
          </p>
        }
      />
    </>
  );
}
