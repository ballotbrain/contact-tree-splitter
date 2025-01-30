import { Node, Edge } from "@xyflow/react";

export interface AudienceNodeData extends Record<string, unknown> {
  label: string;
  contacts: number;
  onSegment?: () => void;
}

export interface MessageNodeData extends Record<string, unknown> {
  content: string;
  onChange: (content: string) => void;
  onDelete?: () => void;
  areaCode?: string;
  onAreaCodeChange?: (code: string) => void;
}

export interface SequenceNodeData extends Record<string, unknown> {
  label: string;
  delay: string;
}

export type CustomNodeData = AudienceNodeData | MessageNodeData | SequenceNodeData;

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;