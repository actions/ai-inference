var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    "use strict";
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type3 = typeof val;
      if (type3 === "string" && val.length > 0) {
        return parse(val);
      } else if (type3 === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type3 = (match[2] || "ms").toLowerCase();
      switch (type3) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    "use strict";
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable2;
      createDebug.enable = enable2;
      createDebug.enabled = enabled2;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy2;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self2 = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend2;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend2(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable2(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable2() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled2(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy2() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    "use strict";
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load2;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load2() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module) {
    "use strict";
    module.exports = (flag, argv = process.argv) => {
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf("--");
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module) {
    "use strict";
    var os4 = __require("os");
    var tty = __require("tty");
    var hasFlag = require_has_flag();
    var { env } = process;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      forceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = 1;
    }
    if ("FORCE_COLOR" in env) {
      if (env.FORCE_COLOR === "true") {
        forceColor = 1;
      } else if (env.FORCE_COLOR === "false") {
        forceColor = 0;
      } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
      }
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(haveStream, streamIsTTY) {
      if (forceColor === 0) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (haveStream && !streamIsTTY && forceColor === void 0) {
        return 0;
      }
      const min = forceColor || 0;
      if (env.TERM === "dumb") {
        return min;
      }
      if (process.platform === "win32") {
        const osRelease = os4.release().split(".");
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream, stream && stream.isTTY);
      return translateLevel(level);
    }
    module.exports = {
      supportsColor: getSupportLevel,
      stdout: translateLevel(supportsColor(true, tty.isatty(1))),
      stderr: translateLevel(supportsColor(true, tty.isatty(2)))
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module) {
    "use strict";
    var tty = __require("tty");
    var util2 = __require("util");
    exports.init = init;
    exports.log = log2;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load2;
    exports.useColors = useColors;
    exports.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log2(...args) {
      return process.stderr.write(util2.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load2() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module) {
    "use strict";
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node();
    }
  }
});

// node_modules/agent-base/dist/helpers.js
var require_helpers = __commonJS({
  "node_modules/agent-base/dist/helpers.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.req = exports.json = exports.toBuffer = void 0;
    var http2 = __importStar(__require("http"));
    var https2 = __importStar(__require("https"));
    async function toBuffer(stream) {
      let length = 0;
      const chunks = [];
      for await (const chunk of stream) {
        length += chunk.length;
        chunks.push(chunk);
      }
      return Buffer.concat(chunks, length);
    }
    exports.toBuffer = toBuffer;
    async function json(stream) {
      const buf = await toBuffer(stream);
      const str = buf.toString("utf8");
      try {
        return JSON.parse(str);
      } catch (_err) {
        const err = _err;
        err.message += ` (input: ${str})`;
        throw err;
      }
    }
    exports.json = json;
    function req(url, opts = {}) {
      const href = typeof url === "string" ? url : url.href;
      const req2 = (href.startsWith("https:") ? https2 : http2).request(url, opts);
      const promise = new Promise((resolve, reject) => {
        req2.once("response", resolve).once("error", reject).end();
      });
      req2.then = promise.then.bind(promise);
      return req2;
    }
    exports.req = req;
  }
});

// node_modules/agent-base/dist/index.js
var require_dist = __commonJS({
  "node_modules/agent-base/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Agent = void 0;
    var net = __importStar(__require("net"));
    var http2 = __importStar(__require("http"));
    var https_1 = __require("https");
    __exportStar(require_helpers(), exports);
    var INTERNAL = Symbol("AgentBaseInternalState");
    var Agent3 = class extends http2.Agent {
      constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
      }
      /**
       * Determine whether this is an `http` or `https` request.
       */
      isSecureEndpoint(options) {
        if (options) {
          if (typeof options.secureEndpoint === "boolean") {
            return options.secureEndpoint;
          }
          if (typeof options.protocol === "string") {
            return options.protocol === "https:";
          }
        }
        const { stack } = new Error();
        if (typeof stack !== "string")
          return false;
        return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
      }
      // In order to support async signatures in `connect()` and Node's native
      // connection pooling in `http.Agent`, the array of sockets for each origin
      // has to be updated synchronously. This is so the length of the array is
      // accurate when `addRequest()` is next called. We achieve this by creating a
      // fake socket and adding it to `sockets[origin]` and incrementing
      // `totalSocketCount`.
      incrementSockets(name) {
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
          return null;
        }
        if (!this.sockets[name]) {
          this.sockets[name] = [];
        }
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        this.totalSocketCount++;
        return fakeSocket;
      }
      decrementSockets(name, socket) {
        if (!this.sockets[name] || socket === null) {
          return;
        }
        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
          sockets.splice(index, 1);
          this.totalSocketCount--;
          if (sockets.length === 0) {
            delete this.sockets[name];
          }
        }
      }
      // In order to properly update the socket pool, we need to call `getName()` on
      // the core `https.Agent` if it is a secureEndpoint.
      getName(options) {
        const secureEndpoint = typeof options.secureEndpoint === "boolean" ? options.secureEndpoint : this.isSecureEndpoint(options);
        if (secureEndpoint) {
          return https_1.Agent.prototype.getName.call(this, options);
        }
        return super.getName(options);
      }
      createSocket(req, options, cb) {
        const connectOpts = {
          ...options,
          secureEndpoint: this.isSecureEndpoint(options)
        };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);
        Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
          this.decrementSockets(name, fakeSocket);
          if (socket instanceof http2.Agent) {
            try {
              return socket.addRequest(req, connectOpts);
            } catch (err) {
              return cb(err);
            }
          }
          this[INTERNAL].currentSocket = socket;
          super.createSocket(req, options, cb);
        }, (err) => {
          this.decrementSockets(name, fakeSocket);
          cb(err);
        });
      }
      createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = void 0;
        if (!socket) {
          throw new Error("No socket was returned in the `connect()` function");
        }
        return socket;
      }
      get defaultPort() {
        return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
      }
      set defaultPort(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].defaultPort = v;
        }
      }
      get protocol() {
        return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
      }
      set protocol(v) {
        if (this[INTERNAL]) {
          this[INTERNAL].protocol = v;
        }
      }
    };
    exports.Agent = Agent3;
  }
});

// node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS({
  "node_modules/https-proxy-agent/dist/parse-proxy-response.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseProxyResponse = void 0;
    var debug_1 = __importDefault(require_src());
    var debug = (0, debug_1.default)("https-proxy-agent:parse-proxy-response");
    function parseProxyResponse(socket) {
      return new Promise((resolve, reject) => {
        let buffersLength = 0;
        const buffers = [];
        function read() {
          const b = socket.read();
          if (b)
            ondata(b);
          else
            socket.once("readable", read);
        }
        function cleanup() {
          socket.removeListener("end", onend);
          socket.removeListener("error", onerror);
          socket.removeListener("readable", read);
        }
        function onend() {
          cleanup();
          debug("onend");
          reject(new Error("Proxy connection ended before receiving CONNECT response"));
        }
        function onerror(err) {
          cleanup();
          debug("onerror %o", err);
          reject(err);
        }
        function ondata(b) {
          buffers.push(b);
          buffersLength += b.length;
          const buffered = Buffer.concat(buffers, buffersLength);
          const endOfHeaders = buffered.indexOf("\r\n\r\n");
          if (endOfHeaders === -1) {
            debug("have not received end of HTTP headers yet...");
            read();
            return;
          }
          const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split("\r\n");
          const firstLine = headerParts.shift();
          if (!firstLine) {
            socket.destroy();
            return reject(new Error("No header received from proxy CONNECT response"));
          }
          const firstLineParts = firstLine.split(" ");
          const statusCode = +firstLineParts[1];
          const statusText = firstLineParts.slice(2).join(" ");
          const headers = {};
          for (const header of headerParts) {
            if (!header)
              continue;
            const firstColon = header.indexOf(":");
            if (firstColon === -1) {
              socket.destroy();
              return reject(new Error(`Invalid header from proxy CONNECT response: "${header}"`));
            }
            const key = header.slice(0, firstColon).toLowerCase();
            const value = header.slice(firstColon + 1).trimStart();
            const current = headers[key];
            if (typeof current === "string") {
              headers[key] = [current, value];
            } else if (Array.isArray(current)) {
              current.push(value);
            } else {
              headers[key] = value;
            }
          }
          debug("got proxy server response: %o %o", firstLine, headers);
          cleanup();
          resolve({
            connect: {
              statusCode,
              statusText,
              headers
            },
            buffered
          });
        }
        socket.on("error", onerror);
        socket.on("end", onend);
        read();
      });
    }
    exports.parseProxyResponse = parseProxyResponse;
  }
});

// node_modules/https-proxy-agent/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/https-proxy-agent/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpsProxyAgent = void 0;
    var net = __importStar(__require("net"));
    var tls = __importStar(__require("tls"));
    var assert_1 = __importDefault(__require("assert"));
    var debug_1 = __importDefault(require_src());
    var agent_base_1 = require_dist();
    var url_1 = __require("url");
    var parse_proxy_response_1 = require_parse_proxy_response();
    var debug = (0, debug_1.default)("https-proxy-agent");
    var setServernameFromNonIpHost = (options) => {
      if (options.servername === void 0 && options.host && !net.isIP(options.host)) {
        return {
          ...options,
          servername: options.host
        };
      }
      return options;
    };
    var HttpsProxyAgent2 = class extends agent_base_1.Agent {
      constructor(proxy, opts) {
        super(opts);
        this.options = { path: void 0 };
        this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
        const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = {
          // Attempt to negotiate http/1.1 for proxy servers that support http/2
          ALPNProtocols: ["http/1.1"],
          ...opts ? omit(opts, "headers") : null,
          host,
          port
        };
      }
      /**
       * Called when the node-core HTTP client library is creating a
       * new HTTP request.
       */
      async connect(req, opts) {
        const { proxy } = this;
        if (!opts.host) {
          throw new TypeError('No "host" provided');
        }
        let socket;
        if (proxy.protocol === "https:") {
          debug("Creating `tls.Socket`: %o", this.connectOpts);
          socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
        } else {
          debug("Creating `net.Socket`: %o", this.connectOpts);
          socket = net.connect(this.connectOpts);
        }
        const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r
`;
        if (proxy.username || proxy.password) {
          const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
          headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
        }
        headers.Host = `${host}:${opts.port}`;
        if (!headers["Proxy-Connection"]) {
          headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        }
        for (const name of Object.keys(headers)) {
          payload += `${name}: ${headers[name]}\r
`;
        }
        const proxyResponsePromise = (0, parse_proxy_response_1.parseProxyResponse)(socket);
        socket.write(`${payload}\r
`);
        const { connect, buffered } = await proxyResponsePromise;
        req.emit("proxyConnect", connect);
        this.emit("proxyConnect", connect, req);
        if (connect.statusCode === 200) {
          req.once("socket", resume);
          if (opts.secureEndpoint) {
            debug("Upgrading socket connection to TLS");
            return tls.connect({
              ...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
              socket
            });
          }
          return socket;
        }
        socket.destroy();
        const fakeSocket = new net.Socket({ writable: false });
        fakeSocket.readable = true;
        req.once("socket", (s) => {
          debug("Replaying proxy buffer for failed request");
          (0, assert_1.default)(s.listenerCount("data") > 0);
          s.push(buffered);
          s.push(null);
        });
        return fakeSocket;
      }
    };
    HttpsProxyAgent2.protocols = ["http", "https"];
    exports.HttpsProxyAgent = HttpsProxyAgent2;
    function resume(socket) {
      socket.resume();
    }
    function omit(obj, ...keys) {
      const ret = {};
      let key;
      for (key in obj) {
        if (!keys.includes(key)) {
          ret[key] = obj[key];
        }
      }
      return ret;
    }
  }
});

// node_modules/http-proxy-agent/dist/index.js
var require_dist3 = __commonJS({
  "node_modules/http-proxy-agent/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpProxyAgent = void 0;
    var net = __importStar(__require("net"));
    var tls = __importStar(__require("tls"));
    var debug_1 = __importDefault(require_src());
    var events_1 = __require("events");
    var agent_base_1 = require_dist();
    var url_1 = __require("url");
    var debug = (0, debug_1.default)("http-proxy-agent");
    var HttpProxyAgent2 = class extends agent_base_1.Agent {
      constructor(proxy, opts) {
        super(opts);
        this.proxy = typeof proxy === "string" ? new url_1.URL(proxy) : proxy;
        this.proxyHeaders = opts?.headers ?? {};
        debug("Creating new HttpProxyAgent instance: %o", this.proxy.href);
        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
        const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
        this.connectOpts = {
          ...opts ? omit(opts, "headers") : null,
          host,
          port
        };
      }
      addRequest(req, opts) {
        req._header = null;
        this.setRequestProps(req, opts);
        super.addRequest(req, opts);
      }
      setRequestProps(req, opts) {
        const { proxy } = this;
        const protocol = opts.secureEndpoint ? "https:" : "http:";
        const hostname = req.getHeader("host") || "localhost";
        const base = `${protocol}//${hostname}`;
        const url = new url_1.URL(req.path, base);
        if (opts.port !== 80) {
          url.port = String(opts.port);
        }
        req.path = String(url);
        const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
        if (proxy.username || proxy.password) {
          const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
          headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
        }
        if (!headers["Proxy-Connection"]) {
          headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
        }
        for (const name of Object.keys(headers)) {
          const value = headers[name];
          if (value) {
            req.setHeader(name, value);
          }
        }
      }
      async connect(req, opts) {
        req._header = null;
        if (!req.path.includes("://")) {
          this.setRequestProps(req, opts);
        }
        let first;
        let endOfHeaders;
        debug("Regenerating stored HTTP header string for request");
        req._implicitHeader();
        if (req.outputData && req.outputData.length > 0) {
          debug("Patching connection write() output buffer with updated header");
          first = req.outputData[0].data;
          endOfHeaders = first.indexOf("\r\n\r\n") + 4;
          req.outputData[0].data = req._header + first.substring(endOfHeaders);
          debug("Output buffer: %o", req.outputData[0].data);
        }
        let socket;
        if (this.proxy.protocol === "https:") {
          debug("Creating `tls.Socket`: %o", this.connectOpts);
          socket = tls.connect(this.connectOpts);
        } else {
          debug("Creating `net.Socket`: %o", this.connectOpts);
          socket = net.connect(this.connectOpts);
        }
        await (0, events_1.once)(socket, "connect");
        return socket;
      }
    };
    HttpProxyAgent2.protocols = ["http", "https"];
    exports.HttpProxyAgent = HttpProxyAgent2;
    function omit(obj, ...keys) {
      const ret = {};
      let key;
      for (key in obj) {
        if (!keys.includes(key)) {
          ret[key] = obj[key];
        }
      }
      return ret;
    }
  }
});

// node_modules/@azure/core-tracing/dist/commonjs/state.js
var require_state = __commonJS({
  "node_modules/@azure/core-tracing/dist/commonjs/state.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.state = void 0;
    exports.state = {
      instrumenterImplementation: void 0
    };
  }
});

// src/main.ts
import * as core5 from "@actions/core";
import * as fs3 from "fs";
import * as os3 from "os";
import * as path from "path";

// src/mcp.ts
import * as core from "@actions/core";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
async function connectToGitHubMCP(token) {
  const githubMcpUrl = "https://api.githubcopilot.com/mcp/";
  core.info("Connecting to GitHub MCP server...");
  const transport = new StreamableHTTPClientTransport(new URL(githubMcpUrl), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-MCP-Readonly": "true"
      }
    }
  });
  const client = new Client({
    name: "ai-inference-action",
    version: "1.0.0",
    transport
  });
  try {
    await client.connect(transport);
  } catch (mcpError) {
    core.warning(`Failed to connect to GitHub MCP server: ${mcpError}`);
    return null;
  }
  core.info("Successfully connected to GitHub MCP server");
  const toolsResponse = await client.listTools();
  core.info(
    `Retrieved ${toolsResponse.tools?.length || 0} tools from GitHub MCP server`
  );
  const tools = (toolsResponse.tools || []).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema
    }
  }));
  core.info(`Mapped ${tools.length} GitHub MCP tools for Azure AI Inference`);
  return { client, tools };
}
async function executeToolCall(githubMcpClient, toolCall) {
  core.info(
    `Executing GitHub MCP tool: ${toolCall.function.name} with args: ${toolCall.function.arguments}`
  );
  try {
    const args = JSON.parse(toolCall.function.arguments);
    const result = await githubMcpClient.callTool({
      name: toolCall.function.name,
      arguments: args
    });
    core.info(`GitHub MCP tool ${toolCall.function.name} executed successfully`);
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      content: JSON.stringify(result.content)
    };
  } catch (toolError) {
    core.warning(
      `Failed to execute GitHub MCP tool ${toolCall.function.name}: ${toolError}`
    );
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: toolCall.function.name,
      content: `Error: ${toolError}`
    };
  }
}
async function executeToolCalls(githubMcpClient, toolCalls) {
  const toolResults = [];
  for (const toolCall of toolCalls) {
    const result = await executeToolCall(githubMcpClient, toolCall);
    toolResults.push(result);
  }
  return toolResults;
}

// src/inference.ts
import * as core3 from "@actions/core";

// node_modules/tslib/tslib.es6.mjs
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}

// node_modules/@typespec/ts-http-runtime/dist/esm/abort-controller/AbortError.js
var AbortError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
  }
};

