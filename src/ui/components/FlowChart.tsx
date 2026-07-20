export type FlowNodeType = 'step' | 'decision' | 'result';

export interface FlowNode {
  id: string;
  label: string;
  type?: FlowNodeType;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowChartData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const CANVAS_W = 360;
const NODE_H = 40;
const H_GAP = 16;
const V_GAP = 48;
const ARROW_H = 7;

interface PNode {
  id: string;
  label: string;
  type: FlowNodeType;
  x: number;
  y: number;
  w: number;
}

interface PEdge {
  from: PNode;
  to: PNode;
  label?: string;
}

function buildLayout(data: FlowChartData) {
  const inEdges = new Map<string, string[]>();
  const outEdges = new Map<string, string[]>();
  for (const n of data.nodes) {
    inEdges.set(n.id, []);
    outEdges.set(n.id, []);
  }
  for (const e of data.edges) {
    inEdges.get(e.to)!.push(e.from);
    outEdges.get(e.from)!.push(e.to);
  }

  const layer = new Map<string, number>();
  const queue: string[] = [];
  for (const n of data.nodes) {
    if (!inEdges.get(n.id)!.length) {
      layer.set(n.id, 0);
      queue.push(n.id);
    }
  }
  let qi = 0;
  while (qi < queue.length) {
    const id = queue[qi++];
    const l = layer.get(id)!;
    for (const child of outEdges.get(id)!) {
      if ((layer.get(child) ?? -1) < l + 1) {
        layer.set(child, l + 1);
        queue.push(child);
      }
    }
  }

  const layers: FlowNode[][] = [];
  for (const n of data.nodes) {
    const l = layer.get(n.id) ?? 0;
    while (layers.length <= l) layers.push([]);
    layers[l].push(n);
  }

  const positioned = new Map<string, PNode>();
  for (let li = 0; li < layers.length; li++) {
    const group = layers[li];
    const count = group.length;
    const nodeW = count === 1 ? CANVAS_W : (CANVAS_W - (count - 1) * H_GAP) / count;
    const totalW = count * nodeW + (count - 1) * H_GAP;
    const startX = (CANVAS_W - totalW) / 2;
    const y = li * (NODE_H + V_GAP);

    group.forEach((n, ni) => {
      positioned.set(n.id, {
        id: n.id,
        label: n.label,
        type: n.type || 'step',
        x: startX + ni * (nodeW + H_GAP),
        y,
        w: nodeW,
      });
    });
  }

  const edges: PEdge[] = data.edges
    .map((e) => ({ from: positioned.get(e.from)!, to: positioned.get(e.to)!, label: e.label }))
    .filter((e) => e.from && e.to);

  const height = layers.length * NODE_H + Math.max(0, layers.length - 1) * V_GAP;
  return { nodes: [...positioned.values()], edges, width: CANVAS_W, height };
}

function cx(n: PNode) {
  return n.x + n.w / 2;
}

export function FlowChart({ data, label }: { data: FlowChartData; label?: string }) {
  const { nodes, edges, width, height } = buildLayout(data);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={label ?? '計算の流れ'} style={{ display: 'block' }}>
      {edges.map((e, i) => {
        const x1 = cx(e.from);
        const y1 = e.from.y + NODE_H;
        const x2 = cx(e.to);
        const y2 = e.to.y;
        const straight = Math.abs(x1 - x2) < 1;
        const midY = (y1 + y2) / 2;
        const arrowBase = y2 - ARROW_H;

        const d = straight
          ? `M${x1} ${y1}L${x2} ${arrowBase}`
          : `M${x1} ${y1}C${x1} ${midY},${x2} ${midY},${x2} ${arrowBase}`;

        return (
          <g key={i}>
            <path d={d} stroke="var(--text-muted)" strokeWidth="1.5" fill="none" />
            <polygon
              points={`${x2 - 4},${arrowBase} ${x2 + 4},${arrowBase} ${x2},${y2}`}
              fill="var(--text-muted)"
            />
            {e.label && (
              <text
                x={straight ? x1 + 10 : (x1 + x2) / 2}
                y={straight ? midY : midY - 6}
                fontSize="11"
                fill="var(--text-secondary)"
                dominantBaseline="central"
                textAnchor={straight ? 'start' : 'middle'}
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const isResult = n.type === 'result';
        const isDecision = n.type === 'decision';
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={NODE_H}
              rx={8}
              fill={isResult ? 'var(--accent-light)' : isDecision ? 'var(--bg)' : 'var(--bg-section)'}
              stroke={isResult ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={isResult ? 1.5 : 1}
              strokeDasharray={isDecision ? '4 2' : undefined}
            />
            <text
              x={cx(n)}
              y={n.y + NODE_H / 2}
              fontSize={n.w < 140 ? 11 : 13}
              fill={isResult ? 'var(--accent)' : 'var(--text)'}
              fontWeight={isResult ? 600 : 400}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
