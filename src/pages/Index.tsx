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
import { Eye, Send, RefreshCcw, ChevronRight, Info, StopCircle, Zap, History } from "lucide-react";

interface JourneyStep {
  id: string;
  description: string;
  timestamp: Date;
}

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [selectedAreaCode, setSelectedAreaCode] = useState("415");
  const [hasSelectedAudience, setHasSelectedAudience] = useState(false);
  const [stopPhrase, setStopPhrase] = useState<typeof STOP_PHRASES[number]>(STOP_PHRASES[0]);
  const { toast } = useToast();
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);

  const addJourneyStep = useCallback((description: string) => {
    setJourneySteps(steps => [...steps, {
      id: `step-${Date.now()}`,
      description,
      timestamp: new Date()
    }]);
  }, []);

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
            nds.map(node => {
              if (node.id === `message-${Date.now()}`) {
                const previewText = content.length > 30 
                  ? `${content.substring(0, 30)}...` 
                  : content;
                if (content) {
                  addJourneyStep(`Added message: "${previewText}"`);
                }
                return { ...node, data: { ...node.data, content } };
              }
              return node;
            })
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
  }, [nodes, setNodes, setEdges, deleteNode, addJourneyStep]);

  const handleTagSelect = useCallback((nodeId: string, tagId: string, segmentSize: number, parentAudienceName: string) => {
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode) return;

    const tagName = DEMOGRAPHIC_TAGS.find(t => t.id === tagId)?.name;
    addJourneyStep(`Segmented "${parentAudienceName}" by ${tagName}`);
    
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
  }, [nodes, setNodes, setEdges, addJourneyStep]);

  const handleAudienceChange = useCallback((nodeId: string, audienceIds: string[]) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          const totalContacts = AVAILABLE_AUDIENCES
            .filter(audience => audienceIds.includes(audience.id))
            .reduce((sum, audience) => sum + audience.contacts, 0);
          
          const selectedAudienceNames = AVAILABLE_AUDIENCES
            .filter(audience => audienceIds.includes(audience.id))
            .map(audience => audience.name)
            .join(", ");

          if (audienceIds.length > 0) {
            addJourneyStep(`Selected audience: ${selectedAudienceNames}`);
          }
          
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
  }, [setNodes, addJourneyStep]);

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
          actionTriggerIcon: <Zap className="h-4 w-4" />,
          actionTriggerText: "Action",
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
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-black">Flow Title</h2>
            <span className="text-sm text-gray-600">
              Auto-saved at {format(new Date(), "p 'on' PP")}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <History className="h-4 w-4" />
              User Journey
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {journeySteps.map((step) => (
                <div 
                  key={step.id}
                  className="text-sm text-gray-600 flex items-start gap-2"
                >
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{step.description}</span>
                </div>
              ))}
              {journeySteps.length === 0 && (
                <div className="text-sm text-gray-400 italic">
                  No actions taken yet
                </div>
              )}
            </div>
          </div>

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
          
          <div className="mt-2 flex items-center text-sm text-gray-900">
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
          </div>
        </Panel>
        
        <Panel position="top-right" className="flex gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
              <StopCircle className="h-4 w-4" /> Phrase:
            </span>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] bg-[#222222] text-white border-gray-700">
                <p>This message is automatically appended to all messages for proper compliance</p>
              </TooltipContent>
            </Tooltip>
            <Select 
              value={stopPhrase} 
              onValueChange={(value: typeof STOP_PHRASES[number]) => setStopPhrase(value)}
            >
              <SelectTrigger className="w-[200px] h-8">
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
