import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contextApi/AuthContext';
import Loader from './Loader';

const Login = ({ setLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate();
    const { asyncSingIn, isLoading } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await asyncSingIn(formData);
        if (res) navigate('/dashboard');
    };

    return (
        isLoading ? <Loader /> :
            (<div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
                <div className="bg-white shadow-lg rounded-lg w-96 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Log In</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Log In
                            </button>
                        </div>
                    </form>
                </div>
                <p className="text-gray-600 mt-4">Don't have an account? <a onClick={() => setLogin(false)} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">Sign Up</a></p>
            </div>)
    );
};

export default Login;
