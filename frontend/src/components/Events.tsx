import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRegComment } from "react-icons/fa";

interface IEvent {
  _id: string;
  nameEvent: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion: string;
  usuario: string;
}

interface EventsProps {
  onEditEvent: (event: IEvent) => void;
  refreshTrigger?: number;
}

const CACHE_KEY = 'cached_events';
const API_URL = "https://gestioneventos-xv8m.onrender.com/api/event";

const Eventos: React.FC<EventsProps> = ({ onEditEvent, refreshTrigger = 0 }) => {
  const [eventos, setEvents] = useState<IEvent[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [cargando, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const sortEvents = (eventsToSort: IEvent[]) => {
    return eventsToSort.sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora}`);
      const dateB = new Date(`${b.fecha}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getEvents = useCallback(async (forceFetch: boolean = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token disponible");
      return;
    }
    if (!forceFetch && Date.now() - lastUpdateRef.current < 1000) {
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const config = {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal
      };
      const respuesta = await axios.get<IEvent[]>(API_URL, config);
      if (respuesta.data) {
        const sortedEvents = sortEvents(respuesta.data);
        setEvents(sortedEvents);
        localStorage.setItem(CACHE_KEY, JSON.stringify(sortedEvents));
        lastUpdateRef.current = Date.now();
      }
    } catch (error: any) {
      if (error.name === 'CanceledError') return;
      const errorMessage = error.response?.data?.message || "Error al obtener eventos";
      setError(errorMessage);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token disponible");
      return;
    }
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      };
      await axios.delete(`${API_URL}/${id}`, config);
      const updatedEvents = eventos.filter(event => event._id !== id);
      setEvents(updatedEvents);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedEvents));
      setError("Cita eliminada exitosamente");
      setTimeout(() => setError(null), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al eliminar la cita";
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditSubmit = async (updatedEvent: IEvent) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token disponible");
      return;
    }
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      };
      const response = await axios.put(`${API_URL}/${updatedEvent._id}`, updatedEvent, config);
      const updatedEvents = eventos.map(event => event._id === updatedEvent._id ? response.data : event);
      setEvents(updatedEvents);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedEvents));
      setError("Cita actualizada exitosamente");
      setTimeout(() => setError(null), 3000);
      setEditingEvent(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al actualizar la cita";
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [e.target.name]: e.target.value });
    }
  };

  useEffect(() => {
    getEvents(true);
    const interval = setInterval(() => {
      getEvents(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [eventos, getEvents]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      getEvents(true);
    }
  }, [refreshTrigger, getEvents]);

  const formatDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    } catch { return "Fecha no disponible"; }
  };

  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const date = new Date();
      date.setHours(hours, minutes);
      return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
    } catch { return timeString; }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-md shadow-md mb-4 transition-opacity duration-300 opacity-100">
            <p>{error}</p>
          </div>
        )}
        <div className="flex items-center justify-center mb-6">
          <FaCalendarAlt className="text-3xl text-blue-600 mr-2" />
          <h2 className="text-3xl font-bold text-center text-teal-500">Citas Programados</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <div key={evento._id} className="bg-white rounded-xl shadow-lg p-6 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30">
              <h3 className="font-semibold text-xl mb-2 text-blue-600">{evento.nameEvent}</h3>
              <div className="flex items-center mb-2">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <p className="text-sm text-gray-500">{formatDate(evento.fecha)}</p>
              </div>
              <div className="flex items-center mb-2">
                <FaClock className="text-gray-500 mr-2" />
                <p className="text-sm text-gray-500">{formatTime(evento.hora)}</p>
              </div>
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="text-gray-500 mr-2" />
                <p className="text-sm text-gray-500">{evento.ubicacion}</p>
              </div>
              <div className="flex items-center mb-2">
                <FaRegComment className="text-gray-500 mr-2" />
                <p className="text-sm text-gray-500">{evento.descripcion}</p>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => setEditingEvent(evento)} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Editar
                </button>
                <button onClick={() => deleteEvent(evento._id)} className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        {editingEvent && (
          <div className="fixed inset-0 flex justify-center items-center bg-blue-500/50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
              <h3 className="text-2xl font-semibold mb-4 text-cyan-700">Editar cita</h3>
              <form onSubmit={(e) => { e.preventDefault(); if (editingEvent) handleEditSubmit(editingEvent); }}>
                <input
                  type="text"
                  name="nameEvent"
                  value={editingEvent.nameEvent}
                  onChange={handleEditChange}
                  className="w-full mb-4 p-3 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Nombre del evento"
                />
                <input
                  type="date"
                  name="fecha"
                  value={editingEvent.fecha}
                  onChange={handleEditChange}
                  className="w-full mb-4 p-3 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="time"
                  name="hora"
                  value={editingEvent.hora}
                  onChange={handleEditChange}
                  className="w-full mb-4 p-3 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  name="ubicacion"
                  value={editingEvent.ubicacion}
                  onChange={handleEditChange}
                  className="w-full mb-4 p-3 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ubicación"
                />
                <textarea
                  name="descripcion"
                  value={editingEvent.descripcion}
                  onChange={handleEditChange}
                  className="w-full mb-4 p-3 border border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={4}
                  placeholder="Descripción del evento"
                />
                <div className="flex justify-between">
                  <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors duration-200">
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Eventos;
