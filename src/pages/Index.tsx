import { useState, useCallback } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MessageNode from "@/components/FlowEditor/MessageNode";
import PollNode from "@/components/FlowEditor/PollNode";
import AudienceNode from "@/components/FlowEditor/AudienceNode";
import SequenceNode from "@/components/FlowEditor/SequenceNode";

const nodeTypes = {
  messageNode: MessageNode,
  pollNode: PollNode,
  audienceNode: AudienceNode,
  sequenceNode: SequenceNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'audienceNode',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Audience',
      contacts: 1000,
      onMessageCreate: () => console.log('create message'),
      onPollCreate: () => console.log('create poll'),
      onSegment: () => console.log('segment audience'),
    }
  }
];

const initialEdges = [];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Index;