import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListOrdered, Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PollHeaderProps {
  questionNumber: number;
  areaCode?: string;
  onAreaCodeChange?: (code: string) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  onDelete?: () => void;
}

const AREA_CODES = ["415", "628", "510"];

export const PollHeader = ({
  questionNumber,
  areaCode,
  onAreaCodeChange,
  selectedDate,
  onDateSelect,
  showCalendar,
  setShowCalendar,
  onDelete,
}: PollHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-gray-600" />
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Poll Question {questionNumber || 1}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={areaCode}
          onChange={(e) => onAreaCodeChange?.(e.target.value)}
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
              <h4 className="text-sm font-medium">Schedule Poll</h4>
            </div>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};