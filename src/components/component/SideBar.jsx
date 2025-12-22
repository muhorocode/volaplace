import { useState, useEffect } from "react";
import {
  PanelsTopLeft,
  LayoutDashboard,
  NotepadText,
  ChartNoAxesCombined,
  UsersRound,
  HandCoins,
  CircleDollarSign,
  LogOut,
} from "lucide-react";

function Sidebar() {
  // State to manage sidebar visibility
  const [open, setOpen] = useState(
    window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (e) => setOpen(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="absolute z-50 cursor-pointer m-5"
        onClick={() => setOpen((prev) => !prev)}
      >
        <PanelsTopLeft size={25} color="#ffffff" />
      </button>

      {/* Sidebar */}
      <div className="relative">
        <div
          className={`h-full duration-300 absolute md:relative z-40 overflow-hidden ${
            open ? "w-60 p-5" : "w-0 p-0"
          }`}
          style={{ backgroundColor: "#171710" }}
        >
          <div className="pt-15 flex flex-col h-full">
            <div
              className={`flex text-[#bfbdbd] origin-left font-small text-sm duration-200 pt-5 ${
                !open && "scale-0"
              }`}
            >
              Favorites
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-3 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <LayoutDashboard />
              </div>{" "}
              Dashboard
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-5 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <ChartNoAxesCombined />
              </div>
              Analysis
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-5 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <NotepadText />
              </div>{" "}
              Reports
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-5 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <UsersRound />
              </div>{" "}
              Customers
            </div>
            <div
              className={`flex text-[#bfbdbd] origin-left font-small text-sm duration-200 pt-5 ${
                !open && "scale-0"
              }`}
            >
              Money
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-3 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <HandCoins />
              </div>{" "}
              Savings
            </div>
            <div
              className={`flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-5 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
                <CircleDollarSign />
              </div>{" "}
              Revenue
            </div>
            <div
              className={`mt-auto flex pl-5 text-white origin-left font-small text-lg duration-200 cursor-pointer pt-3 ${
                !open && "scale-0"
              }`}
            >
              <div className="pt-0.5 pr-2">
              <LogOut />
              </div>{" "}
              Log out
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;