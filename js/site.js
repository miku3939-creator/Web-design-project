/* 髹·两面 框架版 — 全站公共脚本
 * 导航、推门转场、滚动揭示、移动菜单、Toast 与工具函数。
 * 页面级脚本通过 window.XIUUI 取用公共能力。
 */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function escapeHTML(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  var toastTimer;
  function toast(message) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
  }

  /* 滚动揭示 */
  function observeReveals(root) {
    var nodes = $$('.reveal', root || document);
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* 伪 3D 倾斜：data-tilt 指定最大角度 */
  function initTilt(el, opts) {
    if (!el) return;
    opts = opts || {};
    var max = opts.max || 4;
    var raf = null, tx = 0, ty = 0;
    function apply() {
      el.style.setProperty('--rx', tx.toFixed(3));
      el.style.setProperty('--ry', ty.toFixed(3));
      raf = null;
    }
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * max;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    el.addEventListener('pointerleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  /* 页头：滚动态 + 移动菜单 */
  function initHead() {
    var head = $('.site-head');
    var onScroll = function () {
      if (head) head.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = $('.nav-toggle');
    var mobile = $('.mobile-nav');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('is-locked', open);
      });
      $$('a', mobile).forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('nav-open', 'is-locked');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
          document.body.classList.remove('nav-open', 'is-locked');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
    }
  }

  function setActiveNav() {
    var map = {
      home: 'home', collection: 'collection', artifact: 'collection',
      story: 'story', about: 'about'
    };
    var active = map[document.body.getAttribute('data-page')];
    $$('.site-nav a[data-nav], .mobile-nav a[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
    });
  }

  /* 推门转场：站内 .html 跳转统一走两扇门 */
  function initDoor() {
    var door = document.createElement('div');
    door.className = 'door';
    door.setAttribute('aria-hidden', 'true');
    door.innerHTML = '<div class="door__panel"></div><div class="door__line"></div><div class="door__panel"></div>';
    document.body.appendChild(door);

    var fade = document.createElement('div');
    fade.className = 'page-fade';
    fade.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fade);

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!/\.html(\?|#|$)/i.test(href)) return;
      if (a.closest('.no-door')) return;
      e.preventDefault();
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { window.location.href = href; return; }
      door.classList.add('is-on');
      setTimeout(function () {
        fade.classList.add('is-on');
        setTimeout(function () { window.location.href = href; }, 180);
      }, 240);
    });

    window.addEventListener('pageshow', function () {
      door.classList.remove('is-on');
      fade.classList.remove('is-on');
    });
  }

  /* 槽位检查工具：开发时在控制台看还有多少『待填』没写 */
  function reportSlots() {
    if (!window.console) return;
    var text = $$('.slot').filter(function (s) {
      return /待填/.test(s.textContent || '');
    }).length;
    var stubs = $$('.stub').length;
    var badges = $$('.temp-badge').length;
    console.log('[髹·两面 框架] 待填文字槽位：' + text + ' · 互动 stub：' + stubs + ' · 临时图：' + badges);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('is-ready');
    initHead();
    setActiveNav();
    initDoor();
    observeReveals(document);
    $$('[data-tilt]').forEach(function (el) {
      initTilt(el, { max: parseFloat(el.getAttribute('data-tilt')) || 4 });
    });
    reportSlots();
  });

  window.XIUUI = {
    $: $, $$: $$,
    escapeHTML: escapeHTML,
    debounce: debounce,
    toast: toast,
    observeReveals: observeReveals,
    initTilt: initTilt,
    reportSlots: reportSlots
  };
})();
