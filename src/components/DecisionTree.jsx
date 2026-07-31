import { useState, useRef, useCallback, useEffect } from 'react';
import tree from '../tree.json';
import TreeNode from './TreeNode';
import Connector from './Connector';

const risks = [
  {
    title: 'Combining data',
    description:
      'When your data donation study involves combining datasets from multiple sources (e.g., linking social media data with survey responses), additional privacy risks arise. The combination of datasets can reveal patterns or identities that would not be apparent from individual datasets alone. Consider whether the combined data could lead to re-identification of participants, even if individual datasets are anonymised.',
  },
  {
    title: 'Enriching data',
    description:
      'Data enrichment occurs when you supplement donated data with additional information from external sources. This could include adding demographic data, linking to public records, or appending behavioural data. Enrichment increases the depth of personal information held and may introduce data that participants did not explicitly consent to share. Assess whether the enrichment is proportionate to your research objectives.',
  },
  {
    title: 'Involving data of other data subjects than the intended subject',
    description:
      'Data donations often contain information about third parties who have not consented to participate. For example, chat logs include messages from other people, videos may capture bystanders, and social media exports contain interactions with other users. Consider how you will handle personal data of these unintended data subjects and whether additional safeguards or consent mechanisms are needed.',
  },
  {
    title: 'Special category data',
    description:
      'Under the GDPR, special category data includes information revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health data, or data concerning a person\'s sex life or sexual orientation. Processing such data is prohibited unless specific conditions are met. Evaluate whether your data donation study might inadvertently collect special category data and ensure you have a lawful basis for processing it.',
  },
  {
    title: 'Processing data for a new purpose',
    description:
      'If you intend to use donated data for purposes beyond what was originally communicated to participants, this constitutes purpose limitation concerns under the GDPR. Any new purpose must be compatible with the original purpose, or you must obtain fresh consent. Document your assessment of compatibility and consider whether participants would reasonably expect the new use of their data.',
  },
  {
    title: 'Sharing data with third parties (scientific and commercial)',
    description:
      'Sharing donated data with other researchers, institutions, or commercial partners introduces additional risks. Consider whether data sharing agreements are in place, whether recipients offer adequate data protection, and whether participants were informed about potential data sharing. Distinguish between sharing for scientific purposes (which may benefit from certain GDPR exemptions) and commercial purposes (which typically require explicit consent).',
  },
];

const measures = [
  {
    title: 'Create an information letter for participants',
    description:
      'An information letter is a document provided to participants before they take part in your data donation study. It should clearly explain what data will be collected, how it will be processed, who will have access, how long it will be stored, and what rights participants have under the GDPR. The letter should be written in plain, accessible language and avoid legal jargon. Include contact details for the responsible researcher and the Data Protection Officer of your institution.',
  },
  {
    title: 'Write a privacy notice',
    description:
      'A privacy notice is a formal document that fulfils your transparency obligations under Articles 13 and 14 of the GDPR. It must specify the identity of the data controller, the purposes and legal basis for processing, categories of data processed, any recipients or transfers, retention periods, and the rights of data subjects. Unlike the information letter (which is participant-friendly), the privacy notice should be comprehensive and legally precise. It is often published on your project website or institutional page.',
  },
  {
    title: 'Use a consent form',
    description:
      'A consent form documents that participants have given their freely given, specific, informed, and unambiguous agreement to the processing of their personal data. The form should reference the information letter and privacy notice, clearly state what the participant is consenting to, and provide separate checkboxes for distinct processing activities (e.g., data collection, data sharing, future use). Participants must be able to withdraw consent at any time without detriment. Keep signed consent forms securely stored as evidence of compliance.',
  },
];


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
          marginBottom: '16px',
        }}
      >
        DPIA Decision Tree
      </h1>

      <p
        style={{
          color: 'var(--color-text-body)',
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}
      >
        Data donation often involves the processing of personal data. Under the General Data Protection Regulation (GDPR), you may be required to conduct a Data Protection Impact Assessment (DPIA) before starting your study. Use this decision tree to determine whether a DPIA is needed for your data donation research, and consult the sections below for guidance on risks and mitigating measures.
      </p>

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

      {/* Risks section */}
      <section style={{ marginTop: '48px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-text-dark)',
            fontSize: '1.35rem',
            marginBottom: '12px',
          }}
        >
          DPIA: Risks to consider
        </h2>
        <p
          style={{
            color: 'var(--color-text-body)',
            fontSize: '1rem',
            lineHeight: 1.7,
            marginBottom: '20px',
          }}
        >
          When conducting a DPIA for your data donation study, you should evaluate whether any of the following risks apply to your research. Open each item below to check if it is relevant to your situation and to understand the implications. <strong>Note: the descriptions below are placeholder texts and need to be reviewed and replaced with verified content.</strong>
        </p>
        <div className="flex flex-col gap-3">
          {risks.map((risk) => (
            <details
              key={risk.title}
              className="details-foldout"
              style={{
                borderRadius: 'var(--card-radius)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text-dark)',
                  fontSize: '1rem',
                  padding: '16px 20px',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span className="details-chevron" aria-hidden="true">&#9654;</span>
                {risk.title}
              </summary>
              <div
                style={{
                  padding: '0 20px 16px 20px',
                  color: 'var(--color-text-body)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {risk.description}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Mitigating measures section */}
      <section style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--color-text-dark)',
            fontSize: '1.35rem',
            marginBottom: '12px',
          }}
        >
          DPIA: Mitigating measures
        </h2>
        <p
          style={{
            color: 'var(--color-text-body)',
            fontSize: '1rem',
            lineHeight: 1.7,
            marginBottom: '20px',
          }}
        >
          To address the risks identified in your DPIA, consider the following mitigating measures. Open each item to learn more about how to implement it and assess whether it applies to your research. <strong>Note: the descriptions below are placeholder texts and need to be reviewed and replaced with verified content.</strong>
        </p>
        <div className="flex flex-col gap-3">
          {measures.map((measure) => (
            <details
              key={measure.title}
              className="details-foldout"
              style={{
                borderRadius: 'var(--card-radius)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <summary
                className="cursor-pointer"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-text-dark)',
                  fontSize: '1rem',
                  padding: '16px 20px',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span className="details-chevron" aria-hidden="true">&#9654;</span>
                {measure.title}
              </summary>
              <div
                style={{
                  padding: '0 20px 16px 20px',
                  color: 'var(--color-text-body)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {measure.description}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function ConnectorOverlay({ visibleNodes, nodeRefs, containerRef, animatingNodeId }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      // Chosen path connectors
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
            stub: false,
          });
        }
      }

      // Stub connectors for completed question nodes' unchosen answers
      for (const entry of visibleNodes) {
        if (entry.state !== 'completed' || entry.node.type !== 'question') continue;
        const fromEl = nodeRefs.current[entry.id];
        if (!fromEl) continue;
        const fromRect = fromEl.getBoundingClientRect();
        const fromY = fromRect.bottom - containerRect.top;

        const unchosenCount = entry.node.answers.length - 1;
        if (unchosenCount <= 0) continue;

        for (let j = 0; j < unchosenCount; j++) {
          newLines.push({
            key: `${entry.id}-stub-${j}`,
            fromY,
            toY: fromY + 20,
            chosen: false,
            animate: false,
            stub: true,
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
          stub={line.stub}
        />
      ))}
    </svg>
  );
}
