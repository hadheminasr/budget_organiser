const DEFAULT_ICON_COLORS = {
  blue: "bg-blue-50 text-blue-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-50 text-red-600",
};

const DEFAULT_CHANGE_COLORS = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral: "text-gray-500",
};

export default function SharedCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'blue',
  className = '',
  iconColors,
  changeColors,
 })
 {
 const finalIconColors = iconColors || DEFAULT_ICON_COLORS;
const finalChangeColors = changeColors || DEFAULT_CHANGE_COLORS;

 
  return (
    <div
      className={`
        bg-white 
        border border-gray-200 
        rounded-xl 
        p-6 
        hover:shadow-lg 
        hover:scale-105
        transition-all 
        duration-300 
        cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        {/* Partie gauche: Titre et Valeur */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${finalChangeColors[changeType]}`}>

              {change}
            </p>
          )}
        </div>

        {/* Partie droite: Icône */}
        {Icon && (
          <div
            className={`
              w-12 h-12 
              rounded-lg 
              flex items-center justify-center
              ${finalIconColors[iconColor] ?? finalIconColors.blue}
            `}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}