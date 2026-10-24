/* 关于页：时间线与来源渲染 */
(function () {
  'use strict';

  function init() {
    var timeline = document.getElementById('timeline');
    if (timeline && window.XIU) {
      timeline.innerHTML = XIU.timeline.map(function (t, i) {
        return '<div class="timeline__item reveal" style="--d:' + (i * 0.04).toFixed(2) + 's">' +
          '<span class="timeline__year">' + XIUUI.escapeHTML(t.year) + '</span>' +
          '<h3 class="timeline__title">' + XIUUI.escapeHTML(t.title) + '</h3>' +
          '<p class="timeline__text">' + XIUUI.escapeHTML(t.text) + '</p>' +
          '</div>';
      }).join('');
      XIUUI.observeReveals(timeline);
    }

    var sources = document.getElementById('aboutSources');
    if (sources && window.XIU) {
      sources.innerHTML = XIU.sources.map(function (s) {
        return '<li>' +
          '<a href="' + XIUUI.escapeHTML(s.u) + '" target="_blank" rel="noopener">' + XIUUI.escapeHTML(s.t) + ' ↗</a>' +
          '<span>' + XIUUI.escapeHTML(s.note) + '</span>' +
          '</li>';
      }).join('');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
