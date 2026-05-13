import type { Node, Edge } from '@xyflow/react';
import yaml from 'js-yaml';
import * as TOML from 'smol-toml';

type JsonNodeData = {
  label: string;
  entries: { key: string; value: string; type: string }[];
  isArray: boolean;
  isRoot: boolean;
};

let nodeIdCounter = 0;

function getValueType(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

function getDisplayValue(val: unknown): string {
  if (val === null) return 'null';
  if (typeof val === 'string') return `"${val.length > 40 ? val.slice(0, 37) + '...' : val}"`;
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return `[${val.length}]`;
  if (typeof val === 'object') return `{${Object.keys(val).length}}`;
  return String(val);
}

function isComplex(val: unknown): boolean {
  if (val === null) return false;
  if (Array.isArray(val))
    return val.length > 0 && val.some(v => typeof v === 'object' && v !== null);
  return typeof val === 'object';
}

function buildNodes(
  key: string,
  value: unknown,
  parentId: string | null,
  x: number,
  y: number,
  depth: number,
  nodes: Node[],
  edges: Edge[],
  isRoot: boolean
): { width: number; height: number } {
  const id = `node-${++nodeIdCounter}`;
  const isArray = Array.isArray(value);

  if (typeof value !== 'object' || value === null) {
    return { width: 0, height: 0 };
  }

  const obj = value as Record<string, unknown>;
  const keys = isArray ? (value as unknown[]).map((_, i) => String(i)) : Object.keys(obj);

  const entries: JsonNodeData['entries'] = [];
  const childLinks: { childKey: string; childValue: unknown }[] = [];

  keys.forEach(k => {
    const v = isArray ? (value as unknown[])[Number(k)] : obj[k];
    if (isComplex(v)) {
      childLinks.push({ childKey: k, childValue: v! });
      entries.push({
        key: isArray ? `[${k}]` : k,
        value: Array.isArray(v)
          ? `Array[${(v as unknown[]).length}]`
          : `Object{${Object.keys(v as object).length}}`,
        type: Array.isArray(v) ? 'array' : 'object',
      });
    } else {
      entries.push({
        key: isArray ? `[${k}]` : k,
        value: getDisplayValue(v),
        type: getValueType(v),
      });
    }
  });

  const nodeData: JsonNodeData = {
    label: key,
    entries,
    isArray,
    isRoot,
  };

  nodes.push({
    id,
    type: 'jsonCard',
    position: { x, y },
    data: nodeData,
  });

  if (parentId) {
    edges.push({
      id: `edge-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'smoothstep',
    });
  }

  let childY = y;
  const childX = x + 260;

  childLinks.forEach(({ childKey, childValue }) => {
    const result = buildNodes(
      isArray ? `[${childKey}]` : childKey,
      childValue,
      id,
      childX,
      childY,
      depth + 1,
      nodes,
      edges,
      false
    );
    childY += Math.max(result.height, 80) + 24;
  });

  const selfHeight = Math.max(40 + entries.length * 20, childY - y);
  return { width: 350, height: selfHeight };
}

export function jsonToFlow(jsonStr: string): { nodes: Node[]; edges: Edge[] } {
  nodeIdCounter = 0;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  try {
    const trimmed = jsonStr.trim();
    let parsed: unknown;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsed = JSON.parse(trimmed);
    } else {
      try {
        parsed = TOML.parse(trimmed);
      } catch {
        parsed = yaml.load(trimmed);
      }
    }
    if (typeof parsed !== 'object' || parsed === null) {
      nodes.push({
        id: 'node-1',
        type: 'jsonCard',
        position: { x: 50, y: 50 },
        data: {
          label: 'root',
          entries: [{ key: 'value', value: getDisplayValue(parsed), type: getValueType(parsed) }],
          isArray: false,
          isRoot: true,
        },
      });
      return { nodes, edges };
    }

    buildNodes('root', parsed, null, 50, 50, 0, nodes, edges, true);
  } catch {
    return { nodes: [], edges: [] };
  }

  return { nodes, edges };
}
