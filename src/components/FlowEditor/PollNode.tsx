import { Handle, Position } from "@xyflow/react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { PollOption } from "@/types/flow";
import { PollHeader } from "./Poll/PollHeader";
import { PollQuestion } from "./Poll/PollQuestion";
import { PollAnswers } from "./Poll/PollAnswers";
import { format } from "date-fns";

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

const DEFAULT_OPTIONS: PollOption[] = [
  { id: "1", text: "", leadsTo: "next" },
  { id: "2", text: "", leadsTo: "next" },
  { id: "3", text: "", leadsTo: "next" }
];

const MAX_CHARS = 500;

const PollNode = ({ data }: PollNodeProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.scheduledTime);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [labelType, setLabelType] = useState<"numerical" | "alphabetical">("numerical");
  const { toast } = useToast();

  // Initialize options if empty
  if (!data.options || data.options.length === 0) {
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

  const handleEmojiSelect = (emoji: any) => {
    if (data.question.length + emoji.native.length <= MAX_CHARS) {
      data.onQuestionChange(data.question + emoji.native);
    }
  };

  const handleMediaUpload = () => {
    toast({
      title: "Media Upload",
      description: "Media upload functionality will be implemented here",
    });
  };

  const updateOption = (id: string, text: string) => {
    const updatedOptions = data.options.map(opt =>
      opt.id === id ? { ...opt, text } : opt
    );
    data.onOptionsChange(updatedOptions);
  };

  const toggleOptionLeadsTo = (id: string) => {
    const updatedOptions = data.options.map(opt =>
      opt.id === id ? { ...opt, leadsTo: opt.leadsTo === "next" ? "complete" : "next" } : opt
    ) as PollOption[];
    data.onOptionsChange(updatedOptions);
  };

  const addNewOption = () => {
    const newOption: PollOption = {
      id: `${Date.now()}`,
      text: "",
      leadsTo: "next"
    };
    data.onOptionsChange([...data.options, newOption]);
  };

  const deleteOption = (id: string) => {
    if (data.options.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one answer option",
        variant: "destructive",
      });
      return;
    }
    const updatedOptions = data.options.filter(opt => opt.id !== id);
    data.onOptionsChange(updatedOptions);
  };

  return (
    <div className="flex gap-8">
      <div className="bg-white rounded-lg shadow-md p-4 min-w-[400px] border border-gray-200">
        <PollHeader
          questionNumber={data.questionNumber || 1}
          areaCode={data.areaCode}
          onAreaCodeChange={data.onAreaCodeChange}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          onDelete={data.onDelete}
        />

        <PollQuestion
          question={data.question}
          onQuestionChange={data.onQuestionChange}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          handleMediaUpload={handleMediaUpload}
          maxChars={MAX_CHARS}
          questionNumber={data.questionNumber}
          onAddNextQuestion={data.onAddNextQuestion}
        />

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

      <PollAnswers
        options={data.options}
        labelType={labelType}
        onLabelTypeChange={setLabelType}
        updateOption={updateOption}
        toggleOptionLeadsTo={toggleOptionLeadsTo}
        onAddOption={addNewOption}
        onDeleteOption={deleteOption}
      />
    </div>
  );
};

export default PollNode;