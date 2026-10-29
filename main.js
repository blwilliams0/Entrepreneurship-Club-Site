/* CSUMB Entrepreneurship Club — site behavior. Plain JS, no dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- Mobile menu ---- */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  /* ---- Next meeting (data lives in data/site.js) ---- */
  var site = window.CLUB_SITE || {};

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(hhmm) { var a = hhmm.split(":"); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
  function parseYMD(s) { var a = s.split("-"); return Date.UTC(+a[0], +a[1] - 1, +a[2]); }
  function fmtTime(hhmm) {
    var a = hhmm.split(":"), h = parseInt(a[0], 10);
    return { t: ((h % 12) || 12) + ":" + a[1], ap: h >= 12 ? "PM" : "AM" };
  }
  function fmtRange(s, e) {
    var a = fmtTime(s), b = fmtTime(e);
    return a.ap === b.ap ? a.t + "–" + b.t + " " + b.ap : a.t + " " + a.ap + "–" + b.t + " " + b.ap;
  }
  // Current date and time of day in Pacific time, whatever the visitor's time zone.
  function pacificNow() {
    var o = {};
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + "-" + o.month + "-" + o.day, minutes: parseInt(o.hour, 10) * 60 + parseInt(o.minute, 10) };
  }
  function nextFromSchedule(sc) {
    if (!sc || !sc.startDate || !sc.endDate) return null;
    var now = pacificNow(), endMin = toMin(sc.endTime), skip = sc.skipDates || [];
    for (var t = parseYMD(sc.startDate); t <= parseYMD(sc.endDate); t += 86400000) {
      var d = new Date(t);
      if (d.getUTCDay() !== sc.weekday) continue;
      var ymd = d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
      if (skip.indexOf(ymd) !== -1) continue;
      if (ymd < now.date || (ymd === now.date && now.minutes >= endMin)) continue;
      var label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
      return {
        date: (ymd === now.date ? "Today, " : "") + label,
        time: fmtRange(sc.startTime, sc.endTime),
        location: sc.location,
        topic: (site.topics || {})[ymd] || sc.defaultTopic || ""
      };
    }
    return null;
  }

  var override = site.nextMeeting || {};
  var m = (override.date && String(override.date).trim()) ? override : nextFromSchedule(site.schedule);
  var hasMeeting = !!m;
  if (!m) m = { message: site.afterScheduleMessage };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  document.querySelectorAll("[data-meeting]").forEach(function (box) {
    box.textContent = "";
    if (!hasMeeting) {
      box.appendChild(el("p", "meeting-empty", m.message || "Details for the next meeting are coming soon. Follow us on Instagram to see them first."));
      return;
    }
    var dl = el("dl", "meeting-facts");
    [["When", m.date], ["Time", m.time], ["Where", m.location]].forEach(function (pair) {
      if (!pair[1]) return;
      var d = el("div");
      d.appendChild(el("dt", null, pair[0]));
      d.appendChild(el("dd", null, pair[1]));
      dl.appendChild(d);
    });
    box.appendChild(dl);
    if (m.topic) box.appendChild(el("p", "meeting-topic", m.topic));
  });

  document.querySelectorAll("[data-meeting-line]").forEach(function (line) {
    if (!hasMeeting) return;
    var parts = [m.date, m.time, m.location].filter(Boolean).join(", ");
    line.textContent = "Next meeting: " + parts;
  });

  /* ---- Stage ladder rises once when scrolled into view ---- */
  var ladder = document.querySelector(".ladder");
  if (ladder) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { ladder.classList.add("in"); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(ladder);
    } else {
      ladder.classList.add("in");
    }
  }

  /* ---- Copy buttons: copies the text of the element named in data-copy ---- */
  document.querySelectorAll("button[data-copy]").forEach(function (b) {
    var original = b.textContent;
    b.addEventListener("click", function () {
      var target = document.getElementById(b.getAttribute("data-copy"));
      if (!target) return;
      var text = target.innerText.trim();
      var done = function () {
        b.textContent = "Copied";
        setTimeout(function () { b.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { b.textContent = "Press Ctrl/Cmd+C to copy"; });
      } else {
        var r = document.createRange(); r.selectNodeContents(target);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        b.textContent = "Text selected. Press Ctrl/Cmd+C";
      }
    });
  });

  /* ---- Remember checklist ticks and 7-day plan answers in this browser only ---- */
  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }
  document.querySelectorAll("[data-remember]").forEach(function (f) {
    var key = "csumb-ec:" + f.getAttribute("data-remember");
    var saved = store(key);
    if (f.type === "checkbox") {
      if (saved === "1") f.checked = true;
      f.addEventListener("change", function () { store(key, f.checked ? "1" : "0"); });
    } else {
      if (saved) f.value = saved;
      f.addEventListener("input", function () { store(key, f.value); });
    }
  });

  document.querySelectorAll("[data-print]").forEach(function (b) {
    b.addEventListener("click", function () { window.print(); });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
