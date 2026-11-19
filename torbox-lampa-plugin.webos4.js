/* Compatibility prelude for webOS 4.x (Chromium 53). Added by conversion; not part of the original plugin. */
(function () {
  var w = window;
  if (!Object.entries) Object.entries = function (o) { var k = Object.keys(o), i = k.length, r = new Array(i); while (i--) r[i] = [k[i], o[k[i]]]; return r; };
  if (!Object.values) Object.values = function (o) { return Object.keys(o).map(function (k) { return o[k]; }); };
  if (!String.prototype.padStart) String.prototype.padStart = function (n, s) {
    var str = String(this); n = n >> 0; s = String(s === undefined ? ' ' : s);
    if (str.length >= n || !s.length) return str;
    var pad = ''; while (pad.length < n - str.length) pad += s;
    return pad.slice(0, n - str.length) + str;
  };
  if (!String.prototype.padEnd) String.prototype.padEnd = function (n, s) {
    var str = String(this); n = n >> 0; s = String(s === undefined ? ' ' : s);
    if (str.length >= n || !s.length) return str;
    var pad = ''; while (pad.length < n - str.length) pad += s;
    return str + pad.slice(0, n - str.length);
  };
  if (!Array.prototype.flat) Object.defineProperty(Array.prototype, 'flat', { configurable: true, writable: true, value: function (d) {
    d = d === undefined ? 1 : Number(d);
    return (function f(a, depth) { return a.reduce(function (acc, v) { return Array.isArray(v) && depth > 0 ? acc.concat(f(v, depth - 1)) : acc.concat([v]); }, []); })(this, d);
  } });
  if (typeof Promise !== 'undefined' && !Promise.prototype.finally) Promise.prototype.finally = function (cb) {
    var P = this.constructor || Promise;
    return this.then(function (v) { return P.resolve(cb()).then(function () { return v; }); },
                     function (e) { return P.resolve(cb()).then(function () { throw e; }); });
  };
  if (typeof w.AbortController === 'undefined') {
    var Signal = function () { this.aborted = false; this._l = []; this.onabort = null; };
    Signal.prototype.addEventListener = function (t, f) { if (t === 'abort') this._l.push(f); };
    Signal.prototype.removeEventListener = function (t, f) { this._l = this._l.filter(function (x) { return x !== f; }); };
    var Ctl = function () { this.signal = new Signal(); };
    Ctl.prototype.abort = function () {
      var s = this.signal; if (s.aborted) return; s.aborted = true;
      var ev = { type: 'abort', target: s };
      if (typeof s.onabort === 'function') { try { s.onabort(ev); } catch (e) {} }
      s._l.slice().forEach(function (f) { try { f.call(s, ev); } catch (e) {} });
    };
    w.AbortController = Ctl; w.AbortSignal = Signal;
    /* Chromium 53 fetch ignores signals: make a polyfilled signal reject the fetch promise. */
    if (w.fetch) {
      var nativeFetch = w.fetch.bind(w);
      w.fetch = function (input, init) {
        var sig = init && init.signal;
        if (!(sig instanceof Signal)) return nativeFetch(input, init);
        var copy = {}; for (var k in init) if (k !== 'signal') copy[k] = init[k];
        var abortErr = function () { var e = new Error('The operation was aborted.'); e.name = 'AbortError'; return e; };
        if (sig.aborted) return Promise.reject(abortErr());
        return new Promise(function (resolve, reject) {
          var onAbort = function () { reject(abortErr()); };
          sig.addEventListener('abort', onAbort);
          nativeFetch(input, copy).then(function (r) { sig.removeEventListener('abort', onAbort); resolve(r); },
                                        function (e) { sig.removeEventListener('abort', onAbort); reject(e); });
        });
      };
    }
  }
})();

