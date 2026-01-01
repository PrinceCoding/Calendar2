// Analog Clock Widget
(function() {
  'use strict';

  const clock = document.getElementById('analogClock');
  const hr = document.getElementById('hr');
  const mn = document.getElementById('mn');
  const sc = document.getElementById('sc');

  function updateClock() {
    if (!hr || !mn || !sc) return;
    const d = new Date();
    const hh = d.getHours();
    const mm = d.getMinutes();
    const ss = d.getSeconds();
    const hRot = 30 * hh + mm / 2;
    const mRot = 6 * mm;
    const sRot = 6 * ss;
    hr.style.transform = `rotateZ(${hRot}deg)`;
    mn.style.transform = `rotateZ(${mRot}deg)`;
    sc.style.transform = `rotateZ(${sRot}deg)`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Export for main script
  window.ClockWidget = {
    element: clock,
    update: updateClock
  };
})();
