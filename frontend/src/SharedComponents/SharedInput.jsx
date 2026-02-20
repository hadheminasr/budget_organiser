// SharedInput.jsx
const SharedInput = ({ icon: Icon, ...props }) => {  // ✅ renommer ici
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-rose-300" />
      </div>
      <input
        {...props}
        className="
          w-full pl-10 pr-3 py-2
          bg-white border border-rose-200
          rounded-lg
          text-neutral-800 placeholder-neutral-400
          outline-none
          focus:border-[#D7A4A6] focus:ring-2 focus:ring-[#D7A4A6]/25
          transition duration-200
        "
      />
    </div>
  );
};

export default SharedInput;