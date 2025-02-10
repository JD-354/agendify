import User from "../models/user";
import { Request,Response } from "express";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const jwtSecreto = process.env.JWT_SECRETO as string

//crear
export const createUser = async(req:Request,res:Response):Promise<void>=>{
    try {
        const {name,lastName,email,password} = req.body;
        const emailLowerCase = email.toLowerCase();
        const userExisting = await User.findOne({ email: emailLowerCase });
        if(userExisting){
            res.status(400).json({msg:"el usuario ya existe"});
            return;
        }
        
        const passwordHidden = await bcryptjs.hash(password,10);
        const newUser = new User({ name, lastName, email: emailLowerCase, password: passwordHidden });

        await newUser.save();
        res.status(201).json({msg:"Usuario Registrado Exitosamente"});
        return;

    } catch (error) {
        res.status(500).json({msg:"Error en el Registro"});
        return;
    }
}

//autenticar
export const AuthUser = async(req:Request,res:Response):Promise<void>=>{
    try {
        const {email,password} = req.body;
        const emailLowerCase = email.toLowerCase();
        const user = await User.findOne({ email: emailLowerCase });
        if(!user){
            res.status(400).json({msg:"Correo o Contraseña Incorrecta"});
            return;
        }
    const passwordCorrect = await bcryptjs.compare(password,user.password);
    if(!passwordCorrect){
        res.status(400).json({msg:"Contraseña Incorrecta"});
        return;
    }
    
    const token = jwt.sign({id:user._id,email:user.email},jwtSecreto,{expiresIn:"1h"});
    res.status(200).json({token, msg:"Inicio de Sesion Exitoso"});
    return;



    } catch (error) {
        res.status(500).json({msg:"Error al Iniciar Sesion"});
        return;
    }
}