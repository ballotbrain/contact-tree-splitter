import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import { PollOption } from "@/types/flow";
import { PollHeader } from "./Poll/PollHeader";
import { PollQuestion } from "./Poll/PollQuestion";
import { PollAnswers } from "./Poll/PollAnswers";
import { ListOrdered, Phone, Clock, Calendar, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_OPTIONS, addNewOption, deleteOption, updateOption, toggleOptionLeadsTo } from "./Poll/PollOptionManager";

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
    questionNumber?: number;
    onAddNextQuestion?: () => void;
  };
}

const MAX_CHARS = 500;

const PollNode = ({ data }: PollNodeProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.scheduledTime);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [labelType, setLabelType] = useState<"numerical" | "alphabetical">("numerical");
  const [messageType, setMessageType] = useState<'SMS' | 'MMS' | 'Toll-Free'>('SMS');
  const isFirstQuestion = data.questionNumber === 1;

  useEffect(() => {
    if (!data.options || data.options.length === 0) {
      data.onOptionsChange(DEFAULT_OPTIONS);
    }
  }, []);

  useEffect(() => {
    if (data.areaCode === "888") {
      setMessageType("Toll-Free");
    } else {
      setMessageType("SMS");
    }
  }, [data.areaCode]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      data.onScheduleChange?.(date);
      setShowCalendar(false);
    }
  };

  const handleUpdateOption = (id: string, text: string) => {
    const updatedOptions = updateOption(data.options, id, text);
    data.onOptionsChange(updatedOptions);
  };

  const handleToggleOptionLeadsTo = (id: string) => {
    const updatedOptions = toggleOptionLeadsTo(data.options, id);
    data.onOptionsChange(updatedOptions);
  };

  const handleAddNewOption = () => {
    const updatedOptions = addNewOption(data.options);
    data.onOptionsChange(updatedOptions);
  };

  const handleDeleteOption = (id: string) => {
    const updatedOptions = deleteOption(data.options, id);
    if (updatedOptions) {
      data.onOptionsChange(updatedOptions);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    const newQuestion = data.question + emoji.native;
    data.onQuestionChange(newQuestion);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex gap-8">
      <div className="bg-neutral-50 rounded-lg shadow-md p-4 min-w-[400px] border border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-black">Poll Question {data.questionNumber || 1}</span>
            <Badge variant="secondary" className="text-xs font-normal bg-neutral-100 text-neutral-800">
              {messageType}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm border border-gray-200 rounded px-2 py-1 bg-white text-black">
              <Phone className="w-3 h-3 text-gray-500" />
              {isFirstQuestion ? (
                <select
                  value={data.areaCode}
                  onChange={(e) => data.onAreaCodeChange?.(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm"
                >
                  {["415", "628", "510", "888"].map((code) => (
                    <option key={code} value={code}>
                      ({code})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-500">({data.areaCode})</span>
              )}
            </div>
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

        <PollQuestion
          question={data.question}
          onQuestionChange={data.onQuestionChange}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          handleMediaUpload={() => {}}
          maxChars={MAX_CHARS}
          questionNumber={data.questionNumber}
          onAddNextQuestion={data.onAddNextQuestion}
        />

        <Handle
          type="target"
          position={Position.Top}
          className="!bg-black !w-3 !h-3"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-black !w-3 !h-3"
        />
      </div>

      <PollAnswers
        options={data.options}
        labelType={labelType}
        onLabelTypeChange={setLabelType}
        updateOption={handleUpdateOption}
        toggleOptionLeadsTo={handleToggleOptionLeadsTo}
        onAddOption={handleAddNewOption}
        onDeleteOption={handleDeleteOption}
      />
    </div>
  );
};

export default PollNode;
