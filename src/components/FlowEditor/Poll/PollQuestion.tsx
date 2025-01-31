import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SmilePlus, ImageIcon, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface PollQuestionProps {
  question: string;
  onQuestionChange: (question: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onEmojiSelect: (emoji: any) => void;
  handleMediaUpload: () => void;
  maxChars: number;
  questionNumber?: number;
  onAddNextQuestion?: () => void;
}

export const PollQuestion = ({
  question,
  onQuestionChange,
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect,
  handleMediaUpload,
  maxChars,
  questionNumber,
  onAddNextQuestion,
}: PollQuestionProps) => {
  return (
    <div className="space-y-3">
      <Textarea
        value={question}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) {
            onQuestionChange(e.target.value);
          }
        }}
        placeholder="Enter your question..."
        className="mb-2"
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
                onEmojiSelect={onEmojiSelect}
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
          {question.length}/{maxChars}
        </span>
      </div>

      {onAddNextQuestion && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNextQuestion}
          className="w-full mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Question {(questionNumber || 1) + 1}
        </Button>
      )}
    </div>
  );
};