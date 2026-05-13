'use client';

import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InputNode } from '@/components/nodes/input-node';
import { FormatNode } from '@/components/nodes/format-node';
import { ConvertNode } from '@/components/nodes/convert-node';
import { ValidateNode } from '@/components/nodes/validate-node';
import { OutputNode } from '@/components/nodes/output-node';
import { Plus, Sparkles, ArrowRightLeft, ShieldCheck, Minimize2 } from 'lucide-react';
import { format, convert, validate, type Format } from '@/lib/converters';

export type NodeData = {
  value?: string;
  format?: Format;
  targetFormat?: Format;
  indent?: number;
  label?: string;
  status?: 'idle' | 'success' | 'error';
  error?: string;
};

const nodeTypes: NodeTypes = {
  input: InputNode,
  format: FormatNode,
  convert: ConvertNode,
  validate: ValidateNode,
  output: OutputNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: 'rgba(255,255,255,0.12)', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'rgba(255,255,255,0.12)',
    width: 16,
    height: 16,
  },
};

const initialNodes: Node[] = [
  {
    id: 'input-1',
    type: 'input',
    position: { x: 50, y: 150 },
    data: { value: '', format: 'json' as Format, label: 'Input' },
  },
  {
    id: 'format-1',
    type: 'format',
    position: { x: 450, y: 150 },
    data: { indent: 2, label: 'Format' },
  },
  {
    id: 'output-1',
    type: 'output',
    position: { x: 850, y: 150 },
    data: { value: '', label: 'Output' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-input-format', source: 'input-1', target: 'format-1' },
  { id: 'e-format-output', source: 'format-1', target: 'output-1' },
];

let nodeId = 10;

function processNode(
  node: Node,
  inputValue: string,
  inputFormat: Format
): { value: string; format: Format; status: 'success' | 'error'; error?: string } {
  const data = node.data as NodeData;

  switch (node.type) {
    case 'format': {
      const result = format(inputValue, inputFormat, (data.indent as number) ?? 2);
      if (result.success) return { value: result.output, format: inputFormat, status: 'success' };
      return { value: '', format: inputFormat, status: 'error', error: result.error };
    }
    case 'convert': {
      const target = (data.targetFormat as Format) ?? 'yaml';
      const result = convert(inputValue, inputFormat, target);
      if (result.success) return { value: result.output, format: target, status: 'success' };
      return { value: '', format: inputFormat, status: 'error', error: result.error };
    }
    case 'validate': {
      const result = validate(inputValue, inputFormat);
      if (result.success) return { value: inputValue, format: inputFormat, status: 'success' };
      return { value: inputValue, format: inputFormat, status: 'error', error: result.error };
    }
    default:
      return { value: inputValue, format: inputFormat, status: 'success' };
  }
}

export function JsonPipeline() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const flowRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds => addEdge(params, eds));
    },
    [setEdges]
  );

  const runPipeline = useCallback(() => {
    const inputNode = nodes.find(n => n.type === 'input');
    if (!inputNode) return;

    const inputData = inputNode.data as NodeData;
    let currentValue = (inputData.value as string) ?? '';
    let currentFormat = (inputData.format as Format) ?? 'json';

    if (!currentValue.trim()) return;

    const visited = new Set<string>();
    let currentNodeId = inputNode.id;

    const updatedData = new Map<string, Partial<NodeData>>();

    while (true) {
      visited.add(currentNodeId);
      const outEdge = edges.find(e => e.source === currentNodeId);
      if (!outEdge) break;

      const nextNode = nodes.find(n => n.id === outEdge.target);
      if (!nextNode || visited.has(nextNode.id)) break;

      if (nextNode.type === 'output') {
        updatedData.set(nextNode.id, {
          value: currentValue,
          format: currentFormat,
          status: 'success',
        });
        break;
      }

      const result = processNode(nextNode, currentValue, currentFormat);
      updatedData.set(nextNode.id, { status: result.status, error: result.error });

      if (result.status === 'error') {
        updatedData.set(nextNode.id, { status: 'error', error: result.error });
        break;
      }

      currentValue = result.value;
      currentFormat = result.format;
      currentNodeId = nextNode.id;
    }

    setNodes(nds =>
      nds.map(n => {
        const update = updatedData.get(n.id);
        if (update) return { ...n, data: { ...n.data, ...update } };
        return n;
      })
    );
  }, [nodes, edges, setNodes]);

  const onInputChange = useCallback(
    (nodeId: string, value: string) => {
      setNodes(nds => nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, value } } : n)));
    },
    [setNodes]
  );

  const onDataChange = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes(nds => nds.map(n => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)));
    },
    [setNodes]
  );

  const addNode = useCallback(
    (type: string) => {
      const id = `${type}-${++nodeId}`;
      const labels: Record<string, string> = {
        format: 'Format',
        convert: 'Convert',
        validate: 'Validate',
      };
      const defaults: Record<string, Partial<NodeData>> = {
        format: { indent: 2 },
        convert: { targetFormat: 'yaml' as Format },
        validate: {},
      };

      const outputNode = nodes.find(n => n.type === 'output');
      const x = outputNode ? outputNode.position.x : 600;
      const y = outputNode ? outputNode.position.y : 150;

      if (outputNode) {
        setNodes(nds =>
          nds.map(n => (n.id === outputNode.id ? { ...n, position: { x: x + 400, y } } : n))
        );
      }

      const newNode: Node = {
        id,
        type,
        position: { x, y },
        data: { label: labels[type] ?? type, ...defaults[type] },
      };

      setNodes(nds => [...nds, newNode]);

      const lastProcessNode =
        [...nodes].reverse().find(n => n.type !== 'output' && n.type !== 'input') ??
        nodes.find(n => n.type === 'input');
      if (lastProcessNode) {
        setEdges(eds => {
          const filtered = eds.filter(
            e => !(e.source === lastProcessNode.id && e.target === outputNode?.id)
          );
          return [
            ...filtered,
            { id: `e-${lastProcessNode.id}-${id}`, source: lastProcessNode.id, target: id },
            ...(outputNode
              ? [{ id: `e-${id}-${outputNode.id}`, source: id, target: outputNode.id }]
              : []),
          ];
        });
      }
    },
    [nodes, setNodes, setEdges]
  );

  return (
    <div className="h-full w-full" ref={flowRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        proOptions={{ hideAttribution: true }}
        className="json-pipeline"
        colorMode="dark"
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} />
        <Controls
          showInteractive={false}
          className="!rounded-xl !border-none !bg-white/[0.04] !shadow-xl !shadow-black/30 [&>button:hover]:!text-white/70 [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-none [&>button]:!bg-transparent [&>button]:!text-white/40"
        />

        <Panel position="top-right" className="flex items-center gap-2">
          <button
            onClick={() => addNode('format')}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/50 transition-all duration-150 hover:bg-white/[0.1] hover:text-white/80 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" /> Format
          </button>
          <button
            onClick={() => addNode('convert')}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/50 transition-all duration-150 hover:bg-white/[0.1] hover:text-white/80 active:scale-95"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" /> Convert
          </button>
          <button
            onClick={() => addNode('validate')}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/50 transition-all duration-150 hover:bg-white/[0.1] hover:text-white/80 active:scale-95"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Validate
          </button>
          <div className="ml-2 h-5 w-px bg-white/10" />
          <button
            onClick={runPipeline}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-4 py-2 text-[12px] font-semibold text-amber-300 transition-all duration-150 hover:bg-amber-500/25 active:scale-95"
          >
            ▶ Run
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
