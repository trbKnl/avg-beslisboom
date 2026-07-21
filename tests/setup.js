import '@testing-library/jest-dom';

// Mock SVG methods not available in jsdom
// jsdom represents SVG path elements as plain SVGElement (no SVGPathElement subclass),
// so we patch SVGElement.prototype. In real browsers SVGPathElement inherits this.
if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getTotalLength = () => 0;
}
