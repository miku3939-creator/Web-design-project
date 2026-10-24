/* ============================================================
   入戏传 — 四步工序流程 + 选择点 + 图鉴 + 收藏卡
   ============================================================
   ★ 互动模块接口（工匠看这里）：
   每个工序对应一个 stub 交互，目前是"点按舞台即通过"。
   要换成真实游戏（拖拽旋胎 / 刷漆 / 描金 / 推光），做法：

   1. 在 bindStep(i) 里，把对应工序的 stub 分支替换成真实实现；
   2. 真实实现只需要做两件事：
      - 更新进度：调用 setMeter(p, label)（p 为 0–1）；
      - 完成时：调用 completeStep()；
   3. 参考已归档的旧版 xiu/js/story.js（本仓库 ../潦草基础/js/story.js），
      里面有四步手势的完整实现（Pointer Events + SVG Mask），
      可整段搬过来替换 stub 分支。

   ★ 选择点（已实现，可扩展）：
   - 髹漆完成 → 选漆色（choices.color，影响收藏卡底色）
   - 描金完成 → 选纹样（choices.pattern，影响收藏卡纹样）
   - 推光完成 → 老师傅评分（自动按进度结算，1–3 星）
   - 想做新选择：data.js 的 choices 加一组，在 craftSteps 对应步骤
     的 choice 字段填 key，再到 runChoice() 里加分支渲染。
   ============================================================ */
