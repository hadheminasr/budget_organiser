import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";          

import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import SharedButton from "../SharedComponents/SharedButton";
import SharedInput from "../SharedComponents/SharedInput";
import LanguageSwitcher from "../components/LanguageSwitcher"; 
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();                        

  const [name, setName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const confirmError =
    confirm.length > 0 && password !== confirm
      ? t('auth.errors.passwordNotMatch')
      : "";

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      prenom.trim() &&
      email.trim() &&
      password.length > 0 &&
      password === confirm
    );
  }, [name, prenom, email, password, confirm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      await signup({ name, prenom, email, password });
      navigate("/verify-email");
    } catch (err) {
      setError(err?.response?.data?.message || t('auth.errors.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-[#fbf7f5] via-[#fffdfc] to-[#f6eeee]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-black/5 bg-white/70 backdrop-blur-xl"
      >
        <div className="p-8">

          {/* ← 6. bouton langue en haut à droite */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* ← 7. titre traduit */}
          <h1 className="text-3xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#D7A4A6] to-[#C58B8E]">
            {t('auth.createAccount')}
          </h1>

          {/* ← 8. sous-titre traduit */}
          <p className="text-center text-sm text-neutral-500 mb-6">
            {t('auth.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              {/* ← 9. labels traduits */}
              <label className="block text-xs text-neutral-600 mb-1">
                {t('auth.name')}
              </label>
              <SharedInput
                placeholder={t('auth.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="family-name"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                {t('auth.familyName')}
              </label>
              <SharedInput
                placeholder={t('auth.familyName')}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoComplete="given-name"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                {t('auth.email')}
              </label>
              <SharedInput
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                {t('auth.password')}
              </label>
              <SharedInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <div className="mt-2">
                <PasswordStrengthMeter password={password} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-600 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <SharedInput
                type="password"
                placeholder={t('auth.confirmPassword')}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {confirmError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {confirmError}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <SharedButton type="submit" loading={isLoading} disabled={!canSubmit}>
              {t('auth.signup')}
            </SharedButton>

            <p className="text-center text-sm text-neutral-500">
              {t('auth.alreadyAccount')}{" "}
              <Link to="/login" className="font-semibold text-[#C58B8E] hover:underline">
                {t('auth.goLogin')}
              </Link>
            </p>

          </form>
        </div>
      </motion.div>
    </div>
  );
}