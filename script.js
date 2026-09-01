/* ===============================
   津劳智导 — 交互逻辑
   =============================== */
(function () {
  'use strict';


  /* ===============================
     数据驱动渲染模块（基于 PORTAL_DATA 知识图谱）
     =============================== */
  var PORTAL = window.PORTAL_DATA || { students: [], competitions: [], volunteers: [], resources: [], relations: [] };

  // 建立实体名称->详情 索引
  function entityByName(name) {
    var lists = [PORTAL.students, PORTAL.competitions, PORTAL.volunteers, PORTAL.resources];
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].length; j++) {
        if (lists[i][j].name === name) return lists[i][j];
      }
    }
    return null;
  }
  // 建立关系索引
  var relSuitable = {};  // head -> [tail...] 适合
  var relNeed = {};      // head -> [tail...] 需要
  PORTAL.relations.forEach(function (r) {
    var map = (r.rel === '适合') ? relSuitable : relNeed;
    if (!map[r.head]) map[r.head] = [];
    if (map[r.head].indexOf(r.tail) === -1) map[r.head].push(r.tail);
  });

  // 类别标签映射
  var CATEGORY_MAP = {
    '全国大学生机械创新设计大赛': 'academic',
    '全国大学生智能汽车竞赛': 'innovation',
    '全国大学生先进成图技术与产品信息建模创新大赛': 'academic',
    '西门子杯 中国智能制造挑战赛': 'innovation',
    '全国大学生金相技能大赛': 'academic',
    '中国大学生机械工程创新创意大赛': 'innovation',
    '全国大学生机器人大赛（ROBOCON）': 'innovation',
    '全国大学生电子设计竞赛': 'innovation',
    '全国大学生节能减排社会实践与科技竞赛': 'innovation',
    '全国大学生结构设计竞赛': 'comprehensive'
  };
  var CATEGORY_LABEL = { 'academic': '学科类', 'innovation': '创新类', 'comprehensive': '综合类' };

  // 志愿分类映射（根据名称关键词判断）
  var VOLUNTEER_CATEGORY_MAP = {
    '科普讲解': ['科技馆', '博物馆', '科普馆', '讲解', '科普', '航天', '海洋', '自然', '天文'],
    '赛事服务': ['职业技能大赛', '竞赛', '赛事', '比赛', '大赛'],
    '社区服务': ['社区', '花园', '街道', '居委会'],
    '科技实践': ['无人机', '3D打印', '机器人', '机械', '新能源', '磁悬浮', '光影', 'DIY']
  };
  var VOLUNTEER_CATEGORY_LABEL = { '科普讲解': '科普讲解', '赛事服务': '赛事服务', '社区服务': '社区服务', '科技实践': '科技实践', '其他': '志愿服务' };

  // 判断志愿分类
  function getVolunteerCategory(name) {
    for (var cat in VOLUNTEER_CATEGORY_MAP) {
      var keywords = VOLUNTEER_CATEGORY_MAP[cat];
      for (var i = 0; i < keywords.length; i++) {
        if (name.indexOf(keywords[i]) !== -1) return cat;
      }
    }
    return '其他';
  }

  // 截断描述，统一长度
  function truncateDesc(text, maxLen) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  }

  // 渲染比赛卡片
  function renderCompetitionCards() {
    var grid = document.getElementById('competitionGrid');
    if (!grid || !PORTAL.competitions.length) return;
    var html = '';
    PORTAL.competitions.forEach(function (c, idx) {
      var cat = CATEGORY_MAP[c.name] || 'academic';
      var link = c.link || '#';
      html += '<div class="card competition-card" data-category="' + cat + '" data-id="comp_' + idx + '" data-detail="comp_' + idx + '">' +
        '<div class="card-top">' +
        '<span class="card-tag tag-' + cat + '">' + (CATEGORY_LABEL[cat] || '学科类') + '</span>' +
        '<span class="card-status status-open"><span class="status-dot"></span>官方赛事</span>' +
        '</div>' +
        '<h3 class="card-title">' + c.name + '</h3>' +
        '<p class="card-text">' + c.description + '</p>' +
        '<div class="card-meta">' +
        '<div class="meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6"/></svg><span>全国</span></div>' +
        '<div class="meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6"/></svg><span>机械类</span></div>' +
        '</div>' +
        '<div class="card-actions">' +
        '<span class="card-link view-detail">查看详情</span>' +
        (link !== '#' ? '<a href="' + link + '" class="card-link card-link-ext" target="_blank" rel="noopener noreferrer">访问官网</a>' : '') +
        '</div>' +
        '</div>';
    });
    grid.innerHTML = html;
  }

  // 渲染志愿卡片
  function renderVolunteerCards() {
    var grid = document.getElementById('volunteerGrid');
    if (!grid || !PORTAL.volunteers.length) return;
    var html = '';
    PORTAL.volunteers.forEach(function (v, idx) {
      var link = v.link || '#';
      var cat = getVolunteerCategory(v.name);
      var shortDesc = truncateDesc(v.description, 90);
      html += '<div class="card volunteer-card" data-category="' + cat + '" data-id="vol_' + idx + '" data-detail="vol_' + idx + '">' +
        '<div class="card-top">' +
        '<span class="card-tag tag-academic">' + (VOLUNTEER_CATEGORY_LABEL[cat] || '志愿服务') + '</span>' +
        '<span class="card-status status-open"><span class="status-dot"></span>招募中</span>' +
        '</div>' +
        '<h3 class="card-title">' + v.name + '</h3>' +
        '<p class="card-text">' + shortDesc + '</p>' +
        '<div class="card-meta">' +
        '<div class="meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6"/></svg><span>天津</span></div>' +
        '<div class="meta-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6"/></svg><span>机械类</span></div>' +
        '</div>' +
        '<div class="card-actions">' +
        '<span class="card-link view-detail">查看详情</span>' +
        (link !== '#' ? '<a href="' + link + '" class="card-link card-link-ext" target="_blank" rel="noopener noreferrer">前往报名</a>' : '<span class="card-link card-link-disabled">暂无报名链接</span>') +
        '</div>' +
        '</div>';
    });
    grid.innerHTML = html;
  }

  // 动态构建详情数据（供详情弹窗使用）
  function buildDetailData() {
    var dd = {};
    PORTAL.competitions.forEach(function (c, idx) {
      var id = 'comp_' + idx;
      var suited = (relSuitable[c.name] || []).slice();
      // 反查哪些年级适合此比赛
      var grades = [];
      PORTAL.students.forEach(function (s) {
        if ((relSuitable[s.name] || []).indexOf(c.name) !== -1) grades.push(s.name);
      });
      var needs = (relNeed[c.name] || []).slice();
      dd[id] = {
        type: 'competition',
        tags: [{ text: CATEGORY_LABEL[CATEGORY_MAP[c.name] || 'academic'] || '学科类', cls: 'tag-' + (CATEGORY_MAP[c.name] || 'academic') }, { text: '官方赛事', cls: 'status-open' }],
        title: c.name,
        subtitle: c.description,
        info: [
          { icon: 'team', label: '适合年级', value: grades.length ? grades.join('、') : '机械类各年级' },
          { icon: 'location', label: '赛事类型', value: CATEGORY_LABEL[CATEGORY_MAP[c.name] || 'academic'] || '学科类' },
          { icon: 'award', label: '官方链接', value: c.link || '以官方发布为准' }
        ],
        sections: [
          { title: '赛事介绍', icon: 'target', type: 'list', items: [c.description] },
          { title: '适合对象', icon: 'team', type: 'list', items: grades.length ? grades.map(function (g) { return g + '（' + (entityByName(g) ? entityByName(g).description : '') + '）'; }) : ['面向机械类专业各年级学生'] },
          { title: '需要技能', icon: 'target', type: 'list', items: needs.length ? needs : ['以赛事官方要求为准'] }
        ]
      };
    });
    PORTAL.volunteers.forEach(function (v, idx) {
      var id = 'vol_' + idx;
      var needs = (relNeed[v.name] || []).slice();
      var grades = [];
      PORTAL.students.forEach(function (s) {
        if ((relSuitable[s.name] || []).indexOf(v.name) !== -1) grades.push(s.name);
      });
      dd[id] = {
        type: 'volunteer',
        tags: [{ text: '官方志愿', cls: 'tag-academic' }, { text: '招募中', cls: 'status-open' }],
        title: v.name,
        subtitle: v.description,
        info: [
          { icon: 'team', label: '适合年级', value: grades.length ? grades.join('、') : '机械类各年级' },
          { icon: 'location', label: '项目类型', value: '志愿服务' },
          { icon: 'award', label: '官方链接', value: v.link || '以官方发布为准' }
        ],
        sections: [
          { title: '项目介绍', icon: 'target', type: 'list', items: [v.description] },
          { title: '适合对象', icon: 'team', type: 'list', items: grades.length ? grades.map(function (g) { return g + '（' + (entityByName(g) ? entityByName(g).description : '') + '）'; }) : ['面向机械类专业各年级学生'] },
          { title: '能力要求', icon: 'target', type: 'list', items: needs.length ? needs : ['以项目方要求为准'] },
          { title: '温馨提示', icon: 'target', type: 'list', items: [v.link ? '详细内容请点击下方"访问官方网站"按钮查看最新信息' : '暂无官方链接，具体信息请以项目方发布为准'] }
        ]
      };
    });
    return dd;
  }

  // 动态构建网站链接映射
  function buildWebsiteUrls() {
    var wu = {};
    PORTAL.competitions.forEach(function (c, idx) {
      if (c.link) wu['comp_' + idx] = c.link;
    });
    PORTAL.volunteers.forEach(function (v, idx) {
      if (v.link) wu['vol_' + idx] = v.link;
    });
    return wu;
  }

  // 动态构建学时活动选项
  function buildActivityOptions() {
    return {
      competition: PORTAL.competitions.map(function (c) { return c.name; }),
      volunteer: PORTAL.volunteers.map(function (v) { return v.name; })
    };
  }

  // 执行渲染
  renderCompetitionCards();
  renderVolunteerCards();


  /* ---- 导航栏滚动效果 ---- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    backToTop.classList.toggle('show', y > 600);
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- 移动端菜单 ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // 点击导航链接后关闭菜单
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ---- 导航高亮 ---- */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    var scrollPos = window.scrollY + 100;
    var current = '';
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) {
        current = sec.getAttribute('id');
      }
    });
    navItems.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  /* ---- 返回顶部 ---- */
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- 数字增长动画 ---- */
  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statsAnimated = true;
      statNums.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1500;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
      });
    }
  }
  window.addEventListener('scroll', animateStats, { passive: true });
  animateStats();

  /* ---- 赛事筛选 ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const competitionCards = document.querySelectorAll('.competition-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');
      competitionCards.forEach(function (card) {
        var category = card.getAttribute('data-category');
        var show = filter === 'all' || category === filter;
        if (show) {
          card.style.display = '';
          requestAnimationFrame(function () {
            card.style.opacity = '1';
            card.style.transform = '';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(function () { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ---- 入场动画 (IntersectionObserver) ---- */
  var revealTargets = document.querySelectorAll('.card, .doc-card, .feature-item, .section-header');
  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, index * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- 智能交互对话 ---- */
  var chatMessages = document.getElementById('chatMessages');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatQuick = document.getElementById('chatQuick');
  var chatClear = document.getElementById('chatClear');

  // 知识库（简易问答）
  /* ---- 知识图谱问答引擎（基于 PORTAL_DATA 真实数据） ---- */
  function kgFindEntity(text) {
    var lists = [PORTAL.students, PORTAL.competitions, PORTAL.volunteers, PORTAL.resources];
    var found = null;
    var bestLen = 0;
    lists.forEach(function (list) {
      list.forEach(function (e) {
        if (text.indexOf(e.name) !== -1 && e.name.length > bestLen) {
          bestLen = e.name.length;
          found = e;
        }
      });
    });
    return found;
  }
  function kgLink(name) {
    var lists = [PORTAL.competitions, PORTAL.volunteers];
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i].length; j++) {
        if (lists[i][j].name === name && lists[i][j].link) return lists[i][j].link;
      }
    }
    return '';
  }
  function findAnswer(question) {
    var q = question.toLowerCase();

    // 转义HTML特殊字符的工具函数
    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 生成可点击链接
    function linkHtml(name, url) {
      if (!url) return escapeHtml(name);
      return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" class="answer-link">' + escapeHtml(name) + ' ↗</a>';
    }

    // 1) 年级推荐类
    var gradeMatch = q.match(/(大一|大二|大三|大四)(?:\s*机械|\s*新生|\s*学生|\s*年级|)/);
    if (gradeMatch && /适合|推荐|建议|参加|竞赛|比赛|志愿|活动/.test(q)) {
      var grade = gradeMatch[1] + '机械';
      var suited = relSuitable[grade] || [];
      var comps = [], vols = [];
      suited.forEach(function (name) {
        if (PORTAL.competitions.some(function (c) { return c.name === name; })) comps.push(name);
        else if (PORTAL.volunteers.some(function (v) { return v.name === name; })) vols.push(name);
      });
      var needs = relNeed[grade] || [];

      var html = '<div class="answer-content">';
      html += '<p class="answer-intro">根据知识图谱数据，<strong>' + escapeHtml(grade) + '</strong>同学适合以下项目：</p>';

      if (comps.length) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">🏆 适合的比赛</h4>';
        html += '<ul class="answer-list">';
        comps.forEach(function (c) {
          html += '<li>' + linkHtml(c, kgLink(c)) + '</li>';
        });
        html += '</ul></div>';
      }

      if (vols.length) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">💙 适合的志愿</h4>';
        html += '<ul class="answer-list">';
        vols.forEach(function (v) {
          html += '<li>' + linkHtml(v, kgLink(v)) + '</li>';
        });
        html += '</ul></div>';
      }

      if (needs.length) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">📚 建议掌握的技能</h4>';
        html += '<ul class="answer-list">';
        needs.forEach(function (n) {
          html += '<li>' + escapeHtml(n) + '</li>';
        });
        html += '</ul></div>';
      }

      html += '<p class="answer-footer">💡 以上信息均来自知识图谱官方数据，可点击上方链接查看官网详情</p>';
      html += '</div>';
      return html;
    }

    // 2) 实体详情类
    var ent = kgFindEntity(question);
    if (ent) {
      var suited = relSuitable[ent.name] || [];
      var needs = relNeed[ent.name] || [];
      var link = ent.link || kgLink(ent.name);

      var html = '<div class="answer-content">';
      html += '<h4 class="answer-title answer-entity-title">' + escapeHtml(ent.name) + '</h4>';
      html += '<p class="answer-desc">' + escapeHtml(ent.description || '暂无简介') + '</p>';

      if (suited.length) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">👥 适合对象</h4>';
        html += '<ul class="answer-list">';
        suited.forEach(function (s) {
          html += '<li>' + linkHtml(s, kgLink(s)) + '</li>';
        });
        html += '</ul></div>';
      }

      if (needs.length) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">⚡ 需要的能力/技能</h4>';
        html += '<ul class="answer-list">';
        needs.forEach(function (n) {
          html += '<li>' + escapeHtml(n) + '</li>';
        });
        html += '</ul></div>';
      }

      if (link) {
        html += '<div class="answer-section">';
        html += '<h4 class="answer-title">🔗 官方链接</h4>';
        html += '<p class="answer-link-box">' + linkHtml(link, link) + '</p>';
        html += '</div>';
      }

      html += '<p class="answer-footer">💡 以上信息均来自知识图谱官方数据，详细内容请访问官网查看</p>';
      html += '</div>';
      return html;
    }

    // 3) 兜底：知识库没有相关数据
    var sampleQs = generateQuickQuestionPool();
    var suggest = sampleQs.slice(0, 3);
    var html = '<div class="answer-content answer-empty">';
    html += '<p class="answer-empty-text">🤔 我的知识库暂时没有相关数据，请换一个问题吧</p>';
    html += '<div class="answer-section">';
    html += '<h4 class="answer-title">💡 你可以试试这些提问：</h4>';
    html += '<ul class="answer-list">';
    suggest.forEach(function (q) {
      html += '<li>' + escapeHtml(q) + '</li>';
    });
    html += '</ul></div>';
    html += '</div>';
    return html;
  }

  // 从知识库生成候选提问池，全部是知识库可回答的问题
  function generateQuickQuestionPool() {
    var pool = [];
    var data = window.PORTAL_DATA;
    ['大一机械', '大二机械', '大三机械', '大四机械'].forEach(function (grade) {
      pool.push(grade + '适合参加哪些竞赛');
      pool.push(grade + '适合什么志愿服务');
    });
    data.competitions.forEach(function (cp) {
      pool.push(cp.name + '需要什么技能');
      pool.push(cp.name + '介绍');
    });
    data.volunteers.forEach(function (vl) {
      pool.push(vl.name + '介绍');
      pool.push('参加' + vl.name + '需要什么能力');
    });
    return pool;
  }

  // 渲染快捷提问按钮，每次调用会随机刷新一批按钮
  function renderQuickButtons() {
    var container = document.querySelector('.chat-quick-wrap');
    if (!container) return;
    var pool = generateQuickQuestionPool();
    var shuffled = pool.slice().sort(function () { return Math.random() - 0.5; });
    var selected = shuffled.slice(0, 4);
    container.innerHTML = '';
    selected.forEach(function (q) {
      var btn = document.createElement('button');
      btn.className = 'chat-quick-btn';
      btn.setAttribute('data-q', q);
      btn.innerText = q;
      btn.addEventListener('click', function () {
        chatInput.value = this.getAttribute('data-q');
        sendMessage();
        renderQuickButtons();
      });
      container.appendChild(btn);
    });
  }

  function addMessage(text, isUser) {
    var msg = document.createElement('div');
    msg.className = 'message ' + (isUser ? 'message-user' : 'message-bot');

    var avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUser
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>';

    var bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    // AI回答用HTML渲染（支持加粗、列表、链接），用户消息用纯文本防止XSS
    if (isUser) {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = text;
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botReply(question) {
    // 显示"正在输入"状态
    var typing = document.createElement('div');
    typing.className = 'message message-bot';
    typing.innerHTML =
      '<div class="message-avatar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>' +
      '</div>' +
      '<div class="message-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(function () {
      typing.remove();
      addMessage(findAnswer(question), false);
    }, 700 + Math.random() * 500);
  }

  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, true);
    chatInput.value = '';
    botReply(text);
  }

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });

  // 赛事/志愿项目官方网站映射（从知识图谱动态生成）
  var websiteUrls = buildWebsiteUrls();

  // 赛事/志愿详情数据（从知识图谱动态生成）
  var detailData = buildDetailData();
  // SVG 图标映射
  var infoIcons = {
    award: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 13l-2 9 5.5-3 5.5 3-2-9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    location: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6"/></svg>',
    team: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    fee: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/><path d="M12 6v12M9 9h4.5a2 2 0 010 4H9m0 0h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  var sectionIcons = {
    target: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    award: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 13l-2 9 5.5-3 5.5 3-2-9" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    team: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/></svg>'
  };

  /* ---- 详情弹窗 ---- */
  var modalOverlay = document.getElementById('modalOverlay');
  var modalBox = document.getElementById('modal');
  var modalBody = document.getElementById('modalBody');
  var modalCloseBtn = document.getElementById('modalClose');

  function buildModalHTML(data, id) {
    var html = '';

    // 头部
    html += '<div class="modal-header">';
    html += '<div class="modal-tags">';
    data.tags.forEach(function (t) {
      html += '<span class="modal-tag">' + t.text + '</span>';
    });
    html += '</div>';
    html += '<h3 class="modal-title">' + data.title + '</h3>';
    html += '<p class="modal-subtitle">' + data.subtitle + '</p>';
    html += '</div>';

    // 内容区
    html += '<div class="modal-content">';

    // 信息网格
    html += '<div class="modal-info-grid">';
    data.info.forEach(function (item) {
      html += '<div class="modal-info-cell">';
      html += '<div class="info-label">' + (infoIcons[item.icon] || '') + '<span>' + item.label + '</span></div>';
      html += '<div class="info-value">' + item.value + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // 各内容区块
    data.sections.forEach(function (sec) {
      html += '<div class="modal-section">';
      html += '<h4 class="modal-section-title"><span class="ms-icon">' + (sectionIcons[sec.icon] || sectionIcons.target) + '</span>' + sec.title + '</h4>';

      if (sec.type === 'list') {
        html += '<ul class="modal-list">';
        sec.items.forEach(function (item) {
          html += '<li>' + item + '</li>';
        });
        html += '</ul>';
      } else if (sec.type === 'timeline') {
        html += '<div class="modal-timeline">';
        sec.items.forEach(function (item) {
          html += '<div class="modal-timeline-item">';
          html += '<div class="tl-date">' + item.date + '</div>';
          html += '<div class="tl-event">' + item.event + '</div>';
          html += '</div>';
        });
        html += '</div>';
      } else if (sec.type === 'awards') {
        html += '<div class="modal-award-grid">';
        sec.items.forEach(function (item) {
          html += '<div class="modal-award">';
          html += '<div class="award-level">' + item.level + '</div>';
          html += '<div class="award-desc">' + item.desc + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
    });

    html += '</div>';

    // 底部按钮 — 官方网站链接
    html += '<div class="modal-actions">';
    var siteUrl = websiteUrls[id] || '';
    if (siteUrl) {
      html += '<a href="' + siteUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary">访问官方网站';
      html += ' <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;margin-left:4px"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      html += '</a>';
    }
    html += '</div>';

    return html;
  }

  function openModal(id) {
    var data = detailData[id];
    if (!data) return;
    modalBody.innerHTML = buildModalHTML(data, id);
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // 给弹窗内的 dismiss 按钮绑定关闭
    modalBody.querySelectorAll('.modal-dismiss').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        closeModal();
      });
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // 绑定所有 data-detail 卡片（点击卡片主体打开详情；官网外链不受影响）
  document.querySelectorAll('[data-detail]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      // 若点击的是外链按钮，则不拦截，让其正常跳转官网
      if (e.target.closest('a.card-link-ext')) return;
      e.preventDefault();
      e.stopPropagation();
      openModal(card.getAttribute('data-detail'));
    });
  });

  // 点击遮罩关闭
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // 关闭按钮
  modalCloseBtn.addEventListener('click', closeModal);

  // ESC 键关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modalOverlay.classList.contains('open')) closeModal();
      if (authOverlay.classList.contains('open')) closeAuthModal();
      if (hoursOverlay.classList.contains('open')) closeHoursModal();
    }
  });

  /* ---- 用户认证系统 ---- */
  var authOverlay = document.getElementById('authOverlay');
  var authCloseBtn = document.getElementById('authClose');
  var authBody = document.getElementById('authBody');
  var authTabBtns = document.querySelectorAll('.auth-tab');
  var btnLoginNav = document.getElementById('btnLogin');
  var btnLogoutNav = document.getElementById('btnLogout');
  var navAuthEl = document.getElementById('navAuth');
  var navUserEl = document.getElementById('navUser');
  var navUserNameEl = document.getElementById('navUserName');
  var navUserAvatarEl = document.getElementById('navUserAvatar');
  var certifyLoginBtn = document.getElementById('certifyLoginBtn');

  var USERS_KEY = 'jlzd_users';
  var SESSION_KEY = 'jlzd_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch (e) { return null; }
  }
  function setSession(studentId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ studentId: studentId, loginAt: Date.now() }));
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function updateAuthUI() {
    var session = getSession();
    var users = getUsers();

    if (session && users[session.studentId]) {
      var user = users[session.studentId];
      navAuthEl.style.display = 'none';
      navUserEl.style.display = 'flex';
      navUserNameEl.textContent = user.name;
      navUserAvatarEl.textContent = getInitials(user.name);
      showCertifyContent(user);
    } else {
      navAuthEl.style.display = 'flex';
      navUserEl.style.display = 'none';
      showCertifyGuest();
    }
  }

  function showCertifyContent(user) {
    document.getElementById('certifyGuest').style.display = 'none';
    document.getElementById('certifyContent').style.display = 'block';

    document.getElementById('certifyUserName').textContent = user.name;
    document.getElementById('certifyUserAvatar').textContent = getInitials(user.name);
    var metaHtml = '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg> 学号：' + escapeHtml(user.studentId) + '</span>' +
      '<span>班级：' + escapeHtml(user.className) + '</span>' +
      '<span>学院：' + escapeHtml(user.college) + '</span>' +
      '<span>入学：' + user.enrollmentDate + '</span>';
    document.getElementById('certifyUserMeta').innerHTML = metaHtml;

    loadHoursRecords(user.studentId);
  }

  function showCertifyGuest() {
    document.getElementById('certifyGuest').style.display = 'block';
    document.getElementById('certifyContent').style.display = 'none';
  }

  /* ---- 登录/注册表单渲染 ---- */
  function openAuthModal(tab) {
    tab = tab || 'login';
    authTabBtns.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === tab); });
    renderAuthForm(tab);
    authOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    authOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderAuthForm(tab) {
    if (tab === 'login') {
      authBody.innerHTML =
        '<div class="auth-title">欢迎回来</div>' +
        '<div class="auth-desc">登录你的津劳智导账号，管理学时认证</div>' +
        '<div class="form-error" id="loginError"></div>' +
        '<form id="loginForm">' +
        '<div class="form-group">' +
        '<label class="form-label" for="loginStudentId">学号</label>' +
        '<input type="text" class="form-input" id="loginStudentId" placeholder="请输入学号" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label" for="loginPassword">密码</label>' +
        '<input type="password" class="form-input" id="loginPassword" placeholder="请输入密码" required>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="submit" class="btn btn-primary">登录</button>' +
        '</div>' +
        '</form>' +
        '<div class="auth-switch">还没有账号？<a id="switchToRegister">立即注册</a></div>';

      document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin();
      });
      document.getElementById('switchToRegister').addEventListener('click', function () {
        authTabBtns.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === 'register'); });
        renderAuthForm('register');
      });
    } else {
      authBody.innerHTML =
        '<div class="auth-title">创建账号</div>' +
        '<div class="auth-desc">填写以下信息完成注册，即可使用学时认证功能</div>' +
        '<div class="form-error" id="registerError"></div>' +
        '<div class="form-success" id="registerSuccess"></div>' +
        '<form id="registerForm">' +
        '<div class="form-group">' +
        '<label class="form-label">身份 <span class="required">*</span></label>' +
        '<select class="form-input" id="registerRole">' +
        '<option value="student">学生</option>' +
        '<option value="teacher">老师</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerName">姓名 <span class="required">*</span></label>' +
        '<input type="text" class="form-input" id="registerName" placeholder="请输入真实姓名" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerStudentId">用户名/学号 <span class="required">*</span></label>' +
        '<input type="text" class="form-input" id="registerStudentId" placeholder="登录用的用户名" required>' +
        '</div>' +
        '</div>' +
        '<div class="form-row" id="studentFields">' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerGrade">年级</label>' +
        '<select class="form-input" id="registerGrade">' +
        '<option value="">请选择</option>' +
        '<option value="大一">大一</option>' +
        '<option value="大二">大二</option>' +
        '<option value="大三">大三</option>' +
        '<option value="大四">大四</option>' +
        '<option value="研究生">研究生</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerMajor">专业</label>' +
        '<input type="text" class="form-input" id="registerMajor" placeholder="如：机械工程">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerPhone">手机号</label>' +
        '<input type="tel" class="form-input" id="registerPhone" placeholder="手机号">' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerEmail">邮箱</label>' +
        '<input type="email" class="form-input" id="registerEmail" placeholder="邮箱">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label class="form-label" for="registerPassword">密码 <span class="required">*</span></label>' +
        '<input type="password" class="form-input" id="registerPassword" placeholder="至少6位" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label class="form-label">确认密码 <span class="required">*</span></label>' +
        '<input type="password" class="form-input" id="registerPasswordConfirm" placeholder="再次输入密码" required>' +
        '</div>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="submit" class="btn btn-primary">注册</button>' +
        '</div>' +
        '</form>' +
        '<div class="auth-switch">已有账号？<a id="switchToLogin">立即登录</a></div>';

      document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var pwd = document.getElementById('registerPassword').value;
        var pwd2 = document.getElementById('registerPasswordConfirm').value;
        if (pwd !== pwd2) {
          document.getElementById('registerError').textContent = '两次密码不一致';
          return;
        }
        handleRegister();
      });
      document.getElementById('registerRole').addEventListener('change', function() {
        document.getElementById('studentFields').style.display = this.value === 'student' ? 'grid' : 'none';
      });
      document.getElementById('switchToLogin').addEventListener('click', function () {
        authTabBtns.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === 'login'); });
        renderAuthForm('login');
      });
    }
  }

  function handleLogin() {
    var studentId = document.getElementById('loginStudentId').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errorEl = document.getElementById('loginError');

    var users = getUsers();
    if (!users[studentId]) {
      errorEl.textContent = '该学号尚未注册，请先注册账号';
      errorEl.classList.add('show');
      return;
    }
    if (users[studentId].password !== password) {
      errorEl.textContent = '密码错误，请重新输入';
      errorEl.classList.add('show');
      return;
    }

    errorEl.classList.remove('show');
    setSession(studentId);
    closeAuthModal();
    updateAuthUI();

    setTimeout(function () {
      document.getElementById('certify').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  function handleRegister() {
    var name = document.getElementById('regName').value.trim();
    var studentId = document.getElementById('regStudentId').value.trim();
    var className = document.getElementById('regClassName').value.trim();
    var enrollmentDate = document.getElementById('regEnrollmentDate').value;
    var college = document.getElementById('regCollege').value.trim();
    var phone = document.getElementById('regPhone').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var passwordConfirm = document.getElementById('regPasswordConfirm').value;

    var errorEl = document.getElementById('registerError');
    var successEl = document.getElementById('registerSuccess');
    errorEl.classList.remove('show');
    successEl.classList.remove('show');

    if (!name || !studentId || !className || !enrollmentDate || !college || !phone || !email || !password) {
      errorEl.textContent = '请填写所有必填字段';
      errorEl.classList.add('show');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      errorEl.textContent = '手机号格式不正确';
      errorEl.classList.add('show');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = '邮箱格式不正确';
      errorEl.classList.add('show');
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = '密码至少6位';
      errorEl.classList.add('show');
      return;
    }
    if (password !== passwordConfirm) {
      errorEl.textContent = '两次输入的密码不一致';
      errorEl.classList.add('show');
      return;
    }

    var users = getUsers();
    if (users[studentId]) {
      errorEl.textContent = '该学号已注册，请直接登录';
      errorEl.classList.add('show');
      return;
    }

    users[studentId] = {
      name: name,
      studentId: studentId,
      className: className,
      enrollmentDate: enrollmentDate,
      college: college,
      phone: phone,
      email: email,
      password: password,
      registeredAt: new Date().toISOString()
    };
    saveUsers(users);

    successEl.textContent = '注册成功！正在自动登录...';
    successEl.classList.add('show');

    setTimeout(function () {
      setSession(studentId);
      closeAuthModal();
      updateAuthUI();
      setTimeout(function () {
        document.getElementById('certify').scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }, 1000);
  }

  /* ---- 认证弹窗事件绑定 ---- */
  btnLoginNav.addEventListener('click', function () { openAuthModal('login'); });
  certifyLoginBtn.addEventListener('click', function () { openAuthModal('login'); });
  btnLogoutNav.addEventListener('click', function () {
    clearSession();
    updateAuthUI();
  });
  authCloseBtn.addEventListener('click', closeAuthModal);
  authOverlay.addEventListener('click', function (e) {
    if (e.target === authOverlay) closeAuthModal();
  });
  authTabBtns.forEach(function (tab) {
    tab.addEventListener('click', function () {
      authTabBtns.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderAuthForm(tab.getAttribute('data-tab'));
    });
  });

  /* ---- 学时认证系统 ---- */
  var hoursOverlay = document.getElementById('hoursOverlay');
  var hoursCloseBtn = document.getElementById('hoursClose');
  var hoursCancelBtn = document.getElementById('hoursCancel');
  var hoursForm = document.getElementById('hoursForm');
  var hoursNameSelect = document.getElementById('hoursName');
  var btnAddHours = document.getElementById('btnAddHours');
  var btnExport = document.getElementById('btnExport');

  // 学时活动选项（从知识图谱动态生成）
  var activityOptions = buildActivityOptions();
  function getHoursKey(studentId) {
    return 'jlzd_hours_' + studentId;
  }
  function getHoursRecords(studentId) {
    try { return JSON.parse(localStorage.getItem(getHoursKey(studentId))) || []; }
    catch (e) { return []; }
  }
  function saveHoursRecords(studentId, records) {
    localStorage.setItem(getHoursKey(studentId), JSON.stringify(records));
  }

  function updateActivityOptions() {
    var type = document.querySelector('input[name="hoursType"]:checked').value;
    var options = activityOptions[type] || [];
    var html = '<option value="">请选择活动名称</option>';
    options.forEach(function (name) {
      html += '<option value="' + name + '">' + name + '</option>';
    });
    hoursNameSelect.innerHTML = html;
  }

  document.querySelectorAll('input[name="hoursType"]').forEach(function (radio) {
    radio.addEventListener('change', updateActivityOptions);
  });

  function openHoursModal() {
    var session = getSession();
    if (!session) {
      openAuthModal('login');
      return;
    }
    hoursForm.reset();
    document.querySelector('input[name="hoursType"][value="competition"]').checked = true;
    updateActivityOptions();
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('hoursDate').value = yyyy + '-' + mm + '-' + dd;
    hoursOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeHoursModal() {
    hoursOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btnAddHours.addEventListener('click', openHoursModal);
  hoursCloseBtn.addEventListener('click', closeHoursModal);
  hoursCancelBtn.addEventListener('click', closeHoursModal);
  hoursOverlay.addEventListener('click', function (e) {
    if (e.target === hoursOverlay) closeHoursModal();
  });

  hoursForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var session = getSession();
    if (!session) return;

    var type = document.querySelector('input[name="hoursType"]:checked').value;
    var name = hoursNameSelect.value;
    var date = document.getElementById('hoursDate').value;
    var hours = parseFloat(document.getElementById('hoursNum').value);
    var note = document.getElementById('hoursNote').value.trim();

    if (!name || !date || !hours || hours <= 0) return;

    var records = getHoursRecords(session.studentId);
    records.push({
      id: Date.now(),
      type: type,
      name: name,
      date: date,
      hours: hours,
      note: note,
      createdAt: new Date().toISOString()
    });
    saveHoursRecords(session.studentId, records);

    closeHoursModal();
    loadHoursRecords(session.studentId);
  });

  function loadHoursRecords(studentId) {
    var records = getHoursRecords(studentId);
    var tbody = document.getElementById('certifyTableBody');
    var emptyEl = document.getElementById('certifyEmpty');
    var tableWrap = document.querySelector('.certify-table-wrap');

    var totalHours = 0, compHours = 0, volHours = 0;
    records.forEach(function (r) {
      totalHours += r.hours;
      if (r.type === 'competition') compHours += r.hours;
      else volHours += r.hours;
    });

    document.getElementById('statTotalHours').textContent = totalHours;
    document.getElementById('statCompHours').textContent = compHours;
    document.getElementById('statVolHours').textContent = volHours;
    document.getElementById('statCount').textContent = records.length;

    if (records.length === 0) {
      tbody.innerHTML = '';
      emptyEl.style.display = 'block';
      tableWrap.style.display = 'none';
      return;
    }

    emptyEl.style.display = 'none';
    tableWrap.style.display = 'block';

    records.sort(function (a, b) { return b.date.localeCompare(a.date); });

    var html = '';
    records.forEach(function (r, i) {
      var typeBadge = r.type === 'competition'
        ? '<span class="certify-type-badge badge-competition">竞赛</span>'
        : '<span class="certify-type-badge badge-volunteer">志愿</span>';
      html += '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + typeBadge + '</td>' +
        '<td>' + escapeHtml(r.name) + '</td>' +
        '<td>' + r.date + '</td>' +
        '<td class="certify-hours-num">' + r.hours + 'h</td>' +
        '<td>' + escapeHtml(r.note || '\u2014') + '</td>' +
        '<td><button class="btn-delete-row" data-id="' + r.id + '" title="删除"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></td>' +
        '</tr>';
    });
    tbody.innerHTML = html;

    tbody.querySelectorAll('.btn-delete-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        deleteHoursRecord(studentId, id);
      });
    });
  }

  function deleteHoursRecord(studentId, id) {
    if (!confirm('确定要删除这条学时记录吗？')) return;
    var records = getHoursRecords(studentId);
    records = records.filter(function (r) { return r.id !== id; });
    saveHoursRecords(studentId, records);
    loadHoursRecords(studentId);
  }

  /* ---- 导出学时认证表 ---- */
  btnExport.addEventListener('click', function () {
    var session = getSession();
    if (!session) return;
    var users = getUsers();
    var user = users[session.studentId];
    if (!user) return;

    var records = getHoursRecords(session.studentId);
    var totalHours = 0, compHours = 0, volHours = 0;
    records.forEach(function (r) {
      totalHours += r.hours;
      if (r.type === 'competition') compHours += r.hours;
      else volHours += r.hours;
    });

    records.sort(function (a, b) { return b.date.localeCompare(a.date); });

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>学时认证表</title><style>';
    html += 'body{font-family:"Microsoft YaHei",sans-serif;padding:40px;color:#1a1a1a;}';
    html += 'h1{text-align:center;font-size:24px;margin-bottom:8px;}';
    html += '.subtitle{text-align:center;color:#666;font-size:14px;margin-bottom:30px;}';
    html += '.info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;}';
    html += '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}';
    html += '.info-item{font-size:14px;}.info-item .label{color:#94a3b8;margin-right:6px;}.info-item .value{font-weight:600;}';
    html += '.stats{display:flex;gap:16px;margin-bottom:24px;}';
    html += '.stat-card{flex:1;text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;}';
    html += '.stat-card .num{font-size:28px;font-weight:800;color:#0F2C5C;}.stat-card .lbl{font-size:12px;color:#94a3b8;margin-top:4px;}';
    html += 'table{width:100%;border-collapse:collapse;margin-top:12px;}';
    html += 'th{background:#0F2C5C;color:#fff;padding:10px;font-size:13px;text-align:left;}';
    html += 'td{padding:10px;font-size:13px;border-bottom:1px solid #e2e8f0;}';
    html += '.badge{padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;}';
    html += '.badge-c{background:#FED7AA;color:#EA580C;}.badge-v{background:#DCFCE7;color:#16A34A;}';
    html += '.footer{text-align:center;margin-top:40px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;}';
    html += '@media print{body{padding:20px;}.no-print{display:none;}}';
    html += '</style></head><body>';
    html += '<h1>学生学时认证表</h1>';
    html += '<div class="subtitle">津劳智导 \u2014 学生竞赛与志愿服务咨询平台</div>';

    html += '<div class="info-box"><div class="info-grid">';
    html += '<div class="info-item"><span class="label">姓名：</span><span class="value">' + escapeHtml(user.name) + '</span></div>';
    html += '<div class="info-item"><span class="label">学号：</span><span class="value">' + escapeHtml(user.studentId) + '</span></div>';
    html += '<div class="info-item"><span class="label">班级：</span><span class="value">' + escapeHtml(user.className) + '</span></div>';
    html += '<div class="info-item"><span class="label">学院：</span><span class="value">' + escapeHtml(user.college) + '</span></div>';
    html += '<div class="info-item"><span class="label">入学时间：</span><span class="value">' + user.enrollmentDate + '</span></div>';
    html += '<div class="info-item"><span class="label">手机号：</span><span class="value">' + escapeHtml(user.phone) + '</span></div>';
    html += '</div></div>';

    html += '<div class="stats">';
    html += '<div class="stat-card"><div class="num">' + totalHours + 'h</div><div class="lbl">总学时</div></div>';
    html += '<div class="stat-card"><div class="num">' + compHours + 'h</div><div class="lbl">竞赛学时</div></div>';
    html += '<div class="stat-card"><div class="num">' + volHours + 'h</div><div class="lbl">志愿服务学时</div></div>';
    html += '<div class="stat-card"><div class="num">' + records.length + '</div><div class="lbl">记录条数</div></div>';
    html += '</div>';

    html += '<table><thead><tr><th>序号</th><th>类型</th><th>活动名称</th><th>参与日期</th><th>学时</th><th>备注</th></tr></thead><tbody>';
    records.forEach(function (r, i) {
      var badge = r.type === 'competition' ? '<span class="badge badge-c">竞赛</span>' : '<span class="badge badge-v">志愿</span>';
      html += '<tr><td>' + (i + 1) + '</td><td>' + badge + '</td><td>' + escapeHtml(r.name) + '</td><td>' + r.date + '</td><td>' + r.hours + 'h</td><td>' + escapeHtml(r.note || '\u2014') + '</td></tr>';
    });
    html += '</tbody></table>';

    html += '<div class="footer">生成时间：' + new Date().toLocaleString('zh-CN') + ' \u00b7 津劳智导学时认证系统</div>';
    html += '<div class="no-print" style="text-align:center;margin-top:24px;"><button onclick="window.print()" style="padding:10px 28px;font-size:14px;font-weight:600;color:#fff;background:#0F2C5C;border:none;border-radius:8px;cursor:pointer;">\u6253\u5370 / \u4fdd\u5b58\u4e3aPDF</button></div>';
    html += '</body></html>';

    var win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  });

  /* ---- Toast 通知系统 ---- */
  var toastContainer = document.getElementById('toastContainer');
  var toastIcons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  function showToast(type, title, msg, duration) {
    duration = duration || 3000;
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<div class="toast-icon">' + (toastIcons[type] || toastIcons.info) + '</div>' +
      '<div class="toast-body">' +
      '<div class="toast-title">' + title + '</div>' +
      (msg ? '<div class="toast-msg">' + msg + '</div>' : '') +
      '</div>' +
      '<button class="toast-close" aria-label="关闭"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    toastContainer.appendChild(toast);
    var closeBtn = toast.querySelector('.toast-close');
    function removeToast() {
      toast.classList.add('toast-out');
      setTimeout(function () { toast.remove(); }, 300);
    }
    closeBtn.addEventListener('click', removeToast);
    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  }

  /* ---- 赛事搜索 + 分类联合筛选 ---- */
  var compSearch = document.getElementById('compSearch');
  var compSearchClear = document.getElementById('compSearchClear');
  var searchResultInfo = document.getElementById('searchResultInfo');
  var currentCategory = 'all';
  var currentSearch = '';
  function applyCompetitionFilters() {
    var visibleCount = 0;
    var q = currentSearch.toLowerCase().trim();
    competitionCards.forEach(function (card) {
      var category = card.getAttribute('data-category');
      var title = card.querySelector('.card-title').textContent.toLowerCase();
      var desc = card.querySelector('.card-text').textContent.toLowerCase();
      var matchCategory = currentCategory === 'all' || category === currentCategory;
      var matchSearch = !q || title.indexOf(q) !== -1 || desc.indexOf(q) !== -1;
      var show = matchCategory && matchSearch;
      if (show) {
        visibleCount++;
        card.style.display = '';
        requestAnimationFrame(function () {
          card.style.opacity = '1';
          card.style.transform = '';
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(function () {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 300);
      }
    });
    // 显示搜索结果信息
    if (q) {
      searchResultInfo.style.display = 'block';
      searchResultInfo.innerHTML = '找到 <strong>' + visibleCount + '</strong> 个与「' + escapeHtml(currentSearch) + '」相关的赛事';
      compSearchClear.style.display = 'flex';
    } else {
      searchResultInfo.style.display = 'none';
      compSearchClear.style.display = 'none';
    }
  }
  // 重写筛选按钮逻辑，使用联合筛选
  filterBtns.forEach(function (btn) {
    btn.removeEventListener('click', btn._handler);
    btn._handler = function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      applyCompetitionFilters();
    };
    btn.addEventListener('click', btn._handler);
  });
  compSearch.addEventListener('input', function () {
    currentSearch = compSearch.value;
    applyCompetitionFilters();
  });
  compSearchClear.addEventListener('click', function () {
    compSearch.value = '';
    currentSearch = '';
    applyCompetitionFilters();
    compSearch.focus();
  });

  /* ---- 聊天记录持久化 ---- */
  var CHAT_KEY = 'jlzd_chat_history';
  function saveChatHistory() {
    try {
      var messages = [];
      chatMessages.querySelectorAll('.message').forEach(function (msg) {
        var isUser = msg.classList.contains('message-user');
        var text = msg.querySelector('.message-bubble').textContent;
        messages.push({ isUser: isUser, text: text });
      });
      localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    } catch (e) { /* ignore */ }
  }
  function loadChatHistory() {
    try {
      var data = JSON.parse(localStorage.getItem(CHAT_KEY));
      if (!data || data.length === 0) return false;
      chatMessages.innerHTML = '';
      data.forEach(function (m) {
        addMessage(m.text, m.isUser, true);
      });
      return true;
    } catch (e) { return false; }
  }
  // 修改 addMessage 支持跳过保存（加载历史时）
  var _origAddMessage = addMessage;
  addMessage = function (text, isUser, skipSave) {
    _origAddMessage(text, isUser);
    if (!skipSave) saveChatHistory();
  };
  // 清空对话时也清除历史
  chatClear.removeEventListener('click', chatClear._handler);
  chatClear._handler = function () {
    chatMessages.innerHTML = '';
    localStorage.removeItem(CHAT_KEY);
    addMessage('对话已清空。有什么我可以帮助你的吗？', false);
  };
  chatClear.addEventListener('click', chatClear._handler);
  // botReply 后保存
  var _origBotReply = botReply;
  botReply = function (question) {
    var typing = document.createElement('div');
    typing.className = 'message message-bot';
    typing.innerHTML =
      '<div class="message-avatar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>' +
      '</div>' +
      '<div class="message-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    setTimeout(function () {
      typing.remove();
      addMessage(findAnswer(question), false);
    }, 700 + Math.random() * 500);
  };
  // 页面加载时恢复聊天历史
  loadChatHistory();

  /* ---- 文档下载提示 ---- */
  document.querySelectorAll('.doc-download').forEach(function (link) {
    link.addEventListener('click', function () {
      var title = link.closest('.doc-card').querySelector('.doc-title').textContent;
      showToast('success', '开始下载', title, 2500);
    });
  });

  /* ---- 页脚弹窗：关于我们 / 帮助中心 ---- */
  var infoOverlay = document.getElementById('infoOverlay');
  var infoCloseBtn = document.getElementById('infoClose');
  var infoTitle = document.getElementById('infoTitle');
  var infoSubtitle = document.getElementById('infoSubtitle');
  var infoContent = document.getElementById('infoContent');
  var infoData = {
    about: {
      title: '关于我们',
      subtitle: '津劳智导 — 聚焦机械类学生的竞赛与志愿服务一站式平台',
      html: '<ul class="info-content-list">' +
        '<li><strong>平台定位：</strong>面向机械类专业学生，提供竞赛资讯、志愿招募、学时认证、文件指引与智能咨询的一站式服务平台。</li>' +
        '<li><strong>赛事资讯：</strong>精选全国大学生机械创新设计大赛、智能制造赛、成图大赛、金相技能大赛等10项重点机械类竞赛，提供真实报名时间、赛程与奖项信息。</li>' +
        '<li><strong>志愿招募：</strong>对接天津志愿服务网，筛选适合机械类学生的7类志愿项目，涵盖科普讲解、社区服务、生态环保、科技助农等方向。</li>' +
        '<li><strong>学时认证：</strong>注册登录后可记录竞赛与志愿服务学时，自动生成个人学时认证档案，支持导出打印。</li>' +
        '<li><strong>智能交互：</strong>内置机械类竞赛与志愿服务知识库，提供7×24小时智能问答服务。</li>' +
        '<li><strong>技术栈：</strong>原生 HTML + CSS + JavaScript，无框架依赖，响应式设计，支持桌面/平板/手机多端访问。</li>' +
        '</ul>'
    },
    help: {
      title: '帮助中心',
      subtitle: '常见问题解答，帮助你快速上手津劳智导',
      html: '<div class="help-qa"><h5>如何注册账号？</h5><p>点击导航栏右上角"登录/注册"按钮，切换到"注册"标签，填写姓名、学号、班级、入学时间、学院、手机号、邮箱和密码即可完成注册。注册成功后自动登录。</p></div>' +
        '<div class="help-qa"><h5>如何记录学时？</h5><p>登录后进入"学时认证"板块，点击"添加学时记录"按钮，选择活动类型（竞赛/志愿）、活动名称、参与日期和学时数，保存后系统自动统计。所有数据存储在本地浏览器中。</p></div>' +
        '<div class="help-qa"><h5>如何导出学时认证表？</h5><p>在"学时认证"板块的记录列表右上角，点击"导出认证表"按钮，系统将在新标签页生成包含个人信息、统计概览和记录明细的可打印页面，点击"打印/保存为PDF"即可导出。</p></div>' +
        '<div class="help-qa"><h5>如何查看赛事详情？</h5><p>在"赛事资讯"板块点击任意赛事卡片的"查看详情"链接，将弹出详细信息窗口，包含比赛内容、赛程时间线、奖项设置和官方网站链接。</p></div>' +
        '<div class="help-qa"><h5>智能助手能回答什么问题？</h5><p>智能助手内置机械类竞赛和天津志愿服务的知识库，可以回答竞赛报名时间、志愿服务注册流程、各年级参赛推荐、具体赛事详情等问题。你也可以使用快捷提问按钮快速咨询。</p></div>' +
        '<div class="help-qa"><h5>数据会丢失吗？</h5><p>用户账号、学时记录和聊天历史均存储在浏览器的 localStorage 中。清除浏览器数据或更换设备后数据将丢失，建议定期导出学时认证表备份。</p></div>'
    }
  };
  function openInfoModal(type) {
    var data = infoData[type];
    if (!data) return;
    infoTitle.textContent = data.title;
    infoSubtitle.textContent = data.subtitle;
    infoContent.innerHTML = data.html;
    infoOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeInfoModal() {
    infoOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  infoCloseBtn.addEventListener('click', closeInfoModal);
  infoOverlay.addEventListener('click', function (e) {
    if (e.target === infoOverlay) closeInfoModal();
  });

  /* ---- 页脚弹窗：意见反馈 ---- */
  var feedbackOverlay = document.getElementById('feedbackOverlay');
  var feedbackCloseBtn = document.getElementById('feedbackClose');
  var feedbackCancelBtn = document.getElementById('feedbackCancel');
  var feedbackForm = document.getElementById('feedbackForm');
  function openFeedbackModal() {
    feedbackOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeFeedbackModal() {
    feedbackOverlay.classList.remove('open');
    document.body.style.overflow = '';
    feedbackForm.reset();
  }
  feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
  feedbackCancelBtn.addEventListener('click', closeFeedbackModal);
  feedbackOverlay.addEventListener('click', function (e) {
    if (e.target === feedbackOverlay) closeFeedbackModal();
  });
  feedbackForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var type = document.getElementById('fbType').value;
    var content = document.getElementById('fbContent').value.trim();
    if (!type || !content) return;
    // 保存反馈到本地（演示用）
    try {
      var feedbacks = JSON.parse(localStorage.getItem('jlzd_feedbacks') || '[]');
      feedbacks.push({
        type: type,
        content: content,
        contact: document.getElementById('fbContact').value.trim(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('jlzd_feedbacks', JSON.stringify(feedbacks));
    } catch (err) { /* ignore */ }
    closeFeedbackModal();
    showToast('success', '反馈已提交', '感谢你的宝贵意见，我们会认真处理！', 3500);
  });

  /* ---- 页脚链接绑定 ---- */
  document.querySelectorAll('[data-footer]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var type = link.getAttribute('data-footer');
      if (type === 'about') openInfoModal('about');
      else if (type === 'help') openInfoModal('help');
      else if (type === 'feedback') openFeedbackModal();
      else if (type === 'calendar') {
        document.getElementById('competitions').scrollIntoView({ behavior: 'smooth' });
        showToast('info', '赛事日历', '可在赛事资讯板块查看全部赛事时间，或下载赛事日历文件', 3000);
      }
    });
  });

  /* ---- 注册/登录成功 Toast ---- */
  var _origHandleRegister = handleRegister;
  handleRegister = function () {
    var name = document.getElementById('regName').value.trim();
    var studentId = document.getElementById('regStudentId').value.trim();
    var className = document.getElementById('regClassName').value.trim();
    var enrollmentDate = document.getElementById('regEnrollmentDate').value;
    var college = document.getElementById('regCollege').value.trim();
    var phone = document.getElementById('regPhone').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var passwordConfirm = document.getElementById('regPasswordConfirm').value;
    var errorEl = document.getElementById('registerError');
    var successEl = document.getElementById('registerSuccess');
    errorEl.classList.remove('show');
    successEl.classList.remove('show');
    if (!name || !studentId || !className || !enrollmentDate || !college || !phone || !email || !password) {
      errorEl.textContent = '请填写所有必填字段';
      errorEl.classList.add('show');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      errorEl.textContent = '手机号格式不正确';
      errorEl.classList.add('show');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = '邮箱格式不正确';
      errorEl.classList.add('show');
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = '密码至少6位';
      errorEl.classList.add('show');
      return;
    }
    if (password !== passwordConfirm) {
      errorEl.textContent = '两次输入的密码不一致';
      errorEl.classList.add('show');
      return;
    }
    var users = getUsers();
    if (users[studentId]) {
      errorEl.textContent = '该学号已注册，请直接登录';
      errorEl.classList.add('show');
      return;
    }
    users[studentId] = {
      name: name, studentId: studentId, className: className,
      enrollmentDate: enrollmentDate, college: college,
      phone: phone, email: email, password: password,
      registeredAt: new Date().toISOString()
    };
    saveUsers(users);
    successEl.textContent = '注册成功！正在自动登录...';
    successEl.classList.add('show');
    setTimeout(function () {
      setSession(studentId);
      closeAuthModal();
      updateAuthUI();
      showToast('success', '注册成功', '欢迎你，' + name + '！学时认证功能已解锁', 3500);
      setTimeout(function () {
        document.getElementById('certify').scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }, 1000);
  };
  var _origHandleLogin = handleLogin;
  handleLogin = function () {
    var studentId = document.getElementById('loginStudentId').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errorEl = document.getElementById('loginError');
    var users = getUsers();
    if (!users[studentId]) {
      errorEl.textContent = '该学号尚未注册，请先注册账号';
      errorEl.classList.add('show');
      return;
    }
    if (users[studentId].password !== password) {
      errorEl.textContent = '密码错误，请重新输入';
      errorEl.classList.add('show');
      return;
    }
    errorEl.classList.remove('show');
    setSession(studentId);
    closeAuthModal();
    updateAuthUI();
    showToast('success', '登录成功', '欢迎回来，' + users[studentId].name, 2500);
    setTimeout(function () {
      document.getElementById('certify').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };
  // 退出登录 Toast
  btnLogoutNav.removeEventListener('click', btnLogoutNav._handler);
  btnLogoutNav._handler = function () {
    clearSession();
    updateAuthUI();
    showToast('info', '已退出登录', '期待你的下次访问', 2000);
  };
  btnLogoutNav.addEventListener('click', btnLogoutNav._handler);

  /* ---- 学时操作 Toast ---- */
  var _origHoursSubmit = hoursForm._handler;
  hoursForm.addEventListener('submit', function (e) {
    // 在原逻辑基础上添加 Toast（原逻辑已绑定，这里通过事件捕获后提示）
  });
  // 用 MutationObserver 检测学时记录变化来提示
  var _origSaveHours = saveHoursRecords;
  saveHoursRecords = function (studentId, records) {
    var oldRecords = getHoursRecords(studentId);
    _origSaveHours(studentId, records);
    if (records.length > oldRecords.length) {
      showToast('success', '学时已添加', '记录保存成功，总学时已更新', 2500);
    } else if (records.length < oldRecords.length) {
      showToast('info', '记录已删除', '学时记录已更新', 2000);
    }
  };

  /* ---- ESC 键关闭所有弹窗（扩展） ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (infoOverlay.classList.contains('open')) closeInfoModal();
      if (feedbackOverlay.classList.contains('open')) closeFeedbackModal();
    }
  });

  // 初始化认证 UI
  updateAuthUI();

  /* ============================================================
   * 新版用户系统（后端API版）
   * 支持学生/老师/管理员三种角色
   * 文件上传收发、批改打分、管理员后台
   * ============================================================ */
  var _currentUser = null;
  var _currentRoleTab = '';

  function _api(url, options) {
    options = options || {};
    return fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      ...options
    }).then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error(data.error || '请求失败');
        return data;
      });
    });
  }

  function _formatSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  function _formatDate(str) {
    if (!str) return '-';
    return new Date(str).toLocaleString('zh-CN');
  }

  function _esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  handleLogin = function() {
    var username = document.getElementById('loginStudentId').value.trim();
    var password = document.getElementById('loginPassword').value;
    var errorEl = document.getElementById('loginError');
    if (!username || !password) { errorEl.textContent = '请输入用户名和密码'; return; }
    _api('/api/login', { method: 'POST', body: JSON.stringify({ username: username, password: password }) })
    .then(function(data) {
      _currentUser = data.user;
      closeAuthModal();
      showToast('success', '登录成功', '欢迎回来，' + data.user.name, 2000);
      _updateUserUI();
    }).catch(function(e) { errorEl.textContent = e.message; });
  };

  handleRegister = function() {
    var errorEl = document.getElementById('registerError');
    var successEl = document.getElementById('registerSuccess');
    var username = document.getElementById('registerStudentId').value.trim();
    var password = document.getElementById('registerPassword').value;
    var name = document.getElementById('registerName').value.trim();
    var roleEl = document.getElementById('registerRole');
    var role = roleEl ? roleEl.value : 'student';
    var gradeEl = document.getElementById('registerGrade');
    var grade = gradeEl ? gradeEl.value : '';
    var majorEl = document.getElementById('registerMajor');
    var major = majorEl ? majorEl.value.trim() : '';
    var phoneEl = document.getElementById('registerPhone');
    var phone = phoneEl ? phoneEl.value.trim() : '';
    var emailEl = document.getElementById('registerEmail');
    var email = emailEl ? emailEl.value.trim() : '';
    if (!username || !password || !name) { errorEl.textContent = '请填写必填项'; return; }
    if (password.length < 6) { errorEl.textContent = '密码至少6位'; return; }
    _api('/api/register', { method: 'POST', body: JSON.stringify({
      username: username, password: password, name: name, role: role,
      grade: grade, major: major, phone: phone, email: email,
      student_id: username, teacher_title: ''
    })}).then(function() {
      successEl.textContent = '注册成功！请登录';
      errorEl.textContent = '';
      setTimeout(function() {
        var tabs = document.querySelectorAll('.auth-tab-btn');
        tabs.forEach(function(t) { t.classList.toggle('active', t.getAttribute('data-tab') === 'login'); });
        renderAuthForm('login');
      }, 1500);
    }).catch(function(e) { errorEl.textContent = e.message; });
  };

  btnLogoutNav.onclick = function() {
    _api('/api/logout', { method: 'POST' }).then(function() {
      _currentUser = null;
      _updateUserUI();
      showToast('info', '已退出登录', '', 1500);
    }).catch(function() {});
  };

  function _updateUserUI() {
    var navAuth = document.getElementById('navAuth');
    var navUser = document.getElementById('navUser');
    var certifyGuest = document.getElementById('certifyGuest');
    var certifyContent = document.getElementById('certifyContent');
    var rolePanel = document.getElementById('rolePanel');
    if (_currentUser) {
      navAuth.style.display = 'none';
      navUser.style.display = 'flex';
      document.getElementById('navUserName').textContent = _currentUser.name;
      document.getElementById('navUserAvatar').textContent = _currentUser.name.charAt(0);
      certifyGuest.style.display = 'none';
      certifyContent.style.display = 'block';
      if (rolePanel) rolePanel.style.display = 'block';
      document.getElementById('certifyUserName').textContent = _currentUser.name;
      var roleText = _currentUser.role === 'student' ? '学生' : _currentUser.role === 'teacher' ? '老师' : '管理员';
      document.getElementById('certifyUserMeta').textContent = roleText + ' · ' + (_currentUser.major || _currentUser.teacher_title || '');
      document.getElementById('certifyUserAvatar').textContent = _currentUser.name.charAt(0);
      _renderRolePanel();
    } else {
      navAuth.style.display = 'block';
      navUser.style.display = 'none';
      certifyGuest.style.display = 'block';
      certifyContent.style.display = 'none';
      if (rolePanel) rolePanel.style.display = 'none';
    }
  }

  function _renderRolePanel() {
    var tabsEl = document.getElementById('roleTabs');
    var contentEl = document.getElementById('roleContent');
    if (!tabsEl || !contentEl) return;
    var tabs = [];
    if (_currentUser.role === 'student') {
      tabs = [{ id: 'works', label: '📁 我的作品' }, { id: 'upload', label: '📤 上传作品' }];
    } else if (_currentUser.role === 'teacher') {
      tabs = [{ id: 'pending', label: '📥 待批改' }, { id: 'reviewed', label: '✅ 已批改' }];
    } else if (_currentUser.role === 'admin') {
      tabs = [{ id: 'stats', label: '📊 数据概览' }, { id: 'users', label: '👥 用户管理' }, { id: 'files', label: '📁 文件管理' }];
    }
    tabsEl.innerHTML = tabs.map(function(t) {
      return '<div class="role-tab' + (_currentRoleTab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</div>';
    }).join('');
    tabsEl.querySelectorAll('.role-tab').forEach(function(tab) {
      tab.onclick = function() { _currentRoleTab = this.getAttribute('data-tab'); _renderRolePanel(); };
    });
    if (!_currentRoleTab && tabs.length > 0) _currentRoleTab = tabs[0].id;
    if (_currentUser.role === 'student') {
      if (_currentRoleTab === 'works') _renderStudentWorks(contentEl);
      else if (_currentRoleTab === 'upload') _renderStudentUpload(contentEl);
    } else if (_currentUser.role === 'teacher') {
      if (_currentRoleTab === 'pending') _renderTeacherPending(contentEl);
      else if (_currentRoleTab === 'reviewed') _renderTeacherReviewed(contentEl);
    } else if (_currentUser.role === 'admin') {
      if (_currentRoleTab === 'stats') _renderAdminStats(contentEl);
      else if (_currentRoleTab === 'users') _renderAdminUsers(contentEl);
      else if (_currentRoleTab === 'files') _renderAdminFiles(contentEl);
    }
  }

  function _renderStudentWorks(el) {
    _api('/api/my-files').then(function(data) {
      var files = data.files;
      var html = '<div class="role-stats">' +
        '<div class="role-stat"><div class="num">' + files.length + '</div><div class="label">总作品</div></div>' +
        '<div class="role-stat"><div class="num">' + files.filter(function(f){return f.status==='pending';}).length + '</div><div class="label">待批改</div></div>' +
        '<div class="role-stat"><div class="num">' + files.filter(function(f){return f.status==='reviewed';}).length + '</div><div class="label">已批改</div></div></div>';
      if (files.length === 0) {
        html += '<div class="role-empty"><div class="icon">📭</div><p>还没有上传作品，点击"上传作品"开始</p></div>';
      } else {
        html += '<div class="role-table-wrap"><table class="role-table"><thead><tr><th>文件名</th><th>大小</th><th>发送给</th><th>状态</th><th>分数</th><th>评语</th><th>上传时间</th><th>操作</th></tr></thead><tbody>';
        files.forEach(function(f) {
          html += '<tr><td>' + _esc(f.original_name) + '</td><td class="file-size-text">' + _formatSize(f.file_size) + '</td><td>' + _esc(f.receiver_name || '未发送') + '</td><td><span class="status-pill ' + f.status + '">' + (f.status === 'pending' ? '待批改' : '已批改') + '</span></td><td>' + (f.score !== null ? '<span class="score-badge">' + f.score + '</span>' : '-') + '</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + _esc(f.comment || '') + '">' + _esc(f.comment || '-') + '</td><td>' + _formatDate(f.created_at) + '</td><td><a href="/api/download/' + f.id + '" target="_blank" class="role-btn role-btn-secondary" style="text-decoration:none;">下载</a></td></tr>';
        });
        html += '</tbody></table></div>';
      }
      el.innerHTML = html;
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  function _renderStudentUpload(el) {
    el.innerHTML = '<div class="upload-area-inline" id="uploadAreaInline"><div class="icon">📁</div><p><strong>点击选择文件</strong> 或拖拽文件到此处</p><p style="font-size:12px;margin-top:4px;">支持任意格式，单个文件最大2GB</p><div class="file-name" id="uploadFileNameInline"></div></div><input type="file" id="fileInputInline" style="display:none;"><div id="sendToTeacherInline" style="display:none;"><div class="form-group-inline"><label>选择老师</label><select id="teacherSelectInline"><option value="">请选择老师</option></select></div><div class="form-group-inline"><label>作品说明（可选）</label><textarea id="fileDescInline" rows="3" placeholder="简要说明作品内容、竞赛名称等"></textarea></div><button class="role-btn role-btn-primary" id="btnSendInline" style="padding:10px 24px;font-size:14px;">📤 发送给老师批改</button></div>';
    var _selectedFileId = null;
    var area = document.getElementById('uploadAreaInline');
    var input = document.getElementById('fileInputInline');
    area.onclick = function() { input.click(); };
    area.addEventListener('dragover', function(e) { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', function() { area.classList.remove('dragover'); });
    area.addEventListener('drop', function(e) { e.preventDefault(); area.classList.remove('dragover'); _doUploadInline(e.dataTransfer.files[0]); });
    input.onchange = function() { if (this.files[0]) _doUploadInline(this.files[0]); };
    _api('/api/teachers').then(function(data) {
      var sel = document.getElementById('teacherSelectInline');
      data.teachers.forEach(function(t) {
        var opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name + '（' + (t.teacher_title || t.major || '老师') + '）';
        sel.appendChild(opt);
      });
    }).catch(function() {});
    function _doUploadInline(file) {
      if (!file) return;
      document.getElementById('uploadFileNameInline').textContent = '已选择：' + file.name + '（' + _formatSize(file.size) + '）';
      var formData = new FormData();
      formData.append('file', file);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.withCredentials = true;
      xhr.onload = function() {
        try {
          var res = JSON.parse(xhr.responseText);
          if (res.success) {
            _selectedFileId = res.fileId;
            document.getElementById('sendToTeacherInline').style.display = 'block';
            showToast('success', '上传成功', '请选择老师发送', 2000);
          } else { showToast('error', '上传失败', res.error || '', 2000); }
        } catch (e) { showToast('error', '上传失败', e.message, 2000); }
      };
      xhr.onerror = function() { showToast('error', '上传失败', '网络错误', 2000); };
      xhr.send(formData);
    }
    document.getElementById('btnSendInline').onclick = function() {
      var teacherId = document.getElementById('teacherSelectInline').value;
      var desc = document.getElementById('fileDescInline').value;
      if (!teacherId) { showToast('error', '请选择老师', '', 1500); return; }
      if (!_selectedFileId) { showToast('error', '请先上传文件', '', 1500); return; }
      _api('/api/send-file', { method: 'POST', body: JSON.stringify({ file_id: _selectedFileId, receiver_id: parseInt(teacherId), description: desc }) })
      .then(function() {
        showToast('success', '发送成功', '作品已发送给老师，等待批改', 2000);
        _currentRoleTab = 'works';
        _renderRolePanel();
      }).catch(function(e) { showToast('error', '发送失败', e.message, 2000); });
    };
  }

  function _renderTeacherPending(el) {
    _api('/api/received-files').then(function(data) {
      var files = data.files.filter(function(f) { return f.status === 'pending'; });
      var html = '<div class="role-stats"><div class="role-stat"><div class="num">' + files.length + '</div><div class="label">待批改</div></div></div>';
      if (files.length === 0) {
        html += '<div class="role-empty"><div class="icon">🎉</div><p>没有待批改的作品</p></div>';
      } else {
        html += '<div class="role-table-wrap"><table class="role-table"><thead><tr><th>文件名</th><th>大小</th><th>学生</th><th>年级/专业</th><th>说明</th><th>提交时间</th><th>操作</th></tr></thead><tbody>';
        files.forEach(function(f) {
          html += '<tr><td>' + _esc(f.original_name) + '</td><td class="file-size-text">' + _formatSize(f.file_size) + '</td><td>' + _esc(f.sender_name) + '</td><td>' + _esc((f.grade || '') + ' ' + (f.major || '')) + '</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + _esc(f.description || '') + '">' + _esc(f.description || '-') + '</td><td>' + _formatDate(f.created_at) + '</td><td><a href="/api/download/' + f.id + '" target="_blank" class="role-btn role-btn-secondary" style="text-decoration:none;">下载</a> <button class="role-btn role-btn-success" onclick="_openReviewModal(' + f.id + ', \'' + _esc(f.original_name).replace(/'/g, "\\'") + '\')">批改</button></td></tr>';
        });
        html += '</tbody></table></div>';
      }
      el.innerHTML = html;
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  function _renderTeacherReviewed(el) {
    _api('/api/received-files').then(function(data) {
      var files = data.files.filter(function(f) { return f.status === 'reviewed'; });
      var avg = files.length > 0 ? (files.reduce(function(s,f){return s+(f.score||0);},0)/files.length).toFixed(1) : '-';
      var html = '<div class="role-stats"><div class="role-stat"><div class="num">' + files.length + '</div><div class="label">已批改</div></div><div class="role-stat"><div class="num">' + avg + '</div><div class="label">平均分</div></div></div>';
      if (files.length === 0) {
        html += '<div class="role-empty"><div class="icon">📋</div><p>还没有批改记录</p></div>';
      } else {
        html += '<div class="role-table-wrap"><table class="role-table"><thead><tr><th>文件名</th><th>学生</th><th>分数</th><th>评语</th><th>批改时间</th><th>操作</th></tr></thead><tbody>';
        files.forEach(function(f) {
          html += '<tr><td>' + _esc(f.original_name) + '</td><td>' + _esc(f.sender_name) + '</td><td><span class="score-badge">' + f.score + '</span></td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + _esc(f.comment || '') + '">' + _esc(f.comment || '-') + '</td><td>' + _formatDate(f.reviewed_at) + '</td><td><a href="/api/download/' + f.id + '" target="_blank" class="role-btn role-btn-secondary" style="text-decoration:none;">下载</a></td></tr>';
        });
        html += '</tbody></table></div>';
      }
      el.innerHTML = html;
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  window._openReviewModal = function(fileId, fileName) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = '<div style="background:white;border-radius:12px;padding:24px;width:100%;max-width:480px;"><h3 style="margin-bottom:16px;color:#1e293b;">✏️ 批改作品</h3><p style="margin-bottom:16px;color:#64748b;font-size:14px;">文件：<strong>' + _esc(fileName) + '</strong></p><div style="margin-bottom:12px;"><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500;">分数（0-100）</label><input type="number" id="reviewScoreInput" min="0" max="100" style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;"></div><div style="margin-bottom:16px;"><label style="display:block;margin-bottom:4px;font-size:13px;font-weight:500;">评语</label><textarea id="reviewCommentInput" rows="4" style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px;"></textarea></div><div style="display:flex;gap:12px;justify-content:flex-end;"><button id="reviewCancelBtn" style="padding:8px 16px;border:none;border-radius:6px;background:#f1f5f9;cursor:pointer;">取消</button><button id="reviewSubmitBtn" style="padding:8px 16px;border:none;border-radius:6px;background:#2563eb;color:white;cursor:pointer;">提交批改</button></div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#reviewCancelBtn').onclick = function() { overlay.remove(); };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    overlay.querySelector('#reviewSubmitBtn').onclick = function() {
      var score = parseInt(overlay.querySelector('#reviewScoreInput').value);
      var comment = overlay.querySelector('#reviewCommentInput').value;
      if (isNaN(score) || score < 0 || score > 100) { showToast('error', '请输入0-100的分数', '', 1500); return; }
      _api('/api/review', { method: 'POST', body: JSON.stringify({ file_id: fileId, score: score, comment: comment }) })
      .then(function() { showToast('success', '批改完成', '', 2000); overlay.remove(); _renderRolePanel(); })
      .catch(function(e) { showToast('error', '批改失败', e.message, 2000); });
    };
  };

  function _renderAdminStats(el) {
    _api('/api/admin/stats').then(function(data) {
      var s = data.stats;
      el.innerHTML = '<div class="role-stats">' +
        '<div class="role-stat"><div class="num">' + s.totalUsers + '</div><div class="label">总用户</div></div>' +
        '<div class="role-stat"><div class="num">' + s.students + '</div><div class="label">学生</div></div>' +
        '<div class="role-stat"><div class="num">' + s.teachers + '</div><div class="label">老师</div></div>' +
        '<div class="role-stat"><div class="num">' + s.totalFiles + '</div><div class="label">文件总数</div></div>' +
        '<div class="role-stat"><div class="num">' + s.pendingFiles + '</div><div class="label">待批改</div></div>' +
        '<div class="role-stat"><div class="num">' + s.reviewedFiles + '</div><div class="label">已批改</div></div>' +
        '<div class="role-stat" style="grid-column:span 2;"><div class="num">' + _formatSize(s.totalSize) + '</div><div class="label">文件总大小</div></div></div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;"><a href="/api/admin/export-users" target="_blank" class="role-btn role-btn-success" style="text-decoration:none;padding:10px 20px;">📊 导出用户列表</a><a href="/api/admin/export-files" target="_blank" class="role-btn role-btn-warning" style="text-decoration:none;padding:10px 20px;">📊 导出文件记录</a></div>';
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  function _renderAdminUsers(el) {
    _api('/api/admin/users').then(function(data) {
      var users = data.users;
      var html = '<div style="margin-bottom:12px;"><a href="/api/admin/export-users" target="_blank" class="role-btn role-btn-success" style="text-decoration:none;">📊 导出Excel</a></div>';
      html += '<div class="role-table-wrap"><table class="role-table"><thead><tr><th>ID</th><th>用户名</th><th>角色</th><th>姓名</th><th>年级/专业</th><th>联系方式</th><th>状态</th><th>注册时间</th><th>操作</th></tr></thead><tbody>';
      users.forEach(function(u) {
        html += '<tr><td>' + u.id + '</td><td>' + _esc(u.username) + '</td><td><span class="role-pill ' + u.role + '">' + (u.role === 'student' ? '学生' : u.role === 'teacher' ? '老师' : '管理员') + '</span></td><td>' + _esc(u.name) + '</td><td>' + _esc((u.grade || '') + ' ' + (u.major || '')) + '</td><td>' + _esc(u.phone || u.email || '-') + '</td><td><span class="status-pill ' + u.status + '">' + (u.status === 'active' ? '正常' : '禁用') + '</span></td><td>' + _formatDate(u.created_at) + '</td><td>' + (u.role !== 'admin' ? '<button class="role-btn ' + (u.status === 'active' ? 'role-btn-danger' : 'role-btn-success') + '" onclick="_toggleUser(' + u.id + ', \'' + (u.status === 'active' ? 'disabled' : 'active') + '\')">' + (u.status === 'active' ? '禁用' : '启用') + '</button>' : '-') + '</td></tr>';
      });
      html += '</tbody></table></div>';
      el.innerHTML = html;
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  window._toggleUser = function(userId, status) {
    if (!confirm('确定要' + (status === 'active' ? '启用' : '禁用') + '该用户吗？')) return;
    _api('/api/admin/toggle-user', { method: 'POST', body: JSON.stringify({ user_id: userId, status: status }) })
    .then(function() { showToast('success', '操作成功', '', 1500); _renderRolePanel(); })
    .catch(function(e) { showToast('error', '操作失败', e.message, 2000); });
  };

  function _renderAdminFiles(el) {
    _api('/api/admin/files').then(function(data) {
      var files = data.files;
      var html = '<div style="margin-bottom:12px;"><a href="/api/admin/export-files" target="_blank" class="role-btn role-btn-warning" style="text-decoration:none;">📊 导出Excel</a></div>';
      html += '<div class="role-table-wrap"><table class="role-table"><thead><tr><th>ID</th><th>文件名</th><th>大小</th><th>发送者</th><th>接收者</th><th>状态</th><th>分数</th><th>上传时间</th><th>操作</th></tr></thead><tbody>';
      files.forEach(function(f) {
        html += '<tr><td>' + f.id + '</td><td>' + _esc(f.original_name) + '</td><td class="file-size-text">' + _formatSize(f.file_size) + '</td><td>' + _esc(f.sender_name || '-') + '</td><td>' + _esc(f.receiver_name || '-') + '</td><td><span class="status-pill ' + f.status + '">' + (f.status === 'pending' ? '待批改' : '已批改') + '</span></td><td>' + (f.score !== null ? '<span class="score-badge">' + f.score + '</span>' : '-') + '</td><td>' + _formatDate(f.created_at) + '</td><td><a href="/api/download/' + f.id + '" target="_blank" class="role-btn role-btn-secondary" style="text-decoration:none;">下载</a></td></tr>';
      });
      html += '</tbody></table></div>';
      el.innerHTML = html;
    }).catch(function(e) { el.innerHTML = '<div class="role-empty"><p>加载失败：' + e.message + '</p></div>'; });
  }

  _api('/api/me').then(function(data) {
    _currentUser = data.user;
    _updateUserUI();
  }).catch(function() {
    _currentUser = null;
    _updateUserUI();
  });

  /* ---- 初始化 ---- */
  onScroll();
  renderQuickButtons();
})();
