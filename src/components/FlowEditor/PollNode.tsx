import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ListOrdered, ListCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PollOption } from "@/types/flow";

interface PollNodeProps {
  data: {
    question: string;
    options: PollOption[];
    onQuestionChange: (question: string) => void;
    onOptionsChange: (options: PollOption[]) => void;
    onDelete?: () => void;
  };
}

const PollNode = ({ data }: PollNodeProps) => {
  const [showAddOption, setShowAddOption] = useState(false);

  const addOption = () => {
    const newOption: PollOption = {
      id: `option-${data.options.length + 1}`,
      text: "",
      leadsTo: 'next' // Explicitly set as 'next' to match the PollOption type
    };
    data.onOptionsChange([...data.options, newOption]);
  };

  const updateOption = (id: string, text: string) => {
    const updatedOptions = data.options.map(opt =>
      opt.id === id ? { ...opt, text } : opt
    );
    data.onOptionsChange(updatedOptions);
  };

  const toggleOptionLeadsTo = (id: string) => {
    const updatedOptions = data.options.map(opt =>
      opt.id === id ? { ...opt, leadsTo: opt.leadsTo === 'next' ? 'complete' : 'next' } : opt
    );
    data.onOptionsChange(updatedOptions);
  };

  const removeOption = (id: string) => {
    const updatedOptions = data.options.filter(opt => opt.id !== id);
    data.onOptionsChange(updatedOptions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 min-w-[300px] border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-black">Poll Question</span>
        </div>
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

      <Textarea
        value={data.question}
        onChange={(e) => data.onQuestionChange(e.target.value)}
        placeholder="Enter your question..."
        className="mb-4"
      />

      <div className="space-y-3">
        {data.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <Badge variant="outline" className="min-w-[24px]">
              {index + 1}
            </Badge>
            <Textarea
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleOptionLeadsTo(option.id)}
              className="h-8 w-8"
            >
              <ListCheck className={`h-4 w-4 ${option.leadsTo === 'complete' ? 'text-green-500' : 'text-gray-500'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(option.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addOption}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Option
      </Button>

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