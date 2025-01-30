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

import AudienceNode from "@/components/FlowEditor/AudienceNode";
import MessageNode from "@/components/FlowEditor/MessageNode";
import SequenceNode from "@/components/FlowEditor/SequenceNode";
import { useToast } from "@/components/ui/use-toast";

const nodeTypes = {
  audience: AudienceNode,
  message: MessageNode,
  sequence: SequenceNode,
};

const initialNodes = [
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

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSegment = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const maleNode = {
      id: `${nodeId}-male`,
      type: "audience",
      position: { x: node.position.x - 200, y: node.position.y + 200 },
      data: { 
        label: "Male Contacts",
        contacts: Math.floor(node.data.contacts * 0.6),
      },
    };

    const femaleNode = {
      id: `${nodeId}-female`,
      type: "audience",
      position: { x: node.position.x + 200, y: node.position.y + 200 },
      data: { 
        label: "Female Contacts",
        contacts: Math.floor(node.data.contacts * 0.4),
      },
    };

    setNodes((nds) => [...nds, maleNode, femaleNode]);
    setEdges((eds) => [
      ...eds,
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
    ]);

    // Add message nodes for each segment
    const maleMessageNode = {
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

    const femaleMessageNode = {
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

    setNodes((nds) => [...nds, maleMessageNode, femaleMessageNode]);
    setEdges((eds) => [
      ...eds,
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
    // Delete all nodes and edges connected to this branch
    setNodes((nds) => nds.filter((n) => !n.id.startsWith(branchId)));
    setEdges((eds) => eds.filter((e) => 
      !e.source.startsWith(branchId) && !e.target.startsWith(branchId)
    ));

    toast({
      title: "Branch Deleted",
      description: "The selected branch and its connected nodes have been removed.",
    });
  }, [setNodes, setEdges, toast]);

  // Update nodes with segmentation handler
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
    return node;
  });

  return (
    <div className="w-full h-screen bg-slate-50">
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
          <h2 className="text-lg font-semibold mb-2">Flow Builder</h2>
          <p className="text-sm text-gray-600">
            Build your message flow by connecting nodes
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Index;