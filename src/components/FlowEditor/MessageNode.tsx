import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Trash2,
  SmilePlus,
  Calendar,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface MessageNodeProps {
  data: {
    content: string;
    onChange: (content: string) => void;
    onDelete?: () => void;
    areaCode?: string;
    onAreaCodeChange?: (code: string) => void;
    scheduledTime?: Date;
    onScheduleChange?: (date: Date) => void;
  };
}

const MAX_CHARS = 2000;
const AREA_CODES = ["415", "628", "510"];

const MessageNode = ({ data }: MessageNodeProps) => {
  const [links, setLinks] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.scheduledTime);
  const { toast } = useToast();

  useEffect(() => {
    // URL detection regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const detectedLinks = data.content.match(urlRegex) || [];
    setLinks(detectedLinks);
  }, [data.content]);

  const handleEmojiSelect = (emoji: any) => {
    if (data.content.length + emoji.native.length <= MAX_CHARS) {
      data.onChange(data.content + emoji.native);
    }
  };

  const handleMediaUpload = () => {
    // For now, we'll just show a toast. In a real implementation, 
    // this would open a file picker
    toast({
      title: "Media Upload",
      description: "Media upload functionality will be implemented here",
    });
  };

  const enableLinkTracking = (link: string) => {
    // Replace the regular link with a tracked version
    const trackedLink = `https://track.your-domain.com/?url=${encodeURIComponent(link)}`;
    const newContent = data.content.replace(link, trackedLink);
    data.onChange(newContent);
    
    toast({
      title: "Link Tracking Enabled",
      description: "Your link will now be tracked for analytics.",
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      data.onScheduleChange?.(date);
      setShowCalendar(false);
      toast({
        title: "Schedule Updated",
        description: `Message scheduled for ${format(date, "PPpp")}`,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[300px] border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-black">Message</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={data.areaCode}
            onChange={(e) => data.onAreaCodeChange?.(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-black"
          >
            {AREA_CODES.map((code) => (
              <option key={code} value={code}>
                ({code})
              </option>
            ))}
          </select>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                {selectedDate ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Calendar className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Scheduled for {format(selectedDate, "PPpp")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {data.onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={data.onDelete}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <Textarea
          value={data.content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              data.onChange(e.target.value);
            }
          }}
          placeholder="Type your message here..."
          className="min-h-[100px] mb-1"
        />
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SmilePlus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMediaUpload}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <span>
            {data.content.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {links.length > 0 && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LinkIcon className="w-4 h-4" />
            <span>Detected Links:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => enableLinkTracking(link)}
                    >
                      {link}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to enable link tracking</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

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

export default MessageNode;
