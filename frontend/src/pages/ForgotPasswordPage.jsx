import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import SharedButton from "../SharedComponents/SharedButton";
import { useAuth } from "../context/AuthContext"; 
import SharedInput from "../SharedComponents/SharedInput";
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-rose-50/40 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-rose-200/40"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#D7A4A6] via-[#E7B8B0] to-[#F2D7D5] text-transparent bg-clip-text">
          Mot de passe oublié
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-neutral-600 mb-6 text-center">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>

            <SharedInput
              icon={Mail}
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
			<SharedButton
			  type="submit"
			  loadingContent="Vérification..."
			  isLoading={isLoading}
			  
			>
				Vérifier
			</SharedButton>


            
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-[#D7A4A6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>

            <p className="text-neutral-600 mb-6">
              Si un compte existe pour <span className="font-semibold">{email}</span>,
              vous recevrez un lien de réinitialisation dans quelques instants.
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-rose-100/40 flex justify-center border-t border-rose-200/40">
        <Link
          to={"/login"}
          className="text-sm text-[#D7A4A6] hover:underline flex items-center font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
