// SharedComponents/SharedButton.jsx

const SharedButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  icon = null,
  className = "",
}) => {
  const styles = {
    primary:   "bg-pink-400 text-white hover:bg-pink-500",
    secondary: "bg-white text-pink-400 border border-pink-200 hover:bg-pink-50",
    ghost:     "bg-transparent text-pink-400 hover:bg-pink-50",
    danger:    "bg-red-50 text-red-400 border border-red-200 hover:bg-red-100",
  };

  return (
    <button
      type={type} 
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full rounded-xl py-3 px-4
        font-bold text-sm
        flex items-center justify-center gap-2
        transition duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        cursor-pointer
        ${styles[variant]}
        ${className}
      `}
    >
      {icon && icon}
      {loading ? "Chargement..." : children}
    </button>
  );
};
export default SharedButton;
