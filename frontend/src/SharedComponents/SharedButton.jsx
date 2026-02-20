import { motion } from "framer-motion";

const SharedButton = ({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "w-full rounded-xl py-3 px-4 font-bold transition duration-200 shadow-lg";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-[#D7A4A6] to-[#C58B8E] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#D7A4A6]/40",
    secondary:
      "text-[#5a3b3f] bg-white/70 border border-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#D7A4A6]/25",
    ghost:
      "text-[#C58B8E] bg-transparent hover:bg-[#D7A4A6]/10 shadow-none",
  };

  const disabledStyle = "disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabledStyle} ${className}`}
      {...props}
    >
      {loading ? "Chargement..." : children}
    </motion.button>
  );
};

export default SharedButton;
