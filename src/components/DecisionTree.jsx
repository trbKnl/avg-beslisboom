import { useState, useRef, useCallback, useEffect } from 'react';
import tree from '../tree.json';
import TreeNode from './TreeNode';
import Connector from './Connector';

export default function DecisionTree() {
  const [currentId, setCurrentId] = useState(tree.startId);
  const [history, setHistory] = useState([]);
  const [animatingNodeId, setAnimatingNodeId] = useState(null);

  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  const registerRef = useCallback((id, el) => {
    if (el) nodeRefs.current[id] = el;
  }, []);

  function handleAnswer(nextId, label) {
    setHistory([...history, { nodeId: currentId, chosenAnswer: label }]);
    setAnimatingNodeId(nextId);
    setCurrentId(nextId);
  }

  function handleRewind(index) {
    setCurrentId(history[index].nodeId);
    setHistory(history.slice(0, index));
    setAnimatingNodeId(null);
  }

  function handleReset() {
    setHistory([]);
    setCurrentId(tree.startId);
    setAnimatingNodeId(null);
  }

  // Auto-scroll to active node after render
  useEffect(() => {
    const activeEl = nodeRefs.current[currentId];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentId]);

  // Build the visible node list: all history nodes + current node
  const visibleNodes = [
    ...history.map((h) => ({
      id: h.nodeId,
      node: tree.nodes[h.nodeId],
      state: 'completed',
      chosenAnswer: h.chosenAnswer,
    })),
    {
      id: currentId,
      node: tree.nodes[currentId],
      state: 'active',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative mx-auto"
      style={{
        maxWidth: '672px',
        padding: '24px 16px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: 'var(--color-text-dark)',
          fontSize: '1.75rem',
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        AVG Beslisboom
      </h1>

      <ConnectorOverlay
        visibleNodes={visibleNodes}
        nodeRefs={nodeRefs}
        containerRef={containerRef}
        animatingNodeId={animatingNodeId}
      />

      <div className="flex flex-col items-center gap-6">
        {visibleNodes.map((entry, index) => (
          <div
            key={entry.id}
            ref={(el) => registerRef(entry.id, el)}
            className={
              entry.state === 'active' && entry.id === animatingNodeId
                ? 'animate-fade-slide-in w-full'
                : 'w-full'
            }
            onAnimationEnd={() => {
              if (entry.id === animatingNodeId) setAnimatingNodeId(null);
            }}
          >
            <TreeNode
              node={entry.node}
              state={entry.state}
              chosenAnswer={entry.chosenAnswer}
              onAnswer={handleAnswer}
              onRewind={() => handleRewind(index)}
              onReset={handleReset}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectorOverlay({ visibleNodes, nodeRefs, containerRef, animatingNodeId }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // Recalculate connector positions after DOM updates
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      for (let i = 0; i < visibleNodes.length - 1; i++) {
        const fromId = visibleNodes[i].id;
        const toId = visibleNodes[i + 1].id;
        const fromEl = nodeRefs.current[fromId];
        const toEl = nodeRefs.current[toId];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          newLines.push({
            key: `${fromId}-${toId}`,
            fromY: fromRect.bottom - containerRect.top,
            toY: toRect.top - containerRect.top,
            chosen: true,
            animate: toId === animatingNodeId,
          });
        }
      }

      setLines(newLines);
    });

    return () => cancelAnimationFrame(timer);
  }, [visibleNodes, animatingNodeId]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {lines.map((line) => (
        <Connector
          key={line.key}
          fromY={line.fromY}
          toY={line.toY}
          containerWidth={containerRef.current?.offsetWidth ?? 672}
          animate={line.animate}
          chosen={line.chosen}
        />
      ))}
    </svg>
  );
}
