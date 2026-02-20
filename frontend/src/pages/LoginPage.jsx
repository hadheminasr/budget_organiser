import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../SharedComponents/SharedInput";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


//import { useAuthStore } from "../store/authStore";
import SharedButton from "../SharedComponents/SharedButton";
import axios from "axios";

const LoginPage = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false); 
	const [error, setError]  = useState(null); 
	const API_URL="http://localhost:5000/api/auth";
	
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/", { replace: true }); // -> RoleHome décide /admin ou /user
    } catch (err) {
      setError(err.response?.data?.message || "login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

	/*const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password },
  	{ withCredentials: true }
);
      console.log("logged in with sucess", response.data.user);
      //navigih l dash mtaao
    } catch (err) {
      const message = err.response?.data?.message || "login failed. Try again.";
      setError(message);

    } finally {
      setIsLoading(false);
    }
  };*/
	/*const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		await login(email, password);
	};*/
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-300 to-rose-200 text-transparent bg-clip-text'>
					Bon retour 👋
				</h2>

				<form onSubmit={handleLogin}>
					<Input
						icon={Mail}
						type='email'
						placeholder='Adresse email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<Input
						icon={Lock}
						type='password'
						placeholder='Mot de passe'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<div className='flex items-center mb-6'>
						<Link to='/forgot-password' className='text-sm text-rose-200 hover:underline'>
							Mot de passe oublié ?
						</Link>
					</div>

					{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

					
					<SharedButton type="submit" loading={isLoading} className="mt-2">
					Se connecter
					</SharedButton>


				</form>
			</div>

			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-300'>
					Pas encore de compte ?{" "}
					<Link to='/signup' className='text-rose-200 hover:underline font-semibold'>
						S’inscrire
					</Link>
				</p>
			</div>
		</motion.div>
	);
};

export default LoginPage;
