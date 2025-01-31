import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Tag, MessageSquare, ListOrdered, Edit, Split } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
    selectedAudiences?: string[];
    onTagSelect?: (tagId: string, segmentSize: number) => void;
    onAudienceChange?: (audienceIds: string[]) => void;
  };
}

const DEMOGRAPHIC_TAGS = [
  { id: "age_18_24", name: "Age 18-24", segmentSize: 15000 },
  { id: "age_25_34", name: "Age 25-34", segmentSize: 25000 },
  { id: "age_35_plus", name: "Age 35+", segmentSize: 30000 },
  { id: "gender_male", name: "Male", segmentSize: 35000 },
  { id: "gender_female", name: "Female", segmentSize: 35000 },
  { id: "location_urban", name: "Urban", segmentSize: 40000 },
  { id: "location_rural", name: "Rural", segmentSize: 30000 }
];

const AVAILABLE_AUDIENCES = [
  { id: "csv1", name: "CSV Import 1", contacts: 50000 },
  { id: "csv2", name: "CSV Import 2", contacts: 75000 },
  { id: "csv3", name: "CSV Import 3", contacts: 100000 },
  { id: "csv4", name: "CSV Import 4", contacts: 85000 }
];

const AudienceNode = ({ data }: AudienceNodeProps) => {
  const totalContacts = AVAILABLE_AUDIENCES
    .filter(audience => data.selectedAudiences?.includes(audience.id))
    .reduce((sum, audience) => sum + audience.contacts, 0);

  const selectedAudienceNames = AVAILABLE_AUDIENCES
    .filter(audience => data.selectedAudiences?.includes(audience.id))
    .map(audience => {
      // Abbreviate names longer than 15 characters
      return audience.name.length > 15 
        ? `${audience.name.substring(0, 12)}...` 
        : audience.name;
    })
    .join(", ");

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[280px] border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">
            {data.selectedAudiences?.length ? selectedAudienceNames : "Select Audience"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {AVAILABLE_AUDIENCES.map((audience) => (
                <DropdownMenuCheckboxItem
                  key={audience.id}
                  checked={data.selectedAudiences?.includes(audience.id)}
                  onCheckedChange={(checked) => {
                    const newSelection = checked
                      ? [...(data.selectedAudiences || []), audience.id]
                      : (data.selectedAudiences || []).filter(id => id !== audience.id);
                    data.onAudienceChange?.(newSelection);
                  }}
                  className="flex items-center justify-between"
                >
                  <span>{audience.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {audience.contacts.toLocaleString()} contacts
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {totalContacts > 0 && (
          <Badge variant="secondary" className="text-sm px-3">
            {totalContacts.toLocaleString()} contacts
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Split className="w-4 h-4 mr-2" />
              Segment Audience
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {DEMOGRAPHIC_TAGS.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => data.onTagSelect?.(tag.id, tag.segmentSize)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  {tag.name}
                </div>
                <Badge variant="secondary" className="ml-2">
                  {tag.segmentSize.toLocaleString()}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={data.onMessageCreate}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
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