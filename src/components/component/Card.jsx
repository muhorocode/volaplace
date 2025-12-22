import {
  PackageOpen,
  Handshake,
  CircleDollarSign,
  Landmark,
  PackageX,
  Eye,
  CircleArrowUp,
  CircleArrowDown,
} from "lucide-react";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

function Card() {
  const cardList = [
    {
      title: "Orders",
      value: "142,293",
      logo: <PackageOpen size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Increased by 12%",
      sublogo: <CircleArrowUp size={17} color="#2ac62d" />,
    },
    {
      title: "Monthly Deals",
      value: "2,235",
      logo: <Handshake size={20} />,
      rowspan: "row-span-2",
      minh: "min-h-[300px]",
      subtitle: "Increased by 15%",
      sublogo: <CircleArrowUp size={17} color="#2ac62d" />,
      chart: <BarChart></BarChart>,
    },
    {
      title: "New Orders",
      value: "42,495",
      logo: <PackageOpen size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Decreased by 7%",
      sublogo: <CircleArrowDown size={17} color="#d22d2d" />,
    },
    {
      title: "Total Orders",
      value: "$24,875",
      logo: <PackageOpen size={20} />,
      rowspan: "row-span-2",
      minh: "min-h-[300px]",
      subtitle: "Decreased by 5%",
      sublogo: <CircleArrowDown size={17} color="#d22d2d" />,
      chart: <PieChart></PieChart>,
    },
    {
      title: "Total Revenue",
      value: "$52,128",
      logo: <CircleDollarSign size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Increased by 4%",
      sublogo: <CircleArrowUp size={17} color="#2ac62d" />,
    },
    {
      title: "Conversion Rate",
      value: "56%",
      logo: <Landmark size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Increased by 3%",
      sublogo: <CircleArrowDown size={17} color="#d22d2d" />,
    },
    {
      title: "Bounce Rate",
      value: "23%",
      logo: <PackageX size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Increased by 2%",
      sublogo: <CircleArrowUp size={17} color="#d22d2d" />,
    },
    {
      title: "Views",
      value: "101,321",
      logo: <Eye size={20} />,
      rowspan: "",
      minh: "min-h-[160px]",
      subtitle: "Increased by 8%",
      sublogo: <CircleArrowUp size={17} color="#2ac62d" />,
    },
  ];

  return (
    <>
      {cardList.map((card, index) => (
        <div
          key={index}
          className={`border border-[rgba(255,255,255,0.3)] rounded-lg ${card.minh} ${card.rowspan}`}
        >
          <div className="flex">
            <div className="pl-10 pt-10 text-white text-xl font-normal">
              {card.title}
            </div>
            <div className="pl-2 pt-11 text-white">{card.logo}</div>
          </div>

          <div className="pl-10 text-white text-2xl font-semibold">
            {card.value}
          </div>
          <div className="flex">
            <div className="pl-10 text-white text-sm ">{card.subtitle}</div>
            <div className="pl-2 pt-0.5">{card.sublogo}</div>
          </div>
          <div className="pt-3 pl-2 pr-2">{card.chart}</div>
        </div>
      ))}
    </>
  );
}
export default Card;