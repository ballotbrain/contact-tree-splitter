import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown } from "lucide-react";

interface AudienceNodeProps {
  data: {
    label: string;
    contacts: number;
    onSegment?: () => void;
  };
}

const AudienceNode = ({ data }: AudienceNodeProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[240px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{data.label}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {data.contacts} contacts
        </Badge>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-between"
        onClick={data.onSegment}
      >
        Segment Audience
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
};

export default AudienceNode;