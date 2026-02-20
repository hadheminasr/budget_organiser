import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import SharedButton from "../SharedComponents/SharedButton";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyEmail } = useAuth(); // ✅ utilise verifyEmail du context

  const handleChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newCode[i] = pastedCode[i] || "";
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const verificationCode = code.join("");
    setIsLoading(true);
    setError(null);
    try {
      await verifyEmail(verificationCode); // ✅ utilise la fonction du context
      toast.success("Email vérifié avec succès !");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Code invalide. Réessayez.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

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
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold
                bg-white/5 text-white border-2 border-white/15 rounded-lg
                focus:border-[#D7A4A6] focus:outline-none focus:ring-2 focus:ring-[#D7A4A6]/25"
              />
            ))}
          </div>

          {error && <p className="text-red-300 font-semibold mt-2">{error}</p>}

          <SharedButton
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
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