import { CustomNode } from "@/types/flow";

export const initialNodes: CustomNode[] = [
  {
    id: "1",
    type: "audience",
    position: { x: 250, y: 100 },
    data: {
      label: "Select Audience",
      contacts: 0,
      selectedAudiences: [],
    },
  },
];