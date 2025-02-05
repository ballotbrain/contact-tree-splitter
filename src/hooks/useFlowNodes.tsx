import { useState, useCallback } from "react";
import { Connection, useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import { CustomNode, CustomEdge, AudienceNodeData } from "@/types/flow";
import { useToast } from "@/hooks/use-toast";
import { DEMOGRAPHIC_TAGS, AVAILABLE_AUDIENCES } from "@/constants/flowData";

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

export const useFlowNodes = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
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
        selectedAudiences: parentNode.data.selectedAudiences as string[],
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

    toast({
      title: "Segment Created",
      description: `Created segment for ${DEMOGRAPHIC_TAGS.find(t => t.id === tagId)?.name}`,
    });
  }, [nodes, setNodes, setEdges, deleteNode, toast]);

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
      },
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, { 
      id: `e-${sourceId}-${newNode.id}`,
      source: sourceId,
      target: newNode.id,
      type: 'smoothstep',
    }]);
  }, [nodes, setNodes, setEdges, deleteNode]);

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
              onSegment: () => {},
              onMessageCreate: () => createMessageNode(nodeId),
              onPollCreate: () => createPollNode(nodeId),
              onDelete: node.id !== "1" ? () => deleteNode(node.id) : undefined,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes, createMessageNode, createPollNode, deleteNode]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return {
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
  };
};
