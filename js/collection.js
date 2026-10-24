/* 典藏馆：展柜墙渲染 + 筛选 + 搜索 */
(function () {
  'use strict';

  var state = { category: '全部', pattern: '全部', query: '' };

  function cardHTML(a, index) {
    var feature = index === 0 && a.feature;
    var art = LacquerArt.render(a.kind, { detail: false });
    var tags = (a.patternText || []).map(function (t) {
      return '<span class="tag">' + XIUUI.escapeHTML(t) + '</span>';
    }).join('');
    var search = [
      a.name, a.en, a.era, a.category, a.material, a.summary,
      (a.patterns || []).join(' '), (a.patternText || []).join(' '), a.provenance
    ].join(' ').toLowerCase();

    return '' +
      '<a class="cabinet' + (feature ? ' cabinet--feature' : '') + '" ' +
      'href="artifact.html?id=' + a.id + '" ' +
      'data-category="' + XIUUI.escapeHTML(a.category) + '" ' +
      'data-patterns="' + XIUUI.escapeHTML((a.patterns || []).join(' ')) + '" ' +
      'data-search="' + XIUUI.escapeHTML(search) + '" ' +
      'aria-label="' + XIUUI.escapeHTML(a.name + '，' + a.era + '，查看详情') + '">' +
      '<div class="cabinet__glass temp-wrap">' +
      '<span class="cabinet__no">' + XIUUI.escapeHTML(a.no) + '</span>' +
      '<span class="cabinet__cat">' + XIUUI.escapeHTML(a.category) + '</span>' +
      '<div class="cabinet__art" aria-hidden="true">' + art + '</div>' +
      '<span class="temp-badge">临时图·待替换</span>' +
      (feature ? '<span class="cabinet__badge">待填·徽标（如：镇馆之宝）</span>' : '') +
      '<span class="cabinet__arrow">查看详情 <span aria-hidden="true">→</span></span>' +
      '<span class="cabinet__floor" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="cabinet__body">' +
      '<span class="cabinet__era">' + XIUUI.escapeHTML(a.era) + '</span>' +
      '<h2 class="cabinet__name">' + XIUUI.escapeHTML(a.name) + '</h2>' +
      '<span class="cabinet__en">' + XIUUI.escapeHTML(a.en) + '</span>' +
      '<p class="cabinet__desc">' + XIUUI.escapeHTML(a.summary) + '</p>' +
      '<div class="cabinet__tags">' + tags + '</div>' +
      '<div class="cabinet__foot"><span>' + XIUUI.escapeHTML(a.material) + '</span><span>' + XIUUI.escapeHTML(a.collection) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function init() {
    var grid = document.getElementById('cabinetGrid');
    var empty = document.getElementById('emptyState');
    var countEl = document.getElementById('resultCount');
    var search = document.getElementById('searchInput');
    var clear = document.getElementById('clearFilters');
    if (!grid || !window.LacquerArt) return;

    grid.innerHTML = XIU.artifacts.map(cardHTML).join('');
    var cards = XIUUI.$$('.cabinet', grid);
    var chips = XIUUI.$$('.chip', document);

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = (state.category === '全部' || card.getAttribute('data-category') === state.category) &&
          (state.pattern === '全部' || (card.getAttribute('data-patterns') || '').indexOf(state.pattern) !== -1) &&
          (!state.query || (card.getAttribute('data-search') || '').indexOf(state.query) !== -1);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
        }
      });
      if (countEl) countEl.textContent = String(visible).padStart(2, '0');
      if (empty) empty.classList.toggle('is-on', visible === 0);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state[chip.getAttribute('data-filter')] = chip.getAttribute('data-value');
        XIUUI.$$('.chip[data-filter="' + chip.getAttribute('data-filter') + '"]').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', XIUUI.debounce(function () {
        state.query = search.value.trim().toLowerCase();
        apply();
      }, 120));
    }

    if (clear) {
      clear.addEventListener('click', function () {
        state.category = '全部';
        state.pattern = '全部';
        state.query = '';
        if (search) search.value = '';
        chips.forEach(function (c) {
          var on = c.getAttribute('data-value') === '全部';
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
