import { PackageOpen } from "lucide-react";
import Card from "./Card";

function Grid() {
  return (
    <div className="h-[calc(100vh-5rem)] overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 gap-4">
        <Card />
      </div>
    </div>
  );
}
export default Grid;