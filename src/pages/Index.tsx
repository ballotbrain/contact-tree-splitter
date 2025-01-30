import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { format } from "date-fns";
import { Eye, Send } from "lucide-react";

import AudienceNode from "@/components/FlowEditor/AudienceNode";
import MessageNode from "@/components/FlowEditor/MessageNode";
import SequenceNode from "@/components/FlowEditor/SequenceNode";
import PollNode from "@/components/FlowEditor/PollNode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CustomNode, CustomEdge } from "@/types/flow";

const nodeTypes = {
  audience: AudienceNode,
  message: MessageNode,
  sequence: SequenceNode,
  poll: PollNode,
};

const mockTags = [
  { id: "1", name: "VIP" },
  { id: "2", name: "New Customer" },
  { id: "3", name: "Inactive" },
];

const initialNodes: CustomNode[] = [
  {
    id: "1",
    type: "audience",
    position: { x: 400, y: 100 },
    data: { 
      label: "All Contacts",
      contacts: 100,
      selectedTags: [],
    },
  },
];

const AREA_CODES = ["415", "628", "510"];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const { toast } = useToast();

  const handleAudienceChange = useCallback((nodeId: string, audienceId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const audienceMap: Record<string, { label: string; contacts: number }> = {
            csv1: { label: "CSV Import 1", contacts: 150 },
            csv2: { label: "CSV Import 2", contacts: 200 },
            csv3: { label: "CSV Import 3", contacts: 300 },
            csv4: { label: "CSV Import 4", contacts: 250 },
          };

          return {
            ...node,
            data: {
              ...node.data,
              label: audienceMap[audienceId].label,
              contacts: audienceMap[audienceId].contacts,
            },
          };
        }
        return node;
      })
    );

    toast({
      title: "Audience Updated",
      description: "The audience segment has been updated successfully.",
    });
  }, [setNodes, toast]);

  const handleTagSelect = useCallback((nodeId: string, tagId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const selectedTags = node.data.selectedTags || [];
          const newSelectedTags = selectedTags.includes(tagId)
            ? selectedTags.filter((id) => id !== tagId)
            : [...selectedTags, tagId];
          
          return {
            ...node,
            data: {
              ...node.data,
              selectedTags: newSelectedTags,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === "audience") {
      return {
        ...node,
        data: {
          ...node.data,
          onTagSelect: (tagId: string) => handleTagSelect(node.id, tagId),
          onMessageCreate: () => createMessageNode(node.id),
          onPollCreate: () => createPollNode(node.id),
          onAudienceChange: (audienceId: string) => handleAudienceChange(node.id, audienceId),
        },
      };
    }
    if (node.type === "message") {
      return {
        ...node,
        data: {
          ...node.data,
          areaCode: selectedAreaCode,
          onAreaCodeChange: setSelectedAreaCode,
        },
      };
    }
    return node;
  });

  return (
    <div className="w-full h-screen bg-white">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-black mb-1">Campaign Flow</h2>
          <p className="text-sm text-gray-600">
            Saved at {format(new Date(), "'at' p zzz 'on' PPP")}
          </p>
        </Panel>
        <Panel position="top-right" className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            className="bg-white text-black border-gray-200 hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-black text-white hover:bg-gray-900"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Index;
