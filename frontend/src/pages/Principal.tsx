import React, { useState, useEffect } from "react";
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

const barriosPorCiudad: Record<string, string[]> = {
  Bugalagrande: [
    "Centro",
    "La Maria",
    "Pablo XI",
    "Maria etapa 2",
    "El jardin",
    "San Luis",
    "Prados de San Bernabeht",
    "Obrero"],
  Tulua: [
  "Alameda", 
  "Centro", 
  "La Rivera", 
  "Santa Anita", 
  "El Carmen", 
  "San Rafael", 
  "El Poblado", 
  "Los Guaduales", 
  "San Fernando", 
  "El Jardín", 
  "Las Américas", 
  "San Vicente", 
  "El Recuerdo", ],

  Cali: [

  "Centro", 
  "San Fernando", 
  "El Peñón", 
  "Granada", 
  "San Antonio", 
  "El Vallado", 
  "Ciudad Jardín", 
  "Santa Mónica", 
  "El Ingenio", 
  "Los Cristales", 
  "San Bosco", 
  "El Guabal", 
  "Los Chorros", 
  "San Cayetano", 
  "El Lido", 
  "Los Lagos",],
};

const Principal: React.FC = () => {
  const [token, setToken] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const navigate = useNavigate();
  const [dataForm, setDataForm] = useState({
    nameEvent: "",
    fecha: "",
    hora: "",
    ubicacion: "",
    descripcion: "",
  });
  
  
  const refreshEvents = () => {
  };

  useEffect(() => {
    setUbicacion(
      `${ciudad}${ciudad && barrio ? ", " : ""}${barrio}${
        (ciudad || barrio) && direccion ? ", " : ""
      }${direccion}`
    );
  }, [ciudad, barrio, direccion]);

  useEffect(() => {
    setDataForm((prev) => ({
      ...prev,
      ubicacion,
    }));
  }, [ubicacion]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setToken(token);
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDataForm((prev) => ({ ...prev, [name]: value }));

    if (name === "ciudad") {
      setCiudad(value);
      setBarrio("");
    } else if (name === "barrio") {
      setBarrio(value);
    } else if (name === "direccion") {
      setDireccion(value);
    }
    setUbicacion(`${ciudad}, ${barrio}, ${direccion}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !dataForm.nameEvent ||
      !dataForm.fecha ||
      !dataForm.hora ||
      !dataForm.ubicacion ||
      !dataForm.descripcion
    ) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      if (editingEvent) {
        const response = await axios.put(
          `https://gestioneventos-xv8m.onrender.com/api/event/${editingEvent._id}`,
          dataForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert(response.data.msg);
        setEditingEvent(null);
      } else {
        const response = await axios.post("https://gestioneventos-xv8m.onrender.com/api/event", dataForm, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert(response.data.msg);
        refreshEvents();
      }
      setDataForm({
        nameEvent: "",
        fecha: "",
        hora: "",
        ubicacion: "",
        descripcion: "",
      });
      setCiudad("");
      setBarrio("");
      setDireccion("");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert("Ocurrió un error inesperado.");
    }
  };

  const handleEditEvent = (event: IEvent) => {
    setEditingEvent(event);

    
    const [ciudad, barrio, direccion] = event.ubicacion.split(", ");
    setCiudad(ciudad || "");
    setBarrio(barrio || "");
    setDireccion(direccion || "");

    const fechaFormateada = new Date(event.fecha).toISOString().split("T")[0];

    setDataForm({
      nameEvent: event.nameEvent,
      fecha: fechaFormateada,
      hora: event.hora,
      ubicacion: event.ubicacion,
      descripcion: event.descripcion,
    });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-5 lg:px-8">
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="mt-2 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                {editingEvent ? "Editar Evento" : "Registro"}
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="nameEvent" className="block text-sm font-medium text-gray-900">
                    Nombre del evento
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      value={dataForm.nameEvent}
                      onChange={handleChange}
                      id="nameEvent"
                      name="nameEvent"
                      type="text"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="ciudad" className="block text-sm font-medium text-gray-900">
                    Ciudad
                  </label>
                  <div className="mt-2">
                    <select
                      id="ciudad"
                      name="ciudad"
                      value={ciudad}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
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
                <div className="sm:col-span-3">
                  <label htmlFor="barrio" className="block text-sm font-medium text-gray-900">
                    Barrio
                  </label>
                  <div className="mt-2">
                    <select
                      id="barrio"
                      name="barrio"
                      value={barrio}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
                      disabled={!ciudad}
                    >
                      <option value="">Seleccione un barrio</option>
                      {ciudad &&
                        barriosPorCiudad[ciudad].map((barrio) => (
                          <option key={barrio} value={barrio}>
                            {barrio}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-900">
                    Dirección
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={direccion}
                      onChange={handleChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-900">
                    Ubicación completa
                  </label>
                  <div className="mt-1 p-1 bg-gray-100 rounded-md text-gray-900">
                    {ubicacion || "Seleccione una ciudad y barrio, luego ingrese la dirección"}
                  </div>
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-900">
                  Fecha del evento
                </label>
                <input
                  required
                  value={dataForm.fecha}
                  onChange={handleChange}
                  id="fecha"
                  name="fecha"
                  type="date"
                  className="block w-full rounded-md px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="hora" className="block text-sm font-medium text-gray-900">
                  Hora del evento
                </label>
                <input
                  required
                  value={dataForm.hora}
                  onChange={handleChange}
                  id="hora"
                  name="hora"
                  type="time"
                  className="block w-full rounded-md px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="descripcion" className="block text-sm/6 font-medium text-gray-900">
                  Descripcion
                </label>
                <div className="mt-1">
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={dataForm.descripcion}
                    onChange={handleChange}
                    rows={1}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600"
            >
              {editingEvent ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
      <Events onEditEvent={handleEditEvent } refreshEvents={refreshEvents} />
    </div>
  );
};

export default Principal;