// node_modules/@typespec/ts-http-runtime/dist/esm/logger/log.js
import { EOL } from "os";
import util from "util";
import * as process2 from "process";
function log(message, ...args) {
  process2.stderr.write(`${util.format(message, ...args)}${EOL}`);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/logger/debug.js
var debugEnvVariable = typeof process !== "undefined" && process.env && process.env.DEBUG || void 0;
var enabledString;
var enabledNamespaces = [];
var skippedNamespaces = [];
var debuggers = [];
if (debugEnvVariable) {
  enable(debugEnvVariable);
}
var debugObj = Object.assign((namespace) => {
  return createDebugger(namespace);
}, {
  enable,
  enabled,
  disable,
  log
});
function enable(namespaces) {
  enabledString = namespaces;
  enabledNamespaces = [];
  skippedNamespaces = [];
  const wildcard = /\*/g;
  const namespaceList = namespaces.split(",").map((ns) => ns.trim().replace(wildcard, ".*?"));
  for (const ns of namespaceList) {
    if (ns.startsWith("-")) {
      skippedNamespaces.push(new RegExp(`^${ns.substr(1)}$`));
    } else {
      enabledNamespaces.push(new RegExp(`^${ns}$`));
    }
  }
  for (const instance of debuggers) {
    instance.enabled = enabled(instance.namespace);
  }
}
function enabled(namespace) {
  if (namespace.endsWith("*")) {
    return true;
  }
  for (const skipped of skippedNamespaces) {
    if (skipped.test(namespace)) {
      return false;
    }
  }
  for (const enabledNamespace of enabledNamespaces) {
    if (enabledNamespace.test(namespace)) {
      return true;
    }
  }
  return false;
}
function disable() {
  const result = enabledString || "";
  enable("");
  return result;
}
function createDebugger(namespace) {
  const newDebugger = Object.assign(debug, {
    enabled: enabled(namespace),
    destroy,
    log: debugObj.log,
    namespace,
    extend
  });
  function debug(...args) {
    if (!newDebugger.enabled) {
      return;
    }
    if (args.length > 0) {
      args[0] = `${namespace} ${args[0]}`;
    }
    newDebugger.log(...args);
  }
  debuggers.push(newDebugger);
  return newDebugger;
}
function destroy() {
  const index = debuggers.indexOf(this);
  if (index >= 0) {
    debuggers.splice(index, 1);
    return true;
  }
  return false;
}
function extend(namespace) {
  const newDebugger = createDebugger(`${this.namespace}:${namespace}`);
  newDebugger.log = this.log;
  return newDebugger;
}
var debug_default = debugObj;

// node_modules/@typespec/ts-http-runtime/dist/esm/logger/logger.js
var TYPESPEC_RUNTIME_LOG_LEVELS = ["verbose", "info", "warning", "error"];
var levelMap = {
  verbose: 400,
  info: 300,
  warning: 200,
  error: 100
};
function patchLogMethod(parent, child) {
  child.log = (...args) => {
    parent.log(...args);
  };
}
function isTypeSpecRuntimeLogLevel(level) {
  return TYPESPEC_RUNTIME_LOG_LEVELS.includes(level);
}
function createLoggerContext(options) {
  const registeredLoggers = /* @__PURE__ */ new Set();
  const logLevelFromEnv = typeof process !== "undefined" && process.env && process.env[options.logLevelEnvVarName] || void 0;
  let logLevel;
  const clientLogger = debug_default(options.namespace);
  clientLogger.log = (...args) => {
    debug_default.log(...args);
  };
  if (logLevelFromEnv) {
    if (isTypeSpecRuntimeLogLevel(logLevelFromEnv)) {
      setLogLevel(logLevelFromEnv);
    } else {
      console.error(`${options.logLevelEnvVarName} set to unknown log level '${logLevelFromEnv}'; logging is not enabled. Acceptable values: ${TYPESPEC_RUNTIME_LOG_LEVELS.join(", ")}.`);
    }
  }
  function shouldEnable(logger4) {
    return Boolean(logLevel && levelMap[logger4.level] <= levelMap[logLevel]);
  }
  function createLogger(parent, level) {
    const logger4 = Object.assign(parent.extend(level), {
      level
    });
    patchLogMethod(parent, logger4);
    if (shouldEnable(logger4)) {
      const enabledNamespaces2 = debug_default.disable();
      debug_default.enable(enabledNamespaces2 + "," + logger4.namespace);
    }
    registeredLoggers.add(logger4);
    return logger4;
  }
  return {
    setLogLevel(level) {
      if (level && !isTypeSpecRuntimeLogLevel(level)) {
        throw new Error(`Unknown log level '${level}'. Acceptable values: ${TYPESPEC_RUNTIME_LOG_LEVELS.join(",")}`);
      }
      logLevel = level;
      const enabledNamespaces2 = [];
      for (const logger4 of registeredLoggers) {
        if (shouldEnable(logger4)) {
          enabledNamespaces2.push(logger4.namespace);
        }
      }
      debug_default.enable(enabledNamespaces2.join(","));
    },
    getLogLevel() {
      return logLevel;
    },
    createClientLogger(namespace) {
      const clientRootLogger = clientLogger.extend(namespace);
      patchLogMethod(clientLogger, clientRootLogger);
      return {
        error: createLogger(clientRootLogger, "error"),
        warning: createLogger(clientRootLogger, "warning"),
        info: createLogger(clientRootLogger, "info"),
        verbose: createLogger(clientRootLogger, "verbose")
      };
    },
    logger: clientLogger
  };
}
var context = createLoggerContext({
  logLevelEnvVarName: "TYPESPEC_RUNTIME_LOG_LEVEL",
  namespace: "typeSpecRuntime"
});
var TypeSpecRuntimeLogger = context.logger;
function setLogLevel(logLevel) {
  context.setLogLevel(logLevel);
}
function createClientLogger(namespace) {
  return context.createClientLogger(namespace);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/httpHeaders.js
function normalizeName(name) {
  return name.toLowerCase();
}
function* headerIterator(map) {
  for (const entry of map.values()) {
    yield [entry.name, entry.value];
  }
}
var HttpHeadersImpl = class {
  constructor(rawHeaders) {
    this._headersMap = /* @__PURE__ */ new Map();
    if (rawHeaders) {
      for (const headerName of Object.keys(rawHeaders)) {
        this.set(headerName, rawHeaders[headerName]);
      }
    }
  }
  /**
   * Set a header in this collection with the provided name and value. The name is
   * case-insensitive.
   * @param name - The name of the header to set. This value is case-insensitive.
   * @param value - The value of the header to set.
   */
  set(name, value) {
    this._headersMap.set(normalizeName(name), { name, value: String(value).trim() });
  }
  /**
   * Get the header value for the provided header name, or undefined if no header exists in this
   * collection with the provided name.
   * @param name - The name of the header. This value is case-insensitive.
   */
  get(name) {
    var _a3;
    return (_a3 = this._headersMap.get(normalizeName(name))) === null || _a3 === void 0 ? void 0 : _a3.value;
  }
  /**
   * Get whether or not this header collection contains a header entry for the provided header name.
   * @param name - The name of the header to set. This value is case-insensitive.
   */
  has(name) {
    return this._headersMap.has(normalizeName(name));
  }
  /**
   * Remove the header with the provided headerName.
   * @param name - The name of the header to remove.
   */
  delete(name) {
    this._headersMap.delete(normalizeName(name));
  }
  /**
   * Get the JSON object representation of this HTTP header collection.
   */
  toJSON(options = {}) {
    const result = {};
    if (options.preserveCase) {
      for (const entry of this._headersMap.values()) {
        result[entry.name] = entry.value;
      }
    } else {
      for (const [normalizedName, entry] of this._headersMap) {
        result[normalizedName] = entry.value;
      }
    }
    return result;
  }
  /**
   * Get the string representation of this HTTP header collection.
   */
  toString() {
    return JSON.stringify(this.toJSON({ preserveCase: true }));
  }
  /**
   * Iterate over tuples of header [name, value] pairs.
   */
  [Symbol.iterator]() {
    return headerIterator(this._headersMap);
  }
};
function createHttpHeaders(rawHeaders) {
  return new HttpHeadersImpl(rawHeaders);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/uuidUtils.js
import { randomUUID as v4RandomUUID } from "crypto";
var _a;
var uuidFunction = typeof ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === "function" ? globalThis.crypto.randomUUID.bind(globalThis.crypto) : v4RandomUUID;
function randomUUID() {
  return uuidFunction();
}

// node_modules/@typespec/ts-http-runtime/dist/esm/pipelineRequest.js
var PipelineRequestImpl = class {
  constructor(options) {
    var _a3, _b2, _c2, _d2, _e, _f, _g;
    this.url = options.url;
    this.body = options.body;
    this.headers = (_a3 = options.headers) !== null && _a3 !== void 0 ? _a3 : createHttpHeaders();
    this.method = (_b2 = options.method) !== null && _b2 !== void 0 ? _b2 : "GET";
    this.timeout = (_c2 = options.timeout) !== null && _c2 !== void 0 ? _c2 : 0;
    this.multipartBody = options.multipartBody;
    this.formData = options.formData;
    this.disableKeepAlive = (_d2 = options.disableKeepAlive) !== null && _d2 !== void 0 ? _d2 : false;
    this.proxySettings = options.proxySettings;
    this.streamResponseStatusCodes = options.streamResponseStatusCodes;
    this.withCredentials = (_e = options.withCredentials) !== null && _e !== void 0 ? _e : false;
    this.abortSignal = options.abortSignal;
    this.onUploadProgress = options.onUploadProgress;
    this.onDownloadProgress = options.onDownloadProgress;
    this.requestId = options.requestId || randomUUID();
    this.allowInsecureConnection = (_f = options.allowInsecureConnection) !== null && _f !== void 0 ? _f : false;
    this.enableBrowserStreams = (_g = options.enableBrowserStreams) !== null && _g !== void 0 ? _g : false;
    this.requestOverrides = options.requestOverrides;
  }
};
function createPipelineRequest(options) {
  return new PipelineRequestImpl(options);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/pipeline.js
var ValidPhaseNames = /* @__PURE__ */ new Set(["Deserialize", "Serialize", "Retry", "Sign"]);
var HttpPipeline = class _HttpPipeline {
  constructor(policies) {
    var _a3;
    this._policies = [];
    this._policies = (_a3 = policies === null || policies === void 0 ? void 0 : policies.slice(0)) !== null && _a3 !== void 0 ? _a3 : [];
    this._orderedPolicies = void 0;
  }
  addPolicy(policy, options = {}) {
    if (options.phase && options.afterPhase) {
      throw new Error("Policies inside a phase cannot specify afterPhase.");
    }
    if (options.phase && !ValidPhaseNames.has(options.phase)) {
      throw new Error(`Invalid phase name: ${options.phase}`);
    }
    if (options.afterPhase && !ValidPhaseNames.has(options.afterPhase)) {
      throw new Error(`Invalid afterPhase name: ${options.afterPhase}`);
    }
    this._policies.push({
      policy,
      options
    });
    this._orderedPolicies = void 0;
  }
  removePolicy(options) {
    const removedPolicies = [];
    this._policies = this._policies.filter((policyDescriptor) => {
      if (options.name && policyDescriptor.policy.name === options.name || options.phase && policyDescriptor.options.phase === options.phase) {
        removedPolicies.push(policyDescriptor.policy);
        return false;
      } else {
        return true;
      }
    });
    this._orderedPolicies = void 0;
    return removedPolicies;
  }
  sendRequest(httpClient, request3) {
    const policies = this.getOrderedPolicies();
    const pipeline = policies.reduceRight((next, policy) => {
      return (req) => {
        return policy.sendRequest(req, next);
      };
    }, (req) => httpClient.sendRequest(req));
    return pipeline(request3);
  }
  getOrderedPolicies() {
    if (!this._orderedPolicies) {
      this._orderedPolicies = this.orderPolicies();
    }
    return this._orderedPolicies;
  }
  clone() {
    return new _HttpPipeline(this._policies);
  }
  static create() {
    return new _HttpPipeline();
  }
  orderPolicies() {
    const result = [];
    const policyMap = /* @__PURE__ */ new Map();
    function createPhase(name) {
      return {
        name,
        policies: /* @__PURE__ */ new Set(),
        hasRun: false,
        hasAfterPolicies: false
      };
    }
    const serializePhase = createPhase("Serialize");
    const noPhase = createPhase("None");
    const deserializePhase = createPhase("Deserialize");
    const retryPhase = createPhase("Retry");
    const signPhase = createPhase("Sign");
    const orderedPhases = [serializePhase, noPhase, deserializePhase, retryPhase, signPhase];
    function getPhase(phase) {
      if (phase === "Retry") {
        return retryPhase;
      } else if (phase === "Serialize") {
        return serializePhase;
      } else if (phase === "Deserialize") {
        return deserializePhase;
      } else if (phase === "Sign") {
        return signPhase;
      } else {
        return noPhase;
      }
    }
    for (const descriptor of this._policies) {
      const policy = descriptor.policy;
      const options = descriptor.options;
      const policyName = policy.name;
      if (policyMap.has(policyName)) {
        throw new Error("Duplicate policy names not allowed in pipeline");
      }
      const node = {
        policy,
        dependsOn: /* @__PURE__ */ new Set(),
        dependants: /* @__PURE__ */ new Set()
      };
      if (options.afterPhase) {
        node.afterPhase = getPhase(options.afterPhase);
        node.afterPhase.hasAfterPolicies = true;
      }
      policyMap.set(policyName, node);
      const phase = getPhase(options.phase);
      phase.policies.add(node);
    }
    for (const descriptor of this._policies) {
      const { policy, options } = descriptor;
      const policyName = policy.name;
      const node = policyMap.get(policyName);
      if (!node) {
        throw new Error(`Missing node for policy ${policyName}`);
      }
      if (options.afterPolicies) {
        for (const afterPolicyName of options.afterPolicies) {
          const afterNode = policyMap.get(afterPolicyName);
          if (afterNode) {
            node.dependsOn.add(afterNode);
            afterNode.dependants.add(node);
          }
        }
      }
      if (options.beforePolicies) {
        for (const beforePolicyName of options.beforePolicies) {
          const beforeNode = policyMap.get(beforePolicyName);
          if (beforeNode) {
            beforeNode.dependsOn.add(node);
            node.dependants.add(beforeNode);
          }
        }
      }
    }
    function walkPhase(phase) {
      phase.hasRun = true;
      for (const node of phase.policies) {
        if (node.afterPhase && (!node.afterPhase.hasRun || node.afterPhase.policies.size)) {
          continue;
        }
        if (node.dependsOn.size === 0) {
          result.push(node.policy);
          for (const dependant of node.dependants) {
            dependant.dependsOn.delete(node);
          }
          policyMap.delete(node.policy.name);
          phase.policies.delete(node);
        }
      }
    }
    function walkPhases() {
      for (const phase of orderedPhases) {
        walkPhase(phase);
        if (phase.policies.size > 0 && phase !== noPhase) {
          if (!noPhase.hasRun) {
            walkPhase(noPhase);
          }
          return;
        }
        if (phase.hasAfterPolicies) {
          walkPhase(noPhase);
        }
      }
    }
    let iteration = 0;
    while (policyMap.size > 0) {
      iteration++;
      const initialResultLength = result.length;
      walkPhases();
      if (result.length <= initialResultLength && iteration > 1) {
        throw new Error("Cannot satisfy policy dependencies due to requirements cycle.");
      }
    }
    return result;
  }
};
function createEmptyPipeline() {
  return HttpPipeline.create();
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/object.js
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input) && !(input instanceof RegExp) && !(input instanceof Date);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/error.js
function isError(e) {
  if (isObject(e)) {
    const hasName = typeof e.name === "string";
    const hasMessage = typeof e.message === "string";
    return hasName && hasMessage;
  }
  return false;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/inspect.js
import { inspect } from "util";
var custom = inspect.custom;

// node_modules/@typespec/ts-http-runtime/dist/esm/util/sanitizer.js
var RedactedString = "REDACTED";
var defaultAllowedHeaderNames = [
  "x-ms-client-request-id",
  "x-ms-return-client-request-id",
  "x-ms-useragent",
  "x-ms-correlation-request-id",
  "x-ms-request-id",
  "client-request-id",
  "ms-cv",
  "return-client-request-id",
  "traceparent",
  "Access-Control-Allow-Credentials",
  "Access-Control-Allow-Headers",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Origin",
  "Access-Control-Expose-Headers",
  "Access-Control-Max-Age",
  "Access-Control-Request-Headers",
  "Access-Control-Request-Method",
  "Origin",
  "Accept",
  "Accept-Encoding",
  "Cache-Control",
  "Connection",
  "Content-Length",
  "Content-Type",
  "Date",
  "ETag",
  "Expires",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Unmodified-Since",
  "Last-Modified",
  "Pragma",
  "Request-Id",
  "Retry-After",
  "Server",
  "Transfer-Encoding",
  "User-Agent",
  "WWW-Authenticate"
];
var defaultAllowedQueryParameters = ["api-version"];
var Sanitizer = class {
  constructor({ additionalAllowedHeaderNames: allowedHeaderNames = [], additionalAllowedQueryParameters: allowedQueryParameters = [] } = {}) {
    allowedHeaderNames = defaultAllowedHeaderNames.concat(allowedHeaderNames);
    allowedQueryParameters = defaultAllowedQueryParameters.concat(allowedQueryParameters);
    this.allowedHeaderNames = new Set(allowedHeaderNames.map((n) => n.toLowerCase()));
    this.allowedQueryParameters = new Set(allowedQueryParameters.map((p) => p.toLowerCase()));
  }
  /**
   * Sanitizes an object for logging.
   * @param obj - The object to sanitize
   * @returns - The sanitized object as a string
   */
  sanitize(obj) {
    const seen = /* @__PURE__ */ new Set();
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Error) {
        return Object.assign(Object.assign({}, value), { name: value.name, message: value.message });
      }
      if (key === "headers") {
        return this.sanitizeHeaders(value);
      } else if (key === "url") {
        return this.sanitizeUrl(value);
      } else if (key === "query") {
        return this.sanitizeQuery(value);
      } else if (key === "body") {
        return void 0;
      } else if (key === "response") {
        return void 0;
      } else if (key === "operationSpec") {
        return void 0;
      } else if (Array.isArray(value) || isObject(value)) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  }
  /**
   * Sanitizes a URL for logging.
   * @param value - The URL to sanitize
   * @returns - The sanitized URL as a string
   */
  sanitizeUrl(value) {
    if (typeof value !== "string" || value === null || value === "") {
      return value;
    }
    const url = new URL(value);
    if (!url.search) {
      return value;
    }
    for (const [key] of url.searchParams) {
      if (!this.allowedQueryParameters.has(key.toLowerCase())) {
        url.searchParams.set(key, RedactedString);
      }
    }
    return url.toString();
  }
  sanitizeHeaders(obj) {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      if (this.allowedHeaderNames.has(key.toLowerCase())) {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = RedactedString;
      }
    }
    return sanitized;
  }
  sanitizeQuery(value) {
    if (typeof value !== "object" || value === null) {
      return value;
    }
    const sanitized = {};
    for (const k of Object.keys(value)) {
      if (this.allowedQueryParameters.has(k.toLowerCase())) {
        sanitized[k] = value[k];
      } else {
        sanitized[k] = RedactedString;
      }
    }
    return sanitized;
  }
};

// node_modules/@typespec/ts-http-runtime/dist/esm/restError.js
var errorSanitizer = new Sanitizer();
var RestError = class _RestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "RestError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    Object.defineProperty(this, "request", { value: options.request, enumerable: false });
    Object.defineProperty(this, "response", { value: options.response, enumerable: false });
    Object.defineProperty(this, custom, {
      value: () => {
        return `RestError: ${this.message} 
 ${errorSanitizer.sanitize(Object.assign(Object.assign({}, this), { request: this.request, response: this.response }))}`;
      },
      enumerable: false
    });
    Object.setPrototypeOf(this, _RestError.prototype);
  }
};
RestError.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
RestError.PARSE_ERROR = "PARSE_ERROR";
function isRestError(e) {
  if (e instanceof RestError) {
    return true;
  }
  return isError(e) && e.name === "RestError";
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/bytesEncoding.js
function uint8ArrayToString(bytes, format) {
  return Buffer.from(bytes).toString(format);
}
function stringToUint8Array(value, format) {
  return Buffer.from(value, format);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/nodeHttpClient.js
import * as http from "http";
import * as https from "https";
import * as zlib from "zlib";
import { Transform } from "stream";

// node_modules/@typespec/ts-http-runtime/dist/esm/log.js
var logger = createClientLogger("ts-http-runtime");

// node_modules/@typespec/ts-http-runtime/dist/esm/nodeHttpClient.js
var DEFAULT_TLS_SETTINGS = {};
function isReadableStream(body) {
  return body && typeof body.pipe === "function";
}
function isStreamComplete(stream) {
  if (stream.readable === false) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const handler = () => {
      resolve();
      stream.removeListener("close", handler);
      stream.removeListener("end", handler);
      stream.removeListener("error", handler);
    };
    stream.on("close", handler);
    stream.on("end", handler);
    stream.on("error", handler);
  });
}
function isArrayBuffer(body) {
  return body && typeof body.byteLength === "number";
}
var ReportTransform = class extends Transform {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  _transform(chunk, _encoding, callback) {
    this.push(chunk);
    this.loadedBytes += chunk.length;
    try {
      this.progressCallback({ loadedBytes: this.loadedBytes });
      callback();
    } catch (e) {
      callback(e);
    }
  }
  constructor(progressCallback) {
    super();
    this.loadedBytes = 0;
    this.progressCallback = progressCallback;
  }
};
var NodeHttpClient = class {
  constructor() {
    this.cachedHttpsAgents = /* @__PURE__ */ new WeakMap();
  }
  /**
   * Makes a request over an underlying transport layer and returns the response.
   * @param request - The request to be made.
   */
  async sendRequest(request3) {
    var _a3, _b2, _c2;
    const abortController = new AbortController();
    let abortListener;
    if (request3.abortSignal) {
      if (request3.abortSignal.aborted) {
        throw new AbortError("The operation was aborted. Request has already been canceled.");
      }
      abortListener = (event) => {
        if (event.type === "abort") {
          abortController.abort();
        }
      };
      request3.abortSignal.addEventListener("abort", abortListener);
    }
    let timeoutId;
    if (request3.timeout > 0) {
      timeoutId = setTimeout(() => {
        const sanitizer = new Sanitizer();
        logger.info(`request to '${sanitizer.sanitizeUrl(request3.url)}' timed out. canceling...`);
        abortController.abort();
      }, request3.timeout);
    }
    const acceptEncoding = request3.headers.get("Accept-Encoding");
    const shouldDecompress = (acceptEncoding === null || acceptEncoding === void 0 ? void 0 : acceptEncoding.includes("gzip")) || (acceptEncoding === null || acceptEncoding === void 0 ? void 0 : acceptEncoding.includes("deflate"));
    let body = typeof request3.body === "function" ? request3.body() : request3.body;
    if (body && !request3.headers.has("Content-Length")) {
      const bodyLength = getBodyLength(body);
      if (bodyLength !== null) {
        request3.headers.set("Content-Length", bodyLength);
      }
    }
    let responseStream;
    try {
      if (body && request3.onUploadProgress) {
        const onUploadProgress = request3.onUploadProgress;
        const uploadReportStream = new ReportTransform(onUploadProgress);
        uploadReportStream.on("error", (e) => {
          logger.error("Error in upload progress", e);
        });
        if (isReadableStream(body)) {
          body.pipe(uploadReportStream);
        } else {
          uploadReportStream.end(body);
        }
        body = uploadReportStream;
      }
      const res = await this.makeRequest(request3, abortController, body);
      if (timeoutId !== void 0) {
        clearTimeout(timeoutId);
      }
      const headers = getResponseHeaders(res);
      const status = (_a3 = res.statusCode) !== null && _a3 !== void 0 ? _a3 : 0;
      const response = {
        status,
        headers,
        request: request3
      };
      if (request3.method === "HEAD") {
        res.resume();
        return response;
      }
      responseStream = shouldDecompress ? getDecodedResponseStream(res, headers) : res;
      const onDownloadProgress = request3.onDownloadProgress;
      if (onDownloadProgress) {
        const downloadReportStream = new ReportTransform(onDownloadProgress);
        downloadReportStream.on("error", (e) => {
          logger.error("Error in download progress", e);
        });
        responseStream.pipe(downloadReportStream);
        responseStream = downloadReportStream;
      }
      if (
        // Value of POSITIVE_INFINITY in streamResponseStatusCodes is considered as any status code
        ((_b2 = request3.streamResponseStatusCodes) === null || _b2 === void 0 ? void 0 : _b2.has(Number.POSITIVE_INFINITY)) || ((_c2 = request3.streamResponseStatusCodes) === null || _c2 === void 0 ? void 0 : _c2.has(response.status))
      ) {
        response.readableStreamBody = responseStream;
      } else {
        response.bodyAsText = await streamToText(responseStream);
      }
      return response;
    } finally {
      if (request3.abortSignal && abortListener) {
        let uploadStreamDone = Promise.resolve();
        if (isReadableStream(body)) {
          uploadStreamDone = isStreamComplete(body);
        }
        let downloadStreamDone = Promise.resolve();
        if (isReadableStream(responseStream)) {
          downloadStreamDone = isStreamComplete(responseStream);
        }
        Promise.all([uploadStreamDone, downloadStreamDone]).then(() => {
          var _a4;
          if (abortListener) {
            (_a4 = request3.abortSignal) === null || _a4 === void 0 ? void 0 : _a4.removeEventListener("abort", abortListener);
          }
        }).catch((e) => {
          logger.warning("Error when cleaning up abortListener on httpRequest", e);
        });
      }
    }
  }
  makeRequest(request3, abortController, body) {
    var _a3;
    const url = new URL(request3.url);
    const isInsecure = url.protocol !== "https:";
    if (isInsecure && !request3.allowInsecureConnection) {
      throw new Error(`Cannot connect to ${request3.url} while allowInsecureConnection is false.`);
    }
    const agent = (_a3 = request3.agent) !== null && _a3 !== void 0 ? _a3 : this.getOrCreateAgent(request3, isInsecure);
    const options = Object.assign({ agent, hostname: url.hostname, path: `${url.pathname}${url.search}`, port: url.port, method: request3.method, headers: request3.headers.toJSON({ preserveCase: true }) }, request3.requestOverrides);
    return new Promise((resolve, reject) => {
      const req = isInsecure ? http.request(options, resolve) : https.request(options, resolve);
      req.once("error", (err) => {
        var _a4;
        reject(new RestError(err.message, { code: (_a4 = err.code) !== null && _a4 !== void 0 ? _a4 : RestError.REQUEST_SEND_ERROR, request: request3 }));
      });
      abortController.signal.addEventListener("abort", () => {
        const abortError = new AbortError("The operation was aborted. Rejecting from abort signal callback while making request.");
        req.destroy(abortError);
        reject(abortError);
      });
      if (body && isReadableStream(body)) {
        body.pipe(req);
      } else if (body) {
        if (typeof body === "string" || Buffer.isBuffer(body)) {
          req.end(body);
        } else if (isArrayBuffer(body)) {
          req.end(ArrayBuffer.isView(body) ? Buffer.from(body.buffer) : Buffer.from(body));
        } else {
          logger.error("Unrecognized body type", body);
          reject(new RestError("Unrecognized body type"));
        }
      } else {
        req.end();
      }
    });
  }
  getOrCreateAgent(request3, isInsecure) {
    var _a3;
    const disableKeepAlive = request3.disableKeepAlive;
    if (isInsecure) {
      if (disableKeepAlive) {
        return http.globalAgent;
      }
      if (!this.cachedHttpAgent) {
        this.cachedHttpAgent = new http.Agent({ keepAlive: true });
      }
      return this.cachedHttpAgent;
    } else {
      if (disableKeepAlive && !request3.tlsSettings) {
        return https.globalAgent;
      }
      const tlsSettings = (_a3 = request3.tlsSettings) !== null && _a3 !== void 0 ? _a3 : DEFAULT_TLS_SETTINGS;
      let agent = this.cachedHttpsAgents.get(tlsSettings);
      if (agent && agent.options.keepAlive === !disableKeepAlive) {
        return agent;
      }
      logger.info("No cached TLS Agent exist, creating a new Agent");
      agent = new https.Agent(Object.assign({
        // keepAlive is true if disableKeepAlive is false.
        keepAlive: !disableKeepAlive
      }, tlsSettings));
      this.cachedHttpsAgents.set(tlsSettings, agent);
      return agent;
    }
  }
};
function getResponseHeaders(res) {
  const headers = createHttpHeaders();
  for (const header of Object.keys(res.headers)) {
    const value = res.headers[header];
    if (Array.isArray(value)) {
      if (value.length > 0) {
        headers.set(header, value[0]);
      }
    } else if (value) {
      headers.set(header, value);
    }
  }
  return headers;
}
function getDecodedResponseStream(stream, headers) {
  const contentEncoding = headers.get("Content-Encoding");
  if (contentEncoding === "gzip") {
    const unzip = zlib.createGunzip();
    stream.pipe(unzip);
    return unzip;
  } else if (contentEncoding === "deflate") {
    const inflate = zlib.createInflate();
    stream.pipe(inflate);
    return inflate;
  }
  return stream;
}
function streamToText(stream) {
  return new Promise((resolve, reject) => {
    const buffer = [];
    stream.on("data", (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        buffer.push(chunk);
      } else {
        buffer.push(Buffer.from(chunk));
      }
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffer).toString("utf8"));
    });
    stream.on("error", (e) => {
      if (e && (e === null || e === void 0 ? void 0 : e.name) === "AbortError") {
        reject(e);
      } else {
        reject(new RestError(`Error reading response as text: ${e.message}`, {
          code: RestError.PARSE_ERROR
        }));
      }
    });
  });
}
function getBodyLength(body) {
  if (!body) {
    return 0;
  } else if (Buffer.isBuffer(body)) {
    return body.length;
  } else if (isReadableStream(body)) {
    return null;
  } else if (isArrayBuffer(body)) {
    return body.byteLength;
  } else if (typeof body === "string") {
    return Buffer.from(body).length;
  } else {
    return null;
  }
}
function createNodeHttpClient() {
  return new NodeHttpClient();
}

