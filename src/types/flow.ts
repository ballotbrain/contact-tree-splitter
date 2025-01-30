import { Node, Edge } from "@xyflow/react";

export interface Tag {
  id: string;
  name: string;
}

export interface AudienceNodeData extends Record<string, unknown> {
  label: string;
  contacts: number;
  tags?: Tag[];
  selectedTags?: string[];
  onSegment?: () => void;
  onMessageCreate?: () => void;
  onPollCreate?: () => void;
  onTagSelect?: (tagId: string) => void;
  onAudienceChange?: (audienceId: string) => void;
}

export interface MessageNodeData extends Record<string, unknown> {
  content: string;
  onChange: (content: string) => void;
  onDelete?: () => void;
  areaCode?: string;
  onAreaCodeChange?: (code: string) => void;
  scheduledTime?: Date;
  onScheduleChange?: (date: Date) => void;
}

export interface SequenceNodeData extends Record<string, unknown> {
  label: string;
  delay: string;
}

export interface PollOption {
  id: string;
  text: string;
  leadsTo: 'next' | 'complete';
}

export interface PollNodeData extends Record<string, unknown> {
  question: string;
  options: PollOption[];
  onQuestionChange: (question: string) => void;
  onOptionsChange: (options: PollOption[]) => void;
  onDelete?: () => void;
}

export type CustomNodeData = AudienceNodeData | MessageNodeData | SequenceNodeData | PollNodeData;

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;