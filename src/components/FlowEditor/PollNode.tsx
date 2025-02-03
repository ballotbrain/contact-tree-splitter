import { Handle, Position } from "@xyflow/react";
import { useEffect, useState } from "react";
import { PollOption } from "@/types/flow";
import { PollHeader } from "./Poll/PollHeader";
import { PollQuestion } from "./Poll/PollQuestion";
import { PollAnswers } from "./Poll/PollAnswers";
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

  useEffect(() => {
    if (!data.options || data.options.length === 0) {
      data.onOptionsChange(DEFAULT_OPTIONS);
    }
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      data.onScheduleChange?.(date);
      setShowCalendar(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (data.question.length + emoji.native.length <= MAX_CHARS) {
      data.onQuestionChange(data.question + emoji.native);
    }
  };

  const handleMediaUpload = () => {
    // Will be implemented later
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

  return (
    <div className="flex gap-8">
      <div className="bg-neutral-50 rounded-lg shadow-md p-4 min-w-[400px] border border-neutral-200">
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