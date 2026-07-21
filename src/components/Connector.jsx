import { useEffect, useRef } from 'react';

export default function Connector({
  fromY,
  toY,
  containerWidth,
  animate = false,
  chosen = false,
  stub = false,
}) {
  const pathRef = useRef(null);
  const dotRef = useRef(null);

  const midX = containerWidth / 2;
  const stubLength = 20;

  let d;
  if (stub) {
    d = `M ${midX} ${fromY} L ${midX} ${fromY + stubLength}`;
  } else {
    const controlOffset = (toY - fromY) / 3;
    d = `M ${midX} ${fromY} C ${midX} ${fromY + controlOffset}, ${midX} ${toY - controlOffset}, ${midX} ${toY}`;
  }

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.setProperty('--path-length', length);

    if (animate) {
      pathRef.current.style.strokeDasharray = length;
      pathRef.current.style.strokeDashoffset = length;
      pathRef.current.style.animation = `draw-connector 0.4s ease-out forwards`;
    } else {
      pathRef.current.style.strokeDasharray = 'none';
      pathRef.current.style.strokeDashoffset = '0';
      pathRef.current.style.animation = 'none';
    }
  }, [animate, d]);

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={chosen ? 'var(--color-primary)' : 'var(--color-border)'}
        strokeWidth={2}
        strokeDasharray={stub ? '4 4' : 'none'}
        strokeLinecap="round"
      />
      {animate && !stub && (
        <circle
          ref={dotRef}
          r="3"
          fill="var(--color-primary)"
          style={{
            offsetPath: `path('${d}')`,
            animation: 'travel-dot 0.4s ease-out forwards',
          }}
        />
      )}
    </g>
  );
}
