/* 髹·两面 — 原创 SVG 器物绘制系统
 * 所有图像均为本项目手绘矢量，不含任何文物照片或第三方图片。
 */
(function () {
  'use strict';

  var P = {
    black: '#070504',
    ink: '#100c0a',
    body: '#1a1210',
    red: '#a9321f',
    red2: '#c94a2e',
    red3: '#741f13',
    redDeep: '#5a170e',
    gold: '#c9a15a',
    gold2: '#e8c98a',
    gold3: '#8f6b33',
    bone: '#e7dcc8',
    muted: '#9b8b76',
    jade: '#7d8a6a',
    silver: '#b9b3a6'
  };

  var counter = 0;
  function uid(prefix) {
    counter += 1;
    return prefix + '-' + counter;
  }

  function svg(vb, body, label, cls) {
    return (
      '<svg class="art ' + (cls || '') + '" viewBox="' + vb + '" role="img" aria-label="' +
      label + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      body +
      '</svg>'
    );
  }

  function defs(id) {
    return (
      '<defs>' +
      '<radialGradient id="' + id + '-red" cx="36%" cy="28%" r="82%">' +
      '<stop offset="0" stop-color="#d9583a"/><stop offset=".5" stop-color="#ac3420"/><stop offset="1" stop-color="#691b10"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + id + '-gold" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#f3ddaa"/><stop offset=".42" stop-color="#d3ac64"/><stop offset=".78" stop-color="#b3894c"/><stop offset="1" stop-color="#7d5a2a"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + id + '-black" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0" stop-color="#2b1f1a"/><stop offset=".42" stop-color="#130d0b"/><stop offset="1" stop-color="#060403"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + id + '-halo" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#8e2a19" stop-opacity=".5"/><stop offset=".55" stop-color="#5a1a10" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="' + id + '-drum" cx="38%" cy="32%" r="78%">' +
      '<stop offset="0" stop-color="#d45a3a"/><stop offset=".55" stop-color="#a9321f"/><stop offset="1" stop-color="#61180e"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + id + '-sheen" x1="0" y1="0" x2="0.7" y2="1">' +
      '<stop offset="0" stop-color="#fff4dc" stop-opacity=".17"/><stop offset=".45" stop-color="#fff4dc" stop-opacity=".04"/><stop offset="1" stop-color="#fff4dc" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + id + '-wood" x1="0" y1="0" x2="0.8" y2="1">' +
      '<stop offset="0" stop-color="#d0a874"/><stop offset=".5" stop-color="#b78a56"/><stop offset="1" stop-color="#8a6136"/>' +
      '</linearGradient>' +
      '<clipPath id="' + id + '-plateclip"><circle cx="450" cy="450" r="318"/></clipPath>' +
      '</defs>'
    );
  }

  // Deterministic dust so re-renders are stable.
  function rng(seed) {
    var s = seed || 7;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function dust(seed, n, cx, cy, rx, ry) {
    var r = rng(seed);
    var out = '<g class="art__dust" aria-hidden="true">';
    for (var i = 0; i < n; i++) {
      var x = cx + (r() * 2 - 1) * rx;
      var y = cy + (r() * 2 - 1) * ry;
      var rad = 0.8 + r() * 2.2;
      var op = 0.12 + r() * 0.45;
      out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rad.toFixed(2) + '" fill="' + P.gold2 + '" opacity="' + op.toFixed(2) + '"/>';
    }
    return out + '</g>';
  }

  function swirl(cx, cy, size, turn, stroke, width, opacity) {
    var d = 'M ' + cx + ' ' + cy;
    for (var i = 1; i <= turn * 12; i++) {
      var t = i / (turn * 12);
      var a = t * Math.PI * 2 * turn;
      var rad = size * (1 - t * 0.82);
      d += ' L ' + (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad * 0.72).toFixed(2);
    }
    return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + width + '" stroke-linecap="round" opacity="' + (opacity == null ? 0.7 : opacity) + '"/>';
  }

  function cloudMotif(cx, cy, s, stroke, opacity) {
    return '<g transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round" opacity="' + opacity + '">' +
      '<path d="M -72 10 C -48 -18 -12 -22 8 -4 C 24 10 18 30 0 34 C -14 37 -26 26 -22 14 C -19 5 -8 2 0 8"/>' +
      '<path d="M -102 22 C -90 4 -72 0 -58 10 C -48 18 -50 32 -62 36"/>' +
      '<path d="M 34 4 C 48 -10 68 -8 78 6 C 86 18 80 32 68 34"/>' +
      '<path d="M -6 34 C 14 42 34 40 48 32"/>' +
      '</g>';
  }

  /* ============================================================
   * 01 虎座鸟架鼓 — 首页主视觉 / 典藏 001
   * ============================================================ */
  function drumstand(opts) {
    opts = opts || {};
    var id = uid('drum');
    var detail = opts.detail !== false;
    var dark = '#2a130d';
    var dark2 = '#3d180f';
    var red = P.red;
    var red2 = P.red2;
    var gold = P.gold;
    var gold2 = P.gold2;
  
    /* —— 虎：侧身伏踞，背向而立 —— */
    var tiger =
      '<g class="tiger">' +
      '<path d="M 392 688 C 430 676 450 646 440 616 C 434 598 414 592 404 604 C 396 616 404 628 416 626" fill="none" stroke="' + dark2 + '" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M 392 688 C 430 676 450 646 440 616 C 434 598 414 592 404 604" fill="none" stroke="' + gold + '" stroke-width="1.5" opacity=".6"/>' +
      '<path d="M 118 682 C 116 662 128 648 146 644 C 158 632 176 628 190 636 C 204 622 226 620 242 628 C 282 614 332 618 364 634 C 392 648 404 668 398 690 C 394 708 378 718 358 720 L 318 722 C 306 734 288 734 278 722 L 240 726 C 226 738 208 736 200 724 C 172 716 148 702 136 690 C 126 688 119 686 118 682 Z" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<g class="tiger-head">' +
      '<ellipse cx="158" cy="658" rx="43" ry="37" fill="' + dark2 + '" stroke="' + gold + '" stroke-width="2.6"/>' +
      '<path d="M 120 650 C 102 652 92 662 96 673 C 100 684 114 686 126 678 C 132 674 136 668 136 662 Z" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.2"/>' +
      '<path d="M 126 638 L 118 616 L 140 630 Z M 160 630 L 168 608 L 182 630 Z" fill="' + red + '" stroke="' + gold + '" stroke-width="1.3"/>' +
      '<path d="M 120 648 C 128 642 138 642 146 648" fill="none" stroke="' + red + '" stroke-width="3" opacity=".7"/>' +
      '<circle cx="148" cy="652" r="5" fill="' + gold2 + '"/><circle cx="149" cy="652" r="2.1" fill="#000"/>' +
      '<path d="M 100 668 C 108 666 116 666 122 668" fill="none" stroke="' + gold + '" stroke-width="1.8"/>' +
      '<path d="M 108 676 C 116 680 124 680 130 676" fill="none" stroke="' + red + '" stroke-width="2" opacity=".65"/>' +
      '<path d="M 138 676 C 146 680 154 680 160 676" fill="none" stroke="' + dark + '" stroke-width="1.6" opacity=".8"/>' +
      '<path d="M 150 620 C 154 632 154 642 150 652" fill="none" stroke="' + red + '" stroke-width="3" opacity=".55"/>' +
      '</g>' +
      '<g fill="none" stroke="' + red + '" stroke-width="4.8" stroke-linecap="round" opacity=".85">' +
      '<path d="M 206 626 C 212 640 214 654 210 668"/>' +
      '<path d="M 244 620 C 250 634 252 648 248 662"/>' +
      '<path d="M 282 618 C 288 632 290 646 286 660"/>' +
      '<path d="M 320 622 C 326 636 328 650 324 664"/>' +
      '<path d="M 356 632 C 362 646 364 658 360 672"/>' +
      '</g>' +
      '<g fill="none" stroke="' + gold + '" stroke-width="1.2" opacity=".38">' +
      '<path d="M 196 650 C 220 642 248 642 268 650"/>' +
      '<path d="M 192 674 C 216 666 244 666 266 674"/>' +
      '</g>' +
      '<path d="M 214 720 C 228 712 244 712 256 720 M 300 720 C 314 712 330 712 342 720" fill="none" stroke="' + gold + '" stroke-width="2" opacity=".5"/>' +
      '<path d="M 230 700 C 250 694 272 694 290 700" fill="none" stroke="' + red + '" stroke-width="1.6" opacity=".45"/>' +
      '</g>';
  
    /* —— 凤：长颈、鹿角、卷尾 —— */
    var tails =
      '<g class="ph-tails" transform="translate(-40 8)">' +
      '<path d="M 256 592 C 200 626 152 668 118 716 C 156 724 196 708 228 680 C 252 658 264 618 256 592 Z" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M 268 598 C 226 642 202 686 196 730 C 230 724 262 702 284 674 C 302 650 296 616 268 598 Z" fill="' + dark2 + '" stroke="' + gold + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M 282 602 C 266 650 264 696 276 736 C 304 720 322 690 322 656 C 322 632 306 610 282 602 Z" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M 146 704 C 178 692 204 670 222 642 M 208 704 C 236 688 258 664 270 636 M 276 700 C 290 680 300 658 302 636" fill="none" stroke="' + red + '" stroke-width="2" opacity=".65"/>' +
      '</g>';
  
    var legs =
      '<g class="ph-legs" fill="none" stroke="' + gold + '" stroke-width="4.4" stroke-linecap="round">' +
      '<path d="M 252 602 C 248 616 246 628 244 638"/>' +
      '<path d="M 286 604 C 288 618 290 628 292 638"/>' +
      '<path d="M 244 638 L 228 646 M 244 638 L 242 654 M 244 638 L 258 648" stroke-width="2.8"/>' +
      '<path d="M 292 638 L 276 646 M 292 638 L 292 654 M 292 638 L 306 648" stroke-width="2.8"/>' +
      '</g>';
  
    var phoenix =
      '<g class="phoenix">' +
      '<ellipse cx="268" cy="572" rx="46" ry="35" transform="rotate(-12 268 572)" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.4"/>' +
      '<path d="M 234 562 C 250 532 290 524 318 544 C 302 570 268 584 238 576 C 232 572 231 566 234 562 Z" fill="' + dark2 + '" stroke="' + gold + '" stroke-width="2.2"/>' +
      '<path d="M 246 560 C 266 546 290 544 310 554 M 254 572 C 272 562 292 560 310 566" fill="none" stroke="' + red + '" stroke-width="2.2" opacity=".8"/>' +
      '<path d="M 242 542 C 256 522 284 516 304 528" fill="none" stroke="' + gold + '" stroke-width="1.3" opacity=".45"/>' +
      '<path d="M 280 548 C 296 490 318 410 330 340 L 352 346 C 338 418 320 500 308 558 Z" fill="' + dark + '" stroke="' + gold + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M 294 520 C 308 464 322 406 334 362" fill="none" stroke="' + red + '" stroke-width="2" opacity=".55"/>' +
      '<ellipse cx="352" cy="319" rx="27" ry="20" transform="rotate(-20 352 319)" fill="' + dark2 + '" stroke="' + gold + '" stroke-width="2.4"/>' +
      '<path d="M 368 306 C 392 302 412 312 420 326 C 402 334 382 330 370 320 Z" fill="' + red + '" stroke="' + gold + '" stroke-width="1.2"/>' +
      '<path d="M 372 322 C 386 324 397 323 405 319" fill="none" stroke="' + dark + '" stroke-width="1.8" opacity=".7"/>' +
      '<circle cx="356" cy="315" r="3.2" fill="' + gold2 + '"/><circle cx="356.6" cy="315.2" r="1.3" fill="#000"/>' +
      '<path d="M 338 306 C 322 288 326 268 340 256 C 348 248 360 248 368 254" fill="none" stroke="' + gold + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M 346 300 C 354 284 368 274 382 270" fill="none" stroke="' + red2 + '" stroke-width="2" stroke-linecap="round" opacity=".8"/>' +
      '<g fill="none" stroke-linecap="round">' +
      '<g stroke="#0b0705" stroke-width="7" opacity=".45">' +
      '<path d="M 336 300 C 322 268 314 236 316 202"/>' +
      '<path d="M 362 300 C 374 266 384 232 388 198"/>' +
      '</g>' +
      '<g stroke="' + gold + '" stroke-width="3.4">' +
      '<path d="M 336 300 C 322 268 314 236 316 202"/>' +
      '<path d="M 316 238 C 296 230 284 218 280 202"/>' +
      '<path d="M 316 216 C 330 206 338 194 340 178"/>' +
      '<path d="M 362 300 C 374 266 384 232 388 198"/>' +
      '<path d="M 386 234 C 404 224 416 212 422 196"/>' +
      '<path d="M 386 212 C 372 202 366 190 364 176"/>' +
      '</g>' +
      '<g fill="' + gold2 + '">' +
      '<circle cx="316" cy="202" r="2.8"/><circle cx="280" cy="202" r="2.4"/><circle cx="340" cy="178" r="2.4"/>' +
      '<circle cx="388" cy="198" r="2.8"/><circle cx="422" cy="196" r="2.4"/><circle cx="364" cy="176" r="2.4"/>' +
      '</g>' +
      '</g>' +
      '</g>';
  
    /* —— 鼓 —— */
    var studs = '';
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2;
      studs += '<circle cx="' + (450 + Math.cos(a) * 80).toFixed(1) + '" cy="' + (392 + Math.sin(a) * 70).toFixed(1) + '" r="2.2" fill="' + gold2 + '" opacity=".8"/>';
    }
    var drum =
      '<g class="drum">' +
      '<ellipse cx="446" cy="402" rx="90" ry="80" fill="#3a1009"/>' +
      '<ellipse cx="450" cy="392" rx="90" ry="80" fill="url(#' + id + '-drum)" stroke="' + gold + '" stroke-width="3.2"/>' +
      '<ellipse cx="450" cy="392" rx="77" ry="67" fill="none" stroke="' + gold2 + '" stroke-width="1.5" opacity=".65"/>' +
      '<ellipse cx="450" cy="392" rx="61" ry="52" fill="none" stroke="' + P.redDeep + '" stroke-width="2" opacity=".7"/>' +
      '<path d="M 450 392 C 466 374 490 380 492 398 C 494 418 474 430 458 420 C 442 410 442 388 458 380" fill="none" stroke="' + gold2 + '" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M 450 392 C 434 410 410 404 408 386 C 406 366 426 354 442 364 C 458 374 458 396 442 404" fill="none" stroke="' + gold2 + '" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>' +
      '<circle cx="450" cy="392" r="4" fill="' + gold + '" opacity=".85"/>' +
      '<g fill="' + gold2 + '" opacity=".5">' +
      '<circle cx="450" cy="352" r="1.5"/><circle cx="478" cy="362" r="1.5"/><circle cx="490" cy="392" r="1.5"/><circle cx="478" cy="422" r="1.5"/>' +
      '<circle cx="450" cy="432" r="1.5"/><circle cx="422" cy="422" r="1.5"/><circle cx="410" cy="392" r="1.5"/><circle cx="422" cy="362" r="1.5"/>' +
      '</g>' +
      '<path d="M 400 350 C 414 326 442 314 466 320" fill="none" stroke="#fff6e4" stroke-width="6" stroke-linecap="round" opacity=".12"/>' +
      studs +
      '<path d="M 450 472 L 450 492" stroke="' + red + '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="450" cy="496" r="4.5" fill="' + gold + '"/>' +
      '<path d="M 442 504 C 438 516 442 526 450 530 C 458 526 462 516 458 504" fill="none" stroke="' + red + '" stroke-width="2" opacity=".65"/>' +
      '</g>';
  
    var cords =
      '<g class="cords" fill="none" stroke-linecap="round">' +
      '<path d="M 412 318 C 398 290 376 254 350 220" stroke="' + P.redDeep + '" stroke-width="2.6"/>' +
      '<path d="M 488 318 C 502 290 524 254 550 220" stroke="' + P.redDeep + '" stroke-width="2.6"/>' +
      '<path d="M 412 318 C 398 290 376 254 350 220" stroke="' + gold + '" stroke-width=".9" opacity=".55"/>' +
      '<path d="M 488 318 C 502 290 524 254 550 220" stroke="' + gold + '" stroke-width=".9" opacity=".55"/>' +
      '<circle cx="350" cy="220" r="3.6" fill="' + gold + '" stroke="none"/>' +
      '<circle cx="550" cy="220" r="3.6" fill="' + gold + '" stroke="none"/>' +
      '</g>';
  
    var base =
      '<g class="base">' +
      '<rect x="120" y="740" width="660" height="30" rx="6" fill="url(#' + id + '-black)" stroke="' + gold + '" stroke-width="2.2"/>' +
      '<rect x="142" y="766" width="616" height="22" rx="3" fill="#090605" stroke="' + P.gold3 + '" stroke-width="1.1"/>' +
      '<path d="M 134 756 C 178 746 222 764 266 754 C 310 744 354 764 398 754 C 442 744 486 764 530 754 C 574 744 618 764 662 754 C 700 746 730 760 766 754" fill="none" stroke="' + red + '" stroke-width="2" opacity=".5"/>' +
      '<g fill="' + gold2 + '" opacity=".5">' +
      '<circle cx="170" cy="776" r="1.8"/><circle cx="228" cy="776" r="1.8"/><circle cx="286" cy="776" r="1.8"/><circle cx="344" cy="776" r="1.8"/>' +
      '<circle cx="402" cy="776" r="1.8"/><circle cx="460" cy="776" r="1.8"/><circle cx="518" cy="776" r="1.8"/><circle cx="576" cy="776" r="1.8"/><circle cx="634" cy="776" r="1.8"/><circle cx="692" cy="776" r="1.8"/>' +
      '</g>' +
      '</g>';
  
    var halo =
      '<g class="halo">' +
      '<circle cx="450" cy="410" r="350" fill="url(#' + id + '-halo)"/>' +
      '<circle cx="450" cy="410" r="330" fill="none" stroke="' + gold + '" stroke-width="1" opacity=".14"/>' +
      '<circle cx="450" cy="410" r="352" fill="none" stroke="' + gold + '" stroke-width="1" opacity=".07" stroke-dasharray="2 11"/>' +
      '<path d="M 450 60 L 450 82 M 450 738 L 450 760 M 86 410 L 108 410 M 792 410 L 814 410" stroke="' + gold + '" stroke-width="1" opacity=".22"/>' +
      '</g>';
  
    var body =
      defs(id) +
      '<ellipse cx="450" cy="804" rx="350" ry="28" fill="#000" opacity=".62"/>' +
      '<ellipse cx="450" cy="800" rx="220" ry="14" fill="' + P.redDeep + '" opacity=".28"/>' +
      halo +
      dust(5, detail ? 30 : 14, 450, 420, 380, 310) +
      '<g class="tails-layer">' + tails + '<g transform="translate(900 0) scale(-1 1)">' + tails + '</g></g>' +
      base +
      '<g class="tigers-layer"><g class="tiger-l">' + tiger + '</g><g transform="translate(900 0) scale(-1 1)">' + tiger + '</g></g>' +
      drum +
      '<g class="phoenix-layer"><g class="phoenix-l">' + legs + phoenix + '</g><g transform="translate(900 0) scale(-1 1)">' + legs + phoenix + '</g></g>' +
      cords +
      '<g class="front">' +
      '<circle cx="300" cy="370" r="1.8" fill="' + gold2 + '" opacity=".45"/><circle cx="606" cy="382" r="1.4" fill="' + gold2 + '" opacity=".4"/>' +
      '</g>';
  
    return svg('0 0 900 900', body, '虎座鸟架鼓，双虎双凤与悬鼓', 'art--drum');
  }

  /* ============================================================
   * 02 耳杯
   * ============================================================ */
  function earcup() {
    var id = uid('earcup');
    var phoenix = '<g transform="translate(300 302) scale(.34 .2) translate(-455 -340)">' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.gold + '" stroke-width="7" opacity=".22"/>' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.gold2 + '" stroke-width="2.6"/>' +
      phoenixAccent() +
      '</g>';

    var body =
      defs(id) +
      '<ellipse cx="300" cy="456" rx="206" ry="36" fill="#000" opacity=".55"/>' +
      '<g class="cup">' +
      // ears
      '<path d="M 132 292 C 78 262 34 288 44 330 C 54 370 100 372 136 340 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<path d="M 468 292 C 522 262 566 288 556 330 C 546 370 500 372 464 340 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<path d="M 112 308 C 86 300 72 318 82 338 C 90 354 110 352 122 340" fill="none" stroke="' + P.red + '" stroke-width="2.4" opacity=".8"/>' +
      '<path d="M 488 308 C 514 300 528 318 518 338 C 510 354 490 352 478 340" fill="none" stroke="' + P.red + '" stroke-width="2.4" opacity=".8"/>' +
      '<g fill="none" stroke="' + P.gold + '" stroke-width="1" opacity=".45">' +
      '<path d="M 108 292 C 78 284 58 302 62 326 M 100 314 C 82 314 72 326 76 340 M 508 292 C 538 284 558 302 554 326 M 516 314 C 534 314 544 326 540 340"/>' +
      '</g>' +
      // body
      '<path d="M 110 302 C 110 374 178 438 300 438 C 422 438 490 374 490 302 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.8"/>' +
      '<ellipse cx="300" cy="302" rx="190" ry="106" fill="url(#' + id + '-red)" stroke="url(#' + id + '-gold)" stroke-width="3"/>' +
      '<ellipse cx="300" cy="302" rx="168" ry="88" fill="#4d150d"/>' +
      '<ellipse cx="300" cy="302" rx="168" ry="88" fill="url(#' + id + '-red)" opacity=".55"/>' +
      '<ellipse cx="300" cy="302" rx="146" ry="72" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".55"/>' +
      '<g opacity=".95">' + phoenix + '</g>' +
      // side pattern
      '<path d="M 132 348 C 178 400 238 416 300 416 C 362 416 422 400 468 348" fill="none" stroke="' + P.gold + '" stroke-width="1.3" opacity=".45"/>' +
      '<path d="M 148 366 C 190 406 244 420 300 420 C 356 420 410 406 452 366" fill="none" stroke="' + P.red + '" stroke-width="1.6" opacity=".5"/>' +
      '<g fill="' + P.gold2 + '" opacity=".55"><circle cx="190" cy="386" r="2"/><circle cx="240" cy="402" r="2"/><circle cx="300" cy="408" r="2"/><circle cx="360" cy="402" r="2"/><circle cx="410" cy="386" r="2"/></g>' +
      '<path d="M 146 290 C 180 238 238 218 300 218" fill="none" stroke="#fff6e4" stroke-width="8" stroke-linecap="round" opacity=".13"/>' +
      '</g>' +
      '<g opacity=".32"><ellipse cx="300" cy="464" rx="150" ry="14" fill="' + P.red + '"/></g>';

    return svg('0 0 600 600', body, '彩绘变形凤鸟纹漆耳杯', 'art--earcup');
  }

  /* ============================================================
   * 03 圆奁
   * ============================================================ */
  function lian() {
    var id = uid('lian');
    var body =
      defs(id) +
      '<ellipse cx="300" cy="512" rx="212" ry="34" fill="#000" opacity=".55"/>' +
      '<g class="box">' +
      // body wall
      '<path d="M 126 336 L 126 452 C 126 492 204 516 300 516 C 396 516 474 492 474 452 L 474 336 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<path d="M 126 430 C 170 456 230 466 300 466 C 370 466 430 456 474 430" fill="none" stroke="' + P.red + '" stroke-width="2.2" opacity=".6"/>' +
      '<path d="M 136 408 C 180 434 236 444 300 444 C 364 444 420 434 464 408" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".35"/>' +
      // diamonds on side
      '<g fill="none" stroke="' + P.gold + '" stroke-width="1.4" opacity=".55">' +
      '<path d="M 166 462 l 16 -16 16 16 -16 16 Z M 222 474 l 16 -16 16 16 -16 16 Z M 278 479 l 16 -16 16 16 -16 16 Z M 334 478 l 16 -16 16 16 -16 16 Z M 390 470 l 16 -16 16 16 -16 16 Z"/>' +
      '</g>' +
      // lid rim
      '<ellipse cx="300" cy="336" rx="174" ry="48" fill="' + P.redDeep + '" stroke="url(#' + id + '-gold)" stroke-width="3"/>' +
      '<ellipse cx="300" cy="330" rx="174" ry="48" fill="url(#' + id + '-black)" stroke="' + P.gold + '" stroke-width="1.4"/>' +
      // dome
      '<path d="M 126 330 C 136 260 206 220 300 220 C 394 220 464 260 474 330 C 474 348 394 364 300 364 C 206 364 126 348 126 330 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<ellipse cx="300" cy="286" rx="134" ry="52" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".4"/>' +
      '<path d="M 300 224 C 316 210 330 214 332 226" fill="none" stroke="' + P.gold2 + '" stroke-width="3" stroke-linecap="round"/>' +
      cloudMotif(300, 286, 1.15, P.gold2, 0.8) +
      '<path d="M 232 306 C 268 282 330 282 366 306" fill="none" stroke="' + P.red2 + '" stroke-width="2" opacity=".5"/>' +
      '<g fill="' + P.gold2 + '" opacity=".6"><circle cx="196" cy="306" r="2"/><circle cx="404" cy="306" r="2"/><circle cx="300" cy="346" r="2"/><circle cx="300" cy="252" r="2"/></g>' +
      '<path d="M 158 300 C 190 246 242 226 300 226" fill="none" stroke="#fff6e4" stroke-width="9" stroke-linecap="round" opacity=".1"/>' +
      '</g>';

    return svg('0 0 600 600', body, '彩绘云凤纹漆圆奁', 'art--lian');
  }

  /* ============================================================
   * 04 漆盘
   * ============================================================ */
  function plate() {
    var id = uid('plate');
    var body =
      defs(id) +
      '<ellipse cx="300" cy="470" rx="228" ry="32" fill="#000" opacity=".5"/>' +
      '<g class="dish">' +
      '<ellipse cx="300" cy="344" rx="230" ry="148" fill="#4c140c" stroke="url(#' + id + '-gold)" stroke-width="3"/>' +
      '<ellipse cx="300" cy="334" rx="230" ry="148" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<ellipse cx="300" cy="334" rx="196" ry="120" fill="none" stroke="' + P.red + '" stroke-width="2.6" opacity=".7"/>' +
      '<ellipse cx="300" cy="334" rx="176" ry="105" fill="url(#' + id + '-red)" stroke="' + P.gold + '" stroke-width="1.6"/>' +
      '<ellipse cx="300" cy="334" rx="176" ry="105" fill="url(#' + id + '-black)" opacity=".32"/>' +
      '<ellipse cx="300" cy="334" rx="158" ry="92" fill="none" stroke="' + P.gold + '" stroke-width="1.1" opacity=".45"/>' +
      '<defs><clipPath id="' + id + '-dishclip"><ellipse cx="300" cy="334" rx="178" ry="107"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + '-dishclip)">' +
      '<g transform="translate(300 334) scale(.52) translate(-455 -340)">' +
      '<g opacity=".95">' + phoenixRed(id, 0.9) + '</g>' +
      '<g opacity=".95">' + phoenixGold(0.95) + '</g>' +
      '</g>' +
      '</g>' +
      // rim pattern
      '<g fill="' + P.gold2 + '" opacity=".7">' +
      '<circle cx="300" cy="196" r="2.2"/><circle cx="382" cy="204" r="2.2"/><circle cx="454" cy="234" r="2.2"/><circle cx="502" cy="290" r="2.2"/><circle cx="512" cy="354" r="2.2"/><circle cx="492" cy="412" r="2.2"/><circle cx="440" cy="458" r="2.2"/><circle cx="366" cy="480" r="2.2"/><circle cx="300" cy="486" r="2.2"/><circle cx="234" cy="480" r="2.2"/><circle cx="160" cy="458" r="2.2"/><circle cx="108" cy="412" r="2.2"/><circle cx="88" cy="354" r="2.2"/><circle cx="98" cy="290" r="2.2"/><circle cx="146" cy="234" r="2.2"/><circle cx="218" cy="204" r="2.2"/>' +
      '</g>' +
      '<path d="M 126 268 C 170 214 234 190 300 190" fill="none" stroke="#fff6e4" stroke-width="10" stroke-linecap="round" opacity=".11"/>' +
      '</g>';

    return svg('0 0 600 600', body, '彩绘凤鸟纹漆圆盘', 'art--plate');
  }

  /* ============================================================
   * 05 漆豆
   * ============================================================ */
  function dou() {
    var id = uid('dou');
    var body =
      defs(id) +
      '<ellipse cx="300" cy="506" rx="170" ry="28" fill="#000" opacity=".55"/>' +
      '<g class="dou">' +
      // foot
      '<path d="M 204 468 C 204 452 246 440 300 440 C 354 440 396 452 396 468 L 382 486 C 360 496 240 496 218 486 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.4"/>' +
      '<ellipse cx="300" cy="464" rx="96" ry="22" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".45"/>' +
      // stem
      '<path d="M 272 332 L 262 456 C 278 466 322 466 338 456 L 328 332 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.4"/>' +
      '<path d="M 266 372 C 286 380 314 380 334 372 M 264 404 C 284 412 316 412 336 404 M 263 436 C 283 444 317 444 337 436" fill="none" stroke="' + P.red + '" stroke-width="1.8" opacity=".55"/>' +
      // bowl
      '<path d="M 132 236 C 132 300 206 342 300 342 C 394 342 468 300 468 236 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.8"/>' +
      '<ellipse cx="300" cy="236" rx="168" ry="56" fill="url(#' + id + '-red)" stroke="url(#' + id + '-gold)" stroke-width="3"/>' +
      '<ellipse cx="300" cy="236" rx="146" ry="42" fill="#4d150d"/>' +
      '<ellipse cx="300" cy="236" rx="146" ry="42" fill="url(#' + id + '-red)" opacity=".45"/>' +
      '<ellipse cx="300" cy="236" rx="128" ry="32" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".5"/>' +
      cloudMotif(300, 238, 0.62, P.gold2, 0.75) +
      // bands
      '<path d="M 142 260 C 190 300 240 316 300 316 C 360 316 410 300 458 260" fill="none" stroke="' + P.red + '" stroke-width="2.2" opacity=".6"/>' +
      '<path d="M 148 272 C 194 310 242 326 300 326 C 358 326 406 310 452 272" fill="none" stroke="' + P.gold + '" stroke-width="1.1" opacity=".35"/>' +
      '<g fill="none" stroke="' + P.gold + '" stroke-width="1.4" opacity=".55">' +
      '<path d="M 180 276 l 13 -13 13 13 -13 13 Z M 236 292 l 13 -13 13 13 -13 13 Z M 292 298 l 13 -13 13 13 -13 13 Z M 348 292 l 13 -13 13 13 -13 13 Z M 402 276 l 13 -13 13 13 -13 13 Z"/>' +
      '</g>' +
      '<path d="M 166 220 C 204 182 254 170 300 172" fill="none" stroke="#fff6e4" stroke-width="9" stroke-linecap="round" opacity=".11"/>' +
      '</g>';

    return svg('0 0 600 600', body, '彩漆豆，浅盘高柄盛食器', 'art--dou');
  }

  /* ============================================================
   * 06 小座屏
   * ============================================================ */
  function deer(x, y, s, color, flip) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')" fill="' + color + '" stroke="' + P.gold + '" stroke-width="1.4">' +
      '<path d="M -22 4 C -18 -10 -4 -16 8 -12 C 18 -8 24 2 20 12 L 12 16 L 8 8 L -4 10 L -8 18 L -14 16 L -12 8 Z"/>' +
      '<path d="M 14 -10 L 20 -22 L 22 -10 Z"/>' +
      '<path d="M 20 -20 C 22 -30 28 -34 32 -32 M 22 -24 C 28 -26 32 -22 34 -18" fill="none" stroke-width="2"/>' +
      '<circle cx="17" cy="-8" r="1.4" fill="' + P.gold2 + '" stroke="none"/>' +
      '</g>';
  }
  function bird(x, y, s, color, flip) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')" fill="' + color + '" stroke="' + P.gold + '" stroke-width="1.4">' +
      '<path d="M -18 4 C -8 -12 10 -16 22 -6 C 12 -2 4 4 0 10 L -6 10 L -8 4 Z"/>' +
      '<path d="M 20 -8 L 30 -12 L 24 -2 Z"/>' +
      '<path d="M 8 -14 C 12 -24 22 -28 30 -24 C 24 -18 18 -14 14 -10 Z" fill="none" stroke-width="2"/>' +
      '<circle cx="17" cy="-8" r="1.2" fill="' + P.gold2 + '" stroke="none"/>' +
      '</g>';
  }
  function frog(x, y, s, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + color + '" stroke="' + P.gold + '" stroke-width="1.3">' +
      '<path d="M -14 2 C -14 -8 -6 -14 0 -12 C 8 -14 14 -8 14 2 C 8 12 -8 12 -14 2 Z"/>' +
      '<circle cx="-6" cy="-8" r="2.2"/><circle cx="6" cy="-8" r="2.2"/>' +
      '<path d="M -10 8 L -16 14 M 10 8 L 16 14" fill="none" stroke-width="2"/>' +
      '</g>';
  }
  function screen() {
    var id = uid('screen');
    var animals = '';
    animals += deer(172, 282, 1.05, P.red2, false);
    animals += deer(420, 268, 0.9, P.red, true);
    animals += bird(300, 250, 1.35, P.red2, false);
    animals += bird(380, 336, 0.85, P.red, true);
    animals += bird(210, 352, 0.8, P.red2, false);
    animals += frog(260, 380, 1.0, P.red);
    animals += frog(452, 368, 0.85, P.red2);
    animals += deer(260, 340, 0.62, P.red, true);
    animals += deer(352, 300, 0.55, P.red2, false);
    // snakes
    var snakes = '<g fill="none" stroke="' + P.gold + '" stroke-linecap="round" opacity=".8">' +
      '<path d="M 120 240 C 180 214 220 260 280 236 C 340 212 380 252 440 228 C 460 220 470 222 480 230" stroke-width="2.2"/>' +
      '<path d="M 118 318 C 170 296 210 336 270 314 C 330 292 380 330 434 310" stroke-width="1.8"/>' +
      '<path d="M 126 400 C 190 376 236 412 300 390 C 356 370 400 402 456 382" stroke-width="2"/>' +
      '<path d="M 150 218 C 176 208 190 228 174 244 C 160 258 140 246 146 232" stroke-width="1.6"/>' +
      '</g>' +
      '<g fill="' + P.red + '" opacity=".9">' +
      '<path d="M 470 228 C 484 218 492 230 486 240 C 480 250 468 242 470 228 Z"/>' +
      '<path d="M 456 382 C 468 374 478 384 472 394 C 466 402 454 394 456 382 Z"/>' +
      '</g>';
    var body =
      defs(id) +
      '<ellipse cx="300" cy="502" rx="218" ry="24" fill="#000" opacity=".55"/>' +
      '<g class="screen">' +
      '<rect x="78" y="166" width="444" height="286" rx="4" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="3"/>' +
      '<rect x="94" y="182" width="412" height="254" fill="#0a0706" stroke="' + P.gold + '" stroke-width="1.2"/>' +
      '<rect x="104" y="192" width="392" height="234" fill="url(#' + id + '-red)" opacity=".16"/>' +
      '<g clip-path="url(#' + id + '-panel)">' +
      snakes + animals +
      '</g>' +
      '<defs><clipPath id="' + id + '-panel"><rect x="104" y="192" width="392" height="234"/></clipPath></defs>' +
      // frame details
      '<rect x="78" y="166" width="444" height="286" rx="4" fill="none" stroke="' + P.gold3 + '" stroke-width="1" opacity=".6"/>' +
      '<g fill="' + P.gold2 + '" opacity=".55"><circle cx="86" cy="174" r="2"/><circle cx="514" cy="174" r="2"/><circle cx="86" cy="444" r="2"/><circle cx="514" cy="444" r="2"/></g>' +
      // feet
      '<path d="M 128 452 L 128 486 L 164 486 L 164 476 L 144 476 L 144 452 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2"/>' +
      '<path d="M 472 452 L 472 486 L 436 486 L 436 476 L 456 476 L 456 452 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2"/>' +
      '<path d="M 100 196 C 180 186 230 180 300 180" fill="none" stroke="#fff6e4" stroke-width="7" stroke-linecap="round" opacity=".1"/>' +
      '</g>';

    return svg('0 0 600 600', body, '彩绘木雕小座屏，透雕动物纹', 'art--screen');
  }

  /* ============================================================
   * 07 凤形漆勺
   * ============================================================ */
  function ladle() {
    var id = uid('ladle');
    var body =
      defs(id) +
      '<ellipse cx="306" cy="474" rx="184" ry="26" fill="#000" opacity=".5"/>' +
      '<g class="ladle" transform="rotate(-4 300 300)">' +
      // bowl / body
      '<ellipse cx="226" cy="408" rx="112" ry="66" transform="rotate(-18 226 408)" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.8"/>' +
      '<ellipse cx="226" cy="400" rx="92" ry="50" transform="rotate(-18 226 400)" fill="url(#' + id + '-red)" stroke="' + P.gold + '" stroke-width="1.6"/>' +
      '<ellipse cx="226" cy="400" rx="78" ry="40" transform="rotate(-18 226 400)" fill="none" stroke="' + P.gold2 + '" stroke-width="1.2" opacity=".55"/>' +
      swirl(226, 400, 34, 2, P.gold, 1.6, 0.75) +
      // neck / handle
      '<path d="M 292 388 C 340 354 386 302 416 250 L 448 264 C 414 326 364 396 306 432 Z" fill="url(#' + id + '-black)" stroke="url(#' + id + '-gold)" stroke-width="2.8"/>' +
      '<path d="M 314 386 C 356 344 390 298 414 262" fill="none" stroke="' + P.red + '" stroke-width="2.2" opacity=".55"/>' +
      '<path d="M 326 400 C 364 358 396 314 420 278" fill="none" stroke="' + P.gold + '" stroke-width="1.2" opacity=".4"/>' +
      // head
      '<path d="M 416 250 C 414 228 428 212 448 210 C 468 208 480 220 478 236 C 476 250 464 258 450 258 C 440 258 430 254 424 248 Z" fill="url(#' + id + '-red)" stroke="url(#' + id + '-gold)" stroke-width="2.6"/>' +
      '<path d="M 448 210 C 452 194 466 186 480 190 C 472 202 464 210 458 218 Z" fill="' + P.gold + '" stroke="' + P.gold3 + '" stroke-width="1"/>' +
      '<circle cx="458" cy="226" r="3" fill="' + P.gold2 + '"/><circle cx="458.5" cy="226.2" r="1.2" fill="' + P.black + '"/>' +
      '<path d="M 468 240 C 482 238 492 242 496 250 C 484 252 474 250 466 246 Z" fill="' + P.gold + '"/>' +
      '<path d="M 428 214 C 418 200 420 188 430 178 M 440 208 C 438 194 444 184 454 178" fill="none" stroke="' + P.gold + '" stroke-width="3" stroke-linecap="round"/>' +
      // wing pattern on bowl
      '<path d="M 170 382 C 196 356 246 350 282 368 C 258 392 216 404 184 396" fill="none" stroke="' + P.gold + '" stroke-width="2" opacity=".7"/>' +
      '<path d="M 186 404 C 210 386 244 382 268 392" fill="none" stroke="' + P.gold2 + '" stroke-width="1.4" opacity=".5"/>' +
      '<path d="M 168 356 C 194 338 222 334 246 342" fill="none" stroke="#fff6e4" stroke-width="7" stroke-linecap="round" opacity=".1"/>' +
      '</g>';

    return svg('0 0 600 600', body, '彩绘凤形漆勺', 'art--ladle');
  }

  /* ============================================================
   * 互动漆盘 — 入戏传
   * 与其它器物共用同一套原创矢量语言，但分层以便交互。
   * ============================================================ */
  function phoenixRedPath() {
    // 盘凤：从凤首起笔，沿颈、身、尾盘旋一周，收于尾梢。
    return 'M 600 236 C 626 230 646 246 648 268 C 650 292 632 310 608 306 C 586 302 574 282 582 262 ' +
      'C 590 242 610 238 620 252 C 612 294 590 334 556 362 C 518 394 476 404 436 394 ' +
      'C 386 382 350 342 338 294 C 322 238 356 190 410 178 C 470 164 530 198 556 246 ' +
      'C 586 300 584 370 550 424 C 512 484 448 516 386 506 C 320 496 274 446 268 386 ' +
      'C 260 320 300 268 356 252 C 400 240 438 258 448 292 C 458 326 438 354 410 352';
  }
  function phoenixAccent() {
    return '<g fill="' + P.red2 + '" stroke="' + P.gold + '" stroke-width="1.6" opacity=".95">' +
      '<ellipse cx="612" cy="270" rx="21" ry="18" fill="' + P.red + '"/>' +
      '<path d="M 630 258 C 652 254 668 262 672 274 C 656 280 640 274 628 266 Z"/>' +
      '<path d="M 348 300 C 374 256 432 244 472 272 C 444 306 396 320 364 310 Z" fill="' + P.red2 + '"/>' +
      '<path d="M 292 438 C 266 460 260 490 276 512 C 290 494 298 470 300 452 Z"/>' +
      '<path d="M 470 496 C 500 506 526 494 536 476 C 512 472 490 478 474 488 Z"/>' +
      '</g>' +
      '<g fill="none" stroke="' + P.gold + '" stroke-width="2" opacity=".8">' +
      '<path d="M 596 246 C 584 222 590 200 608 188"/>' +
      '<path d="M 612 244 C 620 220 636 204 654 200"/>' +
      '<path d="M 370 294 C 398 278 430 280 458 296"/>' +
      '<path d="M 378 308 C 404 296 430 300 450 312"/>' +
      '<path d="M 300 430 C 284 448 280 470 288 490"/>' +
      '<path d="M 488 492 C 508 494 524 486 534 472"/>' +
      '</g>' +
      '<g fill="' + P.gold2 + '">' +
      '<circle cx="620" cy="264" r="4.2"/><circle cx="620.6" cy="264.2" r="1.7" fill="' + P.black + '"/>' +
      '</g>';
  }
  function phoenixWrap(content, clipId) {
    return '<g transform="translate(450 450) scale(1.48) translate(-455 -340)"' +
      (clipId ? ' clip-path="url(#' + clipId + ')"' : '') + '>' + content + '</g>';
  }
  function phoenixRed(id, opacity) {
    return '<g opacity="' + opacity + '">' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.red + '" stroke-width="54" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.red2 + '" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      phoenixAccent() +
      '</g>';
  }
  function phoenixGuide() {
    return '<g class="phoenix-guide">' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.gold2 + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 13" opacity=".85"/>' +
      '<circle cx="600" cy="236" r="10" fill="' + P.gold2 + '" opacity=".22"/>' +
      '<circle cx="600" cy="236" r="4.2" fill="' + P.gold2 + '"/>' +
      '</g>';
  }
  function phoenixGold(opacity) {
    return '<g opacity="' + opacity + '">' +
      '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.gold2 + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g fill="none" stroke="' + P.gold2 + '" stroke-width="1.2" opacity=".8">' +
      '<path d="M 612 286 C 626 282 638 286 644 294"/>' +
      '<path d="M 600 238 C 588 216 594 196 612 186"/>' +
      '<path d="M 612 236 C 620 214 636 200 652 196"/>' +
      '<path d="M 380 292 C 408 278 438 280 458 294"/>' +
      '<path d="M 340 318 C 368 310 396 314 418 328"/>' +
      '<path d="M 286 424 C 270 442 266 464 274 484"/>' +
      '<path d="M 486 490 C 506 492 522 484 532 470"/>' +
      '</g>' +
      '<circle cx="602" cy="268" r="4.2" fill="' + P.gold2 + '"/>' +
      '<circle cx="602" cy="268" r="1.8" fill="' + P.black + '"/>' +
      '</g>';
  }

  function roughRingPath() {
    var pts = [];
    for (var i = 0; i < 72; i++) {
      var a = (i / 72) * Math.PI * 2;
      var r = 330 + Math.sin(i * 2.7) * 4.5 + Math.cos(i * 1.7) * 3.5;
      pts.push((450 + Math.cos(a) * r).toFixed(1) + ' ' + (450 + Math.sin(a) * r).toFixed(1));
    }
    return 'M ' + pts.join(' L ') + ' Z';
  }

  function interactivePlate(opts) {
    opts = opts || {};
    var id = uid('plate');
    var showPattern = !!opts.pattern;
    var gold = !!opts.gold;
    var polished = opts.polish || 0;
    var paintMask = opts.mask || '';
    var trace = opts.trace || '';

    var rough = '';
    if (opts.rough) {
      var notches = '';
      for (var n = 0; n < 24; n++) {
        var na = (n / 24) * Math.PI * 2 + 0.08;
        var r1 = 324 + Math.sin(n * 3.1) * 4;
        var r2 = 340 + Math.cos(n * 2.3) * 5;
        notches += '<path d="M ' + (450 + Math.cos(na) * r1).toFixed(1) + ' ' + (450 + Math.sin(na) * r1).toFixed(1) +
          ' L ' + (450 + Math.cos(na) * r2).toFixed(1) + ' ' + (450 + Math.sin(na) * r2).toFixed(1) + '"/>';
      }
      rough = '<g class="plate-rough" fill="none" stroke-linecap="round">' +
        '<path d="' + roughRingPath() + '" stroke="#7a542c" stroke-width="12" opacity=".9"/>' +
        '<path d="' + roughRingPath() + '" stroke="#c69a63" stroke-width="2" opacity=".45"/>' +
        '<g stroke="#9a7040" stroke-width="4" opacity=".55">' + notches + '</g>' +
        '</g>';
    }

    var maskDef =
      '<defs>' +
      '<filter id="' + id + '-brushblur" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feGaussianBlur stdDeviation="4.5"/></filter>' +
      '<mask id="' + id + '-realmask">' +
      '<rect x="0" y="0" width="900" height="900" fill="black"/>' +
      '<g class="paint-live" filter="url(#' + id + '-brushblur)" fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round">' + paintMask + '</g>' +
      '</mask>' +
      '</defs>';

    var patternLayer = '';
    if (showPattern) {
      patternLayer += phoenixWrap(phoenixRed(id, 0.96), id + '-plateclip');
      patternLayer += phoenixWrap(gold ? phoenixGold(1) : phoenixGuide(), id + '-plateclip');
    }

    var body =
      defs(id) + maskDef +
      '<ellipse cx="450" cy="782" rx="300" ry="38" fill="#000" opacity=".55"/>' +
      '<ellipse cx="450" cy="772" rx="210" ry="22" fill="' + P.redDeep + '" opacity=".28"/>' +
      '<g class="plate-stage">' +
      rough +
      // side wall
      '<circle cx="450" cy="464" r="322" fill="#4a130b" opacity=".9"/>' +
      // raw wood plate
      '<circle cx="450" cy="450" r="318" fill="url(#' + id + '-wood)" stroke="#6f4d29" stroke-width="3"/>' +
      '<g class="plate-grain" clip-path="url(#' + id + '-plateclip)" opacity=".75">' +
      '<g fill="none" stroke="#8a6136" stroke-width="2" opacity=".55">' +
      '<circle cx="450" cy="450" r="292"/><circle cx="450" cy="450" r="262"/><circle cx="450" cy="450" r="232"/><circle cx="450" cy="450" r="202"/><circle cx="450" cy="450" r="172"/>' +
      '</g>' +
      '<path d="M 150 340 C 220 300 300 284 390 300 M 160 420 C 260 380 360 372 448 390 M 176 520 C 260 500 340 500 420 520 M 260 610 C 330 590 400 584 470 596" fill="none" stroke="#8a6136" stroke-width="2" opacity=".35"/>' +
      '</g>' +
      // rim structure
      '<circle cx="450" cy="450" r="318" fill="none" stroke="#7a542c" stroke-width="18" opacity=".38"/>' +
      '<circle cx="450" cy="450" r="306" fill="none" stroke="' + P.gold + '" stroke-width="1.3" opacity=".5"/>' +
      // painted lacquer reveal
      '<g clip-path="url(#' + id + '-plateclip)">' +
      '<g mask="url(#' + id + '-realmask)">' +
      '<circle cx="450" cy="450" r="318" fill="url(#' + id + '-black)"/>' +
      '<circle cx="450" cy="450" r="318" fill="none" stroke="' + P.red + '" stroke-width="14" opacity=".55"/>' +
      '<circle cx="450" cy="450" r="292" fill="none" stroke="' + P.red + '" stroke-width="2" opacity=".5"/>' +
      '<g fill="none" stroke="#2c1c16" stroke-width="1" opacity=".22">' +
      '<circle cx="450" cy="450" r="272"/><circle cx="450" cy="450" r="238"/><circle cx="450" cy="450" r="204"/>' +
      '</g>' +
      '</g>' +
      '</g>' +
      patternLayer +
      '<g class="plate-trace-layer"></g>' +
      // user trace
      (trace ? '<g class="plate-trace" fill="none" stroke="' + P.gold2 + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".95">' + trace + '</g>' : '') +
      // rim details
      '<g class="plate-rim" fill="none">' +
      '<circle cx="450" cy="450" r="318" stroke="' + P.gold + '" stroke-width="2.2" opacity=".85"/>' +
      '<circle cx="450" cy="450" r="302" stroke="' + P.gold + '" stroke-width="1" opacity=".5"/>' +
      '<circle cx="450" cy="450" r="292" stroke="' + P.red2 + '" stroke-width="1.2" opacity=".55"/>' +
      '</g>' +
      (function () {
        var dots = '<g fill="' + P.gold2 + '" opacity=".75">';
        for (var i = 0; i < 36; i++) {
          var a = (i / 36) * Math.PI * 2;
          dots += '<circle cx="' + (450 + Math.cos(a) * 310).toFixed(1) + '" cy="' + (450 + Math.sin(a) * 310).toFixed(1) + '" r="2"/>';
        }
        return dots + '</g>';
      })() +
      // gloss
      '<g class="plate-gloss" clip-path="url(#' + id + '-plateclip)">' +
      '<ellipse cx="450" cy="450" rx="318" ry="318" fill="url(#' + id + '-sheen)" opacity="' + (0.15 + polished * 0.55).toFixed(3) + '"/>' +
      '<path d="M 210 290 C 300 200 440 180 540 220" fill="none" stroke="#fff8e8" stroke-width="18" stroke-linecap="round" opacity="' + (0.05 + polished * 0.16).toFixed(3) + '"/>' +
      '<path d="M 260 650 C 380 700 520 660 610 580" fill="none" stroke="#fff8e8" stroke-width="10" stroke-linecap="round" opacity="' + (0.03 + polished * 0.1).toFixed(3) + '"/>' +
      '</g>' +
      '<circle cx="450" cy="450" r="318" fill="none" stroke="#000" stroke-width="1" opacity=".35"/>' +
      '</g>';
    return svg('0 0 900 900', body, '你正在制作的凤鸟纹漆盘', 'art--interactive');
  }

  function motif(kind) {
    var body = '';
    var label = '楚漆纹样';
    if (kind === 'phoenix') {
      label = '凤鸟纹';
      body = '<g transform="translate(100 100) scale(.255) translate(-455 -340)">' +
        '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.red + '" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + phoenixRedPath() + '" fill="none" stroke="' + P.gold + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>' +
        phoenixAccent() +
        '</g>';
    } else if (kind === 'cloud') {
      label = '云纹';
      body = '<g transform="translate(100 100)">' + cloudMotif(0, 0, 0.72, P.gold, 0.85) + '</g>' +
        '<g transform="translate(100 100)" opacity=".5">' + cloudMotif(0, 0, 0.42, P.red2, 0.6) + '</g>';
    } else if (kind === 'geo') {
      label = '几何纹';
      var cells = '';
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 5; c++) {
          var x = 28 + c * 36 + (r % 2 ? 18 : 0);
          var y = 42 + r * 44;
          cells += '<path d="M ' + x + ' ' + (y - 16) + ' L ' + (x + 16) + ' ' + y + ' L ' + x + ' ' + (y + 16) + ' L ' + (x - 16) + ' ' + y + ' Z"/>';
        }
      }
      body = '<g fill="none" stroke="' + P.gold + '" stroke-width="1.6" opacity=".8">' + cells + '</g>' +
        '<g fill="none" stroke="' + P.red + '" stroke-width="1.2" opacity=".6">' +
        '<path d="M 18 152 L 182 152 M 18 164 L 182 164"/><path d="M 18 28 L 182 28 M 18 40 L 182 40"/>' +
        '</g>';
    } else {
      label = '动物纹';
      body = '<g opacity=".95">' +
        deer(76, 120, 1.55, P.red2, false) +
        bird(134, 78, 1.2, P.red, true) +
        '<path d="M 24 150 C 54 132 82 164 112 144 C 142 124 162 152 184 138" fill="none" stroke="' + P.gold + '" stroke-width="2" opacity=".7"/>' +
        '<path d="M 28 168 C 58 154 84 180 116 164 C 144 150 164 170 182 160" fill="none" stroke="' + P.red + '" stroke-width="1.6" opacity=".5"/>' +
        '</g>';
    }
    return svg('0 0 200 200', body, label, 'art--motif');
  }

  window.LacquerArt = {
    palette: P,
    render: function (kind, opts) {
      switch (kind) {
        case 'drumstand': return drumstand(opts);
        case 'earcup': return earcup(opts);
        case 'lian': return lian(opts);
        case 'plate': return plate(opts);
        case 'dou': return dou(opts);
        case 'screen': return screen(opts);
        case 'ladle': return ladle(opts);
        default: return drumstand(opts);
      }
    },
    interactivePlate: interactivePlate,
    motif: motif,
    phoenixPath: phoenixRedPath
  };
})();
