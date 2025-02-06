import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface IEvent {
  _id: string;
  nameEvent: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion: string;
  user: string;
}

interface EventsProps {
  onEditEvent: (event: IEvent) => void;
}

const Events: React.FC<EventsProps> = ({ onEditEvent }) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const requestNotificationPermission = async () => {
    try {
      if (!("Notification" in window)) {
        setError("Este navegador no soporta notificaciones");
        return;
      }

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission === "granted");
      
      if (permission === "granted") {
        setNotification("Notificaciones habilitadas correctamente");
        setTimeout(() => setNotification(null), 10000);
      }
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      setError("Error al solicitar permisos de notificación");
    }
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      const options = {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        vibrate: [200, 100, 200],
        requireInteraction: true
      };

      try {
        const notification = new Notification(title, options);
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error al mostrar notificación:", error);
      }
    }
  };

  const formatDateTime = (dateStr: string, timeStr: string): Date => {
    try {
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
      const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return new Date();
    }
  };

  const getEvents = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token disponible");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get<IEvent[]>(
        "https://gestioneventos-xv8m.onrender.com/api/event",
        config
      );

      if (response.data) {
        const validEvents = response.data.filter(event => {
          try {
            const eventDate = formatDateTime(event.fecha, event.hora);
            return !isNaN(eventDate.getTime());
          } catch {
            return false;
          }
        });

        const sortedEvents = validEvents.sort((a, b) => {
          const dateA = formatDateTime(a.fecha, a.hora);
          const dateB = formatDateTime(b.fecha, b.hora);
          return dateA.getTime() - dateB.getTime();
        });

        setEvents(sortedEvents);
        
        // Programar notificaciones para cada evento
        sortedEvents.forEach(event => {
          const eventTime = formatDateTime(event.fecha, event.hora);
          const now = new Date();
          
          if (eventTime > now) {
            const timeUntilEvent = eventTime.getTime() - now.getTime();
            
            // Notificación 15 minutos antes
            const timeFor15MinNotification = timeUntilEvent - (15 * 60 * 1000);
            if (timeFor15MinNotification > 0) {
              setTimeout(() => {
                showNotification(
                  "Recordatorio de Evento",
                  `El evento "${event.nameEvent}" comenzará en 15 minutos en ${event.ubicacion}`
                );
              }, timeFor15MinNotification);
            }

            // Notificación al inicio del evento
            setTimeout(() => {
              showNotification(
                "¡Evento Iniciando!",
                `El evento "${event.nameEvent}" está comenzando ahora en ${event.ubicacion}`
              );
            }, timeUntilEvent);
          }
        });
      }
    } catch (error: any) {
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.delete(
        `https://gestioneventos-xv8m.onrender.com/api/event/${id}`,
        config
      );

      if (response.data) {
        setNotification("Evento eliminado exitosamente");
        setTimeout(() => setNotification(null), 3000);
        setUpdateTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al eliminar el evento";
      setError(errorMessage);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    getEvents();
    
    // Actualizar eventos cada minuto
    const interval = setInterval(getEvents, 60000);
    return () => clearInterval(interval);
  }, [getEvents, updateTrigger]);

  const formatDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      const date = new Date(year, month - 1, day);
      
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const date = new Date();
      date.setHours(hours, minutes);
      
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!notificationPermission && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Para recibir notificaciones de eventos, necesitas habilitar los permisos.
                </p>
                <button 
                  onClick={requestNotificationPermission}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Habilitar Notificaciones
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Eventos</h2>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{notification}</p>
              </div>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay eventos programados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-indigo-600 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {event.nameEvent}
                  </h3>
                </div>
                
                <div className="p-4 space-y-3">
                  <p className="text-gray-600">
                    <span className="font-medium">Ubicación:</span> {event.ubicacion}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Fecha:</span> {formatDate(event.fecha)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Hora:</span> {formatTime(event.hora)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Descripción:</span> {event.descripcion}
                  </p>
                </div>

                <div className="px-4 py-3 bg-gray-50 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                    onClick={() => onEditEvent(event)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 transition-colors duration-200"
                    onClick={() => deleteEvent(event._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;