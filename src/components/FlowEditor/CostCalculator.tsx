import { CustomNode } from "@/types/flow";

interface CostCalculatorProps {
  nodes: CustomNode[];
  edges: any[];
}

export const CostCalculator = ({ nodes, edges }: CostCalculatorProps) => {
  const calculateTotalCost = () => {
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
  };

  const costs = calculateTotalCost();

  return (
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
  );
};