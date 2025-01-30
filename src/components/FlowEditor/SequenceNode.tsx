import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface SequenceNodeProps {
  data: {
    label: string;
    delay: string;
  };
}

const SequenceNode = ({ data }: SequenceNodeProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900">{data.label}</span>
      </div>
      
      <Badge variant="outline" className="text-xs">
        {data.delay}
      </Badge>

      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
};

export default SequenceNode;