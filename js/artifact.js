/* 器物详情：展签 ⇄ 工坊视角切换、标注、细看、相关器物 */
(function () {
  'use strict';

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  var STEP_NAMES = { body: '制胎', lacquer: '髹漆', gold: '描金', polish: '推光' };

  function relatedCard(a) {
    var art = LacquerArt.render(a.kind, { detail: false });
    return '<a class="cabinet" href="artifact.html?id=' + a.id + '" aria-label="' +
      XIUUI.escapeHTML(a.name) + '，查看详情">' +
      '<div class="cabinet__glass temp-wrap">' +
      '<span class="cabinet__no">' + XIUUI.escapeHTML(a.no) + '</span>' +
      '<span class="cabinet__cat">' + XIUUI.escapeHTML(a.category) + '</span>' +
      '<div class="cabinet__art" aria-hidden="true">' + art + '</div>' +
      '<span class="temp-badge">临时图</span>' +
      '</div>' +
      '<div class="cabinet__body">' +
      '<span class="cabinet__era">' + XIUUI.escapeHTML(a.era) + '</span>' +
      '<h3 class="cabinet__name">' + XIUUI.escapeHTML(a.name) + '</h3>' +
      '<span class="cabinet__en">' + XIUUI.escapeHTML(a.en) + '</span>' +
      '<div class="cabinet__tags">' + (a.patternText || []).map(function (t) {
        return '<span class="tag">' + XIUUI.escapeHTML(t) + '</span>';
      }).join('') + '</div>' +
      '</div>' +
      '</a>';
  }

  function switchView(mode) {
    var section = document.getElementById('objectSection');
    var labelBtn = document.getElementById('viewLabel');
    var workshopBtn = document.getElementById('viewWorkshop');
    var panel = mode === 'workshop' ? document.getElementById('workshopView') : document.getElementById('labelView');
    var on = mode === 'workshop';

    labelBtn.classList.toggle('is-active', !on);
    workshopBtn.classList.toggle('is-active', on);
    labelBtn.setAttribute('aria-pressed', on ? 'false' : 'true');
    workshopBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    section.classList.toggle('is-workshop', on);

    panel.classList.remove('is-revealing', 'is-entering');
    void panel.offsetWidth;
    panel.classList.add('is-revealing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    if (!window.LacquerArt || !window.XIU) return;
    var id = param('id');
    var list = XIU.artifacts;
    var a = list.filter(function (x) { return x.id === id; })[0] || list[0];
    var index = list.indexOf(a);
    var next = list[(index + 1) % list.length];
    var prev = list[(index - 1 + list.length) % list.length];

    document.title = a.name + ' — 髹·两面';

    /* —— 展签视角 —— */
    document.getElementById('crumbName').textContent = a.name;
    document.getElementById('objectNo').textContent = a.no + ' · ' + a.era;
    document.getElementById('objectName').textContent = a.name;
    document.getElementById('objectEn').textContent = a.en;
    document.getElementById('objectSummary').textContent = a.summary;
    document.getElementById('objectArt').insertAdjacentHTML('afterbegin', LacquerArt.render(a.kind, { detail: true }));

    var meta = [
      ['器型', a.category],
      ['纹样', (a.patternText || []).join(' · ')],
      ['材质', a.material],
      ['尺寸', a.size],
      ['出土', a.provenance],
      ['馆藏', a.collection]
    ];
    document.getElementById('objectMeta').innerHTML = meta.map(function (row) {
      return '<div><dt>' + XIUUI.escapeHTML(row[0]) + '</dt><dd>' + XIUUI.escapeHTML(row[1]) + '</dd></div>';
    }).join('');

    document.getElementById('objectText').innerHTML = (a.details || []).map(function (p) {
      return '<p class="body-copy">' + XIUUI.escapeHTML(p) + '</p>';
    }).join('');

    var sources = document.getElementById('objectSources');
    if (sources) {
      sources.innerHTML = '资料参考：<a href="about.html#rights">来源与引用说明 →</a>';
    }
    var coll = document.getElementById('objectCollection');
    if (coll) {
      coll.innerHTML = '馆藏参照：' + XIUUI.escapeHTML(a.collection) + '。<br>图像为临时示意图，待替换为定稿素材。';
    }

    /* —— 工坊视角 —— */
    document.getElementById('workshopArt').insertAdjacentHTML('afterbegin', LacquerArt.interactivePlate({
      pattern: true, gold: true, polish: 0.4,
      mask: '<circle cx="450" cy="450" r="330" fill="white" stroke="none"/>'
    }));
    var stepsEl = document.getElementById('workshopSteps');
    var steps = (a.steps || []).map(function (sid) {
      var s = XIU.craftSteps.filter(function (c) { return c.id === sid; })[0];
      return s ? { id: sid, name: s.name, intro: s.intro } : null;
    }).filter(Boolean);
    stepsEl.innerHTML = steps.map(function (s) {
      return '<div class="workshop-step">' +
        '<span class="workshop-step__no">' + (STEP_NAMES[s.id] ? STEP_NAMES[s.id].slice(0, 1) : '序') + '</span>' +
        '<div><div class="workshop-step__name">' + XIUUI.escapeHTML(s.name) + '</div>' +
        '<p class="workshop-step__text">' + XIUUI.escapeHTML(s.intro) + '</p></div>' +
        '<a class="link-arrow" href="story.html">去试试</a>' +
        '</div>';
    }).join('');

    /* —— 热点 —— */
    var hotspotWrap = document.getElementById('hotspots');
    var hotspots = a.hotspots || [];
    hotspotWrap.innerHTML = hotspots.map(function (h, i) {
      return '<button class="hotspot" type="button" style="left:' + h.x + '%;top:' + h.y + '%" ' +
        'aria-label="纹样标注：' + XIUUI.escapeHTML(h.t) + '" aria-expanded="false">' +
        '<span class="hotspot__tip" role="tooltip" id="hotspotTip' + i + '">' +
        '<b>' + XIUUI.escapeHTML(h.t) + '</b><span>' + XIUUI.escapeHTML(h.d) + '</span></span>' +
        '</button>';
    }).join('');

    var stage = document.getElementById('objectStage');
    var art = document.getElementById('objectArt');
    var zoomBtn = document.getElementById('zoomBtn');
    var annotateBtn = document.getElementById('annotateBtn');
    var zoomed = false;

    function closeHotspots(except) {
      XIUUI.$$('.hotspot', stage).forEach(function (b) {
        if (b !== except) {
          b.classList.remove('is-open');
          b.setAttribute('aria-expanded', 'false');
        }
      });
    }
    XIUUI.$$('.hotspot', stage).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !b.classList.contains('is-open');
        closeHotspots(b);
        b.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeHotspots(null);
    });

    if (zoomBtn) {
      zoomBtn.addEventListener('click', function () {
        zoomed = !zoomed;
        stage.classList.toggle('is-zoomed', zoomed);
        zoomBtn.classList.toggle('is-active', zoomed);
        zoomBtn.setAttribute('aria-pressed', zoomed ? 'true' : 'false');
        zoomBtn.textContent = zoomed ? '复位' : '细看';
      });
    }
    if (annotateBtn) {
      annotateBtn.addEventListener('click', function () {
        var on = stage.classList.toggle('is-annotated');
        annotateBtn.classList.toggle('is-active', on);
        annotateBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        annotateBtn.textContent = on ? '隐藏标注' : '纹样标注';
      });
    }
    if (stage && art) {
      stage.addEventListener('pointermove', function (e) {
        if (!zoomed) return;
        var r = stage.getBoundingClientRect();
        art.style.transformOrigin =
          Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)) + '% ' +
          Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) + '%';
      });
      stage.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.hotspot')) return;
        closeHotspots(null);
      });
    }

    /* —— 视角切换 —— */
    document.getElementById('viewLabel').addEventListener('click', function () { switchView('label'); });
    document.getElementById('viewWorkshop').addEventListener('click', function () { switchView('workshop'); });
    var toW = document.getElementById('toWorkshopView');
    var toL = document.getElementById('toLabelView');
    if (toW) toW.addEventListener('click', function (e) { e.preventDefault(); switchView('workshop'); });
    if (toL) toL.addEventListener('click', function (e) { e.preventDefault(); switchView('label'); });

    /* —— 相关 + 翻页 —— */
    document.getElementById('relatedGrid').innerHTML = (a.related || []).map(function (rid) {
      var rel = list.filter(function (x) { return x.id === rid; })[0];
      return rel ? relatedCard(rel) : '';
    }).join('');

    document.getElementById('objectNav').innerHTML =
      '<div><a class="link-arrow" href="artifact.html?id=' + prev.id + '">← ' + XIUUI.escapeHTML(prev.name) + '</a></div>' +
      '<div style="text-align:right"><a class="link-arrow" href="artifact.html?id=' + next.id + '">' + XIUUI.escapeHTML(next.name) + ' →</a></div>';

    XIUUI.observeReveals(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
