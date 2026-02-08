import { Navigate, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.svg";

export default function Navbar() {
    const navigate = useNavigate();
    return(
        <div className="flex flex-row items-center gap-1 fixed bg-white p-4 z-99 w-full cursor-pointer" onClick={()=>{navigate("/")}}>
            <img src={Logo} alt="Logo" className="w-8 h-8" />
            <div className="text-2xl text-black font-quilon font-semibold">Pdf Lovers</div>
        </div>
    )
}