import { Triangle, type LucideIcon } from "lucide-react";

const ChallengeMetric = ({
  icon: Icon,
  title,
  value,
  unit,
  comparision,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  unit: string;
  comparision?: boolean;
}) => {
  return (
    <div className="relative mb-4 flex items-center justify-between rounded-lg bg-white/5 p-4">
      <div className="flex items-center">
        <Icon className="mr-3 h-6 w-6 text-blue-400" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="text-right">
        <div className="flex text-lg font-bold">
          <span>{Number(value).toFixed(1)}</span>
          <span> {unit}</span>
        </div>
      </div>
      {comparision !== undefined && (
        <span className="absolute right-2 top-2">
          {comparision ? (
            <Triangle className="h-2 w-2 rotate-180 fill-current text-red-500" />
          ) : (
            <Triangle className="h-2 w-2 fill-current text-green-500" />
          )}
        </span>
      )}
    </div>
  );
};

export default ChallengeMetric;
