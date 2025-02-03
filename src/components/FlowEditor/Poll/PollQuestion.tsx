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
        className="mb-2 focus:border-black focus:ring-1 focus:ring-black"
        style={{ 
          caretColor: '#000000'
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
                onEmojiSelect={onEmojiSelect}
                theme="light"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <span>
          {question.length}/{maxChars}
        </span>
      </div>

      {/* Media Gallery */}
      <div className="grid grid-cols-4 gap-2 my-4">
        {placeholderMedia.map((media, index) => (
          <div
            key={index}
            onClick={handleMediaUpload}
            className="relative cursor-pointer group"
          >
            <img
              src={media.thumbnail}
              alt={`Media ${index + 1}`}
              className="w-full h-20 object-cover rounded-md border border-gray-200 transition-all duration-200 group-hover:border-black"
            />
            {media.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}
        {/* Add Media Button */}
        <div 
          onClick={handleMediaUpload}
          className="relative cursor-pointer group border-2 border-dashed border-gray-300 rounded-md h-20 flex items-center justify-center hover:border-gray-400 transition-colors"
        >
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-500" />
        </div>
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