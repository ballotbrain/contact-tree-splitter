import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { format } from "date-fns";
import { Eye, Send, RefreshCcw, ChevronRight, Info } from "lucide-react";
import PreviewDialog from "@/components/PreviewDialog";
import { useFlowNodes } from "@/hooks/useFlowNodes";
import { CostCalculator } from "@/components/FlowEditor/CostCalculator";
import { nodeTypes, STOP_PHRASES } from "@/constants/flowData";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const [selectedAreaCode, setSelectedAreaCode] = useState("415");
  const [hasSelectedAudience, setHasSelectedAudience] = useState(false);
  const [stopPhrase, setStopPhrase] = useState<typeof STOP_PHRASES[number]>(STOP_PHRASES[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleTagSelect,
    handleAudienceChange,
    createMessageNode,
    createPollNode,
    deleteNode,
  } = useFlowNodes();

  const resetFlow = () => {
    window.location.reload();
  };

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
          onAudienceChange: (audienceIds: string[]) => {
            setHasSelectedAudience(audienceIds.length > 0);
            handleAudienceChange(node.id, audienceIds);
          },
          onDelete: node.id !== "1" ? () => deleteNode(node.id) : undefined,
        },
      };
    }
    if (node.type === "message" || node.type === "poll") {
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
            <CostCalculator nodes={nodes} edges={edges} />
          </div>
        </Panel>
        <Panel position="top-right" className="flex gap-2">
          <div className="flex items-center gap-2 bg-white px-3 rounded-lg border border-gray-200 h-10">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
              <Info className="h-4 w-4" /> Stop Phrase:
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