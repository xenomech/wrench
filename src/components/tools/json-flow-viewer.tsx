'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { JsonCardNode } from '@/components/nodes/json-card-node';
import { jsonToFlow } from '@/lib/json-to-nodes';
import { Trash, FileCode } from '@phosphor-icons/react';
import { samples } from '@/lib/samples';

const nodeTypes: NodeTypes = {
  jsonCard: JsonCardNode,
};

const defaultEdgeOptions = {
  animated: false,
  style: { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'rgba(255,255,255,0.08)',
    width: 14,
    height: 14,
  },
};

export function JsonFlowViewer() {
  const [input, setInput] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [hasVisualized, setHasVisualized] = useState(false);

  const visualize = useCallback(
    (json: string) => {
      const { nodes: n, edges: e } = jsonToFlow(json);
      setNodes(n);
      setEdges(e);
      setHasVisualized(n.length > 0);
    },
    [setNodes, setEdges]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInput(val);
      if (val.length - input.length > 5 && val.trim()) {
        visualize(val);
      }
    },
    [input, visualize]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        visualize(input);
      }
    },
    [input, visualize]
  );

  const handleClear = useCallback(() => {
    setInput('');
    setNodes([]);
    setEdges([]);
    setHasVisualized(false);
  }, [setNodes, setEdges]);

  const handleSample = useCallback(() => {
    const sample = samples.json ?? '';
    setInput(sample);
    visualize(sample);
  }, [visualize]);

  if (!hasVisualized) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex w-full max-w-lg flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-white/35">Paste JSON to visualize</p>
          <textarea
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder='{"key": "value", ...}'
            rows={8}
            className="font-code w-full resize-none rounded-xl bg-black/25 p-4 text-sm text-white/85 outline-none placeholder:text-white/25 focus:ring-1 focus:ring-white/10"
            ref={el => { if (el && window.matchMedia('(pointer: fine)').matches) el.focus(); }}
            spellCheck={false}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSample}
              className="flex items-center gap-1.5 text-xs text-white/25 transition-colors duration-150 hover:text-white/50"
            >
              <FileCode weight="duotone" className="h-3 w-3" /> Load sample
            </button>
            <span className="text-[10px] text-white/10">·</span>
            <span className="text-[10px] text-white/30">⌘⏎ to visualize</span>
          </div>
        </div>
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
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="rgba(255,255,255,0.03)" gap={32} size={1} />
        <Controls
          showInteractive={false}
          className="!rounded-xl !border-none !bg-white/[0.05] !shadow-xl !shadow-black/40 [&>button:hover]:!text-white/60 [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-none [&>button]:!bg-transparent [&>button]:!text-white/30"
        />

        <Panel position="top-left" className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/40 shadow-lg shadow-black/20 transition-all duration-150 hover:bg-white/[0.1] hover:text-white/70 active:scale-95"
          >
            <Trash weight="duotone" className="h-3.5 w-3.5" /> New
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
