# FILL-GUIDE · 填空指南

> 框架版约定：**文字留槽、图片贴临时图、互动先放 stub**。
> 三人按 TEAM-PLAN.md 分工，把槽位填掉、临时图换掉、stub 换掉。
> 打开任意页面，浏览器控制台会输出一行：
> `[髹·两面 框架] 待填文字槽位：N · 互动 stub：N · 临时图：N` —— 这是进度条，目标是三项都归零。

---

## 一、槽位约定（三种占位长什么样）

| 类型 | 写法 | 长什么样 | 填完后 |
| --- | --- | --- | --- |
| 文字槽位 | `<span class="slot">待填：××</span>` | 暗金色 + 虚下划线 | 把 span 换成纯文字，或保留 span 但删掉 class |
| 临时图 | `<div class="temp-wrap">…svg…<span class="temp-badge">临时图·待替换</span></div>` | 图 + 左上角虚线小标 | 换掉内层图，删掉 temp-badge |
| 互动 stub | `<div class="stub">…</div>` | 斜纹虚线框 + 说明 | 删掉 stub，接上真实模块 |

数据里的文字槽位：`js/data.js` 中所有 `待填` 开头的字符串。

---

## 二、data.js 字段速查

**每件器物（XIU.artifacts）**：id（勿改）、no、name、en、era、category（筛选枚举）、patterns（筛选枚举）、patternText、material、size、provenance、collection、kind（勿改，临时示意图 id）、feature（大卡标记）、summary、details（2–3 段释文）、highlights（3 个看点）、hotspots（3 个标注点 + 百分比坐标）、steps（相关工序 id）、related（相关器物 id）。

**工序（XIU.craftSteps）**：id（勿改）、no、name、en、scene（body/lacquer/gold/polish，决定舞台背景）、sceneLabel、lead、intro、points（3 条）、fact（需可查证）、action/helper/skip（操作文案）、story（2–3 段叙事）、feedback（完成反馈）、choice（null / 'color' / 'pattern' / 'rating'）。

**选择点（XIU.choices）**：color（选项带 hex）、pattern（选项带 art=纹样 id）、rating（评语文案）。新增选择点：在 choices 加一组 → 在对应工序的 choice 字段填 key → 在 story.js 的 `runChoice()` 加渲染分支。

**其余**：XIU.codex（4 条图鉴）、XIU.codexBonus（简史彩蛋）、XIU.story（开场/结局）、XIU.card（收藏卡文案）、XIU.timeline（简史 6 节点）、XIU.sources（资料来源）。

**改动枚举值**（category / patterns）时，同步改 `collection.html` 里的筛选按钮组。

---

## 三、图片怎么替换

1. 所有器物图由 `js/art.js` 运行时绘制，`kind` 字段指定用哪个绘制函数（drumstand / earcup / lian / plate / dou / screen / ladle / motif / interactivePlate）。
2. 美术定稿方式二选一：
   - **A. 改绘制函数**：直接在 art.js 里重写对应函数（推荐，保持矢量、体积小、可做动画）；
   - **B. 换成位图**：画出 PNG/WebP 放进 `assets/`，把页面里 `LacquerArt.render('××')` 的调用换成 `<img>`，删掉 temp-badge。
3. 替换后：删除对应 temp-badge；检查 720/390 宽度下图形不溢出；压图（单张 ≤300KB，全站 ≤3MB）。
4. 首页主视觉、器物图、收藏卡图建议共用同一套视觉语言（同一器物同一种画法）。

## 四、互动游戏怎么接（story.js）

四个工序目前是"点按舞台即通过"的 stub。文件头注释写了接口：

- `bindStub(i)`：当前 stub 入口；换成真实实现时，把对应分支替换掉；
- `setMeter(p, label)`：更新进度条（p 为 0–1）；
- `completeStep()`：判定完成，弹出反馈与选择点；
- 参考实现：**旧版 `../潦草基础/js/story.js`** 里有四步手势的完整代码（拖拽旋胎 / 刷漆 / 描金 / 推光），可以整段搬来替换 stub 分支，再按新视觉重做手感。

选择点（漆色/纹样/评分）**已实现**，先用着；想改交互形式（如换成转盘/拨片）只动 `runChoice()`。

## 五、每页验收清单（改完一页自查一遍）

| 页 | 验收点 |
| --- | --- |
| index | 主视觉 1920/1440/720 不溢出；两扇门点击各去各的页；首屏 5 秒懂"看/做两个入口" |
| collection | 器型×纹样筛选正确；搜索即时过滤；空状态出现且可清空；首卡为大卡 |
| artifact | **展签⇄工坊切换动画正常、两个视角内容不串**；标注点开合正常；细看放大中心跟随指针；上一件/下一件循环正确 |
| story | 四步都能完成且反馈出现；跳过可用；漆色/纹样选择影响收藏卡；评分弹窗可确认；图鉴逐条解锁、全解锁出现简史彩蛋；收藏卡 PNG 能下载 |
| about | 时间线渲染完整；来源链接可点；无个人身份信息（匿名版） |

**通用**：1920 / 1440 / 720 / 390 无横向滚动；控制台无报错；Chrome 129 复核；慢网（Slow 3G）首屏 ≤5s 可读。

## 六、定稿顺序建议

1. 第一轮：所有人只填**文字槽位**（data.js 全量 + 页面残留槽位），让站点内容完整可读；
2. 第二轮：美术统一换图 + 定稿色板/字体（同步 design-system.html 与 css :root）；
3. 第三轮：工匠把四个 stub 换成真实游戏，接选择点；
4. 收尾：删光 temp-badge 与 stub，控制台三项归零，跑验收清单。
