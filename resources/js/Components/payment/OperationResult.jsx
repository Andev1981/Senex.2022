export default function OperationResult({ resultData }) {
  if (!resultData) {
    return (
      <div className="p-4 text-center text-gray-400">Sin operaciones aún</div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Resultado de operación</h3>
      <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
        {JSON.stringify(resultData, null, 2)}
      </pre>
    </div>
  );
}
