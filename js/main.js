(function () {
  "use strict";

  /** Data e hora do casamento (horário de Brasília). Ajuste se necessário. */
  var WEDDING_ISO = "2026-07-10T10:30:00-03:00";

  /** ID do vídeo do YouTube (trecho após v= no link) */
  var YT_VIDEO_ID = "l7e_NxisJ5E";

  /** Segundos em que a trilha começa (ex.: 20 = 0:20) */
  var YT_START_SECONDS = 20;

  function parseWeddingDate() {
    return new Date(WEDDING_ISO);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    var elDays = document.getElementById("cd-days");
    var elHours = document.getElementById("cd-hours");
    var elMinutes = document.getElementById("cd-minutes");
    var elSeconds = document.getElementById("cd-seconds");
    var section = document.getElementById("countdown");
    if (!elDays || !section) return;

    var target = parseWeddingDate();
    var now = new Date();
    var diff = target.getTime() - now.getTime();


    if (diff <= 0) {
      section.classList.add("is-done");
      if (elDays) elDays.textContent = "00";
      if (elHours) elHours.textContent = "00";
      if (elMinutes) elMinutes.textContent = "00";
      if (elSeconds) elSeconds.textContent = "00";
      return;
    }

    section.classList.remove("is-done");
    var s = Math.floor(diff / 1000);
    var days = Math.floor(s / 86400);
    s -= days * 86400;
    var hours = Math.floor(s / 3600);
    s -= hours * 3600;
    var minutes = Math.floor(s / 60);
    var seconds = s - minutes * 60;

    elDays.textContent = days >= 100 ? String(days) : pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  function initYouTubePlayer() {
    var btn = document.getElementById("btn-music");
    var host = document.getElementById("yt-player");
    if (!btn || !host) return;

    var ytPlayer = null;

    function syncIcon(playing) {
      if (playing) {
        btn.classList.add("is-playing");
        btn.setAttribute("aria-label", "Pausar música");
      } else {
        btn.classList.remove("is-playing");
        btn.setAttribute("aria-label", "Tocar música");
      }
    }

    function onReady(event) {
      ytPlayer = event.target;
      btn.disabled = false;
      syncIcon(false);
    }

    function onStateChange(event) {
      if (typeof YT === "undefined" || !YT.PlayerState) return;
      if (event.data === YT.PlayerState.PLAYING) {
        syncIcon(true);
      } else if (event.data === YT.PlayerState.PAUSED) {
        syncIcon(false);
      } else if (event.data === YT.PlayerState.ENDED) {
        var p = event.target;
        p.seekTo(YT_START_SECONDS, true);
        p.playVideo();
      }
    }

    function createPlayer() {
      if (typeof YT === "undefined" || !YT.Player) return;
      new YT.Player(host, {
        height: "180",
        width: "320",
        videoId: YT_VIDEO_ID,
        playerVars: {
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          start: YT_START_SECONDS,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: onReady,
          onStateChange: onStateChange
        }
      });
    }

    function loadApi() {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }
      window.onYouTubeIframeAPIReady = function () {
        createPlayer();
      };
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }

    btn.addEventListener("click", function () {
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== "function") return;
      if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });

    loadApi();
  }

  function initNamesTypewriter() {
    var el1 = document.getElementById("typed-name-1");
    var el2 = document.getElementById("typed-name-2");
    var c1 = document.getElementById("cursor-1");
    var c2 = document.getElementById("cursor-2");
    var elAnd = document.getElementById("names-and");
    if (!el1 || !el2 || !c1 || !c2 || !elAnd) return;

    var NAME1 = "Géssica";
    var NAME2 = "Vicctor";
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    function finishIntro() {
      document.body.classList.add("is-names-ready");
      elAnd.setAttribute("aria-hidden", "false");
    }

    if (mq.matches) {
      el1.textContent = NAME1;
      el2.textContent = NAME2;
      elAnd.classList.remove("names__and--hidden");
      finishIntro();
      return;
    }

    function wait(ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    }

    function rnd(base, jitter) {
      return base + Math.floor(Math.random() * jitter);
    }

    function typeInto(el, text) {
      return new Promise(function (resolve) {
        var i = 0;
        function step() {
          if (i >= text.length) {
            resolve();
            return;
          }
          el.textContent += text.charAt(i);
          i += 1;
          setTimeout(step, rnd(80, 55));
        }
        step();
      });
    }

    el1.textContent = "";
    el2.textContent = "";
    c1.classList.remove("names__cursor--idle");
    c1.classList.add("names__cursor--active");

    typeInto(el1, NAME1)
      .then(function () {
        c1.classList.remove("names__cursor--active");
        c1.classList.add("names__cursor--idle");
        return wait(380);
      })
      .then(function () {
        elAnd.classList.remove("names__and--hidden");
        elAnd.setAttribute("aria-hidden", "false");
        return wait(480);
      })
      .then(function () {
        c2.classList.remove("names__cursor--idle");
        c2.classList.add("names__cursor--active");
        return typeInto(el2, NAME2);
      })
      .then(function () {
        c2.classList.remove("names__cursor--active");
        c2.classList.add("names__cursor--idle");
        finishIntro();
      });
  }

  function absoluteTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function initScrollSpy() {
    var anchors = document.querySelectorAll(".action-item--anchor[href^='#']");
    if (!anchors.length) return;

    var map = [];
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) map.push({ id: id, el: el, link: a });
    }
    if (!map.length) return;

    function update() {
      var marker = window.scrollY + window.innerHeight * 0.35;
      var current = map[0].id;
      for (var j = 0; j < map.length; j++) {
        if (absoluteTop(map[j].el) <= marker + 2) {
          current = map[j].id;
        }
      }
      for (var k = 0; k < map.length; k++) {
        var on = map[k].id === current;
        map[k].link.classList.toggle("is-active", on);
        if (on) {
          map[k].link.setAttribute("aria-current", "location");
        } else {
          map[k].link.removeAttribute("aria-current");
        }
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
  initYouTubePlayer();
  initNamesTypewriter();
  initScrollSpy();
})();
