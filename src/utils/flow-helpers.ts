import { CustomNode } from "@/types/flow";

export const createPollNode = (sourceId: string): CustomNode => {
  return {
    id: `poll-${Date.now()}`,
    type: 'poll',
    position: { x: 0, y: 0 }, // Position will be set relative to source node
    data: {
      question: '',
      options: [],
      onQuestionChange: () => {},
      onOptionsChange: () => {},
    },
  };
};