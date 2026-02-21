import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import SharedButton from "../SharedComponents/SharedButton";
import SharedInput from "../SharedComponents/SharedInput";
import { useAuth } from "../context/AuthContext";

const EmailVerificationPage = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
    
      return;

    }
    

    setIsLoading(true);
    setError(null);
    try {
      await verifyEmail(code);
      toast.success("Email vérifié avec succès !");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Code invalide. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

/*onChange={(e) => {
  const valeur = e.target.value;
  // replace() supprime tout ce qui n'est pas un chiffre
  if (/^\d*$/.test(valeur)) {
    setCode(valeur);
  }
}*/
  return (
    <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#F3C6C6] via-[#E9B7B7] to-[#D7A4A6]">
          Vérifier votre email
        </h2>

        <p className="text-center text-white/70 mb-6">
          Saisissez le code à 6 chiffres envoyé à votre adresse email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SharedInput
            type="text"
            maxLength="6"
            placeholder="123456"
            value={code}
            onChange={(e) => {
              const valeur = e.target.value;
              if (/^\d*$/.test(valeur)) setCode(valeur);
            }}
            className="text-center text-2xl font-bold tracking-[1rem] bg-white/5 text-white border-white/15"
          />

          {error && <p className="text-red-300 font-semibold mt-2">{error}</p>}

          <SharedButton
            type="submit"
            disabled={isLoading || code.length !== 6}
            isLoading={isLoading}
            loadingText="Vérification..."
          >
            Vérifier
          </SharedButton>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;