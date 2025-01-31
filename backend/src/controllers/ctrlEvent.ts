import { Request, Response } from 'express';
import Event  from '../models/event';

// Crear
export const createEvent = async (req: Request, res: Response):Promise<void> => {
    try {
        const {nameEvent,fecha,hora,ubicacion,descripcion}= req.body
       
          
        const id = (req as any).user;
     
        const event = new Event({nameEvent,fecha,hora,ubicacion,descripcion,user:id});
        await event.save();
        res.status(201).json({msg:"Evento Creado"});
        return;
    } catch (error) {
        res.status(400).json({ msg: "Error al crear el evento"});
        return;
    }
};

// Obtener
export const getAllEvents = async (req: Request, res: Response):Promise<void> => {
    try {
        const id = (req as any).user;
 

        const events = await Event.find({user:id})
        res.status(200).json(events);
        return;
    } catch (error) {
        res.status(400).json({ msg: "Error al obtener los eventos" });
        return;
    }
};

// Actualizar 
export const updateEvent = async (req: Request, res: Response):Promise<void> => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
             res.status(404).json({ msg: "Evento no encontrado" });
             return;
        }
        res.status(200).json({msg:"evento actualizado"});
    } catch (error) {
        res.status(400).json({ msg: "Error al actualizar el evento" });
        return;
    }
};

// Eliminar 
export const deleteEvent = async (req: Request, res: Response):Promise<void> => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            res.status(404).json({ msg: "Evento no encontrado" });
            return;
        }
        res.status(200).json({ msg: "Evento eliminado" });
        return;
    } catch (error) {
        res.status(400).json({ msg: "Error al eliminar el evento" });
        return;
    }
};