(function () {
  'use strict';

  var FULL = '<circle cx="450" cy="450" r="330" fill="white" stroke="none"/>';

  var state = {
    phase: 'intro',
    step: 0,
    completed: [false, false, false, false],
    stars: [0, 0, 0, 0],      // 每步的评分（目前只用于推光）
    locked: false,
    choice: null,             // 正在选择中的 choice key
    picked: null,
    color: 'black',           // 漆色选择
    pattern: 'phoenix',       // 纹样选择
    rating: 0,                // 最终评星（1–3）
    cardNo: null,
    name: '',
    lastFocus: null
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function cache() {
    els.intro = $('storyIntro');
    els.work = $('storyWork');
    els.end = $('storyEnd');
    els.codex = $('codex');
    els.copy = $('storyCopy');
    els.kicker = $('stepKicker');
    els.title = $('stepTitle');
    els.story = $('stepStory');
    els.fact = $('stepFact');
    els.action = $('stepAction');
    els.helper = $('stepHelper');
    els.skip = $('skipStep');
    els.actionBar = document.querySelector('.story-action');
    els.stage = $('storyStage');
    els.stageWrap = $('stageWrap');
    els.art = $('storyArt');
    els.meterBar = $('meterBar');
    els.meterValue = $('meterValue');
    els.meterLabel = $('meterLabel');
    els.feedback = $('storyFeedback');
    els.feedbackText = $('feedbackText');
    els.next = $('nextStep');
    els.prev = $('prevStep');
    els.progress = $('storyProgress');
    els.progressLabel = $('storyProgressLabel');
    els.endArt = $('endArt');
    els.endText = $('endText');
    els.endMeta = $('endMeta');
    els.overlay = $('choiceOverlay');
    els.choiceTitle = $('choiceTitle');
    els.choiceHint = $('choiceHint');
    els.choiceOptions = $('choiceOptions');
    els.choiceConfirm = $('choiceConfirm');
    els.modal = $('cardModal');
    els.cardArt = $('cardArt');
    els.cardName = $('cardName');
    els.cardNo = $('cardNo');
    els.cardHead = $('cardHead');
    els.cardSub = $('cardSub');
    els.cardLines = $('cardLines');
    els.nameInput = $('cardNameInput');
  }

  function esc(s) { return XIUUI.escapeHTML(s); }

  function setMeter(p, label, valueText) {
    p = Math.max(0, Math.min(1, p));
    els.meterBar.style.width = (p * 100).toFixed(1) + '%';
    if (label) els.meterLabel.textContent = label;
    els.meterValue.textContent = valueText != null ? valueText : Math.round(p * 100) + '%';
  }

  function updateProgress() {
    var dots = XIUUI.$$('i', els.progress);
    dots.forEach(function (d, i) {
      d.classList.toggle('is-done', state.completed[i] || state.phase === 'end');
      d.classList.toggle('is-current', state.phase === 'work' && i === state.step && !state.completed[i]);
    });
    els.progressLabel.textContent =
      state.phase === 'intro' ? '序' :
      state.phase === 'end' ? '终' : (state.step + 1) + ' / 4';
  }

  function updateCopy(i) {
    var s = XIU.craftSteps[i];
    els.kicker.textContent = s.no + ' / ' + s.en;
    els.title.textContent = s.name;
    els.story.innerHTML = s.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    els.fact.innerHTML = '<b>工坊笔记</b>' + esc(s.fact);
    els.action.textContent = s.action;
    els.helper.textContent = s.helper;
    els.skip.textContent = s.skip;
    els.meterLabel.textContent = s.name;
    els.stageWrap.setAttribute('data-scene', s.scene);
    var sceneEl = els.stage.querySelector('.story-stage__scene');
    if (sceneEl) sceneEl.setAttribute('data-scene-label', s.sceneLabel);
  }

  function updateNav() {
    els.prev.disabled = state.step === 0;
    var done = state.completed[state.step];
    els.next.disabled = !done;
    els.next.innerHTML = state.step === 3
      ? '<span>收盘，出梦</span><span class="arr">→</span>'
      : '<span>下一步</span><span class="arr">→</span>';
    els.skip.style.display = done ? 'none' : '';
  }

  function renderStage(i) {
    var c = state.completed[i];
    var opts;
    if (i === 0) opts = c ? {} : { rough: true };
    else if (i === 1) opts = { mask: c ? FULL : '' };
    else if (i === 2) opts = c ? { pattern: true, gold: true, mask: FULL } : { pattern: true, mask: FULL };
    else opts = { pattern: true, gold: true, polish: c ? 1 : 0, mask: FULL };
    els.art.innerHTML = LacquerArt.interactivePlate(opts);
    els.stage.classList.toggle('is-done', !!c);
    els.feedback.classList.remove('is-on');
    els.actionBar.classList.toggle('is-hidden', !!c);
    setMeter(c ? 1 : 0, XIU.craftSteps[i].name, c ? '完成' : '0%');
    updateNav();
  }

  function changeStep(i) {
    if (i < 0 || i > 3) return;
    state.step = i;
    state.phase = 'work';
    state.locked = false;      // 每步复位锁定，否则第二步起无法操作
    updateCopy(i);
    renderStage(i);
    bindStub(i);
    updateProgress();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     互动 stub：点按舞台即通过。
     真实游戏在此替换（见文件头注释）。
     ============================================================ */
  var stubHandler = null;
  function bindStub(i) {
    if (stubHandler) {
      els.stage.removeEventListener('click', stubHandler);
      stubHandler = null;
    }
    if (state.completed[i]) return;
    stubHandler = function () {
      if (state.locked || state.completed[state.step]) return;
      completeStep();
    };
    els.stage.addEventListener('click', stubHandler);
  }

  function completeStep() {
    if (state.completed[state.step] || state.locked) return;
    var i = state.step;
    state.completed[i] = true;
    state.locked = true;
    state.stars[i] = Math.min(3, Math.max(1, Math.round(2 + Math.random()))); // stub：随机 1–3 星
    renderStage(i);
    updateProgress();

    var s = XIU.craftSteps[i];
    els.feedbackText.innerHTML = s.feedback.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('feedbackNext').innerHTML = '<span>' + (i === 3 ? '收盘，出梦' : '继续') + '</span><span class="arr">→</span>';
    els.feedback.classList.add('is-on');
  }

  function next() {
    if (!state.completed[state.step]) return;
    els.feedback.classList.remove('is-on');
    var s = XIU.craftSteps[state.step];
    if (state.step < 3) {
      if (s.choice) {
        runChoice(s.choice, function () { changeStep(state.step + 1); });
      } else {
        changeStep(state.step + 1);
      }
    } else {
      runChoice('rating', showEnd);
    }
  }

  function prev() {
    if (state.step > 0) {
      els.feedback.classList.remove('is-on');
      changeStep(state.step - 1);
    }
  }

  /* ============================================================
     选择点
     ============================================================ */
  var choiceDone = null;
  function runChoice(key, done) {
    var conf = XIU.choices[key];
    if (!conf) { done(); return; }
    state.choice = key;
    state.picked = null;
    choiceDone = done;
    els.choiceTitle.textContent = conf.title;
    els.choiceHint.textContent = conf.hint;
    els.choiceOptions.innerHTML = '';

    if (key === 'rating') {
      els.choiceOptions.innerHTML =
        '<div class="rating-row" id="ratingRow">' +
        [1, 2, 3].map(function (n) {
          var on = n <= state.stars[3];
          return '<button class="rating-star' + (on ? ' is-on' : '') + '" type="button" data-star="' + n + '" aria-label="' + n + ' 星">★</button>';
        }).join('') +
        '</div>';
      XIUUI.$$('.rating-star', els.choiceOptions).forEach(function (b) {
        b.addEventListener('click', function () {
          state.rating = parseInt(b.getAttribute('data-star'), 10);
          XIUUI.$$('.rating-star', els.choiceOptions).forEach(function (x) {
            x.classList.toggle('is-on', parseInt(x.getAttribute('data-star'), 10) <= state.rating);
          });
        });
      });
      els.choiceConfirm.querySelector('span').textContent = '收下评语';
    } else {
      conf.options.forEach(function (opt) {
        var inner = key === 'color'
          ? '<span class="choice-option__swatch" style="background:' + opt.hex + '"></span>'
          : '<span class="choice-option__art">' + LacquerArt.motif(opt.art) + '</span>';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-option';
        btn.innerHTML = inner + '<b>' + esc(opt.name) + '</b><span>' + esc(opt.desc) + '</span>';
        btn.addEventListener('click', function () {
          state.picked = opt.id;
          if (key === 'color') state.color = opt.id;
          if (key === 'pattern') state.pattern = opt.id;
          XIUUI.$$('.choice-option', els.choiceOptions).forEach(function (x) {
            x.classList.toggle('is-picked', x === btn);
          });
        });
        els.choiceOptions.appendChild(btn);
      });
      els.choiceConfirm.querySelector('span').textContent = '就选这个';
    }
    els.overlay.classList.add('is-on');
  }

  function confirmChoice() {
    if (state.choice !== 'rating' && !state.picked) {
      XIUUI.toast('先选一个再继续');
      return;
    }
    if (state.choice === 'rating' && !state.rating) state.rating = state.stars[3] || 2;
    els.overlay.classList.remove('is-on');
    var done = choiceDone;
    choiceDone = null;
    state.choice = null;
    if (done) done();
  }

  /* ============================================================
     结局 + 图鉴 + 收藏卡
     ============================================================ */
  function showEnd() {
    state.phase = 'end';
    els.work.hidden = true;
    els.intro.hidden = true;
    els.end.hidden = false;
    els.codex.hidden = false;

    var pro = XIU.story.ending;
    $('endKicker').textContent = pro.kicker;
    $('endTitle').textContent = pro.title;
    els.endText.innerHTML = pro.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    els.endArt.insertAdjacentHTML('afterbegin', LacquerArt.interactivePlate({
      pattern: true, gold: true, polish: 1, mask: FULL
    }));
    els.endMeta.innerHTML =
      '<span>漆色 · ' + esc(state.color) + '</span>' +
      '<span>纹样 · ' + esc(state.pattern) + '</span>' +
      '<span>老师傅评 · ' + state.rating + ' 星</span>' +
      '<span>4 / 4 完成</span>';

    renderCodex();
    if (!state.cardNo) {
      state.cardNo = 'CHU-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    }
    if (!state.name) state.name = XIU.card.objectName;
    updateProgress();
    window.scrollTo(0, 0);
  }

  function renderCodex() {
    var grid = $('codexGrid');
    grid.innerHTML = XIU.codex.map(function (c, i) {
      var open = state.completed[i];
      return '<div class="codex-item' + (open ? ' is-open' : ' is-locked') + '">' +
        (open
          ? '<span class="codex-item__no">0' + (i + 1) + ' / UNLOCKED</span>' +
            '<h3 class="codex-item__name">' + esc(c.name) + '</h3>' +
            '<p class="codex-item__text">' + esc(c.text) + '</p>'
          : '<span class="codex-item__lock">鎖</span>' +
            '<p class="codex-item__text" style="text-align:center">完成「' + esc(XIU.craftSteps[i].name) + '」后解锁</p>') +
        '</div>';
    }).join('');
    var allOpen = state.completed.every(Boolean);
    var bonus = $('codexBonus');
    bonus.classList.toggle('is-on', allOpen);
    $('bonusTitle').textContent = XIU.codexBonus.title;
    $('bonusText').textContent = XIU.codexBonus.text;
  }

  function backToIntro() {
    state.phase = 'intro';
    els.work.hidden = true;
    els.end.hidden = true;
    els.codex.hidden = true;
    els.intro.hidden = false;
    $('startLabel').textContent = '继续刚才的工序';
    updateProgress();
    window.scrollTo(0, 0);
  }

  function reset() {
    state.phase = 'intro';
    state.step = 0;
    state.completed = [false, false, false, false];
    state.stars = [0, 0, 0, 0];
    state.locked = false;
    state.color = 'black';
    state.pattern = 'phoenix';
    state.rating = 0;
    state.cardNo = null;
    state.name = '';
    els.modal.classList.remove('is-open');
    els.modal.hidden = true;
    els.work.hidden = true;
    els.end.hidden = true;
    els.codex.hidden = true;
    els.intro.hidden = false;
    els.feedback.classList.remove('is-on');
    els.overlay.classList.remove('is-on');
    $('startLabel').textContent = XIU.story.prologue.action;
    document.body.classList.remove('is-locked');
    updateProgress();
    window.scrollTo(0, 0);
    XIUUI.toast('已重新开始');
  }

  function startStory() {
    els.intro.hidden = true;
    els.end.hidden = true;
    els.codex.hidden = true;
    els.work.hidden = false;
    if (state.completed.every(Boolean)) {
      showEnd();
      return;
    }
    changeStep(state.step);
  }

  function openCard() {
    state.lastFocus = document.activeElement;
    els.cardHead.textContent = XIU.card.title;
    els.cardSub.textContent = XIU.card.sub;
    els.cardArt.innerHTML = LacquerArt.interactivePlate({
      pattern: true, gold: true, polish: 1, mask: FULL
    });
    els.cardNo.textContent = state.cardNo || 'CHU-2026-0000';
    els.nameInput.value = state.name;
    els.cardName.textContent = state.name;
    els.cardLines.innerHTML = XIU.card.lines.map(function (l) {
      return '<span>' + esc(l) + '</span>';
    }).join('');
    els.modal.hidden = false;
    void els.modal.offsetWidth;
    els.modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    els.nameInput.focus();
    els.nameInput.select();
  }

  function closeCard() {
    els.modal.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { els.modal.hidden = true; }, 380);
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* 收藏卡 PNG：Canvas 合成 + 下载（依赖本地生成，无后端） */
  function drawSpaced(ctx, text, x, y, spacing) {
    var chars = Array.from(text);
    var widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + spacing * (chars.length - 1);
    var cx = x - total / 2;
    ctx.textAlign = 'left';
    chars.forEach(function (ch, i) {
      ctx.fillText(ch, cx, y);
      cx += widths[i] + spacing;
    });
    ctx.textAlign = 'center';
  }

  function saveCard() {
    state.name = (els.nameInput.value || '').trim().slice(0, 18) || state.name || '待填·默认器名';
    els.cardName.textContent = state.name;
    var btn = $('saveCard');
    btn.disabled = true;
    btn.querySelector('span').textContent = '正在生成…';

    var svgString = LacquerArt.interactivePlate({
      pattern: true, gold: true, polish: 1, mask: FULL
    }).replace('<svg ', '<svg width="900" height="900" ');
    var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    img.onload = function () {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0705';
        ctx.fillRect(0, 0, 1080, 1440);
        var g = ctx.createRadialGradient(540, 420, 40, 540, 420, 620);
        g.addColorStop(0, 'rgba(133,40,23,0.28)');
        g.addColorStop(1, 'rgba(10,7,5,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1080, 1440);
        ctx.strokeStyle = 'rgba(201,161,90,0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(38, 38, 1004, 1364);
        ctx.strokeStyle = 'rgba(201,161,90,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(52, 52, 976, 1336);

        ctx.fillStyle = '#c9a15a';
        ctx.font = '500 20px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        drawSpaced(ctx, '髹 · 两 面', 84, 116, 1);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(163,148,130,.8)';
        ctx.font = '400 13px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText('入戏传 / 我的楚漆', 996, 116);
        ctx.textAlign = 'center';

        ctx.fillStyle = '#e9e0d0';
        ctx.font = '400 50px "Songti SC", "STSong", "SimSun", serif';
        drawSpaced(ctx, XIU.card.title, 540, 204, 4);
        ctx.fillStyle = '#c9a15a';
        ctx.font = '400 14px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText(XIU.card.sub, 540, 240);

        ctx.drawImage(img, 190, 258, 700, 700);

        ctx.fillStyle = '#e8c98a';
        ctx.font = '400 36px "Songti SC", "STSong", "SimSun", serif';
        ctx.fillText(state.name, 540, 1022);

        ctx.strokeStyle = 'rgba(201,161,90,0.25)';
        ctx.beginPath();
        ctx.moveTo(190, 1058);
        ctx.lineTo(890, 1058);
        ctx.stroke();

        ctx.fillStyle = 'rgba(163,148,130,.95)';
        ctx.font = '400 15px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        var lines = XIU.card.lines;
        ctx.fillText(lines[0], 210, 1102);
        ctx.fillText(lines[2], 210, 1138);
        ctx.fillText(lines[1], 590, 1102);
        ctx.fillText(lines[3], 590, 1138);

        ctx.fillStyle = '#a92f1c';
        ctx.fillRect(812, 1160, 86, 86);
        ctx.strokeStyle = 'rgba(255,232,200,0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(817, 1165, 76, 76);
        ctx.fillStyle = '#f8e5c8';
        ctx.font = '400 48px "Kaiti SC", "STKaiti", "KaiTi", serif';
        ctx.textAlign = 'center';
        ctx.fillText(XIU.card.seal, 855, 1222);

        ctx.fillStyle = 'rgba(163,148,130,.6)';
        ctx.font = '400 12px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(state.cardNo || '', 84, 1300);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(126,113,99,.8)';
        ctx.font = '400 12px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText(XIU.card.note, 540, 1338);

        canvas.toBlob(function (out) {
          if (!out) throw new Error('toBlob failed');
          var a = document.createElement('a');
          var dl = URL.createObjectURL(out);
          a.href = dl;
          a.download = '髹-我的楚漆-' + (state.cardNo || 'card') + '.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(function () { URL.revokeObjectURL(dl); }, 2000);
          XIUUI.toast('收藏卡已保存');
          btn.disabled = false;
          btn.querySelector('span').textContent = '保存收藏卡（PNG）';
        }, 'image/png');
      } catch (err) {
        console.error(err);
        XIUUI.toast('保存失败，请尝试截图保存');
        btn.disabled = false;
        btn.querySelector('span').textContent = '保存收藏卡（PNG）';
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      XIUUI.toast('图片生成失败，请尝试截图保存');
      btn.disabled = false;
      btn.querySelector('span').textContent = '保存收藏卡（PNG）';
    };
    img.src = url;
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    cache();
    if (!window.XIU || !window.LacquerArt) return;

    var pro = XIU.story.prologue;
    $('introKicker').textContent = pro.kicker;
    $('introTitle').textContent = pro.title;
    $('introText').innerHTML = pro.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('introNote').textContent = pro.note;
    $('startLabel').textContent = pro.action;

    $('startStory').addEventListener('click', startStory);
    $('storyReset').addEventListener('click', reset);
    $('backToIntro').addEventListener('click', backToIntro);
    $('prevStep').addEventListener('click', prev);
    $('nextStep').addEventListener('click', next);
    $('feedbackNext').addEventListener('click', next);
    $('feedbackStay').addEventListener('click', function () { els.feedback.classList.remove('is-on'); });
    $('skipStep').addEventListener('click', function () {
      if (state.completed[state.step]) return;
      completeStep();
    });
    els.choiceConfirm.addEventListener('click', confirmChoice);

    $('openCard').addEventListener('click', openCard);
    $('closeCard').addEventListener('click', closeCard);
    $('redoStory').addEventListener('click', function () { closeCard(); setTimeout(reset, 300); });
    $('saveCard').addEventListener('click', saveCard);

    els.nameInput.addEventListener('input', function () {
      state.name = els.nameInput.value.trim();
      els.cardName.textContent = state.name || '待填·默认器名';
    });

    els.modal.addEventListener('click', function (e) {
      if (e.target === els.modal) closeCard();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (els.modal.classList.contains('is-open')) closeCard();
        else if (els.overlay.classList.contains('is-on')) els.overlay.classList.remove('is-on');
      }
      if (e.key === 'Tab' && els.modal.classList.contains('is-open')) {
        var focusables = XIUUI.$$('button, input, a[href]', els.modal).filter(function (el) {
          return !el.disabled && el.offsetParent !== null;
        });
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
