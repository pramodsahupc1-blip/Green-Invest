import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MobileLayout() {
  const location = useLocation();
  const hideNavPaths = ["/login", "/register"];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-[430px] bg-bg-light min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <Outlet />
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
