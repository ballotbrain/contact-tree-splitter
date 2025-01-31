import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ListOrdered, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { PollOption } from "@/types/flow";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface PollNodeProps {
  data: {
    question: string;
    options: PollOption[];
    onQuestionChange: (question: string) => void;
    onOptionsChange: (options: PollOption[]) => void;
    onDelete?: () => void;
    areaCode?: string;
    onAreaCodeChange?: (code: string) => void;
    scheduledTime?: Date;
    onScheduleChange?: (date: Date) => void;
  };
}

const AREA_CODES = ["415", "628", "510"];
const DEFAULT_OPTIONS = [
  { id: "1", text: "", leadsTo: "next" as const },
  { id: "2", text: "", leadsTo: "next" as const },
  { id: "3", text: "", leadsTo: "next" as const }
];

const PollNode = ({ data }: PollNodeProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.scheduledTime);
  const { toast } = useToast();

  // Initialize options if empty
  if (data.options.length === 0) {
    data.onOptionsChange(DEFAULT_OPTIONS);
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      data.onScheduleChange?.(date);
      setShowCalendar(false);
      toast({
        title: "Schedule Updated",
        description: `Poll scheduled for ${format(date, "PPpp")}`,
      });
    }
  };

  const updateOption = (id: string, text: string) => {
    const updatedOptions = data.options.map(opt =>
      opt.id === id ? { ...opt, text } : opt
    );
    data.onOptionsChange(updatedOptions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[300px] border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-black">Poll Question</span>
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
        </div>
      </div>

      <Textarea
        value={data.question}
        onChange={(e) => data.onQuestionChange(e.target.value)}
        placeholder="Enter your question..."
        className="mb-4"
      />

      <div className="space-y-3">
        {data.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <Badge variant="outline" className="min-w-[24px] text-gray-500">
              {index + 1}
            </Badge>
            <Textarea
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
          </div>
        ))}
      </div>

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

export default PollNode;