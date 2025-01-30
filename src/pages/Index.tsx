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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CustomNode, CustomEdge } from "@/types/flow";

const nodeTypes = {
  audience: AudienceNode,
  message: MessageNode,
  sequence: SequenceNode,
};

const initialNodes: CustomNode[] = [
  {
    id: "1",
    type: "audience",
    position: { x: 400, y: 100 },
    data: { 
      label: "All Contacts",
      contacts: 100,
    },
  },
];

const AREA_CODES = ["415", "628", "510"];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const { toast } = useToast();
  const [selectedAreaCode, setSelectedAreaCode] = useState(AREA_CODES[0]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handlePreview = useCallback(() => {
    toast({
      title: "Preview Mode",
      description: "Preview functionality will be implemented here",
    });
  }, [toast]);

  const handleSubmit = useCallback(() => {
    toast({
      title: "Flow Submitted",
      description: "Your message flow has been submitted successfully",
    });
  }, [toast]);

  const handleSegment = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const maleNode: CustomNode = {
      id: `${nodeId}-male`,
      type: "audience",
      position: { x: node.position.x - 200, y: node.position.y + 200 },
      data: { 
        label: "Male Contacts",
        contacts: Math.floor((node.data as any).contacts * 0.6),
      },
    };

    const femaleNode: CustomNode = {
      id: `${nodeId}-female`,
      type: "audience",
      position: { x: node.position.x + 200, y: node.position.y + 200 },
      data: { 
        label: "Female Contacts",
        contacts: Math.floor((node.data as any).contacts * 0.4),
      },
    };

    const maleMessageNode: CustomNode = {
      id: `${nodeId}-male-message`,
      type: "message",
      position: { x: maleNode.position.x, y: maleNode.position.y + 200 },
      data: {
        content: "",
        onChange: (content: string) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === `${nodeId}-male-message`
                ? { ...n, data: { ...n.data, content } }
                : n
            )
          );
        },
        onDelete: () => handleDeleteBranch(`${nodeId}-male`),
      },
    };

    const femaleMessageNode: CustomNode = {
      id: `${nodeId}-female-message`,
      type: "message",
      position: { x: femaleNode.position.x, y: femaleNode.position.y + 200 },
      data: {
        content: "",
        onChange: (content: string) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === `${nodeId}-female-message`
                ? { ...n, data: { ...n.data, content } }
                : n
            )
          );
        },
        onDelete: () => handleDeleteBranch(`${nodeId}-female`),
      },
    };

    setNodes((nds) => [...nds, maleNode, femaleNode, maleMessageNode, femaleMessageNode]);
    setEdges((eds) => [
      { 
        id: `${nodeId}-male-edge`,
        source: nodeId,
        target: `${nodeId}-male`,
        animated: true,
      },
      {
        id: `${nodeId}-female-edge`,
        source: nodeId,
        target: `${nodeId}-female`,
        animated: true,
      },
      {
        id: `${nodeId}-male-message-edge`,
        source: `${nodeId}-male`,
        target: `${nodeId}-male-message`,
        animated: true,
      },
      {
        id: `${nodeId}-female-message-edge`,
        source: `${nodeId}-female`,
        target: `${nodeId}-female-message`,
        animated: true,
      },
    ]);
  }, [nodes, setNodes, setEdges]);

  const handleDeleteBranch = useCallback((branchId: string) => {
    setNodes((nds) => nds.filter((n) => !n.id.startsWith(branchId)));
    setEdges((eds) => eds.filter((e) => 
      !e.source.startsWith(branchId) && !e.target.startsWith(branchId)
    ));

    toast({
      title: "Branch Deleted",
      description: "The selected branch and its connected nodes have been removed.",
    });
  }, [setNodes, setEdges, toast]);

  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === "audience") {
      return {
        ...node,
        data: {
          ...node.data,
          onSegment: () => handleSegment(node.id),
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
