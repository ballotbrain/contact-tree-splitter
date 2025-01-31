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
import { Eye, Send, RefreshCcw, ChevronRight } from "lucide-react";

import AudienceNode from "@/components/FlowEditor/AudienceNode";
import MessageNode from "@/components/FlowEditor/MessageNode";
import SequenceNode from "@/components/FlowEditor/SequenceNode";
import PollNode from "@/components/FlowEditor/PollNode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CustomNode, CustomEdge } from "@/types/flow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const nodeTypes = {
  audience: AudienceNode,
  message: MessageNode,
  sequence: SequenceNode,
  poll: PollNode,
};

const DEMOGRAPHIC_TAGS = [
  { id: "age_18_24", name: "Age 18-24", segmentSize: 15000 },
  { id: "age_25_34", name: "Age 25-34", segmentSize: 25000 },
  { id: "age_35_plus", name: "Age 35+", segmentSize: 30000 },
  { id: "gender_male", name: "Male", segmentSize: 35000 },
  { id: "gender_female", name: "Female", segmentSize: 35000 },
  { id: "location_urban", name: "Urban", segmentSize: 40000 },
  { id: "location_rural", name: "Rural", segmentSize: 30000 }
];

const AVAILABLE_AUDIENCES = [
  { id: "csv1", name: "CSV Import 1", contacts: 50000 },
  { id: "csv2", name: "CSV Import 2", contacts: 75000 },
  { id: "csv3", name: "CSV Import 3", contacts: 100000 },
  { id: "csv4", name: "CSV Import 4", contacts: 85000 }
];

