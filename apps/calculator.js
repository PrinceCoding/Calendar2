// Calculator Widget
(function() {
  'use strict';

  const floatingCalculator = document.getElementById('floatingCalculator');
  const calcDisplay = document.getElementById('calcDisplay');
  const calcButtons = document.querySelectorAll('.calc-btn');

  let calcValue = '0';

  function updateDisplay() {
    if (calcDisplay) calcDisplay.textContent = calcValue;
  }

  function handleCalculatorInput(val) {
    if (val === 'C') {
      calcValue = '0';
    } else if (val === '=') {
      try {
        calcValue = String(eval(calcValue));
      } catch {
        calcValue = 'Error';
      }
    } else {
      if (calcValue === '0' || calcValue === 'Error') {
        calcValue = val;
      } else {
        calcValue += val;
      }
    }
    updateDisplay();
  }

  calcButtons.forEach(btn => {
    btn.onclick = () => handleCalculatorInput(btn.dataset.calc);
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    // Don't intercept keys if user is typing in an input field or contenteditable
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    
    if (floatingCalculator.style.display !== 'flex') return;
    const key = e.key;
    if (/[0-9\+\-\*\/\.\(\)]/.test(key)) {
      e.preventDefault();
      handleCalculatorInput(key);
    } else if (key === 'Enter') {
      e.preventDefault();
      handleCalculatorInput('=');
    } else if (key === 'Escape' || key === 'Backspace') {
      e.preventDefault();
      handleCalculatorInput('C');
    }
  });

  updateDisplay();

  // Export for main script
  window.CalculatorWidget = {
    element: floatingCalculator,
    clear: () => handleCalculatorInput('C'),
    calculate: handleCalculatorInput
  };
})();
