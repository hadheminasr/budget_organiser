import { motion } from "framer-motion";

const SharedTabButton = ({ label, tab, activeTab, setActiveTab }) => {
  const isActive = activeTab === tab;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(tab)}
      className={`
        px-4 py-2.5 text-sm font-semibold cursor-pointer border-none bg-transparent
        border-b-2 transition duration-200
        ${isActive
          ? "border-[#C58B8E] text-[#C58B8E]"
          : "border-transparent text-[#6b6460] hover:text-[#C58B8E] hover:border-[#D7A4A6]"
        }
      `}
      style={{ marginBottom: -2 }}
    >
      {label}
    </motion.button>
  );
};

export default SharedTabButton;