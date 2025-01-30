import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MessageNodeProps {
  data: {
    content: string;
    onChange: (content: string) => void;
  };
}

const MessageNode = ({ data }: MessageNodeProps) => {
  const [links, setLinks] = useState<string[]>([]);

  useEffect(() => {
    // URL detection regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const detectedLinks = data.content.match(urlRegex) || [];
    setLinks(detectedLinks);
  }, [data.content]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900">Message</span>
      </div>
      
      <Textarea
        value={data.content}
        onChange={(e) => data.onChange(e.target.value)}
        placeholder="Type your message here..."
        className="min-h-[100px] mb-3"
      />

      {links.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LinkIcon className="w-4 h-4" />
            <span>Detected Links:</span>
          </div>
          {links.map((link, index) => (
            <Badge key={index} variant="secondary" className="mr-2">
              {link}
            </Badge>
          ))}
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