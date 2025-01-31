import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface IEvent {
  _id: string;
  nameEvent: string;
  fecha: Date;
  hora: string;
  ubicacion: string;
  descripcion: string;
  user: string;
}
interface EventsProps {
    onEditEvent: (event: IEvent) => void;
    refreshEvents: () => void;
}
const Events: React.FC<EventsProps> = ({ onEditEvent,  refreshEvents }) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [token, setToken] = useState("");

  const getEvents = useCallback(async () => {
    if (!token) {
      console.error("Token no disponible");
      return;
    }

    try {
      const response = await axios.get("https://gestioneventos-xv8m.onrender.com/api/event", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  }, [token]);

  const deleteEvent = async (id: string) => {
    try {
      const response = await axios.delete(
        `https://gestioneventos-xv8m.onrender.com/api/event/${id}`
      );
      alert(response.data.msg);
      getEvents();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);
  useEffect(() => {
    if (token) {
      getEvents();
    }
  }, [token, getEvents,refreshEvents]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Eventos
        </h2>

        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {events.map((event) => (
            <div key={event._id} className="group relative">
              <div className="mt-6 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-900">
                    <b>Evento:</b>
                    {event.nameEvent}
                  </h3>
                  <p className="text-sm font-medium text-gray-800">
                    <b>Ubicacion:</b> {event.ubicacion}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    <b>Hora:</b> {event.hora}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    <b>Fecha:</b>{" "}
                    {new Date(event.fecha).toISOString().split("T")[0]}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    <b>Descripcion:</b>{" "}
                    {event.descripcion}
                  </p>
                </div>
                
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-1 lg:grid-cols-4 xl:gap-x-2"> 
              <button
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
                onClick={() => onEditEvent(event)}
              >
                Editar
              </button>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => deleteEvent(event._id)}
              >
                Eliminar
              </button>
              


              </div>
           
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Events;
