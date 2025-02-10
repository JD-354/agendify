import mongoose,{Schema,Document,Types} from "mongoose";

export interface IEvent extends Document {
    nameEvent:string;
    fecha:Date;
    hora:string;
    ubicacion:string;
    descripcion:string;
    user:Types.ObjectId;
}

const EventSchema:Schema= new Schema(
    {
        nameEvent:{
            type:String,
             required: true
            },
        fecha:{
            type:Date,
            required:true
        },
        hora:{
            type:String,
            required:true
        },
        ubicacion:{
            type:String,
            required:true
        },
        descripcion:{
            type:String,
            required:true
        },
        user:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {
        timestamps:true
    }
);

const Event = mongoose.model<IEvent>("event",EventSchema);
export default Event;


