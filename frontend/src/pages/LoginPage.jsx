import { useState ,useMemo} from "react";
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

	const isPasswordValid = useMemo(() => {
	  return (
		password.length >= 12 &&
		/[A-Z]/.test(password) &&
		/[a-z]/.test(password) &&
		/[0-9]/.test(password) &&
		/[^A-Za-z0-9]/.test(password)
	  );
	}, [password]);

	const isEmailValid = useMemo(() => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
	}, [email]);

	const canSubmit = useMemo(() => {
	  
	  return (
		isEmailValid  && isPasswordValid 
	  );
	}, [ isEmailValid, isPasswordValid]);

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
  <div className="min-h-screen w-full flex items-start sm:items-center justify-center px-4 pt-24 sm:pt-8 pb-8 bg-gradient-to-br from-[#fbf7f5] via-[#fff7fb] to-[#f6eeee]">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[380px] sm:max-w-md bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-300 to-rose-200 text-transparent bg-clip-text">
          {t('auth.welcomeBack')}
        </h2>

        <form onSubmit={handleLogin}>
          <SharedInput
            icon={Mail}
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {email.length > 0 && !isEmailValid && (
            <p className="text-rose-400 text-xs mb-2">
              {t('auth.errors.invalidEmail')}
            </p>
          )}

          <SharedInput
            icon={Lock}
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {password.length > 0 && !isPasswordValid && (
            <p className="text-rose-400 text-xs mb-2">
              {t('auth.errors.invalidPassword')}
            </p>
          )}

          <div className="flex items-center mb-6">
            <Link to="/forgot-password" className="text-sm text-rose-200 hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}

          <SharedButton
            type="submit"
            loading={isLoading}
            className="mt-2"
          >
            {t('auth.login')}
          </SharedButton>
        </form>
      </div>

      <div className="px-6 sm:px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-300 text-center">
          {t('auth.noAccount')}{" "}
          <Link to="/signup" className="text-rose-200 hover:underline font-semibold">
            {t('auth.goSignup')}
          </Link>
        </p>
      </div>
    </motion.div>
  </div>
);

}

export default LoginPage;
