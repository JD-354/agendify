import React,{useState} from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface LoginProps {
    toggleToRegister: () => void;
  }



const Login:React.FC<LoginProps> =({toggleToRegister})=>{

    const navigate = useNavigate();
    const [dataForm,setDataForm]= useState({
        email:"",
        password:""
    });

    const [mensaje,setMensaje]= useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataForm({
          ...dataForm,
          [e.target.name]: e.target.value,
        });
      };


      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          const response = await axios.post(
            "https://gestioneventos-xv8m.onrender.com/api/user/auth",
            dataForm
          );
          const { token, msg } = response.data;
          setMensaje(msg);
          if(token){
           
            localStorage.setItem("token", token);
            navigate('/events')

          }
         
          
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error(
              error.response?.data?.msg || "error en el  inisio de sesion"
            );
            setMensaje(error.response?.data?.msg);
          } else {
            console.error("error desconocido");
          }
        }
      };
    
    


    return(
       <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-11 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://firebasestorage.googleapis.com/v0/b/adpowereat.appspot.com/o/libros%2Flogo.png?alt=media&token=2ea22b6c-fb23-43bc-aa7a-234890b21aa5"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-1 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Login
          </h2>
        </div>

        <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-sm">
          <form method="POST" className="space-y-4" onSubmit={handleSubmit} >
            <div>
              <label
                htmlFor="email"
                className="block text-sm/5 font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={dataForm.email}
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  contraseña
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  value={dataForm.password}
                  onChange={handleChange}
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Iniciar Sesion
              </button>
              <p className="mt-10 text-center text-sm/6 text-gray-500">
                <b>{mensaje}</b>
              </p>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
          ¿No tienes cuenta?{" "}
        <a href="#" onClick={toggleToRegister}>
          <b>Regístrate</b>
        </a>
          </p>
        </div>
      </div>
    </>
    )

}

export default Login