/* Added by conversion: use jac.red as an additional (first-priority) search parser. */
try { localStorage.setItem('torbox_custom_parsers', 'jac.red'); } catch (e) {}
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var _a;
try {
  console.log("[TorBox] boot strap", "51.2.14");
  (function() {
    "use strict";
    const PLUGIN_FLAG = "torbox_lampa_plugin_integrated_v2";
    if (window[PLUGIN_FLAG]) return;
    window[PLUGIN_FLAG] = true;
    const VERSION = "51.2.14";
    const CONST = {
      CACHE_LIMIT: 128,
      CACHE_TTL_MS: 10 * 60 * 1e3,
      // 10 minutes
      TORBOX_API_TIMEOUT_MS: 20 * 1e3,
      // 20 seconds
      PUBLIC_PARSER_TIMEOUT_MS: 5 * 1e3,
      // 5 seconds
      PARSER_COOLDOWN_MS: 15 * 60 * 1e3,
      // 15 minutes
      TRACKING_POLL_INTERVAL_MS: 10 * 1e3,
      // 10 seconds
      MAX_DRAW_ITEMS: 300,
      // Guard against very large result sets
      RAW_CACHE_HASH_LIMIT: 64,
      MAX_WATCHED_EPISODES: 250,
      MAX_SNAPSHOT_BYTES: 4096,
      TRACK_RETRIES_MIN: 3,
      TRACK_RETRIES_MAX: 120,
      TRACK_INTERVAL_MIN_MS: 3e3,
      TRACK_INTERVAL_MAX_MS: 6e4
    };
    const DEFAULT_VIDEO_EXTENSIONS = "mkv,mp4,avi,ts,m4v,webm";
    const PUBLIC_PARSERS = [
      // These are TorBox-compatible tracker indexer gateways frequently used by Lampa plugins.
      // If one is down, the next will be tried.
      { name: "MaxVol", url: "jr.maxvol.pro", key: "" },
      { name: "Jacred", url: "jacred.xyz", key: "" }
    ];
    const ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7L12 2L21 7V17L12 22L3 17V7Z" stroke="currentColor" stroke-width="2"/><path d="M12 22V12" stroke="currentColor" stroke-width="2"/><path d="M21 7L12 12L3 7" stroke="currentColor" stroke-width="2"/></svg>';
    const safeStorage = (() => {
      try {
        localStorage.setItem("__torbox_test__", "1");
        localStorage.removeItem("__torbox_test__");
        return localStorage;
      } catch (_) {
        const mem = {};
        return {
          getItem: (k) => k in mem ? mem[k] : null,
          setItem: (k, v) => mem[k] = String(v),
          removeItem: (k) => delete mem[k],
          clear: () => Object.keys(mem).forEach((k) => delete mem[k])
        };
      }
    })();
    const Store = {
      get(key, def = null) {
        try {
          const v = safeStorage.getItem(key);
          return v !== null ? v : def;
        } catch (e) {
          return def;
        }
      },
      set(key, val) {
        try {
          safeStorage.setItem(key, String(val));
        } catch (e) {
        }
      }
    };
    const DebugTelemetry = {
      logs: [],
      lastError: null,
      parserAttempts: [],
      selectedParser: null
    };
    const pushDebugLog = (level, args) => {
      try {
        const msg = args.map((a) => {
          if (typeof a === "string") return a;
          try {
            return JSON.stringify(a);
          } catch (e) {
            return String(a);
          }
        }).join(" ");
        DebugTelemetry.logs.push({
          ts: (/* @__PURE__ */ new Date()).toISOString(),
          level,
          msg
        });
        if (DebugTelemetry.logs.length > 50) {
          DebugTelemetry.logs = DebugTelemetry.logs.slice(-50);
        }
      } catch (e) {
      }
    };
    const parseBoolean = (value, fallback = false) => {
      if (value === true || value === false) return value;
      const normalized = String(value != null ? value : "").trim().toLowerCase();
      if (["1", "true", "on", "yes"].includes(normalized)) return true;
      if (["0", "false", "off", "no"].includes(normalized)) return false;
      return fallback;
    };
    const DEFAULT_PROXY_URL = "https://my-torbox-proxy.slonce70.workers.dev";
    const Config = {
      get debug() {
        return Store.get("torbox_debug", "0") === "1";
      },
      set debug(v) {
        if (typeof v === "string") {
          const normalized = v.trim().toLowerCase();
          if (["0", "false", "off", "no"].includes(normalized)) v = false;
          else if (["1", "true", "on", "yes"].includes(normalized)) v = true;
        }
        Store.set("torbox_debug", v ? "1" : "0");
      },
      get proxyUrl() {
        return Store.get("torbox_proxy_url", "") || DEFAULT_PROXY_URL;
      },
      set proxyUrl(v) {
        const normalized = String(v || "").replace(/[\r\n]+/g, "").trim();
        Store.set("torbox_proxy_url", normalized);
      },
      get apiKey() {
        const b64 = Store.get("torbox_api_key_b64", "");
        if (!b64) return "";
        try {
          return atob(b64);
        } catch (e) {
          Store.set("torbox_api_key_b64", "");
          return "";
        }
      },
      set apiKey(v) {
        const normalized = String(v || "").replace(/[\r\n]+/g, "").trim();
        Store.set("torbox_api_key_b64", normalized ? btoa(normalized) : "");
      }
    };
    const LOG = (...args) => {
      pushDebugLog("log", args);
      if (Config.debug) console.log("[TorBox]", ...args);
    };
    const translate = (key) => {
      try {
        if (window.Lampa && Lampa.Lang && typeof Lampa.Lang.translate === "function") {
          const value = Lampa.Lang.translate(key);
          if (value !== void 0) return value;
        }
      } catch (err) {
        LOG("Translate error", err);
      }
      return key;
    };
    const translateWithParams = (key, params = {}) => {
      const base = translate(key) || "";
      return base.replace(/\{(\w+)\}/g, (match, p1) => p1 in params ? params[p1] : match);
    };
    const Utils = {
      escapeHtml(str = "") {
        const div = document.createElement("div");
        div.textContent = String(str);
        return div.innerHTML;
      },
      formatBytes(bytes = 0, speed = false) {
        const B = Number(bytes) || 0;
        const k = 1024;
        const units = speed ? ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"] : ["B", "KB", "MB", "GB", "TB"];
        if (B <= 0) return speed ? "0 KB/s" : "0 B";
        const i = Math.min(Math.floor(Math.log(B) / Math.log(k)), units.length - 1);
        return (B / Math.pow(k, i)).toFixed(2) + " " + units[i];
      },
      formatTime(sec = 0) {
        const s = Math.max(0, Math.floor(Number(sec) || 0));
        if (!isFinite(s) || s > 30 * 24 * 3600) return translate("torbox_time_infinite");
        const h = Math.floor(s / 3600);
        const m = Math.floor(s % 3600 / 60);
        const r = s % 60;
        const parts = [];
        if (h) parts.push(translateWithParams("torbox_time_hours_short", { value: h }));
        if (m) parts.push(translateWithParams("torbox_time_minutes_short", { value: m }));
        parts.push(translateWithParams("torbox_time_seconds_short", { value: r }));
        return parts.filter(Boolean).join(" ");
      },
      formatAge(iso) {
        if (!iso) return translate("torbox_not_available");
        const d = new Date(iso);
        if (isNaN(d)) return translate("torbox_not_available");
        const diff = Math.floor((Date.now() - d.getTime()) / 1e3);
        const m = Math.floor(diff / 60);
        const h = Math.floor(m / 60);
        const days = Math.floor(h / 24);
        if (diff < 60) return translateWithParams("torbox_age_seconds", { value: diff });
        if (m < 60) return translateWithParams("torbox_age_minutes", { value: m });
        if (h < 24) return translateWithParams("torbox_age_hours", { value: h });
        return translateWithParams("torbox_age_days", { value: days });
      },
      getQualityLabel(title = "", raw) {
        var _a2;
        if ((_a2 = raw == null ? void 0 : raw.info) == null ? void 0 : _a2.quality) {
          const normalized = String(raw.info.quality).replace(/[^0-9a-z.+-]/gi, "").toUpperCase();
          if (normalized) {
            if (normalized === "UHD" || normalized === "4K") return "4K";
            if (/^\d{3,4}P$/.test(normalized)) return normalized;
            if (/^\d{3,4}$/.test(normalized)) return `${normalized}P`;
            if (["FHD", "HD", "SD"].includes(normalized)) return normalized;
          }
        }
        if (/2160p|4k|uhd/i.test(title)) return "4K";
        if (/1080p|fhd/i.test(title)) return "FHD";
        if (/720p|hd/i.test(title)) return "HD";
        return "SD";
      },
      naturalEpisodeSort(a, b) {
        var _a2, _b;
        const chunk = /(\d+)/g;
        const aa = a.name.split(chunk);
        const bb = b.name.split(chunk);
        for (let i = 0; i < Math.min(aa.length, bb.length); i++) {
          if (i % 2) {
            const d = Number(aa[i]) - Number(bb[i]);
            if (d) return d;
          } else {
            const d = aa[i].localeCompare(bb[i]);
            if (d) return d;
          }
        }
        return ((_a2 = a.__idx) != null ? _a2 : 0) - ((_b = b.__idx) != null ? _b : 0);
      },
      clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
      },
      normalizeProgress(p) {
        const n = Number(p);
        if (!isFinite(n) || n < 0) return 0;
        if (n <= 1) return Utils.clamp(n * 100, 0, 100);
        return Utils.clamp(n, 0, 100);
      },
      // Classify a TorBox torrent record into a UI phase:
      //  - 'ready'       : finished AND has files -> can start playback
      //  - 'finalizing'  : downloaded but not yet playable (TorBox is caching/
      //                    preparing files) -> show a "preparing" message, NOT a
      //                    stale download ETA/speed
      //  - 'downloading' : still downloading -> show progress + ETA
      downloadPhase(d) {
        if (!d || typeof d !== "object") return "downloading";
        const finished = d.download_state === "completed" || d.download_state === "uploading" || !!d.download_finished;
        const hasFiles = Array.isArray(d.files) && d.files.length > 0;
        if (finished && hasFiles) return "ready";
        const downloadDone = finished || Utils.normalizeProgress(d.progress) >= 100 || d.download_state === "cached";
        return downloadDone ? "finalizing" : "downloading";
      },
      sanitizeTokenList(value, { uppercase = false } = {}) {
        const items = String(Array.isArray(value) ? value.join(",") : value || "").split(",").map((item) => String(item || "").replace(/[\r\n]+/g, "").trim()).filter(Boolean).map((item) => uppercase ? item.toUpperCase() : item);
        return Array.from(new Set(items));
      },
      safeClassSelector(str = "") {
        return String(str || "").split(/\s+/).filter(Boolean).slice(0, 4).map((part) => part.replace(/[^\w-]/g, "")).filter(Boolean).map((part) => `.${part}`).join("");
      },
      // ─── BTIH helpers ─────────────────────────────────────────────────
      isHex40(s) {
        return typeof s === "string" && /^[a-fA-F0-9]{40}$/.test(s);
      },
      isBase32Btih(s) {
        return typeof s === "string" && /^[A-Z2-7]{32}$/.test(s);
      },
      base32ToHex(b32) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let bits = "";
        for (const c of b32) {
          const val = alphabet.indexOf(c);
          if (val < 0) throw new Error("Invalid base32 char");
          bits += val.toString(2).padStart(5, "0");
        }
        const out = [];
        for (let i = 0; i + 4 <= bits.length; i += 4) {
          out.push(parseInt(bits.slice(i, i + 4), 2).toString(16));
        }
        const hex = out.join("").toLowerCase();
        return hex.length >= 40 ? hex.slice(0, 40) : hex.padEnd(40, "0");
      },
      btihFromMagnetOrFields(obj) {
        const direct = obj.InfoHash || obj.infoHash || obj.Hash || obj.hash || null;
        const tryNormalize = (raw2) => {
          if (!raw2) return null;
          const s = String(raw2).trim();
          if (Utils.isHex40(s)) return s.toLowerCase();
          const upper = s.toUpperCase();
          if (Utils.isBase32Btih(upper)) return Utils.base32ToHex(upper);
          return null;
        };
        let normalized = tryNormalize(direct);
        if (normalized) return normalized;
        const magnet = obj.MagnetUri || obj.magnet || obj.magnetUri || "";
        if (!magnet || typeof magnet !== "string") return null;
        const q = magnet.split("?")[1] || "";
        const params = new URLSearchParams(q);
        const xt = (params.getAll("xt") || []).find((v) => /^urn:btih:/i.test(v)) || "";
        const raw = xt.replace(/^urn:btih:/i, "");
        let val;
        try {
          val = decodeURIComponent(raw);
        } catch (e) {
          val = raw;
        }
        normalized = tryNormalize(val);
        return normalized;
      }
    };
    const sanitizeExtensions = (value) => {
      const parts = String(Array.isArray(value) ? value.join(",") : value || "").split(/[,\s]+/).map((ext) => ext.replace(/[^a-z0-9]/gi, "").toLowerCase()).filter(Boolean);
      const unique = Array.from(new Set(parts));
      return unique.length ? unique : DEFAULT_VIDEO_EXTENSIONS.split(",");
    };
    const setVideoExtensions = (value) => {
      const sanitized = sanitizeExtensions(value);
      const serialized = sanitized.join(",");
      if (Store.get("torbox_video_extensions", "") !== serialized) {
        Store.set("torbox_video_extensions", serialized);
      }
      return sanitized;
    };
    const getVideoExtensions = () => setVideoExtensions(Store.get("torbox_video_extensions", DEFAULT_VIDEO_EXTENSIONS));
    const normalizeTrackRetries = (value) => {
      const num = Math.round(Number(value));
      return Utils.clamp(Number.isFinite(num) ? num : 24, CONST.TRACK_RETRIES_MIN, CONST.TRACK_RETRIES_MAX);
    };
    const setTrackRetries = (value) => {
      const safe = normalizeTrackRetries(value);
      Store.set("torbox_track_retries", String(safe));
      return safe;
    };
    const getTrackRetries = () => setTrackRetries(Store.get("torbox_track_retries", "24"));
    const normalizeTrackInterval = (value) => {
      const num = Math.round(Number(value));
      return Utils.clamp(
        Number.isFinite(num) ? num : CONST.TRACKING_POLL_INTERVAL_MS,
        CONST.TRACK_INTERVAL_MIN_MS,
        CONST.TRACK_INTERVAL_MAX_MS
      );
    };
    const setTrackIntervalMs = (value) => {
      const safe = normalizeTrackInterval(value);
      Store.set("torbox_track_interval_ms", String(safe));
      return safe;
    };
    const getTrackIntervalMs = () => setTrackIntervalMs(Store.get("torbox_track_interval_ms", CONST.TRACKING_POLL_INTERVAL_MS));
    const setStoredBool = (key, value) => {
      const bool = parseBoolean(value, false);
      Store.set(key, bool ? "1" : "0");
      return bool;
    };
    const getStoredBool = (key, fallback = false) => parseBoolean(Store.get(key, fallback ? "1" : "0"), fallback);
    const setDefaultCachedOnly = (value) => setStoredBool("torbox_default_cached_only", value);
    const getDefaultCachedOnly = () => getStoredBool("torbox_default_cached_only", false);
    const setPreferPermanentLink = (value) => setStoredBool("torbox_requestdl_permanent", value);
    const getPreferPermanentLink = () => getStoredBool("torbox_requestdl_permanent", false);
    const ParserHealth = /* @__PURE__ */ (() => {
      const STORAGE_KEY = "torbox_parser_health_v1";
      let cache = null;
      const load = () => {
        if (cache) return cache;
        try {
          const parsed = JSON.parse(Store.get(STORAGE_KEY, "{}"));
          cache = parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
          cache = {};
        }
        return cache;
      };
      const save = () => {
        try {
          Store.set(STORAGE_KEY, JSON.stringify(load()));
        } catch (e) {
        }
      };
      const normalizeDomain = (domain) => String(domain || "").trim().toLowerCase();
      const getEntry = (domain) => {
        const key = normalizeDomain(domain);
        if (!key) return {};
        const entry = load()[key];
        return entry && typeof entry === "object" ? entry : {};
      };
      const updateEntry = (domain, patch) => {
        const key = normalizeDomain(domain);
        if (!key) return {};
        const next = Object.assign({}, getEntry(key), patch || {});
        load()[key] = next;
        save();
        return next;
      };
      const getCooldownUntil = (domain) => {
        const raw = Number(getEntry(domain).cooldownUntil) || 0;
        if (raw > Date.now()) return raw;
        if (raw) updateEntry(domain, { cooldownUntil: 0 });
        return 0;
      };
      return {
        getCooldownUntil,
        isCoolingDown(domain) {
          return getCooldownUntil(domain) > Date.now();
        },
        markFailure(domain, kind) {
          const now = Date.now();
          return updateEntry(domain, {
            lastFailureAt: now,
            lastFailureKind: String(kind || "failure"),
            cooldownUntil: now + CONST.PARSER_COOLDOWN_MS
          });
        },
        markSuccess(domain) {
          return updateEntry(domain, {
            lastSuccessAt: Date.now(),
            cooldownUntil: 0
          });
        }
      };
    })();
    const setDebugOverlayEnabled = (value) => setStoredBool("torbox_debug_overlay", value);
    const getDebugOverlayEnabled = () => getStoredBool("torbox_debug_overlay", false);
    const setAutoPickMovieFile = (value) => setStoredBool("torbox_auto_pick_movie_file", value);
    const getAutoPickMovieFile = () => getStoredBool("torbox_auto_pick_movie_file", true);
    const normalizeQualityOrder = (value) => {
      const allowed = ["4K", "FHD", "HD", "SD"];
      const items = Utils.sanitizeTokenList(value, { uppercase: true }).filter((item) => allowed.includes(item));
      return items.length ? items : allowed;
    };
    const setQualityOrder = (value) => {
      const order = normalizeQualityOrder(value);
      Store.set("torbox_pref_quality_order", order.join(","));
      return order;
    };
    const getQualityOrder = () => setQualityOrder(Store.get("torbox_pref_quality_order", "4K,FHD,HD,SD"));
    const setPreferredAudioLangs = (value) => {
      const langs = Utils.sanitizeTokenList(value, { uppercase: true });
      Store.set("torbox_pref_audio_langs", langs.join(","));
      return langs;
    };
    const getPreferredAudioLangs = () => setPreferredAudioLangs(Store.get("torbox_pref_audio_langs", ""));
    const setPreferredVideoCodecs = (value) => {
      const codecs = Utils.sanitizeTokenList(value, { uppercase: true });
      Store.set("torbox_pref_video_codecs", codecs.join(","));
      return codecs;
    };
    const getPreferredVideoCodecs = () => setPreferredVideoCodecs(Store.get("torbox_pref_video_codecs", ""));
    const setExcludedTrackers = (value) => {
      const trackers = Utils.sanitizeTokenList(value, { uppercase: false });
      Store.set("torbox_excluded_trackers", trackers.join(","));
      return trackers;
    };
    const getExcludedTrackers = () => setExcludedTrackers(Store.get("torbox_excluded_trackers", ""));
    const isCachedFlagTrue = (flag) => {
      if (flag === true || flag === "true") return true;
      if (flag === false || flag === "false") return false;
      if (typeof flag === "number") return flag > 0;
      if (typeof flag === "string") {
        const norm = flag.toLowerCase();
        if (["1", "true", "cached", "ready", "available", "complete", "completed"].includes(norm)) return true;
        if (["0", "false", "missing", "not_cached"].includes(norm)) return false;
      }
      if (flag && typeof flag === "object") {
        if ("cached" in flag) return isCachedFlagTrue(flag.cached);
        if ("ready" in flag) return isCachedFlagTrue(flag.ready);
        if ("status" in flag) return isCachedFlagTrue(flag.status);
        if ("available" in flag) return isCachedFlagTrue(flag.available);
        return Object.values(flag).some(isCachedFlagTrue);
      }
      return false;
    };
    const Cache = /* @__PURE__ */ (() => {
      const map = /* @__PURE__ */ new Map();
      return {
        get(k) {
          if (!map.has(k)) return null;
          const entry = map.get(k);
          if (Date.now() - entry.ts > CONST.CACHE_TTL_MS) {
            map.delete(k);
            return null;
          }
          map.delete(k);
          map.set(k, entry);
          return entry.val;
        },
        set(k, v) {
          if (map.has(k)) map.delete(k);
          map.set(k, { ts: Date.now(), val: v });
          if (map.size > CONST.CACHE_LIMIT) {
            const oldestKey = map.keys().next().value;
            map.delete(oldestKey);
          }
        },
        clear() {
          map.clear();
        }
      };
    })();
    const Api = /* @__PURE__ */ (() => {
      const TB_MAIN = "https://api.torbox.app/v1/api";
      function requireProxy() {
        if (!Config.proxyUrl || !String(Config.proxyUrl).trim()) {
          const err = { type: "validation", message: translate("torbox_error_cors_missing") };
          throw err;
        }
      }
      function requireApiKey() {
        if (!Config.apiKey) {
          const err = { type: "validation", message: translate("torbox_error_api_key_missing") };
          throw err;
        }
      }
      function parseJsonSafe(text) {
        try {
          return typeof text === "string" ? JSON.parse(text) : text;
        } catch (e) {
          return null;
        }
      }
      function extractApiDetail(json, text) {
        var _a2, _b;
        const direct = (json == null ? void 0 : json.detail) || (json == null ? void 0 : json.message) || (json == null ? void 0 : json.error) || ((_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.detail) || ((_b = json == null ? void 0 : json.data) == null ? void 0 : _b.message) || "";
        const normalized = String(direct || "").replace(/\s+/g, " ").trim();
        if (normalized) return Utils.escapeHtml(normalized);
        const plain = String(text || "").trim();
        if (plain && plain.length <= 180 && !/^</.test(plain)) return Utils.escapeHtml(plain);
        return "";
      }
      function buildProxyUrl(base, target) {
        const raw = String(base || "").trim();
        if (!raw) return raw;
        try {
          const proxyUrl = new URL(raw);
          proxyUrl.searchParams.set("url", target);
          return proxyUrl.toString();
        } catch (_) {
          if (raw.includes("{url}")) {
            return raw.replace("{url}", encodeURIComponent(target));
          }
          if (raw.includes("%s")) {
            return raw.replace("%s", encodeURIComponent(target));
          }
          const hasQuery = raw.includes("?");
          const endsWithJoin = /[?&]$/.test(raw);
          if (/[?&]url=/.test(raw)) {
            return raw.replace(/([?&]url=)[^&#]*/i, (_2, prefix) => `${prefix}${encodeURIComponent(target)}`);
          }
          const joiner = hasQuery ? endsWithJoin ? "" : "&" : "?";
          return `${raw}${joiner}url=${encodeURIComponent(target)}`;
        }
      }
      function request(_0) {
        return __async(this, arguments, function* (url, opt = {}, outerSignal) {
          requireProxy();
          const _a2 = opt, { timeoutMs: optTimeoutMs, is_torbox_api: isTorBoxApiFlag } = _a2, fetchOptions = __objRest(_a2, ["timeoutMs", "is_torbox_api"]);
          const isTorBox = isTorBoxApiFlag !== false;
          if (isTorBox) requireApiKey();
          const controller = new AbortController();
          const timeoutMs = Math.max(1, Number(optTimeoutMs) || CONST.TORBOX_API_TIMEOUT_MS);
          const t = setTimeout(() => controller.abort(), timeoutMs);
          const onOuterAbort = () => controller.abort();
          if (outerSignal) outerSignal.addEventListener("abort", onOuterAbort, { once: true });
          const headers = Object.assign({}, fetchOptions.headers || {});
          delete headers.Authorization;
          if (isTorBox) headers["X-Api-Key"] = Config.apiKey;
          const proxied = buildProxyUrl(Config.proxyUrl, url);
          try {
            const res = yield fetch(proxied, __spreadProps(__spreadValues({}, fetchOptions), { headers, signal: controller.signal }));
            const status = res.status;
            const text = yield res.text();
            const json = parseJsonSafe(text);
            const detail = extractApiDetail(json, text);
            const withDetail = (base) => detail ? `${base}: ${detail}` : base;
            if (status === 401) throw { type: "auth", status, message: withDetail(translate("torbox_error_401")) };
            if (status === 403) throw { type: "auth", status, message: withDetail(translate("torbox_error_403")) };
            if (status === 404) throw { type: "api", status, message: withDetail(translate("torbox_error_404")) };
            if (status === 429) throw { type: "network", status, message: withDetail(translate("torbox_error_429")) };
            if (status >= 500) throw { type: "network", status, message: withDetail(translateWithParams("torbox_error_server", { status })) };
            if (status >= 400) throw { type: "network", status, message: withDetail(translateWithParams("torbox_error_request", { status })) };
            if (text.startsWith("http")) return { success: true, url: text };
            if (!json) throw { type: "api", message: translate("torbox_error_bad_json") };
            if (json.success === false) {
              const apiDetail = Utils.escapeHtml(String(json.detail || json.message || ""));
              throw { type: "api", message: apiDetail || translate("torbox_error_api") };
            }
            return json;
          } catch (e) {
            if (e.name === "AbortError") {
              if (!outerSignal || !outerSignal.aborted) {
                throw {
                  type: "network",
                  message: translateWithParams("torbox_error_timeout", {
                    seconds: timeoutMs / 1e3
                  }),
                  timeoutMs
                };
              }
              throw e;
            }
            if (e.type) throw e;
            throw { type: "network", message: e && e.message ? e.message : translate("torbox_error_network") };
          } finally {
            clearTimeout(t);
            if (outerSignal) outerSignal.removeEventListener("abort", onOuterAbort);
          }
        });
      }
      function normalizeParserResults(rawResults = []) {
        const items = Array.isArray(rawResults) ? rawResults : [];
        const entriesByHash = /* @__PURE__ */ new Map();
        let invalidCount = 0;
        items.forEach((item) => {
          const hash = Utils.btihFromMagnetOrFields(item);
          if (!hash) {
            invalidCount += 1;
            return;
          }
          if (!entriesByHash.has(hash)) entriesByHash.set(hash, item);
        });
        return {
          rawCount: items.length,
          validCount: entriesByHash.size,
          invalidCount,
          entriesByHash
        };
      }
      function classifyParserFailure(err = {}) {
        const statusCode = Number(err == null ? void 0 : err.status) || 0;
        const message = String((err == null ? void 0 : err.message) || "");
        const lower = message.toLowerCase();
        if (Number(err == null ? void 0 : err.timeoutMs) > 0 || /timeout|timed out|time out/i.test(message)) {
          return { status: "timeout", cooldown: true, reason: message || "timeout", statusCode };
        }
        if (statusCode >= 500) {
          return { status: "http_error", cooldown: true, reason: `http_${statusCode}`, statusCode };
        }
        if (statusCode >= 400) {
          return { status: "http_error", cooldown: false, reason: `http_${statusCode}`, statusCode };
        }
        if (/err_connection_closed|ssl|tls|handshake|fetch failed|network|econnreset|connection closed|connection reset/.test(lower)) {
          return { status: "network", cooldown: true, reason: message || "network", statusCode };
        }
        return { status: "network", cooldown: true, reason: message || "network", statusCode };
      }
      function searchPublicTrackers(movie, signal) {
        return __async(this, null, function* () {
          const searchTitle = (movie.title || movie.name || "").trim();
          const searchOriginal = (movie.original_title || movie.original_name || "").trim();
          const yearRaw = (movie.year || movie.release_date || movie.first_air_date || "").toString();
          const searchYear = yearRaw ? yearRaw.slice(0, 4) : "";
          const queryBase = `${searchTitle} ${searchYear}`.trim();
          const qsCommon = {
            Query: queryBase,
            title: searchTitle,
            title_original: searchOriginal,
            Category: "2000,5000"
            // Movies + TV
          };
          const customStr = Store.get("torbox_custom_parsers", "").trim();
          const customParsers = customStr.split(",").map((s) => s.trim()).filter((s) => s && s.length > 3).map((entry, i) => {
            try {
              const u = new URL(/^https?:\/\//i.test(entry) ? entry : `https://${entry}`);
              const host = `${u.host}${u.pathname.replace(/\/+$/, "")}`;
              return host ? { name: `Custom ${i + 1}`, url: host, key: "" } : null;
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
          const parsers = [...customParsers, ...PUBLIC_PARSERS];
          const parserAttempts = [];
          let selectedParser = null;
          const setParserTelemetry = (attempts, parserMeta) => {
            DebugTelemetry.parserAttempts = attempts.slice(-20);
            DebugTelemetry.selectedParser = parserMeta ? {
              name: parserMeta.name,
              domain: parserMeta.domain,
              valid_count: parserMeta.valid_count,
              raw_count: parserMeta.raw_count
            } : null;
          };
          const activeParsers = parsers.filter((parser) => !ParserHealth.isCoolingDown(parser.url));
          const useCooldownAwarePass = activeParsers.length > 0;
          const passParsers = useCooldownAwarePass ? activeParsers : parsers;
          if (useCooldownAwarePass) {
            parsers.filter((parser) => ParserHealth.isCoolingDown(parser.url)).forEach((parser) => {
              const cooldownUntil = ParserHealth.getCooldownUntil(parser.url);
              parserAttempts.push({
                name: parser.name,
                domain: parser.url,
                elapsed_ms: 0,
                status: "cooldown_skip",
                raw_count: 0,
                valid_count: 0,
                invalid_count: 0,
                cooldown_until: cooldownUntil ? new Date(cooldownUntil).toISOString() : null,
                reason: "cooldown_active"
              });
            });
          }
          for (const p of passParsers) {
            if (signal.aborted) break;
            const qs = new URLSearchParams(qsCommon);
            if (p.key) qs.set("apikey", p.key);
            if (searchYear) qs.set("year", searchYear);
            const url = `https://${p.url}/api/v2.0/indexers/all/results?${qs.toString()}`;
            const startedAt = Date.now();
            try {
              LOG("Parser try:", p.name, url);
              const json = yield request(
                url,
                { method: "GET", is_torbox_api: false, timeoutMs: CONST.PUBLIC_PARSER_TIMEOUT_MS },
                signal
              );
              const list = Array.isArray(json == null ? void 0 : json.Results) ? json.Results : [];
              const normalized = normalizeParserResults(list);
              const attempt = {
                name: p.name,
                domain: p.url,
                elapsed_ms: Date.now() - startedAt,
                status: normalized.validCount > 0 ? "success" : normalized.rawCount > 0 ? "invalid_payload" : "empty",
                raw_count: normalized.rawCount,
                valid_count: normalized.validCount,
                invalid_count: normalized.invalidCount,
                cooldown_until: null,
                reason: normalized.validCount > 0 ? "valid_hashes" : normalized.rawCount > 0 ? "no_valid_hashes" : "no_results"
              };
              parserAttempts.push(attempt);
              LOG("Parser result:", p.name, {
                raw: normalized.rawCount,
                valid: normalized.validCount,
                invalid: normalized.invalidCount,
                status: attempt.status
              });
              if (normalized.validCount > 0) {
                ParserHealth.markSuccess(p.url);
                selectedParser = {
                  name: p.name,
                  domain: p.url,
                  valid_count: normalized.validCount,
                  raw_count: normalized.rawCount
                };
                setParserTelemetry(parserAttempts, selectedParser);
                return {
                  parser: selectedParser,
                  entriesByHash: normalized.entriesByHash,
                  diagnostics: parserAttempts.slice()
                };
              }
              if (attempt.status === "invalid_payload") {
                const health = ParserHealth.markFailure(p.url, attempt.status);
                attempt.cooldown_until = (health == null ? void 0 : health.cooldownUntil) ? new Date(health.cooldownUntil).toISOString() : null;
              }
            } catch (e) {
              const failure = classifyParserFailure(e);
              const attempt = {
                name: p.name,
                domain: p.url,
                elapsed_ms: Date.now() - startedAt,
                status: failure.status,
                raw_count: 0,
                valid_count: 0,
                invalid_count: 0,
                cooldown_until: null,
                reason: failure.reason,
                status_code: failure.statusCode || null
              };
              if (failure.cooldown) {
                const health = ParserHealth.markFailure(p.url, failure.status);
                attempt.cooldown_until = (health == null ? void 0 : health.cooldownUntil) ? new Date(health.cooldownUntil).toISOString() : null;
              }
              parserAttempts.push(attempt);
              LOG("Parser failed:", p.name, e.message || e);
            } finally {
              setParserTelemetry(parserAttempts, selectedParser);
            }
          }
          const hadInvalidPayload = parserAttempts.some((attempt) => attempt.status === "invalid_payload");
          setParserTelemetry(parserAttempts, selectedParser);
          throw hadInvalidPayload ? { type: "api", message: translate("torbox_error_public_parsers_invalid") } : { type: "api", message: translate("torbox_error_public_parsers_empty") };
        });
      }
      function checkCached(hashes, signal) {
        return __async(this, null, function* () {
          if (!Array.isArray(hashes) || !hashes.length) return {};
          const acc = {};
          for (let i = 0; i < hashes.length; i += 100) {
            if (signal == null ? void 0 : signal.aborted) break;
            const chunk = hashes.slice(i, i + 100);
            const qs = new URLSearchParams();
            chunk.forEach((h) => qs.append("hash", h));
            qs.set("format", "object");
            qs.set("list_files", "false");
            try {
              const r = yield request(
                `${TB_MAIN}/torrents/checkcached?${qs.toString()}`,
                { method: "GET", timeoutMs: CONST.TORBOX_API_TIMEOUT_MS },
                signal
              );
              if (r == null ? void 0 : r.data) Object.assign(acc, r.data);
            } catch (e) {
              LOG("checkCached error:", e.message || e);
            }
          }
          return acc;
        });
      }
      function addMagnet(magnet, signal) {
        const fd = new FormData();
        fd.append("magnet", magnet);
        fd.append("seed", "3");
        return request(
          `${TB_MAIN}/torrents/createtorrent`,
          { method: "POST", body: fd, timeoutMs: CONST.TORBOX_API_TIMEOUT_MS },
          signal
        );
      }
      function myList(id, signal) {
        return __async(this, null, function* () {
          const json = yield request(
            `${TB_MAIN}/torrents/mylist?id=${encodeURIComponent(id)}&bypass_cache=true`,
            { method: "GET", timeoutMs: CONST.TORBOX_API_TIMEOUT_MS },
            signal
          );
          if (json && json.data && !Array.isArray(json.data)) json.data = [json.data];
          return json;
        });
      }
      function requestDl(tid, fid, signal) {
        return __async(this, null, function* () {
          const base = `${TB_MAIN}/torrents/requestdl?torrent_id=${encodeURIComponent(tid)}&file_id=${encodeURIComponent(fid)}&token=${encodeURIComponent(Config.apiKey)}`;
          if (!getPreferPermanentLink()) {
            return request(base, { method: "GET", timeoutMs: CONST.TORBOX_API_TIMEOUT_MS }, signal);
          }
          try {
            const preferred = yield request(
              `${base}&redirect=true`,
              { method: "GET", timeoutMs: CONST.TORBOX_API_TIMEOUT_MS },
              signal
            );
            const preferredUrl = (preferred == null ? void 0 : preferred.url) || (preferred == null ? void 0 : preferred.data);
            if (typeof preferredUrl === "string" && /^https?:\/\//i.test(preferredUrl)) return preferred;
          } catch (e) {
            LOG("Permanent requestdl failed, fallback to classic", (e == null ? void 0 : e.message) || e);
          }
          return request(base, { method: "GET", timeoutMs: CONST.TORBOX_API_TIMEOUT_MS }, signal);
        });
      }
      return { searchPublicTrackers, checkCached, addMagnet, myList, requestDl };
    })();
    const ErrorHandler = {
      show(kind, err) {
        const t = kind || (err == null ? void 0 : err.type) || "error";
        const msg = (err == null ? void 0 : err.message) || translate("torbox_error_unknown");
        DebugTelemetry.lastError = {
          ts: (/* @__PURE__ */ new Date()).toISOString(),
          type: t,
          message: String(msg)
        };
        const prefix = t === "auth" ? translate("torbox_error_prefix_auth") : t === "validation" ? translate("torbox_error_prefix_validation") : t === "network" ? translate("torbox_error_prefix_network") : t === "api" ? translate("torbox_error_prefix_api") : translate("torbox_error_prefix_generic");
        try {
          Lampa.Noty.show(`${prefix}: ${msg}`, { type: "error" });
        } catch (e) {
          console.error("[TorBox]", prefix + ": " + msg);
        }
        LOG("ERR", t, err);
      }
    };
    function generateSearchCombinations(movie = {}) {
      var _a2;
      const combosMap = /* @__PURE__ */ new Map();
      const addCombo = (query, tags = [], label) => {
        const normalized = String(query || "").replace(/\s+/g, " ").trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        const tagSet = new Set(tags.filter(Boolean));
        if (combosMap.has(key)) {
          const existing = combosMap.get(key);
          tagSet.forEach((tag) => existing.tags.add(tag));
          if (label && label.length < existing.label.length) existing.label = label;
          return;
        }
        combosMap.set(key, {
          query: normalized,
          label: label || normalized,
          tags: tagSet
        });
      };
      const nameMap = /* @__PURE__ */ new Map();
      const registerName = (value, tags = []) => {
        const normalized = String(value || "").replace(/\s+/g, " ").trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (!nameMap.has(key)) {
          nameMap.set(key, { value: normalized, tags: new Set(tags) });
        } else {
          const existing = nameMap.get(key);
          tags.forEach((tag) => existing.tags.add(tag));
        }
      };
      const title = (movie.title || movie.name || "").trim();
      const orig = (movie.original_title || movie.original_name || "").trim();
      const localizedTranslations = Array.isArray(movie.translations) ? movie.translations.map((t) => t && t.data ? t.data.title : (t == null ? void 0 : t.title) || (t == null ? void 0 : t.name) || "").filter(Boolean) : [];
      if (title) registerName(title, ["base"]);
      if (orig && orig.toLowerCase() !== title.toLowerCase()) registerName(orig, ["original"]);
      localizedTranslations.forEach((name) => registerName(name, ["translation"]));
      const pushDynamicName = (value) => {
        if (!value) return;
        if (typeof value === "string") registerName(value, ["alt"]);
        else if (Array.isArray(value)) value.forEach((item) => pushDynamicName(item));
        else if (value && typeof value === "object") {
          if (value.title) pushDynamicName(value.title);
          if (value.name) pushDynamicName(value.name);
          if (value.value) pushDynamicName(value.value);
        }
      };
      Object.keys(movie).forEach((key) => {
        if (!/title|name/i.test(key)) return;
        if (["title", "name", "original_title", "original_name"].includes(key)) return;
        pushDynamicName(movie[key]);
      });
      if (Array.isArray((_a2 = movie == null ? void 0 : movie.alternative_titles) == null ? void 0 : _a2.titles)) {
        movie.alternative_titles.titles.forEach((entry) => pushDynamicName(entry == null ? void 0 : entry.title));
      }
      const names = Array.from(nameMap.values()).map((entry) => ({
        value: entry.value,
        tags: Array.from(entry.tags)
      }));
      const yearRaw = (movie.release_date || movie.first_air_date || movie.year || "").toString();
      const year = yearRaw ? yearRaw.slice(0, 4) : "";
      const season = movie.season_number || movie.season || null;
      const episode = movie.episode_number || movie.episode || null;
      const keywords = [movie.keywords, movie.tags].flat().filter(Boolean).reduce((acc, item) => {
        if (typeof item === "string") acc.push(item);
        if (item && typeof item === "object") {
          if (item.name) acc.push(item.name);
          if (item.title) acc.push(item.title);
        }
        return acc;
      }, []);
      names.forEach((entry) => {
        addCombo(entry.value, entry.tags);
        if (year) addCombo(`${entry.value} ${year}`, [...entry.tags, "year"]);
        if (season) {
          const sNum = String(season).padStart(2, "0");
          addCombo(`${entry.value} S${sNum}`, [...entry.tags, "season"]);
          addCombo(`${entry.value} season ${season}`, [...entry.tags, "season"]);
          if (episode) {
            const eNum = String(episode).padStart(2, "0");
            addCombo(`${entry.value} S${sNum}E${eNum}`, [...entry.tags, "season", "episode"]);
            addCombo(`${entry.value} ${season} \u0441\u0435\u0437\u043E\u043D ${episode} \u0441\u0435\u0440\u0438\u044F`, [...entry.tags, "season", "episode"]);
          }
        }
      });
      if (title && orig && title.toLowerCase() !== orig.toLowerCase()) {
        addCombo(`${title} ${orig}`, ["mix"]);
        if (year) addCombo(`${title} ${orig} ${year}`, ["mix", "year"]);
      }
      const primaryNames = names.filter((entry) => entry.tags.includes("base") || entry.tags.includes("original") || entry.tags.includes("translation")).slice(0, 3);
      keywords.slice(0, 10).forEach((kw) => {
        primaryNames.forEach((entry) => {
          addCombo(`${entry.value} ${kw}`, [...entry.tags, "keyword"]);
          if (year) addCombo(`${entry.value} ${kw} ${year}`, [...entry.tags, "keyword", "year"]);
        });
      });
      if (movie.imdb_id) addCombo(movie.imdb_id, ["id"]);
      if (movie.tmdb_id || movie.id) addCombo(`tmdb:${movie.tmdb_id || movie.id}`, ["id"]);
      const limit = 40;
      const result = Array.from(combosMap.values()).map((entry) => ({
        query: entry.query,
        label: entry.label,
        tags: Array.from(entry.tags).filter((tag, idx, arr) => tag !== "base" && arr.indexOf(tag) === idx)
      })).filter((entry) => entry.query.length).slice(0, limit);
      if (Config.debug) LOG("Search combinations", result);
      return result;
    }
    function MainComponent(object) {
      let scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
      let files = new Lampa.Explorer(object);
      let filter = new Lampa.Filter(object);
      let abort = new AbortController();
      let initialized = false;
      let lastFocused = null;
      let cachedToggleBtn = null;
      let activeTorrentController = null;
      let pendingPlayback = null;
      this.activity = object.activity;
      window.__torbox_active_component = this;
      const sortVariants = [
        { key: "seeders", labelKey: "torbox_sort_seeders_desc", field: "last_known_seeders", reverse: true },
        { key: "size_desc", labelKey: "torbox_sort_size_desc", field: "size", reverse: true },
        { key: "size_asc", labelKey: "torbox_sort_size_asc", field: "size", reverse: false },
        { key: "age", labelKey: "torbox_sort_age", field: "publish_timestamp", reverse: true }
      ];
      const defaultFilters = {
        quality: "all",
        tracker: "all",
        video_type: "all",
        translation: "all",
        lang: "all",
        video_codec: "all",
        audio_codec: "all"
      };
      const loadFilters = () => {
        try {
          return JSON.parse(Store.get("torbox_filters_v2", JSON.stringify(defaultFilters)));
        } catch (e) {
          Store.set("torbox_filters_v2", JSON.stringify(defaultFilters));
          return __spreadValues({}, defaultFilters);
        }
      };
      const loadCachedOnly = () => {
        const stored = Store.get("torbox_show_only_cached", null);
        if (stored === null || stored === "") return getDefaultCachedOnly();
        return parseBoolean(stored, false);
      };
      const state = {
        all_torrents: [],
        sort: Store.get("torbox_sort_method", "seeders"),
        filters: loadFilters(),
        last_hash: null,
        view: "torrents",
        // 'torrents' | 'episodes'
        current_torrent_data: null,
        search_query: null,
        show_only_cached: loadCachedOnly()
      };
      const readPreferenceState = () => ({
        qualityOrder: getQualityOrder(),
        audioLangs: getPreferredAudioLangs(),
        videoCodecs: getPreferredVideoCodecs(),
        excludedTrackers: getExcludedTrackers()
      });
      const isTrackerExcluded = (torrentTrackers, excludedSet) => {
        if (!excludedSet || !excludedSet.size) return false;
        return (Array.isArray(torrentTrackers) ? torrentTrackers : []).some(
          (tracker) => excludedSet.has(String(tracker || "").toLowerCase())
        );
      };
      const rawTorrentByHash = /* @__PURE__ */ new Map();
      let debugOverlayEl = null;
      const storeRawTorrent = (hash, raw) => {
        if (!hash || !raw) return;
        rawTorrentByHash.delete(hash);
        rawTorrentByHash.set(hash, raw);
        if (rawTorrentByHash.size > CONST.RAW_CACHE_HASH_LIMIT) {
          const oldest = rawTorrentByHash.keys().next().value;
          rawTorrentByHash.delete(oldest);
        }
      };
      const getRawTorrentByHash = (hash) => hash ? rawTorrentByHash.get(hash) || null : null;
      const FocusZones = Object.freeze({
        CONTINUE: "continue",
        LIST: "list",
        FILTER: "filter",
        FILE: "file",
        FILE_DOWNLOAD: "file_download",
        EMPTY: "empty"
      });
      const focusState = {
        zone: null,
        index: 0
      };
      const describeElementForDebug = (element) => {
        if (!element || !element.length) return "-";
        const classes = Utils.safeClassSelector(element.attr("class") || "") || element.prop("tagName") || "-";
        const hash = element.attr("data-hash") || "";
        return hash ? `${classes}[data-hash="${hash}"]` : classes;
      };
      const ensureDebugOverlay = () => {
        const shouldShow = Config.debug && getDebugOverlayEnabled();
        if (!shouldShow) {
          if (debugOverlayEl) {
            debugOverlayEl.remove();
            debugOverlayEl = null;
          }
          return;
        }
        if (debugOverlayEl && debugOverlayEl.length) return;
        debugOverlayEl = $('<div class="torbox-debug-overlay" aria-live="polite"></div>');
        debugOverlayEl.css({
          position: "fixed",
          right: "1em",
          bottom: "1em",
          zIndex: 99999,
          maxWidth: "36em",
          padding: ".7em .9em",
          borderRadius: ".6em",
          background: "rgba(0,0,0,.78)",
          color: "#fff",
          fontSize: ".85em",
          lineHeight: "1.35",
          pointerEvents: "none",
          whiteSpace: "pre-line"
        });
        $("body").append(debugOverlayEl);
      };
      const updateDebugOverlay = (element) => {
        var _a2;
        ensureDebugOverlay();
        if (!debugOverlayEl || !debugOverlayEl.length) return;
        const lines = [
          `TorBox ${VERSION}`,
          `view: ${state.view}`,
          `zone/index: ${focusState.zone || "-"} / ${focusState.index}`,
          `element: ${describeElementForDebug(element)}`
        ];
        if ((_a2 = DebugTelemetry.selectedParser) == null ? void 0 : _a2.name) {
          lines.push(`parser: ${DebugTelemetry.selectedParser.name} (${DebugTelemetry.selectedParser.valid_count || 0})`);
        }
        debugOverlayEl.text(lines.join("\n"));
      };
      const buildDiagnosticsReport = () => ({
        generated_at: (/* @__PURE__ */ new Date()).toISOString(),
        version: VERSION,
        settings: {
          proxy_url: Config.proxyUrl || "",
          debug: !!Config.debug,
          debug_overlay: getDebugOverlayEnabled(),
          prefer_permanent_link: getPreferPermanentLink(),
          default_cached_only: getDefaultCachedOnly(),
          auto_pick_movie_file: getAutoPickMovieFile(),
          quality_order: getQualityOrder(),
          preferred_audio_langs: getPreferredAudioLangs(),
          preferred_video_codecs: getPreferredVideoCodecs(),
          excluded_trackers: getExcludedTrackers(),
          video_extensions: getVideoExtensions()
        },
        state: {
          view: state.view,
          sort: state.sort,
          show_only_cached: state.show_only_cached,
          focus_zone: focusState.zone,
          focus_index: focusState.index,
          items_total: state.all_torrents.length
        },
        last_error: DebugTelemetry.lastError,
        selected_parser: DebugTelemetry.selectedParser,
        parser_attempts: DebugTelemetry.parserAttempts.slice(-20),
        logs_tail: DebugTelemetry.logs.slice(-50)
      });
      const isTorrentsView = () => state.view === "torrents";
      const getFilterFocusItems = () => {
        if (!filter || typeof filter.render !== "function") return $();
        const container = filter.render();
        let items = container.find(
          ".torbox-cached-toggle.selector, .filter--search.selector, .filter--sort.selector, .filter--filter.selector"
        );
        if (!items || !items.length) {
          items = container.find(".filter__item.selector, .selector");
        }
        items = items.not(".filter--back");
        return items;
      };
      const getFocusCollection = (zone) => {
        if (!scroll || typeof scroll.render !== "function") return $();
        const root = scroll.render();
        switch (zone) {
          case FocusZones.CONTINUE:
            return root.find(".torbox-watched-item.selector");
          case FocusZones.LIST:
            return root.find(".torbox-item.selector");
          case FocusZones.EMPTY:
            return root.find(".empty.selector");
          case FocusZones.FILTER:
            return getFilterFocusItems();
          case FocusZones.FILE:
            return root.find(".torbox-file-item.selector");
          case FocusZones.FILE_DOWNLOAD:
            return root.find(".torbox-file-download.selector");
          default:
            return $();
        }
      };
      const detectZone = (element) => {
        if (!element || !element.length) return null;
        if (element.hasClass("torbox-item")) return FocusZones.LIST;
        if (element.hasClass("torbox-watched-item")) return FocusZones.CONTINUE;
        if (element.hasClass("torbox-cached-toggle") || element.hasClass("filter__item") || element.hasClass("filter--search") || element.hasClass("filter--sort") || element.hasClass("filter--filter") || element.hasClass("filter--back") || element.hasClass("simple-button--filter")) {
          return FocusZones.FILTER;
        }
        if (element.hasClass("torbox-file-download")) return FocusZones.FILE_DOWNLOAD;
        if (element.hasClass("torbox-file-item")) return FocusZones.FILE;
        if (element.hasClass("empty")) return FocusZones.EMPTY;
        return null;
      };
      const updateFocusMetaFromElement = (element) => {
        if (!element || !element.length) return;
        const zone = element.data("torboxZone") || detectZone(element);
        const index = Number(element.data("torboxIndex")) || 0;
        focusState.zone = zone;
        focusState.index = index;
        lastFocused = element[0];
        if (zone === FocusZones.LIST) {
          const hashAttr = element.attr("data-hash");
          if (hashAttr) state.last_hash = hashAttr;
        }
        updateDebugOverlay(element);
      };
      const focusElement = (element) => {
        if (!element || !element.length) return false;
        updateFocusMetaFromElement(element);
        if (scroll && typeof scroll.render === "function") {
          const focusContainer = focusState.zone === FocusZones.FILTER && filter && typeof filter.render === "function" ? filter.render() : scroll.render();
          Lampa.Controller.collectionFocus(element[0], focusContainer);
          if (focusState.zone !== FocusZones.FILTER && typeof scroll.update === "function") {
            scroll.update(element, true);
          }
        }
        return true;
      };
      const focusZone = (zone, index = 0) => {
        const collection = getFocusCollection(zone);
        if (!collection || !collection.length) return false;
        const clamped = Math.min(Math.max(index, 0), collection.length - 1);
        const target = collection.eq(clamped);
        return focusElement(target);
      };
      const focusListByIndex = (index = 0) => focusZone(FocusZones.LIST, index);
      const focusContinueItem = () => focusZone(FocusZones.CONTINUE, 0);
      const focusFilterItem = (index = 0) => focusZone(FocusZones.FILTER, index);
      const focusEmptyMessage = () => focusZone(FocusZones.EMPTY, 0);
      const focusFileItem = (index = 0) => focusZone(FocusZones.FILE, index);
      const focusFileDownload = (index = 0) => focusZone(FocusZones.FILE_DOWNLOAD, index);
      const focusFirstListItem = () => {
        if (!scroll || typeof scroll.render !== "function") return;
        if (!isTorrentsView()) return;
        if (!focusListByIndex(0)) focusEmptyMessage();
      };
      const focusLastKnownListItem = () => {
        if (!scroll || typeof scroll.render !== "function") return false;
        if (state.last_hash) {
          const saved = scroll.render().find(`[data-hash="${state.last_hash}"]`).first();
          if (saved.length) return focusElement(saved);
        }
        return focusListByIndex(0);
      };
      const hasContinueItem = () => getFocusCollection(FocusZones.CONTINUE).length > 0;
      const openFilterPanel = () => {
        try {
          const btn = filter && typeof filter.render === "function" ? filter.render().find(".filter--filter") : null;
          if (btn && btn.length) {
            btn.trigger("hover:enter");
            return true;
          }
        } catch (e) {
          LOG("openFilterPanel trigger error", e);
        }
        try {
          filter.show(Lampa.Lang.translate("title_filter"), "filter");
        } catch (e) {
          LOG("openFilterPanel show error", e);
        }
        return true;
      };
      const refreshFilterFocusBinding = () => {
        if (!filter || typeof filter.render !== "function") return;
        const items = getFilterFocusItems();
        if (!items || !items.length) return;
        items.each((idx, el) => {
          const $el = $(el);
          $el.data("torboxZone", FocusZones.FILTER).data("torboxIndex", idx).addClass("torbox-filter-focus");
        });
        items.off("hover:focus.torboxNav").on("hover:focus.torboxNav", (e) => {
          updateFocusMetaFromElement($(e.currentTarget));
        });
      };
      const focusPrimaryFilterControl = () => {
        if (!filter || typeof filter.render !== "function") return false;
        refreshFilterFocusBinding();
        const container = filter.render();
        let primary = container.find(".filter--filter.selector").first();
        if (!primary.length) primary = container.find(".filter--filter").first();
        if (primary.length) return focusElement(primary);
        return focusFilterItem(0);
      };
      const focusSearchControl = () => {
        if (!filter || typeof filter.render !== "function") return false;
        refreshFilterFocusBinding();
        const container = filter.render();
        let searchBtn = container.find(".filter--search.selector").first();
        if (!searchBtn.length) searchBtn = container.find(".filter--search").first();
        if (searchBtn.length) return focusElement(searchBtn);
        return focusFilterItem(0);
      };
      const formatRefineTags = (tags) => {
        if (!Array.isArray(tags) || !tags.length) return "";
        const dictionary = {
          original: translate("torbox_refine_tag_original"),
          translation: translate("torbox_refine_tag_translation"),
          alt: translate("torbox_refine_tag_alt"),
          year: translate("torbox_refine_tag_year"),
          season: translate("torbox_refine_tag_season"),
          episode: translate("torbox_refine_tag_episode"),
          keyword: translate("torbox_refine_tag_keyword"),
          id: translate("torbox_refine_tag_id"),
          mix: translate("torbox_refine_tag_mix")
        };
        const labels = tags.map((tag) => dictionary[tag]).filter(Boolean);
        return labels.join(" \u2022 ");
      };
      const focusRoutes = {
        [FocusZones.LIST]: {
          up: () => {
            if (focusState.index > 0) return focusListByIndex(focusState.index - 1);
            if (hasContinueItem()) return focusContinueItem();
            if (focusSearchControl()) return true;
            Lampa.Controller.toggle("head");
            return true;
          },
          down: () => focusListByIndex(focusState.index + 1) || focusListByIndex(focusState.index),
          left: () => {
            Lampa.Controller.toggle("menu");
            return true;
          },
          right: () => {
            openFilterPanel();
            return true;
          }
        },
        [FocusZones.CONTINUE]: {
          up: () => {
            if (focusSearchControl()) return true;
            Lampa.Controller.toggle("head");
            return true;
          },
          down: () => focusListByIndex(0) || true,
          left: () => {
            Lampa.Controller.toggle("menu");
            return true;
          },
          right: () => {
            openFilterPanel();
            return true;
          }
        },
        [FocusZones.FILTER]: {
          up: () => {
            Lampa.Controller.toggle("head");
            return true;
          },
          down: () => hasContinueItem() ? focusContinueItem() : focusLastKnownListItem() || focusListByIndex(0) || true,
          left: () => {
            if (focusState.index > 0) return focusFilterItem(focusState.index - 1);
            return focusLastKnownListItem() || focusContinueItem() || true;
          },
          right: () => focusFilterItem(focusState.index + 1) || focusFilterItem(focusState.index)
        },
        [FocusZones.EMPTY]: {
          up: () => {
            if (focusSearchControl()) return true;
            Lampa.Controller.toggle("head");
            return true;
          },
          down: () => true,
          left: () => {
            Lampa.Controller.toggle("menu");
            return true;
          },
          right: () => {
            openFilterPanel();
            return true;
          }
        },
        [FocusZones.FILE]: {
          up: () => focusFileItem(focusState.index - 1) || focusFileItem(focusState.index),
          down: () => focusFileItem(focusState.index + 1) || focusFileItem(focusState.index),
          left: () => {
            Lampa.Controller.toggle("menu");
            return true;
          },
          right: () => focusFileDownload(focusState.index) || true
        },
        [FocusZones.FILE_DOWNLOAD]: {
          up: () => focusFileDownload(focusState.index - 1) || focusFileDownload(focusState.index),
          down: () => focusFileDownload(focusState.index + 1) || focusFileDownload(focusState.index),
          left: () => focusFileItem(focusState.index) || true,
          right: () => true
        }
      };
      const ensureFocusExists = () => {
        if (!isTorrentsView()) return;
        if (focusState.zone && lastFocused) return;
        if (focusLastKnownListItem()) return;
        if (focusListByIndex(0)) return;
        if (hasContinueItem() && focusContinueItem()) return;
        if (focusSearchControl()) return;
        if (!focusListByIndex(0)) focusEmptyMessage();
      };
      const handleDirectionalNavigation = (direction) => {
        var _a2, _b;
        if (state.view === "episodes") {
          const zone2 = focusState.zone || FocusZones.FILE;
          const handler2 = (_a2 = focusRoutes[zone2]) == null ? void 0 : _a2[direction];
          if (typeof handler2 === "function" && handler2()) return;
          if (Navigator.canmove(direction)) Navigator.move(direction);
          return;
        }
        if (!isTorrentsView()) {
          if (Navigator.canmove(direction)) Navigator.move(direction);
          return;
        }
        ensureFocusExists();
        const zone = focusState.zone || FocusZones.LIST;
        const handler = (_b = focusRoutes[zone]) == null ? void 0 : _b[direction];
        if (typeof handler === "function") {
          const handled = handler();
          if (handled) return;
        }
        if (Navigator.canmove(direction)) Navigator.move(direction);
      };
      const movieStorageKey = () => object.movie.imdb_id || object.movie.id || "unknown";
      const lastTorrentStorageKey = () => `torbox_last_torrent_data_${movieStorageKey()}`;
      const compactTorrentSnapshot = (src) => {
        if (!src || !src.hash || !src.magnet) return null;
        return {
          hash: src.hash,
          magnet: src.magnet,
          title: src.raw_title || src.title || "",
          size: Number(src.size) || 0,
          last_known_seeders: Number(src.last_known_seeders) || 0,
          last_known_peers: Number(src.last_known_peers) || 0,
          cached: !!src.cached,
          quality: src.quality || null,
          icon: src.icon || ""
        };
      };
      const saveLastTorrentSnapshot = (snapshot) => {
        const key = lastTorrentStorageKey();
        if (snapshot) {
          const normalized = Object.assign({}, snapshot, {
            title: (snapshot.title || "").slice(0, 320)
          });
          let payload = JSON.stringify(normalized);
          if (payload.length > CONST.MAX_SNAPSHOT_BYTES) {
            const minimal = {
              hash: normalized.hash,
              magnet: normalized.magnet,
              title: normalized.title,
              cached: !!normalized.cached,
              quality: normalized.quality || null,
              size: normalized.size || 0,
              last_known_seeders: normalized.last_known_seeders || 0,
              last_known_peers: normalized.last_known_peers || 0,
              icon: normalized.icon || ""
            };
            payload = JSON.stringify(minimal);
          }
          Store.set(key, payload);
        } else {
          Store.set(key, "");
        }
      };
      const loadLastTorrentSnapshot = () => {
        const raw = Store.get(lastTorrentStorageKey(), "");
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          const snapshot = compactTorrentSnapshot(parsed);
          if (snapshot) {
            saveLastTorrentSnapshot(snapshot);
            return snapshot;
          }
        } catch (err) {
          LOG("Continue panel parse error", err);
        }
        Store.set(lastTorrentStorageKey(), "");
        return null;
      };
      const buildContinueInfo = (snapshot) => {
        var _a2;
        if (!snapshot) return translate("torbox_last_torrent_fallback");
        const icon = snapshot.icon || (snapshot.cached ? "\u26A1" : "\u2601\uFE0F");
        const titleParts = [];
        if (snapshot.quality) titleParts.push(`[${Utils.escapeHtml(String(snapshot.quality))}]`);
        titleParts.push(Utils.escapeHtml(snapshot.title || translate("torbox_no_title")));
        const sizeText = snapshot.size ? Utils.formatBytes(snapshot.size) : translate("torbox_not_available");
        const seeders = (_a2 = snapshot.last_known_seeders) != null ? _a2 : 0;
        return translateWithParams("torbox_continue_info_template", {
          icon,
          title: titleParts.join(" "),
          size: sizeText,
          seeders
        });
      };
      const cancelActiveTorrentFlow = () => {
        if (activeTorrentController) {
          try {
            if (!activeTorrentController.signal.aborted) activeTorrentController.abort();
          } catch (err) {
            LOG("Abort active torrent flow error", err);
          }
        }
        activeTorrentController = null;
        const reverted = revertPendingPlayback();
        if (reverted && state.view === "torrents") build();
      };
      this.buildTechBar = (tech, raw) => {
        const tag = (txt, cls) => `<div class="torbox-item__tech-item torbox-item__tech-item--${cls}">${txt}</div>`;
        let html = "";
        if (tech.video_resolution) html += tag(Utils.escapeHtml(tech.video_resolution), "res");
        if (tech.video_codec) html += tag(Utils.escapeHtml(String(tech.video_codec).toUpperCase()), "codec");
        if (tech.has_hdr) html += tag("HDR", "hdr");
        if (tech.has_dv) html += tag("Dolby Vision", "dv");
        const audioStreams = Array.isArray(raw == null ? void 0 : raw.ffprobe) ? raw.ffprobe.filter((s) => (s == null ? void 0 : s.codec_type) === "audio") : [];
        let voiceIdx = 0;
        audioStreams.forEach((s) => {
          var _a2, _b, _c, _d, _e;
          let lang = ((_b = (_a2 = s == null ? void 0 : s.tags) == null ? void 0 : _a2.language) == null ? void 0 : _b.toUpperCase()) || ((_d = (_c = s == null ? void 0 : s.tags) == null ? void 0 : _c.LANGUAGE) == null ? void 0 : _d.toUpperCase()) || Array.isArray((_e = raw == null ? void 0 : raw.info) == null ? void 0 : _e.voices) && raw.info.voices[voiceIdx++] || null;
          const codec = (s == null ? void 0 : s.codec_name) ? String(s.codec_name).toUpperCase() : "";
          const layout = (s == null ? void 0 : s.channel_layout) || "";
          const text = [lang, codec, layout].filter(Boolean).join(" ");
          if (text) html += tag(Utils.escapeHtml(text), "audio");
        });
        return html ? `<div class="torbox-item__tech-bar">${html}</div>` : "";
      };
      const toViewItem = (raw, hashHex, cachedSet) => {
        var _a2, _b, _c, _d;
        const v = Array.isArray(raw == null ? void 0 : raw.ffprobe) ? raw.ffprobe.find((s) => s.codec_type === "video") : null;
        const a = Array.isArray(raw == null ? void 0 : raw.ffprobe) ? raw.ffprobe.filter((s) => s.codec_type === "audio") : [];
        const trackers = String((raw == null ? void 0 : raw.Tracker) || "").split(/,\s*/).map((item) => String(item || "").trim()).filter(Boolean);
        const primaryTracker = trackers[0] || translate("torbox_not_available");
        const tech = {
          video_codec: (v == null ? void 0 : v.codec_name) || null,
          video_resolution: v ? `${v.width}x${v.height}` : null,
          audio_langs: [...new Set(a.map((s) => {
            var _a3, _b2;
            return ((_a3 = s == null ? void 0 : s.tags) == null ? void 0 : _a3.language) || ((_b2 = s == null ? void 0 : s.tags) == null ? void 0 : _b2.LANGUAGE);
          }).filter(Boolean))].map((x) => String(x).toUpperCase()),
          audio_codecs: [...new Set(a.map((s) => s == null ? void 0 : s.codec_name).filter(Boolean))].map((x) => String(x).toUpperCase()),
          has_hdr: /(^|\W)hdr(\W|$)/i.test((raw == null ? void 0 : raw.Title) || "") || /hdr/i.test(((_a2 = raw == null ? void 0 : raw.info) == null ? void 0 : _a2.videotype) || ""),
          has_dv: /(dv|dolby\s*vision)/i.test((raw == null ? void 0 : raw.Title) || "") || /(dovi|dolby\s*vision)/i.test(((_b = raw == null ? void 0 : raw.info) == null ? void 0 : _b.videotype) || "")
        };
        const isCached = cachedSet.has(hashHex.toLowerCase());
        const publishDate = (raw == null ? void 0 : raw.PublishDate) ? new Date(raw.PublishDate) : null;
        const viewItem = {
          title: Utils.escapeHtml((raw == null ? void 0 : raw.Title) || translate("torbox_no_title")),
          raw_title: (raw == null ? void 0 : raw.Title) || "",
          size: Number(raw == null ? void 0 : raw.Size) || 0,
          magnet: (raw == null ? void 0 : raw.MagnetUri) || "",
          hash: hashHex,
          last_known_seeders: Number(raw == null ? void 0 : raw.Seeders) || 0,
          last_known_peers: Number((raw == null ? void 0 : raw.Peers) || (raw == null ? void 0 : raw.Leechers)) || 0,
          trackers,
          icon: isCached ? "\u26A1" : "\u2601\uFE0F",
          cached: isCached,
          publish_date: (raw == null ? void 0 : raw.PublishDate) || "",
          publish_timestamp: publishDate && isFinite(publishDate) ? publishDate.getTime() : 0,
          age: Utils.formatAge(raw == null ? void 0 : raw.PublishDate),
          quality: Utils.getQualityLabel((raw == null ? void 0 : raw.Title) || "", raw),
          video_type: String(((_c = raw == null ? void 0 : raw.info) == null ? void 0 : _c.videotype) || "").toLowerCase() || "unknown",
          voices: Array.isArray((_d = raw == null ? void 0 : raw.info) == null ? void 0 : _d.voices) ? raw.info.voices : [],
          video_codec: tech.video_codec,
          audio_langs: tech.audio_langs,
          audio_codecs: tech.audio_codecs,
          info_formated: `[${Utils.getQualityLabel((raw == null ? void 0 : raw.Title) || "", raw)}] ${Utils.formatBytes(raw == null ? void 0 : raw.Size)} | \u{1F7E2}<span style="color:var(--color-good);">${Number(raw == null ? void 0 : raw.Seeders) || 0}</span> / \u{1F534}<span style="color:var(--color-bad);">${Number((raw == null ? void 0 : raw.Peers) || (raw == null ? void 0 : raw.Leechers)) || 0}</span>`,
          meta_formated: `${translate("torbox_info_trackers")}: ${Utils.escapeHtml(primaryTracker)} | ${translate("torbox_info_added")}: ${Utils.formatAge(raw == null ? void 0 : raw.PublishDate) || translate("torbox_not_available")}`,
          tech_bar_html: this.buildTechBar(tech, raw)
        };
        storeRawTorrent(hashHex, raw);
        return viewItem;
      };
      const drawEpisodes = (torrentData, preferredFile = null) => {
        focusState.zone = FocusZones.FILE;
        focusState.index = 0;
        scroll.clear();
        filter.render().hide();
        const mid = object.movie.imdb_id || object.movie.id || "unknown";
        const torrentKey = torrentData.hash || torrentData.id;
        let watchedSet;
        try {
          const rawWatched = JSON.parse(Store.get(`torbox_watched_episodes_${mid}_${torrentKey}`, "[]"));
          let sanitized = Array.isArray(rawWatched) ? rawWatched.map((id) => String(id)).filter(Boolean) : [];
          if (sanitized.length > CONST.MAX_WATCHED_EPISODES) {
            sanitized = sanitized.slice(-CONST.MAX_WATCHED_EPISODES);
            Store.set(`torbox_watched_episodes_${mid}_${torrentKey}`, JSON.stringify(sanitized));
          } else if (sanitized.length !== (Array.isArray(rawWatched) ? rawWatched.length : 0)) {
            Store.set(`torbox_watched_episodes_${mid}_${torrentKey}`, JSON.stringify(sanitized));
          }
          watchedSet = new Set(sanitized);
        } catch (e) {
          watchedSet = /* @__PURE__ */ new Set();
          Store.set(`torbox_watched_episodes_${mid}_${torrentKey}`, "[]");
        }
        const preferredFocusId = preferredFile && preferredFile.id !== void 0 && preferredFile.id !== null ? String(preferredFile.id) : null;
        const storedLastPlayedId = Store.get(`torbox_last_played_file_${mid}_${torrentKey}`, null);
        const videoExtensions = getVideoExtensions();
        const videoRegex = new RegExp(
          `\\.(${videoExtensions.map((ext) => ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`,
          "i"
        );
        const vids = (Array.isArray(torrentData.files) ? torrentData.files : []).filter((f) => videoRegex.test((f == null ? void 0 : f.name) || "")).map((f, i) => Object.assign({ __idx: i }, f)).sort(Utils.naturalEpisodeSort);
        if (!vids.length) {
          ErrorHandler.show("validation", { message: translate("torbox_error_no_video_files") });
          return;
        }
        let focusEl = null;
        let firstFileEl = null;
        vids.forEach((file, idx) => {
          const clean = (file.name || "").split("/").pop();
          let item = Lampa.Template.get("torbox_episode_item", {
            title: Utils.escapeHtml(clean || file.name || translate("torbox_no_title")),
            size: Utils.formatBytes(file.size || 0),
            file_id: Utils.escapeHtml(String(file.id)),
            download_label: Utils.escapeHtml(translate("torbox_file_download"))
          });
          if (!firstFileEl) firstFileEl = item;
          const fileIdStr = String(file.id);
          const isWatched = watchedSet.has(fileIdStr);
          const isLastPlayed = storedLastPlayedId !== null && fileIdStr === String(storedLastPlayedId);
          const shouldFocus = preferredFocusId ? fileIdStr === preferredFocusId : isLastPlayed;
          const downloadBtn = item.find(".torbox-file-download");
          if (isWatched) item.addClass("torbox-file-item--watched");
          if (isLastPlayed) {
            item.addClass("torbox-file-item--last-played");
          }
          if (shouldFocus) {
            focusEl = item;
          }
          item.data("torboxZone", FocusZones.FILE).data("torboxIndex", idx).on("hover:focus", (e) => {
            const target = $(e.currentTarget);
            updateFocusMetaFromElement(target);
            scroll.update(target, true);
          }).on("hover:enter", () => {
            rememberPreferredFile(torrentData, file);
            play(torrentData, file, {
              onStart: ({ changed }) => {
                if (!watchedSet.has(fileIdStr) && changed) {
                  watchedSet.add(fileIdStr);
                  item.addClass("torbox-file-item--watched");
                }
              },
              onSuccess: ({ changed }) => {
                if (!watchedSet.has(fileIdStr) && changed) {
                  watchedSet.add(fileIdStr);
                  item.addClass("torbox-file-item--watched");
                }
                drawEpisodes(torrentData);
                Lampa.Controller.toggle("content");
              },
              onFail: () => Lampa.Controller.toggle("content")
            });
          });
          downloadBtn.data("torboxZone", FocusZones.FILE_DOWNLOAD).data("torboxIndex", idx).attr("title", translate("torbox_file_download")).on("hover:focus", (e) => {
            const target = $(e.currentTarget);
            updateFocusMetaFromElement(target);
            scroll.update(item, true);
          }).on("hover:enter", (e) => {
            if (e && typeof e.stopPropagation === "function") e.stopPropagation();
            if (e && typeof e.preventDefault === "function") e.preventDefault();
            downloadFileLink(torrentData, file, downloadBtn);
          });
          scroll.append(item);
        });
        if (focusEl || firstFileEl) focusElement(focusEl || firstFileEl);
        Lampa.Controller.enable("content");
        updateDebugOverlay(focusEl || firstFileEl || null);
      };
      const _getPlayerConfig = (url, file, movie) => {
        const cleanName = ((file == null ? void 0 : file.name) || "").split("/").pop();
        const cfg = {
          url,
          title: cleanName || movie.title || "TorBox",
          poster: Lampa.Utils.cardImgBackgroundBlur(movie),
          id: movie.id,
          movie,
          // Lampa's player reads the card from `card` (header title, footer info).
          card: movie
        };
        const s = (cleanName || "").match(/[Ss](\d{1,2})/);
        const e = (cleanName || "").match(/[Ee](\d{1,3})/);
        if (s) cfg.season = parseInt(s[1], 10);
        if (e) cfg.episode = parseInt(e[1], 10);
        if (!s && e && movie.number_of_seasons) cfg.season = 1;
        const origTitle = movie.original_title || movie.original_name || movie.title || "";
        const tlKey = cfg.season != null && cfg.episode != null ? [cfg.season, cfg.season > 10 ? ":" : "", cfg.episode, origTitle].join("") : String(origTitle);
        if (Lampa.Timeline && typeof Lampa.Timeline.view === "function") {
          cfg.timeline = Lampa.Timeline.view(Lampa.Utils.hash(tlKey));
        }
        return cfg;
      };
      const _markWatched = (torrentHashOrId, fileId) => {
        const mid = object.movie.imdb_id || object.movie.id || "unknown";
        const key = `torbox_watched_episodes_${mid}_${torrentHashOrId}`;
        let rawList;
        try {
          rawList = JSON.parse(Store.get(key, "[]"));
        } catch (e) {
          rawList = [];
        }
        if (!Array.isArray(rawList)) rawList = [];
        const seen = /* @__PURE__ */ new Set();
        const normalized = [];
        rawList.forEach((entry) => {
          const id = String(entry);
          if (!id || seen.has(id)) return;
          seen.add(id);
          normalized.push(id);
        });
        let changed = normalized.length !== rawList.length;
        const fileKey = String(fileId);
        if (fileKey && !seen.has(fileKey)) {
          normalized.push(fileKey);
          seen.add(fileKey);
          changed = true;
        }
        if (normalized.length > CONST.MAX_WATCHED_EPISODES) {
          const cut = normalized.slice(-CONST.MAX_WATCHED_EPISODES);
          normalized.length = 0;
          normalized.push(...cut);
          changed = true;
        }
        Store.set(key, JSON.stringify(normalized));
        if (fileKey) Store.set(`torbox_last_played_file_${mid}_${torrentHashOrId}`, fileKey);
        return changed;
      };
      const preferredFileStorageKey = (torrentData) => {
        const mid = object.movie.imdb_id || object.movie.id || "unknown";
        const torrentKey = (torrentData == null ? void 0 : torrentData.hash) || (torrentData == null ? void 0 : torrentData.id) || "unknown";
        return `torbox_preferred_file_${mid}_${torrentKey}`;
      };
      const rememberPreferredFile = (torrentData, file) => {
        const fid = file == null ? void 0 : file.id;
        if (fid === void 0 || fid === null) return;
        Store.set(preferredFileStorageKey(torrentData), String(fid));
      };
      const getRememberedFile = (torrentData, files2) => {
        const remembered = Store.get(preferredFileStorageKey(torrentData), "");
        if (!remembered) return null;
        const list = Array.isArray(files2) ? files2 : [];
        return list.find((file) => String(file == null ? void 0 : file.id) === String(remembered)) || null;
      };
      const isSeriesContent = () => {
        const movie = (object == null ? void 0 : object.movie) || {};
        return !!(movie.name || movie.original_name || movie.first_air_date || movie.season_number || movie.number_of_seasons || Array.isArray(movie.seasons) && movie.seasons.length || movie.media_type === "tv");
      };
      const pickBestVideoFile = (files2) => {
        const list = Array.isArray(files2) ? files2 : [];
        if (!list.length) return null;
        const sampleRe = /(sample|trailer|тизер|teaser|featurette|extras?|behind[ ._-]?the[ ._-]?scenes)/i;
        const candidates = list.filter((file) => !sampleRe.test(String((file == null ? void 0 : file.name) || "").split("/").pop() || ""));
        const base = candidates.length ? candidates : list;
        return base.slice().sort((a, b) => {
          const sizeA = Number(a == null ? void 0 : a.size) || 0;
          const sizeB = Number(b == null ? void 0 : b.size) || 0;
          if (sizeA !== sizeB) return sizeB - sizeA;
          const nameA = String((a == null ? void 0 : a.name) || "");
          const nameB = String((b == null ? void 0 : b.name) || "");
          return nameA.localeCompare(nameB);
        })[0] || null;
      };
      const normalizeSafeDownloadLink = (link) => {
        if (!link || typeof link !== "string") return null;
        try {
          const url = new URL(link.trim());
          if (url.protocol !== "http:" && url.protocol !== "https:") return null;
          return url.href;
        } catch (_) {
          return null;
        }
      };
      const resolveFileDownloadLink = (torrentData, file) => __async(this, null, function* () {
        const dl = yield Api.requestDl(torrentData.id, file.id);
        const link = normalizeSafeDownloadLink((dl == null ? void 0 : dl.url) || (dl == null ? void 0 : dl.data));
        if (!link) throw { type: "api", message: translate("torbox_error_file_link") };
        return link;
      });
      const getFileDownloadFilename = (file) => {
        var _a2;
        const clean = String((file == null ? void 0 : file.name) || "").split("/").pop().trim();
        const fallback = `torbox-file-${(_a2 = file == null ? void 0 : file.id) != null ? _a2 : "download"}.mp4`;
        const filename = (clean || fallback).replace(/[\x00-\x1F\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 180);
        return filename || fallback;
      };
      const getAndroidBridgeVersion = () => {
        try {
          if (typeof AndroidJS === "undefined" || typeof AndroidJS.appVersion !== "function") return 0;
          const parts = String(AndroidJS.appVersion() || "").split("-");
          const raw = parts.pop();
          const version = parseInt(raw, 10);
          return Number.isFinite(version) ? version : 0;
        } catch (_) {
          return 0;
        }
      };
      const canUseAndroidBrowser = () => {
        var _a2, _b;
        try {
          if (typeof AndroidJS !== "undefined" && typeof AndroidJS.openBrowser === "function") return true;
          return !!(typeof Lampa !== "undefined" && ((_a2 = Lampa == null ? void 0 : Lampa.Platform) == null ? void 0 : _a2.is) && Lampa.Platform.is("android") && ((_b = Lampa == null ? void 0 : Lampa.Android) == null ? void 0 : _b.openBrowser) && getAndroidBridgeVersion() >= 484);
        } catch (_) {
          return false;
        }
      };
      const tryAndroidDownloadOpen = (link) => {
        try {
          if (typeof AndroidJS !== "undefined" && typeof AndroidJS.openBrowser === "function") {
            AndroidJS.openBrowser(link);
            return true;
          }
        } catch (e) {
          LOG("AndroidJS download open failed", (e == null ? void 0 : e.message) || e);
        }
        try {
          if (canUseAndroidBrowser()) {
            Lampa.Android.openBrowser(link);
            return true;
          }
        } catch (e) {
          LOG("Android download open failed", (e == null ? void 0 : e.message) || e);
        }
        return false;
      };
      const closePreparedDownloadOpen = (opener) => {
        try {
          if (opener && !opener.closed && typeof opener.close === "function") opener.close();
        } catch (_) {
        }
      };
      const prepareFileDownloadOpen = (file) => {
        if (canUseAndroidBrowser()) return null;
        try {
          if (typeof window.open !== "function") return null;
          const opener = window.open("", "_blank");
          if (!opener) return null;
          try {
            opener.opener = null;
            if (opener.document) {
              opener.document.title = getFileDownloadFilename(file);
              if (opener.document.body) {
                opener.document.body.style.font = "16px sans-serif";
                opener.document.body.style.padding = "24px";
                opener.document.body.textContent = translate("torbox_download_preparing");
              }
            }
          } catch (_) {
          }
          return opener;
        } catch (e) {
          LOG("Download target prepare failed", (e == null ? void 0 : e.message) || e);
          return null;
        }
      };
      const clickAnchorDownload = (link, file) => {
        try {
          if (typeof document === "undefined" || !document.body) return false;
          const filename = getFileDownloadFilename(file);
          const anchor = document.createElement("a");
          anchor.href = link;
          anchor.setAttribute("download", filename);
          anchor.setAttribute("target", "_blank");
          anchor.setAttribute("rel", "noopener");
          anchor.style.display = "none";
          document.body.appendChild(anchor);
          anchor.click();
          setTimeout(() => {
            try {
              anchor.remove();
            } catch (_) {
            }
          }, 0);
          return true;
        } catch (e) {
          LOG("Anchor download failed", (e == null ? void 0 : e.message) || e);
          return false;
        }
      };
      const tryOpenDownloadLink = (link) => {
        try {
          if (typeof window.open === "function") {
            const opened = window.open(link, "_blank", "noopener");
            if (opened) return true;
          }
        } catch (e) {
          LOG("Download link open failed", (e == null ? void 0 : e.message) || e);
        }
        return false;
      };
      const startFileDownload = (link, file, opener) => {
        if (tryAndroidDownloadOpen(link)) return "system";
        try {
          if (opener && !opener.closed) {
            opener.location.href = link;
            return "system";
          }
        } catch (e) {
          LOG("Prepared download open failed", (e == null ? void 0 : e.message) || e);
          closePreparedDownloadOpen(opener);
        }
        if (clickAnchorDownload(link, file) || tryOpenDownloadLink(link)) return "attempted";
        return "copy_only";
      };
      const downloadFileLink = (torrentData, file, button) => __async(this, null, function* () {
        const btn = button && button.length ? button : null;
        if (btn && btn.data("torboxDownloading")) return;
        let opener = null;
        try {
          if (btn) {
            btn.data("torboxDownloading", true);
            btn.addClass("torbox-file-download--loading");
          }
          opener = prepareFileDownloadOpen(file);
          const link = yield resolveFileDownloadLink(torrentData, file);
          const downloadState = startFileDownload(link, file, opener);
          opener = null;
          Lampa.Utils.copyTextToClipboard(link, () => {
            const message = downloadState === "system" ? translate("torbox_download_started") : downloadState === "attempted" ? translate("torbox_download_attempted") : translate("torbox_download_link_copied");
            Lampa.Noty.show(message);
          }, () => {
            const message = downloadState === "system" ? translate("torbox_download_started_no_copy") : downloadState === "attempted" ? translate("torbox_download_attempted_no_copy") : translate("torbox_download_link_copy_failed");
            Lampa.Noty.show(message);
          });
        } catch (e) {
          closePreparedDownloadOpen(opener);
          ErrorHandler.show((e == null ? void 0 : e.type) || "error", e);
        } finally {
          if (btn) {
            btn.data("torboxDownloading", false);
            btn.removeClass("torbox-file-download--loading");
          }
          Lampa.Controller.toggle("content");
        }
      });
      const play = (_0, _1, ..._2) => __async(this, [_0, _1, ..._2], function* (torrentData, file, callbacks = {}) {
        var _a2;
        const { onSuccess, onFail, onFinally, onStart } = callbacks || {};
        let playbackStarted = false;
        let finished = false;
        try {
          preparePlaybackState(torrentData);
          if ((_a2 = object.movie) == null ? void 0 : _a2.id) Lampa.Favorite.add("history", object.movie);
          const link = yield resolveFileDownloadLink(torrentData, file);
          const playbackConfig = _getPlayerConfig(link, file, object.movie);
          const startResult = Lampa.Player.play(playbackConfig);
          playbackStarted = startResult !== false;
          if (!playbackStarted) {
            throw { type: "cancel", message: translate("torbox_error_player_cancelled") };
          }
          if (pendingPlayback) pendingPlayback.started = true;
          let changedAtStart = false;
          try {
            changedAtStart = _markWatched(torrentData.hash || torrentData.id, file.id);
          } catch (e) {
            LOG("Mark watched onStart error", e);
          }
          if (typeof onStart === "function") onStart({ torrentData, file, changed: changedAtStart });
          Lampa.Player.callback(() => {
            if (finished) return;
            finished = true;
            const changed = _markWatched(torrentData.hash || torrentData.id, file.id);
            finalizePendingPlayback();
            if (typeof onSuccess === "function") onSuccess({ torrentData, file, changed });
          });
        } catch (e) {
          if (!playbackStarted) {
            const reverted = revertPendingPlayback();
            if (reverted && state.view === "torrents") build();
          }
          if (typeof onFail === "function") onFail(e);
          if ((e == null ? void 0 : e.type) !== "cancel") ErrorHandler.show(e.type || "error", e);
        } finally {
          if (typeof onFinally === "function") onFinally({ started: playbackStarted, file, torrentData });
        }
      });
      const updateContinueWatchingPanel = (snapshotParam) => {
        if (state.view !== "torrents") return;
        const snapshot = snapshotParam != null ? snapshotParam : loadLastTorrentSnapshot();
        let panel = scroll.body().find(".torbox-watched-item");
        if (snapshot) {
          const info = buildContinueInfo(snapshot);
          if (panel.length) {
            panel.find(".torbox-watched-item__info").text(info);
            panel.data("torboxSnapshot", snapshot);
            panel.data("torboxZone", FocusZones.CONTINUE);
            panel.data("torboxIndex", 0);
            try {
              if (Lampa.Controller && typeof Lampa.Controller.collectionAppend === "function") {
                Lampa.Controller.collectionAppend(panel);
              }
            } catch (e) {
            }
          } else {
            const historyItem = Lampa.Template.get("torbox_watched_item", {
              title: translate("torbox_continue_watching"),
              info
            });
            historyItem.data("torboxSnapshot", snapshot).data("torboxZone", FocusZones.CONTINUE).data("torboxIndex", 0);
            historyItem.on("hover:focus", (e) => {
              const target = $(e.currentTarget);
              updateFocusMetaFromElement(target);
              scroll.update(target, true);
            }).on("hover:enter", (e) => {
              const snap = $(e.currentTarget).data("torboxSnapshot");
              if (snap) onTorrentClick(snap);
            });
            scroll.body().prepend(historyItem);
            try {
              if (Lampa.Controller && typeof Lampa.Controller.collectionAppend === "function") {
                Lampa.Controller.collectionAppend(historyItem);
              }
            } catch (e) {
            }
          }
        } else if (panel.length) {
          const panelEl = panel[0];
          panel.remove();
          try {
            if (window.Navigator && typeof Navigator.remove === "function" && panelEl) {
              Navigator.remove(panelEl);
            }
          } catch (e) {
          }
          if (focusState.zone === FocusZones.CONTINUE) {
            focusState.zone = null;
            focusState.index = 0;
            lastFocused = null;
          }
        }
      };
      const selectFile = (torrentData) => {
        const videoExtensions = Store.get("torbox_video_extensions", "mkv,mp4,avi,ts,m4v,webm").split(",").map((ext) => ext.trim().toLowerCase()).filter(Boolean);
        const videoRegex = new RegExp(
          `\\.(${videoExtensions.map((ext) => ext.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`,
          "i"
        );
        const vids = (Array.isArray(torrentData.files) ? torrentData.files : []).filter(
          (f) => videoRegex.test((f == null ? void 0 : f.name) || "")
        );
        if (!vids.length) {
          ErrorHandler.show("validation", { message: translate("torbox_error_no_video_files") });
          return;
        }
        const openFileList = (preferredFile = null) => {
          state.view = "episodes";
          state.current_torrent_data = torrentData;
          drawEpisodes(torrentData, preferredFile);
        };
        const remembered = getRememberedFile(torrentData, vids);
        if (remembered) {
          openFileList(remembered);
          return;
        }
        if (!isSeriesContent() && getAutoPickMovieFile()) {
          const best = pickBestVideoFile(vids);
          if (best) {
            openFileList(best);
            return;
          }
        }
        openFileList();
      };
      const beginPendingPlayback = (hash, snapshot) => {
        const previousSnapshot = loadLastTorrentSnapshot();
        pendingPlayback = {
          hash,
          snapshot: snapshot || null,
          previousSnapshot,
          previousHash: (previousSnapshot == null ? void 0 : previousSnapshot.hash) || null,
          started: false
        };
      };
      const revertPendingPlayback = () => {
        if (!pendingPlayback || pendingPlayback.started) return false;
        saveLastTorrentSnapshot(pe
