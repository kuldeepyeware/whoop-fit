import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

const RenderMetricCard = ({
  title,
  value,
  change,
  isPercentage,
}: {
  title: string;
  value: number | undefined;
  change: number | undefined;
  isPercentage?: boolean;
}) => {
  const formattedValue =
    value !== undefined
      ? isPercentage
        ? `${Number(value).toFixed(1)}%`
        : Number(value).toFixed(1)
      : "N/A";

  const formattedChange =
    change !== undefined
      ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%`
      : "N/A";

  return (
    <Card className="border-none bg-white/10 p-4 text-white shadow-lg backdrop-blur-md">
      <div className="flex w-full items-center justify-between text-3xl font-bold md:text-4xl">
        {formattedValue}
        <span>
          {change !== undefined &&
            (change > 0 ? (
              <TrendingUp className="h-4 w-4 fill-current text-green-500 md:h-6 md:w-6" />
            ) : (
              <TrendingDown className="h-4 w-4 fill-current text-red-500 md:h-6 md:w-6" />
            ))}
        </span>
      </div>
      <div className="text-sm">{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">Change 7d</div>
        <span
          className={`text-sm ${change !== undefined ? (change > 0 ? "text-green-500" : "text-red-500") : ""}`}
        >
          {formattedChange}
        </span>
      </div>
    </Card>
  );
};

export default RenderMetricCard;
