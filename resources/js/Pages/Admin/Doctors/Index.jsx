export default function DoctorsIndex({ doctors }) {
  return (
    <div>
      <h1>Gestión de Kinesiólogos</h1>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acceso Móvil</th>
            <th>Último Login</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td>
                {doctor.name} {doctor.last_name}
              </td>
              <td>{doctor.email}</td>
              <td>
                <span
                  className={`badge ${
                    doctor.status === "active" ? "success" : "danger"
                  }`}
                >
                  {doctor.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleMobileAccess(doctor.id)}
                  className={
                    doctor.mobile_access_enabled ? "success" : "danger"
                  }
                >
                  {doctor.mobile_access_enabled
                    ? "✓ Habilitado"
                    : "✗ Deshabilitado"}
                </button>
              </td>
              <td>
                {doctor.last_mobile_login
                  ? new Date(doctor.last_mobile_login).toLocaleString("es-CL")
                  : "Nunca"}
              </td>
              <td>
                <button onClick={() => resetPassword(doctor.id)}>
                  🔑 Resetear Contraseña
                </button>
                <button onClick={() => editDoctor(doctor.id)}>✏️ Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
