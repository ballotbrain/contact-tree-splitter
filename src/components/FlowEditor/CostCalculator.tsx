import { CustomNode, CustomEdge } from "@/types/flow";
import { MessageNodeData, PollNodeData } from "@/types/flow";

interface CostCalculatorProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export const CostCalculator = ({ nodes, edges }: CostCalculatorProps) => {
  const messageNodes = nodes.filter(node => node.type === 'message');
  const pollNodes = nodes.filter(node => node.type === 'poll');

  const calculateMessageCost = (node: CustomNode) => {
    if (node.type !== 'message') return 0;
    const messageData = node.data as MessageNodeData;
    return messageData.content ? messageData.content.length * 0.01 : 0;
  };

  const calculatePollCost = (node: CustomNode) => {
    if (node.type !== 'poll') return 0;
    const pollData = node.data as PollNodeData;
    return pollData.options ? pollData.options.length * 0.05 : 0;
  };

  const totalMessageCost = messageNodes.reduce((acc, node) => acc + calculateMessageCost(node), 0);
  const totalPollCost = pollNodes.reduce((acc, node) => acc + calculatePollCost(node), 0);
  const totalCost = totalMessageCost + totalPollCost;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium text-gray-900">Estimated Cost</h3>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-600">
          Messages: ${totalMessageCost.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          Polls: ${totalPollCost.toFixed(2)}
        </p>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            Total: ${totalCost.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};