// node_modules/@typespec/ts-http-runtime/dist/esm/defaultHttpClient.js
function createDefaultHttpClient() {
  return createNodeHttpClient();
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/logPolicy.js
var logPolicyName = "logPolicy";
function logPolicy(options = {}) {
  var _a3;
  const logger4 = (_a3 = options.logger) !== null && _a3 !== void 0 ? _a3 : logger.info;
  const sanitizer = new Sanitizer({
    additionalAllowedHeaderNames: options.additionalAllowedHeaderNames,
    additionalAllowedQueryParameters: options.additionalAllowedQueryParameters
  });
  return {
    name: logPolicyName,
    async sendRequest(request3, next) {
      if (!logger4.enabled) {
        return next(request3);
      }
      logger4(`Request: ${sanitizer.sanitize(request3)}`);
      const response = await next(request3);
      logger4(`Response status code: ${response.status}`);
      logger4(`Headers: ${sanitizer.sanitize(response.headers)}`);
      return response;
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/redirectPolicy.js
var redirectPolicyName = "redirectPolicy";
var allowedRedirect = ["GET", "HEAD"];
function redirectPolicy(options = {}) {
  const { maxRetries = 20 } = options;
  return {
    name: redirectPolicyName,
    async sendRequest(request3, next) {
      const response = await next(request3);
      return handleRedirect(next, response, maxRetries);
    }
  };
}
async function handleRedirect(next, response, maxRetries, currentRetries = 0) {
  const { request: request3, status, headers } = response;
  const locationHeader = headers.get("location");
  if (locationHeader && (status === 300 || status === 301 && allowedRedirect.includes(request3.method) || status === 302 && allowedRedirect.includes(request3.method) || status === 303 && request3.method === "POST" || status === 307) && currentRetries < maxRetries) {
    const url = new URL(locationHeader, request3.url);
    request3.url = url.toString();
    if (status === 303) {
      request3.method = "GET";
      request3.headers.delete("Content-Length");
      delete request3.body;
    }
    request3.headers.delete("Authorization");
    const res = await next(request3);
    return handleRedirect(next, res, maxRetries, currentRetries + 1);
  }
  return response;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/userAgentPlatform.js
import * as os from "os";
import * as process3 from "process";
function getHeaderName() {
  return "User-Agent";
}
async function setPlatformSpecificData(map) {
  if (process3 && process3.versions) {
    const versions3 = process3.versions;
    if (versions3.bun) {
      map.set("Bun", versions3.bun);
    } else if (versions3.deno) {
      map.set("Deno", versions3.deno);
    } else if (versions3.node) {
      map.set("Node", versions3.node);
    }
  }
  map.set("OS", `(${os.arch()}-${os.type()}-${os.release()})`);
}

// node_modules/@typespec/ts-http-runtime/dist/esm/constants.js
var SDK_VERSION = "0.2.2";
var DEFAULT_RETRY_POLICY_COUNT = 3;

// node_modules/@typespec/ts-http-runtime/dist/esm/util/userAgent.js
function getUserAgentString(telemetryInfo) {
  const parts = [];
  for (const [key, value] of telemetryInfo) {
    const token = value ? `${key}/${value}` : key;
    parts.push(token);
  }
  return parts.join(" ");
}
function getUserAgentHeaderName() {
  return getHeaderName();
}
async function getUserAgentValue(prefix) {
  const runtimeInfo = /* @__PURE__ */ new Map();
  runtimeInfo.set("ts-http-runtime", SDK_VERSION);
  await setPlatformSpecificData(runtimeInfo);
  const defaultAgent = getUserAgentString(runtimeInfo);
  const userAgentValue = prefix ? `${prefix} ${defaultAgent}` : defaultAgent;
  return userAgentValue;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/userAgentPolicy.js
var UserAgentHeaderName = getUserAgentHeaderName();
var userAgentPolicyName = "userAgentPolicy";
function userAgentPolicy(options = {}) {
  const userAgentValue = getUserAgentValue(options.userAgentPrefix);
  return {
    name: userAgentPolicyName,
    async sendRequest(request3, next) {
      if (!request3.headers.has(UserAgentHeaderName)) {
        request3.headers.set(UserAgentHeaderName, await userAgentValue);
      }
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/decompressResponsePolicy.js
var decompressResponsePolicyName = "decompressResponsePolicy";
function decompressResponsePolicy() {
  return {
    name: decompressResponsePolicyName,
    async sendRequest(request3, next) {
      if (request3.method !== "HEAD") {
        request3.headers.set("Accept-Encoding", "gzip,deflate");
      }
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/random.js
function getRandomIntegerInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const offset = Math.floor(Math.random() * (max - min + 1));
  return offset + min;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/delay.js
function calculateRetryDelay(retryAttempt, config) {
  const exponentialDelay = config.retryDelayInMs * Math.pow(2, retryAttempt);
  const clampedDelay = Math.min(config.maxRetryDelayInMs, exponentialDelay);
  const retryAfterInMs = clampedDelay / 2 + getRandomIntegerInclusive(0, clampedDelay / 2);
  return { retryAfterInMs };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/helpers.js
var StandardAbortMessage = "The operation was aborted.";
function delay(delayInMs, value, options) {
  return new Promise((resolve, reject) => {
    let timer = void 0;
    let onAborted = void 0;
    const rejectOnAbort = () => {
      return reject(new AbortError((options === null || options === void 0 ? void 0 : options.abortErrorMsg) ? options === null || options === void 0 ? void 0 : options.abortErrorMsg : StandardAbortMessage));
    };
    const removeListeners = () => {
      if ((options === null || options === void 0 ? void 0 : options.abortSignal) && onAborted) {
        options.abortSignal.removeEventListener("abort", onAborted);
      }
    };
    onAborted = () => {
      if (timer) {
        clearTimeout(timer);
      }
      removeListeners();
      return rejectOnAbort();
    };
    if ((options === null || options === void 0 ? void 0 : options.abortSignal) && options.abortSignal.aborted) {
      return rejectOnAbort();
    }
    timer = setTimeout(() => {
      removeListeners();
      resolve(value);
    }, delayInMs);
    if (options === null || options === void 0 ? void 0 : options.abortSignal) {
      options.abortSignal.addEventListener("abort", onAborted);
    }
  });
}
function parseHeaderValueAsNumber(response, headerName) {
  const value = response.headers.get(headerName);
  if (!value)
    return;
  const valueAsNum = Number(value);
  if (Number.isNaN(valueAsNum))
    return;
  return valueAsNum;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/retryStrategies/throttlingRetryStrategy.js
var RetryAfterHeader = "Retry-After";
var AllRetryAfterHeaders = ["retry-after-ms", "x-ms-retry-after-ms", RetryAfterHeader];
function getRetryAfterInMs(response) {
  if (!(response && [429, 503].includes(response.status)))
    return void 0;
  try {
    for (const header of AllRetryAfterHeaders) {
      const retryAfterValue = parseHeaderValueAsNumber(response, header);
      if (retryAfterValue === 0 || retryAfterValue) {
        const multiplyingFactor = header === RetryAfterHeader ? 1e3 : 1;
        return retryAfterValue * multiplyingFactor;
      }
    }
    const retryAfterHeader = response.headers.get(RetryAfterHeader);
    if (!retryAfterHeader)
      return;
    const date = Date.parse(retryAfterHeader);
    const diff = date - Date.now();
    return Number.isFinite(diff) ? Math.max(0, diff) : void 0;
  } catch (_a3) {
    return void 0;
  }
}
function isThrottlingRetryResponse(response) {
  return Number.isFinite(getRetryAfterInMs(response));
}
function throttlingRetryStrategy() {
  return {
    name: "throttlingRetryStrategy",
    retry({ response }) {
      const retryAfterInMs = getRetryAfterInMs(response);
      if (!Number.isFinite(retryAfterInMs)) {
        return { skipStrategy: true };
      }
      return {
        retryAfterInMs
      };
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/retryStrategies/exponentialRetryStrategy.js
var DEFAULT_CLIENT_RETRY_INTERVAL = 1e3;
var DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1e3 * 64;
function exponentialRetryStrategy(options = {}) {
  var _a3, _b2;
  const retryInterval = (_a3 = options.retryDelayInMs) !== null && _a3 !== void 0 ? _a3 : DEFAULT_CLIENT_RETRY_INTERVAL;
  const maxRetryInterval = (_b2 = options.maxRetryDelayInMs) !== null && _b2 !== void 0 ? _b2 : DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
  return {
    name: "exponentialRetryStrategy",
    retry({ retryCount, response, responseError }) {
      const matchedSystemError = isSystemError(responseError);
      const ignoreSystemErrors = matchedSystemError && options.ignoreSystemErrors;
      const isExponential = isExponentialRetryResponse(response);
      const ignoreExponentialResponse = isExponential && options.ignoreHttpStatusCodes;
      const unknownResponse = response && (isThrottlingRetryResponse(response) || !isExponential);
      if (unknownResponse || ignoreExponentialResponse || ignoreSystemErrors) {
        return { skipStrategy: true };
      }
      if (responseError && !matchedSystemError && !isExponential) {
        return { errorToThrow: responseError };
      }
      return calculateRetryDelay(retryCount, {
        retryDelayInMs: retryInterval,
        maxRetryDelayInMs: maxRetryInterval
      });
    }
  };
}
function isExponentialRetryResponse(response) {
  return Boolean(response && response.status !== void 0 && (response.status >= 500 || response.status === 408) && response.status !== 501 && response.status !== 505);
}
function isSystemError(err) {
  if (!err) {
    return false;
  }
  return err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "ENOENT" || err.code === "ENOTFOUND";
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/retryPolicy.js
var retryPolicyLogger = createClientLogger("ts-http-runtime retryPolicy");
var retryPolicyName = "retryPolicy";
function retryPolicy(strategies, options = { maxRetries: DEFAULT_RETRY_POLICY_COUNT }) {
  const logger4 = options.logger || retryPolicyLogger;
  return {
    name: retryPolicyName,
    async sendRequest(request3, next) {
      var _a3, _b2;
      let response;
      let responseError;
      let retryCount = -1;
      retryRequest: while (true) {
        retryCount += 1;
        response = void 0;
        responseError = void 0;
        try {
          logger4.info(`Retry ${retryCount}: Attempting to send request`, request3.requestId);
          response = await next(request3);
          logger4.info(`Retry ${retryCount}: Received a response from request`, request3.requestId);
        } catch (e) {
          logger4.error(`Retry ${retryCount}: Received an error from request`, request3.requestId);
          responseError = e;
          if (!e || responseError.name !== "RestError") {
            throw e;
          }
          response = responseError.response;
        }
        if ((_a3 = request3.abortSignal) === null || _a3 === void 0 ? void 0 : _a3.aborted) {
          logger4.error(`Retry ${retryCount}: Request aborted.`);
          const abortError = new AbortError();
          throw abortError;
        }
        if (retryCount >= ((_b2 = options.maxRetries) !== null && _b2 !== void 0 ? _b2 : DEFAULT_RETRY_POLICY_COUNT)) {
          logger4.info(`Retry ${retryCount}: Maximum retries reached. Returning the last received response, or throwing the last received error.`);
          if (responseError) {
            throw responseError;
          } else if (response) {
            return response;
          } else {
            throw new Error("Maximum retries reached with no response or error to throw");
          }
        }
        logger4.info(`Retry ${retryCount}: Processing ${strategies.length} retry strategies.`);
        strategiesLoop: for (const strategy of strategies) {
          const strategyLogger = strategy.logger || logger4;
          strategyLogger.info(`Retry ${retryCount}: Processing retry strategy ${strategy.name}.`);
          const modifiers = strategy.retry({
            retryCount,
            response,
            responseError
          });
          if (modifiers.skipStrategy) {
            strategyLogger.info(`Retry ${retryCount}: Skipped.`);
            continue strategiesLoop;
          }
          const { errorToThrow, retryAfterInMs, redirectTo } = modifiers;
          if (errorToThrow) {
            strategyLogger.error(`Retry ${retryCount}: Retry strategy ${strategy.name} throws error:`, errorToThrow);
            throw errorToThrow;
          }
          if (retryAfterInMs || retryAfterInMs === 0) {
            strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} retries after ${retryAfterInMs}`);
            await delay(retryAfterInMs, void 0, { abortSignal: request3.abortSignal });
            continue retryRequest;
          }
          if (redirectTo) {
            strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} redirects to ${redirectTo}`);
            request3.url = redirectTo;
            continue retryRequest;
          }
        }
        if (responseError) {
          logger4.info(`None of the retry strategies could work with the received error. Throwing it.`);
          throw responseError;
        }
        if (response) {
          logger4.info(`None of the retry strategies could work with the received response. Returning it.`);
          return response;
        }
      }
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/defaultRetryPolicy.js
var defaultRetryPolicyName = "defaultRetryPolicy";
function defaultRetryPolicy(options = {}) {
  var _a3;
  return {
    name: defaultRetryPolicyName,
    sendRequest: retryPolicy([throttlingRetryStrategy(), exponentialRetryStrategy(options)], {
      maxRetries: (_a3 = options.maxRetries) !== null && _a3 !== void 0 ? _a3 : DEFAULT_RETRY_POLICY_COUNT
    }).sendRequest
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/checkEnvironment.js
var _a2;
var _b;
var _c;
var _d;
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
var isWebWorker = typeof self === "object" && typeof (self === null || self === void 0 ? void 0 : self.importScripts) === "function" && (((_a2 = self.constructor) === null || _a2 === void 0 ? void 0 : _a2.name) === "DedicatedWorkerGlobalScope" || ((_b = self.constructor) === null || _b === void 0 ? void 0 : _b.name) === "ServiceWorkerGlobalScope" || ((_c = self.constructor) === null || _c === void 0 ? void 0 : _c.name) === "SharedWorkerGlobalScope");
var isDeno = typeof Deno !== "undefined" && typeof Deno.version !== "undefined" && typeof Deno.version.deno !== "undefined";
var isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
var isNodeLike = typeof globalThis.process !== "undefined" && Boolean(globalThis.process.version) && Boolean((_d = globalThis.process.versions) === null || _d === void 0 ? void 0 : _d.node);
var isReactNative = typeof navigator !== "undefined" && (navigator === null || navigator === void 0 ? void 0 : navigator.product) === "ReactNative";

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/formDataPolicy.js
var formDataPolicyName = "formDataPolicy";
function formDataToFormDataMap(formData) {
  var _a3;
  const formDataMap = {};
  for (const [key, value] of formData.entries()) {
    (_a3 = formDataMap[key]) !== null && _a3 !== void 0 ? _a3 : formDataMap[key] = [];
    formDataMap[key].push(value);
  }
  return formDataMap;
}
function formDataPolicy() {
  return {
    name: formDataPolicyName,
    async sendRequest(request3, next) {
      if (isNodeLike && typeof FormData !== "undefined" && request3.body instanceof FormData) {
        request3.formData = formDataToFormDataMap(request3.body);
        request3.body = void 0;
      }
      if (request3.formData) {
        const contentType = request3.headers.get("Content-Type");
        if (contentType && contentType.indexOf("application/x-www-form-urlencoded") !== -1) {
          request3.body = wwwFormUrlEncode(request3.formData);
        } else {
          await prepareFormData(request3.formData, request3);
        }
        request3.formData = void 0;
      }
      return next(request3);
    }
  };
}
function wwwFormUrlEncode(formData) {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        urlSearchParams.append(key, subValue.toString());
      }
    } else {
      urlSearchParams.append(key, value.toString());
    }
  }
  return urlSearchParams.toString();
}
async function prepareFormData(formData, request3) {
  const contentType = request3.headers.get("Content-Type");
  if (contentType && !contentType.startsWith("multipart/form-data")) {
    return;
  }
  request3.headers.set("Content-Type", contentType !== null && contentType !== void 0 ? contentType : "multipart/form-data");
  const parts = [];
  for (const [fieldName, values] of Object.entries(formData)) {
    for (const value of Array.isArray(values) ? values : [values]) {
      if (typeof value === "string") {
        parts.push({
          headers: createHttpHeaders({
            "Content-Disposition": `form-data; name="${fieldName}"`
          }),
          body: stringToUint8Array(value, "utf-8")
        });
      } else if (value === void 0 || value === null || typeof value !== "object") {
        throw new Error(`Unexpected value for key ${fieldName}: ${value}. Value should be serialized to string first.`);
      } else {
        const fileName = value.name || "blob";
        const headers = createHttpHeaders();
        headers.set("Content-Disposition", `form-data; name="${fieldName}"; filename="${fileName}"`);
        headers.set("Content-Type", value.type || "application/octet-stream");
        parts.push({
          headers,
          body: value
        });
      }
    }
  }
  request3.multipartBody = { parts };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/proxyPolicy.js
var import_https_proxy_agent = __toESM(require_dist2(), 1);
var import_http_proxy_agent = __toESM(require_dist3(), 1);
var HTTPS_PROXY = "HTTPS_PROXY";
var HTTP_PROXY = "HTTP_PROXY";
var ALL_PROXY = "ALL_PROXY";
var NO_PROXY = "NO_PROXY";
var proxyPolicyName = "proxyPolicy";
var globalNoProxyList = [];
var noProxyListLoaded = false;
var globalBypassedMap = /* @__PURE__ */ new Map();
function getEnvironmentValue(name) {
  if (process.env[name]) {
    return process.env[name];
  } else if (process.env[name.toLowerCase()]) {
    return process.env[name.toLowerCase()];
  }
  return void 0;
}
function loadEnvironmentProxyValue() {
  if (!process) {
    return void 0;
  }
  const httpsProxy = getEnvironmentValue(HTTPS_PROXY);
  const allProxy = getEnvironmentValue(ALL_PROXY);
  const httpProxy = getEnvironmentValue(HTTP_PROXY);
  return httpsProxy || allProxy || httpProxy;
}
function isBypassed(uri, noProxyList, bypassedMap) {
  if (noProxyList.length === 0) {
    return false;
  }
  const host = new URL(uri).hostname;
  if (bypassedMap === null || bypassedMap === void 0 ? void 0 : bypassedMap.has(host)) {
    return bypassedMap.get(host);
  }
  let isBypassedFlag = false;
  for (const pattern of noProxyList) {
    if (pattern[0] === ".") {
      if (host.endsWith(pattern)) {
        isBypassedFlag = true;
      } else {
        if (host.length === pattern.length - 1 && host === pattern.slice(1)) {
          isBypassedFlag = true;
        }
      }
    } else {
      if (host === pattern) {
        isBypassedFlag = true;
      }
    }
  }
  bypassedMap === null || bypassedMap === void 0 ? void 0 : bypassedMap.set(host, isBypassedFlag);
  return isBypassedFlag;
}
function loadNoProxy() {
  const noProxy = getEnvironmentValue(NO_PROXY);
  noProxyListLoaded = true;
  if (noProxy) {
    return noProxy.split(",").map((item) => item.trim()).filter((item) => item.length);
  }
  return [];
}
function getDefaultProxySettingsInternal() {
  const envProxy = loadEnvironmentProxyValue();
  return envProxy ? new URL(envProxy) : void 0;
}
function getUrlFromProxySettings(settings) {
  let parsedProxyUrl;
  try {
    parsedProxyUrl = new URL(settings.host);
  } catch (_a3) {
    throw new Error(`Expecting a valid host string in proxy settings, but found "${settings.host}".`);
  }
  parsedProxyUrl.port = String(settings.port);
  if (settings.username) {
    parsedProxyUrl.username = settings.username;
  }
  if (settings.password) {
    parsedProxyUrl.password = settings.password;
  }
  return parsedProxyUrl;
}
function setProxyAgentOnRequest(request3, cachedAgents, proxyUrl) {
  if (request3.agent) {
    return;
  }
  const url = new URL(request3.url);
  const isInsecure = url.protocol !== "https:";
  if (request3.tlsSettings) {
    logger.warning("TLS settings are not supported in combination with custom Proxy, certificates provided to the client will be ignored.");
  }
  const headers = request3.headers.toJSON();
  if (isInsecure) {
    if (!cachedAgents.httpProxyAgent) {
      cachedAgents.httpProxyAgent = new import_http_proxy_agent.HttpProxyAgent(proxyUrl, { headers });
    }
    request3.agent = cachedAgents.httpProxyAgent;
  } else {
    if (!cachedAgents.httpsProxyAgent) {
      cachedAgents.httpsProxyAgent = new import_https_proxy_agent.HttpsProxyAgent(proxyUrl, { headers });
    }
    request3.agent = cachedAgents.httpsProxyAgent;
  }
}
function proxyPolicy(proxySettings, options) {
  if (!noProxyListLoaded) {
    globalNoProxyList.push(...loadNoProxy());
  }
  const defaultProxy = proxySettings ? getUrlFromProxySettings(proxySettings) : getDefaultProxySettingsInternal();
  const cachedAgents = {};
  return {
    name: proxyPolicyName,
    async sendRequest(request3, next) {
      var _a3;
      if (!request3.proxySettings && defaultProxy && !isBypassed(request3.url, (_a3 = options === null || options === void 0 ? void 0 : options.customNoProxyList) !== null && _a3 !== void 0 ? _a3 : globalNoProxyList, (options === null || options === void 0 ? void 0 : options.customNoProxyList) ? void 0 : globalBypassedMap)) {
        setProxyAgentOnRequest(request3, cachedAgents, defaultProxy);
      } else if (request3.proxySettings) {
        setProxyAgentOnRequest(request3, cachedAgents, getUrlFromProxySettings(request3.proxySettings));
      }
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/agentPolicy.js
var agentPolicyName = "agentPolicy";
function agentPolicy(agent) {
  return {
    name: agentPolicyName,
    sendRequest: async (req, next) => {
      if (!req.agent) {
        req.agent = agent;
      }
      return next(req);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/tlsPolicy.js
var tlsPolicyName = "tlsPolicy";
function tlsPolicy(tlsSettings) {
  return {
    name: tlsPolicyName,
    sendRequest: async (req, next) => {
      if (!req.tlsSettings) {
        req.tlsSettings = tlsSettings;
      }
      return next(req);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/typeGuards.js
function isNodeReadableStream(x) {
  return Boolean(x && typeof x["pipe"] === "function");
}
function isWebReadableStream(x) {
  return Boolean(x && typeof x.getReader === "function" && typeof x.tee === "function");
}
function isBinaryBody(body) {
  return body !== void 0 && (body instanceof Uint8Array || isReadableStream2(body) || typeof body === "function" || body instanceof Blob);
}
function isReadableStream2(x) {
  return isNodeReadableStream(x) || isWebReadableStream(x);
}
function isBlob(x) {
  return typeof x.stream === "function";
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/concat.js
import { Readable } from "stream";
function streamAsyncIterator() {
  return __asyncGenerator(this, arguments, function* streamAsyncIterator_1() {
    const reader = this.getReader();
    try {
      while (true) {
        const { done, value } = yield __await(reader.read());
        if (done) {
          return yield __await(void 0);
        }
        yield yield __await(value);
      }
    } finally {
      reader.releaseLock();
    }
  });
}
function makeAsyncIterable(webStream) {
  if (!webStream[Symbol.asyncIterator]) {
    webStream[Symbol.asyncIterator] = streamAsyncIterator.bind(webStream);
  }
  if (!webStream.values) {
    webStream.values = streamAsyncIterator.bind(webStream);
  }
}
function ensureNodeStream(stream) {
  if (stream instanceof ReadableStream) {
    makeAsyncIterable(stream);
    return Readable.fromWeb(stream);
  } else {
    return stream;
  }
}
function toStream(source) {
  if (source instanceof Uint8Array) {
    return Readable.from(Buffer.from(source));
  } else if (isBlob(source)) {
    return ensureNodeStream(source.stream());
  } else {
    return ensureNodeStream(source);
  }
}
async function concat(sources) {
  return function() {
    const streams = sources.map((x) => typeof x === "function" ? x() : x).map(toStream);
    return Readable.from(function() {
      return __asyncGenerator(this, arguments, function* () {
        var _a3, e_1, _b2, _c2;
        for (const stream of streams) {
          try {
            for (var _d2 = true, stream_1 = (e_1 = void 0, __asyncValues(stream)), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a3 = stream_1_1.done, !_a3; _d2 = true) {
              _c2 = stream_1_1.value;
              _d2 = false;
              const chunk = _c2;
              yield yield __await(chunk);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (!_d2 && !_a3 && (_b2 = stream_1.return)) yield __await(_b2.call(stream_1));
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }
      });
    }());
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/multipartPolicy.js
function generateBoundary() {
  return `----AzSDKFormBoundary${randomUUID()}`;
}
function encodeHeaders(headers) {
  let result = "";
  for (const [key, value] of headers) {
    result += `${key}: ${value}\r
`;
  }
  return result;
}
function getLength(source) {
  if (source instanceof Uint8Array) {
    return source.byteLength;
  } else if (isBlob(source)) {
    return source.size === -1 ? void 0 : source.size;
  } else {
    return void 0;
  }
}
function getTotalLength(sources) {
  let total = 0;
  for (const source of sources) {
    const partLength = getLength(source);
    if (partLength === void 0) {
      return void 0;
    } else {
      total += partLength;
    }
  }
  return total;
}
async function buildRequestBody(request3, parts, boundary) {
  const sources = [
    stringToUint8Array(`--${boundary}`, "utf-8"),
    ...parts.flatMap((part) => [
      stringToUint8Array("\r\n", "utf-8"),
      stringToUint8Array(encodeHeaders(part.headers), "utf-8"),
      stringToUint8Array("\r\n", "utf-8"),
      part.body,
      stringToUint8Array(`\r
--${boundary}`, "utf-8")
    ]),
    stringToUint8Array("--\r\n\r\n", "utf-8")
  ];
  const contentLength = getTotalLength(sources);
  if (contentLength) {
    request3.headers.set("Content-Length", contentLength);
  }
  request3.body = await concat(sources);
}
var multipartPolicyName = "multipartPolicy";
var maxBoundaryLength = 70;
var validBoundaryCharacters = new Set(`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'()+,-./:=?`);
function assertValidBoundary(boundary) {
  if (boundary.length > maxBoundaryLength) {
    throw new Error(`Multipart boundary "${boundary}" exceeds maximum length of 70 characters`);
  }
  if (Array.from(boundary).some((x) => !validBoundaryCharacters.has(x))) {
    throw new Error(`Multipart boundary "${boundary}" contains invalid characters`);
  }
}
function multipartPolicy() {
  return {
    name: multipartPolicyName,
    async sendRequest(request3, next) {
      var _a3;
      if (!request3.multipartBody) {
        return next(request3);
      }
      if (request3.body) {
        throw new Error("multipartBody and regular body cannot be set at the same time");
      }
      let boundary = request3.multipartBody.boundary;
      const contentTypeHeader = (_a3 = request3.headers.get("Content-Type")) !== null && _a3 !== void 0 ? _a3 : "multipart/mixed";
      const parsedHeader = contentTypeHeader.match(/^(multipart\/[^ ;]+)(?:; *boundary=(.+))?$/);
      if (!parsedHeader) {
        throw new Error(`Got multipart request body, but content-type header was not multipart: ${contentTypeHeader}`);
      }
      const [, contentType, parsedBoundary] = parsedHeader;
      if (parsedBoundary && boundary && parsedBoundary !== boundary) {
        throw new Error(`Multipart boundary was specified as ${parsedBoundary} in the header, but got ${boundary} in the request body`);
      }
      boundary !== null && boundary !== void 0 ? boundary : boundary = parsedBoundary;
      if (boundary) {
        assertValidBoundary(boundary);
      } else {
        boundary = generateBoundary();
      }
      request3.headers.set("Content-Type", `${contentType}; boundary=${boundary}`);
      await buildRequestBody(request3, request3.multipartBody.parts, boundary);
      request3.multipartBody = void 0;
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/createPipelineFromOptions.js
function createPipelineFromOptions(options) {
  const pipeline = createEmptyPipeline();
  if (isNodeLike) {
    if (options.agent) {
      pipeline.addPolicy(agentPolicy(options.agent));
    }
    if (options.tlsOptions) {
      pipeline.addPolicy(tlsPolicy(options.tlsOptions));
    }
    pipeline.addPolicy(proxyPolicy(options.proxyOptions));
    pipeline.addPolicy(decompressResponsePolicy());
  }
  pipeline.addPolicy(formDataPolicy(), { beforePolicies: [multipartPolicyName] });
  pipeline.addPolicy(userAgentPolicy(options.userAgentOptions));
  pipeline.addPolicy(multipartPolicy(), { afterPhase: "Deserialize" });
  pipeline.addPolicy(defaultRetryPolicy(options.retryOptions), { phase: "Retry" });
  if (isNodeLike) {
    pipeline.addPolicy(redirectPolicy(options.redirectOptions), { afterPhase: "Retry" });
  }
  pipeline.addPolicy(logPolicy(options.loggingOptions), { afterPhase: "Sign" });
  return pipeline;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/apiVersionPolicy.js
var apiVersionPolicyName = "ApiVersionPolicy";
function apiVersionPolicy(options) {
  return {
    name: apiVersionPolicyName,
    sendRequest: (req, next) => {
      const url = new URL(req.url);
      if (!url.searchParams.get("api-version") && options.apiVersion) {
        req.url = `${req.url}${Array.from(url.searchParams.keys()).length > 0 ? "&" : "?"}api-version=${options.apiVersion}`;
      }
      return next(req);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/auth/credentials.js
function isOAuth2TokenCredential(credential) {
  return "getOAuth2Token" in credential;
}
function isBearerTokenCredential(credential) {
  return "getBearerToken" in credential;
}
function isBasicCredential(credential) {
  return "username" in credential && "password" in credential;
}
function isApiKeyCredential(credential) {
  return "key" in credential;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/auth/checkInsecureConnection.js
var insecureConnectionWarningEmmitted = false;
function allowInsecureConnection(request3, options) {
  if (options.allowInsecureConnection && request3.allowInsecureConnection) {
    const url = new URL(request3.url);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return true;
    }
  }
  return false;
}
function emitInsecureConnectionWarning() {
  const warning5 = "Sending token over insecure transport. Assume any token issued is compromised.";
  logger.warning(warning5);
  if (typeof (process === null || process === void 0 ? void 0 : process.emitWarning) === "function" && !insecureConnectionWarningEmmitted) {
    insecureConnectionWarningEmmitted = true;
    process.emitWarning(warning5);
  }
}
function ensureSecureConnection(request3, options) {
  if (!request3.url.toLowerCase().startsWith("https://")) {
    if (allowInsecureConnection(request3, options)) {
      emitInsecureConnectionWarning();
    } else {
      throw new Error("Authentication is not permitted for non-TLS protected (non-https) URLs when allowInsecureConnection is false.");
    }
  }
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/auth/apiKeyAuthenticationPolicy.js
var apiKeyAuthenticationPolicyName = "apiKeyAuthenticationPolicy";
function apiKeyAuthenticationPolicy(options) {
  return {
    name: apiKeyAuthenticationPolicyName,
    async sendRequest(request3, next) {
      var _a3, _b2;
      ensureSecureConnection(request3, options);
      const scheme = (_b2 = (_a3 = request3.authSchemes) !== null && _a3 !== void 0 ? _a3 : options.authSchemes) === null || _b2 === void 0 ? void 0 : _b2.find((x) => x.kind === "apiKey");
      if (!scheme) {
        return next(request3);
      }
      if (scheme.apiKeyLocation !== "header") {
        throw new Error(`Unsupported API key location: ${scheme.apiKeyLocation}`);
      }
      request3.headers.set(scheme.name, options.credential.key);
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/auth/basicAuthenticationPolicy.js
var basicAuthenticationPolicyName = "bearerAuthenticationPolicy";
function basicAuthenticationPolicy(options) {
  return {
    name: basicAuthenticationPolicyName,
    async sendRequest(request3, next) {
      var _a3, _b2;
      ensureSecureConnection(request3, options);
      const scheme = (_b2 = (_a3 = request3.authSchemes) !== null && _a3 !== void 0 ? _a3 : options.authSchemes) === null || _b2 === void 0 ? void 0 : _b2.find((x) => x.kind === "http" && x.scheme === "basic");
      if (!scheme) {
        return next(request3);
      }
      const { username, password } = options.credential;
      const headerValue = uint8ArrayToString(stringToUint8Array(`${username}:${password}`, "utf-8"), "base64");
      request3.headers.set("Authorization", `Basic ${headerValue}`);
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/auth/bearerAuthenticationPolicy.js
var bearerAuthenticationPolicyName = "bearerAuthenticationPolicy";
function bearerAuthenticationPolicy(options) {
  return {
    name: bearerAuthenticationPolicyName,
    async sendRequest(request3, next) {
      var _a3, _b2;
      ensureSecureConnection(request3, options);
      const scheme = (_b2 = (_a3 = request3.authSchemes) !== null && _a3 !== void 0 ? _a3 : options.authSchemes) === null || _b2 === void 0 ? void 0 : _b2.find((x) => x.kind === "http" && x.scheme === "bearer");
      if (!scheme) {
        return next(request3);
      }
      const token = await options.credential.getBearerToken({
        abortSignal: request3.abortSignal
      });
      request3.headers.set("Authorization", `Bearer ${token}`);
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/policies/auth/oauth2AuthenticationPolicy.js
var oauth2AuthenticationPolicyName = "oauth2AuthenticationPolicy";
function oauth2AuthenticationPolicy(options) {
  return {
    name: oauth2AuthenticationPolicyName,
    async sendRequest(request3, next) {
      var _a3, _b2;
      ensureSecureConnection(request3, options);
      const scheme = (_b2 = (_a3 = request3.authSchemes) !== null && _a3 !== void 0 ? _a3 : options.authSchemes) === null || _b2 === void 0 ? void 0 : _b2.find((x) => x.kind === "oauth2");
      if (!scheme) {
        return next(request3);
      }
      const token = await options.credential.getOAuth2Token(scheme.flows, {
        abortSignal: request3.abortSignal
      });
      request3.headers.set("Authorization", `Bearer ${token}`);
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/clientHelpers.js
var cachedHttpClient;
function createDefaultPipeline(options = {}) {
  const pipeline = createPipelineFromOptions(options);
  pipeline.addPolicy(apiVersionPolicy(options));
  const { credential, authSchemes, allowInsecureConnection: allowInsecureConnection2 } = options;
  if (credential) {
    if (isApiKeyCredential(credential)) {
      pipeline.addPolicy(apiKeyAuthenticationPolicy({ authSchemes, credential, allowInsecureConnection: allowInsecureConnection2 }));
    } else if (isBasicCredential(credential)) {
      pipeline.addPolicy(basicAuthenticationPolicy({ authSchemes, credential, allowInsecureConnection: allowInsecureConnection2 }));
    } else if (isBearerTokenCredential(credential)) {
      pipeline.addPolicy(bearerAuthenticationPolicy({ authSchemes, credential, allowInsecureConnection: allowInsecureConnection2 }));
    } else if (isOAuth2TokenCredential(credential)) {
      pipeline.addPolicy(oauth2AuthenticationPolicy({ authSchemes, credential, allowInsecureConnection: allowInsecureConnection2 }));
    }
  }
  return pipeline;
}
function getCachedDefaultHttpsClient() {
  if (!cachedHttpClient) {
    cachedHttpClient = createDefaultHttpClient();
  }
  return cachedHttpClient;
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/multipart.js
function getHeaderValue(descriptor, headerName) {
  if (descriptor.headers) {
    const actualHeaderName = Object.keys(descriptor.headers).find((x) => x.toLowerCase() === headerName.toLowerCase());
    if (actualHeaderName) {
      return descriptor.headers[actualHeaderName];
    }
  }
  return void 0;
}
function getPartContentType(descriptor) {
  const contentTypeHeader = getHeaderValue(descriptor, "content-type");
  if (contentTypeHeader) {
    return contentTypeHeader;
  }
  if (descriptor.contentType === null) {
    return void 0;
  }
  if (descriptor.contentType) {
    return descriptor.contentType;
  }
  const { body } = descriptor;
  if (body === null || body === void 0) {
    return void 0;
  }
  if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
    return "text/plain; charset=UTF-8";
  }
  if (body instanceof Blob) {
    return body.type || "application/octet-stream";
  }
  if (isBinaryBody(body)) {
    return "application/octet-stream";
  }
  return "application/json";
}
function escapeDispositionField(value) {
  return JSON.stringify(value);
}
function getContentDisposition(descriptor) {
  var _a3;
  const contentDispositionHeader = getHeaderValue(descriptor, "content-disposition");
  if (contentDispositionHeader) {
    return contentDispositionHeader;
  }
  if (descriptor.dispositionType === void 0 && descriptor.name === void 0 && descriptor.filename === void 0) {
    return void 0;
  }
  const dispositionType = (_a3 = descriptor.dispositionType) !== null && _a3 !== void 0 ? _a3 : "form-data";
  let disposition = dispositionType;
  if (descriptor.name) {
    disposition += `; name=${escapeDispositionField(descriptor.name)}`;
  }
  let filename = void 0;
  if (descriptor.filename) {
    filename = descriptor.filename;
  } else if (typeof File !== "undefined" && descriptor.body instanceof File) {
    const filenameFromFile = descriptor.body.name;
    if (filenameFromFile !== "") {
      filename = filenameFromFile;
    }
  }
  if (filename) {
    disposition += `; filename=${escapeDispositionField(filename)}`;
  }
  return disposition;
}
function normalizeBody(body, contentType) {
  if (body === void 0) {
    return new Uint8Array([]);
  }
  if (isBinaryBody(body)) {
    return body;
  }
  if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
    return stringToUint8Array(String(body), "utf-8");
  }
  if (contentType && /application\/(.+\+)?json(;.+)?/i.test(String(contentType))) {
    return stringToUint8Array(JSON.stringify(body), "utf-8");
  }
  throw new RestError(`Unsupported body/content-type combination: ${body}, ${contentType}`);
}
function buildBodyPart(descriptor) {
  var _a3;
  const contentType = getPartContentType(descriptor);
  const contentDisposition = getContentDisposition(descriptor);
  const headers = createHttpHeaders((_a3 = descriptor.headers) !== null && _a3 !== void 0 ? _a3 : {});
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition);
  }
  const body = normalizeBody(descriptor.body, contentType);
  return {
    headers,
    body
  };
}
function buildMultipartBody(parts) {
  return { parts: parts.map(buildBodyPart) };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/sendRequest.js
async function sendRequest(method, url, pipeline, options = {}, customHttpClient) {
  var _a3;
  const httpClient = customHttpClient !== null && customHttpClient !== void 0 ? customHttpClient : getCachedDefaultHttpsClient();
  const request3 = buildPipelineRequest(method, url, options);
  try {
    const response = await pipeline.sendRequest(httpClient, request3);
    const headers = response.headers.toJSON();
    const stream = (_a3 = response.readableStreamBody) !== null && _a3 !== void 0 ? _a3 : response.browserStreamBody;
    const parsedBody = options.responseAsStream || stream !== void 0 ? void 0 : getResponseBody(response);
    const body = stream !== null && stream !== void 0 ? stream : parsedBody;
    if (options === null || options === void 0 ? void 0 : options.onResponse) {
      options.onResponse(Object.assign(Object.assign({}, response), { request: request3, rawHeaders: headers, parsedBody }));
    }
    return {
      request: request3,
      headers,
      status: `${response.status}`,
      body
    };
  } catch (e) {
    if (isRestError(e) && e.response && options.onResponse) {
      const { response } = e;
      const rawHeaders = response.headers.toJSON();
      options === null || options === void 0 ? void 0 : options.onResponse(Object.assign(Object.assign({}, response), { request: request3, rawHeaders }), e);
    }
    throw e;
  }
}
function getRequestContentType(options = {}) {
  var _a3, _b2, _c2;
  return (_c2 = (_a3 = options.contentType) !== null && _a3 !== void 0 ? _a3 : (_b2 = options.headers) === null || _b2 === void 0 ? void 0 : _b2["content-type"]) !== null && _c2 !== void 0 ? _c2 : getContentType(options.body);
}
function getContentType(body) {
  if (ArrayBuffer.isView(body)) {
    return "application/octet-stream";
  }
  if (typeof body === "string") {
    try {
      JSON.parse(body);
      return "application/json";
    } catch (error) {
      return void 0;
    }
  }
  return "application/json";
}
function buildPipelineRequest(method, url, options = {}) {
  var _a3, _b2, _c2;
  const requestContentType = getRequestContentType(options);
  const { body, multipartBody } = getRequestBody(options.body, requestContentType);
  const hasContent = body !== void 0 || multipartBody !== void 0;
  const headers = createHttpHeaders(Object.assign(Object.assign(Object.assign({}, options.headers ? options.headers : {}), { accept: (_c2 = (_a3 = options.accept) !== null && _a3 !== void 0 ? _a3 : (_b2 = options.headers) === null || _b2 === void 0 ? void 0 : _b2.accept) !== null && _c2 !== void 0 ? _c2 : "application/json" }), hasContent && requestContentType && {
    "content-type": requestContentType
  }));
  return createPipelineRequest({
    url,
    method,
    body,
    multipartBody,
    headers,
    allowInsecureConnection: options.allowInsecureConnection,
    abortSignal: options.abortSignal,
    onUploadProgress: options.onUploadProgress,
    onDownloadProgress: options.onDownloadProgress,
    timeout: options.timeout,
    enableBrowserStreams: true,
    streamResponseStatusCodes: options.responseAsStream ? /* @__PURE__ */ new Set([Number.POSITIVE_INFINITY]) : void 0
  });
}
function getRequestBody(body, contentType = "") {
  if (body === void 0) {
    return { body: void 0 };
  }
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return { body };
  }
  if (isReadableStream2(body)) {
    return { body };
  }
  if (ArrayBuffer.isView(body)) {
    return { body: body instanceof Uint8Array ? body : JSON.stringify(body) };
  }
  const firstType = contentType.split(";")[0];
  switch (firstType) {
    case "application/json":
      return { body: JSON.stringify(body) };
    case "multipart/form-data":
      if (Array.isArray(body)) {
        return { multipartBody: buildMultipartBody(body) };
      }
      return { body: JSON.stringify(body) };
    case "text/plain":
      return { body: String(body) };
    default:
      if (typeof body === "string") {
        return { body };
      }
      return { body: JSON.stringify(body) };
  }
}
function getResponseBody(response) {
  var _a3, _b2;
  const contentType = (_a3 = response.headers.get("content-type")) !== null && _a3 !== void 0 ? _a3 : "";
  const firstType = contentType.split(";")[0];
  const bodyToParse = (_b2 = response.bodyAsText) !== null && _b2 !== void 0 ? _b2 : "";
  if (firstType === "text/plain") {
    return String(bodyToParse);
  }
  try {
    return bodyToParse ? JSON.parse(bodyToParse) : void 0;
  } catch (error) {
    if (firstType === "application/json") {
      throw createParseError(response, error);
    }
    return String(bodyToParse);
  }
}
function createParseError(response, err) {
  var _a3;
  const msg = `Error "${err}" occurred while parsing the response body - ${response.bodyAsText}.`;
  const errCode = (_a3 = err.code) !== null && _a3 !== void 0 ? _a3 : RestError.PARSE_ERROR;
  return new RestError(msg, {
    code: errCode,
    statusCode: response.status,
    request: response.request,
    response
  });
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/urlHelpers.js
function isQueryParameterWithOptions(x) {
  const value = x.value;
  return value !== void 0 && value.toString !== void 0 && typeof value.toString === "function";
}
function buildRequestUrl(endpoint, routePath, pathParameters, options = {}) {
  if (routePath.startsWith("https://") || routePath.startsWith("http://")) {
    return routePath;
  }
  endpoint = buildBaseUrl(endpoint, options);
  routePath = buildRoutePath(routePath, pathParameters, options);
  const requestUrl = appendQueryParams(`${endpoint}/${routePath}`, options);
  const url = new URL(requestUrl);
  return url.toString().replace(/([^:]\/)\/+/g, "$1");
}
function getQueryParamValue(key, allowReserved, style, param) {
  let separator;
  if (style === "pipeDelimited") {
    separator = "|";
  } else if (style === "spaceDelimited") {
    separator = "%20";
  } else {
    separator = ",";
  }
  let paramValues;
  if (Array.isArray(param)) {
    paramValues = param;
  } else if (typeof param === "object" && param.toString === Object.prototype.toString) {
    paramValues = Object.entries(param).flat();
  } else {
    paramValues = [param];
  }
  const value = paramValues.map((p) => {
    if (p === null || p === void 0) {
      return "";
    }
    if (!p.toString || typeof p.toString !== "function") {
      throw new Error(`Query parameters must be able to be represented as string, ${key} can't`);
    }
    const rawValue = p.toISOString !== void 0 ? p.toISOString() : p.toString();
    return allowReserved ? rawValue : encodeURIComponent(rawValue);
  }).join(separator);
  return `${allowReserved ? key : encodeURIComponent(key)}=${value}`;
}
function appendQueryParams(url, options = {}) {
  var _a3, _b2, _c2, _d2;
  if (!options.queryParameters) {
    return url;
  }
  const parsedUrl = new URL(url);
  const queryParams = options.queryParameters;
  const paramStrings = [];
  for (const key of Object.keys(queryParams)) {
    const param = queryParams[key];
    if (param === void 0 || param === null) {
      continue;
    }
    const hasMetadata = isQueryParameterWithOptions(param);
    const rawValue = hasMetadata ? param.value : param;
    const explode = hasMetadata ? (_a3 = param.explode) !== null && _a3 !== void 0 ? _a3 : false : false;
    const style = hasMetadata && param.style ? param.style : "form";
    if (explode) {
      if (Array.isArray(rawValue)) {
        for (const item of rawValue) {
          paramStrings.push(getQueryParamValue(key, (_b2 = options.skipUrlEncoding) !== null && _b2 !== void 0 ? _b2 : false, style, item));
        }
      } else if (typeof rawValue === "object") {
        for (const [actualKey, value] of Object.entries(rawValue)) {
          paramStrings.push(getQueryParamValue(actualKey, (_c2 = options.skipUrlEncoding) !== null && _c2 !== void 0 ? _c2 : false, style, value));
        }
      } else {
        throw new Error("explode can only be set to true for objects and arrays");
      }
    } else {
      paramStrings.push(getQueryParamValue(key, (_d2 = options.skipUrlEncoding) !== null && _d2 !== void 0 ? _d2 : false, style, rawValue));
    }
  }
  if (parsedUrl.search !== "") {
    parsedUrl.search += "&";
  }
  parsedUrl.search += paramStrings.join("&");
  return parsedUrl.toString();
}
function buildBaseUrl(endpoint, options) {
  var _a3;
  if (!options.pathParameters) {
    return endpoint;
  }
  const pathParams = options.pathParameters;
  for (const [key, param] of Object.entries(pathParams)) {
    if (param === void 0 || param === null) {
      throw new Error(`Path parameters ${key} must not be undefined or null`);
    }
    if (!param.toString || typeof param.toString !== "function") {
      throw new Error(`Path parameters must be able to be represented as string, ${key} can't`);
    }
    let value = param.toISOString !== void 0 ? param.toISOString() : String(param);
    if (!options.skipUrlEncoding) {
      value = encodeURIComponent(param);
    }
    endpoint = (_a3 = replaceAll(endpoint, `{${key}}`, value)) !== null && _a3 !== void 0 ? _a3 : "";
  }
  return endpoint;
}
function buildRoutePath(routePath, pathParameters, options = {}) {
  var _a3;
  for (const pathParam of pathParameters) {
    const allowReserved = typeof pathParam === "object" && ((_a3 = pathParam.allowReserved) !== null && _a3 !== void 0 ? _a3 : false);
    let value = typeof pathParam === "object" ? pathParam.value : pathParam;
    if (!options.skipUrlEncoding && !allowReserved) {
      value = encodeURIComponent(value);
    }
    routePath = routePath.replace(/\{[\w-]+\}/, String(value));
  }
  return routePath;
}
function replaceAll(value, searchValue, replaceValue) {
  return !value || !searchValue ? value : value.split(searchValue).join(replaceValue || "");
}

// node_modules/@typespec/ts-http-runtime/dist/esm/client/getClient.js
function getClient(endpoint, clientOptions = {}) {
  var _a3, _b2, _c2;
  const pipeline = (_a3 = clientOptions.pipeline) !== null && _a3 !== void 0 ? _a3 : createDefaultPipeline(clientOptions);
  if ((_b2 = clientOptions.additionalPolicies) === null || _b2 === void 0 ? void 0 : _b2.length) {
    for (const { policy, position } of clientOptions.additionalPolicies) {
      const afterPhase = position === "perRetry" ? "Sign" : void 0;
      pipeline.addPolicy(policy, {
        afterPhase
      });
    }
  }
  const { allowInsecureConnection: allowInsecureConnection2, httpClient } = clientOptions;
  const endpointUrl = (_c2 = clientOptions.endpoint) !== null && _c2 !== void 0 ? _c2 : endpoint;
  const client = (path2, ...args) => {
    const getUrl = (requestOptions) => buildRequestUrl(endpointUrl, path2, args, Object.assign({ allowInsecureConnection: allowInsecureConnection2 }, requestOptions));
    return {
      get: (requestOptions = {}) => {
        return buildOperation("GET", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      post: (requestOptions = {}) => {
        return buildOperation("POST", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      put: (requestOptions = {}) => {
        return buildOperation("PUT", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      patch: (requestOptions = {}) => {
        return buildOperation("PATCH", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      delete: (requestOptions = {}) => {
        return buildOperation("DELETE", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      head: (requestOptions = {}) => {
        return buildOperation("HEAD", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      options: (requestOptions = {}) => {
        return buildOperation("OPTIONS", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      },
      trace: (requestOptions = {}) => {
        return buildOperation("TRACE", getUrl(requestOptions), pipeline, requestOptions, allowInsecureConnection2, httpClient);
      }
    };
  };
  return {
    path: client,
    pathUnchecked: client,
    pipeline
  };
}
function buildOperation(method, url, pipeline, options, allowInsecureConnection2, httpClient) {
  var _a3;
  allowInsecureConnection2 = (_a3 = options.allowInsecureConnection) !== null && _a3 !== void 0 ? _a3 : allowInsecureConnection2;
  return {
    then: function(onFulfilled, onrejected) {
      return sendRequest(method, url, pipeline, Object.assign(Object.assign({}, options), { allowInsecureConnection: allowInsecureConnection2 }), httpClient).then(onFulfilled, onrejected);
    },
    async asBrowserStream() {
      if (isNodeLike) {
        throw new Error("`asBrowserStream` is supported only in the browser environment. Use `asNodeStream` instead to obtain the response body stream. If you require a Web stream of the response in Node, consider using `Readable.toWeb` on the result of `asNodeStream`.");
      } else {
        return sendRequest(method, url, pipeline, Object.assign(Object.assign({}, options), { allowInsecureConnection: allowInsecureConnection2, responseAsStream: true }), httpClient);
      }
    },
    async asNodeStream() {
      if (isNodeLike) {
        return sendRequest(method, url, pipeline, Object.assign(Object.assign({}, options), { allowInsecureConnection: allowInsecureConnection2, responseAsStream: true }), httpClient);
      } else {
        throw new Error("`isNodeStream` is not supported in the browser environment. Use `asBrowserStream` to obtain the response body stream.");
      }
    }
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/pipeline.js
function createEmptyPipeline2() {
  return createEmptyPipeline();
}

// node_modules/@azure/logger/dist/esm/index.js
var context2 = createLoggerContext({
  logLevelEnvVarName: "AZURE_LOG_LEVEL",
  namespace: "azure"
});
var AzureLogger = context2.logger;
function createClientLogger2(namespace) {
  return context2.createClientLogger(namespace);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/log.js
var logger2 = createClientLogger2("core-rest-pipeline");

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/logPolicy.js
function logPolicy2(options = {}) {
  return logPolicy(Object.assign({ logger: logger2.info }, options));
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/redirectPolicy.js
function redirectPolicy2(options = {}) {
  return redirectPolicy(options);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/util/userAgentPlatform.js
import * as os2 from "os";
import * as process4 from "process";
function getHeaderName2() {
  return "User-Agent";
}
async function setPlatformSpecificData2(map) {
  if (process4 && process4.versions) {
    const versions3 = process4.versions;
    if (versions3.bun) {
      map.set("Bun", versions3.bun);
    } else if (versions3.deno) {
      map.set("Deno", versions3.deno);
    } else if (versions3.node) {
      map.set("Node", versions3.node);
    }
  }
  map.set("OS", `(${os2.arch()}-${os2.type()}-${os2.release()})`);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/constants.js
var SDK_VERSION2 = "1.20.0";

// node_modules/@azure/core-rest-pipeline/dist/esm/util/userAgent.js
function getUserAgentString2(telemetryInfo) {
  const parts = [];
  for (const [key, value] of telemetryInfo) {
    const token = value ? `${key}/${value}` : key;
    parts.push(token);
  }
  return parts.join(" ");
}
function getUserAgentHeaderName2() {
  return getHeaderName2();
}
async function getUserAgentValue2(prefix) {
  const runtimeInfo = /* @__PURE__ */ new Map();
  runtimeInfo.set("core-rest-pipeline", SDK_VERSION2);
  await setPlatformSpecificData2(runtimeInfo);
  const defaultAgent = getUserAgentString2(runtimeInfo);
  const userAgentValue = prefix ? `${prefix} ${defaultAgent}` : defaultAgent;
  return userAgentValue;
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/userAgentPolicy.js
var UserAgentHeaderName2 = getUserAgentHeaderName2();
var userAgentPolicyName2 = "userAgentPolicy";
function userAgentPolicy2(options = {}) {
  const userAgentValue = getUserAgentValue2(options.userAgentPrefix);
  return {
    name: userAgentPolicyName2,
    async sendRequest(request3, next) {
      if (!request3.headers.has(UserAgentHeaderName2)) {
        request3.headers.set(UserAgentHeaderName2, await userAgentValue);
      }
      return next(request3);
    }
  };
}

// node_modules/@typespec/ts-http-runtime/dist/esm/util/sha256.js
import { createHash, createHmac } from "crypto";

// node_modules/@azure/abort-controller/dist/esm/AbortError.js
var AbortError2 = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
  }
};

// node_modules/@azure/core-util/dist/esm/createAbortablePromise.js
function createAbortablePromise(buildPromise, options) {
  const { cleanupBeforeAbort, abortSignal, abortErrorMsg } = options !== null && options !== void 0 ? options : {};
  return new Promise((resolve, reject) => {
    function rejectOnAbort() {
      reject(new AbortError2(abortErrorMsg !== null && abortErrorMsg !== void 0 ? abortErrorMsg : "The operation was aborted."));
    }
    function removeListeners() {
      abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.removeEventListener("abort", onAbort);
    }
    function onAbort() {
      cleanupBeforeAbort === null || cleanupBeforeAbort === void 0 ? void 0 : cleanupBeforeAbort();
      removeListeners();
      rejectOnAbort();
    }
    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted) {
      return rejectOnAbort();
    }
    try {
      buildPromise((x) => {
        removeListeners();
        resolve(x);
      }, (x) => {
        removeListeners();
        reject(x);
      });
    } catch (err) {
      reject(err);
    }
    abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.addEventListener("abort", onAbort);
  });
}

// node_modules/@azure/core-util/dist/esm/delay.js
var StandardAbortMessage2 = "The delay was aborted.";
function delay2(timeInMs, options) {
  let token;
  const { abortSignal, abortErrorMsg } = options !== null && options !== void 0 ? options : {};
  return createAbortablePromise((resolve) => {
    token = setTimeout(resolve, timeInMs);
  }, {
    cleanupBeforeAbort: () => clearTimeout(token),
    abortSignal,
    abortErrorMsg: abortErrorMsg !== null && abortErrorMsg !== void 0 ? abortErrorMsg : StandardAbortMessage2
  });
}

// node_modules/@azure/core-util/dist/esm/error.js
function getErrorMessage(e) {
  if (isError(e)) {
    return e.message;
  } else {
    let stringified;
    try {
      if (typeof e === "object" && e) {
        stringified = JSON.stringify(e);
      } else {
        stringified = String(e);
      }
    } catch (err) {
      stringified = "[unable to stringify input]";
    }
    return `Unknown error ${stringified}`;
  }
}

// node_modules/@azure/core-util/dist/esm/typeGuards.js
function isDefined(thing) {
  return typeof thing !== "undefined" && thing !== null;
}
function isObjectWithProperties(thing, properties) {
  if (!isDefined(thing) || typeof thing !== "object") {
    return false;
  }
  for (const property of properties) {
    if (!objectHasProperty(thing, property)) {
      return false;
    }
  }
  return true;
}
function objectHasProperty(thing, property) {
  return isDefined(thing) && typeof thing === "object" && property in thing;
}

// node_modules/@azure/core-util/dist/esm/index.js
function isError2(e) {
  return isError(e);
}
var isNodeLike2 = isNodeLike;

// node_modules/@azure/core-rest-pipeline/dist/esm/util/file.js
var rawContent = Symbol("rawContent");
function hasRawContent(x) {
  return typeof x[rawContent] === "function";
}
function getRawContent(blob) {
  if (hasRawContent(blob)) {
    return blob[rawContent]();
  } else {
    return blob;
  }
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/multipartPolicy.js
var multipartPolicyName2 = multipartPolicyName;
function multipartPolicy2() {
  const tspPolicy = multipartPolicy();
  return {
    name: multipartPolicyName2,
    sendRequest: async (request3, next) => {
      if (request3.multipartBody) {
        for (const part of request3.multipartBody.parts) {
          if (hasRawContent(part.body)) {
            part.body = getRawContent(part.body);
          }
        }
      }
      return tspPolicy.sendRequest(request3, next);
    }
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/decompressResponsePolicy.js
function decompressResponsePolicy2() {
  return decompressResponsePolicy();
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/defaultRetryPolicy.js
function defaultRetryPolicy2(options = {}) {
  return defaultRetryPolicy(options);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/formDataPolicy.js
function formDataPolicy2() {
  return formDataPolicy();
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/proxyPolicy.js
function proxyPolicy2(proxySettings, options) {
  return proxyPolicy(proxySettings, options);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/setClientRequestIdPolicy.js
var setClientRequestIdPolicyName = "setClientRequestIdPolicy";
function setClientRequestIdPolicy(requestIdHeaderName = "x-ms-client-request-id") {
  return {
    name: setClientRequestIdPolicyName,
    async sendRequest(request3, next) {
      if (!request3.headers.has(requestIdHeaderName)) {
        request3.headers.set(requestIdHeaderName, request3.requestId);
      }
      return next(request3);
    }
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/agentPolicy.js
function agentPolicy2(agent) {
  return agentPolicy(agent);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/tlsPolicy.js
function tlsPolicy2(tlsSettings) {
  return tlsPolicy(tlsSettings);
}

// node_modules/@azure/core-tracing/dist/esm/tracingContext.js
var knownContextKeys = {
  span: Symbol.for("@azure/core-tracing span"),
  namespace: Symbol.for("@azure/core-tracing namespace")
};
function createTracingContext(options = {}) {
  let context3 = new TracingContextImpl(options.parentContext);
  if (options.span) {
    context3 = context3.setValue(knownContextKeys.span, options.span);
  }
  if (options.namespace) {
    context3 = context3.setValue(knownContextKeys.namespace, options.namespace);
  }
  return context3;
}
var TracingContextImpl = class _TracingContextImpl {
  constructor(initialContext) {
    this._contextMap = initialContext instanceof _TracingContextImpl ? new Map(initialContext._contextMap) : /* @__PURE__ */ new Map();
  }
  setValue(key, value) {
    const newContext = new _TracingContextImpl(this);
    newContext._contextMap.set(key, value);
    return newContext;
  }
  getValue(key) {
    return this._contextMap.get(key);
  }
  deleteValue(key) {
    const newContext = new _TracingContextImpl(this);
    newContext._contextMap.delete(key);
    return newContext;
  }
};

// node_modules/@azure/core-tracing/dist/esm/state.js
var import_state = __toESM(require_state(), 1);
var state = import_state.state;

// node_modules/@azure/core-tracing/dist/esm/instrumenter.js
function createDefaultTracingSpan() {
  return {
    end: () => {
    },
    isRecording: () => false,
    recordException: () => {
    },
    setAttribute: () => {
    },
    setStatus: () => {
    },
    addEvent: () => {
    }
  };
}
function createDefaultInstrumenter() {
  return {
    createRequestHeaders: () => {
      return {};
    },
    parseTraceparentHeader: () => {
      return void 0;
    },
    startSpan: (_name, spanOptions) => {
      return {
        span: createDefaultTracingSpan(),
        tracingContext: createTracingContext({ parentContext: spanOptions.tracingContext })
      };
    },
    withContext(_context, callback, ...callbackArgs) {
      return callback(...callbackArgs);
    }
  };
}
function getInstrumenter() {
  if (!state.instrumenterImplementation) {
    state.instrumenterImplementation = createDefaultInstrumenter();
  }
  return state.instrumenterImplementation;
}

// node_modules/@azure/core-tracing/dist/esm/tracingClient.js
function createTracingClient(options) {
  const { namespace, packageName, packageVersion } = options;
  function startSpan(name, operationOptions, spanOptions) {
    var _a3;
    const startSpanResult = getInstrumenter().startSpan(name, Object.assign(Object.assign({}, spanOptions), { packageName, packageVersion, tracingContext: (_a3 = operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions) === null || _a3 === void 0 ? void 0 : _a3.tracingContext }));
    let tracingContext = startSpanResult.tracingContext;
    const span = startSpanResult.span;
    if (!tracingContext.getValue(knownContextKeys.namespace)) {
      tracingContext = tracingContext.setValue(knownContextKeys.namespace, namespace);
    }
    span.setAttribute("az.namespace", tracingContext.getValue(knownContextKeys.namespace));
    const updatedOptions = Object.assign({}, operationOptions, {
      tracingOptions: Object.assign(Object.assign({}, operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions), { tracingContext })
    });
    return {
      span,
      updatedOptions
    };
  }
  async function withSpan(name, operationOptions, callback, spanOptions) {
    const { span, updatedOptions } = startSpan(name, operationOptions, spanOptions);
    try {
      const result = await withContext(updatedOptions.tracingOptions.tracingContext, () => Promise.resolve(callback(updatedOptions, span)));
      span.setStatus({ status: "success" });
      return result;
    } catch (err) {
      span.setStatus({ status: "error", error: err });
      throw err;
    } finally {
      span.end();
    }
  }
  function withContext(context3, callback, ...callbackArgs) {
    return getInstrumenter().withContext(context3, callback, ...callbackArgs);
  }
  function parseTraceparentHeader(traceparentHeader) {
    return getInstrumenter().parseTraceparentHeader(traceparentHeader);
  }
  function createRequestHeaders(tracingContext) {
    return getInstrumenter().createRequestHeaders(tracingContext);
  }
  return {
    startSpan,
    withSpan,
    withContext,
    parseTraceparentHeader,
    createRequestHeaders
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/restError.js
var RestError2 = class extends Error {
  constructor(message, options = {}) {
    super(message);
    return new RestError(message, options);
  }
};
RestError2.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
RestError2.PARSE_ERROR = "PARSE_ERROR";
function isRestError2(e) {
  return isRestError(e);
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/tracingPolicy.js
var tracingPolicyName = "tracingPolicy";
function tracingPolicy(options = {}) {
  const userAgentPromise = getUserAgentValue2(options.userAgentPrefix);
  const sanitizer = new Sanitizer({
    additionalAllowedQueryParameters: options.additionalAllowedQueryParameters
  });
  const tracingClient = tryCreateTracingClient();
  return {
    name: tracingPolicyName,
    async sendRequest(request3, next) {
      var _a3;
      if (!tracingClient) {
        return next(request3);
      }
      const userAgent = await userAgentPromise;
      const spanAttributes = {
        "http.url": sanitizer.sanitizeUrl(request3.url),
        "http.method": request3.method,
        "http.user_agent": userAgent,
        requestId: request3.requestId
      };
      if (userAgent) {
        spanAttributes["http.user_agent"] = userAgent;
      }
      const { span, tracingContext } = (_a3 = tryCreateSpan(tracingClient, request3, spanAttributes)) !== null && _a3 !== void 0 ? _a3 : {};
      if (!span || !tracingContext) {
        return next(request3);
      }
      try {
        const response = await tracingClient.withContext(tracingContext, next, request3);
        tryProcessResponse(span, response);
        return response;
      } catch (err) {
        tryProcessError(span, err);
        throw err;
      }
    }
  };
}
function tryCreateTracingClient() {
  try {
    return createTracingClient({
      namespace: "",
      packageName: "@azure/core-rest-pipeline",
      packageVersion: SDK_VERSION2
    });
  } catch (e) {
    logger2.warning(`Error when creating the TracingClient: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryCreateSpan(tracingClient, request3, spanAttributes) {
  try {
    const { span, updatedOptions } = tracingClient.startSpan(`HTTP ${request3.method}`, { tracingOptions: request3.tracingOptions }, {
      spanKind: "client",
      spanAttributes
    });
    if (!span.isRecording()) {
      span.end();
      return void 0;
    }
    const headers = tracingClient.createRequestHeaders(updatedOptions.tracingOptions.tracingContext);
    for (const [key, value] of Object.entries(headers)) {
      request3.headers.set(key, value);
    }
    return { span, tracingContext: updatedOptions.tracingOptions.tracingContext };
  } catch (e) {
    logger2.warning(`Skipping creating a tracing span due to an error: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryProcessError(span, error) {
  try {
    span.setStatus({
      status: "error",
      error: isError2(error) ? error : void 0
    });
    if (isRestError2(error) && error.statusCode) {
      span.setAttribute("http.status_code", error.statusCode);
    }
    span.end();
  } catch (e) {
    logger2.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}
function tryProcessResponse(span, response) {
  try {
    span.setAttribute("http.status_code", response.status);
    const serviceRequestId = response.headers.get("x-ms-request-id");
    if (serviceRequestId) {
      span.setAttribute("serviceRequestId", serviceRequestId);
    }
    if (response.status >= 400) {
      span.setStatus({
        status: "error"
      });
    }
    span.end();
  } catch (e) {
    logger2.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}

// node_modules/@azure/core-rest-pipeline/dist/esm/util/wrapAbortSignal.js
function wrapAbortSignalLike(abortSignalLike) {
  if (abortSignalLike instanceof AbortSignal) {
    return { abortSignal: abortSignalLike };
  }
  if (abortSignalLike.aborted) {
    return { abortSignal: AbortSignal.abort(abortSignalLike.reason) };
  }
  const controller = new AbortController();
  let needsCleanup = true;
  function cleanup() {
    if (needsCleanup) {
      abortSignalLike.removeEventListener("abort", listener);
      needsCleanup = false;
    }
  }
  function listener() {
    controller.abort(abortSignalLike.reason);
    cleanup();
  }
  abortSignalLike.addEventListener("abort", listener);
  return { abortSignal: controller.signal, cleanup };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/wrapAbortSignalLikePolicy.js
var wrapAbortSignalLikePolicyName = "wrapAbortSignalLikePolicy";
function wrapAbortSignalLikePolicy() {
  return {
    name: wrapAbortSignalLikePolicyName,
    sendRequest: async (request3, next) => {
      if (!request3.abortSignal) {
        return next(request3);
      }
      const { abortSignal, cleanup } = wrapAbortSignalLike(request3.abortSignal);
      request3.abortSignal = abortSignal;
      try {
        return await next(request3);
      } finally {
        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
      }
    }
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/createPipelineFromOptions.js
function createPipelineFromOptions2(options) {
  var _a3;
  const pipeline = createEmptyPipeline2();
  if (isNodeLike2) {
    if (options.agent) {
      pipeline.addPolicy(agentPolicy2(options.agent));
    }
    if (options.tlsOptions) {
      pipeline.addPolicy(tlsPolicy2(options.tlsOptions));
    }
    pipeline.addPolicy(proxyPolicy2(options.proxyOptions));
    pipeline.addPolicy(decompressResponsePolicy2());
  }
  pipeline.addPolicy(wrapAbortSignalLikePolicy());
  pipeline.addPolicy(formDataPolicy2(), { beforePolicies: [multipartPolicyName2] });
  pipeline.addPolicy(userAgentPolicy2(options.userAgentOptions));
  pipeline.addPolicy(setClientRequestIdPolicy((_a3 = options.telemetryOptions) === null || _a3 === void 0 ? void 0 : _a3.clientRequestIdHeaderName));
  pipeline.addPolicy(multipartPolicy2(), { afterPhase: "Deserialize" });
  pipeline.addPolicy(defaultRetryPolicy2(options.retryOptions), { phase: "Retry" });
  pipeline.addPolicy(tracingPolicy(Object.assign(Object.assign({}, options.userAgentOptions), options.loggingOptions)), {
    afterPhase: "Retry"
  });
  if (isNodeLike2) {
    pipeline.addPolicy(redirectPolicy2(options.redirectOptions), { afterPhase: "Retry" });
  }
  pipeline.addPolicy(logPolicy2(options.loggingOptions), { afterPhase: "Sign" });
  return pipeline;
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/retryPolicy.js
var retryPolicyLogger2 = createClientLogger2("core-rest-pipeline retryPolicy");

// node_modules/@azure/core-rest-pipeline/dist/esm/util/tokenCycler.js
var DEFAULT_CYCLER_OPTIONS = {
  forcedRefreshWindowInMs: 1e3,
  // Force waiting for a refresh 1s before the token expires
  retryIntervalInMs: 3e3,
  // Allow refresh attempts every 3s
  refreshWindowInMs: 1e3 * 60 * 2
  // Start refreshing 2m before expiry
};
async function beginRefresh(getAccessToken, retryIntervalInMs, refreshTimeout) {
  async function tryGetAccessToken() {
    if (Date.now() < refreshTimeout) {
      try {
        return await getAccessToken();
      } catch (_a3) {
        return null;
      }
    } else {
      const finalToken = await getAccessToken();
      if (finalToken === null) {
        throw new Error("Failed to refresh access token.");
      }
      return finalToken;
    }
  }
  let token = await tryGetAccessToken();
  while (token === null) {
    await delay2(retryIntervalInMs);
    token = await tryGetAccessToken();
  }
  return token;
}
function createTokenCycler(credential, tokenCyclerOptions) {
  let refreshWorker = null;
  let token = null;
  let tenantId;
  const options = Object.assign(Object.assign({}, DEFAULT_CYCLER_OPTIONS), tokenCyclerOptions);
  const cycler = {
    /**
     * Produces true if a refresh job is currently in progress.
     */
    get isRefreshing() {
      return refreshWorker !== null;
    },
    /**
     * Produces true if the cycler SHOULD refresh (we are within the refresh
     * window and not already refreshing)
     */
    get shouldRefresh() {
      var _a3;
      if (cycler.isRefreshing) {
        return false;
      }
      if ((token === null || token === void 0 ? void 0 : token.refreshAfterTimestamp) && token.refreshAfterTimestamp < Date.now()) {
        return true;
      }
      return ((_a3 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a3 !== void 0 ? _a3 : 0) - options.refreshWindowInMs < Date.now();
    },
    /**
     * Produces true if the cycler MUST refresh (null or nearly-expired
     * token).
     */
    get mustRefresh() {
      return token === null || token.expiresOnTimestamp - options.forcedRefreshWindowInMs < Date.now();
    }
  };
  function refresh(scopes, getTokenOptions) {
    var _a3;
    if (!cycler.isRefreshing) {
      const tryGetAccessToken = () => credential.getToken(scopes, getTokenOptions);
      refreshWorker = beginRefresh(
        tryGetAccessToken,
        options.retryIntervalInMs,
        // If we don't have a token, then we should timeout immediately
        (_a3 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a3 !== void 0 ? _a3 : Date.now()
      ).then((_token) => {
        refreshWorker = null;
        token = _token;
        tenantId = getTokenOptions.tenantId;
        return token;
      }).catch((reason) => {
        refreshWorker = null;
        token = null;
        tenantId = void 0;
        throw reason;
      });
    }
    return refreshWorker;
  }
  return async (scopes, tokenOptions) => {
    const hasClaimChallenge = Boolean(tokenOptions.claims);
    const tenantIdChanged = tenantId !== tokenOptions.tenantId;
    if (hasClaimChallenge) {
      token = null;
    }
    const mustRefresh = tenantIdChanged || hasClaimChallenge || cycler.mustRefresh;
    if (mustRefresh) {
      return refresh(scopes, tokenOptions);
    }
    if (cycler.shouldRefresh) {
      refresh(scopes, tokenOptions);
    }
    return token;
  };
}

// node_modules/@azure/core-rest-pipeline/dist/esm/policies/bearerTokenAuthenticationPolicy.js
var bearerTokenAuthenticationPolicyName = "bearerTokenAuthenticationPolicy";
async function trySendRequest(request3, next) {
  try {
    return [await next(request3), void 0];
  } catch (e) {
    if (isRestError2(e) && e.response) {
      return [e.response, e];
    } else {
      throw e;
    }
  }
}
async function defaultAuthorizeRequest(options) {
  const { scopes, getAccessToken, request: request3 } = options;
  const getTokenOptions = {
    abortSignal: request3.abortSignal,
    tracingOptions: request3.tracingOptions,
    enableCae: true
  };
  const accessToken = await getAccessToken(scopes, getTokenOptions);
  if (accessToken) {
    options.request.headers.set("Authorization", `Bearer ${accessToken.token}`);
  }
}
function isChallengeResponse(response) {
  return response.status === 401 && response.headers.has("WWW-Authenticate");
}
async function authorizeRequestOnCaeChallenge(onChallengeOptions, caeClaims) {
  var _a3;
  const { scopes } = onChallengeOptions;
  const accessToken = await onChallengeOptions.getAccessToken(scopes, {
    enableCae: true,
    claims: caeClaims
  });
  if (!accessToken) {
    return false;
  }
  onChallengeOptions.request.headers.set("Authorization", `${(_a3 = accessToken.tokenType) !== null && _a3 !== void 0 ? _a3 : "Bearer"} ${accessToken.token}`);
  return true;
}
function bearerTokenAuthenticationPolicy(options) {
  var _a3, _b2, _c2;
  const { credential, scopes, challengeCallbacks } = options;
  const logger4 = options.logger || logger2;
  const callbacks = {
    authorizeRequest: (_b2 = (_a3 = challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequest) === null || _a3 === void 0 ? void 0 : _a3.bind(challengeCallbacks)) !== null && _b2 !== void 0 ? _b2 : defaultAuthorizeRequest,
    authorizeRequestOnChallenge: (_c2 = challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequestOnChallenge) === null || _c2 === void 0 ? void 0 : _c2.bind(challengeCallbacks)
  };
  const getAccessToken = credential ? createTokenCycler(
    credential
    /* , options */
  ) : () => Promise.resolve(null);
  return {
    name: bearerTokenAuthenticationPolicyName,
    /**
     * If there's no challenge parameter:
     * - It will try to retrieve the token using the cache, or the credential's getToken.
     * - Then it will try the next policy with or without the retrieved token.
     *
     * It uses the challenge parameters to:
     * - Skip a first attempt to get the token from the credential if there's no cached token,
     *   since it expects the token to be retrievable only after the challenge.
     * - Prepare the outgoing request if the `prepareRequest` method has been provided.
     * - Send an initial request to receive the challenge if it fails.
     * - Process a challenge if the response contains it.
     * - Retrieve a token with the challenge information, then re-send the request.
     */
    async sendRequest(request3, next) {
      if (!request3.url.toLowerCase().startsWith("https://")) {
        throw new Error("Bearer token authentication is not permitted for non-TLS protected (non-https) URLs.");
      }
      await callbacks.authorizeRequest({
        scopes: Array.isArray(scopes) ? scopes : [scopes],
        request: request3,
        getAccessToken,
        logger: logger4
      });
      let response;
      let error;
      let shouldSendRequest;
      [response, error] = await trySendRequest(request3, next);
      if (isChallengeResponse(response)) {
        let claims = getCaeChallengeClaims(response.headers.get("WWW-Authenticate"));
        if (claims) {
          let parsedClaim;
          try {
            parsedClaim = atob(claims);
          } catch (e) {
            logger4.warning(`The WWW-Authenticate header contains "claims" that cannot be parsed. Unable to perform the Continuous Access Evaluation authentication flow. Unparsable claims: ${claims}`);
            return response;
          }
          shouldSendRequest = await authorizeRequestOnCaeChallenge({
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            response,
            request: request3,
            getAccessToken,
            logger: logger4
          }, parsedClaim);
          if (shouldSendRequest) {
            [response, error] = await trySendRequest(request3, next);
          }
        } else if (callbacks.authorizeRequestOnChallenge) {
          shouldSendRequest = await callbacks.authorizeRequestOnChallenge({
            scopes: Array.isArray(scopes) ? scopes : [scopes],
            request: request3,
            response,
            getAccessToken,
            logger: logger4
          });
          if (shouldSendRequest) {
            [response, error] = await trySendRequest(request3, next);
          }
          if (isChallengeResponse(response)) {
            claims = getCaeChallengeClaims(response.headers.get("WWW-Authenticate"));
            if (claims) {
              let parsedClaim;
              try {
                parsedClaim = atob(claims);
              } catch (e) {
                logger4.warning(`The WWW-Authenticate header contains "claims" that cannot be parsed. Unable to perform the Continuous Access Evaluation authentication flow. Unparsable claims: ${claims}`);
                return response;
              }
              shouldSendRequest = await authorizeRequestOnCaeChallenge({
                scopes: Array.isArray(scopes) ? scopes : [scopes],
                response,
                request: request3,
                getAccessToken,
                logger: logger4
              }, parsedClaim);
              if (shouldSendRequest) {
                [response, error] = await trySendRequest(request3, next);
              }
            }
          }
        }
      }
      if (error) {
        throw error;
      } else {
        return response;
      }
    }
  };
}
function parseChallenges(challenges) {
  const challengeRegex = /(\w+)\s+((?:\w+=(?:"[^"]*"|[^,]*),?\s*)+)/g;
  const paramRegex = /(\w+)="([^"]*)"/g;
  const parsedChallenges = [];
  let match;
  while ((match = challengeRegex.exec(challenges)) !== null) {
    const scheme = match[1];
    const paramsString = match[2];
    const params = {};
    let paramMatch;
    while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
      params[paramMatch[1]] = paramMatch[2];
    }
    parsedChallenges.push({ scheme, params });
  }
  return parsedChallenges;
}
function getCaeChallengeClaims(challenges) {
  var _a3;
  if (!challenges) {
    return;
  }
  const parsedChallenges = parseChallenges(challenges);
  return (_a3 = parsedChallenges.find((x) => x.scheme === "Bearer" && x.params.claims && x.params.error === "insufficient_claims")) === null || _a3 === void 0 ? void 0 : _a3.params.claims;
}

// node_modules/@azure/core-auth/dist/esm/azureKeyCredential.js
var AzureKeyCredential = class {
  /**
   * The value of the key to be used in authentication
   */
  get key() {
    return this._key;
  }
  /**
   * Create an instance of an AzureKeyCredential for use
   * with a service client.
   *
   * @param key - The initial value of the key to use in authentication
   */
  constructor(key) {
    if (!key) {
      throw new Error("key must be a non-empty string");
    }
    this._key = key;
  }
  /**
   * Change the value of the key.
   *
   * Updates will take effect upon the next request after
   * updating the key value.
   *
   * @param newKey - The new key value to be used
   */
  update(newKey) {
    this._key = newKey;
  }
};

// node_modules/@azure/core-auth/dist/esm/keyCredential.js
function isKeyCredential(credential) {
  return isObjectWithProperties(credential, ["key"]) && typeof credential.key === "string";
}

// node_modules/@azure/core-auth/dist/esm/tokenCredential.js
function isTokenCredential(credential) {
  const castCredential = credential;
  return castCredential && typeof castCredential.getToken === "function" && (castCredential.signRequest === void 0 || castCredential.getToken.length > 0);
}

// node_modules/@azure-rest/core-client/dist/esm/apiVersionPolicy.js
var apiVersionPolicyName2 = "ApiVersionPolicy";
function apiVersionPolicy2(options) {
  return {
    name: apiVersionPolicyName2,
    sendRequest: (req, next) => {
      const url = new URL(req.url);
      if (!url.searchParams.get("api-version") && options.apiVersion) {
        req.url = `${req.url}${Array.from(url.searchParams.keys()).length > 0 ? "&" : "?"}api-version=${options.apiVersion}`;
      }
      return next(req);
    }
  };
}

// node_modules/@azure-rest/core-client/dist/esm/keyCredentialAuthenticationPolicy.js
var keyCredentialAuthenticationPolicyName = "keyCredentialAuthenticationPolicy";
function keyCredentialAuthenticationPolicy(credential, apiKeyHeaderName) {
  return {
    name: keyCredentialAuthenticationPolicyName,
    async sendRequest(request3, next) {
      request3.headers.set(apiKeyHeaderName, credential.key);
      return next(request3);
    }
  };
}

// node_modules/@azure-rest/core-client/dist/esm/clientHelpers.js
function addCredentialPipelinePolicy(pipeline, endpoint, options = {}) {
  var _a3, _b2, _c2, _d2;
  const { credential, clientOptions } = options;
  if (!credential) {
    return;
  }
  if (isTokenCredential(credential)) {
    const tokenPolicy = bearerTokenAuthenticationPolicy({
      credential,
      scopes: (_b2 = (_a3 = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.credentials) === null || _a3 === void 0 ? void 0 : _a3.scopes) !== null && _b2 !== void 0 ? _b2 : `${endpoint}/.default`
    });
    pipeline.addPolicy(tokenPolicy);
  } else if (isKeyCredential2(credential)) {
    if (!((_c2 = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.credentials) === null || _c2 === void 0 ? void 0 : _c2.apiKeyHeaderName)) {
      throw new Error(`Missing API Key Header Name`);
    }
    const keyPolicy = keyCredentialAuthenticationPolicy(credential, (_d2 = clientOptions === null || clientOptions === void 0 ? void 0 : clientOptions.credentials) === null || _d2 === void 0 ? void 0 : _d2.apiKeyHeaderName);
    pipeline.addPolicy(keyPolicy);
  }
}
function createDefaultPipeline2(endpoint, credential, options = {}) {
  const pipeline = createPipelineFromOptions2(options);
  pipeline.addPolicy(apiVersionPolicy2(options));
  addCredentialPipelinePolicy(pipeline, endpoint, { credential, clientOptions: options });
  return pipeline;
}
function isKeyCredential2(credential) {
  return credential.key !== void 0;
}

// node_modules/@azure-rest/core-client/dist/esm/getClient.js
function wrapRequestParameters(parameters) {
  if (parameters.onResponse) {
    return Object.assign(Object.assign({}, parameters), { onResponse(rawResponse, error) {
      var _a3;
      (_a3 = parameters.onResponse) === null || _a3 === void 0 ? void 0 : _a3.call(parameters, rawResponse, error, error);
    } });
  }
  return parameters;
}
function getClient2(endpoint, credentialsOrPipelineOptions, clientOptions = {}) {
  let credentials;
  if (credentialsOrPipelineOptions) {
    if (isCredential(credentialsOrPipelineOptions)) {
      credentials = credentialsOrPipelineOptions;
    } else {
      clientOptions = credentialsOrPipelineOptions !== null && credentialsOrPipelineOptions !== void 0 ? credentialsOrPipelineOptions : {};
    }
  }
  const pipeline = createDefaultPipeline2(endpoint, credentials, clientOptions);
  const tspClient = getClient(endpoint, Object.assign(Object.assign({}, clientOptions), { pipeline }));
  const client = (path2, ...args) => {
    return {
      get: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).get(wrapRequestParameters(requestOptions));
      },
      post: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).post(wrapRequestParameters(requestOptions));
      },
      put: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).put(wrapRequestParameters(requestOptions));
      },
      patch: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).patch(wrapRequestParameters(requestOptions));
      },
      delete: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).delete(wrapRequestParameters(requestOptions));
      },
      head: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).head(wrapRequestParameters(requestOptions));
      },
      options: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).options(wrapRequestParameters(requestOptions));
      },
      trace: (requestOptions = {}) => {
        return tspClient.path(path2, ...args).trace(wrapRequestParameters(requestOptions));
      }
    };
  };
  return {
    path: client,
    pathUnchecked: client,
    pipeline: tspClient.pipeline
  };
}
function isCredential(param) {
  return isKeyCredential(param) || isTokenCredential(param);
}

// node_modules/@azure-rest/ai-inference/dist/esm/logger.js
var logger3 = createClientLogger2("ai-inference");

// node_modules/@azure-rest/ai-inference/dist/esm/constants.js
var SDK_VERSION3 = "1.0.0-beta.4";

// node_modules/@azure-rest/ai-inference/dist/esm/tracingHelper.js
var TracingAttributesEnum;
(function(TracingAttributesEnum2) {
  TracingAttributesEnum2["Operation_Name"] = "gen_ai.operation.name";
  TracingAttributesEnum2["Request_Model"] = "gen_ai.request.model";
  TracingAttributesEnum2["System"] = "gen_ai.system";
  TracingAttributesEnum2["Error_Type"] = "error.type";
  TracingAttributesEnum2["Server_Port"] = "server.port";
  TracingAttributesEnum2["Request_Frequency_Penalty"] = "gen_ai.request.frequency_penalty";
  TracingAttributesEnum2["Request_Max_Tokens"] = "gen_ai.request.max_tokens";
  TracingAttributesEnum2["Request_Presence_Penalty"] = "gen_ai.request.presence_penalty";
  TracingAttributesEnum2["Request_Stop_Sequences"] = "gen_ai.request.stop_sequences";
  TracingAttributesEnum2["Request_Temperature"] = "gen_ai.request.temperature";
  TracingAttributesEnum2["Request_Top_P"] = "gen_ai.request.top_p";
  TracingAttributesEnum2["Response_Finish_Reasons"] = "gen_ai.response.finish_reasons";
  TracingAttributesEnum2["Response_Id"] = "gen_ai.response.id";
  TracingAttributesEnum2["Response_Model"] = "gen_ai.response.model";
  TracingAttributesEnum2["Usage_Input_Tokens"] = "gen_ai.usage.input_tokens";
  TracingAttributesEnum2["Usage_Output_Tokens"] = "gen_ai.usage.output_tokens";
  TracingAttributesEnum2["Server_Address"] = "server.address";
})(TracingAttributesEnum || (TracingAttributesEnum = {}));
var INFERENCE_GEN_AI_SYSTEM_NAME = "az.ai.inference";
var isContentRecordingEnabled = () => envVarToBoolean("AZURE_TRACING_GEN_AI_CONTENT_RECORDING_ENABLED");
function getRequestBody2(request3) {
  return { body: JSON.parse(request3.body) };
}
function getSpanName(request3) {
  var _a3;
  const { body } = getRequestBody2(request3);
  return `chat ${(_a3 = body === null || body === void 0 ? void 0 : body.model) !== null && _a3 !== void 0 ? _a3 : ""}`.trim();
}
function onStartTracing(span, request3, url) {
  if (!span.isRecording()) {
    return;
  }
  const urlObj = new URL(url);
  const port = Number(urlObj.port) || (urlObj.protocol === "https:" ? void 0 : 80);
  if (port) {
    span.setAttribute(TracingAttributesEnum.Server_Port, port);
  }
  span.setAttribute(TracingAttributesEnum.Server_Address, urlObj.hostname);
  span.setAttribute(TracingAttributesEnum.Operation_Name, "chat");
  span.setAttribute(TracingAttributesEnum.System, "az.ai.inference");
  const { body } = getRequestBody2(request3);
  if (!body)
    return;
  span.setAttribute(TracingAttributesEnum.Request_Model, body.model);
  span.setAttribute(TracingAttributesEnum.Request_Frequency_Penalty, body.frequency_penalty);
  span.setAttribute(TracingAttributesEnum.Request_Max_Tokens, body.max_tokens);
  span.setAttribute(TracingAttributesEnum.Request_Presence_Penalty, body.presence_penalty);
  span.setAttribute(TracingAttributesEnum.Request_Stop_Sequences, body.stop);
  span.setAttribute(TracingAttributesEnum.Request_Temperature, body.temperature);
  span.setAttribute(TracingAttributesEnum.Request_Top_P, body.top_p);
  if (body.messages) {
    addRequestChatMessageEvent(span, body.messages);
  }
}
function tryProcessResponse2(span, response) {
  var _a3, _b2, _c2;
  if (!span.isRecording()) {
    return;
  }
  if (response === null || response === void 0 ? void 0 : response.bodyAsText) {
    const body = JSON.parse(response.bodyAsText);
    if ((_a3 = body.error) !== null && _a3 !== void 0 ? _a3 : body.message) {
      span.setAttribute(TracingAttributesEnum.Error_Type, `${(_b2 = body.status) !== null && _b2 !== void 0 ? _b2 : body.statusCode}`);
      span.setStatus({
        status: "error",
        error: (_c2 = body.error) !== null && _c2 !== void 0 ? _c2 : body.message
        // message is not in the schema of the response, but it can present if there is crediential error
      });
    }
    span.setAttribute(TracingAttributesEnum.Response_Id, body.id);
    span.setAttribute(TracingAttributesEnum.Response_Model, body.model);
    if (body.choices) {
      span.setAttribute(TracingAttributesEnum.Response_Finish_Reasons, body.choices.map((choice) => choice.finish_reason).join(","));
    }
    if (body.usage) {
      span.setAttribute(TracingAttributesEnum.Usage_Input_Tokens, body.usage.prompt_tokens);
      span.setAttribute(TracingAttributesEnum.Usage_Output_Tokens, body.usage.completion_tokens);
    }
    addResponseChatMessageEvent(span, body);
  }
}
function tryProcessError2(span, error) {
  span.setStatus({
    status: "error",
    error: isError2(error) ? error : void 0
  });
}
function addRequestChatMessageEvent(span, messages) {
  messages.forEach((message) => {
    var _a3;
    if (message.role) {
      const content = {};
      const chatMsg = message;
      if (chatMsg.content) {
        content.content = chatMsg.content;
      }
      if (!isContentRecordingEnabled()) {
        content.content = "";
      }
      const assistantMsg = message;
      if (assistantMsg.tool_calls) {
        content.tool_calls = assistantMsg.tool_calls;
        if (!isContentRecordingEnabled()) {
          const toolCalls = JSON.parse(JSON.stringify(content.tool_calls));
          toolCalls.forEach((toolCall) => {
            if (toolCall.function.arguments) {
              toolCall.function.arguments = "";
            }
            toolCall.function.name = "";
          });
          content.tool_calls = toolCalls;
        }
      }
      const toolMsg = message;
      if (toolMsg.tool_call_id) {
        content.id = toolMsg.tool_call_id;
      }
      (_a3 = span.addEvent) === null || _a3 === void 0 ? void 0 : _a3.call(span, `gen_ai.${message.role}.message`, {
        attributes: {
          "gen_ai.system": INFERENCE_GEN_AI_SYSTEM_NAME,
          "gen_ai.event.content": JSON.stringify(content)
        }
      });
    }
  });
}
function addResponseChatMessageEvent(span, body) {
  var _a3;
  if (!span.addEvent) {
    return;
  }
  (_a3 = body === null || body === void 0 ? void 0 : body.choices) === null || _a3 === void 0 ? void 0 : _a3.forEach((choice) => {
    var _a4;
    let message = {};
    if (choice.message.content) {
      message.content = choice.message.content;
    }
    if (choice.message.tool_calls) {
      message.toolCalls = choice.message.tool_calls;
    }
    if (!isContentRecordingEnabled()) {
      message = JSON.parse(JSON.stringify(message));
      message.content = "";
      if (message.toolCalls) {
        message.toolCalls.forEach((toolCall) => {
          if (toolCall.function.arguments) {
            toolCall.function.arguments = "";
          }
          toolCall.function.name = "";
        });
      }
    }
    const response = {
      finish_reason: choice.finish_reason,
      index: choice.index,
      message
    };
    const attributes = {
      "gen_ai.system": INFERENCE_GEN_AI_SYSTEM_NAME,
      "gen_ai.event.content": JSON.stringify(response)
    };
    (_a4 = span.addEvent) === null || _a4 === void 0 ? void 0 : _a4.call(span, "gen_ai.choice", { attributes });
  });
}
function envVarToBoolean(key) {
  var _a3;
  const value = (_a3 = process.env[key]) !== null && _a3 !== void 0 ? _a3 : process.env[key.toLowerCase()];
  return value !== "false" && value !== "0" && Boolean(value);
}

// node_modules/@azure-rest/ai-inference/dist/esm/tracingPolicy.js
var tracingPolicyName2 = "inferenceTracingPolicy";
function tracingPolicy2() {
  const tracingClient = createTracingClient({
    namespace: "Microsoft.CognitiveServices",
    packageName: "@azure/ai-inference-rest",
    packageVersion: SDK_VERSION3
  });
  return {
    name: tracingPolicyName2,
    async sendRequest(request3, next) {
      var _a3, _b2, _c2, _d2;
      const url = new URL(request3.url);
      if (!tracingClient || !url.href.endsWith("/chat/completions") || ((_b2 = (_a3 = getRequestBody2(request3)) === null || _a3 === void 0 ? void 0 : _a3.body) === null || _b2 === void 0 ? void 0 : _b2.stream)) {
        return next(request3);
      }
      const { span, tracingContext } = (_c2 = tryCreateSpan2(tracingClient, request3)) !== null && _c2 !== void 0 ? _c2 : {};
      if (!span || !tracingContext) {
        return next(request3);
      }
      try {
        (_d2 = request3.tracingOptions) !== null && _d2 !== void 0 ? _d2 : request3.tracingOptions = {};
        request3.tracingOptions.tracingContext = tracingContext;
        onStartTracing(span, request3, request3.url);
        const response = await tracingClient.withContext(tracingContext, next, request3);
        tryProcessResponse2(span, response);
        return response;
      } catch (err) {
        tryProcessError2(span, err);
        throw err;
      } finally {
        span.end();
      }
    }
  };
}
function tryCreateSpan2(tracingClient, request3) {
  try {
    const { span, updatedOptions } = tracingClient.startSpan(getSpanName(request3), { tracingOptions: request3.tracingOptions }, {
      spanKind: "client"
    });
    return { span, tracingContext: updatedOptions.tracingOptions.tracingContext };
  } catch (e) {
    logger3.warning(`Skipping creating a tracing span due to an error: ${getErrorMessage(e)}`);
    return void 0;
  }
}

// node_modules/@azure-rest/ai-inference/dist/esm/modelClient.js
function createClient(endpointParam, credentials, _a3 = {}) {
  var _b2, _c2, _d2, _e, _f, _g, _h, _j;
  var { apiVersion = "2024-05-01-preview" } = _a3, options = __rest(_a3, ["apiVersion"]);
  const endpointUrl = (_c2 = (_b2 = options.endpoint) !== null && _b2 !== void 0 ? _b2 : options.baseUrl) !== null && _c2 !== void 0 ? _c2 : `${endpointParam}`;
  const userAgentInfo = `azsdk-js-ai-inference-rest/1.0.0-beta.6`;
  const userAgentPrefix = options.userAgentOptions && options.userAgentOptions.userAgentPrefix ? `${options.userAgentOptions.userAgentPrefix} ${userAgentInfo}` : `${userAgentInfo}`;
  options = Object.assign(Object.assign({}, options), { userAgentOptions: {
    userAgentPrefix
  }, loggingOptions: {
    logger: (_e = (_d2 = options.loggingOptions) === null || _d2 === void 0 ? void 0 : _d2.logger) !== null && _e !== void 0 ? _e : logger3.info
  }, credentials: {
    scopes: (_g = (_f = options.credentials) === null || _f === void 0 ? void 0 : _f.scopes) !== null && _g !== void 0 ? _g : ["https://ml.azure.com/.default"],
    apiKeyHeaderName: (_j = (_h = options.credentials) === null || _h === void 0 ? void 0 : _h.apiKeyHeaderName) !== null && _j !== void 0 ? _j : "api-key"
  } });
  const client = getClient2(endpointUrl, credentials, options);
  client.pipeline.removePolicy({ name: "ApiVersionPolicy" });
  client.pipeline.addPolicy({
    name: "InferenceTracingPolicy",
    sendRequest: (req, next) => {
      return tracingPolicy2().sendRequest(req, next);
    }
  });
  client.pipeline.addPolicy({
    name: "ClientApiVersionPolicy",
    sendRequest: (req, next) => {
      const url = new URL(req.url);
      if (!url.searchParams.get("api-version") && apiVersion) {
        req.url = `${req.url}${Array.from(url.searchParams.keys()).length > 0 ? "&" : "?"}api-version=${apiVersion}`;
      }
      return next(req);
    }
  });
  if (isKeyCredential(credentials)) {
    client.pipeline.addPolicy({
      name: "customKeyCredentialPolicy",
      async sendRequest(request3, next) {
        request3.headers.set("Authorization", "Bearer " + credentials.key);
        return next(request3);
      }
    });
  }
  return client;
}

// node_modules/@azure-rest/ai-inference/dist/esm/isUnexpected.js
var responseMap = {
  "POST /chat/completions": ["200"],
  "GET /info": ["200"],
  "POST /embeddings": ["200"],
  "POST /images/embeddings": ["200"]
};
function isUnexpected(response) {
  const lroOriginal = response.headers["x-ms-original-url"];
  const url = new URL(lroOriginal !== null && lroOriginal !== void 0 ? lroOriginal : response.request.url);
  const method = response.request.method;
  let pathDetails = responseMap[`${method} ${url.pathname}`];
  if (!pathDetails) {
    pathDetails = getParametrizedPathSuccess(method, url.pathname);
  }
  return !pathDetails.includes(response.status);
}
function getParametrizedPathSuccess(method, path2) {
  var _a3, _b2, _c2, _d2;
  const pathParts = path2.split("/");
  let matchedLen = -1, matchedValue = [];
  for (const [key, value] of Object.entries(responseMap)) {
    if (!key.startsWith(method)) {
      continue;
    }
    const candidatePath = getPathFromMapKey(key);
    const candidateParts = candidatePath.split("/");
    let found = true;
    for (let i = candidateParts.length - 1, j = pathParts.length - 1; i >= 1 && j >= 1; i--, j--) {
      if (((_a3 = candidateParts[i]) === null || _a3 === void 0 ? void 0 : _a3.startsWith("{")) && ((_b2 = candidateParts[i]) === null || _b2 === void 0 ? void 0 : _b2.indexOf("}")) !== -1) {
        const start = candidateParts[i].indexOf("}") + 1, end = (_c2 = candidateParts[i]) === null || _c2 === void 0 ? void 0 : _c2.length;
        const isMatched = new RegExp(`${(_d2 = candidateParts[i]) === null || _d2 === void 0 ? void 0 : _d2.slice(start, end)}`).test(pathParts[j] || "");
        if (!isMatched) {
          found = false;
          break;
        }
        continue;
      }
      if (candidateParts[i] !== pathParts[j]) {
        found = false;
        break;
      }
    }
    if (found && candidatePath.length > matchedLen) {
      matchedLen = candidatePath.length;
      matchedValue = value;
    }
  }
  return matchedValue;
}
function getPathFromMapKey(mapKey) {
  const pathStart = mapKey.indexOf("/");
  return mapKey.slice(pathStart);
}

// node_modules/@azure-rest/ai-inference/dist/esm/index.js
var esm_default = createClient;

// src/helpers.ts
import * as core2 from "@actions/core";
import * as fs from "fs";
function loadContentFromFileOrInput(filePathInput, contentInput, defaultValue) {
  const filePath = core2.getInput(filePathInput);
  const contentString = core2.getInput(contentInput);
  if (filePath !== void 0 && filePath !== "") {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File for ${filePathInput} was not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, "utf-8");
  } else if (contentString !== void 0 && contentString !== "") {
    return contentString;
  } else if (defaultValue !== void 0) {
    return defaultValue;
  } else {
    throw new Error(`Neither ${filePathInput} nor ${contentInput} was set`);
  }
}
function handleUnexpectedResponse(response) {
  const errorCode = response.headers["x-ms-error-code"];
  const errorCodeMsg = errorCode ? ` (error code: ${errorCode})` : "";
  if (response.body && response.body.error) {
    throw response.body.error;
  }
  if (!response.body) {
    throw new Error(
      `Failed to get response from AI service (status: ${response.status})${errorCodeMsg}. Please check network connection and endpoint configuration.`
    );
  }
  throw new Error(
    `AI service returned error response (status: ${response.status})${errorCodeMsg}: ` + (typeof response.body === "string" ? response.body : JSON.stringify(response.body))
  );
}
function buildMessages(promptConfig, systemPrompt, prompt) {
  if (promptConfig?.messages && promptConfig.messages.length > 0) {
    return promptConfig.messages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
  } else {
    return [
      {
        role: "system",
        content: systemPrompt || "You are a helpful assistant"
      },
      { role: "user", content: prompt || "" }
    ];
  }
}
function buildResponseFormat(promptConfig) {
  if (promptConfig?.responseFormat === "json_schema" && promptConfig.jsonSchema) {
    try {
      const schema = JSON.parse(promptConfig.jsonSchema);
      return {
        type: "json_schema",
        json_schema: schema
      };
    } catch (error) {
      throw new Error(
        `Invalid JSON schema: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  return void 0;
}
function buildInferenceRequest(promptConfig, systemPrompt, prompt, modelName, maxTokens, endpoint, token) {
  const messages = buildMessages(promptConfig, systemPrompt, prompt);
  const responseFormat = buildResponseFormat(promptConfig);
  return {
    messages,
    modelName,
    maxTokens,
    endpoint,
    token,
    responseFormat
  };
}

// src/inference.ts
async function simpleInference(request3) {
  core3.info("Running simple inference without tools");
  const client = esm_default(
    request3.endpoint,
    new AzureKeyCredential(request3.token),
    {
      userAgentOptions: { userAgentPrefix: "github-actions-ai-inference" }
    }
  );
  const requestBody = {
    messages: request3.messages,
    max_tokens: request3.maxTokens,
    model: request3.modelName
  };
  if (request3.responseFormat) {
    requestBody.response_format = request3.responseFormat;
  }
  const response = await client.path("/chat/completions").post({
    body: requestBody
  });
  if (isUnexpected(response)) {
    handleUnexpectedResponse(response);
  }
  const modelResponse = response.body.choices[0].message.content;
  core3.info(`Model response: ${modelResponse || "No response content"}`);
  return modelResponse;
}
async function mcpInference(request3, githubMcpClient) {
  core3.info("Running GitHub MCP inference with tools");
  const client = esm_default(
    request3.endpoint,
    new AzureKeyCredential(request3.token),
    {
      userAgentOptions: { userAgentPrefix: "github-actions-ai-inference" }
    }
  );
  const messages = [...request3.messages];
  let iterationCount = 0;
  const maxIterations = 5;
  while (iterationCount < maxIterations) {
    iterationCount++;
    core3.info(`MCP inference iteration ${iterationCount}`);
    const requestBody = {
      messages,
      max_tokens: request3.maxTokens,
      model: request3.modelName,
      tools: githubMcpClient.tools
    };
    if (iterationCount === 1 && request3.responseFormat) {
      requestBody.response_format = request3.responseFormat;
    }
    const response = await client.path("/chat/completions").post({
      body: requestBody
    });
    if (isUnexpected(response)) {
      handleUnexpectedResponse(response);
    }
    const assistantMessage = response.body.choices[0].message;
    const modelResponse = assistantMessage.content;
    const toolCalls = assistantMessage.tool_calls;
    core3.info(`Model response: ${modelResponse || "No response content"}`);
    messages.push({
      role: "assistant",
      content: modelResponse || "",
      ...toolCalls && { tool_calls: toolCalls }
    });
    if (!toolCalls || toolCalls.length === 0) {
      core3.info("No tool calls requested, ending GitHub MCP inference loop");
      return modelResponse;
    }
    core3.info(`Model requested ${toolCalls.length} tool calls`);
    const toolResults = await executeToolCalls(
      githubMcpClient.client,
      toolCalls
    );
    messages.push(...toolResults);
    core3.info("Tool results added, continuing conversation...");
  }
  core3.warning(
    `GitHub MCP inference loop exceeded maximum iterations (${maxIterations})`
  );
  const lastAssistantMessage = messages.slice().reverse().find((msg) => msg.role === "assistant");
  return lastAssistantMessage?.content || null;
}

// src/prompt.ts
import * as core4 from "@actions/core";
import * as fs2 from "fs";
import * as yaml from "js-yaml";
function parseTemplateVariables(input) {
  if (!input.trim()) {
    return {};
  }
  try {
    const parsed = yaml.load(input);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Template variables must be a YAML object");
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse template variables: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
function replaceTemplateVariables(text, variables) {
  return text.replace(/\{\{([\w.-]+)\}\}/g, (match, variableName) => {
    if (variableName in variables) {
      return variables[variableName];
    }
    core4.warning(
      `Template variable '${variableName}' not found in input variables`
    );
    return match;
  });
}
function loadPromptFile(filePath, templateVariables = {}) {
  if (!fs2.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }
  const fileContent = fs2.readFileSync(filePath, "utf-8");
  const processedContent = replaceTemplateVariables(
    fileContent,
    templateVariables
  );
  try {
    const config = yaml.load(processedContent);
    if (!config.messages || !Array.isArray(config.messages)) {
      throw new Error('Prompt file must contain a "messages" array');
    }
    for (const message of config.messages) {
      if (!message.role || !message.content) {
        throw new Error(
          'Each message must have "role" and "content" properties'
        );
      }
      if (!["system", "user", "assistant"].includes(message.role)) {
        throw new Error(`Invalid message role: ${message.role}`);
      }
    }
    return config;
  } catch (error) {
    throw new Error(
      `Failed to parse prompt file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
function isPromptYamlFile(filePath) {
  return filePath.endsWith(".prompt.yml") || filePath.endsWith(".prompt.yaml");
}

// src/main.ts
var RESPONSE_FILE = "modelResponse.txt";
async function run() {
  try {
    const promptFilePath = core5.getInput("prompt-file");
    const inputVariables = core5.getInput("input");
    let promptConfig = void 0;
    let systemPrompt = void 0;
    let prompt = void 0;
    if (promptFilePath && isPromptYamlFile(promptFilePath)) {
      core5.info("Using prompt YAML file format");
      const templateVariables = parseTemplateVariables(inputVariables);
      promptConfig = loadPromptFile(promptFilePath, templateVariables);
    } else {
      core5.info("Using legacy prompt format");
      prompt = loadContentFromFileOrInput("prompt-file", "prompt");
      systemPrompt = loadContentFromFileOrInput(
        "system-prompt-file",
        "system-prompt",
        "You are a helpful assistant"
      );
    }
    const modelName = promptConfig?.model || core5.getInput("model");
    const maxTokens = parseInt(core5.getInput("max-tokens"), 10);
    const token = process.env["GITHUB_TOKEN"] || core5.getInput("token");
    if (token === void 0) {
      throw new Error("GITHUB_TOKEN is not set");
    }
    const endpoint = core5.getInput("endpoint");
    const inferenceRequest = buildInferenceRequest(
      promptConfig,
      systemPrompt,
      prompt,
      modelName,
      maxTokens,
      endpoint,
      token
    );
    const enableMcp = core5.getBooleanInput("enable-github-mcp") || false;
    let modelResponse = null;
    if (enableMcp) {
      const mcpClient = await connectToGitHubMCP(inferenceRequest.token);
      if (mcpClient) {
        modelResponse = await mcpInference(inferenceRequest, mcpClient);
      } else {
        core5.warning("MCP connection failed, falling back to simple inference");
        modelResponse = await simpleInference(inferenceRequest);
      }
    } else {
      modelResponse = await simpleInference(inferenceRequest);
    }
    core5.setOutput("response", modelResponse || "");
    const responseFilePath = path.join(tempDir(), RESPONSE_FILE);
    core5.setOutput("response-file", responseFilePath);
    if (modelResponse && modelResponse !== "") {
      fs3.writeFileSync(responseFilePath, modelResponse, "utf-8");
    }
  } catch (error) {
    if (error instanceof Error) {
      core5.setFailed(error.message);
    } else {
      core5.setFailed("An unexpected error occurred");
    }
  }
}
function tempDir() {
  const tempDirectory = process.env["RUNNER_TEMP"] || os3.tmpdir();
  return tempDirectory;
}

// src/index.ts
run();
//# sourceMappingURL=index.js.map