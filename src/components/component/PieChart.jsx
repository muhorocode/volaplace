import React, { PureComponent } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

const data01 = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },

];

// Define Colors
const COLORS = ["#d22d2d", "#2ac62d"]; // Customize these colors

function PieChartComponent() {
    return (
      <div style={{ width: "100%", height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data01}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={60}
              label
              stroke="none" // Remove White Outline
            >
              {data01.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
export default PieChartComponent;