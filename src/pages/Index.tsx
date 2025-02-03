import { useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
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

const Index = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
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