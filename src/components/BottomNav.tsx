import { NavLink } from "react-router-dom";
import { Home, Share2, Users, User, ClipboardList } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export default function BottomNav() {
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Share", path: "/share", icon: Share2 },
    { name: "Products", path: "/products", icon: ClipboardList, center: true },
    { name: "Team", path: "/team", icon: Users },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-border-color rounded-t-3xl shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] px-2 pt-2 pb-4 z-50">
      <div className="flex justify-around items-end relative">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-16 relative",
                isActive ? "text-primary" : "text-text-gray hover:text-primary-light"
              )
            }
          >
            {({ isActive }) => (
              <>
                {item.center ? (
                  <div className="absolute -top-10 bg-white p-2 rounded-full shadow-lg">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", isActive ? "bg-primary text-white" : "bg-green-100 text-primary")}>
                       <item.icon size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="relative mb-1 mt-2">
                    <item.icon size={22} className={cn("transition-transform", isActive && "scale-110")} />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                )}
                <span className={cn("text-[10px] font-medium transition-all mt-1", item.center ? "mt-5" : "")}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
