const SharedInput = ({ icon: Icon, className = "", ...props }) => {
  return (
    <div className="relative mb-4">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="size-5 text-rose-300" />
        </div>
      )}

      <input
        {...props}
        className={`
          w-full py-3 pr-3 rounded-xl
          ${Icon ? "pl-10" : "pl-4"}
          bg-white border border-black/10
          text-neutral-800 placeholder-neutral-400
          outline-none
          focus:border-[#D7A4A6] focus:ring-2 focus:ring-[#D7A4A6]/25
          transition duration-200
          ${className}
        `}
      />
    </div>
  );
};

export default SharedInput;