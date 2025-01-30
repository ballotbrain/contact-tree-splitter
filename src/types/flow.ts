import { Node, Edge } from "@xyflow/react";

export interface AudienceNodeData {
  label: string;
  contacts: number;
  onSegment?: () => void;
}

export interface MessageNodeData {
  content: string;
  onChange: (content: string) => void;
  onDelete?: () => void;
}

export interface SequenceNodeData {
  label: string;
  delay: string;
}

export type CustomNodeData = AudienceNodeData | MessageNodeData | SequenceNodeData;

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;