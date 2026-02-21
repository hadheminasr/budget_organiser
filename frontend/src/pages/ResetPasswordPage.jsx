import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import SharedButton from "../SharedComponents/SharedButton";
import SharedInput from "../SharedComponents/SharedInput";
import { useAuth } from "../context/AuthContext"; 

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { resetPassword } = useAuth(); 
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(token, password); 
      toast.success("Mot de passe modifié ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-md w-full bg-[#1a0f14]/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/10"
		>
			<div className="p-8">
				<h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#f2c6c9] via-[#e9b7b9] to-[#d7a4a6]">
					Réinitialiser le mot de passe
				</h2>

				{error && <p className="text-rose-200/90 text-sm mb-4">{error}</p>}
				{message && <p className="text-[#f2c6c9] text-sm mb-4">{message}</p>}

				<form onSubmit={handleSubmit}>
					<SharedInput
						icon={Lock}
						type="password"
						placeholder="Nouveau mot de passe"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<SharedInput
						icon={Lock}
						type="password"
						placeholder="Confirmer le mot de passe"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
					<SharedButton
						type="submit"
						loading={isLoading}
						loadingContent="Mise à jour..."
						disabled={isLoading}
						>
						Définir un nouveau mot de passe
						</SharedButton>

				</form>
			</div>
		</motion.div>
	);
};

export default ResetPasswordPage;
