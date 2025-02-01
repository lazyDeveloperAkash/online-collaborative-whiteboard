import { useRef, useContext } from "react"
import { FaSignOutAlt } from "react-icons/fa"
import { AuthContext } from "../contextApi/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ setProfile }) => {
    const { asyncSignOut } = useContext(AuthContext);

    const navigate = useNavigate();

    const onSignOut = async () => {
        const res = window.confirm("Do you want to signOut!");
        if (!res) return;
        const result = await asyncSignOut();
        if (result) navigate("/");
    }

    return (
        <div onClick={(e) => e.target.id === 'profile-container' && setProfile(false)} id='profile-container' className='absolute z-50 h-[100vh] w-[100vw] bg-black overflow-hidden'>
            <div
                className="bg-white rounded-lg p-1 shadow-xl transform transition-all duration-300 ease-in-out top-0 left-8"
                style={{
                    // position: "absolute",
                    // top: `${profileRef.current?.getBoundingClientRect().bottom}px`,
                    // left: `${profileRef.current?.getBoundingClientRect().left}px`,
                }}
            >
                <button
                    onClick={() => {
                        onSignOut()
                    }}
                    className="w-full text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition duration-200 flex items-center justify-center group"
                >
                    <FaSignOutAlt className="mr-2 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                    <span className="group-hover:text-gray-900 transition-colors duration-200">Sign Out</span>
                </button>
            </div>
        </div>
    )
}

export default UserProfile

