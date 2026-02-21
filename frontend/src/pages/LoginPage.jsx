import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import SharedInput from "../SharedComponents/SharedInput";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import SharedButton from "../SharedComponents/SharedButton";


const LoginPage = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false); 
	const [error, setError]  = useState(null); 
	const API_URL="http://localhost:5000/api/auth";
	const {t}=useTranslation();
	const { login } = useAuth();

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
		await login(email, password);
		navigate("/", { replace: true }); //  RoleHome décide /admin ou /user
		} catch (err) {
		setError(err.response?.data?.message || t('auth.errors.loginFailed'));
		} finally {
		setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<div className="flex justify-end mb-4">
					<LanguageSwitcher/>
				</div>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-300 to-rose-200 text-transparent bg-clip-text'>
					{t('auth.welcomeBack')}
				</h2>

				<form onSubmit={handleLogin}>
					<SharedInput
						icon={Mail}
						type='email'
						placeholder={t('auth.email')}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<SharedInput
						icon={Lock}
						type='password'
						placeholder={t('auth.password')}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<div className='flex items-center mb-6'>
						<Link to='/forgot-password' className='text-sm text-rose-200 hover:underline'>
							{t('auth.forgotPassword')}
						</Link>
					</div>

					{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

					
					<SharedButton type="submit" loading={isLoading} className="mt-2">
						{t('auth.login')}
					</SharedButton>


				</form>
			</div>

			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-300'>
					{t('auth.noAccount')}{" "}
					<Link to='/signup' className='text-rose-200 hover:underline font-semibold'>
						{t('auth.goSignup')}
					</Link>
				</p>
			</div>
		</motion.div>
	);
};

export default LoginPage;
