import { createRoot } from 'react-dom/client';
import DecisionTree from './components/DecisionTree';
import './index.css';

const el = document.getElementById('avg-beslisboom');
if (el) {
  createRoot(el).render(<DecisionTree />);
}
