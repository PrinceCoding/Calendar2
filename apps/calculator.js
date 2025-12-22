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
        // Replace display-friendly operators with eval-friendly ones
        let expression = calcValue.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        calcValue = String(eval(expression));
      } catch {
        calcValue = 'Error';
      }
    } else if (val.startsWith('Math.')) {
      // Scientific functions
      try {
        const currentVal = calcValue === '0' || calcValue === 'Error' ? '0' : calcValue;
        let result;
        
        switch(val) {
          case 'Math.sin':
            result = Math.sin(eval(currentVal) * Math.PI / 180); // Convert to radians
            break;
          case 'Math.cos':
            result = Math.cos(eval(currentVal) * Math.PI / 180);
            break;
          case 'Math.tan':
            result = Math.tan(eval(currentVal) * Math.PI / 180);
            break;
          case 'Math.log':
            result = Math.log10(eval(currentVal));
            break;
          case 'Math.sqrt':
            result = Math.sqrt(eval(currentVal));
            break;
          case 'Math.PI':
            calcValue = (calcValue === '0' || calcValue === 'Error') ? String(Math.PI) : calcValue + Math.PI;
            updateDisplay();
            return;
          case 'Math.E':
            calcValue = (calcValue === '0' || calcValue === 'Error') ? String(Math.E) : calcValue + Math.E;
            updateDisplay();
            return;
        }
        
        calcValue = String(result);
      } catch {
        calcValue = 'Error';
      }
    } else if (val === '^2') {
      try {
        const currentVal = eval(calcValue === '0' || calcValue === 'Error' ? '0' : calcValue);
        calcValue = String(Math.pow(currentVal, 2));
      } catch {
        calcValue = 'Error';
      }
    } else if (val === '^') {
      if (calcValue === '0' || calcValue === 'Error') {
        calcValue = '2^';
      } else {
        calcValue += '**';
      }
    } else if (val === '1/') {
      try {
        const currentVal = eval(calcValue === '0' || calcValue === 'Error' ? '1' : calcValue);
        calcValue = String(1 / currentVal);
      } catch {
        calcValue = 'Error';
      }
    } else if (val === '%') {
      try {
        const currentVal = eval(calcValue === '0' || calcValue === 'Error' ? '0' : calcValue);
        calcValue = String(currentVal / 100);
      } catch {
        calcValue = 'Error';
      }
    } else if (val === '!') {
      try {
        const currentVal = Math.floor(eval(calcValue === '0' || calcValue === 'Error' ? '1' : calcValue));
        let factorial = 1;
        for (let i = 2; i <= currentVal; i++) {
          factorial *= i;
        }
        calcValue = String(factorial);
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
