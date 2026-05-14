'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { JsonCardNode } from '@/components/nodes/json-card-node';
import { jsonToFlow } from '@/lib/json-to-nodes';

const nodeTypes: NodeTypes = {
  jsonCard: JsonCardNode,
};

const defaultEdgeOptions = {
  animated: false,
  style: { stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'rgba(255,255,255,0.06)',
    width: 12,
    height: 12,
  },
};

export function JsonFlowPreview({ json }: { json: string }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!json.trim()) return { nodes: [] as Node[], edges: [] as Edge[] };
    return jsonToFlow(json);
  }, [json]);

  const [nodes, , onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  if (!json.trim() || initialNodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[11px] text-white/30">Flow preview</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full [&_.react-flow]:!bg-transparent [&_.react-flow__pane]:!bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        minZoom={0.1}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
      >
        <Background color="rgba(255,255,255,0.02)" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}
