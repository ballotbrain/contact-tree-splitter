import { PollOption } from "@/types/flow";
import { toast } from "@/components/ui/use-toast";

export const DEFAULT_OPTIONS: PollOption[] = [
  { id: "1", text: "", leadsTo: "next" },
  { id: "2", text: "", leadsTo: "next" },
  { id: "3", text: "", leadsTo: "next" }
];

export const addNewOption = (currentOptions: PollOption[]): PollOption[] => {
  const newOption: PollOption = {
    id: `${Date.now()}`,
    text: "",
    leadsTo: "next"
  };
  return [...currentOptions, newOption];
};

export const deleteOption = (options: PollOption[], id: string): PollOption[] | null => {
  if (options.length <= 1) {
    toast({
      title: "Cannot Delete",
      description: "You must have at least one answer option",
      variant: "destructive",
    });
    return null;
  }
  return options.filter(opt => opt.id !== id);
};

export const updateOption = (options: PollOption[], id: string, text: string): PollOption[] => {
  return options.map(opt =>
    opt.id === id ? { ...opt, text } : opt
  );
};

export const toggleOptionLeadsTo = (options: PollOption[], id: string): PollOption[] => {
  return options.map(opt =>
    opt.id === id ? { ...opt, leadsTo: opt.leadsTo === "next" ? "complete" : "next" } : opt
  );
};