import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SharedButton from "../SharedComponents/SharedButton";
import SharedInput from "../SharedComponents/SharedInput";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../context/AuthContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || t('common.serverError'));
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

        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#D7A4A6] via-[#E7B8B0] to-[#F2D7D5] text-transparent bg-clip-text">
          {t('auth.forgotPassword')}
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-neutral-600 mb-6 text-center">
              {t('auth.forgotPasswordDesc')}
            </p>

            <SharedInput
              icon={Mail}
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}

            <SharedButton type="submit" loading={isLoading}>
              {t('auth.sendResetLink')}
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
              {t('auth.forgotPasswordSuccess', { email })}
            </p>
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-rose-100/40 flex justify-center border-t border-rose-200/40">
        <Link
          to="/login"
          className="text-sm text-[#D7A4A6] hover:underline flex items-center font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          
          {t('auth.backToLogin')}
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;