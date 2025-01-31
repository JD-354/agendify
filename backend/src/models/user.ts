import mongoose,{Schema,Document,} from "mongoose";

interface IUser extends Document{
    name:string;
    lastName:string;
    email:string;
    password:string;
}

const UserSchema:Schema = new Schema({
    name:{
        type:String,
         required:true
        },
    lastName:{
        type:String,
        required:true
        },
    email:{
            type:String,
            required:true,
            unique:true
        },
    password:{
        type:String,
        required:true
        }
})

const User = mongoose.model<IUser>("user",UserSchema);
export default User;


