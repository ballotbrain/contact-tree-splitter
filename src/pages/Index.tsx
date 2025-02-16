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
import { Eye, Send, RefreshCcw, ChevronRight, Info, StopCircle, Plus, Users, Tag, Calendar, MapPin } from "lucide-react";
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
import { CustomNode, CustomEdge, AudienceNodeData } from "@/types/flow";
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
  { id: "csv1", name: "Import 1", contacts: 50000 },
  { id: "csv2", name: "Import 2", contacts: 75000 },
  { id: "csv3", name: "Import 3", contacts: 100000 },
  { id: "csv4", name: "Import 4", contacts: 85000 }
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
      onSegment: () => {},
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

  const handleTagSelect = useCallback((nodeId: string, tagId: string, segmentSize: number, audienceName: string) => {
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode) return;

    const segmentNode: CustomNode = {
      id: `segment-${Date.now()}`,
      type: 'audience',
      position: {
        x: parentNode.position.x,
        y: parentNode.position.y + 250
      },
      data: {
        label: `${audienceName} - ${DEMOGRAPHIC_TAGS.find(t => t.id === tagId)?.name}`,
        contacts: segmentSize,
        parentAudience: audienceName,
        segmentCriteria: DEMOGRAPHIC_TAGS.find(t => t.id === tagId)?.name || '',
        selectedAudiences: parentNode.data.selectedAudiences,
        selectedTags: [],
        onMessageCreate: () => createMessageNode(`segment-${Date.now()}`),
        onPollCreate: () => createPollNode(`segment-${Date.now()}`),
        onSegment: () => {},
        onDelete: () => deleteNode(`segment-${Date.now()}`),
        onAudienceChange: (audienceIds: string[]) => handleAudienceChange(`segment-${Date.now()}`, audienceIds),
      } as AudienceNodeData,
    };

    setNodes(nds => [...nds, segmentNode]);
    setEdges(eds => [...eds, {
      id: `e-${nodeId}-${segmentNode.id}`,
      source: nodeId,
      target: segmentNode.id,
      type: 'smoothstep',
    }]);
  }, [nodes, setNodes, setEdges, deleteNode]);

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
        areaCode: selectedAreaCode,
        onAreaCodeChange: setSelectedAreaCode,
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
      type: 'smoothstep',
    }]);
  }, [nodes, setNodes, setEdges, deleteNode, selectedAreaCode]);

  const handleAudienceChange = useCallback((nodeId: string, audienceIds: string[]) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          const totalContacts = AVAILABLE_AUDIENCES
            .filter(audience => audienceIds.includes(audience.id))
            .reduce((sum, audience) => sum + Number(audience.contacts), 0);
          
          setHasSelectedAudience(audienceIds.length > 0);
          
          return {
            ...node,
            data: {
              ...node.data,
              selectedAudiences: audienceIds,
              contacts: totalContacts,
              onSegment: () => {
                const dialog = document.createElement('dialog');
                dialog.className = 'fixed inset-0 z-50 bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mt-20';
                dialog.innerHTML = `
                  <div class="w-full">
                    <h2 class="text-xl font-semibold mb-6">Select Demographic Tag</h2>
                    <div class="space-y-3">
                      ${DEMOGRAPHIC_TAGS.map(tag => {
                        let icon;
                        if (tag.id.startsWith('age')) {
                          icon = `<svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
                        } else if (tag.id.startsWith('gender')) {
                          icon = `<svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                        } else {
                          icon = `<svg class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
                        }
                        return `
                          <button 
                            class="w-full flex items-center justify-between p-4 text-left rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                            onclick="window.handleTagSelect('${nodeId}', '${tag.id}', ${Number(tag.segmentSize)}, '${node.data.label}')"
                          >
                            <div class="flex items-center gap-3">
                              ${icon}
                              <span class="font-medium text-gray-900">${tag.name}</span>
                            </div>
                            <span class="text-sm text-gray-500">
                              ${Number(tag.segmentSize).toLocaleString()} contacts
                            </span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
                
                const backdrop = document.createElement('div');
                backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 transition-opacity';
                backdrop.onclick = () => {
                  dialog.close();
                  dialog.remove();
                  backdrop.remove();
                };
                
                document.body.appendChild(backdrop);
                document.body.appendChild(dialog);
                dialog.showModal();

                window.handleTagSelect = (nodeId: string, tagId: string, segmentSize: number, audienceName: string) => {
                  handleTagSelect(nodeId, tagId, segmentSize, audienceName);
                  dialog.close();
                  dialog.remove();
                  backdrop.remove();
                };
              },
              onMessageCreate: () => createMessageNode(nodeId),
              onPollCreate: () => createPollNode(nodeId),
              onDelete: node.id !== "1" ? () => deleteNode(node.id) : undefined,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes, createMessageNode, createPollNode, handleTagSelect, deleteNode]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setHasSelectedAudience(false);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const calculateTotalCost = useCallback(() => {
    const messageNodes = nodes.filter(node => node.type === 'message');
    let totalCost = 0;
    let smsCount = 0;
    let mmsImageCount = 0;
    let mmsVideoCount = 0;

    messageNodes.forEach(node => {
      const parentEdge = edges.find(edge => edge.target === node.id);
      if (!parentEdge) return;

      const parentNode = nodes.find(n => n.id === parentEdge.source);
      if (!parentNode || !parentNode.data) return;

      const contacts = Number(parentNode.data.contacts) || 0;
      const content = (node.data?.content as string) || '';
      
      const hasVideo = content.includes('[Video]');
      const hasImage = content.includes('[Media]') && !hasVideo;

      if (hasVideo) {
        mmsVideoCount += contacts;
        totalCost += contacts * 0.065;
      } else if (hasImage) {
        mmsImageCount += contacts;
        totalCost += contacts * 0.06;
      } else {
        smsCount += contacts;
        totalCost += contacts * 0.03;
      }
    });

    const formatNumber = (num: number) => num.toLocaleString();

    return {
      total: totalCost.toFixed(2),
      smsCount: formatNumber(smsCount),
      mmsImageCount: formatNumber(mmsImageCount),
      mmsVideoCount: formatNumber(mmsVideoCount),
      breakdown: {
        sms: (Number(smsCount) > 0 ? `SMS (${formatNumber(smsCount)}): $${(Number(smsCount) * 0.03).toFixed(2)}` : null),
        mmsImage: (Number(mmsImageCount) > 0 ? `Image MMS (${formatNumber(mmsImageCount)}): $${(Number(mmsImageCount) * 0.06).toFixed(2)}` : null),
        mmsVideo: (Number(mmsVideoCount) > 0 ? `Video MMS (${formatNumber(mmsVideoCount)}): $${(Number(mmsVideoCount) * 0.065).toFixed(2)}` : null)
      }
    };
  }, [nodes, edges]);

  const costs = calculateTotalCost();

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
          onSegment: node.data.onSegment,
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
          areaCode: selectedAreaCode,
          onAreaCodeChange: setSelectedAreaCode,
          onDelete: () => deleteNode(node.id),
          onAddNextQuestion: () => createPollNode(node.id),
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
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-900">
              <ChevronRight className="h-4 w-4" />
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
              <div className="flex items-center text-sm text-gray-900">
                <ChevronRight className="h-4 w-4" />
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
            {(costs.smsCount > 0 || costs.mmsImageCount > 0 || costs.mmsVideoCount > 0) && (
              <div className="mt-4 p-3 bg-neutral-50 rounded-md border border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Estimated Costs</h3>
                <div className="space-y-1 text-sm text-neutral-600">
                  {costs.breakdown.sms && <p>{costs.breakdown.sms}</p>}
                  {costs.breakdown.mmsImage && <p>{costs.breakdown.mmsImage}</p>}
                  {costs.breakdown.mmsVideo && <p>{costs.breakdown.mmsVideo}</p>}
                  <p className="text-neutral-900 font-medium pt-1 border-t border-neutral-200">
                    Total: ${costs.total}
                  </p>
                </div>
              </div>
            )}
          </div>
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

declare global {
  interface Window {
    handleTagSelect: (nodeId: string, tagId: string, segmentSize: number, audienceName: string) => void;
  }
}

export default Index;