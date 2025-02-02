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
import { Eye, Send, RefreshCcw, ChevronRight, Info, StopCircle, Plus } from "lucide-react";
import PreviewDialog from "@/components/PreviewDialog";

import AudienceNode from "@/components/FlowEditor/AudienceNode";
import MessageNode from "@/components/FlowEditor/MessageNode";
import SequenceNode from "@/components/FlowEditor/SequenceNode";
import PollNode from "@/components/FlowEditor/PollNode";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STOP_PHRASES = [
  "Reply STOP to opt out",
  "Reply STOP to cancel",
  "STOP 2 END",
  "Reply STOP to unsubscribe"
] as const;

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
  const [hasSelectedAudience, setHasSelectedAudience] = useState(false);
  const [stopPhrase, setStopPhrase] = useState<typeof STOP_PHRASES[number]>(STOP_PHRASES[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
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
          
          setHasSelectedAudience(audienceIds.length > 0);
          
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
          <h2 className="text-xl font-semibold text-black mb-1">Flow Title</h2>
          <p className="text-sm text-gray-600">
            Auto-saved at {format(new Date(), "p 'on' PP")}
          </p>
          <div className="mt-3 flex items-center text-sm text-gray-900">
            <ChevronRight className="h-4 w-4 animate-bounce" />
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="cursor-help">Start by selecting your audience</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] bg-[#222222] text-white border-gray-700">
                <p>Click the dropdown in the audience node to choose your target audience</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {hasSelectedAudience && (
            <div className="mt-2 flex items-center text-sm text-gray-900">
              <ChevronRight className="h-4 w-4 animate-bounce" />
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <span className="cursor-help">Choose your next action</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] bg-[#222222] text-white border-gray-700">
                  <p>You can now:</p>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Segment your audience by demographics</li>
                    <li>Create a message to send</li>
                    <li>Create a poll to gather feedback</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </Panel>
        <Panel position="top-right" className="flex gap-2">
          <div className="flex items-center gap-2 bg-white px-3 rounded-lg border border-gray-200 h-10">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
              <StopCircle className="h-4 w-4 text-[#ea384c]" /> Phrase:
            </span>
            <Select 
              value={stopPhrase} 
              onValueChange={(value: typeof STOP_PHRASES[number]) => setStopPhrase(value)}
            >
              <SelectTrigger className="w-[200px] border-0 h-8 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOP_PHRASES.map((phrase) => (
                  <SelectItem key={phrase} value={phrase}>
                    {phrase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={resetFlow}
            className="bg-white text-black border-gray-200 hover:bg-gray-50 w-[120px] h-10"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPreviewOpen(true)}
            className="bg-white text-black border-gray-200 hover:bg-gray-50 w-[120px] h-10"
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
            className="bg-black text-white hover:bg-gray-900 w-[120px] h-10"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </Panel>
      </ReactFlow>
      <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
};

export default Index;
