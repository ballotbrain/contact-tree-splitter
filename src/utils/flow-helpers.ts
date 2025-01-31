import { CustomNode } from "@/types/flow";

export const createPollNode = (sourceId: string): CustomNode => {
  const sourceNode = document.querySelector(`[data-id="${sourceId}"]`);
  const sourceRect = sourceNode?.getBoundingClientRect();
  
  return {
    id: `poll-${Date.now()}`,
    type: 'poll',
    position: { 
      x: sourceRect ? sourceRect.x : 0,
      y: sourceRect ? sourceRect.y + 250 : 0
    },
    data: {
      question: '',
      options: [],
      onQuestionChange: () => {},
      onOptionsChange: () => {},
    },
  };
};