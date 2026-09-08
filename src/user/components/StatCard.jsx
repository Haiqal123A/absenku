function StatCard({
  icon,
  title,
  value,
  subtitle,
  percentage,
  variant = "blue",
}) {
  const variants = {
    blue: {
      icon: "bg-blue-100 text-[#073BBA]",
      percentage: "text-emerald-600",
    },

    yellow: {
      icon: "bg-yellow-100 text-yellow-500",
      percentage: "text-yellow-500",
    },

    red: {
      icon: "bg-red-100 text-red-500",
      percentage: "text-red-500",
    },
  };

  const style = variants[variant];

  return (
    <div className="
      bg-white
      border border-slate-200
      rounded-xl
      p-5
      shadow-sm
    ">

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div className={`
            w-14 h-14
            rounded-full
            flex items-center justify-center
            ${style.icon}
          `}>
            {icon}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#073BBA]">
              {title}
            </p>

            <h3 className="
              text-3xl
              font-bold
              text-[#0B2875]
              mt-1
            ">
              {value}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {subtitle}
            </p>
          </div>

        </div>

      </div>

      <div className={`
        flex
        justify-end
        items-center
        gap-1
        text-sm
        font-semibold
        mt-3
        ${style.percentage}
      `}>
        ↗ {percentage}
      </div>

    </div>
  );
}

export default StatCard;