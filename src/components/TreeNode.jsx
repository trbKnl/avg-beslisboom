import AnswerPill from './AnswerPill';

const cardBase = {
  borderRadius: 'var(--card-radius)',
  fontFamily: 'var(--font-body)',
  padding: '24px',
  width: '100%',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
};

const activeCardStyle = {
  ...cardBase,
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--card-shadow)',
};

const completedCardStyle = {
  ...cardBase,
  backgroundColor: 'var(--color-bg-muted)',
  border: '1px solid var(--color-border)',
  boxShadow: 'none',
  cursor: 'pointer',
};

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="absolute top-4 right-4"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TreeNode({
  node,
  state,
  chosenAnswer,
  onAnswer,
  onRewind,
  onReset,
}) {
  if (node.type === 'outcome') {
    return <OutcomeCard node={node} onReset={onReset} />;
  }

  if (state === 'completed') {
    return (
      <CompletedCard
        node={node}
        chosenAnswer={chosenAnswer}
        onRewind={onRewind}
      />
    );
  }

  if (node.type === 'info') {
    return <InfoCard node={node} onAnswer={onAnswer} />;
  }

  return <QuestionCard node={node} onAnswer={onAnswer} />;
}

function QuestionCard({ node, onAnswer }) {
  return (
    <div style={activeCardStyle}>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          fontSize: '1.25rem',
          marginBottom: '16px',
          lineHeight: 1.3,
        }}
      >
        {node.text}
      </h2>
      <div className="flex flex-col gap-2">
        {node.answers.map((answer) => (
          <button
            key={answer.next}
            onClick={() => onAnswer(answer.next, answer.label)}
            className="cursor-pointer text-left transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-primary)')}
          >
            {answer.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ node, onAnswer }) {
  return (
    <div
      style={{
        ...cardBase,
        backgroundColor: 'var(--color-bg-info)',
        border: 'none',
        borderLeft: '4px solid var(--color-accent-gold)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-body)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        {node.text}
      </p>
      <button
        onClick={() => onAnswer(node.next, 'Continue')}
        className="cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '1rem',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-primary)')}
      >
        Continue
      </button>
    </div>
  );
}

function CompletedCard({ node, chosenAnswer, onRewind }) {
  return (
    <div
      className="hover-lift"
      style={completedCardStyle}
      onClick={onRewind}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRewind(); }}
    >
      <div className="relative">
        <CheckIcon />
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            fontSize: '1rem',
            lineHeight: 1.3,
            marginBottom: '8px',
            paddingRight: '32px',
          }}
        >
          {node.text}
        </p>
        <AnswerPill label={chosenAnswer} />
      </div>
    </div>
  );
}

function OutcomeCard({ node, onReset }) {
  const variantStyles = {
    success: {
      backgroundColor: 'var(--color-bg-success)',
      borderLeft: '4px solid var(--color-primary)',
    },
    neutral: {
      backgroundColor: 'var(--color-bg-muted)',
      borderLeft: '4px solid var(--color-text-muted)',
    },
    stop: {
      backgroundColor: 'var(--color-bg-stop)',
      borderLeft: '4px solid var(--color-accent-red)',
    },
  };

  return (
    <div style={{ ...cardBase, border: 'none', ...variantStyles[node.variant] }}>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          fontSize: '1.25rem',
          lineHeight: 1.3,
          marginBottom: '16px',
        }}
      >
        {node.text}
      </p>
      <button
        onClick={onReset}
        className="cursor-pointer transition-colors"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-accent-red)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          padding: '8px 0',
          border: 'none',
          fontSize: '1rem',
        }}
      >
        ← Start over
      </button>
    </div>
  );
}
