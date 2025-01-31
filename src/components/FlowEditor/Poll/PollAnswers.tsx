import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SmilePlus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PollOption } from "@/types/flow";

interface PollAnswersProps {
  options: PollOption[];
  labelType: "numerical" | "alphabetical";
  onLabelTypeChange: (value: "numerical" | "alphabetical") => void;
  updateOption: (id: string, text: string) => void;
  toggleOptionLeadsTo: (id: string) => void;
}

export const PollAnswers = ({
  options,
  labelType,
  onLabelTypeChange,
  updateOption,
  toggleOptionLeadsTo,
}: PollAnswersProps) => {
  const getOptionLabel = (index: number) => {
    if (labelType === "numerical") {
      return `${index + 1} =`;
    } else {
      return String.fromCharCode(65 + index) + " =";
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="absolute -left-8 top-1/2 w-8 h-[2px] bg-gray-200"></div>
      
      <div className="mb-4">
        <Label className="text-sm font-medium">Label Type:</Label>
        <RadioGroup
          value={labelType}
          onValueChange={(value) => onLabelTypeChange(value as "numerical" | "alphabetical")}
          className="flex gap-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="numerical" id="numerical" />
            <Label htmlFor="numerical">Numerical</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="alphabetical" id="alphabetical" />
            <Label htmlFor="alphabetical">Alphabetical</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={option.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="min-w-[40px] text-gray-400 font-medium">
                {getOptionLabel(index)}
              </span>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <Textarea
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder="Enter answer"
                  className="bg-white border-0 focus-visible:ring-0"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <SmilePlus className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={option.leadsTo === "next"}
                      onCheckedChange={() => toggleOptionLeadsTo(option.id)}
                    />
                    <span className="text-sm text-gray-500">Continue to next question</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};