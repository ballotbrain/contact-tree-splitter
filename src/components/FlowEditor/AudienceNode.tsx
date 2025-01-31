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
    onTagSelect?: (tagId: string, segmentSize: number) => void;
    onAudienceChange?: (audienceId: string) => void;
  };
}

const DEMOGRAPHIC_TAGS = [
  { id: "age_18_24", name: "Age 18-24", segmentSize: 45 },
  { id: "age_25_34", name: "Age 25-34", segmentSize: 65 },
  { id: "age_35_plus", name: "Age 35+", segmentSize: 40 },
  { id: "gender_male", name: "Male", segmentSize: 75 },
  { id: "gender_female", name: "Female", segmentSize: 75 },
  { id: "location_urban", name: "Urban", segmentSize: 90 },
  { id: "location_rural", name: "Rural", segmentSize: 60 }
];

const AVAILABLE_AUDIENCES = [
  { id: "csv1", name: "CSV Import 1", contacts: 150 },
  { id: "csv2", name: "CSV Import 2", contacts: 200 },
  { id: "csv3", name: "CSV Import 3", contacts: 300 },
  { id: "csv4", name: "CSV Import 4", contacts: 250 }
];

const AudienceNode = ({ data }: AudienceNodeProps) => {
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
                    {audience.contacts} contacts
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
                onClick={() => data.onTagSelect?.(tag.id, tag.segmentSize)}
                className="flex items-center justify-between"
              >
                {tag.name}
                <Badge variant="secondary" className="ml-2">
                  {tag.segmentSize} contacts
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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