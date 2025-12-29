import React, { useState, useRef, useEffect } from "react";

/**
 * SearchSelect - Componente genérico de búsqueda y selección
 *
 * @param {Array} items - Array de objetos a buscar
 * @param {string|number} value - ID del item seleccionado
 * @param {Function} onChange - Callback cuando se selecciona un item
 * @param {Object} config - Configuración del componente
 * @param {string} label - Etiqueta del campo
 * @param {string} placeholder - Placeholder del input
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Si el campo es requerido
 * @param {boolean} disabled - Si el campo está deshabilitado
 */
export default function SearchSelect({
  items = [],
  value,
  onChange,
  config = {},
  label,
  placeholder = "Buscar...",
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  // Configuración por defecto
  const defaultConfig = {
    // Campo usado como identificador único
    valueKey: "id",
    // Campo principal a mostrar
    displayKey: "name",
    // Campos secundarios a mostrar (como subtitle)
    secondaryKeys: [],
    // Campos en los que buscar
    searchKeys: ["name"],
    // Renderizado personalizado del item (opcional)
    renderItem: null,
    // Renderizado personalizado del item seleccionado (opcional)
    renderSelected: null,
    // Mensaje cuando no hay resultados
    emptyMessage: "No se encontraron resultados",
    // Altura máxima del dropdown
    maxHeight: "max-h-60",
  };

  const finalConfig = { ...defaultConfig, ...config };

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtramos items basado en el término de búsqueda
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;

    return finalConfig.searchKeys.some((key) => {
      const value = getNestedValue(item, key);
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Obtenemos el item seleccionado
  const selectedItem = items.find(
    (item) => getNestedValue(item, finalConfig.valueKey) === value
  );

  // Helper para obtener valores anidados (ej: "user.name")
  function getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Cerramos el dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Reset highlightedIndex cuando cambian los filtros
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Scroll automático al item resaltado
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (
      !isOpen &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          handleSelectItem(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleSelectItem = (item) => {
    const itemValue = getNestedValue(item, finalConfig.valueKey);
    onChange(itemValue, item);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(0);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null, null);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  // Renderizado por defecto del item
  const defaultRenderItem = (item, isHighlighted, isSelected) => (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {getNestedValue(item, finalConfig.displayKey)}
        </p>
        {finalConfig.secondaryKeys.length > 0 && (
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {finalConfig.secondaryKeys.map((key, idx) => {
              const secValue = getNestedValue(item, key);
              return secValue ? (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
                >
                  {secValue}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {isSelected && (
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  // Renderizado por defecto del item seleccionado
  const defaultRenderSelected = (item) => (
    <span className="truncate">
      {getNestedValue(item, finalConfig.displayKey)}
    </span>
  );

  const renderItem = finalConfig.renderItem || defaultRenderItem;
  const renderSelected = finalConfig.renderSelected || defaultRenderSelected;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedItem ? "" : ""}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedItem ? "" : placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          required={required}
        />

        {/* Display del item seleccionado cuando no está abierto */}
        {selectedItem && !isOpen && (
          <div className="absolute inset-y-0 left-3 right-20 flex items-center pointer-events-none">
            <div className="truncate text-gray-900 dark:text-white">
              {renderSelected(selectedItem)}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {selectedItem && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              tabIndex={-1}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            tabIndex={-1}
            disabled={disabled}
          >
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && !disabled && (
        <div
          className={`absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-auto dark:bg-gray-800 dark:border-gray-600 ${finalConfig.maxHeight}`}
        >
          {filteredItems.length > 0 ? (
            <ul className="py-1">
              {filteredItems.map((item, index) => {
                const itemValue = getNestedValue(item, finalConfig.valueKey);
                const isSelected = itemValue === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={itemValue}
                    data-index={index}
                    onClick={() => handleSelectItem(item)}
                    className={`px-3 py-2 cursor-pointer transition-colors ${
                      isHighlighted
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    } ${isSelected ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {renderItem(item, isHighlighted, isSelected)}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p>{finalConfig.emptyMessage}</p>
              {searchTerm && (
                <p className="text-xs mt-1">
                  Intenta con otro término de búsqueda
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// ============================================
// EJEMPLOS DE USO
// ============================================

function DemoSearchSelect() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Datos de ejemplo
  const doctors = [
    {
      id: 1,
      name: "Dr. Juan Pérez",
      speciality: "Cardiología",
      email: "jperez@hospital.cl",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Dra. María González",
      speciality: "Pediatría",
      email: "mgonzalez@hospital.cl",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Dr. Carlos Rodríguez",
      speciality: "Traumatología",
      email: "crodriguez@hospital.cl",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Dra. Ana Martínez",
      speciality: "Dermatología",
      email: "amartinez@hospital.cl",
      rating: 4.6,
    },
    {
      id: 5,
      name: "Dr. Luis Fernández",
      speciality: "Neurología",
      email: "lfernandez@hospital.cl",
      rating: 4.9,
    },
  ];

  const cities = [
    { id: 1, name: "Santiago", country: "Chile", population: "7M" },
    { id: 2, name: "Valparaíso", country: "Chile", population: "950K" },
    { id: 3, name: "Concepción", country: "Chile", population: "730K" },
    { id: 4, name: "La Serena", country: "Chile", population: "520K" },
  ];

  const products = [
    {
      id: 1,
      title: "iPhone 14 Pro",
      category: "Electrónica",
      price: 899000,
      condition: "Nuevo",
      image: "📱",
    },
    {
      id: 2,
      title: "Bicicleta MTB Giant",
      category: "Deportes",
      price: 450000,
      condition: "Usado",
      image: "🚲",
    },
    {
      id: 3,
      title: "Sofá 3 cuerpos",
      category: "Muebles",
      price: 250000,
      condition: "Usado",
      image: "🛋️",
    },
  ];

  const users = [
    {
      id: 1,
      profile: { name: "Juan Pérez", email: "juan@example.com" },
      stats: { posts: 45, followers: 230 },
    },
    {
      id: 2,
      profile: { name: "María García", email: "maria@example.com" },
      stats: { posts: 89, followers: 450 },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SearchSelect - Componente Genérico
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Componente reutilizable para búsqueda y selección con múltiples
            configuraciones
          </p>

          <div className="space-y-8">
            {/* Ejemplo 1: Selección de Doctor (configuración completa) */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Selección de Doctor (con speciality, email y rating)
              </h3>
              <SearchSelect
                items={doctors}
                value={selectedDoctor}
                onChange={(value, item) => {
                  setSelectedDoctor(value);
                }}
                config={{
                  valueKey: "id",
                  displayKey: "name",
                  secondaryKeys: ["speciality", "email"],
                  searchKeys: ["name", "speciality", "email"],
                  renderSelected: (item) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500">
                        ({item.speciality})
                      </span>
                      <span className="text-xs text-yellow-600">
                        ⭐ {item.rating}
                      </span>
                    </div>
                  ),
                }}
                label="Doctor"
                placeholder="Buscar por nombre, especialidad o email..."
                required
              />
              {selectedDoctor && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-900 dark:text-blue-300">
                  Doctor seleccionado: ID {selectedDoctor}
                </div>
              )}
            </div>

            {/* Ejemplo 2: Selección simple de ciudad */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Selección de Ciudad (configuración simple)
              </h3>
              <SearchSelect
                items={cities}
                value={selectedCity}
                onChange={setSelectedCity}
                config={{
                  displayKey: "name",
                  secondaryKeys: ["country", "population"],
                  searchKeys: ["name", "country"],
                }}
                label="Ciudad"
                placeholder="Buscar ciudad..."
              />
            </div>

            {/* Ejemplo 3: Productos con renderizado personalizado */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                3. Productos (renderizado personalizado)
              </h3>
              <SearchSelect
                items={products}
                value={selectedProduct}
                onChange={setSelectedProduct}
                config={{
                  displayKey: "title",
                  searchKeys: ["title", "category"],
                  renderItem: (item, isHighlighted, isSelected) => (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            ${item.price.toLocaleString("es-CL")}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
                            {item.condition}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ),
                  renderSelected: (item) => (
                    <div className="flex items-center gap-2">
                      <span>{item.image}</span>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-green-600">
                        ${item.price.toLocaleString("es-CL")}
                      </span>
                    </div>
                  ),
                }}
                label="Producto"
                placeholder="Buscar producto..."
              />
            </div>

            {/* Ejemplo 4: Objetos anidados */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                4. Usuarios (con propiedades anidadas)
              </h3>
              <SearchSelect
                items={users}
                value={selectedUser}
                onChange={setSelectedUser}
                config={{
                  displayKey: "profile.name",
                  secondaryKeys: ["profile.email"],
                  searchKeys: ["profile.name", "profile.email"],
                  renderItem: (item) => (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.profile.name}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>📧 {item.profile.email}</span>
                        <span>📝 {item.stats.posts} posts</span>
                        <span>👥 {item.stats.followers} seguidores</span>
                      </div>
                    </div>
                  ),
                }}
                label="Usuario"
                placeholder="Buscar usuario..."
              />
            </div>

            {/* Ejemplo 5: Estado deshabilitado */}
            {/*             <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                5. Estado Deshabilitado
              </h3>
              <SearchSelect
                items={doctors}
                value={1}
                onChange={() => {}}
                config={{
                  displayKey: 'name',
                  secondaryKeys: ['speciality']
                }}
                label="Doctor (deshabilitado)"
                placeholder="Este campo está deshabilitado"
                disabled
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

/* export default DemoSearchSelect; */