const initialNodes: CustomNode[] = [
  {
    id: "1",
    type: "audience",
    position: { x: 400, y: 100 },
    data: { 
      label: "HD40 Universe",
      contacts: 100000,
      selectedTags: [],
      selectedAudiences: [],
      onMessageCreate: () => {},
      onPollCreate: () => {},
    },
  },
];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [selectedAreaCode, setSelectedAreaCode] = useState("415");
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getChildNodes = useCallback((nodeId: string): string[] => {
    const childEdges = edges.filter(edge => edge.source === nodeId);
    const childIds = childEdges.map(edge => edge.target);
    const descendantIds: string[] = [];
    
    childIds.forEach(childId => {
      descendantIds.push(childId);
      descendantIds.push(...getChildNodes(childId));
    });
    
    return descendantIds;
  }, [edges]);

  const deleteNode = useCallback((nodeId: string) => {
    const nodesToDelete = [nodeId, ...getChildNodes(nodeId)];
    
    setNodes(nds => nds.filter(node => !nodesToDelete.includes(node.id)));
    setEdges(eds => eds.filter(edge => 
      !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
    ));
  }, [getChildNodes, setNodes, setEdges]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    toast({
      title: "Flow Reset",
      description: "The flow has been reset to its initial state",
    });
  }, [setNodes, setEdges, toast]);

  const createMessageNode = useCallback((sourceId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    const newNode: CustomNode = {
      id: `message-${Date.now()}`,
      type: 'message',
      position: { 
        x: sourceNode.position.x, 
        y: sourceNode.position.y + 250
      },
      data: {
        content: '',
        onChange: (content: string) => {
          setNodes(nds => 
            nds.map(node => 
              node.id === `message-${Date.now()}` 
                ? { ...node, data: { ...node.data, content } }
                : node
            )
          );
        },
        onDelete: () => deleteNode(`message-${Date.now()}`),
      },
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, { 
      id: `e-${sourceId}-${newNode.id}`,
      source: sourceId,
      target: newNode.id,
    }]);
  }, [nodes, setNodes, setEdges, deleteNode]);

  const handleTagSelect = useCallback((nodeId: string, tagId: string, segmentSize: number, parentAudienceName: string) => {
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode) return;

    const tagName = DEMOGRAPHIC_TAGS.find(t => t.id === tagId)?.name;
    
    const segmentNode: CustomNode = {
      id: `segment-${Date.now()}`,
      type: 'audience',
      position: { 
        x: parentNode.position.x, 
        y: parentNode.position.y + 250
      },
      data: {
        label: `${parentAudienceName} - ${tagName}`,
        contacts: segmentSize,
        parentAudience: parentAudienceName,
        segmentCriteria: tagName,
        onMessageCreate: () => createMessageNode(`segment-${Date.now()}`),
        onPollCreate: () => createPollNode(`segment-${Date.now()}`),
      },
    };

    setNodes(nds => [...nds, segmentNode]);
    setEdges(eds => [...eds, {
      id: `e-${nodeId}-${segmentNode.id}`,
      source: nodeId,
      target: segmentNode.id,
      type: 'smoothstep',
    }]);
  }, [nodes, setNodes, setEdges]);

  const handleAudienceChange = useCallback((nodeId: string, audienceIds: string[]) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          const totalContacts = AVAILABLE_AUDIENCES
            .filter(audience => audienceIds.includes(audience.id))
            .reduce((sum, audience) => sum + audience.contacts, 0);
          
          return {
            ...node,
            data: {
              ...node.data,
              selectedAudiences: audienceIds,
              contacts: totalContacts,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const createPollNode = useCallback((sourceId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId);
    if (!sourceNode) return;

    const existingPollNodes = nodes.filter(n => n.type === 'poll');
    const questionNumber = existingPollNodes.length + 1;

    const newNode: CustomNode = {
      id: `poll-${Date.now()}`,
      type: 'poll',
      position: { 
        x: sourceNode.position.x, 
        y: sourceNode.position.y + 250
      },
      data: {
        question: '',
        options: [],
        questionNumber,
        onQuestionChange: (question: string) => {
          setNodes(nds => 
            nds.map(node => 
              node.id === `poll-${Date.now()}`
                ? { ...node, data: { ...node.data, question } }
                : node
            )
          );
        },
        onOptionsChange: (options: any[]) => {
          setNodes(nds => 
            nds.map(node => 
              node.id === `poll-${Date.now()}`
                ? { ...node, data: { ...node.data, options } }
                : node
            )
          );
        },
        onDelete: () => deleteNode(`poll-${Date.now()}`),
        onAddNextQuestion: () => {
          createPollNode(`poll-${Date.now()}`);
        },
      },
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, { 
      id: `e-${sourceId}-${newNode.id}`,
      source: sourceId,
      target: newNode.id,
    }]);
  }, [nodes, setNodes, setEdges, deleteNode]);

  const nodesWithHandlers = nodes.map((node) => {
    if (node.type === "audience") {
      return {
        ...node,
        data: {
          ...node.data,
          onTagSelect: (tagId: string, segmentSize: number, audienceName: string) => 
            handleTagSelect(node.id, tagId, segmentSize, audienceName),
          onMessageCreate: () => createMessageNode(node.id),
          onPollCreate: () => createPollNode(node.id),
          onAudienceChange: (audienceIds: string[]) => handleAudienceChange(node.id, audienceIds),
          onDelete: node.id !== "1" ? () => deleteNode(node.id) : undefined,
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
          onDelete: () => deleteNode(node.id),
        },
      };
    }
    if (node.type === "poll") {
      return {
        ...node,
        data: {
          ...node.data,
          onDelete: () => deleteNode(node.id),
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
            Saved at {format(new Date(), "p 'on' PP")}
          </p>
          <div className="mt-3 flex items-center text-sm text-blue-600">
            <ChevronRight className="h-4 w-4 animate-bounce" />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="cursor-help">Start by selecting your audience</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                <p>Click the dropdown in the audience node to choose your target audience</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </Panel>
        <Panel position="top-right" className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetFlow}
            className="bg-white text-black border-gray-200 hover:bg-gray-50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              toast({
                title: "Preview Mode",
                description: "Preview functionality will be implemented here",
              });
            }}
            className="bg-white text-black border-gray-200 hover:bg-gray-50"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={() => {
              toast({
                title: "Flow Submitted",
                description: "Your flow has been submitted successfully",
              });
            }}
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
