import { useEffect, useMemo, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { calculateExpression } from './api';

type HistoryItem = {
  expression: string;
  result: string;
};

type CalcButton = {
  label: string;
  value?: string;
  variant?: 'number' | 'operator' | 'action' | 'equals';
  wide?: boolean;
};

const buttons: CalcButton[] = [
  { label: 'C', variant: 'action' },
  { label: '⌫', variant: 'action' },
  { label: '%', value: '%', variant: 'operator' },
  { label: '÷', value: '/', variant: 'operator' },
  { label: '7', variant: 'number' },
  { label: '8', variant: 'number' },
  { label: '9', variant: 'number' },
  { label: '×', value: '*', variant: 'operator' },
  { label: '4', variant: 'number' },
  { label: '5', variant: 'number' },
  { label: '6', variant: 'number' },
  { label: '−', value: '-', variant: 'operator' },
  { label: '1', variant: 'number' },
  { label: '2', variant: 'number' },
  { label: '3', variant: 'number' },
  { label: '+', value: '+', variant: 'operator' },
  { label: '0', variant: 'number', wide: true },
  { label: '.', variant: 'number' },
  { label: '=', variant: 'equals' },
];

const operatorLabels: Record<string, string> = {
  '*': '×',
  '/': '÷',
  '-': '−',
};

function formatExpression(expression: string) {
  return expression.replace(/[*/-]/g, (match) => operatorLabels[match] ?? match);
}

function isOperator(value: string) {
  return ['+', '-', '*', '/', '%'].includes(value);
}

function canAppendDecimal(expression: string) {
  const currentNumber = expression.split(/[+\-*/%]/).pop() ?? '';
  return !currentNumber.includes('.');
}

export default function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [justSolved, setJustSolved] = useState(false);

  const formattedDisplay = useMemo(() => formatExpression(display), [display]);

  const appendValue = (rawValue: string) => {
    if (isCalculating) return;

    setError('');
    const value = rawValue;

    setExpression((current) => {
      let next = current;

      if (justSolved && !isOperator(value)) {
        next = '';
      }

      if (value === '.') {
        if (!canAppendDecimal(next)) return next;
        next = next === '' || isOperator(next.at(-1) ?? '') ? `${next}0.` : `${next}.`;
      } else if (isOperator(value)) {
        if (next === '' && value !== '-') return next;
        const last = next.at(-1) ?? '';
        if (isOperator(last)) {
          next = `${next.slice(0, -1)}${value}`;
        } else {
          next = `${next}${value}`;
        }
      } else {
        next = `${next}${value}`;
      }

      setDisplay(next || '0');
      return next;
    });

    setJustSolved(false);
  };

  const clearCalculator = () => {
    if (isCalculating) return;
    setExpression('');
    setDisplay('0');
    setError('');
    setJustSolved(false);
  };

  const deleteLast = () => {
    if (isCalculating) return;
    setError('');
    setExpression((current) => {
      const next = current.slice(0, -1);
      setDisplay(next || '0');
      return next;
    });
  };

  const solve = async () => {
    if (isCalculating) return;

    const trimmed = expression.trim();
    if (!trimmed) return;

    if (isOperator(trimmed.at(-1) ?? '')) {
      setError('Finish the expression with a number first.');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const answer = await calculateExpression(trimmed);
      setDisplay(answer.result);
      setExpression(answer.result);
      setHistory((items) => [answer, ...items].slice(0, 5));
      setJustSolved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleButtonClick = (button: CalcButton) => {
    if (button.label === 'C') return clearCalculator();
    if (button.label === '⌫') return deleteLast();
    if (button.label === '=') return solve();
    return appendValue(button.value ?? button.label);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (/^[0-9]$/.test(key)) {
        appendValue(key);
        return;
      }

      if (['+', '-', '*', '/', '%', '.'].includes(key)) {
        appendValue(key);
        return;
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        void solve();
        return;
      }

      if (key === 'Backspace') {
        deleteLast();
        return;
      }

      if (key === 'Escape') {
        clearCalculator();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expression, isCalculating, justSolved]);

  return (
    <main className="app-shell">
      <section className="calculator-card" aria-label="Simple calculator">
        <div className="card-header">
          <div className="brand-icon" aria-hidden="true">
            <Calculator size={24} />
          </div>
          <div>
            <p className="eyebrow">One page app</p>
            <h1>Simple Calculator</h1>
          </div>
        </div>

        <div className="display-panel" aria-live="polite">
          <p className="display-label">Result</p>
          <div className="display-value" title={formattedDisplay}>{isCalculating ? 'Calculating…' : formattedDisplay}</div>
          {error ? <p className="error-message">{error}</p> : <p className="hint">Use buttons or your keyboard.</p>}
        </div>

        <div className="button-grid">
          {buttons.map((button) => (
            <button
              key={`${button.label}-${button.value ?? button.label}`}
              type="button"
              className={`calc-button ${button.variant ?? 'number'} ${button.wide ? 'wide' : ''}`}
              onClick={() => handleButtonClick(button)}
              disabled={isCalculating}
              aria-label={button.label === '⌫' ? 'Delete last character' : button.label}
            >
              {button.label}
            </button>
          ))}
        </div>

        <aside className="history-panel" aria-label="Recent calculations">
          <div className="history-title-row">
            <h2>Recent</h2>
            <button type="button" className="clear-history" onClick={() => setHistory([])} disabled={!history.length}>
              <RotateCcw size={14} /> Clear
            </button>
          </div>

          {history.length === 0 ? (
            <p className="empty-history">Your last five answers will appear here.</p>
          ) : (
            <ul>
              {history.map((item, index) => (
                <li key={`${item.expression}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setExpression(item.result);
                      setDisplay(item.result);
                      setError('');
                      setJustSolved(true);
                    }}
                  >
                    <span>{formatExpression(item.expression)}</span>
                    <strong>{item.result}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
