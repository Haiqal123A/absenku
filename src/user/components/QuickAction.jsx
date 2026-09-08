import { NavLink } from "react-router-dom";

function QuickAction({
  to,
  icon,
  children,
  primary = false,
  compact = false,
}) {
  return (
    <NavLink
      to={to}
      className={`
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        text-sm
        transition

        ${
          compact
            ? "px-4 py-3"
            : "w-full px-4 py-3"
        }

        ${
          primary
            ? "bg-[#FFD21A] text-[#073BBA] font-bold hover:bg-yellow-400"
            : "bg-blue-50 text-[#073BBA] hover:bg-blue-100"
        }
      `}
    >
      {icon}

      <span>
        {children}
      </span>

    </NavLink>
  );
}

export default QuickAction;