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
  Clock,
  Zap,
  Phone
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

interface KeywordTrigger {
  keyword: string;
  response: string;
}

interface MessageNodeProps {
  data: {
    content: string;
    onChange: (content: string) => void;
    onDelete?: () => void;
    areaCode?: string;
    onAreaCodeChange?: (code: string) => void;
    scheduledTime?: Date;
    onScheduleChange?: (date: Date) => void;
    keywordTriggers?: KeywordTrigger[];
    onKeywordTriggersChange?: (triggers: KeywordTrigger[]) => void;
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
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [messageType, setMessageType] = useState<'SMS' | 'MMS'>('SMS');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const placeholderMedia = [
    { 
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop'
    },
    { 
      type: 'video',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop'
    },
    { 
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop'
    }
  ];

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

  const handleMediaSelect = (media: typeof placeholderMedia[0]) => {
    setSelectedMedia(media.url);
    setMessageType('MMS');
    const mediaTag = media.type === 'video' ? '[Video]' : '[Media]';
    data.onChange(data.content + `\n${mediaTag}: ${media.url}`);
    
    toast({
      title: "Media Added",
      description: `${media.type === 'video' ? 'Video' : 'Image'} has been added to your message`,
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

  const addKeywordTrigger = () => {
    if (newKeyword && newResponse) {
      const newTrigger = {
        keyword: newKeyword,
        response: newResponse
      };
      data.onKeywordTriggersChange?.([
        ...(data.keywordTriggers || []),
        newTrigger
      ]);
      setNewKeyword("");
      setNewResponse("");
      setShowKeywordModal(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] rounded-lg shadow-md p-4 min-w-[400px] max-w-[600px] border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-black">Message</span>
          <Badge variant="secondary" className="text-xs">
            {messageType}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm border border-gray-200 rounded px-2 py-1 bg-white text-black">
            <Phone className="w-3 h-3 text-gray-500" />
            <select
              value={data.areaCode}
              onChange={(e) => data.onAreaCodeChange?.(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm"
            >
              {AREA_CODES.map((code) => (
                <option key={code} value={code}>
                  ({code})
                </option>
              ))}
            </select>
          </div>
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600"
              >
                {selectedDate ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Clock className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Scheduled for {format(selectedDate, "PPpp")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-medium">Schedule Message</h4>
              </div>
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
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <textarea
          value={data.content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              data.onChange(e.target.value);
            }
          }}
          placeholder="Type your message here..."
          className="min-h-[120px] resize-y w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 mb-1 text-base leading-relaxed bg-white"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            caretColor: '#2563eb'
          }}
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

        {/* Media Gallery */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {placeholderMedia.map((media, index) => (
            <div
              key={index}
              onClick={() => handleMediaSelect(media)}
              className="relative cursor-pointer group"
            >
              <img
                src={media.thumbnail}
                alt={`Media ${index + 1}`}
                className="w-full h-20 object-cover rounded-md border border-gray-200 transition-all duration-200 group-hover:border-blue-500"
              />
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
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

      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowKeywordModal(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4 text-black" />
          Action Trigger
        </Button>
      </div>

      {data.keywordTriggers && data.keywordTriggers.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium">Action Triggers:</div>
          {data.keywordTriggers.map((trigger, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded-md text-sm flex justify-between items-center"
            >
              <div>
                <span className="font-medium">"{trigger.keyword}"</span>
                <span className="mx-2">→</span>
                <span>"{trigger.response}"</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newTriggers = [...(data.keywordTriggers || [])];
                  newTriggers.splice(index, 1);
                  data.onKeywordTriggersChange?.(newTriggers);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700 hover:bg-red-50" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showKeywordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Add Action Trigger</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Keyword</label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2"
                  placeholder="e.g., YES, NO, STOP"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Response</label>
                <Textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="mt-1"
                  placeholder="Auto-response message..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowKeywordModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addKeywordTrigger}>Add Trigger</Button>
              </div>
            </div>
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
