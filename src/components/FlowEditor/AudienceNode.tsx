import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Tag, MessageSquare, ListOrdered, Edit } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tag {
  id: string;
  name: string;
}

interface AudienceNodeProps {
  data: {
    label: string;
    contacts: number;
    tags?: Tag[];
    onSegment?: () => void;
    onMessageCreate?: () => void;
    onPollCreate?: () => void;
    selectedTags?: string[];
    onTagSelect?: (tagId: string) => void;
    onAudienceChange?: (audienceId: string) => void;
  };
}

const DEMOGRAPHIC_TAGS = [
  { id: "age_18_24", name: "Age 18-24" },
  { id: "age_25_34", name: "Age 25-34" },
  { id: "age_35_plus", name: "Age 35+" },
  { id: "gender_male", name: "Male" },
  { id: "gender_female", name: "Female" },
  { id: "location_urban", name: "Urban" },
  { id: "location_rural", name: "Rural" }
];

const AVAILABLE_AUDIENCES = [
  { id: "csv1", name: "CSV Import 1" },
  { id: "csv2", name: "CSV Import 2" },
  { id: "csv3", name: "CSV Import 3" },
  { id: "csv4", name: "CSV Import 4" }
];

const AudienceNode = ({ data }: AudienceNodeProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[280px] border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">HD40 Universe</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {AVAILABLE_AUDIENCES.map((audience) => (
                <DropdownMenuItem
                  key={audience.id}
                  onClick={() => data.onAudienceChange?.(audience.id)}
                  className="flex items-center justify-between"
                >
                  <span>{audience.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {audience.id === 'csv1' ? '150' : 
                     audience.id === 'csv2' ? '200' : 
                     audience.id === 'csv3' ? '300' : '250'} contacts
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge variant="secondary" className="text-sm px-3">
          {data.contacts} contacts
        </Badge>
      </div>

      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Tag className="w-4 h-4 mr-2" />
              Segment
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {DEMOGRAPHIC_TAGS.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => data.onTagSelect?.(tag.id)}
                className="flex items-center justify-between"
              >
                {tag.name}
                {data.selectedTags?.includes(tag.id) && (
                  <Badge variant="secondary" className="ml-2">Selected</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {data.selectedTags && data.selectedTags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {DEMOGRAPHIC_TAGS.filter(tag => data.selectedTags?.includes(tag.id)).map((tag) => (
              <Badge
                key={tag.id}
                variant="default"
                className="cursor-pointer"
                onClick={() => data.onTagSelect?.(tag.id)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={data.onMessageCreate}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={data.onPollCreate}
        >
          <ListOrdered className="w-4 h-4 mr-2" />
          Poll
        </Button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
};

export default AudienceNode;