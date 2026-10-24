/* 首页：临时主视觉 + 伪 3D 视差 + 统计数字 */
(function () {
  'use strict';

  function init() {
    if (!window.LacquerArt || !window.XIU) return;

    /* —— 临时主视觉：现有 SVG 占位，等美术替换 —— */
    var heroArt = document.getElementById('heroArt');
    if (heroArt) heroArt.insertAdjacentHTML('afterbegin', LacquerArt.render('drumstand'));

    var museum = document.getElementById('modeArtMuseum');
    if (museum) museum.insertAdjacentHTML('afterbegin', LacquerArt.render('drumstand'));

    var workshop = document.getElementById('modeArtWorkshop');
    if (workshop) {
      workshop.insertAdjacentHTML('afterbegin', LacquerArt.interactivePlate({
        pattern: true, gold: true, polish: 1,
        mask: '<circle cx="450" cy="450" r="330" fill="white" stroke="none"/>'
      }));
    }

    /* —— 统计数字 —— */
    var stats = document.getElementById('heroStats');
    if (stats) {
      stats.innerHTML = (XIU.meta.stats || []).map(function (s) {
        return '<div class="hero__stat"><b>' + XIUUI.escapeHTML(s.n) + '</b><span>' + XIUUI.escapeHTML(s.t) + '</span></div>';
      }).join('');
    }

    /* —— 伪 3D 视差 —— */
    var hero = document.getElementById('hero');
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!hero || !fine) return;
    var raf = null, tx = 0, ty = 0, mx = 68, my = 44;
    function render() {
      hero.style.setProperty('--rx', tx.toFixed(3));
      hero.style.setProperty('--ry', ty.toFixed(3));
      hero.style.setProperty('--mx', mx.toFixed(1) + '%');
      hero.style.setProperty('--my', my.toFixed(1) + '%');
      raf = null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 2;
      mx = ((e.clientX - r.left) / r.width) * 100;
      my = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(render);
    });
    hero.addEventListener('pointerleave', function () {
      tx = 0; ty = 0; mx = 68; my = 44;
      if (!raf) raf = requestAnimationFrame(render);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
