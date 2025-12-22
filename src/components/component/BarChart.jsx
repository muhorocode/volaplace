import React, { PureComponent } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
];
function BarChartComponent() {
  return (
    <div style={{ width: "100%", height: 190 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={100} height={100} data={data}>
          <Bar dataKey="uv" fill="#ffffff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export default BarChartComponent;