import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Events from "../components/Events";

interface IEvent {
  _id: string;
  nameEvent: string;
  fecha: Date;
  hora: string;
  ubicacion: string;
  descripcion: string;
  user: string;
}

const ciudades = ["Bugalagrande", "Tulua", "Cali"];

const Principal: React.FC = () => {
  const [token, setToken] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [dataForm, setDataForm] = useState({
    nameEvent: "",
    fecha: "",
    hora: "",
    ubicacion: "",
    descripcion: "",
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [events, setEvents] = useState<IEvent[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const backgrounds = [
    'url("/logo.jpeg")',
    'url("https://images.unsplash.com/photo-1461862625640-1ccbb4b00c6f")',
    'url("https://images.unsplash.com/photo-1556740749-887f6717d7e4")',
    'url("https://images.unsplash.com/photo-1518389457349-5b6b5a416d9e")',
  ];

  const changeBackground = () => {
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    document.body.style.backgroundImage = backgrounds[randomIndex];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setToken(token);
    }
  }, [navigate]);

  useEffect(() => {
    const intervalId = setInterval(changeBackground, 60000);
    changeBackground();
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowEventForm(false);
        setShowFilter(false);
      }
    };
    if (showEventForm || showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEventForm, showFilter]);

  useEffect(() => {
    if (ciudad || direccion) {
      const ubicacionString = [ciudad, direccion].filter(Boolean).join(", ");
      setDataForm(prev => ({ ...prev, ubicacion: ubicacionString }));
    }
  }, [ciudad, direccion]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("https://gestioneventos-xv8m.onrender.com/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "ciudad") {
      setCiudad(value);
    } else if (name === "direccion") {
      setDireccion(value);
    } else {
      setDataForm(prev => ({ ...prev, [name]: value }));
    }
    if (name === "fecha") {
      setDataForm(prev => ({ ...prev, fecha: value }));
    }
  };

  const resetForm = () => {
    setDataForm({
      nameEvent: "",
      fecha: "",
      hora: "",
      ubicacion: "",
      descripcion: "",
    });
    setCiudad("");
    setDireccion("");
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent | Event) => {
    e.preventDefault();
    if (!dataForm.nameEvent || !dataForm.fecha || !dataForm.hora || !dataForm.ubicacion || !dataForm.descripcion) {
      return;  // Si no hay datos completos, no hacemos nada.
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const dataToSend = { ...dataForm, fecha: new Date(dataForm.fecha).toISOString() };
      if (editingEvent) {
        await axios.put(`https://gestioneventos-xv8m.onrender.com/api/event/${editingEvent._id}`, dataToSend, config);
      } else {
        const response = await axios.post("https://gestioneventos-xv8m.onrender.com/api/event", dataToSend, config);
        // Actualizar la lista de eventos añadiendo el nuevo evento
        setEvents(prevEvents => [...prevEvents, response.data]);
      }
      resetForm(); // Restablecer los campos del formulario después de crear la cita
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const handleCreateEvent = () => {
    // Resetear el formulario a valores vacíos
    setDataForm({
      nameEvent: "",
      fecha: "",
      hora: "",
      ubicacion: "",
      descripcion: "",
    });
    setCiudad("");
    setDireccion("");
    setShowEventForm(true); // Mostrar la tarjeta del formulario
  };

  // ... (rest of the component remains the same)

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-5 lg:px-8">
      <div className="flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar eventos..."
          className="rounded-md border-gray-300 p-2"
        />
        <button
          onClick={handleCreateEvent}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600"
        >
          Añadir evento
        </button>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
        >
          Filtrar
        </button>
      </div>
      {showFilter && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div ref={modalRef} className="bg-gray-50 p-8 rounded-xl shadow-lg w-[350px]">
            <h3 className="text-center text-xl font-semibold">Filtros</h3>
            <div>
              <label>Fecha</label>
              <input
                type="date"
                className="block w-full mt-2 mb-4"
                onChange={(e) => setDataForm(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
            <div>
              <label>Ciudad</label>
              <select
                value={ciudad}
                onChange={handleChange}
                name="ciudad"
                className="block w-full mt-2 mb-4"
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div ref={modalRef} className="bg-gray-50 p-8 rounded-xl shadow-lg w-[450px]">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <h2 className="text-center text-xl font-bold tracking-tight text-gray-900 mb-4">
                {editingEvent ? "Editar cita médica " : "Registrar cita médica"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="nameEvent" className="block text-sm font-medium text-gray-700">
                    Nombre del Hospital
                  </label>
                  <input
                    id="nameEvent"
                    name="nameEvent"
                    type="text"
                    value={dataForm.nameEvent}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                    Fecha
                  </label>
                  <input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={dataForm.fecha}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="hora" className="block text-sm font-medium text-gray-700">
                    Hora de la cita
                  </label>
                  <input
                    id="hora"
                    name="hora"
                    type="time"
                    value={dataForm.hora}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <select
                    id="ciudad"
                    name="ciudad"
                    value={ciudad}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={direccion}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={dataForm.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-500 focus:outline-none"
              >
                {editingEvent ? "Actualizar cita" : "Crear cita"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="flex justify-between px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Eventos programados</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            <Events events={events} setEditingEvent={setEditingEvent} />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Principal;