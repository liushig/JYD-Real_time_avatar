var Yd = Object.defineProperty;
var Gd = (e, t, r) => t in e ? Yd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var lt = (e, t, r) => Gd(e, typeof t != "symbol" ? t + "" : t, r);
import { g as Ud, c as Xd, p as fr } from "./index-D9fhh0Vw.js";
var Ol = { exports: {} };
(function(e, t) {
  (function(r, i) {
    e.exports = i();
  })(Xd, function() {
    var r = 1e3, i = 6e4, n = 36e5, a = "millisecond", o = "second", s = "minute", c = "hour", l = "day", h = "week", u = "month", f = "quarter", p = "year", g = "date", m = "Invalid Date", y = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, x = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, b = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(A) {
      var L = ["th", "st", "nd", "rd"], T = A % 100;
      return "[" + A + (L[(T - 20) % 10] || L[T] || L[0]) + "]";
    } }, _ = function(A, L, T) {
      var $ = String(A);
      return !$ || $.length >= L ? A : "" + Array(L + 1 - $.length).join(T) + A;
    }, S = { s: _, z: function(A) {
      var L = -A.utcOffset(), T = Math.abs(L), $ = Math.floor(T / 60), B = T % 60;
      return (L <= 0 ? "+" : "-") + _($, 2, "0") + ":" + _(B, 2, "0");
    }, m: function A(L, T) {
      if (L.date() < T.date()) return -A(T, L);
      var $ = 12 * (T.year() - L.year()) + (T.month() - L.month()), B = L.clone().add($, u), N = T - B < 0, G = L.clone().add($ + (N ? -1 : 1), u);
      return +(-($ + (T - B) / (N ? B - G : G - B)) || 0);
    }, a: function(A) {
      return A < 0 ? Math.ceil(A) || 0 : Math.floor(A);
    }, p: function(A) {
      return { M: u, y: p, w: h, d: l, D: g, h: c, m: s, s: o, ms: a, Q: f }[A] || String(A || "").toLowerCase().replace(/s$/, "");
    }, u: function(A) {
      return A === void 0;
    } }, k = "en", C = {};
    C[k] = b;
    var w = "$isDayjsObject", O = function(A) {
      return A instanceof P || !(!A || !A[w]);
    }, I = function A(L, T, $) {
      var B;
      if (!L) return k;
      if (typeof L == "string") {
        var N = L.toLowerCase();
        C[N] && (B = N), T && (C[N] = T, B = N);
        var G = L.split("-");
        if (!B && G.length > 1) return A(G[0]);
      } else {
        var tt = L.name;
        C[tt] = L, B = tt;
      }
      return !$ && B && (k = B), B || !$ && k;
    }, F = function(A, L) {
      if (O(A)) return A.clone();
      var T = typeof L == "object" ? L : {};
      return T.date = A, T.args = arguments, new P(T);
    }, M = S;
    M.l = I, M.i = O, M.w = function(A, L) {
      return F(A, { locale: L.$L, utc: L.$u, x: L.$x, $offset: L.$offset });
    };
    var P = function() {
      function A(T) {
        this.$L = I(T.locale, null, !0), this.parse(T), this.$x = this.$x || T.x || {}, this[w] = !0;
      }
      var L = A.prototype;
      return L.parse = function(T) {
        this.$d = function($) {
          var B = $.date, N = $.utc;
          if (B === null) return /* @__PURE__ */ new Date(NaN);
          if (M.u(B)) return /* @__PURE__ */ new Date();
          if (B instanceof Date) return new Date(B);
          if (typeof B == "string" && !/Z$/i.test(B)) {
            var G = B.match(y);
            if (G) {
              var tt = G[2] - 1 || 0, K = (G[7] || "0").substring(0, 3);
              return N ? new Date(Date.UTC(G[1], tt, G[3] || 1, G[4] || 0, G[5] || 0, G[6] || 0, K)) : new Date(G[1], tt, G[3] || 1, G[4] || 0, G[5] || 0, G[6] || 0, K);
            }
          }
          return new Date(B);
        }(T), this.init();
      }, L.init = function() {
        var T = this.$d;
        this.$y = T.getFullYear(), this.$M = T.getMonth(), this.$D = T.getDate(), this.$W = T.getDay(), this.$H = T.getHours(), this.$m = T.getMinutes(), this.$s = T.getSeconds(), this.$ms = T.getMilliseconds();
      }, L.$utils = function() {
        return M;
      }, L.isValid = function() {
        return this.$d.toString() !== m;
      }, L.isSame = function(T, $) {
        var B = F(T);
        return this.startOf($) <= B && B <= this.endOf($);
      }, L.isAfter = function(T, $) {
        return F(T) < this.startOf($);
      }, L.isBefore = function(T, $) {
        return this.endOf($) < F(T);
      }, L.$g = function(T, $, B) {
        return M.u(T) ? this[$] : this.set(B, T);
      }, L.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, L.valueOf = function() {
        return this.$d.getTime();
      }, L.startOf = function(T, $) {
        var B = this, N = !!M.u($) || $, G = M.p(T), tt = function(me, mt) {
          var ye = M.w(B.$u ? Date.UTC(B.$y, mt, me) : new Date(B.$y, mt, me), B);
          return N ? ye : ye.endOf(l);
        }, K = function(me, mt) {
          return M.w(B.toDate()[me].apply(B.toDate("s"), (N ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(mt)), B);
        }, it = this.$W, ot = this.$M, ct = this.$D, Pt = "set" + (this.$u ? "UTC" : "");
        switch (G) {
          case p:
            return N ? tt(1, 0) : tt(31, 11);
          case u:
            return N ? tt(1, ot) : tt(0, ot + 1);
          case h:
            var Ot = this.$locale().weekStart || 0, ge = (it < Ot ? it + 7 : it) - Ot;
            return tt(N ? ct - ge : ct + (6 - ge), ot);
          case l:
          case g:
            return K(Pt + "Hours", 0);
          case c:
            return K(Pt + "Minutes", 1);
          case s:
            return K(Pt + "Seconds", 2);
          case o:
            return K(Pt + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, L.endOf = function(T) {
        return this.startOf(T, !1);
      }, L.$set = function(T, $) {
        var B, N = M.p(T), G = "set" + (this.$u ? "UTC" : ""), tt = (B = {}, B[l] = G + "Date", B[g] = G + "Date", B[u] = G + "Month", B[p] = G + "FullYear", B[c] = G + "Hours", B[s] = G + "Minutes", B[o] = G + "Seconds", B[a] = G + "Milliseconds", B)[N], K = N === l ? this.$D + ($ - this.$W) : $;
        if (N === u || N === p) {
          var it = this.clone().set(g, 1);
          it.$d[tt](K), it.init(), this.$d = it.set(g, Math.min(this.$D, it.daysInMonth())).$d;
        } else tt && this.$d[tt](K);
        return this.init(), this;
      }, L.set = function(T, $) {
        return this.clone().$set(T, $);
      }, L.get = function(T) {
        return this[M.p(T)]();
      }, L.add = function(T, $) {
        var B, N = this;
        T = Number(T);
        var G = M.p($), tt = function(ot) {
          var ct = F(N);
          return M.w(ct.date(ct.date() + Math.round(ot * T)), N);
        };
        if (G === u) return this.set(u, this.$M + T);
        if (G === p) return this.set(p, this.$y + T);
        if (G === l) return tt(1);
        if (G === h) return tt(7);
        var K = (B = {}, B[s] = i, B[c] = n, B[o] = r, B)[G] || 1, it = this.$d.getTime() + T * K;
        return M.w(it, this);
      }, L.subtract = function(T, $) {
        return this.add(-1 * T, $);
      }, L.format = function(T) {
        var $ = this, B = this.$locale();
        if (!this.isValid()) return B.invalidDate || m;
        var N = T || "YYYY-MM-DDTHH:mm:ssZ", G = M.z(this), tt = this.$H, K = this.$m, it = this.$M, ot = B.weekdays, ct = B.months, Pt = B.meridiem, Ot = function(mt, ye, Mr, xi) {
          return mt && (mt[ye] || mt($, N)) || Mr[ye].slice(0, xi);
        }, ge = function(mt) {
          return M.s(tt % 12 || 12, mt, "0");
        }, me = Pt || function(mt, ye, Mr) {
          var xi = mt < 12 ? "AM" : "PM";
          return Mr ? xi.toLowerCase() : xi;
        };
        return N.replace(x, function(mt, ye) {
          return ye || function(Mr) {
            switch (Mr) {
              case "YY":
                return String($.$y).slice(-2);
              case "YYYY":
                return M.s($.$y, 4, "0");
              case "M":
                return it + 1;
              case "MM":
                return M.s(it + 1, 2, "0");
              case "MMM":
                return Ot(B.monthsShort, it, ct, 3);
              case "MMMM":
                return Ot(ct, it);
              case "D":
                return $.$D;
              case "DD":
                return M.s($.$D, 2, "0");
              case "d":
                return String($.$W);
              case "dd":
                return Ot(B.weekdaysMin, $.$W, ot, 2);
              case "ddd":
                return Ot(B.weekdaysShort, $.$W, ot, 3);
              case "dddd":
                return ot[$.$W];
              case "H":
                return String(tt);
              case "HH":
                return M.s(tt, 2, "0");
              case "h":
                return ge(1);
              case "hh":
                return ge(2);
              case "a":
                return me(tt, K, !0);
              case "A":
                return me(tt, K, !1);
              case "m":
                return String(K);
              case "mm":
                return M.s(K, 2, "0");
              case "s":
                return String($.$s);
              case "ss":
                return M.s($.$s, 2, "0");
              case "SSS":
                return M.s($.$ms, 3, "0");
              case "Z":
                return G;
            }
            return null;
          }(mt) || G.replace(":", "");
        });
      }, L.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, L.diff = function(T, $, B) {
        var N, G = this, tt = M.p($), K = F(T), it = (K.utcOffset() - this.utcOffset()) * i, ot = this - K, ct = function() {
          return M.m(G, K);
        };
        switch (tt) {
          case p:
            N = ct() / 12;
            break;
          case u:
            N = ct();
            break;
          case f:
            N = ct() / 3;
            break;
          case h:
            N = (ot - it) / 6048e5;
            break;
          case l:
            N = (ot - it) / 864e5;
            break;
          case c:
            N = ot / n;
            break;
          case s:
            N = ot / i;
            break;
          case o:
            N = ot / r;
            break;
          default:
            N = ot;
        }
        return B ? N : M.a(N);
      }, L.daysInMonth = function() {
        return this.endOf(u).$D;
      }, L.$locale = function() {
        return C[this.$L];
      }, L.locale = function(T, $) {
        if (!T) return this.$L;
        var B = this.clone(), N = I(T, $, !0);
        return N && (B.$L = N), B;
      }, L.clone = function() {
        return M.w(this.$d, this);
      }, L.toDate = function() {
        return new Date(this.valueOf());
      }, L.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, L.toISOString = function() {
        return this.$d.toISOString();
      }, L.toString = function() {
        return this.$d.toUTCString();
      }, A;
    }(), D = P.prototype;
    return F.prototype = D, [["$ms", a], ["$s", o], ["$m", s], ["$H", c], ["$W", l], ["$M", u], ["$y", p], ["$D", g]].forEach(function(A) {
      D[A[1]] = function(L) {
        return this.$g(L, A[0], A[1]);
      };
    }), F.extend = function(A, L) {
      return A.$i || (A(L, P, F), A.$i = !0), F;
    }, F.locale = I, F.isDayjs = O, F.unix = function(A) {
      return F(1e3 * A);
    }, F.en = C[k], F.Ls = C, F.p = {}, F;
  });
})(Ol);
var Vd = Ol.exports;
const Zd = /* @__PURE__ */ Ud(Vd), Li = {
  /* CLAMP */
  min: {
    r: 0,
    g: 0,
    b: 0,
    s: 0,
    l: 0,
    a: 0
  },
  max: {
    r: 255,
    g: 255,
    b: 255,
    h: 360,
    s: 100,
    l: 100,
    a: 1
  },
  clamp: {
    r: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    g: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    b: (e) => e >= 255 ? 255 : e < 0 ? 0 : e,
    h: (e) => e % 360,
    s: (e) => e >= 100 ? 100 : e < 0 ? 0 : e,
    l: (e) => e >= 100 ? 100 : e < 0 ? 0 : e,
    a: (e) => e >= 1 ? 1 : e < 0 ? 0 : e
  },
  /* CONVERSION */
  //SOURCE: https://planetcalc.com/7779
  toLinear: (e) => {
    const t = e / 255;
    return e > 0.03928 ? Math.pow((t + 0.055) / 1.055, 2.4) : t / 12.92;
  },
  //SOURCE: https://gist.github.com/mjackson/5311256
  hue2rgb: (e, t, r) => (r < 0 && (r += 1), r > 1 && (r -= 1), r < 1 / 6 ? e + (t - e) * 6 * r : r < 1 / 2 ? t : r < 2 / 3 ? e + (t - e) * (2 / 3 - r) * 6 : e),
  hsl2rgb: ({ h: e, s: t, l: r }, i) => {
    if (!t)
      return r * 2.55;
    e /= 360, t /= 100, r /= 100;
    const n = r < 0.5 ? r * (1 + t) : r + t - r * t, a = 2 * r - n;
    switch (i) {
      case "r":
        return Li.hue2rgb(a, n, e + 1 / 3) * 255;
      case "g":
        return Li.hue2rgb(a, n, e) * 255;
      case "b":
        return Li.hue2rgb(a, n, e - 1 / 3) * 255;
    }
  },
  rgb2hsl: ({ r: e, g: t, b: r }, i) => {
    e /= 255, t /= 255, r /= 255;
    const n = Math.max(e, t, r), a = Math.min(e, t, r), o = (n + a) / 2;
    if (i === "l")
      return o * 100;
    if (n === a)
      return 0;
    const s = n - a, c = o > 0.5 ? s / (2 - n - a) : s / (n + a);
    if (i === "s")
      return c * 100;
    switch (n) {
      case e:
        return ((t - r) / s + (t < r ? 6 : 0)) * 60;
      case t:
        return ((r - e) / s + 2) * 60;
      case r:
        return ((e - t) / s + 4) * 60;
      default:
        return -1;
    }
  }
}, Kd = {
  /* API */
  clamp: (e, t, r) => t > r ? Math.min(t, Math.max(r, e)) : Math.min(r, Math.max(t, e)),
  round: (e) => Math.round(e * 1e10) / 1e10
}, Qd = {
  /* API */
  dec2hex: (e) => {
    const t = Math.round(e).toString(16);
    return t.length > 1 ? t : `0${t}`;
  }
}, Q = {
  channel: Li,
  lang: Kd,
  unit: Qd
}, xe = {};
for (let e = 0; e <= 255; e++)
  xe[e] = Q.unit.dec2hex(e);
const _t = {
  ALL: 0,
  RGB: 1,
  HSL: 2
};
class Jd {
  constructor() {
    this.type = _t.ALL;
  }
  /* API */
  get() {
    return this.type;
  }
  set(t) {
    if (this.type && this.type !== t)
      throw new Error("Cannot change both RGB and HSL channels at the same time");
    this.type = t;
  }
  reset() {
    this.type = _t.ALL;
  }
  is(t) {
    return this.type === t;
  }
}
class tg {
  /* CONSTRUCTOR */
  constructor(t, r) {
    this.color = r, this.changed = !1, this.data = t, this.type = new Jd();
  }
  /* API */
  set(t, r) {
    return this.color = r, this.changed = !1, this.data = t, this.type.type = _t.ALL, this;
  }
  /* HELPERS */
  _ensureHSL() {
    const t = this.data, { h: r, s: i, l: n } = t;
    r === void 0 && (t.h = Q.channel.rgb2hsl(t, "h")), i === void 0 && (t.s = Q.channel.rgb2hsl(t, "s")), n === void 0 && (t.l = Q.channel.rgb2hsl(t, "l"));
  }
  _ensureRGB() {
    const t = this.data, { r, g: i, b: n } = t;
    r === void 0 && (t.r = Q.channel.hsl2rgb(t, "r")), i === void 0 && (t.g = Q.channel.hsl2rgb(t, "g")), n === void 0 && (t.b = Q.channel.hsl2rgb(t, "b"));
  }
  /* GETTERS */
  get r() {
    const t = this.data, r = t.r;
    return !this.type.is(_t.HSL) && r !== void 0 ? r : (this._ensureHSL(), Q.channel.hsl2rgb(t, "r"));
  }
  get g() {
    const t = this.data, r = t.g;
    return !this.type.is(_t.HSL) && r !== void 0 ? r : (this._ensureHSL(), Q.channel.hsl2rgb(t, "g"));
  }
  get b() {
    const t = this.data, r = t.b;
    return !this.type.is(_t.HSL) && r !== void 0 ? r : (this._ensureHSL(), Q.channel.hsl2rgb(t, "b"));
  }
  get h() {
    const t = this.data, r = t.h;
    return !this.type.is(_t.RGB) && r !== void 0 ? r : (this._ensureRGB(), Q.channel.rgb2hsl(t, "h"));
  }
  get s() {
    const t = this.data, r = t.s;
    return !this.type.is(_t.RGB) && r !== void 0 ? r : (this._ensureRGB(), Q.channel.rgb2hsl(t, "s"));
  }
  get l() {
    const t = this.data, r = t.l;
    return !this.type.is(_t.RGB) && r !== void 0 ? r : (this._ensureRGB(), Q.channel.rgb2hsl(t, "l"));
  }
  get a() {
    return this.data.a;
  }
  /* SETTERS */
  set r(t) {
    this.type.set(_t.RGB), this.changed = !0, this.data.r = t;
  }
  set g(t) {
    this.type.set(_t.RGB), this.changed = !0, this.data.g = t;
  }
  set b(t) {
    this.type.set(_t.RGB), this.changed = !0, this.data.b = t;
  }
  set h(t) {
    this.type.set(_t.HSL), this.changed = !0, this.data.h = t;
  }
  set s(t) {
    this.type.set(_t.HSL), this.changed = !0, this.data.s = t;
  }
  set l(t) {
    this.type.set(_t.HSL), this.changed = !0, this.data.l = t;
  }
  set a(t) {
    this.changed = !0, this.data.a = t;
  }
}
const vn = new tg({ r: 0, g: 0, b: 0, a: 0 }, "transparent"), er = {
  /* VARIABLES */
  re: /^#((?:[a-f0-9]{2}){2,4}|[a-f0-9]{3})$/i,
  /* API */
  parse: (e) => {
    if (e.charCodeAt(0) !== 35)
      return;
    const t = e.match(er.re);
    if (!t)
      return;
    const r = t[1], i = parseInt(r, 16), n = r.length, a = n % 4 === 0, o = n > 4, s = o ? 1 : 17, c = o ? 8 : 4, l = a ? 0 : -1, h = o ? 255 : 15;
    return vn.set({
      r: (i >> c * (l + 3) & h) * s,
      g: (i >> c * (l + 2) & h) * s,
      b: (i >> c * (l + 1) & h) * s,
      a: a ? (i & h) * s / 255 : 1
    }, e);
  },
  stringify: (e) => {
    const { r: t, g: r, b: i, a: n } = e;
    return n < 1 ? `#${xe[Math.round(t)]}${xe[Math.round(r)]}${xe[Math.round(i)]}${xe[Math.round(n * 255)]}` : `#${xe[Math.round(t)]}${xe[Math.round(r)]}${xe[Math.round(i)]}`;
  }
}, Fe = {
  /* VARIABLES */
  re: /^hsla?\(\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?(?:deg|grad|rad|turn)?)\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?%)\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?%)(?:\s*?(?:,|\/)\s*?\+?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e-?\d+)?(%)?))?\s*?\)$/i,
  hueRe: /^(.+?)(deg|grad|rad|turn)$/i,
  /* HELPERS */
  _hue2deg: (e) => {
    const t = e.match(Fe.hueRe);
    if (t) {
      const [, r, i] = t;
      switch (i) {
        case "grad":
          return Q.channel.clamp.h(parseFloat(r) * 0.9);
        case "rad":
          return Q.channel.clamp.h(parseFloat(r) * 180 / Math.PI);
        case "turn":
          return Q.channel.clamp.h(parseFloat(r) * 360);
      }
    }
    return Q.channel.clamp.h(parseFloat(e));
  },
  /* API */
  parse: (e) => {
    const t = e.charCodeAt(0);
    if (t !== 104 && t !== 72)
      return;
    const r = e.match(Fe.re);
    if (!r)
      return;
    const [, i, n, a, o, s] = r;
    return vn.set({
      h: Fe._hue2deg(i),
      s: Q.channel.clamp.s(parseFloat(n)),
      l: Q.channel.clamp.l(parseFloat(a)),
      a: o ? Q.channel.clamp.a(s ? parseFloat(o) / 100 : parseFloat(o)) : 1
    }, e);
  },
  stringify: (e) => {
    const { h: t, s: r, l: i, a: n } = e;
    return n < 1 ? `hsla(${Q.lang.round(t)}, ${Q.lang.round(r)}%, ${Q.lang.round(i)}%, ${n})` : `hsl(${Q.lang.round(t)}, ${Q.lang.round(r)}%, ${Q.lang.round(i)}%)`;
  }
}, jr = {
  /* VARIABLES */
  colors: {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyanaqua: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    transparent: "#00000000",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
  },
  /* API */
  parse: (e) => {
    e = e.toLowerCase();
    const t = jr.colors[e];
    if (t)
      return er.parse(t);
  },
  stringify: (e) => {
    const t = er.stringify(e);
    for (const r in jr.colors)
      if (jr.colors[r] === t)
        return r;
  }
}, Ir = {
  /* VARIABLES */
  re: /^rgba?\(\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))\s*?(?:,|\s)\s*?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?))(?:\s*?(?:,|\/)\s*?\+?(-?(?:\d+(?:\.\d+)?|(?:\.\d+))(?:e\d+)?(%?)))?\s*?\)$/i,
  /* API */
  parse: (e) => {
    const t = e.charCodeAt(0);
    if (t !== 114 && t !== 82)
      return;
    const r = e.match(Ir.re);
    if (!r)
      return;
    const [, i, n, a, o, s, c, l, h] = r;
    return vn.set({
      r: Q.channel.clamp.r(n ? parseFloat(i) * 2.55 : parseFloat(i)),
      g: Q.channel.clamp.g(o ? parseFloat(a) * 2.55 : parseFloat(a)),
      b: Q.channel.clamp.b(c ? parseFloat(s) * 2.55 : parseFloat(s)),
      a: l ? Q.channel.clamp.a(h ? parseFloat(l) / 100 : parseFloat(l)) : 1
    }, e);
  },
  stringify: (e) => {
    const { r: t, g: r, b: i, a: n } = e;
    return n < 1 ? `rgba(${Q.lang.round(t)}, ${Q.lang.round(r)}, ${Q.lang.round(i)}, ${Q.lang.round(n)})` : `rgb(${Q.lang.round(t)}, ${Q.lang.round(r)}, ${Q.lang.round(i)})`;
  }
}, Kt = {
  /* VARIABLES */
  format: {
    keyword: jr,
    hex: er,
    rgb: Ir,
    rgba: Ir,
    hsl: Fe,
    hsla: Fe
  },
  /* API */
  parse: (e) => {
    if (typeof e != "string")
      return e;
    const t = er.parse(e) || Ir.parse(e) || Fe.parse(e) || jr.parse(e);
    if (t)
      return t;
    throw new Error(`Unsupported color format: "${e}"`);
  },
  stringify: (e) => !e.changed && e.color ? e.color : e.type.is(_t.HSL) || e.data.r === void 0 ? Fe.stringify(e) : e.a < 1 || !Number.isInteger(e.r) || !Number.isInteger(e.g) || !Number.isInteger(e.b) ? Ir.stringify(e) : er.stringify(e)
}, Dl = (e, t) => {
  const r = Kt.parse(e);
  for (const i in t)
    r[i] = Q.channel.clamp[i](t[i]);
  return Kt.stringify(r);
}, Yr = (e, t, r = 0, i = 1) => {
  if (typeof e != "number")
    return Dl(e, { a: t });
  const n = vn.set({
    r: Q.channel.clamp.r(e),
    g: Q.channel.clamp.g(t),
    b: Q.channel.clamp.b(r),
    a: Q.channel.clamp.a(i)
  });
  return Kt.stringify(n);
}, eg = (e) => {
  const { r: t, g: r, b: i } = Kt.parse(e), n = 0.2126 * Q.channel.toLinear(t) + 0.7152 * Q.channel.toLinear(r) + 0.0722 * Q.channel.toLinear(i);
  return Q.lang.round(n);
}, rg = (e) => eg(e) >= 0.5, li = (e) => !rg(e), Rl = (e, t, r) => {
  const i = Kt.parse(e), n = i[t], a = Q.channel.clamp[t](n + r);
  return n !== a && (i[t] = a), Kt.stringify(i);
}, z = (e, t) => Rl(e, "l", t), X = (e, t) => Rl(e, "l", -t), v = (e, t) => {
  const r = Kt.parse(e), i = {};
  for (const n in t)
    t[n] && (i[n] = r[n] + t[n]);
  return Dl(e, i);
}, ig = (e, t, r = 50) => {
  const { r: i, g: n, b: a, a: o } = Kt.parse(e), { r: s, g: c, b: l, a: h } = Kt.parse(t), u = r / 100, f = u * 2 - 1, p = o - h, m = ((f * p === -1 ? f : (f + p) / (1 + f * p)) + 1) / 2, y = 1 - m, x = i * m + s * y, b = n * m + c * y, _ = a * m + l * y, S = o * u + h * (1 - u);
  return Yr(x, b, _, S);
}, R = (e, t = 100) => {
  const r = Kt.parse(e);
  return r.r = 255 - r.r, r.g = 255 - r.g, r.b = 255 - r.b, ig(r, e, t);
};
var Il = Object.defineProperty, d = (e, t) => Il(e, "name", { value: t, configurable: !0 }), ng = (e, t) => {
  for (var r in t)
    Il(e, r, { get: t[r], enumerable: !0 });
}, ee = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
}, E = {
  trace: /* @__PURE__ */ d((...e) => {
  }, "trace"),
  debug: /* @__PURE__ */ d((...e) => {
  }, "debug"),
  info: /* @__PURE__ */ d((...e) => {
  }, "info"),
  warn: /* @__PURE__ */ d((...e) => {
  }, "warn"),
  error: /* @__PURE__ */ d((...e) => {
  }, "error"),
  fatal: /* @__PURE__ */ d((...e) => {
  }, "fatal")
}, os = /* @__PURE__ */ d(function(e = "fatal") {
  let t = ee.fatal;
  typeof e == "string" ? e.toLowerCase() in ee && (t = ee[e]) : typeof e == "number" && (t = e), E.trace = () => {
  }, E.debug = () => {
  }, E.info = () => {
  }, E.warn = () => {
  }, E.error = () => {
  }, E.fatal = () => {
  }, t <= ee.fatal && (E.fatal = console.error ? console.error.bind(console, Nt("FATAL"), "color: orange") : console.log.bind(console, "\x1B[35m", Nt("FATAL"))), t <= ee.error && (E.error = console.error ? console.error.bind(console, Nt("ERROR"), "color: orange") : console.log.bind(console, "\x1B[31m", Nt("ERROR"))), t <= ee.warn && (E.warn = console.warn ? console.warn.bind(console, Nt("WARN"), "color: orange") : console.log.bind(console, "\x1B[33m", Nt("WARN"))), t <= ee.info && (E.info = console.info ? console.info.bind(console, Nt("INFO"), "color: lightblue") : console.log.bind(console, "\x1B[34m", Nt("INFO"))), t <= ee.debug && (E.debug = console.debug ? console.debug.bind(console, Nt("DEBUG"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", Nt("DEBUG"))), t <= ee.trace && (E.trace = console.debug ? console.debug.bind(console, Nt("TRACE"), "color: lightgreen") : console.log.bind(console, "\x1B[32m", Nt("TRACE")));
}, "setLogLevel"), Nt = /* @__PURE__ */ d((e) => `%c${Zd().format("ss.SSS")} : ${e} : `, "format"), Pl = /^-{3}\s*[\n\r](.*?)[\n\r]-{3}\s*[\n\r]+/s, Gr = /%{2}{\s*(?:(\w+)\s*:|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi, ag = /\s*%%.*\n/gm, nr, Nl = (nr = class extends Error {
  constructor(t) {
    super(t), this.name = "UnknownDiagramError";
  }
}, d(nr, "UnknownDiagramError"), nr), pr = {}, ls = /* @__PURE__ */ d(function(e, t) {
  e = e.replace(Pl, "").replace(Gr, "").replace(ag, `
`);
  for (const [r, { detector: i }] of Object.entries(pr))
    if (i(e, t))
      return r;
  throw new Nl(
    `No diagram type detected matching given configuration for text: ${e}`
  );
}, "detectType"), zl = /* @__PURE__ */ d((...e) => {
  for (const { id: t, detector: r, loader: i } of e)
    ql(t, r, i);
}, "registerLazyLoadedDiagrams"), ql = /* @__PURE__ */ d((e, t, r) => {
  pr[e] && E.warn(`Detector with key ${e} already exists. Overwriting.`), pr[e] = { detector: t, loader: r }, E.debug(`Detector with key ${e} added${r ? " with loader" : ""}`);
}, "addDetector"), sg = /* @__PURE__ */ d((e) => pr[e].loader, "getDiagramLoader"), pa = /* @__PURE__ */ d((e, t, { depth: r = 2, clobber: i = !1 } = {}) => {
  const n = { depth: r, clobber: i };
  return Array.isArray(t) && !Array.isArray(e) ? (t.forEach((a) => pa(e, a, n)), e) : Array.isArray(t) && Array.isArray(e) ? (t.forEach((a) => {
    e.includes(a) || e.push(a);
  }), e) : e === void 0 || r <= 0 ? e != null && typeof e == "object" && typeof t == "object" ? Object.assign(e, t) : t : (t !== void 0 && typeof e == "object" && typeof t == "object" && Object.keys(t).forEach((a) => {
    typeof t[a] == "object" && (e[a] === void 0 || typeof e[a] == "object") ? (e[a] === void 0 && (e[a] = Array.isArray(t[a]) ? [] : {}), e[a] = pa(e[a], t[a], { depth: r - 1, clobber: i })) : (i || typeof e[a] != "object" && typeof t[a] != "object") && (e[a] = t[a]);
  }), e);
}, "assignWithDepth"), Ct = pa, Sn = "#ffffff", Tn = "#f2f2f2", St = /* @__PURE__ */ d((e, t) => t ? v(e, { s: -40, l: 10 }) : v(e, { s: -40, l: -10 }), "mkBorder"), ar, og = (ar = class {
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#fff4dd", this.noteBkgColor = "#fff5ad", this.noteTextColor = "#333", this.THEME_COLOR_LIMIT = 12, this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px";
  }
  updateColors() {
    var r, i, n, a, o, s, c, l, h, u, f, p, g, m, y, x, b, _, S, k, C;
    if (this.primaryTextColor = this.primaryTextColor || (this.darkMode ? "#eee" : "#333"), this.secondaryColor = this.secondaryColor || v(this.primaryColor, { h: -120 }), this.tertiaryColor = this.tertiaryColor || v(this.primaryColor, { h: 180, l: 5 }), this.primaryBorderColor = this.primaryBorderColor || St(this.primaryColor, this.darkMode), this.secondaryBorderColor = this.secondaryBorderColor || St(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = this.tertiaryBorderColor || St(this.tertiaryColor, this.darkMode), this.noteBorderColor = this.noteBorderColor || St(this.noteBkgColor, this.darkMode), this.noteBkgColor = this.noteBkgColor || "#fff5ad", this.noteTextColor = this.noteTextColor || "#333", this.secondaryTextColor = this.secondaryTextColor || R(this.secondaryColor), this.tertiaryTextColor = this.tertiaryTextColor || R(this.tertiaryColor), this.lineColor = this.lineColor || R(this.background), this.arrowheadColor = this.arrowheadColor || R(this.background), this.textColor = this.textColor || this.primaryTextColor, this.border2 = this.border2 || this.tertiaryBorderColor, this.nodeBkg = this.nodeBkg || this.primaryColor, this.mainBkg = this.mainBkg || this.primaryColor, this.nodeBorder = this.nodeBorder || this.primaryBorderColor, this.clusterBkg = this.clusterBkg || this.tertiaryColor, this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor, this.defaultLinkColor = this.defaultLinkColor || this.lineColor, this.titleColor = this.titleColor || this.tertiaryTextColor, this.edgeLabelBackground = this.edgeLabelBackground || (this.darkMode ? X(this.secondaryColor, 30) : this.secondaryColor), this.nodeTextColor = this.nodeTextColor || this.primaryTextColor, this.actorBorder = this.actorBorder || this.primaryBorderColor, this.actorBkg = this.actorBkg || this.mainBkg, this.actorTextColor = this.actorTextColor || this.primaryTextColor, this.actorLineColor = this.actorLineColor || this.actorBorder, this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg, this.signalColor = this.signalColor || this.textColor, this.signalTextColor = this.signalTextColor || this.textColor, this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder, this.labelTextColor = this.labelTextColor || this.actorTextColor, this.loopTextColor = this.loopTextColor || this.actorTextColor, this.activationBorderColor = this.activationBorderColor || X(this.secondaryColor, 10), this.activationBkgColor = this.activationBkgColor || this.secondaryColor, this.sequenceNumberColor = this.sequenceNumberColor || R(this.lineColor), this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor, this.altSectionBkgColor = this.altSectionBkgColor || "white", this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor, this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor, this.excludeBkgColor = this.excludeBkgColor || "#eeeeee", this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor, this.taskBkgColor = this.taskBkgColor || this.primaryColor, this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor, this.activeTaskBkgColor = this.activeTaskBkgColor || z(this.primaryColor, 23), this.gridColor = this.gridColor || "lightgrey", this.doneTaskBkgColor = this.doneTaskBkgColor || "lightgrey", this.doneTaskBorderColor = this.doneTaskBorderColor || "grey", this.critBorderColor = this.critBorderColor || "#ff8888", this.critBkgColor = this.critBkgColor || "red", this.todayLineColor = this.todayLineColor || "red", this.taskTextColor = this.taskTextColor || this.textColor, this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor, this.taskTextLightColor = this.taskTextLightColor || this.textColor, this.taskTextColor = this.taskTextColor || this.primaryTextColor, this.taskTextDarkColor = this.taskTextDarkColor || this.textColor, this.taskTextClickableColor = this.taskTextClickableColor || "#003163", this.personBorder = this.personBorder || this.primaryBorderColor, this.personBkg = this.personBkg || this.mainBkg, this.darkMode ? (this.rowOdd = this.rowOdd || X(this.mainBkg, 5) || "#ffffff", this.rowEven = this.rowEven || X(this.mainBkg, 10)) : (this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.mainBkg, 5)), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || this.tertiaryColor, this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.specialStateColor = this.lineColor, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || v(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || v(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || v(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || v(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || v(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || v(this.primaryColor, { h: 210, l: 150 }), this.cScale9 = this.cScale9 || v(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || v(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || v(this.primaryColor, { h: 330 }), this.darkMode)
      for (let w = 0; w < this.THEME_COLOR_LIMIT; w++)
        this["cScale" + w] = X(this["cScale" + w], 75);
    else
      for (let w = 0; w < this.THEME_COLOR_LIMIT; w++)
        this["cScale" + w] = X(this["cScale" + w], 25);
    for (let w = 0; w < this.THEME_COLOR_LIMIT; w++)
      this["cScaleInv" + w] = this["cScaleInv" + w] || R(this["cScale" + w]);
    for (let w = 0; w < this.THEME_COLOR_LIMIT; w++)
      this.darkMode ? this["cScalePeer" + w] = this["cScalePeer" + w] || z(this["cScale" + w], 10) : this["cScalePeer" + w] = this["cScalePeer" + w] || X(this["cScale" + w], 10);
    this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
    for (let w = 0; w < this.THEME_COLOR_LIMIT; w++)
      this["cScaleLabel" + w] = this["cScaleLabel" + w] || this.scaleLabelColor;
    const t = this.darkMode ? -4 : -1;
    for (let w = 0; w < 5; w++)
      this["surface" + w] = this["surface" + w] || v(this.mainBkg, { h: 180, s: -15, l: t * (5 + w * 3) }), this["surfacePeer" + w] = this["surfacePeer" + w] || v(this.mainBkg, { h: 180, s: -15, l: t * (8 + w * 3) });
    this.classText = this.classText || this.textColor, this.fillType0 = this.fillType0 || this.primaryColor, this.fillType1 = this.fillType1 || this.secondaryColor, this.fillType2 = this.fillType2 || v(this.primaryColor, { h: 64 }), this.fillType3 = this.fillType3 || v(this.secondaryColor, { h: 64 }), this.fillType4 = this.fillType4 || v(this.primaryColor, { h: -64 }), this.fillType5 = this.fillType5 || v(this.secondaryColor, { h: -64 }), this.fillType6 = this.fillType6 || v(this.primaryColor, { h: 128 }), this.fillType7 = this.fillType7 || v(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || v(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || v(this.secondaryColor, { l: -10 }), this.pie6 = this.pie6 || v(this.tertiaryColor, { l: -10 }), this.pie7 = this.pie7 || v(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || v(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || v(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || v(this.primaryColor, { h: 60, l: -20 }), this.pie11 = this.pie11 || v(this.primaryColor, { h: -60, l: -20 }), this.pie12 = this.pie12 || v(this.primaryColor, { h: 120, l: -10 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.radar = {
      axisColor: ((r = this.radar) == null ? void 0 : r.axisColor) || this.lineColor,
      axisStrokeWidth: ((i = this.radar) == null ? void 0 : i.axisStrokeWidth) || 2,
      axisLabelFontSize: ((n = this.radar) == null ? void 0 : n.axisLabelFontSize) || 12,
      curveOpacity: ((a = this.radar) == null ? void 0 : a.curveOpacity) || 0.5,
      curveStrokeWidth: ((o = this.radar) == null ? void 0 : o.curveStrokeWidth) || 2,
      graticuleColor: ((s = this.radar) == null ? void 0 : s.graticuleColor) || "#DEDEDE",
      graticuleStrokeWidth: ((c = this.radar) == null ? void 0 : c.graticuleStrokeWidth) || 1,
      graticuleOpacity: ((l = this.radar) == null ? void 0 : l.graticuleOpacity) || 0.3,
      legendBoxSize: ((h = this.radar) == null ? void 0 : h.legendBoxSize) || 12,
      legendFontSize: ((u = this.radar) == null ? void 0 : u.legendFontSize) || 12
    }, this.archEdgeColor = this.archEdgeColor || "#777", this.archEdgeArrowColor = this.archEdgeArrowColor || "#777", this.archEdgeWidth = this.archEdgeWidth || "3", this.archGroupBorderColor = this.archGroupBorderColor || "#000", this.archGroupBorderWidth = this.archGroupBorderWidth || "2px", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || v(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || v(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || v(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || v(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || v(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || v(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || li(this.quadrant1Fill) ? z(this.quadrant1Fill) : X(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: ((f = this.xyChart) == null ? void 0 : f.backgroundColor) || this.background,
      titleColor: ((p = this.xyChart) == null ? void 0 : p.titleColor) || this.primaryTextColor,
      xAxisTitleColor: ((g = this.xyChart) == null ? void 0 : g.xAxisTitleColor) || this.primaryTextColor,
      xAxisLabelColor: ((m = this.xyChart) == null ? void 0 : m.xAxisLabelColor) || this.primaryTextColor,
      xAxisTickColor: ((y = this.xyChart) == null ? void 0 : y.xAxisTickColor) || this.primaryTextColor,
      xAxisLineColor: ((x = this.xyChart) == null ? void 0 : x.xAxisLineColor) || this.primaryTextColor,
      yAxisTitleColor: ((b = this.xyChart) == null ? void 0 : b.yAxisTitleColor) || this.primaryTextColor,
      yAxisLabelColor: ((_ = this.xyChart) == null ? void 0 : _.yAxisLabelColor) || this.primaryTextColor,
      yAxisTickColor: ((S = this.xyChart) == null ? void 0 : S.yAxisTickColor) || this.primaryTextColor,
      yAxisLineColor: ((k = this.xyChart) == null ? void 0 : k.yAxisLineColor) || this.primaryTextColor,
      plotColorPalette: ((C = this.xyChart) == null ? void 0 : C.plotColorPalette) || "#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? X(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || v(this.primaryColor, { h: -30 }), this.git4 = this.git4 || v(this.primaryColor, { h: -60 }), this.git5 = this.git5 || v(this.primaryColor, { h: -90 }), this.git6 = this.git6 || v(this.primaryColor, { h: 60 }), this.git7 = this.git7 || v(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = X(this.git0, 25), this.git1 = X(this.git1, 25), this.git2 = X(this.git2, 25), this.git3 = X(this.git3, 25), this.git4 = X(this.git4, 25), this.git5 = X(this.git5, 25), this.git6 = X(this.git6, 25), this.git7 = X(this.git7, 25)), this.gitInv0 = this.gitInv0 || R(this.git0), this.gitInv1 = this.gitInv1 || R(this.git1), this.gitInv2 = this.gitInv2 || R(this.git2), this.gitInv3 = this.gitInv3 || R(this.git3), this.gitInv4 = this.gitInv4 || R(this.git4), this.gitInv5 = this.gitInv5 || R(this.git5), this.gitInv6 = this.gitInv6 || R(this.git6), this.gitInv7 = this.gitInv7 || R(this.git7), this.branchLabelColor = this.branchLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor, this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor, this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor, this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || Sn, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Tn;
  }
  calculate(t) {
    if (typeof t != "object") {
      this.updateColors();
      return;
    }
    const r = Object.keys(t);
    r.forEach((i) => {
      this[i] = t[i];
    }), this.updateColors(), r.forEach((i) => {
      this[i] = t[i];
    });
  }
}, d(ar, "Theme"), ar), lg = /* @__PURE__ */ d((e) => {
  const t = new og();
  return t.calculate(e), t;
}, "getThemeVariables"), sr, cg = (sr = class {
  constructor() {
    this.background = "#333", this.primaryColor = "#1f2020", this.secondaryColor = z(this.primaryColor, 16), this.tertiaryColor = v(this.primaryColor, { h: -160 }), this.primaryBorderColor = R(this.background), this.secondaryBorderColor = St(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = St(this.tertiaryColor, this.darkMode), this.primaryTextColor = R(this.primaryColor), this.secondaryTextColor = R(this.secondaryColor), this.tertiaryTextColor = R(this.tertiaryColor), this.lineColor = R(this.background), this.textColor = R(this.background), this.mainBkg = "#1f2020", this.secondBkg = "calculated", this.mainContrastColor = "lightgrey", this.darkTextColor = z(R("#323D47"), 10), this.lineColor = "calculated", this.border1 = "#ccc", this.border2 = Yr(255, 255, 255, 0.25), this.arrowheadColor = "calculated", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.labelBackground = "#181818", this.textColor = "#ccc", this.THEME_COLOR_LIMIT = 12, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "#F9FFFE", this.edgeLabelBackground = "calculated", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "calculated", this.actorLineColor = "calculated", this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "calculated", this.activationBkgColor = "calculated", this.sequenceNumberColor = "black", this.sectionBkgColor = X("#EAE8D9", 30), this.altSectionBkgColor = "calculated", this.sectionBkgColor2 = "#EAE8D9", this.excludeBkgColor = X(this.sectionBkgColor, 10), this.taskBorderColor = Yr(255, 255, 255, 70), this.taskBkgColor = "calculated", this.taskTextColor = "calculated", this.taskTextLightColor = "calculated", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = Yr(255, 255, 255, 50), this.activeTaskBkgColor = "#81B1DB", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "grey", this.critBorderColor = "#E83737", this.critBkgColor = "#E83737", this.taskTextDarkColor = "calculated", this.todayLineColor = "#DB5757", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.rowOdd = this.rowOdd || z(this.mainBkg, 5) || "#ffffff", this.rowEven = this.rowEven || X(this.mainBkg, 10), this.labelColor = "calculated", this.errorBkgColor = "#a44141", this.errorTextColor = "#ddd";
  }
  updateColors() {
    var t, r, i, n, a, o, s, c, l, h, u, f, p, g, m, y, x, b, _, S, k;
    this.secondBkg = z(this.mainBkg, 16), this.lineColor = this.mainContrastColor, this.arrowheadColor = this.mainContrastColor, this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.edgeLabelBackground = z(this.labelBackground, 25), this.actorBorder = this.border1, this.actorBkg = this.mainBkg, this.actorTextColor = this.mainContrastColor, this.actorLineColor = this.actorBorder, this.signalColor = this.mainContrastColor, this.signalTextColor = this.mainContrastColor, this.labelBoxBkgColor = this.actorBkg, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.mainContrastColor, this.loopTextColor = this.mainContrastColor, this.noteBorderColor = this.secondaryBorderColor, this.noteBkgColor = this.secondBkg, this.noteTextColor = this.secondaryTextColor, this.activationBorderColor = this.border1, this.activationBkgColor = this.secondBkg, this.altSectionBkgColor = this.background, this.taskBkgColor = z(this.mainBkg, 23), this.taskTextColor = this.darkTextColor, this.taskTextLightColor = this.mainContrastColor, this.taskTextOutsideColor = this.taskTextLightColor, this.gridColor = this.mainContrastColor, this.doneTaskBkgColor = this.mainContrastColor, this.taskTextDarkColor = this.darkTextColor, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#555", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = "#f4f4f4", this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = v(this.primaryColor, { h: 64 }), this.fillType3 = v(this.secondaryColor, { h: 64 }), this.fillType4 = v(this.primaryColor, { h: -64 }), this.fillType5 = v(this.secondaryColor, { h: -64 }), this.fillType6 = v(this.primaryColor, { h: 128 }), this.fillType7 = v(this.secondaryColor, { h: 128 }), this.cScale1 = this.cScale1 || "#0b0000", this.cScale2 = this.cScale2 || "#4d1037", this.cScale3 = this.cScale3 || "#3f5258", this.cScale4 = this.cScale4 || "#4f2f1b", this.cScale5 = this.cScale5 || "#6e0a0a", this.cScale6 = this.cScale6 || "#3b0048", this.cScale7 = this.cScale7 || "#995a01", this.cScale8 = this.cScale8 || "#154706", this.cScale9 = this.cScale9 || "#161722", this.cScale10 = this.cScale10 || "#00296f", this.cScale11 = this.cScale11 || "#01629c", this.cScale12 = this.cScale12 || "#010029", this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || v(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || v(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || v(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || v(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || v(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || v(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || v(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || v(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || v(this.primaryColor, { h: 330 });
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleInv" + C] = this["cScaleInv" + C] || R(this["cScale" + C]);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScalePeer" + C] = this["cScalePeer" + C] || z(this["cScale" + C], 10);
    for (let C = 0; C < 5; C++)
      this["surface" + C] = this["surface" + C] || v(this.mainBkg, { h: 30, s: -30, l: -(-10 + C * 4) }), this["surfacePeer" + C] = this["surfacePeer" + C] || v(this.mainBkg, { h: 30, s: -30, l: -(-7 + C * 4) });
    this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleLabel" + C] = this["cScaleLabel" + C] || this.scaleLabelColor;
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["pie" + C] = this["cScale" + C];
    this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || v(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || v(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || v(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || v(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || v(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || v(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || li(this.quadrant1Fill) ? z(this.quadrant1Fill) : X(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: ((t = this.xyChart) == null ? void 0 : t.backgroundColor) || this.background,
      titleColor: ((r = this.xyChart) == null ? void 0 : r.titleColor) || this.primaryTextColor,
      xAxisTitleColor: ((i = this.xyChart) == null ? void 0 : i.xAxisTitleColor) || this.primaryTextColor,
      xAxisLabelColor: ((n = this.xyChart) == null ? void 0 : n.xAxisLabelColor) || this.primaryTextColor,
      xAxisTickColor: ((a = this.xyChart) == null ? void 0 : a.xAxisTickColor) || this.primaryTextColor,
      xAxisLineColor: ((o = this.xyChart) == null ? void 0 : o.xAxisLineColor) || this.primaryTextColor,
      yAxisTitleColor: ((s = this.xyChart) == null ? void 0 : s.yAxisTitleColor) || this.primaryTextColor,
      yAxisLabelColor: ((c = this.xyChart) == null ? void 0 : c.yAxisLabelColor) || this.primaryTextColor,
      yAxisTickColor: ((l = this.xyChart) == null ? void 0 : l.yAxisTickColor) || this.primaryTextColor,
      yAxisLineColor: ((h = this.xyChart) == null ? void 0 : h.yAxisLineColor) || this.primaryTextColor,
      plotColorPalette: ((u = this.xyChart) == null ? void 0 : u.plotColorPalette) || "#3498db,#2ecc71,#e74c3c,#f1c40f,#bdc3c7,#ffffff,#34495e,#9b59b6,#1abc9c,#e67e22"
    }, this.packet = {
      startByteColor: this.primaryTextColor,
      endByteColor: this.primaryTextColor,
      labelColor: this.primaryTextColor,
      titleColor: this.primaryTextColor,
      blockStrokeColor: this.primaryTextColor,
      blockFillColor: this.background
    }, this.radar = {
      axisColor: ((f = this.radar) == null ? void 0 : f.axisColor) || this.lineColor,
      axisStrokeWidth: ((p = this.radar) == null ? void 0 : p.axisStrokeWidth) || 2,
      axisLabelFontSize: ((g = this.radar) == null ? void 0 : g.axisLabelFontSize) || 12,
      curveOpacity: ((m = this.radar) == null ? void 0 : m.curveOpacity) || 0.5,
      curveStrokeWidth: ((y = this.radar) == null ? void 0 : y.curveStrokeWidth) || 2,
      graticuleColor: ((x = this.radar) == null ? void 0 : x.graticuleColor) || "#DEDEDE",
      graticuleStrokeWidth: ((b = this.radar) == null ? void 0 : b.graticuleStrokeWidth) || 1,
      graticuleOpacity: ((_ = this.radar) == null ? void 0 : _.graticuleOpacity) || 0.3,
      legendBoxSize: ((S = this.radar) == null ? void 0 : S.legendBoxSize) || 12,
      legendFontSize: ((k = this.radar) == null ? void 0 : k.legendFontSize) || 12
    }, this.classText = this.primaryTextColor, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || (this.darkMode ? X(this.secondaryColor, 30) : this.secondaryColor), this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = z(this.secondaryColor, 20), this.git1 = z(this.pie2 || this.secondaryColor, 20), this.git2 = z(this.pie3 || this.tertiaryColor, 20), this.git3 = z(this.pie4 || v(this.primaryColor, { h: -30 }), 20), this.git4 = z(this.pie5 || v(this.primaryColor, { h: -60 }), 20), this.git5 = z(this.pie6 || v(this.primaryColor, { h: -90 }), 10), this.git6 = z(this.pie7 || v(this.primaryColor, { h: 60 }), 10), this.git7 = z(this.pie8 || v(this.primaryColor, { h: 120 }), 20), this.gitInv0 = this.gitInv0 || R(this.git0), this.gitInv1 = this.gitInv1 || R(this.git1), this.gitInv2 = this.gitInv2 || R(this.git2), this.gitInv3 = this.gitInv3 || R(this.git3), this.gitInv4 = this.gitInv4 || R(this.git4), this.gitInv5 = this.gitInv5 || R(this.git5), this.gitInv6 = this.gitInv6 || R(this.git6), this.gitInv7 = this.gitInv7 || R(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || R(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || R(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || z(this.background, 12), this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || z(this.background, 2), this.nodeBorder = this.nodeBorder || "#999";
  }
  calculate(t) {
    if (typeof t != "object") {
      this.updateColors();
      return;
    }
    const r = Object.keys(t);
    r.forEach((i) => {
      this[i] = t[i];
    }), this.updateColors(), r.forEach((i) => {
      this[i] = t[i];
    });
  }
}, d(sr, "Theme"), sr), hg = /* @__PURE__ */ d((e) => {
  const t = new cg();
  return t.calculate(e), t;
}, "getThemeVariables"), or, ug = (or = class {
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#ECECFF", this.secondaryColor = v(this.primaryColor, { h: 120 }), this.secondaryColor = "#ffffde", this.tertiaryColor = v(this.primaryColor, { h: -160 }), this.primaryBorderColor = St(this.primaryColor, this.darkMode), this.secondaryBorderColor = St(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = St(this.tertiaryColor, this.darkMode), this.primaryTextColor = R(this.primaryColor), this.secondaryTextColor = R(this.secondaryColor), this.tertiaryTextColor = R(this.tertiaryColor), this.lineColor = R(this.background), this.textColor = R(this.background), this.background = "white", this.mainBkg = "#ECECFF", this.secondBkg = "#ffffde", this.lineColor = "#333333", this.border1 = "#9370DB", this.border2 = "#aaaa33", this.arrowheadColor = "#333333", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.labelBackground = "rgba(232,232,232, 0.8)", this.textColor = "#333", this.THEME_COLOR_LIMIT = 12, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "calculated", this.edgeLabelBackground = "calculated", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "black", this.actorLineColor = "calculated", this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.sectionBkgColor = "calculated", this.altSectionBkgColor = "calculated", this.sectionBkgColor2 = "calculated", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "calculated", this.taskTextLightColor = "calculated", this.taskTextColor = this.taskTextLightColor, this.taskTextDarkColor = "calculated", this.taskTextOutsideColor = this.taskTextDarkColor, this.taskTextClickableColor = "calculated", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "calculated", this.critBorderColor = "calculated", this.critBkgColor = "calculated", this.todayLineColor = "calculated", this.sectionBkgColor = Yr(102, 102, 255, 0.49), this.altSectionBkgColor = "white", this.sectionBkgColor2 = "#fff400", this.taskBorderColor = "#534fbc", this.taskBkgColor = "#8a90dd", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "black", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "#534fbc", this.activeTaskBkgColor = "#bfc7ff", this.gridColor = "lightgrey", this.doneTaskBkgColor = "lightgrey", this.doneTaskBorderColor = "grey", this.critBorderColor = "#ff8888", this.critBkgColor = "red", this.todayLineColor = "red", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.rowOdd = "calculated", this.rowEven = "calculated", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222", this.updateColors();
  }
  updateColors() {
    var t, r, i, n, a, o, s, c, l, h, u, f, p, g, m, y, x, b, _, S, k;
    this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || v(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || v(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || v(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || v(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || v(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || v(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || v(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || v(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || v(this.primaryColor, { h: 330 }), this.cScalePeer1 = this.cScalePeer1 || X(this.secondaryColor, 45), this.cScalePeer2 = this.cScalePeer2 || X(this.tertiaryColor, 40);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScale" + C] = X(this["cScale" + C], 10), this["cScalePeer" + C] = this["cScalePeer" + C] || X(this["cScale" + C], 25);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleInv" + C] = this["cScaleInv" + C] || v(this["cScale" + C], { h: 180 });
    for (let C = 0; C < 5; C++)
      this["surface" + C] = this["surface" + C] || v(this.mainBkg, { h: 30, l: -(5 + C * 5) }), this["surfacePeer" + C] = this["surfacePeer" + C] || v(this.mainBkg, { h: 30, l: -(7 + C * 5) });
    if (this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor, this.labelTextColor !== "calculated") {
      this.cScaleLabel0 = this.cScaleLabel0 || R(this.labelTextColor), this.cScaleLabel3 = this.cScaleLabel3 || R(this.labelTextColor);
      for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
        this["cScaleLabel" + C] = this["cScaleLabel" + C] || this.labelTextColor;
    }
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.titleColor = this.textColor, this.edgeLabelBackground = this.labelBackground, this.actorBorder = z(this.border1, 23), this.actorBkg = this.mainBkg, this.labelBoxBkgColor = this.actorBkg, this.signalColor = this.textColor, this.signalTextColor = this.textColor, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.actorTextColor, this.loopTextColor = this.actorTextColor, this.noteBorderColor = this.border2, this.noteTextColor = this.actorTextColor, this.actorLineColor = this.actorBorder, this.taskTextColor = this.taskTextLightColor, this.taskTextOutsideColor = this.taskTextDarkColor, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.rowOdd = this.rowOdd || z(this.primaryColor, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.primaryColor, 1), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.nodeBorder, this.specialStateColor = this.lineColor, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = v(this.primaryColor, { h: 64 }), this.fillType3 = v(this.secondaryColor, { h: 64 }), this.fillType4 = v(this.primaryColor, { h: -64 }), this.fillType5 = v(this.secondaryColor, { h: -64 }), this.fillType6 = v(this.primaryColor, { h: 128 }), this.fillType7 = v(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || v(this.tertiaryColor, { l: -40 }), this.pie4 = this.pie4 || v(this.primaryColor, { l: -10 }), this.pie5 = this.pie5 || v(this.secondaryColor, { l: -30 }), this.pie6 = this.pie6 || v(this.tertiaryColor, { l: -20 }), this.pie7 = this.pie7 || v(this.primaryColor, { h: 60, l: -20 }), this.pie8 = this.pie8 || v(this.primaryColor, { h: -60, l: -40 }), this.pie9 = this.pie9 || v(this.primaryColor, { h: 120, l: -40 }), this.pie10 = this.pie10 || v(this.primaryColor, { h: 60, l: -40 }), this.pie11 = this.pie11 || v(this.primaryColor, { h: -90, l: -40 }), this.pie12 = this.pie12 || v(this.primaryColor, { h: 120, l: -30 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || v(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || v(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || v(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || v(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || v(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || v(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || li(this.quadrant1Fill) ? z(this.quadrant1Fill) : X(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.radar = {
      axisColor: ((t = this.radar) == null ? void 0 : t.axisColor) || this.lineColor,
      axisStrokeWidth: ((r = this.radar) == null ? void 0 : r.axisStrokeWidth) || 2,
      axisLabelFontSize: ((i = this.radar) == null ? void 0 : i.axisLabelFontSize) || 12,
      curveOpacity: ((n = this.radar) == null ? void 0 : n.curveOpacity) || 0.5,
      curveStrokeWidth: ((a = this.radar) == null ? void 0 : a.curveStrokeWidth) || 2,
      graticuleColor: ((o = this.radar) == null ? void 0 : o.graticuleColor) || "#DEDEDE",
      graticuleStrokeWidth: ((s = this.radar) == null ? void 0 : s.graticuleStrokeWidth) || 1,
      graticuleOpacity: ((c = this.radar) == null ? void 0 : c.graticuleOpacity) || 0.3,
      legendBoxSize: ((l = this.radar) == null ? void 0 : l.legendBoxSize) || 12,
      legendFontSize: ((h = this.radar) == null ? void 0 : h.legendFontSize) || 12
    }, this.xyChart = {
      backgroundColor: ((u = this.xyChart) == null ? void 0 : u.backgroundColor) || this.background,
      titleColor: ((f = this.xyChart) == null ? void 0 : f.titleColor) || this.primaryTextColor,
      xAxisTitleColor: ((p = this.xyChart) == null ? void 0 : p.xAxisTitleColor) || this.primaryTextColor,
      xAxisLabelColor: ((g = this.xyChart) == null ? void 0 : g.xAxisLabelColor) || this.primaryTextColor,
      xAxisTickColor: ((m = this.xyChart) == null ? void 0 : m.xAxisTickColor) || this.primaryTextColor,
      xAxisLineColor: ((y = this.xyChart) == null ? void 0 : y.xAxisLineColor) || this.primaryTextColor,
      yAxisTitleColor: ((x = this.xyChart) == null ? void 0 : x.yAxisTitleColor) || this.primaryTextColor,
      yAxisLabelColor: ((b = this.xyChart) == null ? void 0 : b.yAxisLabelColor) || this.primaryTextColor,
      yAxisTickColor: ((_ = this.xyChart) == null ? void 0 : _.yAxisTickColor) || this.primaryTextColor,
      yAxisLineColor: ((S = this.xyChart) == null ? void 0 : S.yAxisLineColor) || this.primaryTextColor,
      plotColorPalette: ((k = this.xyChart) == null ? void 0 : k.plotColorPalette) || "#ECECFF,#8493A6,#FFC3A0,#DCDDE1,#B8E994,#D1A36F,#C3CDE6,#FFB6C1,#496078,#F8F3E3"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.labelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || v(this.primaryColor, { h: -30 }), this.git4 = this.git4 || v(this.primaryColor, { h: -60 }), this.git5 = this.git5 || v(this.primaryColor, { h: -90 }), this.git6 = this.git6 || v(this.primaryColor, { h: 60 }), this.git7 = this.git7 || v(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = X(this.git0, 25), this.git1 = X(this.git1, 25), this.git2 = X(this.git2, 25), this.git3 = X(this.git3, 25), this.git4 = X(this.git4, 25), this.git5 = X(this.git5, 25), this.git6 = X(this.git6, 25), this.git7 = X(this.git7, 25)), this.gitInv0 = this.gitInv0 || X(R(this.git0), 25), this.gitInv1 = this.gitInv1 || R(this.git1), this.gitInv2 = this.gitInv2 || R(this.git2), this.gitInv3 = this.gitInv3 || R(this.git3), this.gitInv4 = this.gitInv4 || R(this.git4), this.gitInv5 = this.gitInv5 || R(this.git5), this.gitInv6 = this.gitInv6 || R(this.git6), this.gitInv7 = this.gitInv7 || R(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || R(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || R(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || Sn, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Tn;
  }
  calculate(t) {
    if (Object.keys(this).forEach((i) => {
      this[i] === "calculated" && (this[i] = void 0);
    }), typeof t != "object") {
      this.updateColors();
      return;
    }
    const r = Object.keys(t);
    r.forEach((i) => {
      this[i] = t[i];
    }), this.updateColors(), r.forEach((i) => {
      this[i] = t[i];
    });
  }
}, d(or, "Theme"), or), fg = /* @__PURE__ */ d((e) => {
  const t = new ug();
  return t.calculate(e), t;
}, "getThemeVariables"), lr, pg = (lr = class {
  constructor() {
    this.background = "#f4f4f4", this.primaryColor = "#cde498", this.secondaryColor = "#cdffb2", this.background = "white", this.mainBkg = "#cde498", this.secondBkg = "#cdffb2", this.lineColor = "green", this.border1 = "#13540c", this.border2 = "#6eaa49", this.arrowheadColor = "green", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.tertiaryColor = z("#cde498", 10), this.primaryBorderColor = St(this.primaryColor, this.darkMode), this.secondaryBorderColor = St(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = St(this.tertiaryColor, this.darkMode), this.primaryTextColor = R(this.primaryColor), this.secondaryTextColor = R(this.secondaryColor), this.tertiaryTextColor = R(this.primaryColor), this.lineColor = R(this.background), this.textColor = R(this.background), this.THEME_COLOR_LIMIT = 12, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "#333", this.edgeLabelBackground = "#e8e8e8", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "black", this.actorLineColor = "calculated", this.signalColor = "#333", this.signalTextColor = "#333", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "#326932", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "#fff5ad", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.sectionBkgColor = "#6eaa49", this.altSectionBkgColor = "white", this.sectionBkgColor2 = "#6eaa49", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "#487e3a", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "black", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "lightgrey", this.doneTaskBkgColor = "lightgrey", this.doneTaskBorderColor = "grey", this.critBorderColor = "#ff8888", this.critBkgColor = "red", this.todayLineColor = "red", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222";
  }
  updateColors() {
    var t, r, i, n, a, o, s, c, l, h, u, f, p, g, m, y, x, b, _, S, k;
    this.actorBorder = X(this.mainBkg, 20), this.actorBkg = this.mainBkg, this.labelBoxBkgColor = this.actorBkg, this.labelTextColor = this.actorTextColor, this.loopTextColor = this.actorTextColor, this.noteBorderColor = this.border2, this.noteTextColor = this.actorTextColor, this.actorLineColor = this.actorBorder, this.cScale0 = this.cScale0 || this.primaryColor, this.cScale1 = this.cScale1 || this.secondaryColor, this.cScale2 = this.cScale2 || this.tertiaryColor, this.cScale3 = this.cScale3 || v(this.primaryColor, { h: 30 }), this.cScale4 = this.cScale4 || v(this.primaryColor, { h: 60 }), this.cScale5 = this.cScale5 || v(this.primaryColor, { h: 90 }), this.cScale6 = this.cScale6 || v(this.primaryColor, { h: 120 }), this.cScale7 = this.cScale7 || v(this.primaryColor, { h: 150 }), this.cScale8 = this.cScale8 || v(this.primaryColor, { h: 210 }), this.cScale9 = this.cScale9 || v(this.primaryColor, { h: 270 }), this.cScale10 = this.cScale10 || v(this.primaryColor, { h: 300 }), this.cScale11 = this.cScale11 || v(this.primaryColor, { h: 330 }), this.cScalePeer1 = this.cScalePeer1 || X(this.secondaryColor, 45), this.cScalePeer2 = this.cScalePeer2 || X(this.tertiaryColor, 40);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScale" + C] = X(this["cScale" + C], 10), this["cScalePeer" + C] = this["cScalePeer" + C] || X(this["cScale" + C], 25);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleInv" + C] = this["cScaleInv" + C] || v(this["cScale" + C], { h: 180 });
    this.scaleLabelColor = this.scaleLabelColor !== "calculated" && this.scaleLabelColor ? this.scaleLabelColor : this.labelTextColor;
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleLabel" + C] = this["cScaleLabel" + C] || this.scaleLabelColor;
    for (let C = 0; C < 5; C++)
      this["surface" + C] = this["surface" + C] || v(this.mainBkg, { h: 30, s: -30, l: -(5 + C * 5) }), this["surfacePeer" + C] = this["surfacePeer" + C] || v(this.mainBkg, { h: 30, s: -30, l: -(8 + C * 5) });
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.taskBorderColor = this.border1, this.taskTextColor = this.taskTextLightColor, this.taskTextOutsideColor = this.taskTextDarkColor, this.activeTaskBorderColor = this.taskBorderColor, this.activeTaskBkgColor = this.mainBkg, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || z(this.mainBkg, 20), this.transitionColor = this.transitionColor || this.lineColor, this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f0f0f0", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.compositeBorder = this.compositeBorder || this.nodeBorder, this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = this.lineColor, this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.transitionColor = this.transitionColor || this.lineColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = v(this.primaryColor, { h: 64 }), this.fillType3 = v(this.secondaryColor, { h: 64 }), this.fillType4 = v(this.primaryColor, { h: -64 }), this.fillType5 = v(this.secondaryColor, { h: -64 }), this.fillType6 = v(this.primaryColor, { h: 128 }), this.fillType7 = v(this.secondaryColor, { h: 128 }), this.pie1 = this.pie1 || this.primaryColor, this.pie2 = this.pie2 || this.secondaryColor, this.pie3 = this.pie3 || this.tertiaryColor, this.pie4 = this.pie4 || v(this.primaryColor, { l: -30 }), this.pie5 = this.pie5 || v(this.secondaryColor, { l: -30 }), this.pie6 = this.pie6 || v(this.tertiaryColor, { h: 40, l: -40 }), this.pie7 = this.pie7 || v(this.primaryColor, { h: 60, l: -10 }), this.pie8 = this.pie8 || v(this.primaryColor, { h: -60, l: -10 }), this.pie9 = this.pie9 || v(this.primaryColor, { h: 120, l: 0 }), this.pie10 = this.pie10 || v(this.primaryColor, { h: 60, l: -50 }), this.pie11 = this.pie11 || v(this.primaryColor, { h: -60, l: -50 }), this.pie12 = this.pie12 || v(this.primaryColor, { h: 120, l: -50 }), this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || v(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || v(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || v(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || v(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || v(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || v(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || li(this.quadrant1Fill) ? z(this.quadrant1Fill) : X(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.packet = {
      startByteColor: this.primaryTextColor,
      endByteColor: this.primaryTextColor,
      labelColor: this.primaryTextColor,
      titleColor: this.primaryTextColor,
      blockStrokeColor: this.primaryTextColor,
      blockFillColor: this.mainBkg
    }, this.radar = {
      axisColor: ((t = this.radar) == null ? void 0 : t.axisColor) || this.lineColor,
      axisStrokeWidth: ((r = this.radar) == null ? void 0 : r.axisStrokeWidth) || 2,
      axisLabelFontSize: ((i = this.radar) == null ? void 0 : i.axisLabelFontSize) || 12,
      curveOpacity: ((n = this.radar) == null ? void 0 : n.curveOpacity) || 0.5,
      curveStrokeWidth: ((a = this.radar) == null ? void 0 : a.curveStrokeWidth) || 2,
      graticuleColor: ((o = this.radar) == null ? void 0 : o.graticuleColor) || "#DEDEDE",
      graticuleStrokeWidth: ((s = this.radar) == null ? void 0 : s.graticuleStrokeWidth) || 1,
      graticuleOpacity: ((c = this.radar) == null ? void 0 : c.graticuleOpacity) || 0.3,
      legendBoxSize: ((l = this.radar) == null ? void 0 : l.legendBoxSize) || 12,
      legendFontSize: ((h = this.radar) == null ? void 0 : h.legendFontSize) || 12
    }, this.xyChart = {
      backgroundColor: ((u = this.xyChart) == null ? void 0 : u.backgroundColor) || this.background,
      titleColor: ((f = this.xyChart) == null ? void 0 : f.titleColor) || this.primaryTextColor,
      xAxisTitleColor: ((p = this.xyChart) == null ? void 0 : p.xAxisTitleColor) || this.primaryTextColor,
      xAxisLabelColor: ((g = this.xyChart) == null ? void 0 : g.xAxisLabelColor) || this.primaryTextColor,
      xAxisTickColor: ((m = this.xyChart) == null ? void 0 : m.xAxisTickColor) || this.primaryTextColor,
      xAxisLineColor: ((y = this.xyChart) == null ? void 0 : y.xAxisLineColor) || this.primaryTextColor,
      yAxisTitleColor: ((x = this.xyChart) == null ? void 0 : x.yAxisTitleColor) || this.primaryTextColor,
      yAxisLabelColor: ((b = this.xyChart) == null ? void 0 : b.yAxisLabelColor) || this.primaryTextColor,
      yAxisTickColor: ((_ = this.xyChart) == null ? void 0 : _.yAxisTickColor) || this.primaryTextColor,
      yAxisLineColor: ((S = this.xyChart) == null ? void 0 : S.yAxisLineColor) || this.primaryTextColor,
      plotColorPalette: ((k = this.xyChart) == null ? void 0 : k.plotColorPalette) || "#CDE498,#FF6B6B,#A0D2DB,#D7BDE2,#F0F0F0,#FFC3A0,#7FD8BE,#FF9A8B,#FAF3E0,#FFF176"
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = this.git0 || this.primaryColor, this.git1 = this.git1 || this.secondaryColor, this.git2 = this.git2 || this.tertiaryColor, this.git3 = this.git3 || v(this.primaryColor, { h: -30 }), this.git4 = this.git4 || v(this.primaryColor, { h: -60 }), this.git5 = this.git5 || v(this.primaryColor, { h: -90 }), this.git6 = this.git6 || v(this.primaryColor, { h: 60 }), this.git7 = this.git7 || v(this.primaryColor, { h: 120 }), this.darkMode ? (this.git0 = z(this.git0, 25), this.git1 = z(this.git1, 25), this.git2 = z(this.git2, 25), this.git3 = z(this.git3, 25), this.git4 = z(this.git4, 25), this.git5 = z(this.git5, 25), this.git6 = z(this.git6, 25), this.git7 = z(this.git7, 25)) : (this.git0 = X(this.git0, 25), this.git1 = X(this.git1, 25), this.git2 = X(this.git2, 25), this.git3 = X(this.git3, 25), this.git4 = X(this.git4, 25), this.git5 = X(this.git5, 25), this.git6 = X(this.git6, 25), this.git7 = X(this.git7, 25)), this.gitInv0 = this.gitInv0 || R(this.git0), this.gitInv1 = this.gitInv1 || R(this.git1), this.gitInv2 = this.gitInv2 || R(this.git2), this.gitInv3 = this.gitInv3 || R(this.git3), this.gitInv4 = this.gitInv4 || R(this.git4), this.gitInv5 = this.gitInv5 || R(this.git5), this.gitInv6 = this.gitInv6 || R(this.git6), this.gitInv7 = this.gitInv7 || R(this.git7), this.gitBranchLabel0 = this.gitBranchLabel0 || R(this.labelTextColor), this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor, this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor, this.gitBranchLabel3 = this.gitBranchLabel3 || R(this.labelTextColor), this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor, this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor, this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor, this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || Sn, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Tn;
  }
  calculate(t) {
    if (typeof t != "object") {
      this.updateColors();
      return;
    }
    const r = Object.keys(t);
    r.forEach((i) => {
      this[i] = t[i];
    }), this.updateColors(), r.forEach((i) => {
      this[i] = t[i];
    });
  }
}, d(lr, "Theme"), lr), dg = /* @__PURE__ */ d((e) => {
  const t = new pg();
  return t.calculate(e), t;
}, "getThemeVariables"), cr, gg = (cr = class {
  constructor() {
    this.primaryColor = "#eee", this.contrast = "#707070", this.secondaryColor = z(this.contrast, 55), this.background = "#ffffff", this.tertiaryColor = v(this.primaryColor, { h: -160 }), this.primaryBorderColor = St(this.primaryColor, this.darkMode), this.secondaryBorderColor = St(this.secondaryColor, this.darkMode), this.tertiaryBorderColor = St(this.tertiaryColor, this.darkMode), this.primaryTextColor = R(this.primaryColor), this.secondaryTextColor = R(this.secondaryColor), this.tertiaryTextColor = R(this.tertiaryColor), this.lineColor = R(this.background), this.textColor = R(this.background), this.mainBkg = "#eee", this.secondBkg = "calculated", this.lineColor = "#666", this.border1 = "#999", this.border2 = "calculated", this.note = "#ffa", this.text = "#333", this.critical = "#d42", this.done = "#bbb", this.arrowheadColor = "#333333", this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif', this.fontSize = "16px", this.THEME_COLOR_LIMIT = 12, this.nodeBkg = "calculated", this.nodeBorder = "calculated", this.clusterBkg = "calculated", this.clusterBorder = "calculated", this.defaultLinkColor = "calculated", this.titleColor = "calculated", this.edgeLabelBackground = "white", this.actorBorder = "calculated", this.actorBkg = "calculated", this.actorTextColor = "calculated", this.actorLineColor = this.actorBorder, this.signalColor = "calculated", this.signalTextColor = "calculated", this.labelBoxBkgColor = "calculated", this.labelBoxBorderColor = "calculated", this.labelTextColor = "calculated", this.loopTextColor = "calculated", this.noteBorderColor = "calculated", this.noteBkgColor = "calculated", this.noteTextColor = "calculated", this.activationBorderColor = "#666", this.activationBkgColor = "#f4f4f4", this.sequenceNumberColor = "white", this.sectionBkgColor = "calculated", this.altSectionBkgColor = "white", this.sectionBkgColor2 = "calculated", this.excludeBkgColor = "#eeeeee", this.taskBorderColor = "calculated", this.taskBkgColor = "calculated", this.taskTextLightColor = "white", this.taskTextColor = "calculated", this.taskTextDarkColor = "calculated", this.taskTextOutsideColor = "calculated", this.taskTextClickableColor = "#003163", this.activeTaskBorderColor = "calculated", this.activeTaskBkgColor = "calculated", this.gridColor = "calculated", this.doneTaskBkgColor = "calculated", this.doneTaskBorderColor = "calculated", this.critBkgColor = "calculated", this.critBorderColor = "calculated", this.todayLineColor = "calculated", this.personBorder = this.primaryBorderColor, this.personBkg = this.mainBkg, this.archEdgeColor = "calculated", this.archEdgeArrowColor = "calculated", this.archEdgeWidth = "3", this.archGroupBorderColor = this.primaryBorderColor, this.archGroupBorderWidth = "2px", this.rowOdd = this.rowOdd || z(this.mainBkg, 75) || "#ffffff", this.rowEven = this.rowEven || "#f4f4f4", this.labelColor = "black", this.errorBkgColor = "#552222", this.errorTextColor = "#552222";
  }
  updateColors() {
    var t, r, i, n, a, o, s, c, l, h, u, f, p, g, m, y, x, b, _, S, k;
    this.secondBkg = z(this.contrast, 55), this.border2 = this.contrast, this.actorBorder = z(this.border1, 23), this.actorBkg = this.mainBkg, this.actorTextColor = this.text, this.actorLineColor = this.actorBorder, this.signalColor = this.text, this.signalTextColor = this.text, this.labelBoxBkgColor = this.actorBkg, this.labelBoxBorderColor = this.actorBorder, this.labelTextColor = this.text, this.loopTextColor = this.text, this.noteBorderColor = "#999", this.noteBkgColor = "#666", this.noteTextColor = "#fff", this.cScale0 = this.cScale0 || "#555", this.cScale1 = this.cScale1 || "#F4F4F4", this.cScale2 = this.cScale2 || "#555", this.cScale3 = this.cScale3 || "#BBB", this.cScale4 = this.cScale4 || "#777", this.cScale5 = this.cScale5 || "#999", this.cScale6 = this.cScale6 || "#DDD", this.cScale7 = this.cScale7 || "#FFF", this.cScale8 = this.cScale8 || "#DDD", this.cScale9 = this.cScale9 || "#BBB", this.cScale10 = this.cScale10 || "#999", this.cScale11 = this.cScale11 || "#777";
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleInv" + C] = this["cScaleInv" + C] || R(this["cScale" + C]);
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this.darkMode ? this["cScalePeer" + C] = this["cScalePeer" + C] || z(this["cScale" + C], 10) : this["cScalePeer" + C] = this["cScalePeer" + C] || X(this["cScale" + C], 10);
    this.scaleLabelColor = this.scaleLabelColor || (this.darkMode ? "black" : this.labelTextColor), this.cScaleLabel0 = this.cScaleLabel0 || this.cScale1, this.cScaleLabel2 = this.cScaleLabel2 || this.cScale1;
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["cScaleLabel" + C] = this["cScaleLabel" + C] || this.scaleLabelColor;
    for (let C = 0; C < 5; C++)
      this["surface" + C] = this["surface" + C] || v(this.mainBkg, { l: -(5 + C * 5) }), this["surfacePeer" + C] = this["surfacePeer" + C] || v(this.mainBkg, { l: -(8 + C * 5) });
    this.nodeBkg = this.mainBkg, this.nodeBorder = this.border1, this.clusterBkg = this.secondBkg, this.clusterBorder = this.border2, this.defaultLinkColor = this.lineColor, this.titleColor = this.text, this.sectionBkgColor = z(this.contrast, 30), this.sectionBkgColor2 = z(this.contrast, 30), this.taskBorderColor = X(this.contrast, 10), this.taskBkgColor = this.contrast, this.taskTextColor = this.taskTextLightColor, this.taskTextDarkColor = this.text, this.taskTextOutsideColor = this.taskTextDarkColor, this.activeTaskBorderColor = this.taskBorderColor, this.activeTaskBkgColor = this.mainBkg, this.gridColor = z(this.border1, 30), this.doneTaskBkgColor = this.done, this.doneTaskBorderColor = this.lineColor, this.critBkgColor = this.critical, this.critBorderColor = X(this.critBkgColor, 10), this.todayLineColor = this.critBkgColor, this.archEdgeColor = this.lineColor, this.archEdgeArrowColor = this.lineColor, this.transitionColor = this.transitionColor || "#000", this.transitionLabelColor = this.transitionLabelColor || this.textColor, this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor, this.stateBkg = this.stateBkg || this.mainBkg, this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg, this.compositeBackground = this.compositeBackground || this.background || this.tertiaryColor, this.altBackground = this.altBackground || "#f4f4f4", this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg, this.stateBorder = this.stateBorder || "#000", this.innerEndBackground = this.primaryBorderColor, this.specialStateColor = "#222", this.errorBkgColor = this.errorBkgColor || this.tertiaryColor, this.errorTextColor = this.errorTextColor || this.tertiaryTextColor, this.classText = this.primaryTextColor, this.fillType0 = this.primaryColor, this.fillType1 = this.secondaryColor, this.fillType2 = v(this.primaryColor, { h: 64 }), this.fillType3 = v(this.secondaryColor, { h: 64 }), this.fillType4 = v(this.primaryColor, { h: -64 }), this.fillType5 = v(this.secondaryColor, { h: -64 }), this.fillType6 = v(this.primaryColor, { h: 128 }), this.fillType7 = v(this.secondaryColor, { h: 128 });
    for (let C = 0; C < this.THEME_COLOR_LIMIT; C++)
      this["pie" + C] = this["cScale" + C];
    this.pie12 = this.pie0, this.pieTitleTextSize = this.pieTitleTextSize || "25px", this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor, this.pieSectionTextSize = this.pieSectionTextSize || "17px", this.pieSectionTextColor = this.pieSectionTextColor || this.textColor, this.pieLegendTextSize = this.pieLegendTextSize || "17px", this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor, this.pieStrokeColor = this.pieStrokeColor || "black", this.pieStrokeWidth = this.pieStrokeWidth || "2px", this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || "2px", this.pieOuterStrokeColor = this.pieOuterStrokeColor || "black", this.pieOpacity = this.pieOpacity || "0.7", this.quadrant1Fill = this.quadrant1Fill || this.primaryColor, this.quadrant2Fill = this.quadrant2Fill || v(this.primaryColor, { r: 5, g: 5, b: 5 }), this.quadrant3Fill = this.quadrant3Fill || v(this.primaryColor, { r: 10, g: 10, b: 10 }), this.quadrant4Fill = this.quadrant4Fill || v(this.primaryColor, { r: 15, g: 15, b: 15 }), this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor, this.quadrant2TextFill = this.quadrant2TextFill || v(this.primaryTextColor, { r: -5, g: -5, b: -5 }), this.quadrant3TextFill = this.quadrant3TextFill || v(this.primaryTextColor, { r: -10, g: -10, b: -10 }), this.quadrant4TextFill = this.quadrant4TextFill || v(this.primaryTextColor, { r: -15, g: -15, b: -15 }), this.quadrantPointFill = this.quadrantPointFill || li(this.quadrant1Fill) ? z(this.quadrant1Fill) : X(this.quadrant1Fill), this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor, this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor, this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor, this.quadrantInternalBorderStrokeFill = this.quadrantInternalBorderStrokeFill || this.primaryBorderColor, this.quadrantExternalBorderStrokeFill = this.quadrantExternalBorderStrokeFill || this.primaryBorderColor, this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor, this.xyChart = {
      backgroundColor: ((t = this.xyChart) == null ? void 0 : t.backgroundColor) || this.background,
      titleColor: ((r = this.xyChart) == null ? void 0 : r.titleColor) || this.primaryTextColor,
      xAxisTitleColor: ((i = this.xyChart) == null ? void 0 : i.xAxisTitleColor) || this.primaryTextColor,
      xAxisLabelColor: ((n = this.xyChart) == null ? void 0 : n.xAxisLabelColor) || this.primaryTextColor,
      xAxisTickColor: ((a = this.xyChart) == null ? void 0 : a.xAxisTickColor) || this.primaryTextColor,
      xAxisLineColor: ((o = this.xyChart) == null ? void 0 : o.xAxisLineColor) || this.primaryTextColor,
      yAxisTitleColor: ((s = this.xyChart) == null ? void 0 : s.yAxisTitleColor) || this.primaryTextColor,
      yAxisLabelColor: ((c = this.xyChart) == null ? void 0 : c.yAxisLabelColor) || this.primaryTextColor,
      yAxisTickColor: ((l = this.xyChart) == null ? void 0 : l.yAxisTickColor) || this.primaryTextColor,
      yAxisLineColor: ((h = this.xyChart) == null ? void 0 : h.yAxisLineColor) || this.primaryTextColor,
      plotColorPalette: ((u = this.xyChart) == null ? void 0 : u.plotColorPalette) || "#EEE,#6BB8E4,#8ACB88,#C7ACD6,#E8DCC2,#FFB2A8,#FFF380,#7E8D91,#FFD8B1,#FAF3E0"
    }, this.radar = {
      axisColor: ((f = this.radar) == null ? void 0 : f.axisColor) || this.lineColor,
      axisStrokeWidth: ((p = this.radar) == null ? void 0 : p.axisStrokeWidth) || 2,
      axisLabelFontSize: ((g = this.radar) == null ? void 0 : g.axisLabelFontSize) || 12,
      curveOpacity: ((m = this.radar) == null ? void 0 : m.curveOpacity) || 0.5,
      curveStrokeWidth: ((y = this.radar) == null ? void 0 : y.curveStrokeWidth) || 2,
      graticuleColor: ((x = this.radar) == null ? void 0 : x.graticuleColor) || "#DEDEDE",
      graticuleStrokeWidth: ((b = this.radar) == null ? void 0 : b.graticuleStrokeWidth) || 1,
      graticuleOpacity: ((_ = this.radar) == null ? void 0 : _.graticuleOpacity) || 0.3,
      legendBoxSize: ((S = this.radar) == null ? void 0 : S.legendBoxSize) || 12,
      legendFontSize: ((k = this.radar) == null ? void 0 : k.legendFontSize) || 12
    }, this.requirementBackground = this.requirementBackground || this.primaryColor, this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor, this.requirementBorderSize = this.requirementBorderSize || "1", this.requirementTextColor = this.requirementTextColor || this.primaryTextColor, this.relationColor = this.relationColor || this.lineColor, this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground, this.relationLabelColor = this.relationLabelColor || this.actorTextColor, this.git0 = X(this.pie1, 25) || this.primaryColor, this.git1 = this.pie2 || this.secondaryColor, this.git2 = this.pie3 || this.tertiaryColor, this.git3 = this.pie4 || v(this.primaryColor, { h: -30 }), this.git4 = this.pie5 || v(this.primaryColor, { h: -60 }), this.git5 = this.pie6 || v(this.primaryColor, { h: -90 }), this.git6 = this.pie7 || v(this.primaryColor, { h: 60 }), this.git7 = this.pie8 || v(this.primaryColor, { h: 120 }), this.gitInv0 = this.gitInv0 || R(this.git0), this.gitInv1 = this.gitInv1 || R(this.git1), this.gitInv2 = this.gitInv2 || R(this.git2), this.gitInv3 = this.gitInv3 || R(this.git3), this.gitInv4 = this.gitInv4 || R(this.git4), this.gitInv5 = this.gitInv5 || R(this.git5), this.gitInv6 = this.gitInv6 || R(this.git6), this.gitInv7 = this.gitInv7 || R(this.git7), this.branchLabelColor = this.branchLabelColor || this.labelTextColor, this.gitBranchLabel0 = this.branchLabelColor, this.gitBranchLabel1 = "white", this.gitBranchLabel2 = this.branchLabelColor, this.gitBranchLabel3 = "white", this.gitBranchLabel4 = this.branchLabelColor, this.gitBranchLabel5 = this.branchLabelColor, this.gitBranchLabel6 = this.branchLabelColor, this.gitBranchLabel7 = this.branchLabelColor, this.tagLabelColor = this.tagLabelColor || this.primaryTextColor, this.tagLabelBackground = this.tagLabelBackground || this.primaryColor, this.tagLabelBorder = this.tagBorder || this.primaryBorderColor, this.tagLabelFontSize = this.tagLabelFontSize || "10px", this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor, this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor, this.commitLabelFontSize = this.commitLabelFontSize || "10px", this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || Sn, this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Tn;
  }
  calculate(t) {
    if (typeof t != "object") {
      this.updateColors();
      return;
    }
    const r = Object.keys(t);
    r.forEach((i) => {
      this[i] = t[i];
    }), this.updateColors(), r.forEach((i) => {
      this[i] = t[i];
    });
  }
}, d(cr, "Theme"), cr), mg = /* @__PURE__ */ d((e) => {
  const t = new gg();
  return t.calculate(e), t;
}, "getThemeVariables"), le = {
  base: {
    getThemeVariables: lg
  },
  dark: {
    getThemeVariables: hg
  },
  default: {
    getThemeVariables: fg
  },
  forest: {
    getThemeVariables: dg
  },
  neutral: {
    getThemeVariables: mg
  }
}, re = {
  flowchart: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    subGraphTitleMargin: {
      top: 0,
      bottom: 0
    },
    diagramPadding: 8,
    htmlLabels: !0,
    nodeSpacing: 50,
    rankSpacing: 50,
    curve: "basis",
    padding: 15,
    defaultRenderer: "dagre-wrapper",
    wrappingWidth: 200
  },
  sequence: {
    useMaxWidth: !0,
    hideUnusedParticipants: !1,
    activationWidth: 10,
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    mirrorActors: !0,
    forceMenus: !1,
    bottomMarginAdj: 1,
    rightAngles: !1,
    showSequenceNumbers: !1,
    actorFontSize: 14,
    actorFontFamily: '"Open Sans", sans-serif',
    actorFontWeight: 400,
    noteFontSize: 14,
    noteFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    noteFontWeight: 400,
    noteAlign: "center",
    messageFontSize: 16,
    messageFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    messageFontWeight: 400,
    wrap: !1,
    wrapPadding: 10,
    labelBoxWidth: 50,
    labelBoxHeight: 20
  },
  gantt: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    rightPadding: 75,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    sectionFontSize: 11,
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
    topAxis: !1,
    displayMode: "",
    weekday: "sunday"
  },
  journey: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    bottomMarginAdj: 1,
    rightAngles: !1,
    taskFontSize: 14,
    taskFontFamily: '"Open Sans", sans-serif',
    taskMargin: 50,
    activationWidth: 10,
    textPlacement: "fo",
    actorColours: [
      "#8FBC8F",
      "#7CFC00",
      "#00FFFF",
      "#20B2AA",
      "#B0E0E6",
      "#FFFFE0"
    ],
    sectionFills: [
      "#191970",
      "#8B008B",
      "#4B0082",
      "#2F4F4F",
      "#800000",
      "#8B4513",
      "#00008B"
    ],
    sectionColours: [
      "#fff"
    ]
  },
  class: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    arrowMarkerAbsolute: !1,
    dividerMargin: 10,
    padding: 5,
    textHeight: 10,
    defaultRenderer: "dagre-wrapper",
    htmlLabels: !1,
    hideEmptyMembersBox: !1
  },
  state: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    dividerMargin: 10,
    sizeUnit: 5,
    padding: 8,
    textHeight: 10,
    titleShift: -15,
    noteMargin: 10,
    forkWidth: 70,
    forkHeight: 7,
    miniPadding: 2,
    fontSizeFactor: 5.02,
    fontSize: 24,
    labelHeight: 16,
    edgeLengthFactor: "20",
    compositTitleSize: 35,
    radius: 5,
    defaultRenderer: "dagre-wrapper"
  },
  er: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    diagramPadding: 20,
    layoutDirection: "TB",
    minEntityWidth: 100,
    minEntityHeight: 75,
    entityPadding: 15,
    nodeSpacing: 140,
    rankSpacing: 80,
    stroke: "gray",
    fill: "honeydew",
    fontSize: 12
  },
  pie: {
    useMaxWidth: !0,
    textPosition: 0.75
  },
  quadrantChart: {
    useMaxWidth: !0,
    chartWidth: 500,
    chartHeight: 500,
    titleFontSize: 20,
    titlePadding: 10,
    quadrantPadding: 5,
    xAxisLabelPadding: 5,
    yAxisLabelPadding: 5,
    xAxisLabelFontSize: 16,
    yAxisLabelFontSize: 16,
    quadrantLabelFontSize: 16,
    quadrantTextTopPadding: 5,
    pointTextPadding: 5,
    pointLabelFontSize: 12,
    pointRadius: 5,
    xAxisPosition: "top",
    yAxisPosition: "left",
    quadrantInternalBorderStrokeWidth: 1,
    quadrantExternalBorderStrokeWidth: 2
  },
  xyChart: {
    useMaxWidth: !0,
    width: 700,
    height: 500,
    titleFontSize: 20,
    titlePadding: 10,
    showTitle: !0,
    xAxis: {
      $ref: "#/$defs/XYChartAxisConfig",
      showLabel: !0,
      labelFontSize: 14,
      labelPadding: 5,
      showTitle: !0,
      titleFontSize: 16,
      titlePadding: 5,
      showTick: !0,
      tickLength: 5,
      tickWidth: 2,
      showAxisLine: !0,
      axisLineWidth: 2
    },
    yAxis: {
      $ref: "#/$defs/XYChartAxisConfig",
      showLabel: !0,
      labelFontSize: 14,
      labelPadding: 5,
      showTitle: !0,
      titleFontSize: 16,
      titlePadding: 5,
      showTick: !0,
      tickLength: 5,
      tickWidth: 2,
      showAxisLine: !0,
      axisLineWidth: 2
    },
    chartOrientation: "vertical",
    plotReservedSpacePercent: 50
  },
  requirement: {
    useMaxWidth: !0,
    rect_fill: "#f9f9f9",
    text_color: "#333",
    rect_border_size: "0.5px",
    rect_border_color: "#bbb",
    rect_min_width: 200,
    rect_min_height: 200,
    fontSize: 14,
    rect_padding: 10,
    line_height: 20
  },
  mindmap: {
    useMaxWidth: !0,
    padding: 10,
    maxNodeWidth: 200
  },
  kanban: {
    useMaxWidth: !0,
    padding: 8,
    sectionWidth: 200,
    ticketBaseUrl: ""
  },
  timeline: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    messageAlign: "center",
    bottomMarginAdj: 1,
    rightAngles: !1,
    taskFontSize: 14,
    taskFontFamily: '"Open Sans", sans-serif',
    taskMargin: 50,
    activationWidth: 10,
    textPlacement: "fo",
    actorColours: [
      "#8FBC8F",
      "#7CFC00",
      "#00FFFF",
      "#20B2AA",
      "#B0E0E6",
      "#FFFFE0"
    ],
    sectionFills: [
      "#191970",
      "#8B008B",
      "#4B0082",
      "#2F4F4F",
      "#800000",
      "#8B4513",
      "#00008B"
    ],
    sectionColours: [
      "#fff"
    ],
    disableMulticolor: !1
  },
  gitGraph: {
    useMaxWidth: !0,
    titleTopMargin: 25,
    diagramPadding: 8,
    nodeLabel: {
      width: 75,
      height: 100,
      x: -25,
      y: 0
    },
    mainBranchName: "main",
    mainBranchOrder: 0,
    showCommitLabel: !0,
    showBranches: !0,
    rotateCommitLabel: !0,
    parallelCommits: !1,
    arrowMarkerAbsolute: !1
  },
  c4: {
    useMaxWidth: !0,
    diagramMarginX: 50,
    diagramMarginY: 10,
    c4ShapeMargin: 50,
    c4ShapePadding: 20,
    width: 216,
    height: 60,
    boxMargin: 10,
    c4ShapeInRow: 4,
    nextLinePaddingX: 0,
    c4BoundaryInRow: 2,
    personFontSize: 14,
    personFontFamily: '"Open Sans", sans-serif',
    personFontWeight: "normal",
    external_personFontSize: 14,
    external_personFontFamily: '"Open Sans", sans-serif',
    external_personFontWeight: "normal",
    systemFontSize: 14,
    systemFontFamily: '"Open Sans", sans-serif',
    systemFontWeight: "normal",
    external_systemFontSize: 14,
    external_systemFontFamily: '"Open Sans", sans-serif',
    external_systemFontWeight: "normal",
    system_dbFontSize: 14,
    system_dbFontFamily: '"Open Sans", sans-serif',
    system_dbFontWeight: "normal",
    external_system_dbFontSize: 14,
    external_system_dbFontFamily: '"Open Sans", sans-serif',
    external_system_dbFontWeight: "normal",
    system_queueFontSize: 14,
    system_queueFontFamily: '"Open Sans", sans-serif',
    system_queueFontWeight: "normal",
    external_system_queueFontSize: 14,
    external_system_queueFontFamily: '"Open Sans", sans-serif',
    external_system_queueFontWeight: "normal",
    boundaryFontSize: 14,
    boundaryFontFamily: '"Open Sans", sans-serif',
    boundaryFontWeight: "normal",
    messageFontSize: 12,
    messageFontFamily: '"Open Sans", sans-serif',
    messageFontWeight: "normal",
    containerFontSize: 14,
    containerFontFamily: '"Open Sans", sans-serif',
    containerFontWeight: "normal",
    external_containerFontSize: 14,
    external_containerFontFamily: '"Open Sans", sans-serif',
    external_containerFontWeight: "normal",
    container_dbFontSize: 14,
    container_dbFontFamily: '"Open Sans", sans-serif',
    container_dbFontWeight: "normal",
    external_container_dbFontSize: 14,
    external_container_dbFontFamily: '"Open Sans", sans-serif',
    external_container_dbFontWeight: "normal",
    container_queueFontSize: 14,
    container_queueFontFamily: '"Open Sans", sans-serif',
    container_queueFontWeight: "normal",
    external_container_queueFontSize: 14,
    external_container_queueFontFamily: '"Open Sans", sans-serif',
    external_container_queueFontWeight: "normal",
    componentFontSize: 14,
    componentFontFamily: '"Open Sans", sans-serif',
    componentFontWeight: "normal",
    external_componentFontSize: 14,
    external_componentFontFamily: '"Open Sans", sans-serif',
    external_componentFontWeight: "normal",
    component_dbFontSize: 14,
    component_dbFontFamily: '"Open Sans", sans-serif',
    component_dbFontWeight: "normal",
    external_component_dbFontSize: 14,
    external_component_dbFontFamily: '"Open Sans", sans-serif',
    external_component_dbFontWeight: "normal",
    component_queueFontSize: 14,
    component_queueFontFamily: '"Open Sans", sans-serif',
    component_queueFontWeight: "normal",
    external_component_queueFontSize: 14,
    external_component_queueFontFamily: '"Open Sans", sans-serif',
    external_component_queueFontWeight: "normal",
    wrap: !0,
    wrapPadding: 10,
    person_bg_color: "#08427B",
    person_border_color: "#073B6F",
    external_person_bg_color: "#686868",
    external_person_border_color: "#8A8A8A",
    system_bg_color: "#1168BD",
    system_border_color: "#3C7FC0",
    system_db_bg_color: "#1168BD",
    system_db_border_color: "#3C7FC0",
    system_queue_bg_color: "#1168BD",
    system_queue_border_color: "#3C7FC0",
    external_system_bg_color: "#999999",
    external_system_border_color: "#8A8A8A",
    external_system_db_bg_color: "#999999",
    external_system_db_border_color: "#8A8A8A",
    external_system_queue_bg_color: "#999999",
    external_system_queue_border_color: "#8A8A8A",
    container_bg_color: "#438DD5",
    container_border_color: "#3C7FC0",
    container_db_bg_color: "#438DD5",
    container_db_border_color: "#3C7FC0",
    container_queue_bg_color: "#438DD5",
    container_queue_border_color: "#3C7FC0",
    external_container_bg_color: "#B3B3B3",
    external_container_border_color: "#A6A6A6",
    external_container_db_bg_color: "#B3B3B3",
    external_container_db_border_color: "#A6A6A6",
    external_container_queue_bg_color: "#B3B3B3",
    external_container_queue_border_color: "#A6A6A6",
    component_bg_color: "#85BBF0",
    component_border_color: "#78A8D8",
    component_db_bg_color: "#85BBF0",
    component_db_border_color: "#78A8D8",
    component_queue_bg_color: "#85BBF0",
    component_queue_border_color: "#78A8D8",
    external_component_bg_color: "#CCCCCC",
    external_component_border_color: "#BFBFBF",
    external_component_db_bg_color: "#CCCCCC",
    external_component_db_border_color: "#BFBFBF",
    external_component_queue_bg_color: "#CCCCCC",
    external_component_queue_border_color: "#BFBFBF"
  },
  sankey: {
    useMaxWidth: !0,
    width: 600,
    height: 400,
    linkColor: "gradient",
    nodeAlignment: "justify",
    showValues: !0,
    prefix: "",
    suffix: ""
  },
  block: {
    useMaxWidth: !0,
    padding: 8
  },
  packet: {
    useMaxWidth: !0,
    rowHeight: 32,
    bitWidth: 32,
    bitsPerRow: 32,
    showBits: !0,
    paddingX: 5,
    paddingY: 5
  },
  architecture: {
    useMaxWidth: !0,
    padding: 40,
    iconSize: 80,
    fontSize: 16
  },
  radar: {
    useMaxWidth: !0,
    width: 600,
    height: 600,
    marginTop: 50,
    marginRight: 50,
    marginBottom: 50,
    marginLeft: 50,
    axisScaleFactor: 1,
    axisLabelFactor: 1.05,
    curveTension: 0.17
  },
  theme: "default",
  look: "classic",
  handDrawnSeed: 0,
  layout: "dagre",
  maxTextSize: 5e4,
  maxEdges: 500,
  darkMode: !1,
  fontFamily: '"trebuchet ms", verdana, arial, sans-serif;',
  logLevel: 5,
  securityLevel: "strict",
  startOnLoad: !0,
  arrowMarkerAbsolute: !1,
  secure: [
    "secure",
    "securityLevel",
    "startOnLoad",
    "maxTextSize",
    "suppressErrorRendering",
    "maxEdges"
  ],
  legacyMathML: !1,
  forceLegacyMathML: !1,
  deterministicIds: !1,
  fontSize: 16,
  markdownAutoWrap: !0,
  suppressErrorRendering: !1
}, Wl = {
  ...re,
  // Set, even though they're `undefined` so that `configKeys` finds these keys
  // TODO: Should we replace these with `null` so that they can go in the JSON Schema?
  deterministicIDSeed: void 0,
  elk: {
    // mergeEdges is needed here to be considered
    mergeEdges: !1,
    nodePlacementStrategy: "BRANDES_KOEPF"
  },
  themeCSS: void 0,
  // add non-JSON default config values
  themeVariables: le.default.getThemeVariables(),
  sequence: {
    ...re.sequence,
    messageFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.messageFontFamily,
        fontSize: this.messageFontSize,
        fontWeight: this.messageFontWeight
      };
    }, "messageFont"),
    noteFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.noteFontFamily,
        fontSize: this.noteFontSize,
        fontWeight: this.noteFontWeight
      };
    }, "noteFont"),
    actorFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.actorFontFamily,
        fontSize: this.actorFontSize,
        fontWeight: this.actorFontWeight
      };
    }, "actorFont")
  },
  class: {
    hideEmptyMembersBox: !1
  },
  gantt: {
    ...re.gantt,
    tickInterval: void 0,
    useWidth: void 0
    // can probably be removed since `configKeys` already includes this
  },
  c4: {
    ...re.c4,
    useWidth: void 0,
    personFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.personFontFamily,
        fontSize: this.personFontSize,
        fontWeight: this.personFontWeight
      };
    }, "personFont"),
    external_personFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_personFontFamily,
        fontSize: this.external_personFontSize,
        fontWeight: this.external_personFontWeight
      };
    }, "external_personFont"),
    systemFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.systemFontFamily,
        fontSize: this.systemFontSize,
        fontWeight: this.systemFontWeight
      };
    }, "systemFont"),
    external_systemFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_systemFontFamily,
        fontSize: this.external_systemFontSize,
        fontWeight: this.external_systemFontWeight
      };
    }, "external_systemFont"),
    system_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.system_dbFontFamily,
        fontSize: this.system_dbFontSize,
        fontWeight: this.system_dbFontWeight
      };
    }, "system_dbFont"),
    external_system_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_system_dbFontFamily,
        fontSize: this.external_system_dbFontSize,
        fontWeight: this.external_system_dbFontWeight
      };
    }, "external_system_dbFont"),
    system_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.system_queueFontFamily,
        fontSize: this.system_queueFontSize,
        fontWeight: this.system_queueFontWeight
      };
    }, "system_queueFont"),
    external_system_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_system_queueFontFamily,
        fontSize: this.external_system_queueFontSize,
        fontWeight: this.external_system_queueFontWeight
      };
    }, "external_system_queueFont"),
    containerFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.containerFontFamily,
        fontSize: this.containerFontSize,
        fontWeight: this.containerFontWeight
      };
    }, "containerFont"),
    external_containerFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_containerFontFamily,
        fontSize: this.external_containerFontSize,
        fontWeight: this.external_containerFontWeight
      };
    }, "external_containerFont"),
    container_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.container_dbFontFamily,
        fontSize: this.container_dbFontSize,
        fontWeight: this.container_dbFontWeight
      };
    }, "container_dbFont"),
    external_container_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_container_dbFontFamily,
        fontSize: this.external_container_dbFontSize,
        fontWeight: this.external_container_dbFontWeight
      };
    }, "external_container_dbFont"),
    container_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.container_queueFontFamily,
        fontSize: this.container_queueFontSize,
        fontWeight: this.container_queueFontWeight
      };
    }, "container_queueFont"),
    external_container_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_container_queueFontFamily,
        fontSize: this.external_container_queueFontSize,
        fontWeight: this.external_container_queueFontWeight
      };
    }, "external_container_queueFont"),
    componentFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.componentFontFamily,
        fontSize: this.componentFontSize,
        fontWeight: this.componentFontWeight
      };
    }, "componentFont"),
    external_componentFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_componentFontFamily,
        fontSize: this.external_componentFontSize,
        fontWeight: this.external_componentFontWeight
      };
    }, "external_componentFont"),
    component_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.component_dbFontFamily,
        fontSize: this.component_dbFontSize,
        fontWeight: this.component_dbFontWeight
      };
    }, "component_dbFont"),
    external_component_dbFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_component_dbFontFamily,
        fontSize: this.external_component_dbFontSize,
        fontWeight: this.external_component_dbFontWeight
      };
    }, "external_component_dbFont"),
    component_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.component_queueFontFamily,
        fontSize: this.component_queueFontSize,
        fontWeight: this.component_queueFontWeight
      };
    }, "component_queueFont"),
    external_component_queueFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.external_component_queueFontFamily,
        fontSize: this.external_component_queueFontSize,
        fontWeight: this.external_component_queueFontWeight
      };
    }, "external_component_queueFont"),
    boundaryFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.boundaryFontFamily,
        fontSize: this.boundaryFontSize,
        fontWeight: this.boundaryFontWeight
      };
    }, "boundaryFont"),
    messageFont: /* @__PURE__ */ d(function() {
      return {
        fontFamily: this.messageFontFamily,
        fontSize: this.messageFontSize,
        fontWeight: this.messageFontWeight
      };
    }, "messageFont")
  },
  pie: {
    ...re.pie,
    useWidth: 984
  },
  xyChart: {
    ...re.xyChart,
    useWidth: void 0
  },
  requirement: {
    ...re.requirement,
    useWidth: void 0
  },
  packet: {
    ...re.packet
  },
  radar: {
    ...re.radar
  }
}, Hl = /* @__PURE__ */ d((e, t = "") => Object.keys(e).reduce((r, i) => Array.isArray(e[i]) ? r : typeof e[i] == "object" && e[i] !== null ? [...r, t + i, ...Hl(e[i], "")] : [...r, t + i], []), "keyify"), yg = new Set(Hl(Wl, "")), jl = Wl, Wi = /* @__PURE__ */ d((e) => {
  if (E.debug("sanitizeDirective called with", e), !(typeof e != "object" || e == null)) {
    if (Array.isArray(e)) {
      e.forEach((t) => Wi(t));
      return;
    }
    for (const t of Object.keys(e)) {
      if (E.debug("Checking key", t), t.startsWith("__") || t.includes("proto") || t.includes("constr") || !yg.has(t) || e[t] == null) {
        E.debug("sanitize deleting key: ", t), delete e[t];
        continue;
      }
      if (typeof e[t] == "object") {
        E.debug("sanitizing object", t), Wi(e[t]);
        continue;
      }
      const r = ["themeCSS", "fontFamily", "altFontFamily"];
      for (const i of r)
        t.includes(i) && (E.debug("sanitizing css option", t), e[t] = xg(e[t]));
    }
    if (e.themeVariables)
      for (const t of Object.keys(e.themeVariables)) {
        const r = e.themeVariables[t];
        r != null && r.match && !r.match(/^[\d "#%(),.;A-Za-z]+$/) && (e.themeVariables[t] = "");
      }
    E.debug("After sanitization", e);
  }
}, "sanitizeDirective"), xg = /* @__PURE__ */ d((e) => {
  let t = 0, r = 0;
  for (const i of e) {
    if (t < r)
      return "{ /* ERROR: Unbalanced CSS */ }";
    i === "{" ? t++ : i === "}" && r++;
  }
  return t !== r ? "{ /* ERROR: Unbalanced CSS */ }" : e;
}, "sanitizeCss"), dr = Object.freeze(jl), At = Ct({}, dr), Yl, gr = [], Ur = Ct({}, dr), Bn = /* @__PURE__ */ d((e, t) => {
  let r = Ct({}, e), i = {};
  for (const n of t)
    Xl(n), i = Ct(i, n);
  if (r = Ct(r, i), i.theme && i.theme in le) {
    const n = Ct({}, Yl), a = Ct(
      n.themeVariables || {},
      i.themeVariables
    );
    r.theme && r.theme in le && (r.themeVariables = le[r.theme].getThemeVariables(a));
  }
  return Ur = r, Vl(Ur), Ur;
}, "updateCurrentConfig"), bg = /* @__PURE__ */ d((e) => (At = Ct({}, dr), At = Ct(At, e), e.theme && le[e.theme] && (At.themeVariables = le[e.theme].getThemeVariables(e.themeVariables)), Bn(At, gr), At), "setSiteConfig"), Cg = /* @__PURE__ */ d((e) => {
  Yl = Ct({}, e);
}, "saveConfigFromInitialize"), _g = /* @__PURE__ */ d((e) => (At = Ct(At, e), Bn(At, gr), At), "updateSiteConfig"), Gl = /* @__PURE__ */ d(() => Ct({}, At), "getSiteConfig"), Ul = /* @__PURE__ */ d((e) => (Vl(e), Ct(Ur, e), Et()), "setConfig"), Et = /* @__PURE__ */ d(() => Ct({}, Ur), "getConfig"), Xl = /* @__PURE__ */ d((e) => {
  e && (["secure", ...At.secure ?? []].forEach((t) => {
    Object.hasOwn(e, t) && (E.debug(`Denied attempt to modify a secure key ${t}`, e[t]), delete e[t]);
  }), Object.keys(e).forEach((t) => {
    t.startsWith("__") && delete e[t];
  }), Object.keys(e).forEach((t) => {
    typeof e[t] == "string" && (e[t].includes("<") || e[t].includes(">") || e[t].includes("url(data:")) && delete e[t], typeof e[t] == "object" && Xl(e[t]);
  }));
}, "sanitize"), wg = /* @__PURE__ */ d((e) => {
  var t;
  Wi(e), e.fontFamily && !((t = e.themeVariables) != null && t.fontFamily) && (e.themeVariables = {
    ...e.themeVariables,
    fontFamily: e.fontFamily
  }), gr.push(e), Bn(At, gr);
}, "addDirective"), Hi = /* @__PURE__ */ d((e = At) => {
  gr = [], Bn(e, gr);
}, "reset"), kg = {
  LAZY_LOAD_DEPRECATED: "The configuration options lazyLoadedDiagrams and loadExternalDiagramsAtStartup are deprecated. Please use registerExternalDiagrams instead."
}, ho = {}, vg = /* @__PURE__ */ d((e) => {
  ho[e] || (E.warn(kg[e]), ho[e] = !0);
}, "issueWarning"), Vl = /* @__PURE__ */ d((e) => {
  e && (e.lazyLoadedDiagrams || e.loadExternalDiagramsAtStartup) && vg("LAZY_LOAD_DEPRECATED");
}, "checkConfig"), ci = /<br\s*\/?>/gi, Sg = /* @__PURE__ */ d((e) => e ? Ql(e).replace(/\\n/g, "#br#").split("#br#") : [""], "getRows"), Tg = /* @__PURE__ */ (() => {
  let e = !1;
  return () => {
    e || (Zl(), e = !0);
  };
})();
function Zl() {
  const e = "data-temp-href-target";
  fr.addHook("beforeSanitizeAttributes", (t) => {
    t instanceof Element && t.tagName === "A" && t.hasAttribute("target") && t.setAttribute(e, t.getAttribute("target") ?? "");
  }), fr.addHook("afterSanitizeAttributes", (t) => {
    t instanceof Element && t.tagName === "A" && t.hasAttribute(e) && (t.setAttribute("target", t.getAttribute(e) ?? ""), t.removeAttribute(e), t.getAttribute("target") === "_blank" && t.setAttribute("rel", "noopener"));
  });
}
d(Zl, "setupDompurifyHooks");
var Kl = /* @__PURE__ */ d((e) => (Tg(), fr.sanitize(e)), "removeScript"), uo = /* @__PURE__ */ d((e, t) => {
  var r;
  if (((r = t.flowchart) == null ? void 0 : r.htmlLabels) !== !1) {
    const i = t.securityLevel;
    i === "antiscript" || i === "strict" ? e = Kl(e) : i !== "loose" && (e = Ql(e), e = e.replace(/</g, "&lt;").replace(/>/g, "&gt;"), e = e.replace(/=/g, "&equals;"), e = Ag(e));
  }
  return e;
}, "sanitizeMore"), Ne = /* @__PURE__ */ d((e, t) => e && (t.dompurifyConfig ? e = fr.sanitize(uo(e, t), t.dompurifyConfig).toString() : e = fr.sanitize(uo(e, t), {
  FORBID_TAGS: ["style"]
}).toString(), e), "sanitizeText"), Bg = /* @__PURE__ */ d((e, t) => typeof e == "string" ? Ne(e, t) : e.flat().map((r) => Ne(r, t)), "sanitizeTextOrArray"), Lg = /* @__PURE__ */ d((e) => ci.test(e), "hasBreaks"), Mg = /* @__PURE__ */ d((e) => e.split(ci), "splitBreaks"), Ag = /* @__PURE__ */ d((e) => e.replace(/#br#/g, "<br/>"), "placeholderToBreak"), Ql = /* @__PURE__ */ d((e) => e.replace(ci, "#br#"), "breakToPlaceholder"), $g = /* @__PURE__ */ d((e) => {
  let t = "";
  return e && (t = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search, t = t.replaceAll(/\(/g, "\\("), t = t.replaceAll(/\)/g, "\\)")), t;
}, "getUrl"), gt = /* @__PURE__ */ d((e) => !(e === !1 || ["false", "null", "0"].includes(String(e).trim().toLowerCase())), "evaluate"), Fg = /* @__PURE__ */ d(function(...e) {
  const t = e.filter((r) => !isNaN(r));
  return Math.max(...t);
}, "getMax"), Eg = /* @__PURE__ */ d(function(...e) {
  const t = e.filter((r) => !isNaN(r));
  return Math.min(...t);
}, "getMin"), fo = /* @__PURE__ */ d(function(e) {
  const t = e.split(/(,)/), r = [];
  for (let i = 0; i < t.length; i++) {
    let n = t[i];
    if (n === "," && i > 0 && i + 1 < t.length) {
      const a = t[i - 1], o = t[i + 1];
      Og(a, o) && (n = a + "," + o, i++, r.pop());
    }
    r.push(Dg(n));
  }
  return r.join("");
}, "parseGenericTypes"), da = /* @__PURE__ */ d((e, t) => Math.max(0, e.split(t).length - 1), "countOccurrence"), Og = /* @__PURE__ */ d((e, t) => {
  const r = da(e, "~"), i = da(t, "~");
  return r === 1 && i === 1;
}, "shouldCombineSets"), Dg = /* @__PURE__ */ d((e) => {
  const t = da(e, "~");
  let r = !1;
  if (t <= 1)
    return e;
  t % 2 !== 0 && e.startsWith("~") && (e = e.substring(1), r = !0);
  const i = [...e];
  let n = i.indexOf("~"), a = i.lastIndexOf("~");
  for (; n !== -1 && a !== -1 && n !== a; )
    i[n] = "<", i[a] = ">", n = i.indexOf("~"), a = i.lastIndexOf("~");
  return r && i.unshift("~"), i.join("");
}, "processSet"), po = /* @__PURE__ */ d(() => window.MathMLElement !== void 0, "isMathMLSupported"), ga = /\$\$(.*)\$\$/g, mr = /* @__PURE__ */ d((e) => {
  var t;
  return (((t = e.match(ga)) == null ? void 0 : t.length) ?? 0) > 0;
}, "hasKatex"), mT = /* @__PURE__ */ d(async (e, t) => {
  e = await cs(e, t);
  const r = document.createElement("div");
  r.innerHTML = e, r.id = "katex-temp", r.style.visibility = "hidden", r.style.position = "absolute", r.style.top = "0";
  const i = document.querySelector("body");
  i == null || i.insertAdjacentElement("beforeend", r);
  const n = { width: r.clientWidth, height: r.clientHeight };
  return r.remove(), n;
}, "calculateMathMLDimensions"), cs = /* @__PURE__ */ d(async (e, t) => {
  if (!mr(e))
    return e;
  if (!(po() || t.legacyMathML || t.forceLegacyMathML))
    return e.replace(ga, "MathML is unsupported in this environment.");
  const { default: r } = await import("./index-D9fhh0Vw.js").then((n) => n.k), i = t.forceLegacyMathML || !po() && t.legacyMathML ? "htmlAndMathml" : "mathml";
  return e.split(ci).map(
    (n) => mr(n) ? `<div style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">${n}</div>` : `<div>${n}</div>`
  ).join("").replace(
    ga,
    (n, a) => r.renderToString(a, {
      throwOnError: !0,
      displayMode: !0,
      output: i
    }).replace(/\n/g, " ").replace(/<annotation.*<\/annotation>/g, "")
  );
}, "renderKatex"), kr = {
  getRows: Sg,
  sanitizeText: Ne,
  sanitizeTextOrArray: Bg,
  hasBreaks: Lg,
  splitBreaks: Mg,
  lineBreakRegex: ci,
  removeScript: Kl,
  getUrl: $g,
  evaluate: gt,
  getMax: Fg,
  getMin: Eg
}, Rg = /* @__PURE__ */ d(function(e, t) {
  for (let r of t)
    e.attr(r[0], r[1]);
}, "d3Attrs"), Ig = /* @__PURE__ */ d(function(e, t, r) {
  let i = /* @__PURE__ */ new Map();
  return r ? (i.set("width", "100%"), i.set("style", `max-width: ${t}px;`)) : (i.set("height", e), i.set("width", t)), i;
}, "calculateSvgSizeAttrs"), Jl = /* @__PURE__ */ d(function(e, t, r, i) {
  const n = Ig(t, r, i);
  Rg(e, n);
}, "configureSvgSize"), Pg = /* @__PURE__ */ d(function(e, t, r, i) {
  const n = t.node().getBBox(), a = n.width, o = n.height;
  E.info(`SVG bounds: ${a}x${o}`, n);
  let s = 0, c = 0;
  E.info(`Graph bounds: ${s}x${c}`, e), s = a + r * 2, c = o + r * 2, E.info(`Calculated bounds: ${s}x${c}`), Jl(t, c, s, i);
  const l = `${n.x - r} ${n.y - r} ${n.width + 2 * r} ${n.height + 2 * r}`;
  t.attr("viewBox", l);
}, "setupGraphViewbox"), Mi = {}, Ng = /* @__PURE__ */ d((e, t, r) => {
  let i = "";
  return e in Mi && Mi[e] ? i = Mi[e](r) : E.warn(`No theme found for ${e}`), ` & {
    font-family: ${r.fontFamily};
    font-size: ${r.fontSize};
    fill: ${r.textColor}
  }
  @keyframes edge-animation-frame {
    from {
      stroke-dashoffset: 0;
    }
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  & .edge-animation-slow {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 50s linear infinite;
    stroke-linecap: round;
  }
  & .edge-animation-fast {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 20s linear infinite;
    stroke-linecap: round;
  }
  /* Classes common for multiple diagrams */

  & .error-icon {
    fill: ${r.errorBkgColor};
  }
  & .error-text {
    fill: ${r.errorTextColor};
    stroke: ${r.errorTextColor};
  }

  & .edge-thickness-normal {
    stroke-width: 1px;
  }
  & .edge-thickness-thick {
    stroke-width: 3.5px
  }
  & .edge-pattern-solid {
    stroke-dasharray: 0;
  }
  & .edge-thickness-invisible {
    stroke-width: 0;
    fill: none;
  }
  & .edge-pattern-dashed{
    stroke-dasharray: 3;
  }
  .edge-pattern-dotted {
    stroke-dasharray: 2;
  }

  & .marker {
    fill: ${r.lineColor};
    stroke: ${r.lineColor};
  }
  & .marker.cross {
    stroke: ${r.lineColor};
  }

  & svg {
    font-family: ${r.fontFamily};
    font-size: ${r.fontSize};
  }
   & p {
    margin: 0
   }

  ${i}

  ${t}
`;
}, "getStyles"), zg = /* @__PURE__ */ d((e, t) => {
  t !== void 0 && (Mi[e] = t);
}, "addStylesForDiagram"), qg = Ng, tc = {};
ng(tc, {
  clear: () => Wg,
  getAccDescription: () => Gg,
  getAccTitle: () => jg,
  getDiagramTitle: () => Xg,
  setAccDescription: () => Yg,
  setAccTitle: () => Hg,
  setDiagramTitle: () => Ug
});
var hs = "", us = "", fs = "", ps = /* @__PURE__ */ d((e) => Ne(e, Et()), "sanitizeText"), Wg = /* @__PURE__ */ d(() => {
  hs = "", fs = "", us = "";
}, "clear"), Hg = /* @__PURE__ */ d((e) => {
  hs = ps(e).replace(/^\s+/g, "");
}, "setAccTitle"), jg = /* @__PURE__ */ d(() => hs, "getAccTitle"), Yg = /* @__PURE__ */ d((e) => {
  fs = ps(e).replace(/\n\s+/g, `
`);
}, "setAccDescription"), Gg = /* @__PURE__ */ d(() => fs, "getAccDescription"), Ug = /* @__PURE__ */ d((e) => {
  us = ps(e);
}, "setDiagramTitle"), Xg = /* @__PURE__ */ d(() => us, "getDiagramTitle"), go = E, Vg = os, nt = Et, yT = Ul, xT = dr, ds = /* @__PURE__ */ d((e) => Ne(e, nt()), "sanitizeText"), Zg = Pg, Kg = /* @__PURE__ */ d(() => tc, "getCommonDb"), ji = {}, Yi = /* @__PURE__ */ d((e, t, r) => {
  var i;
  ji[e] && go.warn(`Diagram with id ${e} already registered. Overwriting.`), ji[e] = t, r && ql(e, r), zg(e, t.styles), (i = t.injectUtils) == null || i.call(
    t,
    go,
    Vg,
    nt,
    ds,
    Zg,
    Kg(),
    () => {
    }
  );
}, "registerDiagram"), ma = /* @__PURE__ */ d((e) => {
  if (e in ji)
    return ji[e];
  throw new Qg(e);
}, "getDiagram"), hr, Qg = (hr = class extends Error {
  constructor(t) {
    super(`Diagram ${t} not found.`);
  }
}, d(hr, "DiagramNotFoundError"), hr);
function gs(e) {
  return typeof e > "u" || e === null;
}
d(gs, "isNothing");
function ec(e) {
  return typeof e == "object" && e !== null;
}
d(ec, "isObject");
function rc(e) {
  return Array.isArray(e) ? e : gs(e) ? [] : [e];
}
d(rc, "toArray");
function ic(e, t) {
  var r, i, n, a;
  if (t)
    for (a = Object.keys(t), r = 0, i = a.length; r < i; r += 1)
      n = a[r], e[n] = t[n];
  return e;
}
d(ic, "extend");
function nc(e, t) {
  var r = "", i;
  for (i = 0; i < t; i += 1)
    r += e;
  return r;
}
d(nc, "repeat");
function ac(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
d(ac, "isNegativeZero");
var Jg = gs, t0 = ec, e0 = rc, r0 = nc, i0 = ac, n0 = ic, dt = {
  isNothing: Jg,
  isObject: t0,
  toArray: e0,
  repeat: r0,
  isNegativeZero: i0,
  extend: n0
};
function ms(e, t) {
  var r = "", i = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), i + " " + r) : i;
}
d(ms, "formatError");
function yr(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = ms(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
d(yr, "YAMLException$1");
yr.prototype = Object.create(Error.prototype);
yr.prototype.constructor = yr;
yr.prototype.toString = /* @__PURE__ */ d(function(t) {
  return this.name + ": " + ms(this, t);
}, "toString");
var $t = yr;
function Ai(e, t, r, i, n) {
  var a = "", o = "", s = Math.floor(n / 2) - 1;
  return i - t > s && (a = " ... ", t = i - s + a.length), r - i > s && (o = " ...", r = i + s - o.length), {
    str: a + e.slice(t, r).replace(/\t/g, "→") + o,
    pos: i - t + a.length
    // relative position
  };
}
d(Ai, "getLine");
function $i(e, t) {
  return dt.repeat(" ", t - e.length) + e;
}
d($i, "padStart");
function sc(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, i = [0], n = [], a, o = -1; a = r.exec(e.buffer); )
    n.push(a.index), i.push(a.index + a[0].length), e.position <= a.index && o < 0 && (o = i.length - 2);
  o < 0 && (o = i.length - 1);
  var s = "", c, l, h = Math.min(e.line + t.linesAfter, n.length).toString().length, u = t.maxLength - (t.indent + h + 3);
  for (c = 1; c <= t.linesBefore && !(o - c < 0); c++)
    l = Ai(
      e.buffer,
      i[o - c],
      n[o - c],
      e.position - (i[o] - i[o - c]),
      u
    ), s = dt.repeat(" ", t.indent) + $i((e.line - c + 1).toString(), h) + " | " + l.str + `
` + s;
  for (l = Ai(e.buffer, i[o], n[o], e.position, u), s += dt.repeat(" ", t.indent) + $i((e.line + 1).toString(), h) + " | " + l.str + `
`, s += dt.repeat("-", t.indent + h + 3 + l.pos) + `^
`, c = 1; c <= t.linesAfter && !(o + c >= n.length); c++)
    l = Ai(
      e.buffer,
      i[o + c],
      n[o + c],
      e.position - (i[o] - i[o + c]),
      u
    ), s += dt.repeat(" ", t.indent) + $i((e.line + c + 1).toString(), h) + " | " + l.str + `
`;
  return s.replace(/\n$/, "");
}
d(sc, "makeSnippet");
var a0 = sc, s0 = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], o0 = [
  "scalar",
  "sequence",
  "mapping"
];
function oc(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(i) {
      t[String(i)] = r;
    });
  }), t;
}
d(oc, "compileStyleAliases");
function lc(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (s0.indexOf(r) === -1)
      throw new $t('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = oc(t.styleAliases || null), o0.indexOf(this.kind) === -1)
    throw new $t('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
d(lc, "Type$1");
var kt = lc;
function ya(e, t) {
  var r = [];
  return e[t].forEach(function(i) {
    var n = r.length;
    r.forEach(function(a, o) {
      a.tag === i.tag && a.kind === i.kind && a.multi === i.multi && (n = o);
    }), r[n] = i;
  }), r;
}
d(ya, "compileList");
function cc() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function i(n) {
    n.multi ? (e.multi[n.kind].push(n), e.multi.fallback.push(n)) : e[n.kind][n.tag] = e.fallback[n.tag] = n;
  }
  for (d(i, "collectType"), t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(i);
  return e;
}
d(cc, "compileMap");
function Gi(e) {
  return this.extend(e);
}
d(Gi, "Schema$1");
Gi.prototype.extend = /* @__PURE__ */ d(function(t) {
  var r = [], i = [];
  if (t instanceof kt)
    i.push(t);
  else if (Array.isArray(t))
    i = i.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (i = i.concat(t.explicit));
  else
    throw new $t("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(a) {
    if (!(a instanceof kt))
      throw new $t("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (a.loadKind && a.loadKind !== "scalar")
      throw new $t("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (a.multi)
      throw new $t("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), i.forEach(function(a) {
    if (!(a instanceof kt))
      throw new $t("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var n = Object.create(Gi.prototype);
  return n.implicit = (this.implicit || []).concat(r), n.explicit = (this.explicit || []).concat(i), n.compiledImplicit = ya(n, "implicit"), n.compiledExplicit = ya(n, "explicit"), n.compiledTypeMap = cc(n.compiledImplicit, n.compiledExplicit), n;
}, "extend");
var l0 = Gi, c0 = new kt("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: /* @__PURE__ */ d(function(e) {
    return e !== null ? e : "";
  }, "construct")
}), h0 = new kt("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: /* @__PURE__ */ d(function(e) {
    return e !== null ? e : [];
  }, "construct")
}), u0 = new kt("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: /* @__PURE__ */ d(function(e) {
    return e !== null ? e : {};
  }, "construct")
}), f0 = new l0({
  explicit: [
    c0,
    h0,
    u0
  ]
});
function hc(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
d(hc, "resolveYamlNull");
function uc() {
  return null;
}
d(uc, "constructYamlNull");
function fc(e) {
  return e === null;
}
d(fc, "isNull");
var p0 = new kt("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: hc,
  construct: uc,
  predicate: fc,
  represent: {
    canonical: /* @__PURE__ */ d(function() {
      return "~";
    }, "canonical"),
    lowercase: /* @__PURE__ */ d(function() {
      return "null";
    }, "lowercase"),
    uppercase: /* @__PURE__ */ d(function() {
      return "NULL";
    }, "uppercase"),
    camelcase: /* @__PURE__ */ d(function() {
      return "Null";
    }, "camelcase"),
    empty: /* @__PURE__ */ d(function() {
      return "";
    }, "empty")
  },
  defaultStyle: "lowercase"
});
function pc(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
d(pc, "resolveYamlBoolean");
function dc(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
d(dc, "constructYamlBoolean");
function gc(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
d(gc, "isBoolean");
var d0 = new kt("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: pc,
  construct: dc,
  predicate: gc,
  represent: {
    lowercase: /* @__PURE__ */ d(function(e) {
      return e ? "true" : "false";
    }, "lowercase"),
    uppercase: /* @__PURE__ */ d(function(e) {
      return e ? "TRUE" : "FALSE";
    }, "uppercase"),
    camelcase: /* @__PURE__ */ d(function(e) {
      return e ? "True" : "False";
    }, "camelcase")
  },
  defaultStyle: "lowercase"
});
function mc(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
d(mc, "isHexCode");
function yc(e) {
  return 48 <= e && e <= 55;
}
d(yc, "isOctCode");
function xc(e) {
  return 48 <= e && e <= 57;
}
d(xc, "isDecCode");
function bc(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, i = !1, n;
  if (!t) return !1;
  if (n = e[r], (n === "-" || n === "+") && (n = e[++r]), n === "0") {
    if (r + 1 === t) return !0;
    if (n = e[++r], n === "b") {
      for (r++; r < t; r++)
        if (n = e[r], n !== "_") {
          if (n !== "0" && n !== "1") return !1;
          i = !0;
        }
      return i && n !== "_";
    }
    if (n === "x") {
      for (r++; r < t; r++)
        if (n = e[r], n !== "_") {
          if (!mc(e.charCodeAt(r))) return !1;
          i = !0;
        }
      return i && n !== "_";
    }
    if (n === "o") {
      for (r++; r < t; r++)
        if (n = e[r], n !== "_") {
          if (!yc(e.charCodeAt(r))) return !1;
          i = !0;
        }
      return i && n !== "_";
    }
  }
  if (n === "_") return !1;
  for (; r < t; r++)
    if (n = e[r], n !== "_") {
      if (!xc(e.charCodeAt(r)))
        return !1;
      i = !0;
    }
  return !(!i || n === "_");
}
d(bc, "resolveYamlInteger");
function Cc(e) {
  var t = e, r = 1, i;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), i = t[0], (i === "-" || i === "+") && (i === "-" && (r = -1), t = t.slice(1), i = t[0]), t === "0") return 0;
  if (i === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
d(Cc, "constructYamlInteger");
function _c(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !dt.isNegativeZero(e);
}
d(_c, "isInteger");
var g0 = new kt("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: bc,
  construct: Cc,
  predicate: _c,
  represent: {
    binary: /* @__PURE__ */ d(function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    }, "binary"),
    octal: /* @__PURE__ */ d(function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    }, "octal"),
    decimal: /* @__PURE__ */ d(function(e) {
      return e.toString(10);
    }, "decimal"),
    /* eslint-disable max-len */
    hexadecimal: /* @__PURE__ */ d(function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }, "hexadecimal")
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), m0 = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function wc(e) {
  return !(e === null || !m0.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
d(wc, "resolveYamlFloat");
function kc(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
d(kc, "constructYamlFloat");
var y0 = /^[-+]?[0-9]+e/;
function vc(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (dt.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), y0.test(r) ? r.replace("e", ".e") : r;
}
d(vc, "representYamlFloat");
function Sc(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || dt.isNegativeZero(e));
}
d(Sc, "isFloat");
var x0 = new kt("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: wc,
  construct: kc,
  predicate: Sc,
  represent: vc,
  defaultStyle: "lowercase"
}), Tc = f0.extend({
  implicit: [
    p0,
    d0,
    g0,
    x0
  ]
}), b0 = Tc, Bc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Lc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Mc(e) {
  return e === null ? !1 : Bc.exec(e) !== null || Lc.exec(e) !== null;
}
d(Mc, "resolveYamlTimestamp");
function Ac(e) {
  var t, r, i, n, a, o, s, c = 0, l = null, h, u, f;
  if (t = Bc.exec(e), t === null && (t = Lc.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], i = +t[2] - 1, n = +t[3], !t[4])
    return new Date(Date.UTC(r, i, n));
  if (a = +t[4], o = +t[5], s = +t[6], t[7]) {
    for (c = t[7].slice(0, 3); c.length < 3; )
      c += "0";
    c = +c;
  }
  return t[9] && (h = +t[10], u = +(t[11] || 0), l = (h * 60 + u) * 6e4, t[9] === "-" && (l = -l)), f = new Date(Date.UTC(r, i, n, a, o, s, c)), l && f.setTime(f.getTime() - l), f;
}
d(Ac, "constructYamlTimestamp");
function $c(e) {
  return e.toISOString();
}
d($c, "representYamlTimestamp");
var C0 = new kt("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Mc,
  construct: Ac,
  instanceOf: Date,
  represent: $c
});
function Fc(e) {
  return e === "<<" || e === null;
}
d(Fc, "resolveYamlMerge");
var _0 = new kt("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Fc
}), ys = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Ec(e) {
  if (e === null) return !1;
  var t, r, i = 0, n = e.length, a = ys;
  for (r = 0; r < n; r++)
    if (t = a.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      i += 6;
    }
  return i % 8 === 0;
}
d(Ec, "resolveYamlBinary");
function Oc(e) {
  var t, r, i = e.replace(/[\r\n=]/g, ""), n = i.length, a = ys, o = 0, s = [];
  for (t = 0; t < n; t++)
    t % 4 === 0 && t && (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)), o = o << 6 | a.indexOf(i.charAt(t));
  return r = n % 4 * 6, r === 0 ? (s.push(o >> 16 & 255), s.push(o >> 8 & 255), s.push(o & 255)) : r === 18 ? (s.push(o >> 10 & 255), s.push(o >> 2 & 255)) : r === 12 && s.push(o >> 4 & 255), new Uint8Array(s);
}
d(Oc, "constructYamlBinary");
function Dc(e) {
  var t = "", r = 0, i, n, a = e.length, o = ys;
  for (i = 0; i < a; i++)
    i % 3 === 0 && i && (t += o[r >> 18 & 63], t += o[r >> 12 & 63], t += o[r >> 6 & 63], t += o[r & 63]), r = (r << 8) + e[i];
  return n = a % 3, n === 0 ? (t += o[r >> 18 & 63], t += o[r >> 12 & 63], t += o[r >> 6 & 63], t += o[r & 63]) : n === 2 ? (t += o[r >> 10 & 63], t += o[r >> 4 & 63], t += o[r << 2 & 63], t += o[64]) : n === 1 && (t += o[r >> 2 & 63], t += o[r << 4 & 63], t += o[64], t += o[64]), t;
}
d(Dc, "representYamlBinary");
function Rc(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
d(Rc, "isBinary");
var w0 = new kt("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Ec,
  construct: Oc,
  predicate: Rc,
  represent: Dc
}), k0 = Object.prototype.hasOwnProperty, v0 = Object.prototype.toString;
function Ic(e) {
  if (e === null) return !0;
  var t = [], r, i, n, a, o, s = e;
  for (r = 0, i = s.length; r < i; r += 1) {
    if (n = s[r], o = !1, v0.call(n) !== "[object Object]") return !1;
    for (a in n)
      if (k0.call(n, a))
        if (!o) o = !0;
        else return !1;
    if (!o) return !1;
    if (t.indexOf(a) === -1) t.push(a);
    else return !1;
  }
  return !0;
}
d(Ic, "resolveYamlOmap");
function Pc(e) {
  return e !== null ? e : [];
}
d(Pc, "constructYamlOmap");
var S0 = new kt("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Ic,
  construct: Pc
}), T0 = Object.prototype.toString;
function Nc(e) {
  if (e === null) return !0;
  var t, r, i, n, a, o = e;
  for (a = new Array(o.length), t = 0, r = o.length; t < r; t += 1) {
    if (i = o[t], T0.call(i) !== "[object Object]" || (n = Object.keys(i), n.length !== 1)) return !1;
    a[t] = [n[0], i[n[0]]];
  }
  return !0;
}
d(Nc, "resolveYamlPairs");
function zc(e) {
  if (e === null) return [];
  var t, r, i, n, a, o = e;
  for (a = new Array(o.length), t = 0, r = o.length; t < r; t += 1)
    i = o[t], n = Object.keys(i), a[t] = [n[0], i[n[0]]];
  return a;
}
d(zc, "constructYamlPairs");
var B0 = new kt("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Nc,
  construct: zc
}), L0 = Object.prototype.hasOwnProperty;
function qc(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (L0.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
d(qc, "resolveYamlSet");
function Wc(e) {
  return e !== null ? e : {};
}
d(Wc, "constructYamlSet");
var M0 = new kt("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: qc,
  construct: Wc
}), Hc = b0.extend({
  implicit: [
    C0,
    _0
  ],
  explicit: [
    w0,
    S0,
    B0,
    M0
  ]
}), we = Object.prototype.hasOwnProperty, Ui = 1, jc = 2, Yc = 3, Xi = 4, Kn = 1, A0 = 2, mo = 3, $0 = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, F0 = /[\x85\u2028\u2029]/, E0 = /[,\[\]\{\}]/, Gc = /^(?:!|!!|![a-z\-]+!)$/i, Uc = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function xa(e) {
  return Object.prototype.toString.call(e);
}
d(xa, "_class");
function Ht(e) {
  return e === 10 || e === 13;
}
d(Ht, "is_EOL");
function _e(e) {
  return e === 9 || e === 32;
}
d(_e, "is_WHITE_SPACE");
function Tt(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
d(Tt, "is_WS_OR_EOL");
function Ee(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
d(Ee, "is_FLOW_INDICATOR");
function Xc(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
d(Xc, "fromHexCode");
function Vc(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
d(Vc, "escapedHexLen");
function Zc(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
d(Zc, "fromDecimalCode");
function ba(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
d(ba, "simpleEscapeSequence");
function Kc(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
d(Kc, "charFromCodepoint");
var Qc = new Array(256), Jc = new Array(256);
for (Le = 0; Le < 256; Le++)
  Qc[Le] = ba(Le) ? 1 : 0, Jc[Le] = ba(Le);
var Le;
function th(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Hc, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
d(th, "State$1");
function xs(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = a0(r), new $t(t, r);
}
d(xs, "generateError");
function U(e, t) {
  throw xs(e, t);
}
d(U, "throwError");
function Zr(e, t) {
  e.onWarning && e.onWarning.call(null, xs(e, t));
}
d(Zr, "throwWarning");
var yo = {
  YAML: /* @__PURE__ */ d(function(t, r, i) {
    var n, a, o;
    t.version !== null && U(t, "duplication of %YAML directive"), i.length !== 1 && U(t, "YAML directive accepts exactly one argument"), n = /^([0-9]+)\.([0-9]+)$/.exec(i[0]), n === null && U(t, "ill-formed argument of the YAML directive"), a = parseInt(n[1], 10), o = parseInt(n[2], 10), a !== 1 && U(t, "unacceptable YAML version of the document"), t.version = i[0], t.checkLineBreaks = o < 2, o !== 1 && o !== 2 && Zr(t, "unsupported YAML version of the document");
  }, "handleYamlDirective"),
  TAG: /* @__PURE__ */ d(function(t, r, i) {
    var n, a;
    i.length !== 2 && U(t, "TAG directive accepts exactly two arguments"), n = i[0], a = i[1], Gc.test(n) || U(t, "ill-formed tag handle (first argument) of the TAG directive"), we.call(t.tagMap, n) && U(t, 'there is a previously declared suffix for "' + n + '" tag handle'), Uc.test(a) || U(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      a = decodeURIComponent(a);
    } catch {
      U(t, "tag prefix is malformed: " + a);
    }
    t.tagMap[n] = a;
  }, "handleTagDirective")
};
function ce(e, t, r, i) {
  var n, a, o, s;
  if (t < r) {
    if (s = e.input.slice(t, r), i)
      for (n = 0, a = s.length; n < a; n += 1)
        o = s.charCodeAt(n), o === 9 || 32 <= o && o <= 1114111 || U(e, "expected valid JSON character");
    else $0.test(s) && U(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
d(ce, "captureSegment");
function Ca(e, t, r, i) {
  var n, a, o, s;
  for (dt.isObject(r) || U(e, "cannot merge mappings; the provided source object is unacceptable"), n = Object.keys(r), o = 0, s = n.length; o < s; o += 1)
    a = n[o], we.call(t, a) || (t[a] = r[a], i[a] = !0);
}
d(Ca, "mergeMappings");
function Oe(e, t, r, i, n, a, o, s, c) {
  var l, h;
  if (Array.isArray(n))
    for (n = Array.prototype.slice.call(n), l = 0, h = n.length; l < h; l += 1)
      Array.isArray(n[l]) && U(e, "nested arrays are not supported inside keys"), typeof n == "object" && xa(n[l]) === "[object Object]" && (n[l] = "[object Object]");
  if (typeof n == "object" && xa(n) === "[object Object]" && (n = "[object Object]"), n = String(n), t === null && (t = {}), i === "tag:yaml.org,2002:merge")
    if (Array.isArray(a))
      for (l = 0, h = a.length; l < h; l += 1)
        Ca(e, t, a[l], r);
    else
      Ca(e, t, a, r);
  else
    !e.json && !we.call(r, n) && we.call(t, n) && (e.line = o || e.line, e.lineStart = s || e.lineStart, e.position = c || e.position, U(e, "duplicated mapping key")), n === "__proto__" ? Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: a
    }) : t[n] = a, delete r[n];
  return t;
}
d(Oe, "storeMappingPair");
function Ln(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : U(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
d(Ln, "readLineBreak");
function ft(e, t, r) {
  for (var i = 0, n = e.input.charCodeAt(e.position); n !== 0; ) {
    for (; _e(n); )
      n === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), n = e.input.charCodeAt(++e.position);
    if (t && n === 35)
      do
        n = e.input.charCodeAt(++e.position);
      while (n !== 10 && n !== 13 && n !== 0);
    if (Ht(n))
      for (Ln(e), n = e.input.charCodeAt(e.position), i++, e.lineIndent = 0; n === 32; )
        e.lineIndent++, n = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && i !== 0 && e.lineIndent < r && Zr(e, "deficient indentation"), i;
}
d(ft, "skipSeparationSpace");
function hi(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || Tt(r)));
}
d(hi, "testDocumentSeparator");
function Mn(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += dt.repeat(`
`, t - 1));
}
d(Mn, "writeFoldedLines");
function eh(e, t, r) {
  var i, n, a, o, s, c, l, h, u = e.kind, f = e.result, p;
  if (p = e.input.charCodeAt(e.position), Tt(p) || Ee(p) || p === 35 || p === 38 || p === 42 || p === 33 || p === 124 || p === 62 || p === 39 || p === 34 || p === 37 || p === 64 || p === 96 || (p === 63 || p === 45) && (n = e.input.charCodeAt(e.position + 1), Tt(n) || r && Ee(n)))
    return !1;
  for (e.kind = "scalar", e.result = "", a = o = e.position, s = !1; p !== 0; ) {
    if (p === 58) {
      if (n = e.input.charCodeAt(e.position + 1), Tt(n) || r && Ee(n))
        break;
    } else if (p === 35) {
      if (i = e.input.charCodeAt(e.position - 1), Tt(i))
        break;
    } else {
      if (e.position === e.lineStart && hi(e) || r && Ee(p))
        break;
      if (Ht(p))
        if (c = e.line, l = e.lineStart, h = e.lineIndent, ft(e, !1, -1), e.lineIndent >= t) {
          s = !0, p = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = o, e.line = c, e.lineStart = l, e.lineIndent = h;
          break;
        }
    }
    s && (ce(e, a, o, !1), Mn(e, e.line - c), a = o = e.position, s = !1), _e(p) || (o = e.position + 1), p = e.input.charCodeAt(++e.position);
  }
  return ce(e, a, o, !1), e.result ? !0 : (e.kind = u, e.result = f, !1);
}
d(eh, "readPlainScalar");
function rh(e, t) {
  var r, i, n;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, i = n = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (ce(e, i, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        i = e.position, e.position++, n = e.position;
      else
        return !0;
    else Ht(r) ? (ce(e, i, n, !0), Mn(e, ft(e, !1, t)), i = n = e.position) : e.position === e.lineStart && hi(e) ? U(e, "unexpected end of the document within a single quoted scalar") : (e.position++, n = e.position);
  U(e, "unexpected end of the stream within a single quoted scalar");
}
d(rh, "readSingleQuotedScalar");
function ih(e, t) {
  var r, i, n, a, o, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = i = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return ce(e, r, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (ce(e, r, e.position, !0), s = e.input.charCodeAt(++e.position), Ht(s))
        ft(e, !1, t);
      else if (s < 256 && Qc[s])
        e.result += Jc[s], e.position++;
      else if ((o = Vc(s)) > 0) {
        for (n = o, a = 0; n > 0; n--)
          s = e.input.charCodeAt(++e.position), (o = Xc(s)) >= 0 ? a = (a << 4) + o : U(e, "expected hexadecimal character");
        e.result += Kc(a), e.position++;
      } else
        U(e, "unknown escape sequence");
      r = i = e.position;
    } else Ht(s) ? (ce(e, r, i, !0), Mn(e, ft(e, !1, t)), r = i = e.position) : e.position === e.lineStart && hi(e) ? U(e, "unexpected end of the document within a double quoted scalar") : (e.position++, i = e.position);
  }
  U(e, "unexpected end of the stream within a double quoted scalar");
}
d(ih, "readDoubleQuotedScalar");
function nh(e, t) {
  var r = !0, i, n, a, o = e.tag, s, c = e.anchor, l, h, u, f, p, g = /* @__PURE__ */ Object.create(null), m, y, x, b;
  if (b = e.input.charCodeAt(e.position), b === 91)
    h = 93, p = !1, s = [];
  else if (b === 123)
    h = 125, p = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), b = e.input.charCodeAt(++e.position); b !== 0; ) {
    if (ft(e, !0, t), b = e.input.charCodeAt(e.position), b === h)
      return e.position++, e.tag = o, e.anchor = c, e.kind = p ? "mapping" : "sequence", e.result = s, !0;
    r ? b === 44 && U(e, "expected the node content, but found ','") : U(e, "missed comma between flow collection entries"), y = m = x = null, u = f = !1, b === 63 && (l = e.input.charCodeAt(e.position + 1), Tt(l) && (u = f = !0, e.position++, ft(e, !0, t))), i = e.line, n = e.lineStart, a = e.position, ze(e, t, Ui, !1, !0), y = e.tag, m = e.result, ft(e, !0, t), b = e.input.charCodeAt(e.position), (f || e.line === i) && b === 58 && (u = !0, b = e.input.charCodeAt(++e.position), ft(e, !0, t), ze(e, t, Ui, !1, !0), x = e.result), p ? Oe(e, s, g, y, m, x, i, n, a) : u ? s.push(Oe(e, null, g, y, m, x, i, n, a)) : s.push(m), ft(e, !0, t), b = e.input.charCodeAt(e.position), b === 44 ? (r = !0, b = e.input.charCodeAt(++e.position)) : r = !1;
  }
  U(e, "unexpected end of the stream within a flow collection");
}
d(nh, "readFlowCollection");
function ah(e, t) {
  var r, i, n = Kn, a = !1, o = !1, s = t, c = 0, l = !1, h, u;
  if (u = e.input.charCodeAt(e.position), u === 124)
    i = !1;
  else if (u === 62)
    i = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; u !== 0; )
    if (u = e.input.charCodeAt(++e.position), u === 43 || u === 45)
      Kn === n ? n = u === 43 ? mo : A0 : U(e, "repeat of a chomping mode identifier");
    else if ((h = Zc(u)) >= 0)
      h === 0 ? U(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? U(e, "repeat of an indentation width identifier") : (s = t + h - 1, o = !0);
    else
      break;
  if (_e(u)) {
    do
      u = e.input.charCodeAt(++e.position);
    while (_e(u));
    if (u === 35)
      do
        u = e.input.charCodeAt(++e.position);
      while (!Ht(u) && u !== 0);
  }
  for (; u !== 0; ) {
    for (Ln(e), e.lineIndent = 0, u = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && u === 32; )
      e.lineIndent++, u = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > s && (s = e.lineIndent), Ht(u)) {
      c++;
      continue;
    }
    if (e.lineIndent < s) {
      n === mo ? e.result += dt.repeat(`
`, a ? 1 + c : c) : n === Kn && a && (e.result += `
`);
      break;
    }
    for (i ? _e(u) ? (l = !0, e.result += dt.repeat(`
`, a ? 1 + c : c)) : l ? (l = !1, e.result += dt.repeat(`
`, c + 1)) : c === 0 ? a && (e.result += " ") : e.result += dt.repeat(`
`, c) : e.result += dt.repeat(`
`, a ? 1 + c : c), a = !0, o = !0, c = 0, r = e.position; !Ht(u) && u !== 0; )
      u = e.input.charCodeAt(++e.position);
    ce(e, r, e.position, !1);
  }
  return !0;
}
d(ah, "readBlockScalar");
function _a(e, t) {
  var r, i = e.tag, n = e.anchor, a = [], o, s = !1, c;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = a), c = e.input.charCodeAt(e.position); c !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, U(e, "tab characters must not be used in indentation")), !(c !== 45 || (o = e.input.charCodeAt(e.position + 1), !Tt(o)))); ) {
    if (s = !0, e.position++, ft(e, !0, -1) && e.lineIndent <= t) {
      a.push(null), c = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, ze(e, t, Yc, !1, !0), a.push(e.result), ft(e, !0, -1), c = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && c !== 0)
      U(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = i, e.anchor = n, e.kind = "sequence", e.result = a, !0) : !1;
}
d(_a, "readBlockSequence");
function sh(e, t, r) {
  var i, n, a, o, s, c, l = e.tag, h = e.anchor, u = {}, f = /* @__PURE__ */ Object.create(null), p = null, g = null, m = null, y = !1, x = !1, b;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = u), b = e.input.charCodeAt(e.position); b !== 0; ) {
    if (!y && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, U(e, "tab characters must not be used in indentation")), i = e.input.charCodeAt(e.position + 1), a = e.line, (b === 63 || b === 58) && Tt(i))
      b === 63 ? (y && (Oe(e, u, f, p, g, null, o, s, c), p = g = m = null), x = !0, y = !0, n = !0) : y ? (y = !1, n = !0) : U(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, b = i;
    else {
      if (o = e.line, s = e.lineStart, c = e.position, !ze(e, r, jc, !1, !0))
        break;
      if (e.line === a) {
        for (b = e.input.charCodeAt(e.position); _e(b); )
          b = e.input.charCodeAt(++e.position);
        if (b === 58)
          b = e.input.charCodeAt(++e.position), Tt(b) || U(e, "a whitespace character is expected after the key-value separator within a block mapping"), y && (Oe(e, u, f, p, g, null, o, s, c), p = g = m = null), x = !0, y = !1, n = !1, p = e.tag, g = e.result;
        else if (x)
          U(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = l, e.anchor = h, !0;
      } else if (x)
        U(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = l, e.anchor = h, !0;
    }
    if ((e.line === a || e.lineIndent > t) && (y && (o = e.line, s = e.lineStart, c = e.position), ze(e, t, Xi, !0, n) && (y ? g = e.result : m = e.result), y || (Oe(e, u, f, p, g, m, o, s, c), p = g = m = null), ft(e, !0, -1), b = e.input.charCodeAt(e.position)), (e.line === a || e.lineIndent > t) && b !== 0)
      U(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return y && Oe(e, u, f, p, g, null, o, s, c), x && (e.tag = l, e.anchor = h, e.kind = "mapping", e.result = u), x;
}
d(sh, "readBlockMapping");
function oh(e) {
  var t, r = !1, i = !1, n, a, o;
  if (o = e.input.charCodeAt(e.position), o !== 33) return !1;
  if (e.tag !== null && U(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (r = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (i = !0, n = "!!", o = e.input.charCodeAt(++e.position)) : n = "!", t = e.position, r) {
    do
      o = e.input.charCodeAt(++e.position);
    while (o !== 0 && o !== 62);
    e.position < e.length ? (a = e.input.slice(t, e.position), o = e.input.charCodeAt(++e.position)) : U(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; o !== 0 && !Tt(o); )
      o === 33 && (i ? U(e, "tag suffix cannot contain exclamation marks") : (n = e.input.slice(t - 1, e.position + 1), Gc.test(n) || U(e, "named tag handle cannot contain such characters"), i = !0, t = e.position + 1)), o = e.input.charCodeAt(++e.position);
    a = e.input.slice(t, e.position), E0.test(a) && U(e, "tag suffix cannot contain flow indicator characters");
  }
  a && !Uc.test(a) && U(e, "tag name cannot contain such characters: " + a);
  try {
    a = decodeURIComponent(a);
  } catch {
    U(e, "tag name is malformed: " + a);
  }
  return r ? e.tag = a : we.call(e.tagMap, n) ? e.tag = e.tagMap[n] + a : n === "!" ? e.tag = "!" + a : n === "!!" ? e.tag = "tag:yaml.org,2002:" + a : U(e, 'undeclared tag handle "' + n + '"'), !0;
}
d(oh, "readTagProperty");
function lh(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && U(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !Tt(r) && !Ee(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && U(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
d(lh, "readAnchorProperty");
function ch(e) {
  var t, r, i;
  if (i = e.input.charCodeAt(e.position), i !== 42) return !1;
  for (i = e.input.charCodeAt(++e.position), t = e.position; i !== 0 && !Tt(i) && !Ee(i); )
    i = e.input.charCodeAt(++e.position);
  return e.position === t && U(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), we.call(e.anchorMap, r) || U(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], ft(e, !0, -1), !0;
}
d(ch, "readAlias");
function ze(e, t, r, i, n) {
  var a, o, s, c = 1, l = !1, h = !1, u, f, p, g, m, y;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, a = o = s = Xi === r || Yc === r, i && ft(e, !0, -1) && (l = !0, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)), c === 1)
    for (; oh(e) || lh(e); )
      ft(e, !0, -1) ? (l = !0, s = a, e.lineIndent > t ? c = 1 : e.lineIndent === t ? c = 0 : e.lineIndent < t && (c = -1)) : s = !1;
  if (s && (s = l || n), (c === 1 || Xi === r) && (Ui === r || jc === r ? m = t : m = t + 1, y = e.position - e.lineStart, c === 1 ? s && (_a(e, y) || sh(e, y, m)) || nh(e, m) ? h = !0 : (o && ah(e, m) || rh(e, m) || ih(e, m) ? h = !0 : ch(e) ? (h = !0, (e.tag !== null || e.anchor !== null) && U(e, "alias node should not have any properties")) : eh(e, m, Ui === r) && (h = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : c === 0 && (h = s && _a(e, y))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && U(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), u = 0, f = e.implicitTypes.length; u < f; u += 1)
      if (g = e.implicitTypes[u], g.resolve(e.result)) {
        e.result = g.construct(e.result), e.tag = g.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (we.call(e.typeMap[e.kind || "fallback"], e.tag))
      g = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (g = null, p = e.typeMap.multi[e.kind || "fallback"], u = 0, f = p.length; u < f; u += 1)
        if (e.tag.slice(0, p[u].tag.length) === p[u].tag) {
          g = p[u];
          break;
        }
    g || U(e, "unknown tag !<" + e.tag + ">"), e.result !== null && g.kind !== e.kind && U(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + g.kind + '", not "' + e.kind + '"'), g.resolve(e.result, e.tag) ? (e.result = g.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : U(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || h;
}
d(ze, "composeNode");
function hh(e) {
  var t = e.position, r, i, n, a = !1, o;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (o = e.input.charCodeAt(e.position)) !== 0 && (ft(e, !0, -1), o = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || o !== 37)); ) {
    for (a = !0, o = e.input.charCodeAt(++e.position), r = e.position; o !== 0 && !Tt(o); )
      o = e.input.charCodeAt(++e.position);
    for (i = e.input.slice(r, e.position), n = [], i.length < 1 && U(e, "directive name must not be less than one character in length"); o !== 0; ) {
      for (; _e(o); )
        o = e.input.charCodeAt(++e.position);
      if (o === 35) {
        do
          o = e.input.charCodeAt(++e.position);
        while (o !== 0 && !Ht(o));
        break;
      }
      if (Ht(o)) break;
      for (r = e.position; o !== 0 && !Tt(o); )
        o = e.input.charCodeAt(++e.position);
      n.push(e.input.slice(r, e.position));
    }
    o !== 0 && Ln(e), we.call(yo, i) ? yo[i](e, i, n) : Zr(e, 'unknown document directive "' + i + '"');
  }
  if (ft(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ft(e, !0, -1)) : a && U(e, "directives end mark is expected"), ze(e, e.lineIndent - 1, Xi, !1, !0), ft(e, !0, -1), e.checkLineBreaks && F0.test(e.input.slice(t, e.position)) && Zr(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && hi(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, ft(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    U(e, "end of the stream or a document separator is expected");
  else
    return;
}
d(hh, "readDocument");
function bs(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new th(e, t), i = e.indexOf("\0");
  for (i !== -1 && (r.position = i, U(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    hh(r);
  return r.documents;
}
d(bs, "loadDocuments");
function O0(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var i = bs(e, r);
  if (typeof t != "function")
    return i;
  for (var n = 0, a = i.length; n < a; n += 1)
    t(i[n]);
}
d(O0, "loadAll$1");
function uh(e, t) {
  var r = bs(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new $t("expected a single document in the stream, but found more");
  }
}
d(uh, "load$1");
var D0 = uh, R0 = {
  load: D0
}, fh = Object.prototype.toString, ph = Object.prototype.hasOwnProperty, Cs = 65279, I0 = 9, Kr = 10, P0 = 13, N0 = 32, z0 = 33, q0 = 34, wa = 35, W0 = 37, H0 = 38, j0 = 39, Y0 = 42, dh = 44, G0 = 45, Vi = 58, U0 = 61, X0 = 62, V0 = 63, Z0 = 64, gh = 91, mh = 93, K0 = 96, yh = 123, Q0 = 124, xh = 125, vt = {};
vt[0] = "\\0";
vt[7] = "\\a";
vt[8] = "\\b";
vt[9] = "\\t";
vt[10] = "\\n";
vt[11] = "\\v";
vt[12] = "\\f";
vt[13] = "\\r";
vt[27] = "\\e";
vt[34] = '\\"';
vt[92] = "\\\\";
vt[133] = "\\N";
vt[160] = "\\_";
vt[8232] = "\\L";
vt[8233] = "\\P";
var J0 = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], tm = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function bh(e, t) {
  var r, i, n, a, o, s, c;
  if (t === null) return {};
  for (r = {}, i = Object.keys(t), n = 0, a = i.length; n < a; n += 1)
    o = i[n], s = String(t[o]), o.slice(0, 2) === "!!" && (o = "tag:yaml.org,2002:" + o.slice(2)), c = e.compiledTypeMap.fallback[o], c && ph.call(c.styleAliases, s) && (s = c.styleAliases[s]), r[o] = s;
  return r;
}
d(bh, "compileStyleMap");
function Ch(e) {
  var t, r, i;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", i = 2;
  else if (e <= 65535)
    r = "u", i = 4;
  else if (e <= 4294967295)
    r = "U", i = 8;
  else
    throw new $t("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + dt.repeat("0", i - t.length) + t;
}
d(Ch, "encodeHex");
var em = 1, Qr = 2;
function _h(e) {
  this.schema = e.schema || Hc, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = dt.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = bh(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? Qr : em, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
d(_h, "State");
function ka(e, t) {
  for (var r = dt.repeat(" ", t), i = 0, n = -1, a = "", o, s = e.length; i < s; )
    n = e.indexOf(`
`, i), n === -1 ? (o = e.slice(i), i = s) : (o = e.slice(i, n + 1), i = n + 1), o.length && o !== `
` && (a += r), a += o;
  return a;
}
d(ka, "indentString");
function Zi(e, t) {
  return `
` + dt.repeat(" ", e.indent * t);
}
d(Zi, "generateNextLine");
function wh(e, t) {
  var r, i, n;
  for (r = 0, i = e.implicitTypes.length; r < i; r += 1)
    if (n = e.implicitTypes[r], n.resolve(t))
      return !0;
  return !1;
}
d(wh, "testImplicitResolving");
function Jr(e) {
  return e === N0 || e === I0;
}
d(Jr, "isWhitespace");
function xr(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Cs || 65536 <= e && e <= 1114111;
}
d(xr, "isPrintable");
function va(e) {
  return xr(e) && e !== Cs && e !== P0 && e !== Kr;
}
d(va, "isNsCharOrWhitespace");
function Sa(e, t, r) {
  var i = va(e), n = i && !Jr(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      i
    ) : i && e !== dh && e !== gh && e !== mh && e !== yh && e !== xh) && e !== wa && !(t === Vi && !n) || va(t) && !Jr(t) && e === wa || t === Vi && n
  );
}
d(Sa, "isPlainSafe");
function kh(e) {
  return xr(e) && e !== Cs && !Jr(e) && e !== G0 && e !== V0 && e !== Vi && e !== dh && e !== gh && e !== mh && e !== yh && e !== xh && e !== wa && e !== H0 && e !== Y0 && e !== z0 && e !== Q0 && e !== U0 && e !== X0 && e !== j0 && e !== q0 && e !== W0 && e !== Z0 && e !== K0;
}
d(kh, "isPlainSafeFirst");
function vh(e) {
  return !Jr(e) && e !== Vi;
}
d(vh, "isPlainSafeLast");
function tr(e, t) {
  var r = e.charCodeAt(t), i;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (i = e.charCodeAt(t + 1), i >= 56320 && i <= 57343) ? (r - 55296) * 1024 + i - 56320 + 65536 : r;
}
d(tr, "codePointAt");
function _s(e) {
  var t = /^\n* /;
  return t.test(e);
}
d(_s, "needIndentIndicator");
var Sh = 1, Ta = 2, Th = 3, Bh = 4, Qe = 5;
function Lh(e, t, r, i, n, a, o, s) {
  var c, l = 0, h = null, u = !1, f = !1, p = i !== -1, g = -1, m = kh(tr(e, 0)) && vh(tr(e, e.length - 1));
  if (t || o)
    for (c = 0; c < e.length; l >= 65536 ? c += 2 : c++) {
      if (l = tr(e, c), !xr(l))
        return Qe;
      m = m && Sa(l, h, s), h = l;
    }
  else {
    for (c = 0; c < e.length; l >= 65536 ? c += 2 : c++) {
      if (l = tr(e, c), l === Kr)
        u = !0, p && (f = f || // Foldable line = too long, and not more-indented.
        c - g - 1 > i && e[g + 1] !== " ", g = c);
      else if (!xr(l))
        return Qe;
      m = m && Sa(l, h, s), h = l;
    }
    f = f || p && c - g - 1 > i && e[g + 1] !== " ";
  }
  return !u && !f ? m && !o && !n(e) ? Sh : a === Qr ? Qe : Ta : r > 9 && _s(e) ? Qe : o ? a === Qr ? Qe : Ta : f ? Bh : Th;
}
d(Lh, "chooseScalarStyle");
function Mh(e, t, r, i, n) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === Qr ? '""' : "''";
    if (!e.noCompatMode && (J0.indexOf(t) !== -1 || tm.test(t)))
      return e.quotingType === Qr ? '"' + t + '"' : "'" + t + "'";
    var a = e.indent * Math.max(1, r), o = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - a), s = i || e.flowLevel > -1 && r >= e.flowLevel;
    function c(l) {
      return wh(e, l);
    }
    switch (d(c, "testAmbiguity"), Lh(
      t,
      s,
      e.indent,
      o,
      c,
      e.quotingType,
      e.forceQuotes && !i,
      n
    )) {
      case Sh:
        return t;
      case Ta:
        return "'" + t.replace(/'/g, "''") + "'";
      case Th:
        return "|" + Ba(t, e.indent) + La(ka(t, a));
      case Bh:
        return ">" + Ba(t, e.indent) + La(ka(Ah(t, o), a));
      case Qe:
        return '"' + $h(t) + '"';
      default:
        throw new $t("impossible error: invalid scalar style");
    }
  }();
}
d(Mh, "writeScalar");
function Ba(e, t) {
  var r = _s(e) ? String(t) : "", i = e[e.length - 1] === `
`, n = i && (e[e.length - 2] === `
` || e === `
`), a = n ? "+" : i ? "" : "-";
  return r + a + `
`;
}
d(Ba, "blockHeader");
function La(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
d(La, "dropEndingNewline");
function Ah(e, t) {
  for (var r = /(\n+)([^\n]*)/g, i = function() {
    var l = e.indexOf(`
`);
    return l = l !== -1 ? l : e.length, r.lastIndex = l, Ma(e.slice(0, l), t);
  }(), n = e[0] === `
` || e[0] === " ", a, o; o = r.exec(e); ) {
    var s = o[1], c = o[2];
    a = c[0] === " ", i += s + (!n && !a && c !== "" ? `
` : "") + Ma(c, t), n = a;
  }
  return i;
}
d(Ah, "foldString");
function Ma(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, i, n = 0, a, o = 0, s = 0, c = ""; i = r.exec(e); )
    s = i.index, s - n > t && (a = o > n ? o : s, c += `
` + e.slice(n, a), n = a + 1), o = s;
  return c += `
`, e.length - n > t && o > n ? c += e.slice(n, o) + `
` + e.slice(o + 1) : c += e.slice(n), c.slice(1);
}
d(Ma, "foldLine");
function $h(e) {
  for (var t = "", r = 0, i, n = 0; n < e.length; r >= 65536 ? n += 2 : n++)
    r = tr(e, n), i = vt[r], !i && xr(r) ? (t += e[n], r >= 65536 && (t += e[n + 1])) : t += i || Ch(r);
  return t;
}
d($h, "escapeString");
function Fh(e, t, r) {
  var i = "", n = e.tag, a, o, s;
  for (a = 0, o = r.length; a < o; a += 1)
    s = r[a], e.replacer && (s = e.replacer.call(r, String(a), s)), (Qt(e, t, s, !1, !1) || typeof s > "u" && Qt(e, t, null, !1, !1)) && (i !== "" && (i += "," + (e.condenseFlow ? "" : " ")), i += e.dump);
  e.tag = n, e.dump = "[" + i + "]";
}
d(Fh, "writeFlowSequence");
function Aa(e, t, r, i) {
  var n = "", a = e.tag, o, s, c;
  for (o = 0, s = r.length; o < s; o += 1)
    c = r[o], e.replacer && (c = e.replacer.call(r, String(o), c)), (Qt(e, t + 1, c, !0, !0, !1, !0) || typeof c > "u" && Qt(e, t + 1, null, !0, !0, !1, !0)) && ((!i || n !== "") && (n += Zi(e, t)), e.dump && Kr === e.dump.charCodeAt(0) ? n += "-" : n += "- ", n += e.dump);
  e.tag = a, e.dump = n || "[]";
}
d(Aa, "writeBlockSequence");
function Eh(e, t, r) {
  var i = "", n = e.tag, a = Object.keys(r), o, s, c, l, h;
  for (o = 0, s = a.length; o < s; o += 1)
    h = "", i !== "" && (h += ", "), e.condenseFlow && (h += '"'), c = a[o], l = r[c], e.replacer && (l = e.replacer.call(r, c, l)), Qt(e, t, c, !1, !1) && (e.dump.length > 1024 && (h += "? "), h += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), Qt(e, t, l, !1, !1) && (h += e.dump, i += h));
  e.tag = n, e.dump = "{" + i + "}";
}
d(Eh, "writeFlowMapping");
function Oh(e, t, r, i) {
  var n = "", a = e.tag, o = Object.keys(r), s, c, l, h, u, f;
  if (e.sortKeys === !0)
    o.sort();
  else if (typeof e.sortKeys == "function")
    o.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new $t("sortKeys must be a boolean or a function");
  for (s = 0, c = o.length; s < c; s += 1)
    f = "", (!i || n !== "") && (f += Zi(e, t)), l = o[s], h = r[l], e.replacer && (h = e.replacer.call(r, l, h)), Qt(e, t + 1, l, !0, !0, !0) && (u = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, u && (e.dump && Kr === e.dump.charCodeAt(0) ? f += "?" : f += "? "), f += e.dump, u && (f += Zi(e, t)), Qt(e, t + 1, h, !0, u) && (e.dump && Kr === e.dump.charCodeAt(0) ? f += ":" : f += ": ", f += e.dump, n += f));
  e.tag = a, e.dump = n || "{}";
}
d(Oh, "writeBlockMapping");
function $a(e, t, r) {
  var i, n, a, o, s, c;
  for (n = r ? e.explicitTypes : e.implicitTypes, a = 0, o = n.length; a < o; a += 1)
    if (s = n[a], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (r ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        if (c = e.styleMap[s.tag] || s.defaultStyle, fh.call(s.represent) === "[object Function]")
          i = s.represent(t, c);
        else if (ph.call(s.represent, c))
          i = s.represent[c](t, c);
        else
          throw new $t("!<" + s.tag + '> tag resolver accepts not "' + c + '" style');
        e.dump = i;
      }
      return !0;
    }
  return !1;
}
d($a, "detectType");
function Qt(e, t, r, i, n, a, o) {
  e.tag = null, e.dump = r, $a(e, r, !1) || $a(e, r, !0);
  var s = fh.call(e.dump), c = i, l;
  i && (i = e.flowLevel < 0 || e.flowLevel > t);
  var h = s === "[object Object]" || s === "[object Array]", u, f;
  if (h && (u = e.duplicates.indexOf(r), f = u !== -1), (e.tag !== null && e.tag !== "?" || f || e.indent !== 2 && t > 0) && (n = !1), f && e.usedDuplicates[u])
    e.dump = "*ref_" + u;
  else {
    if (h && f && !e.usedDuplicates[u] && (e.usedDuplicates[u] = !0), s === "[object Object]")
      i && Object.keys(e.dump).length !== 0 ? (Oh(e, t, e.dump, n), f && (e.dump = "&ref_" + u + e.dump)) : (Eh(e, t, e.dump), f && (e.dump = "&ref_" + u + " " + e.dump));
    else if (s === "[object Array]")
      i && e.dump.length !== 0 ? (e.noArrayIndent && !o && t > 0 ? Aa(e, t - 1, e.dump, n) : Aa(e, t, e.dump, n), f && (e.dump = "&ref_" + u + e.dump)) : (Fh(e, t, e.dump), f && (e.dump = "&ref_" + u + " " + e.dump));
    else if (s === "[object String]")
      e.tag !== "?" && Mh(e, e.dump, t, a, c);
    else {
      if (s === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new $t("unacceptable kind of an object to dump " + s);
    }
    e.tag !== null && e.tag !== "?" && (l = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? l = "!" + l : l.slice(0, 18) === "tag:yaml.org,2002:" ? l = "!!" + l.slice(18) : l = "!<" + l + ">", e.dump = l + " " + e.dump);
  }
  return !0;
}
d(Qt, "writeNode");
function Dh(e, t) {
  var r = [], i = [], n, a;
  for (Ki(e, r, i), n = 0, a = i.length; n < a; n += 1)
    t.duplicates.push(r[i[n]]);
  t.usedDuplicates = new Array(a);
}
d(Dh, "getDuplicateReferences");
function Ki(e, t, r) {
  var i, n, a;
  if (e !== null && typeof e == "object")
    if (n = t.indexOf(e), n !== -1)
      r.indexOf(n) === -1 && r.push(n);
    else if (t.push(e), Array.isArray(e))
      for (n = 0, a = e.length; n < a; n += 1)
        Ki(e[n], t, r);
    else
      for (i = Object.keys(e), n = 0, a = i.length; n < a; n += 1)
        Ki(e[i[n]], t, r);
}
d(Ki, "inspectNode");
function rm(e, t) {
  t = t || {};
  var r = new _h(t);
  r.noRefs || Dh(e, r);
  var i = e;
  return r.replacer && (i = r.replacer.call({ "": i }, "", i)), Qt(r, 0, i, !0, !0) ? r.dump + `
` : "";
}
d(rm, "dump$1");
function im(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
d(im, "renamed");
var nm = Tc, am = R0.load;
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
var zt = {
  aggregation: 18,
  extension: 18,
  composition: 18,
  dependency: 6,
  lollipop: 13.5,
  arrow_point: 4
};
function Pr(e, t) {
  if (e === void 0 || t === void 0)
    return { angle: 0, deltaX: 0, deltaY: 0 };
  e = ut(e), t = ut(t);
  const [r, i] = [e.x, e.y], [n, a] = [t.x, t.y], o = n - r, s = a - i;
  return { angle: Math.atan(s / o), deltaX: o, deltaY: s };
}
d(Pr, "calculateDeltaAndAngle");
var ut = /* @__PURE__ */ d((e) => Array.isArray(e) ? { x: e[0], y: e[1] } : e, "pointTransformer"), sm = /* @__PURE__ */ d((e) => ({
  x: /* @__PURE__ */ d(function(t, r, i) {
    let n = 0;
    const a = ut(i[0]).x < ut(i[i.length - 1]).x ? "left" : "right";
    if (r === 0 && Object.hasOwn(zt, e.arrowTypeStart)) {
      const { angle: p, deltaX: g } = Pr(i[0], i[1]);
      n = zt[e.arrowTypeStart] * Math.cos(p) * (g >= 0 ? 1 : -1);
    } else if (r === i.length - 1 && Object.hasOwn(zt, e.arrowTypeEnd)) {
      const { angle: p, deltaX: g } = Pr(
        i[i.length - 1],
        i[i.length - 2]
      );
      n = zt[e.arrowTypeEnd] * Math.cos(p) * (g >= 0 ? 1 : -1);
    }
    const o = Math.abs(
      ut(t).x - ut(i[i.length - 1]).x
    ), s = Math.abs(
      ut(t).y - ut(i[i.length - 1]).y
    ), c = Math.abs(ut(t).x - ut(i[0]).x), l = Math.abs(ut(t).y - ut(i[0]).y), h = zt[e.arrowTypeStart], u = zt[e.arrowTypeEnd], f = 1;
    if (o < u && o > 0 && s < u) {
      let p = u + f - o;
      p *= a === "right" ? -1 : 1, n -= p;
    }
    if (c < h && c > 0 && l < h) {
      let p = h + f - c;
      p *= a === "right" ? -1 : 1, n += p;
    }
    return ut(t).x + n;
  }, "x"),
  y: /* @__PURE__ */ d(function(t, r, i) {
    let n = 0;
    const a = ut(i[0]).y < ut(i[i.length - 1]).y ? "down" : "up";
    if (r === 0 && Object.hasOwn(zt, e.arrowTypeStart)) {
      const { angle: p, deltaY: g } = Pr(i[0], i[1]);
      n = zt[e.arrowTypeStart] * Math.abs(Math.sin(p)) * (g >= 0 ? 1 : -1);
    } else if (r === i.length - 1 && Object.hasOwn(zt, e.arrowTypeEnd)) {
      const { angle: p, deltaY: g } = Pr(
        i[i.length - 1],
        i[i.length - 2]
      );
      n = zt[e.arrowTypeEnd] * Math.abs(Math.sin(p)) * (g >= 0 ? 1 : -1);
    }
    const o = Math.abs(
      ut(t).y - ut(i[i.length - 1]).y
    ), s = Math.abs(
      ut(t).x - ut(i[i.length - 1]).x
    ), c = Math.abs(ut(t).y - ut(i[0]).y), l = Math.abs(ut(t).x - ut(i[0]).x), h = zt[e.arrowTypeStart], u = zt[e.arrowTypeEnd], f = 1;
    if (o < u && o > 0 && s < u) {
      let p = u + f - o;
      p *= a === "up" ? -1 : 1, n -= p;
    }
    if (c < h && c > 0 && l < h) {
      let p = h + f - c;
      p *= a === "up" ? -1 : 1, n += p;
    }
    return ut(t).y + n;
  }, "y")
}), "getLineFunctionsWithOffset"), ws = /* @__PURE__ */ d(({
  flowchart: e
}) => {
  var n, a;
  const t = ((n = e == null ? void 0 : e.subGraphTitleMargin) == null ? void 0 : n.top) ?? 0, r = ((a = e == null ? void 0 : e.subGraphTitleMargin) == null ? void 0 : a.bottom) ?? 0, i = t + r;
  return {
    subGraphTitleTopMargin: t,
    subGraphTitleBottomMargin: r,
    subGraphTitleTotalMargin: i
  };
}, "getSubGraphTitleMargins");
const om = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
), Qi = Object.freeze({
  rotate: 0,
  vFlip: !1,
  hFlip: !1
}), Rh = Object.freeze({
  ...om,
  ...Qi
}), lm = Object.freeze({
  ...Rh,
  body: "",
  hidden: !1
}), cm = Object.freeze({
  width: null,
  height: null
}), hm = Object.freeze({
  // Dimensions
  ...cm,
  // Transformations
  ...Qi
}), um = (e, t, r, i = "") => {
  const n = e.split(":");
  if (e.slice(0, 1) === "@") {
    if (n.length < 2 || n.length > 3)
      return null;
    i = n.shift().slice(1);
  }
  if (n.length > 3 || !n.length)
    return null;
  if (n.length > 1) {
    const s = n.pop(), c = n.pop(), l = {
      // Allow provider without '@': "provider:prefix:name"
      provider: n.length > 0 ? n[0] : i,
      prefix: c,
      name: s
    };
    return Qn(l) ? l : null;
  }
  const a = n[0], o = a.split("-");
  if (o.length > 1) {
    const s = {
      provider: i,
      prefix: o.shift(),
      name: o.join("-")
    };
    return Qn(s) ? s : null;
  }
  if (r && i === "") {
    const s = {
      provider: i,
      prefix: "",
      name: a
    };
    return Qn(s, r) ? s : null;
  }
  return null;
}, Qn = (e, t) => e ? !!// Check prefix: cannot be empty, unless allowSimpleName is enabled
// Check name: cannot be empty
((t && e.prefix === "" || e.prefix) && e.name) : !1;
function fm(e, t) {
  const r = {};
  !e.hFlip != !t.hFlip && (r.hFlip = !0), !e.vFlip != !t.vFlip && (r.vFlip = !0);
  const i = ((e.rotate || 0) + (t.rotate || 0)) % 4;
  return i && (r.rotate = i), r;
}
function xo(e, t) {
  const r = fm(e, t);
  for (const i in lm)
    i in Qi ? i in e && !(i in r) && (r[i] = Qi[i]) : i in t ? r[i] = t[i] : i in e && (r[i] = e[i]);
  return r;
}
function pm(e, t) {
  const r = e.icons, i = e.aliases || /* @__PURE__ */ Object.create(null), n = /* @__PURE__ */ Object.create(null);
  function a(o) {
    if (r[o])
      return n[o] = [];
    if (!(o in n)) {
      n[o] = null;
      const s = i[o] && i[o].parent, c = s && a(s);
      c && (n[o] = [s].concat(c));
    }
    return n[o];
  }
  return (t || Object.keys(r).concat(Object.keys(i))).forEach(a), n;
}
function bo(e, t, r) {
  const i = e.icons, n = e.aliases || /* @__PURE__ */ Object.create(null);
  let a = {};
  function o(s) {
    a = xo(
      i[s] || n[s],
      a
    );
  }
  return o(t), r.forEach(o), xo(e, a);
}
function dm(e, t) {
  if (e.icons[t])
    return bo(e, t, []);
  const r = pm(e, [t])[t];
  return r ? bo(e, t, r) : null;
}
const gm = /(-?[0-9.]*[0-9]+[0-9.]*)/g, mm = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function Co(e, t, r) {
  if (t === 1)
    return e;
  if (r = r || 100, typeof e == "number")
    return Math.ceil(e * t * r) / r;
  if (typeof e != "string")
    return e;
  const i = e.split(gm);
  if (i === null || !i.length)
    return e;
  const n = [];
  let a = i.shift(), o = mm.test(a);
  for (; ; ) {
    if (o) {
      const s = parseFloat(a);
      isNaN(s) ? n.push(a) : n.push(Math.ceil(s * t * r) / r);
    } else
      n.push(a);
    if (a = i.shift(), a === void 0)
      return n.join("");
    o = !o;
  }
}
function ym(e, t = "defs") {
  let r = "";
  const i = e.indexOf("<" + t);
  for (; i >= 0; ) {
    const n = e.indexOf(">", i), a = e.indexOf("</" + t);
    if (n === -1 || a === -1)
      break;
    const o = e.indexOf(">", a);
    if (o === -1)
      break;
    r += e.slice(n + 1, a).trim(), e = e.slice(0, i).trim() + e.slice(o + 1);
  }
  return {
    defs: r,
    content: e
  };
}
function xm(e, t) {
  return e ? "<defs>" + e + "</defs>" + t : t;
}
function bm(e, t, r) {
  const i = ym(e);
  return xm(i.defs, t + i.content + r);
}
const Cm = (e) => e === "unset" || e === "undefined" || e === "none";
function _m(e, t) {
  const r = {
    ...Rh,
    ...e
  }, i = {
    ...hm,
    ...t
  }, n = {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height
  };
  let a = r.body;
  [r, i].forEach((m) => {
    const y = [], x = m.hFlip, b = m.vFlip;
    let _ = m.rotate;
    x ? b ? _ += 2 : (y.push(
      "translate(" + (n.width + n.left).toString() + " " + (0 - n.top).toString() + ")"
    ), y.push("scale(-1 1)"), n.top = n.left = 0) : b && (y.push(
      "translate(" + (0 - n.left).toString() + " " + (n.height + n.top).toString() + ")"
    ), y.push("scale(1 -1)"), n.top = n.left = 0);
    let S;
    switch (_ < 0 && (_ -= Math.floor(_ / 4) * 4), _ = _ % 4, _) {
      case 1:
        S = n.height / 2 + n.top, y.unshift(
          "rotate(90 " + S.toString() + " " + S.toString() + ")"
        );
        break;
      case 2:
        y.unshift(
          "rotate(180 " + (n.width / 2 + n.left).toString() + " " + (n.height / 2 + n.top).toString() + ")"
        );
        break;
      case 3:
        S = n.width / 2 + n.left, y.unshift(
          "rotate(-90 " + S.toString() + " " + S.toString() + ")"
        );
        break;
    }
    _ % 2 === 1 && (n.left !== n.top && (S = n.left, n.left = n.top, n.top = S), n.width !== n.height && (S = n.width, n.width = n.height, n.height = S)), y.length && (a = bm(
      a,
      '<g transform="' + y.join(" ") + '">',
      "</g>"
    ));
  });
  const o = i.width, s = i.height, c = n.width, l = n.height;
  let h, u;
  o === null ? (u = s === null ? "1em" : s === "auto" ? l : s, h = Co(u, c / l)) : (h = o === "auto" ? c : o, u = s === null ? Co(h, l / c) : s === "auto" ? l : s);
  const f = {}, p = (m, y) => {
    Cm(y) || (f[m] = y.toString());
  };
  p("width", h), p("height", u);
  const g = [n.left, n.top, c, l];
  return f.viewBox = g.join(" "), {
    attributes: f,
    viewBox: g,
    body: a
  };
}
const wm = /\sid="(\S+)"/g, km = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
let vm = 0;
function Sm(e, t = km) {
  const r = [];
  let i;
  for (; i = wm.exec(e); )
    r.push(i[1]);
  if (!r.length)
    return e;
  const n = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
  return r.forEach((a) => {
    const o = typeof t == "function" ? t(a) : t + (vm++).toString(), s = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    e = e.replace(
      // Allowed characters before id: [#;"]
      // Allowed characters after id: [)"], .[a-z]
      new RegExp('([#;"])(' + s + ')([")]|\\.[a-z])', "g"),
      "$1" + o + n + "$3"
    );
  }), e = e.replace(new RegExp(n, "g"), ""), e;
}
function Tm(e, t) {
  let r = e.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const i in t)
    r += " " + i + '="' + t[i] + '"';
  return '<svg xmlns="http://www.w3.org/2000/svg"' + r + ">" + e + "</svg>";
}
var Bm = {
  body: '<g><rect width="80" height="80" style="fill: #087ebf; stroke-width: 0px;"/><text transform="translate(21.16 64.67)" style="fill: #fff; font-family: ArialMT, Arial; font-size: 67.75px;"><tspan x="0" y="0">?</tspan></text></g>',
  height: 80,
  width: 80
}, Fa = /* @__PURE__ */ new Map(), Ih = /* @__PURE__ */ new Map(), Lm = /* @__PURE__ */ d((e) => {
  for (const t of e) {
    if (!t.name)
      throw new Error(
        'Invalid icon loader. Must have a "name" property with non-empty string value.'
      );
    if (E.debug("Registering icon pack:", t.name), "loader" in t)
      Ih.set(t.name, t.loader);
    else if ("icons" in t)
      Fa.set(t.name, t.icons);
    else
      throw E.error("Invalid icon loader:", t), new Error('Invalid icon loader. Must have either "icons" or "loader" property.');
  }
}, "registerIconPacks"), Mm = /* @__PURE__ */ d(async (e, t) => {
  const r = um(e, !0, t !== void 0);
  if (!r)
    throw new Error(`Invalid icon name: ${e}`);
  const i = r.prefix || t;
  if (!i)
    throw new Error(`Icon name must contain a prefix: ${e}`);
  let n = Fa.get(i);
  if (!n) {
    const o = Ih.get(i);
    if (!o)
      throw new Error(`Icon set not found: ${r.prefix}`);
    try {
      n = { ...await o(), prefix: i }, Fa.set(i, n);
    } catch (s) {
      throw E.error(s), new Error(`Failed to load icon set: ${r.prefix}`);
    }
  }
  const a = dm(n, r.name);
  if (!a)
    throw new Error(`Icon not found: ${e}`);
  return a;
}, "getRegisteredIconData"), An = /* @__PURE__ */ d(async (e, t) => {
  let r;
  try {
    r = await Mm(e, t == null ? void 0 : t.fallbackPrefix);
  } catch (a) {
    E.error(a), r = Bm;
  }
  const i = _m(r, t);
  return Tm(Sm(i.body), i.attributes);
}, "getIconSVG"), ks = {}, yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.BLANK_URL = yt.relativeFirstCharacters = yt.whitespaceEscapeCharsRegex = yt.urlSchemeRegex = yt.ctrlCharactersRegex = yt.htmlCtrlEntityRegex = yt.htmlEntitiesRegex = yt.invalidProtocolRegex = void 0;
yt.invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
yt.htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
yt.htmlCtrlEntityRegex = /&(newline|tab);/gi;
yt.ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
yt.urlSchemeRegex = /^.+(:|&colon;)/gim;
yt.whitespaceEscapeCharsRegex = /(\\|%5[cC])((%(6[eE]|72|74))|[nrt])/g;
yt.relativeFirstCharacters = [".", "/"];
yt.BLANK_URL = "about:blank";
Object.defineProperty(ks, "__esModule", { value: !0 });
var Ph = ks.sanitizeUrl = void 0, wt = yt;
function Am(e) {
  return wt.relativeFirstCharacters.indexOf(e[0]) > -1;
}
function $m(e) {
  var t = e.replace(wt.ctrlCharactersRegex, "");
  return t.replace(wt.htmlEntitiesRegex, function(r, i) {
    return String.fromCharCode(i);
  });
}
function Fm(e) {
  return URL.canParse(e);
}
function _o(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function Em(e) {
  if (!e)
    return wt.BLANK_URL;
  var t, r = _o(e.trim());
  do
    r = $m(r).replace(wt.htmlCtrlEntityRegex, "").replace(wt.ctrlCharactersRegex, "").replace(wt.whitespaceEscapeCharsRegex, "").trim(), r = _o(r), t = r.match(wt.ctrlCharactersRegex) || r.match(wt.htmlEntitiesRegex) || r.match(wt.htmlCtrlEntityRegex) || r.match(wt.whitespaceEscapeCharsRegex);
  while (t && t.length > 0);
  var i = r;
  if (!i)
    return wt.BLANK_URL;
  if (Am(i))
    return i;
  var n = i.trimStart(), a = n.match(wt.urlSchemeRegex);
  if (!a)
    return i;
  var o = a[0].toLowerCase().trim();
  if (wt.invalidProtocolRegex.test(o))
    return wt.BLANK_URL;
  var s = n.replace(/\\/g, "/");
  if (o === "mailto:" || o.includes("://"))
    return s;
  if (o === "http:" || o === "https:") {
    if (!Fm(s))
      return wt.BLANK_URL;
    var c = new URL(s);
    return c.protocol = c.protocol.toLowerCase(), c.hostname = c.hostname.toLowerCase(), c.toString();
  }
  return s;
}
Ph = ks.sanitizeUrl = Em;
var Om = { value: () => {
} };
function Nh() {
  for (var e = 0, t = arguments.length, r = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in r || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    r[i] = [];
  }
  return new Fi(r);
}
function Fi(e) {
  this._ = e;
}
function Dm(e, t) {
  return e.trim().split(/^|\s+/).map(function(r) {
    var i = "", n = r.indexOf(".");
    if (n >= 0 && (i = r.slice(n + 1), r = r.slice(0, n)), r && !t.hasOwnProperty(r)) throw new Error("unknown type: " + r);
    return { type: r, name: i };
  });
}
Fi.prototype = Nh.prototype = {
  constructor: Fi,
  on: function(e, t) {
    var r = this._, i = Dm(e + "", r), n, a = -1, o = i.length;
    if (arguments.length < 2) {
      for (; ++a < o; ) if ((n = (e = i[a]).type) && (n = Rm(r[n], e.name))) return n;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++a < o; )
      if (n = (e = i[a]).type) r[n] = wo(r[n], e.name, t);
      else if (t == null) for (n in r) r[n] = wo(r[n], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var r in t) e[r] = t[r].slice();
    return new Fi(e);
  },
  call: function(e, t) {
    if ((n = arguments.length - 2) > 0) for (var r = new Array(n), i = 0, n, a; i < n; ++i) r[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (a = this._[e], i = 0, n = a.length; i < n; ++i) a[i].value.apply(t, r);
  },
  apply: function(e, t, r) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], n = 0, a = i.length; n < a; ++n) i[n].value.apply(t, r);
  }
};
function Rm(e, t) {
  for (var r = 0, i = e.length, n; r < i; ++r)
    if ((n = e[r]).name === t)
      return n.value;
}
function wo(e, t, r) {
  for (var i = 0, n = e.length; i < n; ++i)
    if (e[i].name === t) {
      e[i] = Om, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return r != null && e.push({ name: t, value: r }), e;
}
var Ea = "http://www.w3.org/1999/xhtml";
const ko = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ea,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function $n(e) {
  var t = e += "", r = t.indexOf(":");
  return r >= 0 && (t = e.slice(0, r)) !== "xmlns" && (e = e.slice(r + 1)), ko.hasOwnProperty(t) ? { space: ko[t], local: e } : e;
}
function Im(e) {
  return function() {
    var t = this.ownerDocument, r = this.namespaceURI;
    return r === Ea && t.documentElement.namespaceURI === Ea ? t.createElement(e) : t.createElementNS(r, e);
  };
}
function Pm(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function zh(e) {
  var t = $n(e);
  return (t.local ? Pm : Im)(t);
}
function Nm() {
}
function vs(e) {
  return e == null ? Nm : function() {
    return this.querySelector(e);
  };
}
function zm(e) {
  typeof e != "function" && (e = vs(e));
  for (var t = this._groups, r = t.length, i = new Array(r), n = 0; n < r; ++n)
    for (var a = t[n], o = a.length, s = i[n] = new Array(o), c, l, h = 0; h < o; ++h)
      (c = a[h]) && (l = e.call(c, c.__data__, h, a)) && ("__data__" in c && (l.__data__ = c.__data__), s[h] = l);
  return new It(i, this._parents);
}
function qm(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Wm() {
  return [];
}
function qh(e) {
  return e == null ? Wm : function() {
    return this.querySelectorAll(e);
  };
}
function Hm(e) {
  return function() {
    return qm(e.apply(this, arguments));
  };
}
function jm(e) {
  typeof e == "function" ? e = Hm(e) : e = qh(e);
  for (var t = this._groups, r = t.length, i = [], n = [], a = 0; a < r; ++a)
    for (var o = t[a], s = o.length, c, l = 0; l < s; ++l)
      (c = o[l]) && (i.push(e.call(c, c.__data__, l, o)), n.push(c));
  return new It(i, n);
}
function Wh(e) {
  return function() {
    return this.matches(e);
  };
}
function Hh(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Ym = Array.prototype.find;
function Gm(e) {
  return function() {
    return Ym.call(this.children, e);
  };
}
function Um() {
  return this.firstElementChild;
}
function Xm(e) {
  return this.select(e == null ? Um : Gm(typeof e == "function" ? e : Hh(e)));
}
var Vm = Array.prototype.filter;
function Zm() {
  return Array.from(this.children);
}
function Km(e) {
  return function() {
    return Vm.call(this.children, e);
  };
}
function Qm(e) {
  return this.selectAll(e == null ? Zm : Km(typeof e == "function" ? e : Hh(e)));
}
function Jm(e) {
  typeof e != "function" && (e = Wh(e));
  for (var t = this._groups, r = t.length, i = new Array(r), n = 0; n < r; ++n)
    for (var a = t[n], o = a.length, s = i[n] = [], c, l = 0; l < o; ++l)
      (c = a[l]) && e.call(c, c.__data__, l, a) && s.push(c);
  return new It(i, this._parents);
}
function jh(e) {
  return new Array(e.length);
}
function ty() {
  return new It(this._enter || this._groups.map(jh), this._parents);
}
function Ji(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Ji.prototype = {
  constructor: Ji,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function ey(e) {
  return function() {
    return e;
  };
}
function ry(e, t, r, i, n, a) {
  for (var o = 0, s, c = t.length, l = a.length; o < l; ++o)
    (s = t[o]) ? (s.__data__ = a[o], i[o] = s) : r[o] = new Ji(e, a[o]);
  for (; o < c; ++o)
    (s = t[o]) && (n[o] = s);
}
function iy(e, t, r, i, n, a, o) {
  var s, c, l = /* @__PURE__ */ new Map(), h = t.length, u = a.length, f = new Array(h), p;
  for (s = 0; s < h; ++s)
    (c = t[s]) && (f[s] = p = o.call(c, c.__data__, s, t) + "", l.has(p) ? n[s] = c : l.set(p, c));
  for (s = 0; s < u; ++s)
    p = o.call(e, a[s], s, a) + "", (c = l.get(p)) ? (i[s] = c, c.__data__ = a[s], l.delete(p)) : r[s] = new Ji(e, a[s]);
  for (s = 0; s < h; ++s)
    (c = t[s]) && l.get(f[s]) === c && (n[s] = c);
}
function ny(e) {
  return e.__data__;
}
function ay(e, t) {
  if (!arguments.length) return Array.from(this, ny);
  var r = t ? iy : ry, i = this._parents, n = this._groups;
  typeof e != "function" && (e = ey(e));
  for (var a = n.length, o = new Array(a), s = new Array(a), c = new Array(a), l = 0; l < a; ++l) {
    var h = i[l], u = n[l], f = u.length, p = sy(e.call(h, h && h.__data__, l, i)), g = p.length, m = s[l] = new Array(g), y = o[l] = new Array(g), x = c[l] = new Array(f);
    r(h, u, m, y, x, p, t);
    for (var b = 0, _ = 0, S, k; b < g; ++b)
      if (S = m[b]) {
        for (b >= _ && (_ = b + 1); !(k = y[_]) && ++_ < g; ) ;
        S._next = k || null;
      }
  }
  return o = new It(o, i), o._enter = s, o._exit = c, o;
}
function sy(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function oy() {
  return new It(this._exit || this._groups.map(jh), this._parents);
}
function ly(e, t, r) {
  var i = this.enter(), n = this, a = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (n = t(n), n && (n = n.selection())), r == null ? a.remove() : r(a), i && n ? i.merge(n).order() : n;
}
function cy(e) {
  for (var t = e.selection ? e.selection() : e, r = this._groups, i = t._groups, n = r.length, a = i.length, o = Math.min(n, a), s = new Array(n), c = 0; c < o; ++c)
    for (var l = r[c], h = i[c], u = l.length, f = s[c] = new Array(u), p, g = 0; g < u; ++g)
      (p = l[g] || h[g]) && (f[g] = p);
  for (; c < n; ++c)
    s[c] = r[c];
  return new It(s, this._parents);
}
function hy() {
  for (var e = this._groups, t = -1, r = e.length; ++t < r; )
    for (var i = e[t], n = i.length - 1, a = i[n], o; --n >= 0; )
      (o = i[n]) && (a && o.compareDocumentPosition(a) ^ 4 && a.parentNode.insertBefore(o, a), a = o);
  return this;
}
function uy(e) {
  e || (e = fy);
  function t(u, f) {
    return u && f ? e(u.__data__, f.__data__) : !u - !f;
  }
  for (var r = this._groups, i = r.length, n = new Array(i), a = 0; a < i; ++a) {
    for (var o = r[a], s = o.length, c = n[a] = new Array(s), l, h = 0; h < s; ++h)
      (l = o[h]) && (c[h] = l);
    c.sort(t);
  }
  return new It(n, this._parents).order();
}
function fy(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function py() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function dy() {
  return Array.from(this);
}
function gy() {
  for (var e = this._groups, t = 0, r = e.length; t < r; ++t)
    for (var i = e[t], n = 0, a = i.length; n < a; ++n) {
      var o = i[n];
      if (o) return o;
    }
  return null;
}
function my() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function yy() {
  return !this.node();
}
function xy(e) {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var n = t[r], a = 0, o = n.length, s; a < o; ++a)
      (s = n[a]) && e.call(s, s.__data__, a, n);
  return this;
}
function by(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Cy(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function _y(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function wy(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function ky(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.removeAttribute(e) : this.setAttribute(e, r);
  };
}
function vy(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, r);
  };
}
function Sy(e, t) {
  var r = $n(e);
  if (arguments.length < 2) {
    var i = this.node();
    return r.local ? i.getAttributeNS(r.space, r.local) : i.getAttribute(r);
  }
  return this.each((t == null ? r.local ? Cy : by : typeof t == "function" ? r.local ? vy : ky : r.local ? wy : _y)(r, t));
}
function Yh(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Ty(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function By(e, t, r) {
  return function() {
    this.style.setProperty(e, t, r);
  };
}
function Ly(e, t, r) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, r);
  };
}
function My(e, t, r) {
  return arguments.length > 1 ? this.each((t == null ? Ty : typeof t == "function" ? Ly : By)(e, t, r ?? "")) : br(this.node(), e);
}
function br(e, t) {
  return e.style.getPropertyValue(t) || Yh(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Ay(e) {
  return function() {
    delete this[e];
  };
}
function $y(e, t) {
  return function() {
    this[e] = t;
  };
}
function Fy(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? delete this[e] : this[e] = r;
  };
}
function Ey(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Ay : typeof t == "function" ? Fy : $y)(e, t)) : this.node()[e];
}
function Gh(e) {
  return e.trim().split(/^|\s+/);
}
function Ss(e) {
  return e.classList || new Uh(e);
}
function Uh(e) {
  this._node = e, this._names = Gh(e.getAttribute("class") || "");
}
Uh.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function Xh(e, t) {
  for (var r = Ss(e), i = -1, n = t.length; ++i < n; ) r.add(t[i]);
}
function Vh(e, t) {
  for (var r = Ss(e), i = -1, n = t.length; ++i < n; ) r.remove(t[i]);
}
function Oy(e) {
  return function() {
    Xh(this, e);
  };
}
function Dy(e) {
  return function() {
    Vh(this, e);
  };
}
function Ry(e, t) {
  return function() {
    (t.apply(this, arguments) ? Xh : Vh)(this, e);
  };
}
function Iy(e, t) {
  var r = Gh(e + "");
  if (arguments.length < 2) {
    for (var i = Ss(this.node()), n = -1, a = r.length; ++n < a; ) if (!i.contains(r[n])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Ry : t ? Oy : Dy)(r, t));
}
function Py() {
  this.textContent = "";
}
function Ny(e) {
  return function() {
    this.textContent = e;
  };
}
function zy(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function qy(e) {
  return arguments.length ? this.each(e == null ? Py : (typeof e == "function" ? zy : Ny)(e)) : this.node().textContent;
}
function Wy() {
  this.innerHTML = "";
}
function Hy(e) {
  return function() {
    this.innerHTML = e;
  };
}
function jy(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Yy(e) {
  return arguments.length ? this.each(e == null ? Wy : (typeof e == "function" ? jy : Hy)(e)) : this.node().innerHTML;
}
function Gy() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Uy() {
  return this.each(Gy);
}
function Xy() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Vy() {
  return this.each(Xy);
}
function Zy(e) {
  var t = typeof e == "function" ? e : zh(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Ky() {
  return null;
}
function Qy(e, t) {
  var r = typeof e == "function" ? e : zh(e), i = t == null ? Ky : typeof t == "function" ? t : vs(t);
  return this.select(function() {
    return this.insertBefore(r.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function Jy() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function tx() {
  return this.each(Jy);
}
function ex() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function rx() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function ix(e) {
  return this.select(e ? rx : ex);
}
function nx(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function ax(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function sx(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var r = "", i = t.indexOf(".");
    return i >= 0 && (r = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: r };
  });
}
function ox(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var r = 0, i = -1, n = t.length, a; r < n; ++r)
        a = t[r], (!e.type || a.type === e.type) && a.name === e.name ? this.removeEventListener(a.type, a.listener, a.options) : t[++i] = a;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function lx(e, t, r) {
  return function() {
    var i = this.__on, n, a = ax(t);
    if (i) {
      for (var o = 0, s = i.length; o < s; ++o)
        if ((n = i[o]).type === e.type && n.name === e.name) {
          this.removeEventListener(n.type, n.listener, n.options), this.addEventListener(n.type, n.listener = a, n.options = r), n.value = t;
          return;
        }
    }
    this.addEventListener(e.type, a, r), n = { type: e.type, name: e.name, value: t, listener: a, options: r }, i ? i.push(n) : this.__on = [n];
  };
}
function cx(e, t, r) {
  var i = sx(e + ""), n, a = i.length, o;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var c = 0, l = s.length, h; c < l; ++c)
        for (n = 0, h = s[c]; n < a; ++n)
          if ((o = i[n]).type === h.type && o.name === h.name)
            return h.value;
    }
    return;
  }
  for (s = t ? lx : ox, n = 0; n < a; ++n) this.each(s(i[n], t, r));
  return this;
}
function Zh(e, t, r) {
  var i = Yh(e), n = i.CustomEvent;
  typeof n == "function" ? n = new n(t, r) : (n = i.document.createEvent("Event"), r ? (n.initEvent(t, r.bubbles, r.cancelable), n.detail = r.detail) : n.initEvent(t, !1, !1)), e.dispatchEvent(n);
}
function hx(e, t) {
  return function() {
    return Zh(this, e, t);
  };
}
function ux(e, t) {
  return function() {
    return Zh(this, e, t.apply(this, arguments));
  };
}
function fx(e, t) {
  return this.each((typeof t == "function" ? ux : hx)(e, t));
}
function* px() {
  for (var e = this._groups, t = 0, r = e.length; t < r; ++t)
    for (var i = e[t], n = 0, a = i.length, o; n < a; ++n)
      (o = i[n]) && (yield o);
}
var Kh = [null];
function It(e, t) {
  this._groups = e, this._parents = t;
}
function ui() {
  return new It([[document.documentElement]], Kh);
}
function dx() {
  return this;
}
It.prototype = ui.prototype = {
  constructor: It,
  select: zm,
  selectAll: jm,
  selectChild: Xm,
  selectChildren: Qm,
  filter: Jm,
  data: ay,
  enter: ty,
  exit: oy,
  join: ly,
  merge: cy,
  selection: dx,
  order: hy,
  sort: uy,
  call: py,
  nodes: dy,
  node: gy,
  size: my,
  empty: yy,
  each: xy,
  attr: Sy,
  style: My,
  property: Ey,
  classed: Iy,
  text: qy,
  html: Yy,
  raise: Uy,
  lower: Vy,
  append: Zy,
  insert: Qy,
  remove: tx,
  clone: ix,
  datum: nx,
  on: cx,
  dispatch: fx,
  [Symbol.iterator]: px
};
function et(e) {
  return typeof e == "string" ? new It([[document.querySelector(e)]], [document.documentElement]) : new It([[e]], Kh);
}
function Ts(e, t, r) {
  e.prototype = t.prototype = r, r.constructor = e;
}
function Qh(e, t) {
  var r = Object.create(e.prototype);
  for (var i in t) r[i] = t[i];
  return r;
}
function fi() {
}
var ti = 0.7, tn = 1 / ti, rr = "\\s*([+-]?\\d+)\\s*", ei = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Zt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", gx = /^#([0-9a-f]{3,8})$/, mx = new RegExp(`^rgb\\(${rr},${rr},${rr}\\)$`), yx = new RegExp(`^rgb\\(${Zt},${Zt},${Zt}\\)$`), xx = new RegExp(`^rgba\\(${rr},${rr},${rr},${ei}\\)$`), bx = new RegExp(`^rgba\\(${Zt},${Zt},${Zt},${ei}\\)$`), Cx = new RegExp(`^hsl\\(${ei},${Zt},${Zt}\\)$`), _x = new RegExp(`^hsla\\(${ei},${Zt},${Zt},${ei}\\)$`), vo = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
Ts(fi, ri, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: So,
  // Deprecated! Use color.formatHex.
  formatHex: So,
  formatHex8: wx,
  formatHsl: kx,
  formatRgb: To,
  toString: To
});
function So() {
  return this.rgb().formatHex();
}
function wx() {
  return this.rgb().formatHex8();
}
function kx() {
  return Jh(this).formatHsl();
}
function To() {
  return this.rgb().formatRgb();
}
function ri(e) {
  var t, r;
  return e = (e + "").trim().toLowerCase(), (t = gx.exec(e)) ? (r = t[1].length, t = parseInt(t[1], 16), r === 6 ? Bo(t) : r === 3 ? new Ft(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : r === 8 ? bi(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : r === 4 ? bi(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = mx.exec(e)) ? new Ft(t[1], t[2], t[3], 1) : (t = yx.exec(e)) ? new Ft(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = xx.exec(e)) ? bi(t[1], t[2], t[3], t[4]) : (t = bx.exec(e)) ? bi(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Cx.exec(e)) ? Ao(t[1], t[2] / 100, t[3] / 100, 1) : (t = _x.exec(e)) ? Ao(t[1], t[2] / 100, t[3] / 100, t[4]) : vo.hasOwnProperty(e) ? Bo(vo[e]) : e === "transparent" ? new Ft(NaN, NaN, NaN, 0) : null;
}
function Bo(e) {
  return new Ft(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function bi(e, t, r, i) {
  return i <= 0 && (e = t = r = NaN), new Ft(e, t, r, i);
}
function vx(e) {
  return e instanceof fi || (e = ri(e)), e ? (e = e.rgb(), new Ft(e.r, e.g, e.b, e.opacity)) : new Ft();
}
function Oa(e, t, r, i) {
  return arguments.length === 1 ? vx(e) : new Ft(e, t, r, i ?? 1);
}
function Ft(e, t, r, i) {
  this.r = +e, this.g = +t, this.b = +r, this.opacity = +i;
}
Ts(Ft, Oa, Qh(fi, {
  brighter(e) {
    return e = e == null ? tn : Math.pow(tn, e), new Ft(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ti : Math.pow(ti, e), new Ft(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Ft(Ie(this.r), Ie(this.g), Ie(this.b), en(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Lo,
  // Deprecated! Use color.formatHex.
  formatHex: Lo,
  formatHex8: Sx,
  formatRgb: Mo,
  toString: Mo
}));
function Lo() {
  return `#${De(this.r)}${De(this.g)}${De(this.b)}`;
}
function Sx() {
  return `#${De(this.r)}${De(this.g)}${De(this.b)}${De((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Mo() {
  const e = en(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${Ie(this.r)}, ${Ie(this.g)}, ${Ie(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function en(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Ie(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function De(e) {
  return e = Ie(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Ao(e, t, r, i) {
  return i <= 0 ? e = t = r = NaN : r <= 0 || r >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new Wt(e, t, r, i);
}
function Jh(e) {
  if (e instanceof Wt) return new Wt(e.h, e.s, e.l, e.opacity);
  if (e instanceof fi || (e = ri(e)), !e) return new Wt();
  if (e instanceof Wt) return e;
  e = e.rgb();
  var t = e.r / 255, r = e.g / 255, i = e.b / 255, n = Math.min(t, r, i), a = Math.max(t, r, i), o = NaN, s = a - n, c = (a + n) / 2;
  return s ? (t === a ? o = (r - i) / s + (r < i) * 6 : r === a ? o = (i - t) / s + 2 : o = (t - r) / s + 4, s /= c < 0.5 ? a + n : 2 - a - n, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new Wt(o, s, c, e.opacity);
}
function Tx(e, t, r, i) {
  return arguments.length === 1 ? Jh(e) : new Wt(e, t, r, i ?? 1);
}
function Wt(e, t, r, i) {
  this.h = +e, this.s = +t, this.l = +r, this.opacity = +i;
}
Ts(Wt, Tx, Qh(fi, {
  brighter(e) {
    return e = e == null ? tn : Math.pow(tn, e), new Wt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? ti : Math.pow(ti, e), new Wt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, r = this.l, i = r + (r < 0.5 ? r : 1 - r) * t, n = 2 * r - i;
    return new Ft(
      Jn(e >= 240 ? e - 240 : e + 120, n, i),
      Jn(e, n, i),
      Jn(e < 120 ? e + 240 : e - 120, n, i),
      this.opacity
    );
  },
  clamp() {
    return new Wt($o(this.h), Ci(this.s), Ci(this.l), en(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = en(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${$o(this.h)}, ${Ci(this.s) * 100}%, ${Ci(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function $o(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Ci(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function Jn(e, t, r) {
  return (e < 60 ? t + (r - t) * e / 60 : e < 180 ? r : e < 240 ? t + (r - t) * (240 - e) / 60 : t) * 255;
}
const Bs = (e) => () => e;
function tu(e, t) {
  return function(r) {
    return e + r * t;
  };
}
function Bx(e, t, r) {
  return e = Math.pow(e, r), t = Math.pow(t, r) - e, r = 1 / r, function(i) {
    return Math.pow(e + i * t, r);
  };
}
function bT(e, t) {
  var r = t - e;
  return r ? tu(e, r > 180 || r < -180 ? r - 360 * Math.round(r / 360) : r) : Bs(isNaN(e) ? t : e);
}
function Lx(e) {
  return (e = +e) == 1 ? eu : function(t, r) {
    return r - t ? Bx(t, r, e) : Bs(isNaN(t) ? r : t);
  };
}
function eu(e, t) {
  var r = t - e;
  return r ? tu(e, r) : Bs(isNaN(e) ? t : e);
}
const Fo = function e(t) {
  var r = Lx(t);
  function i(n, a) {
    var o = r((n = Oa(n)).r, (a = Oa(a)).r), s = r(n.g, a.g), c = r(n.b, a.b), l = eu(n.opacity, a.opacity);
    return function(h) {
      return n.r = o(h), n.g = s(h), n.b = c(h), n.opacity = l(h), n + "";
    };
  }
  return i.gamma = e, i;
}(1);
function be(e, t) {
  return e = +e, t = +t, function(r) {
    return e * (1 - r) + t * r;
  };
}
var Da = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, ta = new RegExp(Da.source, "g");
function Mx(e) {
  return function() {
    return e;
  };
}
function Ax(e) {
  return function(t) {
    return e(t) + "";
  };
}
function $x(e, t) {
  var r = Da.lastIndex = ta.lastIndex = 0, i, n, a, o = -1, s = [], c = [];
  for (e = e + "", t = t + ""; (i = Da.exec(e)) && (n = ta.exec(t)); )
    (a = n.index) > r && (a = t.slice(r, a), s[o] ? s[o] += a : s[++o] = a), (i = i[0]) === (n = n[0]) ? s[o] ? s[o] += n : s[++o] = n : (s[++o] = null, c.push({ i: o, x: be(i, n) })), r = ta.lastIndex;
  return r < t.length && (a = t.slice(r), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? Ax(c[0].x) : Mx(t) : (t = c.length, function(l) {
    for (var h = 0, u; h < t; ++h) s[(u = c[h]).i] = u.x(l);
    return s.join("");
  });
}
var Eo = 180 / Math.PI, Ra = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function ru(e, t, r, i, n, a) {
  var o, s, c;
  return (o = Math.sqrt(e * e + t * t)) && (e /= o, t /= o), (c = e * r + t * i) && (r -= e * c, i -= t * c), (s = Math.sqrt(r * r + i * i)) && (r /= s, i /= s, c /= s), e * i < t * r && (e = -e, t = -t, c = -c, o = -o), {
    translateX: n,
    translateY: a,
    rotate: Math.atan2(t, e) * Eo,
    skewX: Math.atan(c) * Eo,
    scaleX: o,
    scaleY: s
  };
}
var _i;
function Fx(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Ra : ru(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Ex(e) {
  return e == null || (_i || (_i = document.createElementNS("http://www.w3.org/2000/svg", "g")), _i.setAttribute("transform", e), !(e = _i.transform.baseVal.consolidate())) ? Ra : (e = e.matrix, ru(e.a, e.b, e.c, e.d, e.e, e.f));
}
function iu(e, t, r, i) {
  function n(l) {
    return l.length ? l.pop() + " " : "";
  }
  function a(l, h, u, f, p, g) {
    if (l !== u || h !== f) {
      var m = p.push("translate(", null, t, null, r);
      g.push({ i: m - 4, x: be(l, u) }, { i: m - 2, x: be(h, f) });
    } else (u || f) && p.push("translate(" + u + t + f + r);
  }
  function o(l, h, u, f) {
    l !== h ? (l - h > 180 ? h += 360 : h - l > 180 && (l += 360), f.push({ i: u.push(n(u) + "rotate(", null, i) - 2, x: be(l, h) })) : h && u.push(n(u) + "rotate(" + h + i);
  }
  function s(l, h, u, f) {
    l !== h ? f.push({ i: u.push(n(u) + "skewX(", null, i) - 2, x: be(l, h) }) : h && u.push(n(u) + "skewX(" + h + i);
  }
  function c(l, h, u, f, p, g) {
    if (l !== u || h !== f) {
      var m = p.push(n(p) + "scale(", null, ",", null, ")");
      g.push({ i: m - 4, x: be(l, u) }, { i: m - 2, x: be(h, f) });
    } else (u !== 1 || f !== 1) && p.push(n(p) + "scale(" + u + "," + f + ")");
  }
  return function(l, h) {
    var u = [], f = [];
    return l = e(l), h = e(h), a(l.translateX, l.translateY, h.translateX, h.translateY, u, f), o(l.rotate, h.rotate, u, f), s(l.skewX, h.skewX, u, f), c(l.scaleX, l.scaleY, h.scaleX, h.scaleY, u, f), l = h = null, function(p) {
      for (var g = -1, m = f.length, y; ++g < m; ) u[(y = f[g]).i] = y.x(p);
      return u.join("");
    };
  };
}
var Ox = iu(Fx, "px, ", "px)", "deg)"), Dx = iu(Ex, ", ", ")", ")"), Cr = 0, Nr = 0, Ar = 0, nu = 1e3, rn, zr, nn = 0, qe = 0, Fn = 0, ii = typeof performance == "object" && performance.now ? performance : Date, au = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Ls() {
  return qe || (au(Rx), qe = ii.now() + Fn);
}
function Rx() {
  qe = 0;
}
function an() {
  this._call = this._time = this._next = null;
}
an.prototype = su.prototype = {
  constructor: an,
  restart: function(e, t, r) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    r = (r == null ? Ls() : +r) + (t == null ? 0 : +t), !this._next && zr !== this && (zr ? zr._next = this : rn = this, zr = this), this._call = e, this._time = r, Ia();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Ia());
  }
};
function su(e, t, r) {
  var i = new an();
  return i.restart(e, t, r), i;
}
function Ix() {
  Ls(), ++Cr;
  for (var e = rn, t; e; )
    (t = qe - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Cr;
}
function Oo() {
  qe = (nn = ii.now()) + Fn, Cr = Nr = 0;
  try {
    Ix();
  } finally {
    Cr = 0, Nx(), qe = 0;
  }
}
function Px() {
  var e = ii.now(), t = e - nn;
  t > nu && (Fn -= t, nn = e);
}
function Nx() {
  for (var e, t = rn, r, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (r = t._next, t._next = null, t = e ? e._next = r : rn = r);
  zr = e, Ia(i);
}
function Ia(e) {
  if (!Cr) {
    Nr && (Nr = clearTimeout(Nr));
    var t = e - qe;
    t > 24 ? (e < 1 / 0 && (Nr = setTimeout(Oo, e - ii.now() - Fn)), Ar && (Ar = clearInterval(Ar))) : (Ar || (nn = ii.now(), Ar = setInterval(Px, nu)), Cr = 1, au(Oo));
  }
}
function Do(e, t, r) {
  var i = new an();
  return t = t == null ? 0 : +t, i.restart((n) => {
    i.stop(), e(n + t);
  }, t, r), i;
}
var zx = Nh("start", "end", "cancel", "interrupt"), qx = [], ou = 0, Ro = 1, Pa = 2, Ei = 3, Io = 4, Na = 5, Oi = 6;
function En(e, t, r, i, n, a) {
  var o = e.__transition;
  if (!o) e.__transition = {};
  else if (r in o) return;
  Wx(e, r, {
    name: t,
    index: i,
    // For context during callback.
    group: n,
    // For context during callback.
    on: zx,
    tween: qx,
    time: a.time,
    delay: a.delay,
    duration: a.duration,
    ease: a.ease,
    timer: null,
    state: ou
  });
}
function Ms(e, t) {
  var r = Yt(e, t);
  if (r.state > ou) throw new Error("too late; already scheduled");
  return r;
}
function Jt(e, t) {
  var r = Yt(e, t);
  if (r.state > Ei) throw new Error("too late; already running");
  return r;
}
function Yt(e, t) {
  var r = e.__transition;
  if (!r || !(r = r[t])) throw new Error("transition not found");
  return r;
}
function Wx(e, t, r) {
  var i = e.__transition, n;
  i[t] = r, r.timer = su(a, 0, r.time);
  function a(l) {
    r.state = Ro, r.timer.restart(o, r.delay, r.time), r.delay <= l && o(l - r.delay);
  }
  function o(l) {
    var h, u, f, p;
    if (r.state !== Ro) return c();
    for (h in i)
      if (p = i[h], p.name === r.name) {
        if (p.state === Ei) return Do(o);
        p.state === Io ? (p.state = Oi, p.timer.stop(), p.on.call("interrupt", e, e.__data__, p.index, p.group), delete i[h]) : +h < t && (p.state = Oi, p.timer.stop(), p.on.call("cancel", e, e.__data__, p.index, p.group), delete i[h]);
      }
    if (Do(function() {
      r.state === Ei && (r.state = Io, r.timer.restart(s, r.delay, r.time), s(l));
    }), r.state = Pa, r.on.call("start", e, e.__data__, r.index, r.group), r.state === Pa) {
      for (r.state = Ei, n = new Array(f = r.tween.length), h = 0, u = -1; h < f; ++h)
        (p = r.tween[h].value.call(e, e.__data__, r.index, r.group)) && (n[++u] = p);
      n.length = u + 1;
    }
  }
  function s(l) {
    for (var h = l < r.duration ? r.ease.call(null, l / r.duration) : (r.timer.restart(c), r.state = Na, 1), u = -1, f = n.length; ++u < f; )
      n[u].call(e, h);
    r.state === Na && (r.on.call("end", e, e.__data__, r.index, r.group), c());
  }
  function c() {
    r.state = Oi, r.timer.stop(), delete i[t];
    for (var l in i) return;
    delete e.__transition;
  }
}
function Hx(e, t) {
  var r = e.__transition, i, n, a = !0, o;
  if (r) {
    t = t == null ? null : t + "";
    for (o in r) {
      if ((i = r[o]).name !== t) {
        a = !1;
        continue;
      }
      n = i.state > Pa && i.state < Na, i.state = Oi, i.timer.stop(), i.on.call(n ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete r[o];
    }
    a && delete e.__transition;
  }
}
function jx(e) {
  return this.each(function() {
    Hx(this, e);
  });
}
function Yx(e, t) {
  var r, i;
  return function() {
    var n = Jt(this, e), a = n.tween;
    if (a !== r) {
      i = r = a;
      for (var o = 0, s = i.length; o < s; ++o)
        if (i[o].name === t) {
          i = i.slice(), i.splice(o, 1);
          break;
        }
    }
    n.tween = i;
  };
}
function Gx(e, t, r) {
  var i, n;
  if (typeof r != "function") throw new Error();
  return function() {
    var a = Jt(this, e), o = a.tween;
    if (o !== i) {
      n = (i = o).slice();
      for (var s = { name: t, value: r }, c = 0, l = n.length; c < l; ++c)
        if (n[c].name === t) {
          n[c] = s;
          break;
        }
      c === l && n.push(s);
    }
    a.tween = n;
  };
}
function Ux(e, t) {
  var r = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = Yt(this.node(), r).tween, n = 0, a = i.length, o; n < a; ++n)
      if ((o = i[n]).name === e)
        return o.value;
    return null;
  }
  return this.each((t == null ? Yx : Gx)(r, e, t));
}
function As(e, t, r) {
  var i = e._id;
  return e.each(function() {
    var n = Jt(this, i);
    (n.value || (n.value = {}))[t] = r.apply(this, arguments);
  }), function(n) {
    return Yt(n, i).value[t];
  };
}
function lu(e, t) {
  var r;
  return (typeof t == "number" ? be : t instanceof ri ? Fo : (r = ri(t)) ? (t = r, Fo) : $x)(e, t);
}
function Xx(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Vx(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Zx(e, t, r) {
  var i, n = r + "", a;
  return function() {
    var o = this.getAttribute(e);
    return o === n ? null : o === i ? a : a = t(i = o, r);
  };
}
function Kx(e, t, r) {
  var i, n = r + "", a;
  return function() {
    var o = this.getAttributeNS(e.space, e.local);
    return o === n ? null : o === i ? a : a = t(i = o, r);
  };
}
function Qx(e, t, r) {
  var i, n, a;
  return function() {
    var o, s = r(this), c;
    return s == null ? void this.removeAttribute(e) : (o = this.getAttribute(e), c = s + "", o === c ? null : o === i && c === n ? a : (n = c, a = t(i = o, s)));
  };
}
function Jx(e, t, r) {
  var i, n, a;
  return function() {
    var o, s = r(this), c;
    return s == null ? void this.removeAttributeNS(e.space, e.local) : (o = this.getAttributeNS(e.space, e.local), c = s + "", o === c ? null : o === i && c === n ? a : (n = c, a = t(i = o, s)));
  };
}
function tb(e, t) {
  var r = $n(e), i = r === "transform" ? Dx : lu;
  return this.attrTween(e, typeof t == "function" ? (r.local ? Jx : Qx)(r, i, As(this, "attr." + e, t)) : t == null ? (r.local ? Vx : Xx)(r) : (r.local ? Kx : Zx)(r, i, t));
}
function eb(e, t) {
  return function(r) {
    this.setAttribute(e, t.call(this, r));
  };
}
function rb(e, t) {
  return function(r) {
    this.setAttributeNS(e.space, e.local, t.call(this, r));
  };
}
function ib(e, t) {
  var r, i;
  function n() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && rb(e, a)), r;
  }
  return n._value = t, n;
}
function nb(e, t) {
  var r, i;
  function n() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && eb(e, a)), r;
  }
  return n._value = t, n;
}
function ab(e, t) {
  var r = "attr." + e;
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  var i = $n(e);
  return this.tween(r, (i.local ? ib : nb)(i, t));
}
function sb(e, t) {
  return function() {
    Ms(this, e).delay = +t.apply(this, arguments);
  };
}
function ob(e, t) {
  return t = +t, function() {
    Ms(this, e).delay = t;
  };
}
function lb(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? sb : ob)(t, e)) : Yt(this.node(), t).delay;
}
function cb(e, t) {
  return function() {
    Jt(this, e).duration = +t.apply(this, arguments);
  };
}
function hb(e, t) {
  return t = +t, function() {
    Jt(this, e).duration = t;
  };
}
function ub(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? cb : hb)(t, e)) : Yt(this.node(), t).duration;
}
function fb(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Jt(this, e).ease = t;
  };
}
function pb(e) {
  var t = this._id;
  return arguments.length ? this.each(fb(t, e)) : Yt(this.node(), t).ease;
}
function db(e, t) {
  return function() {
    var r = t.apply(this, arguments);
    if (typeof r != "function") throw new Error();
    Jt(this, e).ease = r;
  };
}
function gb(e) {
  if (typeof e != "function") throw new Error();
  return this.each(db(this._id, e));
}
function mb(e) {
  typeof e != "function" && (e = Wh(e));
  for (var t = this._groups, r = t.length, i = new Array(r), n = 0; n < r; ++n)
    for (var a = t[n], o = a.length, s = i[n] = [], c, l = 0; l < o; ++l)
      (c = a[l]) && e.call(c, c.__data__, l, a) && s.push(c);
  return new he(i, this._parents, this._name, this._id);
}
function yb(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, r = e._groups, i = t.length, n = r.length, a = Math.min(i, n), o = new Array(i), s = 0; s < a; ++s)
    for (var c = t[s], l = r[s], h = c.length, u = o[s] = new Array(h), f, p = 0; p < h; ++p)
      (f = c[p] || l[p]) && (u[p] = f);
  for (; s < i; ++s)
    o[s] = t[s];
  return new he(o, this._parents, this._name, this._id);
}
function xb(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var r = t.indexOf(".");
    return r >= 0 && (t = t.slice(0, r)), !t || t === "start";
  });
}
function bb(e, t, r) {
  var i, n, a = xb(t) ? Ms : Jt;
  return function() {
    var o = a(this, e), s = o.on;
    s !== i && (n = (i = s).copy()).on(t, r), o.on = n;
  };
}
function Cb(e, t) {
  var r = this._id;
  return arguments.length < 2 ? Yt(this.node(), r).on.on(e) : this.each(bb(r, e, t));
}
function _b(e) {
  return function() {
    var t = this.parentNode;
    for (var r in this.__transition) if (+r !== e) return;
    t && t.removeChild(this);
  };
}
function wb() {
  return this.on("end.remove", _b(this._id));
}
function kb(e) {
  var t = this._name, r = this._id;
  typeof e != "function" && (e = vs(e));
  for (var i = this._groups, n = i.length, a = new Array(n), o = 0; o < n; ++o)
    for (var s = i[o], c = s.length, l = a[o] = new Array(c), h, u, f = 0; f < c; ++f)
      (h = s[f]) && (u = e.call(h, h.__data__, f, s)) && ("__data__" in h && (u.__data__ = h.__data__), l[f] = u, En(l[f], t, r, f, l, Yt(h, r)));
  return new he(a, this._parents, t, r);
}
function vb(e) {
  var t = this._name, r = this._id;
  typeof e != "function" && (e = qh(e));
  for (var i = this._groups, n = i.length, a = [], o = [], s = 0; s < n; ++s)
    for (var c = i[s], l = c.length, h, u = 0; u < l; ++u)
      if (h = c[u]) {
        for (var f = e.call(h, h.__data__, u, c), p, g = Yt(h, r), m = 0, y = f.length; m < y; ++m)
          (p = f[m]) && En(p, t, r, m, f, g);
        a.push(f), o.push(h);
      }
  return new he(a, o, t, r);
}
var Sb = ui.prototype.constructor;
function Tb() {
  return new Sb(this._groups, this._parents);
}
function Bb(e, t) {
  var r, i, n;
  return function() {
    var a = br(this, e), o = (this.style.removeProperty(e), br(this, e));
    return a === o ? null : a === r && o === i ? n : n = t(r = a, i = o);
  };
}
function cu(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Lb(e, t, r) {
  var i, n = r + "", a;
  return function() {
    var o = br(this, e);
    return o === n ? null : o === i ? a : a = t(i = o, r);
  };
}
function Mb(e, t, r) {
  var i, n, a;
  return function() {
    var o = br(this, e), s = r(this), c = s + "";
    return s == null && (c = s = (this.style.removeProperty(e), br(this, e))), o === c ? null : o === i && c === n ? a : (n = c, a = t(i = o, s));
  };
}
function Ab(e, t) {
  var r, i, n, a = "style." + t, o = "end." + a, s;
  return function() {
    var c = Jt(this, e), l = c.on, h = c.value[a] == null ? s || (s = cu(t)) : void 0;
    (l !== r || n !== h) && (i = (r = l).copy()).on(o, n = h), c.on = i;
  };
}
function $b(e, t, r) {
  var i = (e += "") == "transform" ? Ox : lu;
  return t == null ? this.styleTween(e, Bb(e, i)).on("end.style." + e, cu(e)) : typeof t == "function" ? this.styleTween(e, Mb(e, i, As(this, "style." + e, t))).each(Ab(this._id, e)) : this.styleTween(e, Lb(e, i, t), r).on("end.style." + e, null);
}
function Fb(e, t, r) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), r);
  };
}
function Eb(e, t, r) {
  var i, n;
  function a() {
    var o = t.apply(this, arguments);
    return o !== n && (i = (n = o) && Fb(e, o, r)), i;
  }
  return a._value = t, a;
}
function Ob(e, t, r) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, Eb(e, t, r ?? ""));
}
function Db(e) {
  return function() {
    this.textContent = e;
  };
}
function Rb(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function Ib(e) {
  return this.tween("text", typeof e == "function" ? Rb(As(this, "text", e)) : Db(e == null ? "" : e + ""));
}
function Pb(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function Nb(e) {
  var t, r;
  function i() {
    var n = e.apply(this, arguments);
    return n !== r && (t = (r = n) && Pb(n)), t;
  }
  return i._value = e, i;
}
function zb(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, Nb(e));
}
function qb() {
  for (var e = this._name, t = this._id, r = hu(), i = this._groups, n = i.length, a = 0; a < n; ++a)
    for (var o = i[a], s = o.length, c, l = 0; l < s; ++l)
      if (c = o[l]) {
        var h = Yt(c, t);
        En(c, e, r, l, o, {
          time: h.time + h.delay + h.duration,
          delay: 0,
          duration: h.duration,
          ease: h.ease
        });
      }
  return new he(i, this._parents, e, r);
}
function Wb() {
  var e, t, r = this, i = r._id, n = r.size();
  return new Promise(function(a, o) {
    var s = { value: o }, c = { value: function() {
      --n === 0 && a();
    } };
    r.each(function() {
      var l = Jt(this, i), h = l.on;
      h !== e && (t = (e = h).copy(), t._.cancel.push(s), t._.interrupt.push(s), t._.end.push(c)), l.on = t;
    }), n === 0 && a();
  });
}
var Hb = 0;
function he(e, t, r, i) {
  this._groups = e, this._parents = t, this._name = r, this._id = i;
}
function hu() {
  return ++Hb;
}
var ie = ui.prototype;
he.prototype = {
  constructor: he,
  select: kb,
  selectAll: vb,
  selectChild: ie.selectChild,
  selectChildren: ie.selectChildren,
  filter: mb,
  merge: yb,
  selection: Tb,
  transition: qb,
  call: ie.call,
  nodes: ie.nodes,
  node: ie.node,
  size: ie.size,
  empty: ie.empty,
  each: ie.each,
  on: Cb,
  attr: tb,
  attrTween: ab,
  style: $b,
  styleTween: Ob,
  text: Ib,
  textTween: zb,
  remove: wb,
  tween: Ux,
  delay: lb,
  duration: ub,
  ease: pb,
  easeVarying: gb,
  end: Wb,
  [Symbol.iterator]: ie[Symbol.iterator]
};
function jb(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var Yb = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: jb
};
function Gb(e, t) {
  for (var r; !(r = e.__transition) || !(r = r[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return r;
}
function Ub(e) {
  var t, r;
  e instanceof he ? (t = e._id, e = e._name) : (t = hu(), (r = Yb).time = Ls(), e = e == null ? null : e + "");
  for (var i = this._groups, n = i.length, a = 0; a < n; ++a)
    for (var o = i[a], s = o.length, c, l = 0; l < s; ++l)
      (c = o[l]) && En(c, e, t, l, o, r || Gb(c, t));
  return new he(i, this._parents, e, t);
}
ui.prototype.interrupt = jx;
ui.prototype.transition = Ub;
const za = Math.PI, qa = 2 * za, Me = 1e-6, Xb = qa - Me;
function uu(e) {
  this._ += e[0];
  for (let t = 1, r = e.length; t < r; ++t)
    this._ += arguments[t] + e[t];
}
function Vb(e) {
  let t = Math.floor(e);
  if (!(t >= 0)) throw new Error(`invalid digits: ${e}`);
  if (t > 15) return uu;
  const r = 10 ** t;
  return function(i) {
    this._ += i[0];
    for (let n = 1, a = i.length; n < a; ++n)
      this._ += Math.round(arguments[n] * r) / r + i[n];
  };
}
class Zb {
  constructor(t) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null, this._ = "", this._append = t == null ? uu : Vb(t);
  }
  moveTo(t, r) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +r}`;
  }
  closePath() {
    this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
  }
  lineTo(t, r) {
    this._append`L${this._x1 = +t},${this._y1 = +r}`;
  }
  quadraticCurveTo(t, r, i, n) {
    this._append`Q${+t},${+r},${this._x1 = +i},${this._y1 = +n}`;
  }
  bezierCurveTo(t, r, i, n, a, o) {
    this._append`C${+t},${+r},${+i},${+n},${this._x1 = +a},${this._y1 = +o}`;
  }
  arcTo(t, r, i, n, a) {
    if (t = +t, r = +r, i = +i, n = +n, a = +a, a < 0) throw new Error(`negative radius: ${a}`);
    let o = this._x1, s = this._y1, c = i - t, l = n - r, h = o - t, u = s - r, f = h * h + u * u;
    if (this._x1 === null)
      this._append`M${this._x1 = t},${this._y1 = r}`;
    else if (f > Me) if (!(Math.abs(u * c - l * h) > Me) || !a)
      this._append`L${this._x1 = t},${this._y1 = r}`;
    else {
      let p = i - o, g = n - s, m = c * c + l * l, y = p * p + g * g, x = Math.sqrt(m), b = Math.sqrt(f), _ = a * Math.tan((za - Math.acos((m + f - y) / (2 * x * b))) / 2), S = _ / b, k = _ / x;
      Math.abs(S - 1) > Me && this._append`L${t + S * h},${r + S * u}`, this._append`A${a},${a},0,0,${+(u * p > h * g)},${this._x1 = t + k * c},${this._y1 = r + k * l}`;
    }
  }
  arc(t, r, i, n, a, o) {
    if (t = +t, r = +r, i = +i, o = !!o, i < 0) throw new Error(`negative radius: ${i}`);
    let s = i * Math.cos(n), c = i * Math.sin(n), l = t + s, h = r + c, u = 1 ^ o, f = o ? n - a : a - n;
    this._x1 === null ? this._append`M${l},${h}` : (Math.abs(this._x1 - l) > Me || Math.abs(this._y1 - h) > Me) && this._append`L${l},${h}`, i && (f < 0 && (f = f % qa + qa), f > Xb ? this._append`A${i},${i},0,1,${u},${t - s},${r - c}A${i},${i},0,1,${u},${this._x1 = l},${this._y1 = h}` : f > Me && this._append`A${i},${i},0,${+(f >= za)},${u},${this._x1 = t + i * Math.cos(a)},${this._y1 = r + i * Math.sin(a)}`);
  }
  rect(t, r, i, n) {
    this._append`M${this._x0 = this._x1 = +t},${this._y0 = this._y1 = +r}h${i = +i}v${+n}h${-i}Z`;
  }
  toString() {
    return this._;
  }
}
function Ze(e) {
  return function() {
    return e;
  };
}
const CT = Math.abs, _T = Math.atan2, wT = Math.cos, kT = Math.max, vT = Math.min, ST = Math.sin, TT = Math.sqrt, Po = 1e-12, $s = Math.PI, No = $s / 2, BT = 2 * $s;
function LT(e) {
  return e > 1 ? 0 : e < -1 ? $s : Math.acos(e);
}
function MT(e) {
  return e >= 1 ? No : e <= -1 ? -No : Math.asin(e);
}
function Kb(e) {
  let t = 3;
  return e.digits = function(r) {
    if (!arguments.length) return t;
    if (r == null)
      t = null;
    else {
      const i = Math.floor(r);
      if (!(i >= 0)) throw new RangeError(`invalid digits: ${r}`);
      t = i;
    }
    return e;
  }, () => new Zb(t);
}
function Qb(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function fu(e) {
  this._context = e;
}
fu.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(e, t);
        break;
    }
  }
};
function sn(e) {
  return new fu(e);
}
function Jb(e) {
  return e[0];
}
function t1(e) {
  return e[1];
}
function e1(e, t) {
  var r = Ze(!0), i = null, n = sn, a = null, o = Kb(s);
  e = typeof e == "function" ? e : e === void 0 ? Jb : Ze(e), t = typeof t == "function" ? t : t === void 0 ? t1 : Ze(t);
  function s(c) {
    var l, h = (c = Qb(c)).length, u, f = !1, p;
    for (i == null && (a = n(p = o())), l = 0; l <= h; ++l)
      !(l < h && r(u = c[l], l, c)) === f && ((f = !f) ? a.lineStart() : a.lineEnd()), f && a.point(+e(u, l, c), +t(u, l, c));
    if (p) return a = null, p + "" || null;
  }
  return s.x = function(c) {
    return arguments.length ? (e = typeof c == "function" ? c : Ze(+c), s) : e;
  }, s.y = function(c) {
    return arguments.length ? (t = typeof c == "function" ? c : Ze(+c), s) : t;
  }, s.defined = function(c) {
    return arguments.length ? (r = typeof c == "function" ? c : Ze(!!c), s) : r;
  }, s.curve = function(c) {
    return arguments.length ? (n = c, i != null && (a = n(i)), s) : n;
  }, s.context = function(c) {
    return arguments.length ? (c == null ? i = a = null : a = n(i = c), s) : i;
  }, s;
}
class pu {
  constructor(t, r) {
    this._context = t, this._x = r;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  }
  point(t, r) {
    switch (t = +t, r = +r, this._point) {
      case 0: {
        this._point = 1, this._line ? this._context.lineTo(t, r) : this._context.moveTo(t, r);
        break;
      }
      case 1:
        this._point = 2;
      default: {
        this._x ? this._context.bezierCurveTo(this._x0 = (this._x0 + t) / 2, this._y0, this._x0, r, t, r) : this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + r) / 2, t, this._y0, t, r);
        break;
      }
    }
    this._x0 = t, this._y0 = r;
  }
}
function du(e) {
  return new pu(e, !0);
}
function gu(e) {
  return new pu(e, !1);
}
function ke() {
}
function on(e, t, r) {
  e._context.bezierCurveTo(
    (2 * e._x0 + e._x1) / 3,
    (2 * e._y0 + e._y1) / 3,
    (e._x0 + 2 * e._x1) / 3,
    (e._y0 + 2 * e._y1) / 3,
    (e._x0 + 4 * e._x1 + t) / 6,
    (e._y0 + 4 * e._y1 + r) / 6
  );
}
function On(e) {
  this._context = e;
}
On.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3:
        on(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
      default:
        on(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function Di(e) {
  return new On(e);
}
function mu(e) {
  this._context = e;
}
mu.prototype = {
  areaStart: ke,
  areaEnd: ke,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2), this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3), this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2), this.point(this._x3, this._y3), this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._x2 = e, this._y2 = t;
        break;
      case 1:
        this._point = 2, this._x3 = e, this._y3 = t;
        break;
      case 2:
        this._point = 3, this._x4 = e, this._y4 = t, this._context.moveTo((this._x0 + 4 * this._x1 + e) / 6, (this._y0 + 4 * this._y1 + t) / 6);
        break;
      default:
        on(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function r1(e) {
  return new mu(e);
}
function yu(e) {
  this._context = e;
}
yu.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var r = (this._x0 + 4 * this._x1 + e) / 6, i = (this._y0 + 4 * this._y1 + t) / 6;
        this._line ? this._context.lineTo(r, i) : this._context.moveTo(r, i);
        break;
      case 3:
        this._point = 4;
      default:
        on(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
  }
};
function i1(e) {
  return new yu(e);
}
function xu(e, t) {
  this._basis = new On(e), this._beta = t;
}
xu.prototype = {
  lineStart: function() {
    this._x = [], this._y = [], this._basis.lineStart();
  },
  lineEnd: function() {
    var e = this._x, t = this._y, r = e.length - 1;
    if (r > 0)
      for (var i = e[0], n = t[0], a = e[r] - i, o = t[r] - n, s = -1, c; ++s <= r; )
        c = s / r, this._basis.point(
          this._beta * e[s] + (1 - this._beta) * (i + c * a),
          this._beta * t[s] + (1 - this._beta) * (n + c * o)
        );
    this._x = this._y = null, this._basis.lineEnd();
  },
  point: function(e, t) {
    this._x.push(+e), this._y.push(+t);
  }
};
const n1 = function e(t) {
  function r(i) {
    return t === 1 ? new On(i) : new xu(i, t);
  }
  return r.beta = function(i) {
    return e(+i);
  }, r;
}(0.85);
function ln(e, t, r) {
  e._context.bezierCurveTo(
    e._x1 + e._k * (e._x2 - e._x0),
    e._y1 + e._k * (e._y2 - e._y0),
    e._x2 + e._k * (e._x1 - t),
    e._y2 + e._k * (e._y1 - r),
    e._x2,
    e._y2
  );
}
function Fs(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
Fs.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        ln(this, this._x1, this._y1);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2, this._x1 = e, this._y1 = t;
        break;
      case 2:
        this._point = 3;
      default:
        ln(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const bu = function e(t) {
  function r(i) {
    return new Fs(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
}(0);
function Es(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
Es.prototype = {
  areaStart: ke,
  areaEnd: ke,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._x3 = e, this._y3 = t;
        break;
      case 1:
        this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
        break;
      case 2:
        this._point = 3, this._x5 = e, this._y5 = t;
        break;
      default:
        ln(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const a1 = function e(t) {
  function r(i) {
    return new Es(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
}(0);
function Os(e, t) {
  this._context = e, this._k = (1 - t) / 6;
}
Os.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        ln(this, e, t);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const s1 = function e(t) {
  function r(i) {
    return new Os(i, t);
  }
  return r.tension = function(i) {
    return e(+i);
  }, r;
}(0);
function Ds(e, t, r) {
  var i = e._x1, n = e._y1, a = e._x2, o = e._y2;
  if (e._l01_a > Po) {
    var s = 2 * e._l01_2a + 3 * e._l01_a * e._l12_a + e._l12_2a, c = 3 * e._l01_a * (e._l01_a + e._l12_a);
    i = (i * s - e._x0 * e._l12_2a + e._x2 * e._l01_2a) / c, n = (n * s - e._y0 * e._l12_2a + e._y2 * e._l01_2a) / c;
  }
  if (e._l23_a > Po) {
    var l = 2 * e._l23_2a + 3 * e._l23_a * e._l12_a + e._l12_2a, h = 3 * e._l23_a * (e._l23_a + e._l12_a);
    a = (a * l + e._x1 * e._l23_2a - t * e._l12_2a) / h, o = (o * l + e._y1 * e._l23_2a - r * e._l12_2a) / h;
  }
  e._context.bezierCurveTo(i, n, a, o, e._x2, e._y2);
}
function Cu(e, t) {
  this._context = e, this._alpha = t;
}
Cu.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
      default:
        Ds(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const _u = function e(t) {
  function r(i) {
    return t ? new Cu(i, t) : new Fs(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
}(0.5);
function wu(e, t) {
  this._context = e, this._alpha = t;
}
wu.prototype = {
  areaStart: ke,
  areaEnd: ke,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3), this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1, this._x3 = e, this._y3 = t;
        break;
      case 1:
        this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
        break;
      case 2:
        this._point = 3, this._x5 = e, this._y5 = t;
        break;
      default:
        Ds(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const o1 = function e(t) {
  function r(i) {
    return t ? new wu(i, t) : new Es(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
}(0.5);
function ku(e, t) {
  this._context = e, this._alpha = t;
}
ku.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    (this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    if (e = +e, t = +t, this._point) {
      var r = this._x2 - e, i = this._y2 - t;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(r * r + i * i, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        Ds(this, e, t);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
  }
};
const l1 = function e(t) {
  function r(i) {
    return t ? new ku(i, t) : new Os(i, 0);
  }
  return r.alpha = function(i) {
    return e(+i);
  }, r;
}(0.5);
function vu(e) {
  this._context = e;
}
vu.prototype = {
  areaStart: ke,
  areaEnd: ke,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    this._point && this._context.closePath();
  },
  point: function(e, t) {
    e = +e, t = +t, this._point ? this._context.lineTo(e, t) : (this._point = 1, this._context.moveTo(e, t));
  }
};
function c1(e) {
  return new vu(e);
}
function zo(e) {
  return e < 0 ? -1 : 1;
}
function qo(e, t, r) {
  var i = e._x1 - e._x0, n = t - e._x1, a = (e._y1 - e._y0) / (i || n < 0 && -0), o = (r - e._y1) / (n || i < 0 && -0), s = (a * n + o * i) / (i + n);
  return (zo(a) + zo(o)) * Math.min(Math.abs(a), Math.abs(o), 0.5 * Math.abs(s)) || 0;
}
function Wo(e, t) {
  var r = e._x1 - e._x0;
  return r ? (3 * (e._y1 - e._y0) / r - t) / 2 : t;
}
function ea(e, t, r) {
  var i = e._x0, n = e._y0, a = e._x1, o = e._y1, s = (a - i) / 3;
  e._context.bezierCurveTo(i + s, n + s * t, a - s, o - s * r, a, o);
}
function cn(e) {
  this._context = e;
}
cn.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        ea(this, this._t0, Wo(this, this._t0));
        break;
    }
    (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
  },
  point: function(e, t) {
    var r = NaN;
    if (e = +e, t = +t, !(e === this._x1 && t === this._y1)) {
      switch (this._point) {
        case 0:
          this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          this._point = 3, ea(this, Wo(this, r = qo(this, e, t)), r);
          break;
        default:
          ea(this, this._t0, r = qo(this, e, t));
          break;
      }
      this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = r;
    }
  }
};
function Su(e) {
  this._context = new Tu(e);
}
(Su.prototype = Object.create(cn.prototype)).point = function(e, t) {
  cn.prototype.point.call(this, t, e);
};
function Tu(e) {
  this._context = e;
}
Tu.prototype = {
  moveTo: function(e, t) {
    this._context.moveTo(t, e);
  },
  closePath: function() {
    this._context.closePath();
  },
  lineTo: function(e, t) {
    this._context.lineTo(t, e);
  },
  bezierCurveTo: function(e, t, r, i, n, a) {
    this._context.bezierCurveTo(t, e, i, r, a, n);
  }
};
function Bu(e) {
  return new cn(e);
}
function Lu(e) {
  return new Su(e);
}
function Mu(e) {
  this._context = e;
}
Mu.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [], this._y = [];
  },
  lineEnd: function() {
    var e = this._x, t = this._y, r = e.length;
    if (r)
      if (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), r === 2)
        this._context.lineTo(e[1], t[1]);
      else
        for (var i = Ho(e), n = Ho(t), a = 0, o = 1; o < r; ++a, ++o)
          this._context.bezierCurveTo(i[0][a], n[0][a], i[1][a], n[1][a], e[o], t[o]);
    (this._line || this._line !== 0 && r === 1) && this._context.closePath(), this._line = 1 - this._line, this._x = this._y = null;
  },
  point: function(e, t) {
    this._x.push(+e), this._y.push(+t);
  }
};
function Ho(e) {
  var t, r = e.length - 1, i, n = new Array(r), a = new Array(r), o = new Array(r);
  for (n[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < r - 1; ++t) n[t] = 1, a[t] = 4, o[t] = 4 * e[t] + 2 * e[t + 1];
  for (n[r - 1] = 2, a[r - 1] = 7, o[r - 1] = 8 * e[r - 1] + e[r], t = 1; t < r; ++t) i = n[t] / a[t - 1], a[t] -= i, o[t] -= i * o[t - 1];
  for (n[r - 1] = o[r - 1] / a[r - 1], t = r - 2; t >= 0; --t) n[t] = (o[t] - n[t + 1]) / a[t];
  for (a[r - 1] = (e[r] + n[r - 1]) / 2, t = 0; t < r - 1; ++t) a[t] = 2 * e[t + 1] - n[t + 1];
  return [n, a];
}
function Au(e) {
  return new Mu(e);
}
function Dn(e, t) {
  this._context = e, this._t = t;
}
Dn.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN, this._point = 0;
  },
  lineEnd: function() {
    0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y), (this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line >= 0 && (this._t = 1 - this._t, this._line = 1 - this._line);
  },
  point: function(e, t) {
    switch (e = +e, t = +t, this._point) {
      case 0:
        this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0)
          this._context.lineTo(this._x, t), this._context.lineTo(e, t);
        else {
          var r = this._x * (1 - this._t) + e * this._t;
          this._context.lineTo(r, this._y), this._context.lineTo(r, t);
        }
        break;
      }
    }
    this._x = e, this._y = t;
  }
};
function $u(e) {
  return new Dn(e, 0.5);
}
function Fu(e) {
  return new Dn(e, 0);
}
function Eu(e) {
  return new Dn(e, 1);
}
function qr(e, t, r) {
  this.k = e, this.x = t, this.y = r;
}
qr.prototype = {
  constructor: qr,
  scale: function(e) {
    return e === 1 ? this : new qr(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new qr(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
qr.prototype;
var Ou = typeof global == "object" && global && global.Object === Object && global, h1 = typeof self == "object" && self && self.Object === Object && self, te = Ou || h1 || Function("return this")(), hn = te.Symbol, Du = Object.prototype, u1 = Du.hasOwnProperty, f1 = Du.toString, $r = hn ? hn.toStringTag : void 0;
function p1(e) {
  var t = u1.call(e, $r), r = e[$r];
  try {
    e[$r] = void 0;
    var i = !0;
  } catch {
  }
  var n = f1.call(e);
  return i && (t ? e[$r] = r : delete e[$r]), n;
}
var d1 = Object.prototype, g1 = d1.toString;
function m1(e) {
  return g1.call(e);
}
var y1 = "[object Null]", x1 = "[object Undefined]", jo = hn ? hn.toStringTag : void 0;
function vr(e) {
  return e == null ? e === void 0 ? x1 : y1 : jo && jo in Object(e) ? p1(e) : m1(e);
}
function Ye(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
var b1 = "[object AsyncFunction]", C1 = "[object Function]", _1 = "[object GeneratorFunction]", w1 = "[object Proxy]";
function Rs(e) {
  if (!Ye(e))
    return !1;
  var t = vr(e);
  return t == C1 || t == _1 || t == b1 || t == w1;
}
var ra = te["__core-js_shared__"], Yo = function() {
  var e = /[^.]+$/.exec(ra && ra.keys && ra.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function k1(e) {
  return !!Yo && Yo in e;
}
var v1 = Function.prototype, S1 = v1.toString;
function Ge(e) {
  if (e != null) {
    try {
      return S1.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var T1 = /[\\^$.*+?()[\]{}|]/g, B1 = /^\[object .+?Constructor\]$/, L1 = Function.prototype, M1 = Object.prototype, A1 = L1.toString, $1 = M1.hasOwnProperty, F1 = RegExp(
  "^" + A1.call($1).replace(T1, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function E1(e) {
  if (!Ye(e) || k1(e))
    return !1;
  var t = Rs(e) ? F1 : B1;
  return t.test(Ge(e));
}
function O1(e, t) {
  return e == null ? void 0 : e[t];
}
function Ue(e, t) {
  var r = O1(e, t);
  return E1(r) ? r : void 0;
}
var ni = Ue(Object, "create");
function D1() {
  this.__data__ = ni ? ni(null) : {}, this.size = 0;
}
function R1(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var I1 = "__lodash_hash_undefined__", P1 = Object.prototype, N1 = P1.hasOwnProperty;
function z1(e) {
  var t = this.__data__;
  if (ni) {
    var r = t[e];
    return r === I1 ? void 0 : r;
  }
  return N1.call(t, e) ? t[e] : void 0;
}
var q1 = Object.prototype, W1 = q1.hasOwnProperty;
function H1(e) {
  var t = this.__data__;
  return ni ? t[e] !== void 0 : W1.call(t, e);
}
var j1 = "__lodash_hash_undefined__";
function Y1(e, t) {
  var r = this.__data__;
  return this.size += this.has(e) ? 0 : 1, r[e] = ni && t === void 0 ? j1 : t, this;
}
function We(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
We.prototype.clear = D1;
We.prototype.delete = R1;
We.prototype.get = z1;
We.prototype.has = H1;
We.prototype.set = Y1;
function G1() {
  this.__data__ = [], this.size = 0;
}
function Rn(e, t) {
  return e === t || e !== e && t !== t;
}
function In(e, t) {
  for (var r = e.length; r--; )
    if (Rn(e[r][0], t))
      return r;
  return -1;
}
var U1 = Array.prototype, X1 = U1.splice;
function V1(e) {
  var t = this.__data__, r = In(t, e);
  if (r < 0)
    return !1;
  var i = t.length - 1;
  return r == i ? t.pop() : X1.call(t, r, 1), --this.size, !0;
}
function Z1(e) {
  var t = this.__data__, r = In(t, e);
  return r < 0 ? void 0 : t[r][1];
}
function K1(e) {
  return In(this.__data__, e) > -1;
}
function Q1(e, t) {
  var r = this.__data__, i = In(r, e);
  return i < 0 ? (++this.size, r.push([e, t])) : r[i][1] = t, this;
}
function fe(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
fe.prototype.clear = G1;
fe.prototype.delete = V1;
fe.prototype.get = Z1;
fe.prototype.has = K1;
fe.prototype.set = Q1;
var ai = Ue(te, "Map");
function J1() {
  this.size = 0, this.__data__ = {
    hash: new We(),
    map: new (ai || fe)(),
    string: new We()
  };
}
function t2(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function Pn(e, t) {
  var r = e.__data__;
  return t2(t) ? r[typeof t == "string" ? "string" : "hash"] : r.map;
}
function e2(e) {
  var t = Pn(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function r2(e) {
  return Pn(this, e).get(e);
}
function i2(e) {
  return Pn(this, e).has(e);
}
function n2(e, t) {
  var r = Pn(this, e), i = r.size;
  return r.set(e, t), this.size += r.size == i ? 0 : 1, this;
}
function Te(e) {
  var t = -1, r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
Te.prototype.clear = J1;
Te.prototype.delete = e2;
Te.prototype.get = r2;
Te.prototype.has = i2;
Te.prototype.set = n2;
var a2 = "Expected a function";
function pi(e, t) {
  if (typeof e != "function" || t != null && typeof t != "function")
    throw new TypeError(a2);
  var r = function() {
    var i = arguments, n = t ? t.apply(this, i) : i[0], a = r.cache;
    if (a.has(n))
      return a.get(n);
    var o = e.apply(this, i);
    return r.cache = a.set(n, o) || a, o;
  };
  return r.cache = new (pi.Cache || Te)(), r;
}
pi.Cache = Te;
function s2() {
  this.__data__ = new fe(), this.size = 0;
}
function o2(e) {
  var t = this.__data__, r = t.delete(e);
  return this.size = t.size, r;
}
function l2(e) {
  return this.__data__.get(e);
}
function c2(e) {
  return this.__data__.has(e);
}
var h2 = 200;
function u2(e, t) {
  var r = this.__data__;
  if (r instanceof fe) {
    var i = r.__data__;
    if (!ai || i.length < h2 - 1)
      return i.push([e, t]), this.size = ++r.size, this;
    r = this.__data__ = new Te(i);
  }
  return r.set(e, t), this.size = r.size, this;
}
function Sr(e) {
  var t = this.__data__ = new fe(e);
  this.size = t.size;
}
Sr.prototype.clear = s2;
Sr.prototype.delete = o2;
Sr.prototype.get = l2;
Sr.prototype.has = c2;
Sr.prototype.set = u2;
var un = function() {
  try {
    var e = Ue(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
}();
function Is(e, t, r) {
  t == "__proto__" && un ? un(e, t, {
    configurable: !0,
    enumerable: !0,
    value: r,
    writable: !0
  }) : e[t] = r;
}
function Wa(e, t, r) {
  (r !== void 0 && !Rn(e[t], r) || r === void 0 && !(t in e)) && Is(e, t, r);
}
function f2(e) {
  return function(t, r, i) {
    for (var n = -1, a = Object(t), o = i(t), s = o.length; s--; ) {
      var c = o[++n];
      if (r(a[c], c, a) === !1)
        break;
    }
    return t;
  };
}
var p2 = f2(), Ru = typeof exports == "object" && exports && !exports.nodeType && exports, Go = Ru && typeof module == "object" && module && !module.nodeType && module, d2 = Go && Go.exports === Ru, Uo = d2 ? te.Buffer : void 0, Xo = Uo ? Uo.allocUnsafe : void 0;
function g2(e, t) {
  if (t)
    return e.slice();
  var r = e.length, i = Xo ? Xo(r) : new e.constructor(r);
  return e.copy(i), i;
}
var Vo = te.Uint8Array;
function m2(e) {
  var t = new e.constructor(e.byteLength);
  return new Vo(t).set(new Vo(e)), t;
}
function y2(e, t) {
  var r = t ? m2(e.buffer) : e.buffer;
  return new e.constructor(r, e.byteOffset, e.length);
}
function x2(e, t) {
  var r = -1, i = e.length;
  for (t || (t = Array(i)); ++r < i; )
    t[r] = e[r];
  return t;
}
var Zo = Object.create, b2 = /* @__PURE__ */ function() {
  function e() {
  }
  return function(t) {
    if (!Ye(t))
      return {};
    if (Zo)
      return Zo(t);
    e.prototype = t;
    var r = new e();
    return e.prototype = void 0, r;
  };
}();
function Iu(e, t) {
  return function(r) {
    return e(t(r));
  };
}
var Pu = Iu(Object.getPrototypeOf, Object), C2 = Object.prototype;
function Nn(e) {
  var t = e && e.constructor, r = typeof t == "function" && t.prototype || C2;
  return e === r;
}
function _2(e) {
  return typeof e.constructor == "function" && !Nn(e) ? b2(Pu(e)) : {};
}
function di(e) {
  return e != null && typeof e == "object";
}
var w2 = "[object Arguments]";
function Ko(e) {
  return di(e) && vr(e) == w2;
}
var Nu = Object.prototype, k2 = Nu.hasOwnProperty, v2 = Nu.propertyIsEnumerable, fn = Ko(/* @__PURE__ */ function() {
  return arguments;
}()) ? Ko : function(e) {
  return di(e) && k2.call(e, "callee") && !v2.call(e, "callee");
}, pn = Array.isArray, S2 = 9007199254740991;
function zu(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= S2;
}
function zn(e) {
  return e != null && zu(e.length) && !Rs(e);
}
function T2(e) {
  return di(e) && zn(e);
}
function B2() {
  return !1;
}
var qu = typeof exports == "object" && exports && !exports.nodeType && exports, Qo = qu && typeof module == "object" && module && !module.nodeType && module, L2 = Qo && Qo.exports === qu, Jo = L2 ? te.Buffer : void 0, M2 = Jo ? Jo.isBuffer : void 0, Ps = M2 || B2, A2 = "[object Object]", $2 = Function.prototype, F2 = Object.prototype, Wu = $2.toString, E2 = F2.hasOwnProperty, O2 = Wu.call(Object);
function D2(e) {
  if (!di(e) || vr(e) != A2)
    return !1;
  var t = Pu(e);
  if (t === null)
    return !0;
  var r = E2.call(t, "constructor") && t.constructor;
  return typeof r == "function" && r instanceof r && Wu.call(r) == O2;
}
var R2 = "[object Arguments]", I2 = "[object Array]", P2 = "[object Boolean]", N2 = "[object Date]", z2 = "[object Error]", q2 = "[object Function]", W2 = "[object Map]", H2 = "[object Number]", j2 = "[object Object]", Y2 = "[object RegExp]", G2 = "[object Set]", U2 = "[object String]", X2 = "[object WeakMap]", V2 = "[object ArrayBuffer]", Z2 = "[object DataView]", K2 = "[object Float32Array]", Q2 = "[object Float64Array]", J2 = "[object Int8Array]", tC = "[object Int16Array]", eC = "[object Int32Array]", rC = "[object Uint8Array]", iC = "[object Uint8ClampedArray]", nC = "[object Uint16Array]", aC = "[object Uint32Array]", ht = {};
ht[K2] = ht[Q2] = ht[J2] = ht[tC] = ht[eC] = ht[rC] = ht[iC] = ht[nC] = ht[aC] = !0;
ht[R2] = ht[I2] = ht[V2] = ht[P2] = ht[Z2] = ht[N2] = ht[z2] = ht[q2] = ht[W2] = ht[H2] = ht[j2] = ht[Y2] = ht[G2] = ht[U2] = ht[X2] = !1;
function sC(e) {
  return di(e) && zu(e.length) && !!ht[vr(e)];
}
function oC(e) {
  return function(t) {
    return e(t);
  };
}
var Hu = typeof exports == "object" && exports && !exports.nodeType && exports, Xr = Hu && typeof module == "object" && module && !module.nodeType && module, lC = Xr && Xr.exports === Hu, ia = lC && Ou.process, tl = function() {
  try {
    var e = Xr && Xr.require && Xr.require("util").types;
    return e || ia && ia.binding && ia.binding("util");
  } catch {
  }
}(), el = tl && tl.isTypedArray, Ns = el ? oC(el) : sC;
function Ha(e, t) {
  if (!(t === "constructor" && typeof e[t] == "function") && t != "__proto__")
    return e[t];
}
var cC = Object.prototype, hC = cC.hasOwnProperty;
function uC(e, t, r) {
  var i = e[t];
  (!(hC.call(e, t) && Rn(i, r)) || r === void 0 && !(t in e)) && Is(e, t, r);
}
function fC(e, t, r, i) {
  var n = !r;
  r || (r = {});
  for (var a = -1, o = t.length; ++a < o; ) {
    var s = t[a], c = void 0;
    c === void 0 && (c = e[s]), n ? Is(r, s, c) : uC(r, s, c);
  }
  return r;
}
function pC(e, t) {
  for (var r = -1, i = Array(e); ++r < e; )
    i[r] = t(r);
  return i;
}
var dC = 9007199254740991, gC = /^(?:0|[1-9]\d*)$/;
function ju(e, t) {
  var r = typeof e;
  return t = t ?? dC, !!t && (r == "number" || r != "symbol" && gC.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
var mC = Object.prototype, yC = mC.hasOwnProperty;
function xC(e, t) {
  var r = pn(e), i = !r && fn(e), n = !r && !i && Ps(e), a = !r && !i && !n && Ns(e), o = r || i || n || a, s = o ? pC(e.length, String) : [], c = s.length;
  for (var l in e)
    (t || yC.call(e, l)) && !(o && // Safari 9 has enumerable `arguments.length` in strict mode.
    (l == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    n && (l == "offset" || l == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    a && (l == "buffer" || l == "byteLength" || l == "byteOffset") || // Skip index properties.
    ju(l, c))) && s.push(l);
  return s;
}
function bC(e) {
  var t = [];
  if (e != null)
    for (var r in Object(e))
      t.push(r);
  return t;
}
var CC = Object.prototype, _C = CC.hasOwnProperty;
function wC(e) {
  if (!Ye(e))
    return bC(e);
  var t = Nn(e), r = [];
  for (var i in e)
    i == "constructor" && (t || !_C.call(e, i)) || r.push(i);
  return r;
}
function Yu(e) {
  return zn(e) ? xC(e, !0) : wC(e);
}
function kC(e) {
  return fC(e, Yu(e));
}
function vC(e, t, r, i, n, a, o) {
  var s = Ha(e, r), c = Ha(t, r), l = o.get(c);
  if (l) {
    Wa(e, r, l);
    return;
  }
  var h = a ? a(s, c, r + "", e, t, o) : void 0, u = h === void 0;
  if (u) {
    var f = pn(c), p = !f && Ps(c), g = !f && !p && Ns(c);
    h = c, f || p || g ? pn(s) ? h = s : T2(s) ? h = x2(s) : p ? (u = !1, h = g2(c, !0)) : g ? (u = !1, h = y2(c, !0)) : h = [] : D2(c) || fn(c) ? (h = s, fn(s) ? h = kC(s) : (!Ye(s) || Rs(s)) && (h = _2(c))) : u = !1;
  }
  u && (o.set(c, h), n(h, c, i, a, o), o.delete(c)), Wa(e, r, h);
}
function Gu(e, t, r, i, n) {
  e !== t && p2(t, function(a, o) {
    if (n || (n = new Sr()), Ye(a))
      vC(e, t, o, r, Gu, i, n);
    else {
      var s = i ? i(Ha(e, o), a, o + "", e, t, n) : void 0;
      s === void 0 && (s = a), Wa(e, o, s);
    }
  }, Yu);
}
function Uu(e) {
  return e;
}
function SC(e, t, r) {
  switch (r.length) {
    case 0:
      return e.call(t);
    case 1:
      return e.call(t, r[0]);
    case 2:
      return e.call(t, r[0], r[1]);
    case 3:
      return e.call(t, r[0], r[1], r[2]);
  }
  return e.apply(t, r);
}
var rl = Math.max;
function TC(e, t, r) {
  return t = rl(t === void 0 ? e.length - 1 : t, 0), function() {
    for (var i = arguments, n = -1, a = rl(i.length - t, 0), o = Array(a); ++n < a; )
      o[n] = i[t + n];
    n = -1;
    for (var s = Array(t + 1); ++n < t; )
      s[n] = i[n];
    return s[t] = r(o), SC(e, this, s);
  };
}
function BC(e) {
  return function() {
    return e;
  };
}
var LC = un ? function(e, t) {
  return un(e, "toString", {
    configurable: !0,
    enumerable: !1,
    value: BC(t),
    writable: !0
  });
} : Uu, MC = 800, AC = 16, $C = Date.now;
function FC(e) {
  var t = 0, r = 0;
  return function() {
    var i = $C(), n = AC - (i - r);
    if (r = i, n > 0) {
      if (++t >= MC)
        return arguments[0];
    } else
      t = 0;
    return e.apply(void 0, arguments);
  };
}
var EC = FC(LC);
function OC(e, t) {
  return EC(TC(e, t, Uu), e + "");
}
function DC(e, t, r) {
  if (!Ye(r))
    return !1;
  var i = typeof t;
  return (i == "number" ? zn(r) && ju(t, r.length) : i == "string" && t in r) ? Rn(r[t], e) : !1;
}
function RC(e) {
  return OC(function(t, r) {
    var i = -1, n = r.length, a = n > 1 ? r[n - 1] : void 0, o = n > 2 ? r[2] : void 0;
    for (a = e.length > 3 && typeof a == "function" ? (n--, a) : void 0, o && DC(r[0], r[1], o) && (a = n < 3 ? void 0 : a, n = 1), t = Object(t); ++i < n; ) {
      var s = r[i];
      s && e(t, s, i, a);
    }
    return t;
  });
}
var IC = RC(function(e, t, r) {
  Gu(e, t, r);
}), PC = "​", NC = {
  curveBasis: Di,
  curveBasisClosed: r1,
  curveBasisOpen: i1,
  curveBumpX: du,
  curveBumpY: gu,
  curveBundle: n1,
  curveCardinalClosed: a1,
  curveCardinalOpen: s1,
  curveCardinal: bu,
  curveCatmullRomClosed: o1,
  curveCatmullRomOpen: l1,
  curveCatmullRom: _u,
  curveLinear: sn,
  curveLinearClosed: c1,
  curveMonotoneX: Bu,
  curveMonotoneY: Lu,
  curveNatural: Au,
  curveStep: $u,
  curveStepAfter: Eu,
  curveStepBefore: Fu
}, zC = /\s*(?:(\w+)(?=:):|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi, qC = /* @__PURE__ */ d(function(e, t) {
  const r = Xu(e, /(?:init\b)|(?:initialize\b)/);
  let i = {};
  if (Array.isArray(r)) {
    const o = r.map((s) => s.args);
    Wi(o), i = Ct(i, [...o]);
  } else
    i = r.args;
  if (!i)
    return;
  let n = ls(e, t);
  const a = "config";
  return i[a] !== void 0 && (n === "flowchart-v2" && (n = "flowchart"), i[n] = i[a], delete i[a]), i;
}, "detectInit"), Xu = /* @__PURE__ */ d(function(e, t = null) {
  var r, i;
  try {
    const n = new RegExp(
      `[%]{2}(?![{]${zC.source})(?=[}][%]{2}).*
`,
      "ig"
    );
    e = e.trim().replace(n, "").replace(/'/gm, '"'), E.debug(
      `Detecting diagram directive${t !== null ? " type:" + t : ""} based on the text:${e}`
    );
    let a;
    const o = [];
    for (; (a = Gr.exec(e)) !== null; )
      if (a.index === Gr.lastIndex && Gr.lastIndex++, a && !t || t && ((r = a[1]) != null && r.match(t)) || t && ((i = a[2]) != null && i.match(t))) {
        const s = a[1] ? a[1] : a[2], c = a[3] ? a[3].trim() : a[4] ? JSON.parse(a[4].trim()) : null;
        o.push({ type: s, args: c });
      }
    return o.length === 0 ? { type: e, args: null } : o.length === 1 ? o[0] : o;
  } catch (n) {
    return E.error(
      `ERROR: ${n.message} - Unable to parse directive type: '${t}' based on the text: '${e}'`
    ), { type: void 0, args: null };
  }
}, "detectDirective"), WC = /* @__PURE__ */ d(function(e) {
  return e.replace(Gr, "");
}, "removeDirectives"), HC = /* @__PURE__ */ d(function(e, t) {
  for (const [r, i] of t.entries())
    if (i.match(e))
      return r;
  return -1;
}, "isSubstringInArray");
function zs(e, t) {
  if (!e)
    return t;
  const r = `curve${e.charAt(0).toUpperCase() + e.slice(1)}`;
  return NC[r] ?? t;
}
d(zs, "interpolateToCurve");
function Vu(e, t) {
  const r = e.trim();
  if (r)
    return t.securityLevel !== "loose" ? Ph(r) : r;
}
d(Vu, "formatUrl");
var jC = /* @__PURE__ */ d((e, ...t) => {
  const r = e.split("."), i = r.length - 1, n = r[i];
  let a = window;
  for (let o = 0; o < i; o++)
    if (a = a[r[o]], !a) {
      E.error(`Function name: ${e} not found in window`);
      return;
    }
  a[n](...t);
}, "runFunc");
function qs(e, t) {
  return !e || !t ? 0 : Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
}
d(qs, "distance");
function Zu(e) {
  let t, r = 0;
  e.forEach((n) => {
    r += qs(n, t), t = n;
  });
  const i = r / 2;
  return Ws(e, i);
}
d(Zu, "traverseEdge");
function Ku(e) {
  return e.length === 1 ? e[0] : Zu(e);
}
d(Ku, "calcLabelPosition");
var il = /* @__PURE__ */ d((e, t = 2) => {
  const r = Math.pow(10, t);
  return Math.round(e * r) / r;
}, "roundNumber"), Ws = /* @__PURE__ */ d((e, t) => {
  let r, i = t;
  for (const n of e) {
    if (r) {
      const a = qs(n, r);
      if (a === 0)
        return r;
      if (a < i)
        i -= a;
      else {
        const o = i / a;
        if (o <= 0)
          return r;
        if (o >= 1)
          return { x: n.x, y: n.y };
        if (o > 0 && o < 1)
          return {
            x: il((1 - o) * r.x + o * n.x, 5),
            y: il((1 - o) * r.y + o * n.y, 5)
          };
      }
    }
    r = n;
  }
  throw new Error("Could not find a suitable point for the given distance");
}, "calculatePoint"), YC = /* @__PURE__ */ d((e, t, r) => {
  E.info(`our points ${JSON.stringify(t)}`), t[0] !== r && (t = t.reverse());
  const n = Ws(t, 25), a = e ? 10 : 5, o = Math.atan2(t[0].y - n.y, t[0].x - n.x), s = { x: 0, y: 0 };
  return s.x = Math.sin(o) * a + (t[0].x + n.x) / 2, s.y = -Math.cos(o) * a + (t[0].y + n.y) / 2, s;
}, "calcCardinalityPosition");
function Qu(e, t, r) {
  const i = structuredClone(r);
  E.info("our points", i), t !== "start_left" && t !== "start_right" && i.reverse();
  const n = 25 + e, a = Ws(i, n), o = 10 + e * 0.5, s = Math.atan2(i[0].y - a.y, i[0].x - a.x), c = { x: 0, y: 0 };
  return t === "start_left" ? (c.x = Math.sin(s + Math.PI) * o + (i[0].x + a.x) / 2, c.y = -Math.cos(s + Math.PI) * o + (i[0].y + a.y) / 2) : t === "end_right" ? (c.x = Math.sin(s - Math.PI) * o + (i[0].x + a.x) / 2 - 5, c.y = -Math.cos(s - Math.PI) * o + (i[0].y + a.y) / 2 - 5) : t === "end_left" ? (c.x = Math.sin(s) * o + (i[0].x + a.x) / 2 - 5, c.y = -Math.cos(s) * o + (i[0].y + a.y) / 2 - 5) : (c.x = Math.sin(s) * o + (i[0].x + a.x) / 2, c.y = -Math.cos(s) * o + (i[0].y + a.y) / 2), c;
}
d(Qu, "calcTerminalLabelPosition");
function Ju(e) {
  let t = "", r = "";
  for (const i of e)
    i !== void 0 && (i.startsWith("color:") || i.startsWith("text-align:") ? r = r + i + ";" : t = t + i + ";");
  return { style: t, labelStyle: r };
}
d(Ju, "getStylesFromArray");
var nl = 0, GC = /* @__PURE__ */ d(() => (nl++, "id-" + Math.random().toString(36).substr(2, 12) + "-" + nl), "generateId");
function tf(e) {
  let t = "";
  const r = "0123456789abcdef", i = r.length;
  for (let n = 0; n < e; n++)
    t += r.charAt(Math.floor(Math.random() * i));
  return t;
}
d(tf, "makeRandomHex");
var UC = /* @__PURE__ */ d((e) => tf(e.length), "random"), XC = /* @__PURE__ */ d(function() {
  return {
    x: 0,
    y: 0,
    fill: void 0,
    anchor: "start",
    style: "#666",
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0,
    valign: void 0,
    text: ""
  };
}, "getTextObj"), VC = /* @__PURE__ */ d(function(e, t) {
  const r = t.text.replace(kr.lineBreakRegex, " "), [, i] = qn(t.fontSize), n = e.append("text");
  n.attr("x", t.x), n.attr("y", t.y), n.style("text-anchor", t.anchor), n.style("font-family", t.fontFamily), n.style("font-size", i), n.style("font-weight", t.fontWeight), n.attr("fill", t.fill), t.class !== void 0 && n.attr("class", t.class);
  const a = n.append("tspan");
  return a.attr("x", t.x + t.textMargin * 2), a.attr("fill", t.fill), a.text(r), n;
}, "drawSimpleText"), ZC = pi(
  (e, t, r) => {
    if (!e || (r = Object.assign(
      { fontSize: 12, fontWeight: 400, fontFamily: "Arial", joinWith: "<br/>" },
      r
    ), kr.lineBreakRegex.test(e)))
      return e;
    const i = e.split(" ").filter(Boolean), n = [];
    let a = "";
    return i.forEach((o, s) => {
      const c = ue(`${o} `, r), l = ue(a, r);
      if (c > t) {
        const { hyphenatedStrings: f, remainingWord: p } = KC(o, t, "-", r);
        n.push(a, ...f), a = p;
      } else l + c >= t ? (n.push(a), a = o) : a = [a, o].filter(Boolean).join(" ");
      s + 1 === i.length && n.push(a);
    }), n.filter((o) => o !== "").join(r.joinWith);
  },
  (e, t, r) => `${e}${t}${r.fontSize}${r.fontWeight}${r.fontFamily}${r.joinWith}`
), KC = pi(
  (e, t, r = "-", i) => {
    i = Object.assign(
      { fontSize: 12, fontWeight: 400, fontFamily: "Arial", margin: 0 },
      i
    );
    const n = [...e], a = [];
    let o = "";
    return n.forEach((s, c) => {
      const l = `${o}${s}`;
      if (ue(l, i) >= t) {
        const u = c + 1, f = n.length === u, p = `${l}${r}`;
        a.push(f ? l : p), o = "";
      } else
        o = l;
    }), { hyphenatedStrings: a, remainingWord: o };
  },
  (e, t, r = "-", i) => `${e}${t}${r}${i.fontSize}${i.fontWeight}${i.fontFamily}`
);
function ef(e, t) {
  return Hs(e, t).height;
}
d(ef, "calculateTextHeight");
function ue(e, t) {
  return Hs(e, t).width;
}
d(ue, "calculateTextWidth");
var Hs = pi(
  (e, t) => {
    const { fontSize: r = 12, fontFamily: i = "Arial", fontWeight: n = 400 } = t;
    if (!e)
      return { width: 0, height: 0 };
    const [, a] = qn(r), o = ["sans-serif", i], s = e.split(kr.lineBreakRegex), c = [], l = et("body");
    if (!l.remove)
      return { width: 0, height: 0, lineHeight: 0 };
    const h = l.append("svg");
    for (const f of o) {
      let p = 0;
      const g = { width: 0, height: 0, lineHeight: 0 };
      for (const m of s) {
        const y = XC();
        y.text = m || PC;
        const x = VC(h, y).style("font-size", a).style("font-weight", n).style("font-family", f), b = (x._groups || x)[0][0].getBBox();
        if (b.width === 0 && b.height === 0)
          throw new Error("svg element not in render tree");
        g.width = Math.round(Math.max(g.width, b.width)), p = Math.round(b.height), g.height += p, g.lineHeight = Math.round(Math.max(g.lineHeight, p));
      }
      c.push(g);
    }
    h.remove();
    const u = isNaN(c[1].height) || isNaN(c[1].width) || isNaN(c[1].lineHeight) || c[0].height > c[1].height && c[0].width > c[1].width && c[0].lineHeight > c[1].lineHeight ? 0 : 1;
    return c[u];
  },
  (e, t) => `${e}${t.fontSize}${t.fontWeight}${t.fontFamily}`
), ur, QC = (ur = class {
  constructor(t = !1, r) {
    this.count = 0, this.count = r ? r.length : 0, this.next = t ? () => this.count++ : () => Date.now();
  }
}, d(ur, "InitIDGenerator"), ur), wi, JC = /* @__PURE__ */ d(function(e) {
  return wi = wi || document.createElement("div"), e = escape(e).replace(/%26/g, "&").replace(/%23/g, "#").replace(/%3B/g, ";"), wi.innerHTML = e, unescape(wi.textContent);
}, "entityDecode");
function js(e) {
  return "str" in e;
}
d(js, "isDetailedError");
var t_ = /* @__PURE__ */ d((e, t, r, i) => {
  var a;
  if (!i)
    return;
  const n = (a = e.node()) == null ? void 0 : a.getBBox();
  n && e.append("text").text(i).attr("text-anchor", "middle").attr("x", n.x + n.width / 2).attr("y", -r).attr("class", t);
}, "insertTitle"), qn = /* @__PURE__ */ d((e) => {
  if (typeof e == "number")
    return [e, e + "px"];
  const t = parseInt(e ?? "", 10);
  return Number.isNaN(t) ? [void 0, void 0] : e === String(t) ? [t, e + "px"] : [t, e];
}, "parseFontSize");
function Ys(e, t) {
  return IC({}, e, t);
}
d(Ys, "cleanAndMerge");
var Vt = {
  assignWithDepth: Ct,
  wrapLabel: ZC,
  calculateTextHeight: ef,
  calculateTextWidth: ue,
  calculateTextDimensions: Hs,
  cleanAndMerge: Ys,
  detectInit: qC,
  detectDirective: Xu,
  isSubstringInArray: HC,
  interpolateToCurve: zs,
  calcLabelPosition: Ku,
  calcCardinalityPosition: YC,
  calcTerminalLabelPosition: Qu,
  formatUrl: Vu,
  getStylesFromArray: Ju,
  generateId: GC,
  random: UC,
  runFunc: jC,
  entityDecode: JC,
  insertTitle: t_,
  parseFontSize: qn,
  InitIDGenerator: QC
}, e_ = /* @__PURE__ */ d(function(e) {
  let t = e;
  return t = t.replace(/style.*:\S*#.*;/g, function(r) {
    return r.substring(0, r.length - 1);
  }), t = t.replace(/classDef.*:\S*#.*;/g, function(r) {
    return r.substring(0, r.length - 1);
  }), t = t.replace(/#\w+;/g, function(r) {
    const i = r.substring(1, r.length - 1);
    return /^\+?\d+$/.test(i) ? "ﬂ°°" + i + "¶ß" : "ﬂ°" + i + "¶ß";
  }), t;
}, "encodeEntities"), Xe = /* @__PURE__ */ d(function(e) {
  return e.replace(/ﬂ°°/g, "&#").replace(/ﬂ°/g, "&").replace(/¶ß/g, ";");
}, "decodeEntities"), AT = /* @__PURE__ */ d((e, t, {
  counter: r = 0,
  prefix: i,
  suffix: n
}, a) => a || `${i ? `${i}_` : ""}${e}_${t}_${r}${n ? `_${n}` : ""}`, "getEdgeId");
function Lt(e) {
  return e ?? null;
}
d(Lt, "handleUndefinedAttr");
function Gs() {
  return {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null
  };
}
var Ve = Gs();
function rf(e) {
  Ve = e;
}
var Vr = { exec: () => null };
function st(e, t = "") {
  let r = typeof e == "string" ? e : e.source;
  const i = {
    replace: (n, a) => {
      let o = typeof a == "string" ? a : a.source;
      return o = o.replace(Bt.caret, "$1"), r = r.replace(n, o), i;
    },
    getRegex: () => new RegExp(r, t)
  };
  return i;
}
var Bt = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (e) => new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}#`),
  htmlBeginRegex: (e) => new RegExp(`^ {0,${Math.min(3, e - 1)}}<(?:[a-z].*>|!--)`, "i")
}, r_ = /^(?:[ \t]*(?:\n|$))+/, i_ = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, n_ = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, gi = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, a_ = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Us = /(?:[*+-]|\d{1,9}[.)])/, nf = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, af = st(nf).replace(/bull/g, Us).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), s_ = st(nf).replace(/bull/g, Us).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Xs = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, o_ = /^[^\n]+/, Vs = /(?!\s*\])(?:\\.|[^\[\]\\])+/, l_ = st(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Vs).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), c_ = st(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, Us).getRegex(), Wn = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Zs = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, h_ = st(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", Zs).replace("tag", Wn).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), sf = st(Xs).replace("hr", gi).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wn).getRegex(), u_ = st(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", sf).getRegex(), Ks = {
  blockquote: u_,
  code: i_,
  def: l_,
  fences: n_,
  heading: a_,
  hr: gi,
  html: h_,
  lheading: af,
  list: c_,
  newline: r_,
  paragraph: sf,
  table: Vr,
  text: o_
}, al = st(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", gi).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wn).getRegex(), f_ = {
  ...Ks,
  lheading: s_,
  table: al,
  paragraph: st(Xs).replace("hr", gi).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", al).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Wn).getRegex()
}, p_ = {
  ...Ks,
  html: st(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", Zs).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: Vr,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: st(Xs).replace("hr", gi).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", af).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, d_ = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, g_ = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, of = /^( {2,}|\\)\n(?!\s*$)/, m_ = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Hn = /[\p{P}\p{S}]/u, Qs = /[\s\p{P}\p{S}]/u, lf = /[^\s\p{P}\p{S}]/u, y_ = st(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Qs).getRegex(), cf = /(?!~)[\p{P}\p{S}]/u, x_ = /(?!~)[\s\p{P}\p{S}]/u, b_ = /(?:[^\s\p{P}\p{S}]|~)/u, C_ = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g, hf = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/, __ = st(hf, "u").replace(/punct/g, Hn).getRegex(), w_ = st(hf, "u").replace(/punct/g, cf).getRegex(), uf = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", k_ = st(uf, "gu").replace(/notPunctSpace/g, lf).replace(/punctSpace/g, Qs).replace(/punct/g, Hn).getRegex(), v_ = st(uf, "gu").replace(/notPunctSpace/g, b_).replace(/punctSpace/g, x_).replace(/punct/g, cf).getRegex(), S_ = st(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, lf).replace(/punctSpace/g, Qs).replace(/punct/g, Hn).getRegex(), T_ = st(/\\(punct)/, "gu").replace(/punct/g, Hn).getRegex(), B_ = st(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), L_ = st(Zs).replace("(?:-->|$)", "-->").getRegex(), M_ = st(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", L_).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), dn = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/, A_ = st(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", dn).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), ff = st(/^!?\[(label)\]\[(ref)\]/).replace("label", dn).replace("ref", Vs).getRegex(), pf = st(/^!?\[(ref)\](?:\[\])?/).replace("ref", Vs).getRegex(), $_ = st("reflink|nolink(?!\\()", "g").replace("reflink", ff).replace("nolink", pf).getRegex(), Js = {
  _backpedal: Vr,
  // only used for GFM url
  anyPunctuation: T_,
  autolink: B_,
  blockSkip: C_,
  br: of,
  code: g_,
  del: Vr,
  emStrongLDelim: __,
  emStrongRDelimAst: k_,
  emStrongRDelimUnd: S_,
  escape: d_,
  link: A_,
  nolink: pf,
  punctuation: y_,
  reflink: ff,
  reflinkSearch: $_,
  tag: M_,
  text: m_,
  url: Vr
}, F_ = {
  ...Js,
  link: st(/^!?\[(label)\]\((.*?)\)/).replace("label", dn).getRegex(),
  reflink: st(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", dn).getRegex()
}, ja = {
  ...Js,
  emStrongRDelimAst: v_,
  emStrongLDelim: w_,
  url: st(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
}, E_ = {
  ...ja,
  br: st(of).replace("{2,}", "*").getRegex(),
  text: st(ja.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, ki = {
  normal: Ks,
  gfm: f_,
  pedantic: p_
}, Fr = {
  normal: Js,
  gfm: ja,
  breaks: E_,
  pedantic: F_
}, O_ = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}, sl = (e) => O_[e];
function Gt(e, t) {
  if (t) {
    if (Bt.escapeTest.test(e))
      return e.replace(Bt.escapeReplace, sl);
  } else if (Bt.escapeTestNoEncode.test(e))
    return e.replace(Bt.escapeReplaceNoEncode, sl);
  return e;
}
function ol(e) {
  try {
    e = encodeURI(e).replace(Bt.percentDecode, "%");
  } catch {
    return null;
  }
  return e;
}
function ll(e, t) {
  var a;
  const r = e.replace(Bt.findPipe, (o, s, c) => {
    let l = !1, h = s;
    for (; --h >= 0 && c[h] === "\\"; ) l = !l;
    return l ? "|" : " |";
  }), i = r.split(Bt.splitPipe);
  let n = 0;
  if (i[0].trim() || i.shift(), i.length > 0 && !((a = i.at(-1)) != null && a.trim()) && i.pop(), t)
    if (i.length > t)
      i.splice(t);
    else
      for (; i.length < t; ) i.push("");
  for (; n < i.length; n++)
    i[n] = i[n].trim().replace(Bt.slashPipe, "|");
  return i;
}
function Er(e, t, r) {
  const i = e.length;
  if (i === 0)
    return "";
  let n = 0;
  for (; n < i && e.charAt(i - n - 1) === t; )
    n++;
  return e.slice(0, i - n);
}
function D_(e, t) {
  if (e.indexOf(t[1]) === -1)
    return -1;
  let r = 0;
  for (let i = 0; i < e.length; i++)
    if (e[i] === "\\")
      i++;
    else if (e[i] === t[0])
      r++;
    else if (e[i] === t[1] && (r--, r < 0))
      return i;
  return r > 0 ? -2 : -1;
}
function cl(e, t, r, i, n) {
  const a = t.href, o = t.title || null, s = e[1].replace(n.other.outputLinkReplace, "$1");
  i.state.inLink = !0;
  const c = {
    type: e[0].charAt(0) === "!" ? "image" : "link",
    raw: r,
    href: a,
    title: o,
    text: s,
    tokens: i.inlineTokens(s)
  };
  return i.state.inLink = !1, c;
}
function R_(e, t, r) {
  const i = e.match(r.other.indentCodeCompensation);
  if (i === null)
    return t;
  const n = i[1];
  return t.split(`
`).map((a) => {
    const o = a.match(r.other.beginningSpace);
    if (o === null)
      return a;
    const [s] = o;
    return s.length >= n.length ? a.slice(n.length) : a;
  }).join(`
`);
}
var gn = class {
  // set by the lexer
  constructor(e) {
    lt(this, "options");
    lt(this, "rules");
    // set by the lexer
    lt(this, "lexer");
    this.options = e || Ve;
  }
  space(e) {
    const t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return {
        type: "space",
        raw: t[0]
      };
  }
  code(e) {
    const t = this.rules.block.code.exec(e);
    if (t) {
      const r = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: t[0],
        codeBlockStyle: "indented",
        text: this.options.pedantic ? r : Er(r, `
`)
      };
    }
  }
  fences(e) {
    const t = this.rules.block.fences.exec(e);
    if (t) {
      const r = t[0], i = R_(r, t[3] || "", this.rules);
      return {
        type: "code",
        raw: r,
        lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
        text: i
      };
    }
  }
  heading(e) {
    const t = this.rules.block.heading.exec(e);
    if (t) {
      let r = t[2].trim();
      if (this.rules.other.endingHash.test(r)) {
        const i = Er(r, "#");
        (this.options.pedantic || !i || this.rules.other.endingSpaceChar.test(i)) && (r = i.trim());
      }
      return {
        type: "heading",
        raw: t[0],
        depth: t[1].length,
        text: r,
        tokens: this.lexer.inline(r)
      };
    }
  }
  hr(e) {
    const t = this.rules.block.hr.exec(e);
    if (t)
      return {
        type: "hr",
        raw: Er(t[0], `
`)
      };
  }
  blockquote(e) {
    const t = this.rules.block.blockquote.exec(e);
    if (t) {
      let r = Er(t[0], `
`).split(`
`), i = "", n = "";
      const a = [];
      for (; r.length > 0; ) {
        let o = !1;
        const s = [];
        let c;
        for (c = 0; c < r.length; c++)
          if (this.rules.other.blockquoteStart.test(r[c]))
            s.push(r[c]), o = !0;
          else if (!o)
            s.push(r[c]);
          else
            break;
        r = r.slice(c);
        const l = s.join(`
`), h = l.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        i = i ? `${i}
${l}` : l, n = n ? `${n}
${h}` : h;
        const u = this.lexer.state.top;
        if (this.lexer.state.top = !0, this.lexer.blockTokens(h, a, !0), this.lexer.state.top = u, r.length === 0)
          break;
        const f = a.at(-1);
        if ((f == null ? void 0 : f.type) === "code")
          break;
        if ((f == null ? void 0 : f.type) === "blockquote") {
          const p = f, g = p.raw + `
` + r.join(`
`), m = this.blockquote(g);
          a[a.length - 1] = m, i = i.substring(0, i.length - p.raw.length) + m.raw, n = n.substring(0, n.length - p.text.length) + m.text;
          break;
        } else if ((f == null ? void 0 : f.type) === "list") {
          const p = f, g = p.raw + `
` + r.join(`
`), m = this.list(g);
          a[a.length - 1] = m, i = i.substring(0, i.length - f.raw.length) + m.raw, n = n.substring(0, n.length - p.raw.length) + m.raw, r = g.substring(a.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return {
        type: "blockquote",
        raw: i,
        tokens: a,
        text: n
      };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let r = t[1].trim();
      const i = r.length > 1, n = {
        type: "list",
        raw: "",
        ordered: i,
        start: i ? +r.slice(0, -1) : "",
        loose: !1,
        items: []
      };
      r = i ? `\\d{1,9}\\${r.slice(-1)}` : `\\${r}`, this.options.pedantic && (r = i ? r : "[*+-]");
      const a = this.rules.other.listItemRegex(r);
      let o = !1;
      for (; e; ) {
        let c = !1, l = "", h = "";
        if (!(t = a.exec(e)) || this.rules.block.hr.test(e))
          break;
        l = t[0], e = e.substring(l.length);
        let u = t[2].split(`
`, 1)[0].replace(this.rules.other.listReplaceTabs, (x) => " ".repeat(3 * x.length)), f = e.split(`
`, 1)[0], p = !u.trim(), g = 0;
        if (this.options.pedantic ? (g = 2, h = u.trimStart()) : p ? g = t[1].length + 1 : (g = t[2].search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, h = u.slice(g), g += t[1].length), p && this.rules.other.blankLine.test(f) && (l += f + `
`, e = e.substring(f.length + 1), c = !0), !c) {
          const x = this.rules.other.nextBulletRegex(g), b = this.rules.other.hrRegex(g), _ = this.rules.other.fencesBeginRegex(g), S = this.rules.other.headingBeginRegex(g), k = this.rules.other.htmlBeginRegex(g);
          for (; e; ) {
            const C = e.split(`
`, 1)[0];
            let w;
            if (f = C, this.options.pedantic ? (f = f.replace(this.rules.other.listReplaceNesting, "  "), w = f) : w = f.replace(this.rules.other.tabCharGlobal, "    "), _.test(f) || S.test(f) || k.test(f) || x.test(f) || b.test(f))
              break;
            if (w.search(this.rules.other.nonSpaceChar) >= g || !f.trim())
              h += `
` + w.slice(g);
            else {
              if (p || u.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || _.test(u) || S.test(u) || b.test(u))
                break;
              h += `
` + f;
            }
            !p && !f.trim() && (p = !0), l += C + `
`, e = e.substring(C.length + 1), u = w.slice(g);
          }
        }
        n.loose || (o ? n.loose = !0 : this.rules.other.doubleBlankLine.test(l) && (o = !0));
        let m = null, y;
        this.options.gfm && (m = this.rules.other.listIsTask.exec(h), m && (y = m[0] !== "[ ] ", h = h.replace(this.rules.other.listReplaceTask, ""))), n.items.push({
          type: "list_item",
          raw: l,
          task: !!m,
          checked: y,
          loose: !1,
          text: h,
          tokens: []
        }), n.raw += l;
      }
      const s = n.items.at(-1);
      if (s)
        s.raw = s.raw.trimEnd(), s.text = s.text.trimEnd();
      else
        return;
      n.raw = n.raw.trimEnd();
      for (let c = 0; c < n.items.length; c++)
        if (this.lexer.state.top = !1, n.items[c].tokens = this.lexer.blockTokens(n.items[c].text, []), !n.loose) {
          const l = n.items[c].tokens.filter((u) => u.type === "space"), h = l.length > 0 && l.some((u) => this.rules.other.anyLine.test(u.raw));
          n.loose = h;
        }
      if (n.loose)
        for (let c = 0; c < n.items.length; c++)
          n.items[c].loose = !0;
      return n;
    }
  }
  html(e) {
    const t = this.rules.block.html.exec(e);
    if (t)
      return {
        type: "html",
        block: !0,
        raw: t[0],
        pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
        text: t[0]
      };
  }
  def(e) {
    const t = this.rules.block.def.exec(e);
    if (t) {
      const r = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), i = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", n = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return {
        type: "def",
        tag: r,
        raw: t[0],
        href: i,
        title: n
      };
    }
  }
  table(e) {
    var o;
    const t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    const r = ll(t[1]), i = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), n = (o = t[3]) != null && o.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], a = {
      type: "table",
      raw: t[0],
      header: [],
      align: [],
      rows: []
    };
    if (r.length === i.length) {
      for (const s of i)
        this.rules.other.tableAlignRight.test(s) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(s) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(s) ? a.align.push("left") : a.align.push(null);
      for (let s = 0; s < r.length; s++)
        a.header.push({
          text: r[s],
          tokens: this.lexer.inline(r[s]),
          header: !0,
          align: a.align[s]
        });
      for (const s of n)
        a.rows.push(ll(s, a.header.length).map((c, l) => ({
          text: c,
          tokens: this.lexer.inline(c),
          header: !1,
          align: a.align[l]
        })));
      return a;
    }
  }
  lheading(e) {
    const t = this.rules.block.lheading.exec(e);
    if (t)
      return {
        type: "heading",
        raw: t[0],
        depth: t[2].charAt(0) === "=" ? 1 : 2,
        text: t[1],
        tokens: this.lexer.inline(t[1])
      };
  }
  paragraph(e) {
    const t = this.rules.block.paragraph.exec(e);
    if (t) {
      const r = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return {
        type: "paragraph",
        raw: t[0],
        text: r,
        tokens: this.lexer.inline(r)
      };
    }
  }
  text(e) {
    const t = this.rules.block.text.exec(e);
    if (t)
      return {
        type: "text",
        raw: t[0],
        text: t[0],
        tokens: this.lexer.inline(t[0])
      };
  }
  escape(e) {
    const t = this.rules.inline.escape.exec(e);
    if (t)
      return {
        type: "escape",
        raw: t[0],
        text: t[1]
      };
  }
  tag(e) {
    const t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
        type: "html",
        raw: t[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: !1,
        text: t[0]
      };
  }
  link(e) {
    const t = this.rules.inline.link.exec(e);
    if (t) {
      const r = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(r)) {
        if (!this.rules.other.endAngleBracket.test(r))
          return;
        const a = Er(r.slice(0, -1), "\\");
        if ((r.length - a.length) % 2 === 0)
          return;
      } else {
        const a = D_(t[2], "()");
        if (a === -2)
          return;
        if (a > -1) {
          const s = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + a;
          t[2] = t[2].substring(0, a), t[0] = t[0].substring(0, s).trim(), t[3] = "";
        }
      }
      let i = t[2], n = "";
      if (this.options.pedantic) {
        const a = this.rules.other.pedanticHrefTitle.exec(i);
        a && (i = a[1], n = a[3]);
      } else
        n = t[3] ? t[3].slice(1, -1) : "";
      return i = i.trim(), this.rules.other.startAngleBracket.test(i) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(r) ? i = i.slice(1) : i = i.slice(1, -1)), cl(t, {
        href: i && i.replace(this.rules.inline.anyPunctuation, "$1"),
        title: n && n.replace(this.rules.inline.anyPunctuation, "$1")
      }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let r;
    if ((r = this.rules.inline.reflink.exec(e)) || (r = this.rules.inline.nolink.exec(e))) {
      const i = (r[2] || r[1]).replace(this.rules.other.multipleSpaceGlobal, " "), n = t[i.toLowerCase()];
      if (!n) {
        const a = r[0].charAt(0);
        return {
          type: "text",
          raw: a,
          text: a
        };
      }
      return cl(r, n, r[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, r = "") {
    let i = this.rules.inline.emStrongLDelim.exec(e);
    if (!i || i[3] && r.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(i[1] || i[2] || "") || !r || this.rules.inline.punctuation.exec(r)) {
      const a = [...i[0]].length - 1;
      let o, s, c = a, l = 0;
      const h = i[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (h.lastIndex = 0, t = t.slice(-1 * e.length + a); (i = h.exec(t)) != null; ) {
        if (o = i[1] || i[2] || i[3] || i[4] || i[5] || i[6], !o) continue;
        if (s = [...o].length, i[3] || i[4]) {
          c += s;
          continue;
        } else if ((i[5] || i[6]) && a % 3 && !((a + s) % 3)) {
          l += s;
          continue;
        }
        if (c -= s, c > 0) continue;
        s = Math.min(s, s + c + l);
        const u = [...i[0]][0].length, f = e.slice(0, a + i.index + u + s);
        if (Math.min(a, s) % 2) {
          const g = f.slice(1, -1);
          return {
            type: "em",
            raw: f,
            text: g,
            tokens: this.lexer.inlineTokens(g)
          };
        }
        const p = f.slice(2, -2);
        return {
          type: "strong",
          raw: f,
          text: p,
          tokens: this.lexer.inlineTokens(p)
        };
      }
    }
  }
  codespan(e) {
    const t = this.rules.inline.code.exec(e);
    if (t) {
      let r = t[2].replace(this.rules.other.newLineCharGlobal, " ");
      const i = this.rules.other.nonSpaceChar.test(r), n = this.rules.other.startingSpaceChar.test(r) && this.rules.other.endingSpaceChar.test(r);
      return i && n && (r = r.substring(1, r.length - 1)), {
        type: "codespan",
        raw: t[0],
        text: r
      };
    }
  }
  br(e) {
    const t = this.rules.inline.br.exec(e);
    if (t)
      return {
        type: "br",
        raw: t[0]
      };
  }
  del(e) {
    const t = this.rules.inline.del.exec(e);
    if (t)
      return {
        type: "del",
        raw: t[0],
        text: t[2],
        tokens: this.lexer.inlineTokens(t[2])
      };
  }
  autolink(e) {
    const t = this.rules.inline.autolink.exec(e);
    if (t) {
      let r, i;
      return t[2] === "@" ? (r = t[1], i = "mailto:" + r) : (r = t[1], i = r), {
        type: "link",
        raw: t[0],
        text: r,
        href: i,
        tokens: [
          {
            type: "text",
            raw: r,
            text: r
          }
        ]
      };
    }
  }
  url(e) {
    var r;
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let i, n;
      if (t[2] === "@")
        i = t[0], n = "mailto:" + i;
      else {
        let a;
        do
          a = t[0], t[0] = ((r = this.rules.inline._backpedal.exec(t[0])) == null ? void 0 : r[0]) ?? "";
        while (a !== t[0]);
        i = t[0], t[1] === "www." ? n = "http://" + t[0] : n = t[0];
      }
      return {
        type: "link",
        raw: t[0],
        text: i,
        href: n,
        tokens: [
          {
            type: "text",
            raw: i,
            text: i
          }
        ]
      };
    }
  }
  inlineText(e) {
    const t = this.rules.inline.text.exec(e);
    if (t) {
      const r = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: t[0],
        text: t[0],
        escaped: r
      };
    }
  }
}, se = class Ya {
  constructor(t) {
    lt(this, "tokens");
    lt(this, "options");
    lt(this, "state");
    lt(this, "tokenizer");
    lt(this, "inlineQueue");
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = t || Ve, this.options.tokenizer = this.options.tokenizer || new gn(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
      inLink: !1,
      inRawBlock: !1,
      top: !0
    };
    const r = {
      other: Bt,
      block: ki.normal,
      inline: Fr.normal
    };
    this.options.pedantic ? (r.block = ki.pedantic, r.inline = Fr.pedantic) : this.options.gfm && (r.block = ki.gfm, this.options.breaks ? r.inline = Fr.breaks : r.inline = Fr.gfm), this.tokenizer.rules = r;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block: ki,
      inline: Fr
    };
  }
  /**
   * Static Lex Method
   */
  static lex(t, r) {
    return new Ya(r).lex(t);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(t, r) {
    return new Ya(r).inlineTokens(t);
  }
  /**
   * Preprocessing
   */
  lex(t) {
    t = t.replace(Bt.carriageReturn, `
`), this.blockTokens(t, this.tokens);
    for (let r = 0; r < this.inlineQueue.length; r++) {
      const i = this.inlineQueue[r];
      this.inlineTokens(i.src, i.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(t, r = [], i = !1) {
    var n, a, o;
    for (this.options.pedantic && (t = t.replace(Bt.tabCharGlobal, "    ").replace(Bt.spaceLine, "")); t; ) {
      let s;
      if ((a = (n = this.options.extensions) == null ? void 0 : n.block) != null && a.some((l) => (s = l.call({ lexer: this }, t, r)) ? (t = t.substring(s.raw.length), r.push(s), !0) : !1))
        continue;
      if (s = this.tokenizer.space(t)) {
        t = t.substring(s.raw.length);
        const l = r.at(-1);
        s.raw.length === 1 && l !== void 0 ? l.raw += `
` : r.push(s);
        continue;
      }
      if (s = this.tokenizer.code(t)) {
        t = t.substring(s.raw.length);
        const l = r.at(-1);
        (l == null ? void 0 : l.type) === "paragraph" || (l == null ? void 0 : l.type) === "text" ? (l.raw += `
` + s.raw, l.text += `
` + s.text, this.inlineQueue.at(-1).src = l.text) : r.push(s);
        continue;
      }
      if (s = this.tokenizer.fences(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.heading(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.hr(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.blockquote(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.list(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.html(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.def(t)) {
        t = t.substring(s.raw.length);
        const l = r.at(-1);
        (l == null ? void 0 : l.type) === "paragraph" || (l == null ? void 0 : l.type) === "text" ? (l.raw += `
` + s.raw, l.text += `
` + s.raw, this.inlineQueue.at(-1).src = l.text) : this.tokens.links[s.tag] || (this.tokens.links[s.tag] = {
          href: s.href,
          title: s.title
        });
        continue;
      }
      if (s = this.tokenizer.table(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      if (s = this.tokenizer.lheading(t)) {
        t = t.substring(s.raw.length), r.push(s);
        continue;
      }
      let c = t;
      if ((o = this.options.extensions) != null && o.startBlock) {
        let l = 1 / 0;
        const h = t.slice(1);
        let u;
        this.options.extensions.startBlock.forEach((f) => {
          u = f.call({ lexer: this }, h), typeof u == "number" && u >= 0 && (l = Math.min(l, u));
        }), l < 1 / 0 && l >= 0 && (c = t.substring(0, l + 1));
      }
      if (this.state.top && (s = this.tokenizer.paragraph(c))) {
        const l = r.at(-1);
        i && (l == null ? void 0 : l.type) === "paragraph" ? (l.raw += `
` + s.raw, l.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = l.text) : r.push(s), i = c.length !== t.length, t = t.substring(s.raw.length);
        continue;
      }
      if (s = this.tokenizer.text(t)) {
        t = t.substring(s.raw.length);
        const l = r.at(-1);
        (l == null ? void 0 : l.type) === "text" ? (l.raw += `
` + s.raw, l.text += `
` + s.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = l.text) : r.push(s);
        continue;
      }
      if (t) {
        const l = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(l);
          break;
        } else
          throw new Error(l);
      }
    }
    return this.state.top = !0, r;
  }
  inline(t, r = []) {
    return this.inlineQueue.push({ src: t, tokens: r }), r;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(t, r = []) {
    var s, c, l;
    let i = t, n = null;
    if (this.tokens.links) {
      const h = Object.keys(this.tokens.links);
      if (h.length > 0)
        for (; (n = this.tokenizer.rules.inline.reflinkSearch.exec(i)) != null; )
          h.includes(n[0].slice(n[0].lastIndexOf("[") + 1, -1)) && (i = i.slice(0, n.index) + "[" + "a".repeat(n[0].length - 2) + "]" + i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (n = this.tokenizer.rules.inline.anyPunctuation.exec(i)) != null; )
      i = i.slice(0, n.index) + "++" + i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    for (; (n = this.tokenizer.rules.inline.blockSkip.exec(i)) != null; )
      i = i.slice(0, n.index) + "[" + "a".repeat(n[0].length - 2) + "]" + i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    let a = !1, o = "";
    for (; t; ) {
      a || (o = ""), a = !1;
      let h;
      if ((c = (s = this.options.extensions) == null ? void 0 : s.inline) != null && c.some((f) => (h = f.call({ lexer: this }, t, r)) ? (t = t.substring(h.raw.length), r.push(h), !0) : !1))
        continue;
      if (h = this.tokenizer.escape(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.tag(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.link(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.reflink(t, this.tokens.links)) {
        t = t.substring(h.raw.length);
        const f = r.at(-1);
        h.type === "text" && (f == null ? void 0 : f.type) === "text" ? (f.raw += h.raw, f.text += h.text) : r.push(h);
        continue;
      }
      if (h = this.tokenizer.emStrong(t, i, o)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.codespan(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.br(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.del(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (h = this.tokenizer.autolink(t)) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      if (!this.state.inLink && (h = this.tokenizer.url(t))) {
        t = t.substring(h.raw.length), r.push(h);
        continue;
      }
      let u = t;
      if ((l = this.options.extensions) != null && l.startInline) {
        let f = 1 / 0;
        const p = t.slice(1);
        let g;
        this.options.extensions.startInline.forEach((m) => {
          g = m.call({ lexer: this }, p), typeof g == "number" && g >= 0 && (f = Math.min(f, g));
        }), f < 1 / 0 && f >= 0 && (u = t.substring(0, f + 1));
      }
      if (h = this.tokenizer.inlineText(u)) {
        t = t.substring(h.raw.length), h.raw.slice(-1) !== "_" && (o = h.raw.slice(-1)), a = !0;
        const f = r.at(-1);
        (f == null ? void 0 : f.type) === "text" ? (f.raw += h.raw, f.text += h.text) : r.push(h);
        continue;
      }
      if (t) {
        const f = "Infinite loop on byte: " + t.charCodeAt(0);
        if (this.options.silent) {
          console.error(f);
          break;
        } else
          throw new Error(f);
      }
    }
    return r;
  }
}, mn = class {
  // set by the parser
  constructor(e) {
    lt(this, "options");
    lt(this, "parser");
    this.options = e || Ve;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: r }) {
    var a;
    const i = (a = (t || "").match(Bt.notSpaceStart)) == null ? void 0 : a[0], n = e.replace(Bt.endingNewline, "") + `
`;
    return i ? '<pre><code class="language-' + Gt(i) + '">' + (r ? n : Gt(n, !0)) + `</code></pre>
` : "<pre><code>" + (r ? n : Gt(n, !0)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    const t = e.ordered, r = e.start;
    let i = "";
    for (let o = 0; o < e.items.length; o++) {
      const s = e.items[o];
      i += this.listitem(s);
    }
    const n = t ? "ol" : "ul", a = t && r !== 1 ? ' start="' + r + '"' : "";
    return "<" + n + a + `>
` + i + "</" + n + `>
`;
  }
  listitem(e) {
    var r;
    let t = "";
    if (e.task) {
      const i = this.checkbox({ checked: !!e.checked });
      e.loose ? ((r = e.tokens[0]) == null ? void 0 : r.type) === "paragraph" ? (e.tokens[0].text = i + " " + e.tokens[0].text, e.tokens[0].tokens && e.tokens[0].tokens.length > 0 && e.tokens[0].tokens[0].type === "text" && (e.tokens[0].tokens[0].text = i + " " + Gt(e.tokens[0].tokens[0].text), e.tokens[0].tokens[0].escaped = !0)) : e.tokens.unshift({
        type: "text",
        raw: i + " ",
        text: i + " ",
        escaped: !0
      }) : t += i + " ";
    }
    return t += this.parser.parse(e.tokens, !!e.loose), `<li>${t}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", r = "";
    for (let n = 0; n < e.header.length; n++)
      r += this.tablecell(e.header[n]);
    t += this.tablerow({ text: r });
    let i = "";
    for (let n = 0; n < e.rows.length; n++) {
      const a = e.rows[n];
      r = "";
      for (let o = 0; o < a.length; o++)
        r += this.tablecell(a[o]);
      i += this.tablerow({ text: r });
    }
    return i && (i = `<tbody>${i}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + i + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    const t = this.parser.parseInline(e.tokens), r = e.header ? "th" : "td";
    return (e.align ? `<${r} align="${e.align}">` : `<${r}>`) + t + `</${r}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${Gt(e, !0)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: r }) {
    const i = this.parser.parseInline(r), n = ol(e);
    if (n === null)
      return i;
    e = n;
    let a = '<a href="' + e + '"';
    return t && (a += ' title="' + Gt(t) + '"'), a += ">" + i + "</a>", a;
  }
  image({ href: e, title: t, text: r, tokens: i }) {
    i && (r = this.parser.parseInline(i, this.parser.textRenderer));
    const n = ol(e);
    if (n === null)
      return Gt(r);
    e = n;
    let a = `<img src="${e}" alt="${r}"`;
    return t && (a += ` title="${Gt(t)}"`), a += ">", a;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Gt(e.text);
  }
}, to = class {
  // no need for block level renderers
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
}, oe = class Ga {
  constructor(t) {
    lt(this, "options");
    lt(this, "renderer");
    lt(this, "textRenderer");
    this.options = t || Ve, this.options.renderer = this.options.renderer || new mn(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new to();
  }
  /**
   * Static Parse Method
   */
  static parse(t, r) {
    return new Ga(r).parse(t);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(t, r) {
    return new Ga(r).parseInline(t);
  }
  /**
   * Parse Loop
   */
  parse(t, r = !0) {
    var n, a;
    let i = "";
    for (let o = 0; o < t.length; o++) {
      const s = t[o];
      if ((a = (n = this.options.extensions) == null ? void 0 : n.renderers) != null && a[s.type]) {
        const l = s, h = this.options.extensions.renderers[l.type].call({ parser: this }, l);
        if (h !== !1 || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(l.type)) {
          i += h || "";
          continue;
        }
      }
      const c = s;
      switch (c.type) {
        case "space": {
          i += this.renderer.space(c);
          continue;
        }
        case "hr": {
          i += this.renderer.hr(c);
          continue;
        }
        case "heading": {
          i += this.renderer.heading(c);
          continue;
        }
        case "code": {
          i += this.renderer.code(c);
          continue;
        }
        case "table": {
          i += this.renderer.table(c);
          continue;
        }
        case "blockquote": {
          i += this.renderer.blockquote(c);
          continue;
        }
        case "list": {
          i += this.renderer.list(c);
          continue;
        }
        case "html": {
          i += this.renderer.html(c);
          continue;
        }
        case "paragraph": {
          i += this.renderer.paragraph(c);
          continue;
        }
        case "text": {
          let l = c, h = this.renderer.text(l);
          for (; o + 1 < t.length && t[o + 1].type === "text"; )
            l = t[++o], h += `
` + this.renderer.text(l);
          r ? i += this.renderer.paragraph({
            type: "paragraph",
            raw: h,
            text: h,
            tokens: [{ type: "text", raw: h, text: h, escaped: !0 }]
          }) : i += h;
          continue;
        }
        default: {
          const l = 'Token with "' + c.type + '" type was not found.';
          if (this.options.silent)
            return console.error(l), "";
          throw new Error(l);
        }
      }
    }
    return i;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(t, r = this.renderer) {
    var n, a;
    let i = "";
    for (let o = 0; o < t.length; o++) {
      const s = t[o];
      if ((a = (n = this.options.extensions) == null ? void 0 : n.renderers) != null && a[s.type]) {
        const l = this.options.extensions.renderers[s.type].call({ parser: this }, s);
        if (l !== !1 || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(s.type)) {
          i += l || "";
          continue;
        }
      }
      const c = s;
      switch (c.type) {
        case "escape": {
          i += r.text(c);
          break;
        }
        case "html": {
          i += r.html(c);
          break;
        }
        case "link": {
          i += r.link(c);
          break;
        }
        case "image": {
          i += r.image(c);
          break;
        }
        case "strong": {
          i += r.strong(c);
          break;
        }
        case "em": {
          i += r.em(c);
          break;
        }
        case "codespan": {
          i += r.codespan(c);
          break;
        }
        case "br": {
          i += r.br(c);
          break;
        }
        case "del": {
          i += r.del(c);
          break;
        }
        case "text": {
          i += r.text(c);
          break;
        }
        default: {
          const l = 'Token with "' + c.type + '" type was not found.';
          if (this.options.silent)
            return console.error(l), "";
          throw new Error(l);
        }
      }
    }
    return i;
  }
}, fa, Ri = (fa = class {
  constructor(e) {
    lt(this, "options");
    lt(this, "block");
    this.options = e || Ve;
  }
  /**
   * Process markdown before marked
   */
  preprocess(e) {
    return e;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(e) {
    return e;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(e) {
    return e;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? se.lex : se.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? oe.parse : oe.parseInline;
  }
}, lt(fa, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
])), fa), I_ = class {
  constructor(...e) {
    lt(this, "defaults", Gs());
    lt(this, "options", this.setOptions);
    lt(this, "parse", this.parseMarkdown(!0));
    lt(this, "parseInline", this.parseMarkdown(!1));
    lt(this, "Parser", oe);
    lt(this, "Renderer", mn);
    lt(this, "TextRenderer", to);
    lt(this, "Lexer", se);
    lt(this, "Tokenizer", gn);
    lt(this, "Hooks", Ri);
    this.use(...e);
  }
  /**
   * Run callback for every token
   */
  walkTokens(e, t) {
    var i, n;
    let r = [];
    for (const a of e)
      switch (r = r.concat(t.call(this, a)), a.type) {
        case "table": {
          const o = a;
          for (const s of o.header)
            r = r.concat(this.walkTokens(s.tokens, t));
          for (const s of o.rows)
            for (const c of s)
              r = r.concat(this.walkTokens(c.tokens, t));
          break;
        }
        case "list": {
          const o = a;
          r = r.concat(this.walkTokens(o.items, t));
          break;
        }
        default: {
          const o = a;
          (n = (i = this.defaults.extensions) == null ? void 0 : i.childTokens) != null && n[o.type] ? this.defaults.extensions.childTokens[o.type].forEach((s) => {
            const c = o[s].flat(1 / 0);
            r = r.concat(this.walkTokens(c, t));
          }) : o.tokens && (r = r.concat(this.walkTokens(o.tokens, t)));
        }
      }
    return r;
  }
  use(...e) {
    const t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((r) => {
      const i = { ...r };
      if (i.async = this.defaults.async || i.async || !1, r.extensions && (r.extensions.forEach((n) => {
        if (!n.name)
          throw new Error("extension name required");
        if ("renderer" in n) {
          const a = t.renderers[n.name];
          a ? t.renderers[n.name] = function(...o) {
            let s = n.renderer.apply(this, o);
            return s === !1 && (s = a.apply(this, o)), s;
          } : t.renderers[n.name] = n.renderer;
        }
        if ("tokenizer" in n) {
          if (!n.level || n.level !== "block" && n.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          const a = t[n.level];
          a ? a.unshift(n.tokenizer) : t[n.level] = [n.tokenizer], n.start && (n.level === "block" ? t.startBlock ? t.startBlock.push(n.start) : t.startBlock = [n.start] : n.level === "inline" && (t.startInline ? t.startInline.push(n.start) : t.startInline = [n.start]));
        }
        "childTokens" in n && n.childTokens && (t.childTokens[n.name] = n.childTokens);
      }), i.extensions = t), r.renderer) {
        const n = this.defaults.renderer || new mn(this.defaults);
        for (const a in r.renderer) {
          if (!(a in n))
            throw new Error(`renderer '${a}' does not exist`);
          if (["options", "parser"].includes(a))
            continue;
          const o = a, s = r.renderer[o], c = n[o];
          n[o] = (...l) => {
            let h = s.apply(n, l);
            return h === !1 && (h = c.apply(n, l)), h || "";
          };
        }
        i.renderer = n;
      }
      if (r.tokenizer) {
        const n = this.defaults.tokenizer || new gn(this.defaults);
        for (const a in r.tokenizer) {
          if (!(a in n))
            throw new Error(`tokenizer '${a}' does not exist`);
          if (["options", "rules", "lexer"].includes(a))
            continue;
          const o = a, s = r.tokenizer[o], c = n[o];
          n[o] = (...l) => {
            let h = s.apply(n, l);
            return h === !1 && (h = c.apply(n, l)), h;
          };
        }
        i.tokenizer = n;
      }
      if (r.hooks) {
        const n = this.defaults.hooks || new Ri();
        for (const a in r.hooks) {
          if (!(a in n))
            throw new Error(`hook '${a}' does not exist`);
          if (["options", "block"].includes(a))
            continue;
          const o = a, s = r.hooks[o], c = n[o];
          Ri.passThroughHooks.has(a) ? n[o] = (l) => {
            if (this.defaults.async)
              return Promise.resolve(s.call(n, l)).then((u) => c.call(n, u));
            const h = s.call(n, l);
            return c.call(n, h);
          } : n[o] = (...l) => {
            let h = s.apply(n, l);
            return h === !1 && (h = c.apply(n, l)), h;
          };
        }
        i.hooks = n;
      }
      if (r.walkTokens) {
        const n = this.defaults.walkTokens, a = r.walkTokens;
        i.walkTokens = function(o) {
          let s = [];
          return s.push(a.call(this, o)), n && (s = s.concat(n.call(this, o))), s;
        };
      }
      this.defaults = { ...this.defaults, ...i };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return se.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return oe.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (r, i) => {
      const n = { ...i }, a = { ...this.defaults, ...n }, o = this.onError(!!a.silent, !!a.async);
      if (this.defaults.async === !0 && n.async === !1)
        return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof r > "u" || r === null)
        return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof r != "string")
        return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(r) + ", string expected"));
      a.hooks && (a.hooks.options = a, a.hooks.block = e);
      const s = a.hooks ? a.hooks.provideLexer() : e ? se.lex : se.lexInline, c = a.hooks ? a.hooks.provideParser() : e ? oe.parse : oe.parseInline;
      if (a.async)
        return Promise.resolve(a.hooks ? a.hooks.preprocess(r) : r).then((l) => s(l, a)).then((l) => a.hooks ? a.hooks.processAllTokens(l) : l).then((l) => a.walkTokens ? Promise.all(this.walkTokens(l, a.walkTokens)).then(() => l) : l).then((l) => c(l, a)).then((l) => a.hooks ? a.hooks.postprocess(l) : l).catch(o);
      try {
        a.hooks && (r = a.hooks.preprocess(r));
        let l = s(r, a);
        a.hooks && (l = a.hooks.processAllTokens(l)), a.walkTokens && this.walkTokens(l, a.walkTokens);
        let h = c(l, a);
        return a.hooks && (h = a.hooks.postprocess(h)), h;
      } catch (l) {
        return o(l);
      }
    };
  }
  onError(e, t) {
    return (r) => {
      if (r.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        const i = "<p>An error occurred:</p><pre>" + Gt(r.message + "", !0) + "</pre>";
        return t ? Promise.resolve(i) : i;
      }
      if (t)
        return Promise.reject(r);
      throw r;
    };
  }
}, He = new I_();
function at(e, t) {
  return He.parse(e, t);
}
at.options = at.setOptions = function(e) {
  return He.setOptions(e), at.defaults = He.defaults, rf(at.defaults), at;
};
at.getDefaults = Gs;
at.defaults = Ve;
at.use = function(...e) {
  return He.use(...e), at.defaults = He.defaults, rf(at.defaults), at;
};
at.walkTokens = function(e, t) {
  return He.walkTokens(e, t);
};
at.parseInline = He.parseInline;
at.Parser = oe;
at.parser = oe.parse;
at.Renderer = mn;
at.TextRenderer = to;
at.Lexer = se;
at.lexer = se.lex;
at.Tokenizer = gn;
at.Hooks = Ri;
at.parse = at;
at.options;
at.setOptions;
at.use;
at.walkTokens;
at.parseInline;
oe.parse;
se.lex;
function df(e) {
  for (var t = [], r = 1; r < arguments.length; r++)
    t[r - 1] = arguments[r];
  var i = Array.from(typeof e == "string" ? [e] : e);
  i[i.length - 1] = i[i.length - 1].replace(/\r?\n([\t ]*)$/, "");
  var n = i.reduce(function(s, c) {
    var l = c.match(/\n([\t ]+|(?!\s).)/g);
    return l ? s.concat(l.map(function(h) {
      var u, f;
      return (f = (u = h.match(/[\t ]/g)) === null || u === void 0 ? void 0 : u.length) !== null && f !== void 0 ? f : 0;
    })) : s;
  }, []);
  if (n.length) {
    var a = new RegExp(`
[	 ]{` + Math.min.apply(Math, n) + "}", "g");
    i = i.map(function(s) {
      return s.replace(a, `
`);
    });
  }
  i[0] = i[0].replace(/^\r?\n/, "");
  var o = i[0];
  return t.forEach(function(s, c) {
    var l = o.match(/(?:^|\n)( *)$/), h = l ? l[1] : "", u = s;
    typeof s == "string" && s.includes(`
`) && (u = String(s).split(`
`).map(function(f, p) {
      return p === 0 ? f : "" + h + f;
    }).join(`
`)), o += u + i[c + 1];
  }), o;
}
function gf(e, { markdownAutoWrap: t }) {
  const i = e.replace(/<br\/>/g, `
`).replace(/\n{2,}/g, `
`), n = df(i);
  return t === !1 ? n.replace(/ /g, "&nbsp;") : n;
}
d(gf, "preprocessMarkdown");
function mf(e, t = {}) {
  const r = gf(e, t), i = at.lexer(r), n = [[]];
  let a = 0;
  function o(s, c = "normal") {
    s.type === "text" ? s.text.split(`
`).forEach((h, u) => {
      u !== 0 && (a++, n.push([])), h.split(" ").forEach((f) => {
        f = f.replace(/&#39;/g, "'"), f && n[a].push({ content: f, type: c });
      });
    }) : s.type === "strong" || s.type === "em" ? s.tokens.forEach((l) => {
      o(l, s.type);
    }) : s.type === "html" && n[a].push({ content: s.text, type: "normal" });
  }
  return d(o, "processNode"), i.forEach((s) => {
    var c;
    s.type === "paragraph" ? (c = s.tokens) == null || c.forEach((l) => {
      o(l);
    }) : s.type === "html" && n[a].push({ content: s.text, type: "normal" });
  }), n;
}
d(mf, "markdownToLines");
function yf(e, { markdownAutoWrap: t } = {}) {
  const r = at.lexer(e);
  function i(n) {
    var a, o, s;
    return n.type === "text" ? t === !1 ? n.text.replace(/\n */g, "<br/>").replace(/ /g, "&nbsp;") : n.text.replace(/\n */g, "<br/>") : n.type === "strong" ? `<strong>${(a = n.tokens) == null ? void 0 : a.map(i).join("")}</strong>` : n.type === "em" ? `<em>${(o = n.tokens) == null ? void 0 : o.map(i).join("")}</em>` : n.type === "paragraph" ? `<p>${(s = n.tokens) == null ? void 0 : s.map(i).join("")}</p>` : n.type === "space" ? "" : n.type === "html" ? `${n.text}` : n.type === "escape" ? n.text : `Unsupported markdown: ${n.type}`;
  }
  return d(i, "output"), r.map(i).join("");
}
d(yf, "markdownToHTML");
function xf(e) {
  return Intl.Segmenter ? [...new Intl.Segmenter().segment(e)].map((t) => t.segment) : [...e];
}
d(xf, "splitTextToChars");
function bf(e, t) {
  const r = xf(t.content);
  return eo(e, [], r, t.type);
}
d(bf, "splitWordToFitWidth");
function eo(e, t, r, i) {
  if (r.length === 0)
    return [
      { content: t.join(""), type: i },
      { content: "", type: i }
    ];
  const [n, ...a] = r, o = [...t, n];
  return e([{ content: o.join(""), type: i }]) ? eo(e, o, a, i) : (t.length === 0 && n && (t.push(n), r.shift()), [
    { content: t.join(""), type: i },
    { content: r.join(""), type: i }
  ]);
}
d(eo, "splitWordToFitWidthRecursion");
function Cf(e, t) {
  if (e.some(({ content: r }) => r.includes(`
`)))
    throw new Error("splitLineToFitWidth does not support newlines in the line");
  return yn(e, t);
}
d(Cf, "splitLineToFitWidth");
function yn(e, t, r = [], i = []) {
  if (e.length === 0)
    return i.length > 0 && r.push(i), r.length > 0 ? r : [];
  let n = "";
  e[0].content === " " && (n = " ", e.shift());
  const a = e.shift() ?? { content: " ", type: "normal" }, o = [...i];
  if (n !== "" && o.push({ content: n, type: "normal" }), o.push(a), t(o))
    return yn(e, t, r, o);
  if (i.length > 0)
    r.push(i), e.unshift(a);
  else if (a.content) {
    const [s, c] = bf(t, a);
    r.push([s]), c.content && e.unshift(c);
  }
  return yn(e, t, r);
}
d(yn, "splitLineToFitWidthRecursion");
function Ua(e, t) {
  t && e.attr("style", t);
}
d(Ua, "applyStyle");
async function _f(e, t, r, i, n = !1) {
  const a = e.append("foreignObject");
  a.attr("width", `${10 * r}px`), a.attr("height", `${10 * r}px`);
  const o = a.append("xhtml:div");
  let s = t.label;
  t.label && mr(t.label) && (s = await cs(t.label.replace(kr.lineBreakRegex, `
`), nt()));
  const c = t.isNode ? "nodeLabel" : "edgeLabel", l = o.append("span");
  l.html(s), Ua(l, t.labelStyle), l.attr("class", `${c} ${i}`), Ua(o, t.labelStyle), o.style("display", "table-cell"), o.style("white-space", "nowrap"), o.style("line-height", "1.5"), o.style("max-width", r + "px"), o.style("text-align", "center"), o.attr("xmlns", "http://www.w3.org/1999/xhtml"), n && o.attr("class", "labelBkg");
  let h = o.node().getBoundingClientRect();
  return h.width === r && (o.style("display", "table"), o.style("white-space", "break-spaces"), o.style("width", r + "px"), h = o.node().getBoundingClientRect()), a.node();
}
d(_f, "addHtmlSpan");
function jn(e, t, r) {
  return e.append("tspan").attr("class", "text-outer-tspan").attr("x", 0).attr("y", t * r - 0.1 + "em").attr("dy", r + "em");
}
d(jn, "createTspan");
function wf(e, t, r) {
  const i = e.append("text"), n = jn(i, 1, t);
  Yn(n, r);
  const a = n.node().getComputedTextLength();
  return i.remove(), a;
}
d(wf, "computeWidthOfText");
function P_(e, t, r) {
  var o;
  const i = e.append("text"), n = jn(i, 1, t);
  Yn(n, [{ content: r, type: "normal" }]);
  const a = (o = n.node()) == null ? void 0 : o.getBoundingClientRect();
  return a && i.remove(), a;
}
d(P_, "computeDimensionOfText");
function kf(e, t, r, i = !1) {
  const a = t.append("g"), o = a.insert("rect").attr("class", "background").attr("style", "stroke: none"), s = a.append("text").attr("y", "-10.1");
  let c = 0;
  for (const l of r) {
    const h = /* @__PURE__ */ d((f) => wf(a, 1.1, f) <= e, "checkWidth"), u = h(l) ? [l] : Cf(l, h);
    for (const f of u) {
      const p = jn(s, c, 1.1);
      Yn(p, f), c++;
    }
  }
  if (i) {
    const l = s.node().getBBox(), h = 2;
    return o.attr("x", l.x - h).attr("y", l.y - h).attr("width", l.width + 2 * h).attr("height", l.height + 2 * h), a.node();
  } else
    return s.node();
}
d(kf, "createFormattedText");
function Yn(e, t) {
  e.text(""), t.forEach((r, i) => {
    const n = e.append("tspan").attr("font-style", r.type === "em" ? "italic" : "normal").attr("class", "text-inner-tspan").attr("font-weight", r.type === "strong" ? "bold" : "normal");
    i === 0 ? n.text(r.content) : n.text(" " + r.content);
  });
}
d(Yn, "updateTextContentAndStyles");
function vf(e) {
  return e.replace(
    /fa[bklrs]?:fa-[\w-]+/g,
    // cspell: disable-line
    (t) => `<i class='${t.replace(":", " ")}'></i>`
  );
}
d(vf, "replaceIconSubstring");
var Be = /* @__PURE__ */ d(async (e, t = "", {
  style: r = "",
  isTitle: i = !1,
  classes: n = "",
  useHtmlLabels: a = !0,
  isNode: o = !0,
  width: s = 200,
  addSvgBackground: c = !1
} = {}, l) => {
  if (E.debug(
    "XYZ createText",
    t,
    r,
    i,
    n,
    a,
    o,
    "addSvgBackground: ",
    c
  ), a) {
    const h = yf(t, l), u = vf(Xe(h)), f = t.replace(/\\\\/g, "\\"), p = {
      isNode: o,
      label: mr(t) ? f : u,
      labelStyle: r.replace("fill:", "color:")
    };
    return await _f(e, p, s, n, c);
  } else {
    const h = t.replace(/<br\s*\/?>/g, "<br/>"), u = mf(h.replace("<br>", "<br/>"), l), f = kf(
      s,
      e,
      u,
      t ? c : !1
    );
    if (o) {
      /stroke:/.exec(r) && (r = r.replace("stroke:", "lineColor:"));
      const p = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      et(f).attr("style", p);
    } else {
      const p = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/background:/g, "fill:");
      et(f).select("rect").attr("style", p.replace(/background:/g, "fill:"));
      const g = r.replace(/stroke:[^;]+;?/g, "").replace(/stroke-width:[^;]+;?/g, "").replace(/fill:[^;]+;?/g, "").replace(/color:/g, "fill:");
      et(f).select("text").attr("style", g);
    }
    return f;
  }
}, "createText");
function na(e, t, r) {
  if (e && e.length) {
    const [i, n] = t, a = Math.PI / 180 * r, o = Math.cos(a), s = Math.sin(a);
    for (const c of e) {
      const [l, h] = c;
      c[0] = (l - i) * o - (h - n) * s + i, c[1] = (l - i) * s + (h - n) * o + n;
    }
  }
}
function N_(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}
function z_(e, t, r, i = 1) {
  const n = r, a = Math.max(t, 0.1), o = e[0] && e[0][0] && typeof e[0][0] == "number" ? [e] : e, s = [0, 0];
  if (n) for (const l of o) na(l, s, n);
  const c = function(l, h, u) {
    const f = [];
    for (const b of l) {
      const _ = [...b];
      N_(_[0], _[_.length - 1]) || _.push([_[0][0], _[0][1]]), _.length > 2 && f.push(_);
    }
    const p = [];
    h = Math.max(h, 0.1);
    const g = [];
    for (const b of f) for (let _ = 0; _ < b.length - 1; _++) {
      const S = b[_], k = b[_ + 1];
      if (S[1] !== k[1]) {
        const C = Math.min(S[1], k[1]);
        g.push({ ymin: C, ymax: Math.max(S[1], k[1]), x: C === S[1] ? S[0] : k[0], islope: (k[0] - S[0]) / (k[1] - S[1]) });
      }
    }
    if (g.sort((b, _) => b.ymin < _.ymin ? -1 : b.ymin > _.ymin ? 1 : b.x < _.x ? -1 : b.x > _.x ? 1 : b.ymax === _.ymax ? 0 : (b.ymax - _.ymax) / Math.abs(b.ymax - _.ymax)), !g.length) return p;
    let m = [], y = g[0].ymin, x = 0;
    for (; m.length || g.length; ) {
      if (g.length) {
        let b = -1;
        for (let _ = 0; _ < g.length && !(g[_].ymin > y); _++) b = _;
        g.splice(0, b + 1).forEach((_) => {
          m.push({ s: y, edge: _ });
        });
      }
      if (m = m.filter((b) => !(b.edge.ymax <= y)), m.sort((b, _) => b.edge.x === _.edge.x ? 0 : (b.edge.x - _.edge.x) / Math.abs(b.edge.x - _.edge.x)), (u !== 1 || x % h == 0) && m.length > 1) for (let b = 0; b < m.length; b += 2) {
        const _ = b + 1;
        if (_ >= m.length) break;
        const S = m[b].edge, k = m[_].edge;
        p.push([[Math.round(S.x), y], [Math.round(k.x), y]]);
      }
      y += u, m.forEach((b) => {
        b.edge.x = b.edge.x + u * b.edge.islope;
      }), x++;
    }
    return p;
  }(o, a, i);
  if (n) {
    for (const l of o) na(l, s, -n);
    (function(l, h, u) {
      const f = [];
      l.forEach((p) => f.push(...p)), na(f, h, u);
    })(c, s, -n);
  }
  return c;
}
function mi(e, t) {
  var r;
  const i = t.hachureAngle + 90;
  let n = t.hachureGap;
  n < 0 && (n = 4 * t.strokeWidth), n = Math.round(Math.max(n, 0.1));
  let a = 1;
  return t.roughness >= 1 && (((r = t.randomizer) === null || r === void 0 ? void 0 : r.next()) || Math.random()) > 0.7 && (a = n), z_(e, n, i, a || 1);
}
class ro {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    return this._fillPolygons(t, r);
  }
  _fillPolygons(t, r) {
    const i = mi(t, r);
    return { type: "fillSketch", ops: this.renderLines(i, r) };
  }
  renderLines(t, r) {
    const i = [];
    for (const n of t) i.push(...this.helper.doubleLineOps(n[0][0], n[0][1], n[1][0], n[1][1], r));
    return i;
  }
}
function Gn(e) {
  const t = e[0], r = e[1];
  return Math.sqrt(Math.pow(t[0] - r[0], 2) + Math.pow(t[1] - r[1], 2));
}
class q_ extends ro {
  fillPolygons(t, r) {
    let i = r.hachureGap;
    i < 0 && (i = 4 * r.strokeWidth), i = Math.max(i, 0.1);
    const n = mi(t, Object.assign({}, r, { hachureGap: i })), a = Math.PI / 180 * r.hachureAngle, o = [], s = 0.5 * i * Math.cos(a), c = 0.5 * i * Math.sin(a);
    for (const [l, h] of n) Gn([l, h]) && o.push([[l[0] - s, l[1] + c], [...h]], [[l[0] + s, l[1] - c], [...h]]);
    return { type: "fillSketch", ops: this.renderLines(o, r) };
  }
}
class W_ extends ro {
  fillPolygons(t, r) {
    const i = this._fillPolygons(t, r), n = Object.assign({}, r, { hachureAngle: r.hachureAngle + 90 }), a = this._fillPolygons(t, n);
    return i.ops = i.ops.concat(a.ops), i;
  }
}
class H_ {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = mi(t, r = Object.assign({}, r, { hachureAngle: 0 }));
    return this.dotsOnLines(i, r);
  }
  dotsOnLines(t, r) {
    const i = [];
    let n = r.hachureGap;
    n < 0 && (n = 4 * r.strokeWidth), n = Math.max(n, 0.1);
    let a = r.fillWeight;
    a < 0 && (a = r.strokeWidth / 2);
    const o = n / 4;
    for (const s of t) {
      const c = Gn(s), l = c / n, h = Math.ceil(l) - 1, u = c - h * n, f = (s[0][0] + s[1][0]) / 2 - n / 4, p = Math.min(s[0][1], s[1][1]);
      for (let g = 0; g < h; g++) {
        const m = p + u + g * n, y = f - o + 2 * Math.random() * o, x = m - o + 2 * Math.random() * o, b = this.helper.ellipse(y, x, a, a, r);
        i.push(...b.ops);
      }
    }
    return { type: "fillSketch", ops: i };
  }
}
class j_ {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = mi(t, r);
    return { type: "fillSketch", ops: this.dashedLine(i, r) };
  }
  dashedLine(t, r) {
    const i = r.dashOffset < 0 ? r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap : r.dashOffset, n = r.dashGap < 0 ? r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap : r.dashGap, a = [];
    return t.forEach((o) => {
      const s = Gn(o), c = Math.floor(s / (i + n)), l = (s + n - c * (i + n)) / 2;
      let h = o[0], u = o[1];
      h[0] > u[0] && (h = o[1], u = o[0]);
      const f = Math.atan((u[1] - h[1]) / (u[0] - h[0]));
      for (let p = 0; p < c; p++) {
        const g = p * (i + n), m = g + i, y = [h[0] + g * Math.cos(f) + l * Math.cos(f), h[1] + g * Math.sin(f) + l * Math.sin(f)], x = [h[0] + m * Math.cos(f) + l * Math.cos(f), h[1] + m * Math.sin(f) + l * Math.sin(f)];
        a.push(...this.helper.doubleLineOps(y[0], y[1], x[0], x[1], r));
      }
    }), a;
  }
}
class Y_ {
  constructor(t) {
    this.helper = t;
  }
  fillPolygons(t, r) {
    const i = r.hachureGap < 0 ? 4 * r.strokeWidth : r.hachureGap, n = r.zigzagOffset < 0 ? i : r.zigzagOffset, a = mi(t, r = Object.assign({}, r, { hachureGap: i + n }));
    return { type: "fillSketch", ops: this.zigzagLines(a, n, r) };
  }
  zigzagLines(t, r, i) {
    const n = [];
    return t.forEach((a) => {
      const o = Gn(a), s = Math.round(o / (2 * r));
      let c = a[0], l = a[1];
      c[0] > l[0] && (c = a[1], l = a[0]);
      const h = Math.atan((l[1] - c[1]) / (l[0] - c[0]));
      for (let u = 0; u < s; u++) {
        const f = 2 * u * r, p = 2 * (u + 1) * r, g = Math.sqrt(2 * Math.pow(r, 2)), m = [c[0] + f * Math.cos(h), c[1] + f * Math.sin(h)], y = [c[0] + p * Math.cos(h), c[1] + p * Math.sin(h)], x = [m[0] + g * Math.cos(h + Math.PI / 4), m[1] + g * Math.sin(h + Math.PI / 4)];
        n.push(...this.helper.doubleLineOps(m[0], m[1], x[0], x[1], i), ...this.helper.doubleLineOps(x[0], x[1], y[0], y[1], i));
      }
    }), n;
  }
}
const Mt = {};
class G_ {
  constructor(t) {
    this.seed = t;
  }
  next() {
    return this.seed ? (2 ** 31 - 1 & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31 : Math.random();
  }
}
const U_ = 0, aa = 1, hl = 2, vi = { A: 7, a: 7, C: 6, c: 6, H: 1, h: 1, L: 2, l: 2, M: 2, m: 2, Q: 4, q: 4, S: 4, s: 4, T: 2, t: 2, V: 1, v: 1, Z: 0, z: 0 };
function sa(e, t) {
  return e.type === t;
}
function io(e) {
  const t = [], r = function(o) {
    const s = new Array();
    for (; o !== ""; ) if (o.match(/^([ \t\r\n,]+)/)) o = o.substr(RegExp.$1.length);
    else if (o.match(/^([aAcChHlLmMqQsStTvVzZ])/)) s[s.length] = { type: U_, text: RegExp.$1 }, o = o.substr(RegExp.$1.length);
    else {
      if (!o.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
      s[s.length] = { type: aa, text: `${parseFloat(RegExp.$1)}` }, o = o.substr(RegExp.$1.length);
    }
    return s[s.length] = { type: hl, text: "" }, s;
  }(e);
  let i = "BOD", n = 0, a = r[n];
  for (; !sa(a, hl); ) {
    let o = 0;
    const s = [];
    if (i === "BOD") {
      if (a.text !== "M" && a.text !== "m") return io("M0,0" + e);
      n++, o = vi[a.text], i = a.text;
    } else sa(a, aa) ? o = vi[i] : (n++, o = vi[a.text], i = a.text);
    if (!(n + o < r.length)) throw new Error("Path data ended short");
    for (let c = n; c < n + o; c++) {
      const l = r[c];
      if (!sa(l, aa)) throw new Error("Param not a number: " + i + "," + l.text);
      s[s.length] = +l.text;
    }
    if (typeof vi[i] != "number") throw new Error("Bad segment: " + i);
    {
      const c = { key: i, data: s };
      t.push(c), n += o, a = r[n], i === "M" && (i = "L"), i === "m" && (i = "l");
    }
  }
  return t;
}
function Sf(e) {
  let t = 0, r = 0, i = 0, n = 0;
  const a = [];
  for (const { key: o, data: s } of e) switch (o) {
    case "M":
      a.push({ key: "M", data: [...s] }), [t, r] = s, [i, n] = s;
      break;
    case "m":
      t += s[0], r += s[1], a.push({ key: "M", data: [t, r] }), i = t, n = r;
      break;
    case "L":
      a.push({ key: "L", data: [...s] }), [t, r] = s;
      break;
    case "l":
      t += s[0], r += s[1], a.push({ key: "L", data: [t, r] });
      break;
    case "C":
      a.push({ key: "C", data: [...s] }), t = s[4], r = s[5];
      break;
    case "c": {
      const c = s.map((l, h) => h % 2 ? l + r : l + t);
      a.push({ key: "C", data: c }), t = c[4], r = c[5];
      break;
    }
    case "Q":
      a.push({ key: "Q", data: [...s] }), t = s[2], r = s[3];
      break;
    case "q": {
      const c = s.map((l, h) => h % 2 ? l + r : l + t);
      a.push({ key: "Q", data: c }), t = c[2], r = c[3];
      break;
    }
    case "A":
      a.push({ key: "A", data: [...s] }), t = s[5], r = s[6];
      break;
    case "a":
      t += s[5], r += s[6], a.push({ key: "A", data: [s[0], s[1], s[2], s[3], s[4], t, r] });
      break;
    case "H":
      a.push({ key: "H", data: [...s] }), t = s[0];
      break;
    case "h":
      t += s[0], a.push({ key: "H", data: [t] });
      break;
    case "V":
      a.push({ key: "V", data: [...s] }), r = s[0];
      break;
    case "v":
      r += s[0], a.push({ key: "V", data: [r] });
      break;
    case "S":
      a.push({ key: "S", data: [...s] }), t = s[2], r = s[3];
      break;
    case "s": {
      const c = s.map((l, h) => h % 2 ? l + r : l + t);
      a.push({ key: "S", data: c }), t = c[2], r = c[3];
      break;
    }
    case "T":
      a.push({ key: "T", data: [...s] }), t = s[0], r = s[1];
      break;
    case "t":
      t += s[0], r += s[1], a.push({ key: "T", data: [t, r] });
      break;
    case "Z":
    case "z":
      a.push({ key: "Z", data: [] }), t = i, r = n;
  }
  return a;
}
function Tf(e) {
  const t = [];
  let r = "", i = 0, n = 0, a = 0, o = 0, s = 0, c = 0;
  for (const { key: l, data: h } of e) {
    switch (l) {
      case "M":
        t.push({ key: "M", data: [...h] }), [i, n] = h, [a, o] = h;
        break;
      case "C":
        t.push({ key: "C", data: [...h] }), i = h[4], n = h[5], s = h[2], c = h[3];
        break;
      case "L":
        t.push({ key: "L", data: [...h] }), [i, n] = h;
        break;
      case "H":
        i = h[0], t.push({ key: "L", data: [i, n] });
        break;
      case "V":
        n = h[0], t.push({ key: "L", data: [i, n] });
        break;
      case "S": {
        let u = 0, f = 0;
        r === "C" || r === "S" ? (u = i + (i - s), f = n + (n - c)) : (u = i, f = n), t.push({ key: "C", data: [u, f, ...h] }), s = h[0], c = h[1], i = h[2], n = h[3];
        break;
      }
      case "T": {
        const [u, f] = h;
        let p = 0, g = 0;
        r === "Q" || r === "T" ? (p = i + (i - s), g = n + (n - c)) : (p = i, g = n);
        const m = i + 2 * (p - i) / 3, y = n + 2 * (g - n) / 3, x = u + 2 * (p - u) / 3, b = f + 2 * (g - f) / 3;
        t.push({ key: "C", data: [m, y, x, b, u, f] }), s = p, c = g, i = u, n = f;
        break;
      }
      case "Q": {
        const [u, f, p, g] = h, m = i + 2 * (u - i) / 3, y = n + 2 * (f - n) / 3, x = p + 2 * (u - p) / 3, b = g + 2 * (f - g) / 3;
        t.push({ key: "C", data: [m, y, x, b, p, g] }), s = u, c = f, i = p, n = g;
        break;
      }
      case "A": {
        const u = Math.abs(h[0]), f = Math.abs(h[1]), p = h[2], g = h[3], m = h[4], y = h[5], x = h[6];
        u === 0 || f === 0 ? (t.push({ key: "C", data: [i, n, y, x, y, x] }), i = y, n = x) : (i !== y || n !== x) && (Bf(i, n, y, x, u, f, p, g, m).forEach(function(b) {
          t.push({ key: "C", data: b });
        }), i = y, n = x);
        break;
      }
      case "Z":
        t.push({ key: "Z", data: [] }), i = a, n = o;
    }
    r = l;
  }
  return t;
}
function Or(e, t, r) {
  return [e * Math.cos(r) - t * Math.sin(r), e * Math.sin(r) + t * Math.cos(r)];
}
function Bf(e, t, r, i, n, a, o, s, c, l) {
  const h = (u = o, Math.PI * u / 180);
  var u;
  let f = [], p = 0, g = 0, m = 0, y = 0;
  if (l) [p, g, m, y] = l;
  else {
    [e, t] = Or(e, t, -h), [r, i] = Or(r, i, -h);
    const D = (e - r) / 2, A = (t - i) / 2;
    let L = D * D / (n * n) + A * A / (a * a);
    L > 1 && (L = Math.sqrt(L), n *= L, a *= L);
    const T = n * n, $ = a * a, B = T * $ - T * A * A - $ * D * D, N = T * A * A + $ * D * D, G = (s === c ? -1 : 1) * Math.sqrt(Math.abs(B / N));
    m = G * n * A / a + (e + r) / 2, y = G * -a * D / n + (t + i) / 2, p = Math.asin(parseFloat(((t - y) / a).toFixed(9))), g = Math.asin(parseFloat(((i - y) / a).toFixed(9))), e < m && (p = Math.PI - p), r < m && (g = Math.PI - g), p < 0 && (p = 2 * Math.PI + p), g < 0 && (g = 2 * Math.PI + g), c && p > g && (p -= 2 * Math.PI), !c && g > p && (g -= 2 * Math.PI);
  }
  let x = g - p;
  if (Math.abs(x) > 120 * Math.PI / 180) {
    const D = g, A = r, L = i;
    g = c && g > p ? p + 120 * Math.PI / 180 * 1 : p + 120 * Math.PI / 180 * -1, f = Bf(r = m + n * Math.cos(g), i = y + a * Math.sin(g), A, L, n, a, o, 0, c, [g, D, m, y]);
  }
  x = g - p;
  const b = Math.cos(p), _ = Math.sin(p), S = Math.cos(g), k = Math.sin(g), C = Math.tan(x / 4), w = 4 / 3 * n * C, O = 4 / 3 * a * C, I = [e, t], F = [e + w * _, t - O * b], M = [r + w * k, i - O * S], P = [r, i];
  if (F[0] = 2 * I[0] - F[0], F[1] = 2 * I[1] - F[1], l) return [F, M, P].concat(f);
  {
    f = [F, M, P].concat(f);
    const D = [];
    for (let A = 0; A < f.length; A += 3) {
      const L = Or(f[A][0], f[A][1], h), T = Or(f[A + 1][0], f[A + 1][1], h), $ = Or(f[A + 2][0], f[A + 2][1], h);
      D.push([L[0], L[1], T[0], T[1], $[0], $[1]]);
    }
    return D;
  }
}
const X_ = { randOffset: function(e, t) {
  return V(e, t);
}, randOffsetWithRange: function(e, t, r) {
  return xn(e, t, r);
}, ellipse: function(e, t, r, i, n) {
  const a = Mf(r, i, n);
  return Xa(e, t, n, a).opset;
}, doubleLineOps: function(e, t, r, i, n) {
  return ve(e, t, r, i, n, !0);
} };
function Lf(e, t, r, i, n) {
  return { type: "path", ops: ve(e, t, r, i, n) };
}
function Ii(e, t, r) {
  const i = (e || []).length;
  if (i > 2) {
    const n = [];
    for (let a = 0; a < i - 1; a++) n.push(...ve(e[a][0], e[a][1], e[a + 1][0], e[a + 1][1], r));
    return t && n.push(...ve(e[i - 1][0], e[i - 1][1], e[0][0], e[0][1], r)), { type: "path", ops: n };
  }
  return i === 2 ? Lf(e[0][0], e[0][1], e[1][0], e[1][1], r) : { type: "path", ops: [] };
}
function V_(e, t, r, i, n) {
  return function(a, o) {
    return Ii(a, !0, o);
  }([[e, t], [e + r, t], [e + r, t + i], [e, t + i]], n);
}
function ul(e, t) {
  if (e.length) {
    const r = typeof e[0][0] == "number" ? [e] : e, i = Si(r[0], 1 * (1 + 0.2 * t.roughness), t), n = t.disableMultiStroke ? [] : Si(r[0], 1.5 * (1 + 0.22 * t.roughness), dl(t));
    for (let a = 1; a < r.length; a++) {
      const o = r[a];
      if (o.length) {
        const s = Si(o, 1 * (1 + 0.2 * t.roughness), t), c = t.disableMultiStroke ? [] : Si(o, 1.5 * (1 + 0.22 * t.roughness), dl(t));
        for (const l of s) l.op !== "move" && i.push(l);
        for (const l of c) l.op !== "move" && n.push(l);
      }
    }
    return { type: "path", ops: i.concat(n) };
  }
  return { type: "path", ops: [] };
}
function Mf(e, t, r) {
  const i = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(e / 2, 2) + Math.pow(t / 2, 2)) / 2)), n = Math.ceil(Math.max(r.curveStepCount, r.curveStepCount / Math.sqrt(200) * i)), a = 2 * Math.PI / n;
  let o = Math.abs(e / 2), s = Math.abs(t / 2);
  const c = 1 - r.curveFitting;
  return o += V(o * c, r), s += V(s * c, r), { increment: a, rx: o, ry: s };
}
function Xa(e, t, r, i) {
  const [n, a] = gl(i.increment, e, t, i.rx, i.ry, 1, i.increment * xn(0.1, xn(0.4, 1, r), r), r);
  let o = bn(n, null, r);
  if (!r.disableMultiStroke && r.roughness !== 0) {
    const [s] = gl(i.increment, e, t, i.rx, i.ry, 1.5, 0, r), c = bn(s, null, r);
    o = o.concat(c);
  }
  return { estimatedPoints: a, opset: { type: "path", ops: o } };
}
function fl(e, t, r, i, n, a, o, s, c) {
  const l = e, h = t;
  let u = Math.abs(r / 2), f = Math.abs(i / 2);
  u += V(0.01 * u, c), f += V(0.01 * f, c);
  let p = n, g = a;
  for (; p < 0; ) p += 2 * Math.PI, g += 2 * Math.PI;
  g - p > 2 * Math.PI && (p = 0, g = 2 * Math.PI);
  const m = 2 * Math.PI / c.curveStepCount, y = Math.min(m / 2, (g - p) / 2), x = ml(y, l, h, u, f, p, g, 1, c);
  if (!c.disableMultiStroke) {
    const b = ml(y, l, h, u, f, p, g, 1.5, c);
    x.push(...b);
  }
  return o && (s ? x.push(...ve(l, h, l + u * Math.cos(p), h + f * Math.sin(p), c), ...ve(l, h, l + u * Math.cos(g), h + f * Math.sin(g), c)) : x.push({ op: "lineTo", data: [l, h] }, { op: "lineTo", data: [l + u * Math.cos(p), h + f * Math.sin(p)] })), { type: "path", ops: x };
}
function pl(e, t) {
  const r = Tf(Sf(io(e))), i = [];
  let n = [0, 0], a = [0, 0];
  for (const { key: o, data: s } of r) switch (o) {
    case "M":
      a = [s[0], s[1]], n = [s[0], s[1]];
      break;
    case "L":
      i.push(...ve(a[0], a[1], s[0], s[1], t)), a = [s[0], s[1]];
      break;
    case "C": {
      const [c, l, h, u, f, p] = s;
      i.push(...Z_(c, l, h, u, f, p, a, t)), a = [f, p];
      break;
    }
    case "Z":
      i.push(...ve(a[0], a[1], n[0], n[1], t)), a = [n[0], n[1]];
  }
  return { type: "path", ops: i };
}
function oa(e, t) {
  const r = [];
  for (const i of e) if (i.length) {
    const n = t.maxRandomnessOffset || 0, a = i.length;
    if (a > 2) {
      r.push({ op: "move", data: [i[0][0] + V(n, t), i[0][1] + V(n, t)] });
      for (let o = 1; o < a; o++) r.push({ op: "lineTo", data: [i[o][0] + V(n, t), i[o][1] + V(n, t)] });
    }
  }
  return { type: "fillPath", ops: r };
}
function Ke(e, t) {
  return function(r, i) {
    let n = r.fillStyle || "hachure";
    if (!Mt[n]) switch (n) {
      case "zigzag":
        Mt[n] || (Mt[n] = new q_(i));
        break;
      case "cross-hatch":
        Mt[n] || (Mt[n] = new W_(i));
        break;
      case "dots":
        Mt[n] || (Mt[n] = new H_(i));
        break;
      case "dashed":
        Mt[n] || (Mt[n] = new j_(i));
        break;
      case "zigzag-line":
        Mt[n] || (Mt[n] = new Y_(i));
        break;
      default:
        n = "hachure", Mt[n] || (Mt[n] = new ro(i));
    }
    return Mt[n];
  }(t, X_).fillPolygons(e, t);
}
function dl(e) {
  const t = Object.assign({}, e);
  return t.randomizer = void 0, e.seed && (t.seed = e.seed + 1), t;
}
function Af(e) {
  return e.randomizer || (e.randomizer = new G_(e.seed || 0)), e.randomizer.next();
}
function xn(e, t, r, i = 1) {
  return r.roughness * i * (Af(r) * (t - e) + e);
}
function V(e, t, r = 1) {
  return xn(-e, e, t, r);
}
function ve(e, t, r, i, n, a = !1) {
  const o = a ? n.disableMultiStrokeFill : n.disableMultiStroke, s = Va(e, t, r, i, n, !0, !1);
  if (o) return s;
  const c = Va(e, t, r, i, n, !0, !0);
  return s.concat(c);
}
function Va(e, t, r, i, n, a, o) {
  const s = Math.pow(e - r, 2) + Math.pow(t - i, 2), c = Math.sqrt(s);
  let l = 1;
  l = c < 200 ? 1 : c > 500 ? 0.4 : -16668e-7 * c + 1.233334;
  let h = n.maxRandomnessOffset || 0;
  h * h * 100 > s && (h = c / 10);
  const u = h / 2, f = 0.2 + 0.2 * Af(n);
  let p = n.bowing * n.maxRandomnessOffset * (i - t) / 200, g = n.bowing * n.maxRandomnessOffset * (e - r) / 200;
  p = V(p, n, l), g = V(g, n, l);
  const m = [], y = () => V(u, n, l), x = () => V(h, n, l), b = n.preserveVertices;
  return o ? m.push({ op: "move", data: [e + (b ? 0 : y()), t + (b ? 0 : y())] }) : m.push({ op: "move", data: [e + (b ? 0 : V(h, n, l)), t + (b ? 0 : V(h, n, l))] }), o ? m.push({ op: "bcurveTo", data: [p + e + (r - e) * f + y(), g + t + (i - t) * f + y(), p + e + 2 * (r - e) * f + y(), g + t + 2 * (i - t) * f + y(), r + (b ? 0 : y()), i + (b ? 0 : y())] }) : m.push({ op: "bcurveTo", data: [p + e + (r - e) * f + x(), g + t + (i - t) * f + x(), p + e + 2 * (r - e) * f + x(), g + t + 2 * (i - t) * f + x(), r + (b ? 0 : x()), i + (b ? 0 : x())] }), m;
}
function Si(e, t, r) {
  if (!e.length) return [];
  const i = [];
  i.push([e[0][0] + V(t, r), e[0][1] + V(t, r)]), i.push([e[0][0] + V(t, r), e[0][1] + V(t, r)]);
  for (let n = 1; n < e.length; n++) i.push([e[n][0] + V(t, r), e[n][1] + V(t, r)]), n === e.length - 1 && i.push([e[n][0] + V(t, r), e[n][1] + V(t, r)]);
  return bn(i, null, r);
}
function bn(e, t, r) {
  const i = e.length, n = [];
  if (i > 3) {
    const a = [], o = 1 - r.curveTightness;
    n.push({ op: "move", data: [e[1][0], e[1][1]] });
    for (let s = 1; s + 2 < i; s++) {
      const c = e[s];
      a[0] = [c[0], c[1]], a[1] = [c[0] + (o * e[s + 1][0] - o * e[s - 1][0]) / 6, c[1] + (o * e[s + 1][1] - o * e[s - 1][1]) / 6], a[2] = [e[s + 1][0] + (o * e[s][0] - o * e[s + 2][0]) / 6, e[s + 1][1] + (o * e[s][1] - o * e[s + 2][1]) / 6], a[3] = [e[s + 1][0], e[s + 1][1]], n.push({ op: "bcurveTo", data: [a[1][0], a[1][1], a[2][0], a[2][1], a[3][0], a[3][1]] });
    }
  } else i === 3 ? (n.push({ op: "move", data: [e[1][0], e[1][1]] }), n.push({ op: "bcurveTo", data: [e[1][0], e[1][1], e[2][0], e[2][1], e[2][0], e[2][1]] })) : i === 2 && n.push(...Va(e[0][0], e[0][1], e[1][0], e[1][1], r, !0, !0));
  return n;
}
function gl(e, t, r, i, n, a, o, s) {
  const c = [], l = [];
  if (s.roughness === 0) {
    e /= 4, l.push([t + i * Math.cos(-e), r + n * Math.sin(-e)]);
    for (let h = 0; h <= 2 * Math.PI; h += e) {
      const u = [t + i * Math.cos(h), r + n * Math.sin(h)];
      c.push(u), l.push(u);
    }
    l.push([t + i * Math.cos(0), r + n * Math.sin(0)]), l.push([t + i * Math.cos(e), r + n * Math.sin(e)]);
  } else {
    const h = V(0.5, s) - Math.PI / 2;
    l.push([V(a, s) + t + 0.9 * i * Math.cos(h - e), V(a, s) + r + 0.9 * n * Math.sin(h - e)]);
    const u = 2 * Math.PI + h - 0.01;
    for (let f = h; f < u; f += e) {
      const p = [V(a, s) + t + i * Math.cos(f), V(a, s) + r + n * Math.sin(f)];
      c.push(p), l.push(p);
    }
    l.push([V(a, s) + t + i * Math.cos(h + 2 * Math.PI + 0.5 * o), V(a, s) + r + n * Math.sin(h + 2 * Math.PI + 0.5 * o)]), l.push([V(a, s) + t + 0.98 * i * Math.cos(h + o), V(a, s) + r + 0.98 * n * Math.sin(h + o)]), l.push([V(a, s) + t + 0.9 * i * Math.cos(h + 0.5 * o), V(a, s) + r + 0.9 * n * Math.sin(h + 0.5 * o)]);
  }
  return [l, c];
}
function ml(e, t, r, i, n, a, o, s, c) {
  const l = a + V(0.1, c), h = [];
  h.push([V(s, c) + t + 0.9 * i * Math.cos(l - e), V(s, c) + r + 0.9 * n * Math.sin(l - e)]);
  for (let u = l; u <= o; u += e) h.push([V(s, c) + t + i * Math.cos(u), V(s, c) + r + n * Math.sin(u)]);
  return h.push([t + i * Math.cos(o), r + n * Math.sin(o)]), h.push([t + i * Math.cos(o), r + n * Math.sin(o)]), bn(h, null, c);
}
function Z_(e, t, r, i, n, a, o, s) {
  const c = [], l = [s.maxRandomnessOffset || 1, (s.maxRandomnessOffset || 1) + 0.3];
  let h = [0, 0];
  const u = s.disableMultiStroke ? 1 : 2, f = s.preserveVertices;
  for (let p = 0; p < u; p++) p === 0 ? c.push({ op: "move", data: [o[0], o[1]] }) : c.push({ op: "move", data: [o[0] + (f ? 0 : V(l[0], s)), o[1] + (f ? 0 : V(l[0], s))] }), h = f ? [n, a] : [n + V(l[p], s), a + V(l[p], s)], c.push({ op: "bcurveTo", data: [e + V(l[p], s), t + V(l[p], s), r + V(l[p], s), i + V(l[p], s), h[0], h[1]] });
  return c;
}
function Dr(e) {
  return [...e];
}
function yl(e, t = 0) {
  const r = e.length;
  if (r < 3) throw new Error("A curve must have at least three points.");
  const i = [];
  if (r === 3) i.push(Dr(e[0]), Dr(e[1]), Dr(e[2]), Dr(e[2]));
  else {
    const n = [];
    n.push(e[0], e[0]);
    for (let s = 1; s < e.length; s++) n.push(e[s]), s === e.length - 1 && n.push(e[s]);
    const a = [], o = 1 - t;
    i.push(Dr(n[0]));
    for (let s = 1; s + 2 < n.length; s++) {
      const c = n[s];
      a[0] = [c[0], c[1]], a[1] = [c[0] + (o * n[s + 1][0] - o * n[s - 1][0]) / 6, c[1] + (o * n[s + 1][1] - o * n[s - 1][1]) / 6], a[2] = [n[s + 1][0] + (o * n[s][0] - o * n[s + 2][0]) / 6, n[s + 1][1] + (o * n[s][1] - o * n[s + 2][1]) / 6], a[3] = [n[s + 1][0], n[s + 1][1]], i.push(a[1], a[2], a[3]);
    }
  }
  return i;
}
function Pi(e, t) {
  return Math.pow(e[0] - t[0], 2) + Math.pow(e[1] - t[1], 2);
}
function K_(e, t, r) {
  const i = Pi(t, r);
  if (i === 0) return Pi(e, t);
  let n = ((e[0] - t[0]) * (r[0] - t[0]) + (e[1] - t[1]) * (r[1] - t[1])) / i;
  return n = Math.max(0, Math.min(1, n)), Pi(e, Ae(t, r, n));
}
function Ae(e, t, r) {
  return [e[0] + (t[0] - e[0]) * r, e[1] + (t[1] - e[1]) * r];
}
function Za(e, t, r, i) {
  const n = i || [];
  if (function(s, c) {
    const l = s[c + 0], h = s[c + 1], u = s[c + 2], f = s[c + 3];
    let p = 3 * h[0] - 2 * l[0] - f[0];
    p *= p;
    let g = 3 * h[1] - 2 * l[1] - f[1];
    g *= g;
    let m = 3 * u[0] - 2 * f[0] - l[0];
    m *= m;
    let y = 3 * u[1] - 2 * f[1] - l[1];
    return y *= y, p < m && (p = m), g < y && (g = y), p + g;
  }(e, t) < r) {
    const s = e[t + 0];
    n.length ? (a = n[n.length - 1], o = s, Math.sqrt(Pi(a, o)) > 1 && n.push(s)) : n.push(s), n.push(e[t + 3]);
  } else {
    const c = e[t + 0], l = e[t + 1], h = e[t + 2], u = e[t + 3], f = Ae(c, l, 0.5), p = Ae(l, h, 0.5), g = Ae(h, u, 0.5), m = Ae(f, p, 0.5), y = Ae(p, g, 0.5), x = Ae(m, y, 0.5);
    Za([c, f, m, x], 0, r, n), Za([x, y, g, u], 0, r, n);
  }
  var a, o;
  return n;
}
function Q_(e, t) {
  return Cn(e, 0, e.length, t);
}
function Cn(e, t, r, i, n) {
  const a = n || [], o = e[t], s = e[r - 1];
  let c = 0, l = 1;
  for (let h = t + 1; h < r - 1; ++h) {
    const u = K_(e[h], o, s);
    u > c && (c = u, l = h);
  }
  return Math.sqrt(c) > i ? (Cn(e, t, l + 1, i, a), Cn(e, l, r, i, a)) : (a.length || a.push(o), a.push(s)), a;
}
function la(e, t = 0.15, r) {
  const i = [], n = (e.length - 1) / 3;
  for (let a = 0; a < n; a++)
    Za(e, 3 * a, t, i);
  return r && r > 0 ? Cn(i, 0, i.length, r) : i;
}
const Dt = "none";
class _n {
  constructor(t) {
    this.defaultOptions = { maxRandomnessOffset: 2, roughness: 1, bowing: 1, stroke: "#000", strokeWidth: 1, curveTightness: 0, curveFitting: 0.95, curveStepCount: 9, fillStyle: "hachure", fillWeight: -1, hachureAngle: -41, hachureGap: -1, dashOffset: -1, dashGap: -1, zigzagOffset: -1, seed: 0, disableMultiStroke: !1, disableMultiStrokeFill: !1, preserveVertices: !1, fillShapeRoughnessGain: 0.8 }, this.config = t || {}, this.config.options && (this.defaultOptions = this._o(this.config.options));
  }
  static newSeed() {
    return Math.floor(Math.random() * 2 ** 31);
  }
  _o(t) {
    return t ? Object.assign({}, this.defaultOptions, t) : this.defaultOptions;
  }
  _d(t, r, i) {
    return { shape: t, sets: r || [], options: i || this.defaultOptions };
  }
  line(t, r, i, n, a) {
    const o = this._o(a);
    return this._d("line", [Lf(t, r, i, n, o)], o);
  }
  rectangle(t, r, i, n, a) {
    const o = this._o(a), s = [], c = V_(t, r, i, n, o);
    if (o.fill) {
      const l = [[t, r], [t + i, r], [t + i, r + n], [t, r + n]];
      o.fillStyle === "solid" ? s.push(oa([l], o)) : s.push(Ke([l], o));
    }
    return o.stroke !== Dt && s.push(c), this._d("rectangle", s, o);
  }
  ellipse(t, r, i, n, a) {
    const o = this._o(a), s = [], c = Mf(i, n, o), l = Xa(t, r, o, c);
    if (o.fill) if (o.fillStyle === "solid") {
      const h = Xa(t, r, o, c).opset;
      h.type = "fillPath", s.push(h);
    } else s.push(Ke([l.estimatedPoints], o));
    return o.stroke !== Dt && s.push(l.opset), this._d("ellipse", s, o);
  }
  circle(t, r, i, n) {
    const a = this.ellipse(t, r, i, i, n);
    return a.shape = "circle", a;
  }
  linearPath(t, r) {
    const i = this._o(r);
    return this._d("linearPath", [Ii(t, !1, i)], i);
  }
  arc(t, r, i, n, a, o, s = !1, c) {
    const l = this._o(c), h = [], u = fl(t, r, i, n, a, o, s, !0, l);
    if (s && l.fill) if (l.fillStyle === "solid") {
      const f = Object.assign({}, l);
      f.disableMultiStroke = !0;
      const p = fl(t, r, i, n, a, o, !0, !1, f);
      p.type = "fillPath", h.push(p);
    } else h.push(function(f, p, g, m, y, x, b) {
      const _ = f, S = p;
      let k = Math.abs(g / 2), C = Math.abs(m / 2);
      k += V(0.01 * k, b), C += V(0.01 * C, b);
      let w = y, O = x;
      for (; w < 0; ) w += 2 * Math.PI, O += 2 * Math.PI;
      O - w > 2 * Math.PI && (w = 0, O = 2 * Math.PI);
      const I = (O - w) / b.curveStepCount, F = [];
      for (let M = w; M <= O; M += I) F.push([_ + k * Math.cos(M), S + C * Math.sin(M)]);
      return F.push([_ + k * Math.cos(O), S + C * Math.sin(O)]), F.push([_, S]), Ke([F], b);
    }(t, r, i, n, a, o, l));
    return l.stroke !== Dt && h.push(u), this._d("arc", h, l);
  }
  curve(t, r) {
    const i = this._o(r), n = [], a = ul(t, i);
    if (i.fill && i.fill !== Dt) if (i.fillStyle === "solid") {
      const o = ul(t, Object.assign(Object.assign({}, i), { disableMultiStroke: !0, roughness: i.roughness ? i.roughness + i.fillShapeRoughnessGain : 0 }));
      n.push({ type: "fillPath", ops: this._mergedShape(o.ops) });
    } else {
      const o = [], s = t;
      if (s.length) {
        const c = typeof s[0][0] == "number" ? [s] : s;
        for (const l of c) l.length < 3 ? o.push(...l) : l.length === 3 ? o.push(...la(yl([l[0], l[0], l[1], l[2]]), 10, (1 + i.roughness) / 2)) : o.push(...la(yl(l), 10, (1 + i.roughness) / 2));
      }
      o.length && n.push(Ke([o], i));
    }
    return i.stroke !== Dt && n.push(a), this._d("curve", n, i);
  }
  polygon(t, r) {
    const i = this._o(r), n = [], a = Ii(t, !0, i);
    return i.fill && (i.fillStyle === "solid" ? n.push(oa([t], i)) : n.push(Ke([t], i))), i.stroke !== Dt && n.push(a), this._d("polygon", n, i);
  }
  path(t, r) {
    const i = this._o(r), n = [];
    if (!t) return this._d("path", n, i);
    t = (t || "").replace(/\n/g, " ").replace(/(-\s)/g, "-").replace("/(ss)/g", " ");
    const a = i.fill && i.fill !== "transparent" && i.fill !== Dt, o = i.stroke !== Dt, s = !!(i.simplification && i.simplification < 1), c = function(h, u, f) {
      const p = Tf(Sf(io(h))), g = [];
      let m = [], y = [0, 0], x = [];
      const b = () => {
        x.length >= 4 && m.push(...la(x, u)), x = [];
      }, _ = () => {
        b(), m.length && (g.push(m), m = []);
      };
      for (const { key: k, data: C } of p) switch (k) {
        case "M":
          _(), y = [C[0], C[1]], m.push(y);
          break;
        case "L":
          b(), m.push([C[0], C[1]]);
          break;
        case "C":
          if (!x.length) {
            const w = m.length ? m[m.length - 1] : y;
            x.push([w[0], w[1]]);
          }
          x.push([C[0], C[1]]), x.push([C[2], C[3]]), x.push([C[4], C[5]]);
          break;
        case "Z":
          b(), m.push([y[0], y[1]]);
      }
      if (_(), !f) return g;
      const S = [];
      for (const k of g) {
        const C = Q_(k, f);
        C.length && S.push(C);
      }
      return S;
    }(t, 1, s ? 4 - 4 * (i.simplification || 1) : (1 + i.roughness) / 2), l = pl(t, i);
    if (a) if (i.fillStyle === "solid") if (c.length === 1) {
      const h = pl(t, Object.assign(Object.assign({}, i), { disableMultiStroke: !0, roughness: i.roughness ? i.roughness + i.fillShapeRoughnessGain : 0 }));
      n.push({ type: "fillPath", ops: this._mergedShape(h.ops) });
    } else n.push(oa(c, i));
    else n.push(Ke(c, i));
    return o && (s ? c.forEach((h) => {
      n.push(Ii(h, !1, i));
    }) : n.push(l)), this._d("path", n, i);
  }
  opsToPath(t, r) {
    let i = "";
    for (const n of t.ops) {
      const a = typeof r == "number" && r >= 0 ? n.data.map((o) => +o.toFixed(r)) : n.data;
      switch (n.op) {
        case "move":
          i += `M${a[0]} ${a[1]} `;
          break;
        case "bcurveTo":
          i += `C${a[0]} ${a[1]}, ${a[2]} ${a[3]}, ${a[4]} ${a[5]} `;
          break;
        case "lineTo":
          i += `L${a[0]} ${a[1]} `;
      }
    }
    return i.trim();
  }
  toPaths(t) {
    const r = t.sets || [], i = t.options || this.defaultOptions, n = [];
    for (const a of r) {
      let o = null;
      switch (a.type) {
        case "path":
          o = { d: this.opsToPath(a), stroke: i.stroke, strokeWidth: i.strokeWidth, fill: Dt };
          break;
        case "fillPath":
          o = { d: this.opsToPath(a), stroke: Dt, strokeWidth: 0, fill: i.fill || Dt };
          break;
        case "fillSketch":
          o = this.fillSketch(a, i);
      }
      o && n.push(o);
    }
    return n;
  }
  fillSketch(t, r) {
    let i = r.fillWeight;
    return i < 0 && (i = r.strokeWidth / 2), { d: this.opsToPath(t), stroke: r.fill || Dt, strokeWidth: i, fill: Dt };
  }
  _mergedShape(t) {
    return t.filter((r, i) => i === 0 || r.op !== "move");
  }
}
class J_ {
  constructor(t, r) {
    this.canvas = t, this.ctx = this.canvas.getContext("2d"), this.gen = new _n(r);
  }
  draw(t) {
    const r = t.sets || [], i = t.options || this.getDefaultOptions(), n = this.ctx, a = t.options.fixedDecimalPlaceDigits;
    for (const o of r) switch (o.type) {
      case "path":
        n.save(), n.strokeStyle = i.stroke === "none" ? "transparent" : i.stroke, n.lineWidth = i.strokeWidth, i.strokeLineDash && n.setLineDash(i.strokeLineDash), i.strokeLineDashOffset && (n.lineDashOffset = i.strokeLineDashOffset), this._drawToContext(n, o, a), n.restore();
        break;
      case "fillPath": {
        n.save(), n.fillStyle = i.fill || "";
        const s = t.shape === "curve" || t.shape === "polygon" || t.shape === "path" ? "evenodd" : "nonzero";
        this._drawToContext(n, o, a, s), n.restore();
        break;
      }
      case "fillSketch":
        this.fillSketch(n, o, i);
    }
  }
  fillSketch(t, r, i) {
    let n = i.fillWeight;
    n < 0 && (n = i.strokeWidth / 2), t.save(), i.fillLineDash && t.setLineDash(i.fillLineDash), i.fillLineDashOffset && (t.lineDashOffset = i.fillLineDashOffset), t.strokeStyle = i.fill || "", t.lineWidth = n, this._drawToContext(t, r, i.fixedDecimalPlaceDigits), t.restore();
  }
  _drawToContext(t, r, i, n = "nonzero") {
    t.beginPath();
    for (const a of r.ops) {
      const o = typeof i == "number" && i >= 0 ? a.data.map((s) => +s.toFixed(i)) : a.data;
      switch (a.op) {
        case "move":
          t.moveTo(o[0], o[1]);
          break;
        case "bcurveTo":
          t.bezierCurveTo(o[0], o[1], o[2], o[3], o[4], o[5]);
          break;
        case "lineTo":
          t.lineTo(o[0], o[1]);
      }
    }
    r.type === "fillPath" ? t.fill(n) : t.stroke();
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  line(t, r, i, n, a) {
    const o = this.gen.line(t, r, i, n, a);
    return this.draw(o), o;
  }
  rectangle(t, r, i, n, a) {
    const o = this.gen.rectangle(t, r, i, n, a);
    return this.draw(o), o;
  }
  ellipse(t, r, i, n, a) {
    const o = this.gen.ellipse(t, r, i, n, a);
    return this.draw(o), o;
  }
  circle(t, r, i, n) {
    const a = this.gen.circle(t, r, i, n);
    return this.draw(a), a;
  }
  linearPath(t, r) {
    const i = this.gen.linearPath(t, r);
    return this.draw(i), i;
  }
  polygon(t, r) {
    const i = this.gen.polygon(t, r);
    return this.draw(i), i;
  }
  arc(t, r, i, n, a, o, s = !1, c) {
    const l = this.gen.arc(t, r, i, n, a, o, s, c);
    return this.draw(l), l;
  }
  curve(t, r) {
    const i = this.gen.curve(t, r);
    return this.draw(i), i;
  }
  path(t, r) {
    const i = this.gen.path(t, r);
    return this.draw(i), i;
  }
}
const Ti = "http://www.w3.org/2000/svg";
class tw {
  constructor(t, r) {
    this.svg = t, this.gen = new _n(r);
  }
  draw(t) {
    const r = t.sets || [], i = t.options || this.getDefaultOptions(), n = this.svg.ownerDocument || window.document, a = n.createElementNS(Ti, "g"), o = t.options.fixedDecimalPlaceDigits;
    for (const s of r) {
      let c = null;
      switch (s.type) {
        case "path":
          c = n.createElementNS(Ti, "path"), c.setAttribute("d", this.opsToPath(s, o)), c.setAttribute("stroke", i.stroke), c.setAttribute("stroke-width", i.strokeWidth + ""), c.setAttribute("fill", "none"), i.strokeLineDash && c.setAttribute("stroke-dasharray", i.strokeLineDash.join(" ").trim()), i.strokeLineDashOffset && c.setAttribute("stroke-dashoffset", `${i.strokeLineDashOffset}`);
          break;
        case "fillPath":
          c = n.createElementNS(Ti, "path"), c.setAttribute("d", this.opsToPath(s, o)), c.setAttribute("stroke", "none"), c.setAttribute("stroke-width", "0"), c.setAttribute("fill", i.fill || ""), t.shape !== "curve" && t.shape !== "polygon" || c.setAttribute("fill-rule", "evenodd");
          break;
        case "fillSketch":
          c = this.fillSketch(n, s, i);
      }
      c && a.appendChild(c);
    }
    return a;
  }
  fillSketch(t, r, i) {
    let n = i.fillWeight;
    n < 0 && (n = i.strokeWidth / 2);
    const a = t.createElementNS(Ti, "path");
    return a.setAttribute("d", this.opsToPath(r, i.fixedDecimalPlaceDigits)), a.setAttribute("stroke", i.fill || ""), a.setAttribute("stroke-width", n + ""), a.setAttribute("fill", "none"), i.fillLineDash && a.setAttribute("stroke-dasharray", i.fillLineDash.join(" ").trim()), i.fillLineDashOffset && a.setAttribute("stroke-dashoffset", `${i.fillLineDashOffset}`), a;
  }
  get generator() {
    return this.gen;
  }
  getDefaultOptions() {
    return this.gen.defaultOptions;
  }
  opsToPath(t, r) {
    return this.gen.opsToPath(t, r);
  }
  line(t, r, i, n, a) {
    const o = this.gen.line(t, r, i, n, a);
    return this.draw(o);
  }
  rectangle(t, r, i, n, a) {
    const o = this.gen.rectangle(t, r, i, n, a);
    return this.draw(o);
  }
  ellipse(t, r, i, n, a) {
    const o = this.gen.ellipse(t, r, i, n, a);
    return this.draw(o);
  }
  circle(t, r, i, n) {
    const a = this.gen.circle(t, r, i, n);
    return this.draw(a);
  }
  linearPath(t, r) {
    const i = this.gen.linearPath(t, r);
    return this.draw(i);
  }
  polygon(t, r) {
    const i = this.gen.polygon(t, r);
    return this.draw(i);
  }
  arc(t, r, i, n, a, o, s = !1, c) {
    const l = this.gen.arc(t, r, i, n, a, o, s, c);
    return this.draw(l);
  }
  curve(t, r) {
    const i = this.gen.curve(t, r);
    return this.draw(i);
  }
  path(t, r) {
    const i = this.gen.path(t, r);
    return this.draw(i);
  }
}
var W = { canvas: (e, t) => new J_(e, t), svg: (e, t) => new tw(e, t), generator: (e) => new _n(e), newSeed: () => _n.newSeed() }, J = /* @__PURE__ */ d(async (e, t, r) => {
  var u, f;
  let i;
  const n = t.useHtmlLabels || gt((u = nt()) == null ? void 0 : u.htmlLabels);
  r ? i = r : i = "node default";
  const a = e.insert("g").attr("class", i).attr("id", t.domId || t.id), o = a.insert("g").attr("class", "label").attr("style", Lt(t.labelStyle));
  let s;
  t.label === void 0 ? s = "" : s = typeof t.label == "string" ? t.label : t.label[0];
  const c = await Be(o, Ne(Xe(s), nt()), {
    useHtmlLabels: n,
    width: t.width || ((f = nt().flowchart) == null ? void 0 : f.wrappingWidth),
    // @ts-expect-error -- This is currently not used. Should this be `classes` instead?
    cssClasses: "markdown-node-label",
    style: t.labelStyle,
    addSvgBackground: !!t.icon || !!t.img
  });
  let l = c.getBBox();
  const h = ((t == null ? void 0 : t.padding) ?? 0) / 2;
  if (n) {
    const p = c.children[0], g = et(c), m = p.getElementsByTagName("img");
    if (m) {
      const y = s.replace(/<img[^>]*>/g, "").trim() === "";
      await Promise.all(
        [...m].map(
          (x) => new Promise((b) => {
            function _() {
              if (x.style.display = "flex", x.style.flexDirection = "column", y) {
                const S = nt().fontSize ? nt().fontSize : window.getComputedStyle(document.body).fontSize, k = 5, [C = jl.fontSize] = qn(S), w = C * k + "px";
                x.style.minWidth = w, x.style.maxWidth = w;
              } else
                x.style.width = "100%";
              b(x);
            }
            d(_, "setupImage"), setTimeout(() => {
              x.complete && _();
            }), x.addEventListener("error", _), x.addEventListener("load", _);
          })
        )
      );
    }
    l = p.getBoundingClientRect(), g.attr("width", l.width), g.attr("height", l.height);
  }
  return n ? o.attr("transform", "translate(" + -l.width / 2 + ", " + -l.height / 2 + ")") : o.attr("transform", "translate(0, " + -l.height / 2 + ")"), t.centerLabel && o.attr("transform", "translate(" + -l.width / 2 + ", " + -l.height / 2 + ")"), o.insert("rect", ":first-child"), { shapeSvg: a, bbox: l, halfPadding: h, label: o };
}, "labelHelper"), ca = /* @__PURE__ */ d(async (e, t, r) => {
  var c, l, h, u, f, p;
  const i = r.useHtmlLabels || gt((l = (c = nt()) == null ? void 0 : c.flowchart) == null ? void 0 : l.htmlLabels), n = e.insert("g").attr("class", "label").attr("style", r.labelStyle || ""), a = await Be(n, Ne(Xe(t), nt()), {
    useHtmlLabels: i,
    width: r.width || ((u = (h = nt()) == null ? void 0 : h.flowchart) == null ? void 0 : u.wrappingWidth),
    style: r.labelStyle,
    addSvgBackground: !!r.icon || !!r.img
  });
  let o = a.getBBox();
  const s = r.padding / 2;
  if (gt((p = (f = nt()) == null ? void 0 : f.flowchart) == null ? void 0 : p.htmlLabels)) {
    const g = a.children[0], m = et(a);
    o = g.getBoundingClientRect(), m.attr("width", o.width), m.attr("height", o.height);
  }
  return i ? n.attr("transform", "translate(" + -o.width / 2 + ", " + -o.height / 2 + ")") : n.attr("transform", "translate(0, " + -o.height / 2 + ")"), r.centerLabel && n.attr("transform", "translate(" + -o.width / 2 + ", " + -o.height / 2 + ")"), n.insert("rect", ":first-child"), { shapeSvg: e, bbox: o, halfPadding: s, label: n };
}, "insertLabel"), j = /* @__PURE__ */ d((e, t) => {
  const r = t.node().getBBox();
  e.width = r.width, e.height = r.height;
}, "updateNodeBounds"), Z = /* @__PURE__ */ d((e, t) => (e.look === "handDrawn" ? "rough-node" : "node") + " " + e.cssClasses + " " + (t || ""), "getNodeClasses");
function rt(e) {
  const t = e.map((r, i) => `${i === 0 ? "M" : "L"}${r.x},${r.y}`);
  return t.push("Z"), t.join(" ");
}
d(rt, "createPathFromPoints");
function Se(e, t, r, i, n, a) {
  const o = [], c = r - e, l = i - t, h = c / a, u = 2 * Math.PI / h, f = t + l / 2;
  for (let p = 0; p <= 50; p++) {
    const g = p / 50, m = e + g * c, y = f + n * Math.sin(u * (m - e));
    o.push({ x: m, y });
  }
  return o;
}
d(Se, "generateFullSineWavePoints");
function no(e, t, r, i, n, a) {
  const o = [], s = n * Math.PI / 180, h = (a * Math.PI / 180 - s) / (i - 1);
  for (let u = 0; u < i; u++) {
    const f = s + u * h, p = e + r * Math.cos(f), g = t + r * Math.sin(f);
    o.push({ x: -p, y: -g });
  }
  return o;
}
d(no, "generateCirclePoints");
var ew = /* @__PURE__ */ d((e, t) => {
  var r = e.x, i = e.y, n = t.x - r, a = t.y - i, o = e.width / 2, s = e.height / 2, c, l;
  return Math.abs(a) * o > Math.abs(n) * s ? (a < 0 && (s = -s), c = a === 0 ? 0 : s * n / a, l = s) : (n < 0 && (o = -o), c = o, l = n === 0 ? 0 : o * a / n), { x: r + c, y: i + l };
}, "intersectRect"), Tr = ew;
function $f(e, t) {
  t && e.attr("style", t);
}
d($f, "applyStyle");
async function Ff(e) {
  const t = et(document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")), r = t.append("xhtml:div");
  let i = e.label;
  e.label && mr(e.label) && (i = await cs(e.label.replace(kr.lineBreakRegex, `
`), nt()));
  const n = e.isNode ? "nodeLabel" : "edgeLabel";
  return r.html(
    '<span class="' + n + '" ' + (e.labelStyle ? 'style="' + e.labelStyle + '"' : "") + // codeql [js/html-constructed-from-input] : false positive
    ">" + i + "</span>"
  ), $f(r, e.labelStyle), r.style("display", "inline-block"), r.style("padding-right", "1px"), r.style("white-space", "nowrap"), r.attr("xmlns", "http://www.w3.org/1999/xhtml"), t.node();
}
d(Ff, "addHtmlLabel");
var rw = /* @__PURE__ */ d(async (e, t, r, i) => {
  let n = e || "";
  if (typeof n == "object" && (n = n[0]), gt(nt().flowchart.htmlLabels)) {
    n = n.replace(/\\n|\n/g, "<br />"), E.info("vertexText" + n);
    const a = {
      isNode: i,
      label: Xe(n).replace(
        /fa[blrs]?:fa-[\w-]+/g,
        (s) => `<i class='${s.replace(":", " ")}'></i>`
      ),
      labelStyle: t && t.replace("fill:", "color:")
    };
    return await Ff(a);
  } else {
    const a = document.createElementNS("http://www.w3.org/2000/svg", "text");
    a.setAttribute("style", t.replace("color:", "fill:"));
    let o = [];
    typeof n == "string" ? o = n.split(/\\n|\n|<br\s*\/?>/gi) : Array.isArray(n) ? o = n : o = [];
    for (const s of o) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      c.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), c.setAttribute("dy", "1em"), c.setAttribute("x", "0"), r ? c.setAttribute("class", "title-row") : c.setAttribute("class", "row"), c.textContent = s.trim(), a.appendChild(c);
    }
    return a;
  }
}, "createLabel"), Re = rw, pe = /* @__PURE__ */ d((e, t, r, i, n) => [
  "M",
  e + n,
  t,
  // Move to the first point
  "H",
  e + r - n,
  // Draw horizontal line to the beginning of the right corner
  "A",
  n,
  n,
  0,
  0,
  1,
  e + r,
  t + n,
  // Draw arc to the right top corner
  "V",
  t + i - n,
  // Draw vertical line down to the beginning of the right bottom corner
  "A",
  n,
  n,
  0,
  0,
  1,
  e + r - n,
  t + i,
  // Draw arc to the right bottom corner
  "H",
  e + n,
  // Draw horizontal line to the beginning of the left bottom corner
  "A",
  n,
  n,
  0,
  0,
  1,
  e,
  t + i - n,
  // Draw arc to the left bottom corner
  "V",
  t + n,
  // Draw vertical line up to the beginning of the left top corner
  "A",
  n,
  n,
  0,
  0,
  1,
  e + n,
  t,
  // Draw arc to the left top corner
  "Z"
  // Close the path
].join(" "), "createRoundedRectPathD"), iw = /* @__PURE__ */ d((e) => {
  const { handDrawnSeed: t } = nt();
  return {
    fill: e,
    hachureAngle: 120,
    // angle of hachure,
    hachureGap: 4,
    fillWeight: 2,
    roughness: 0.7,
    stroke: e,
    seed: t
  };
}, "solidStateFill"), Br = /* @__PURE__ */ d((e) => {
  const t = nw([...e.cssCompiledStyles || [], ...e.cssStyles || []]);
  return { stylesMap: t, stylesArray: [...t] };
}, "compileStyles"), nw = /* @__PURE__ */ d((e) => {
  const t = /* @__PURE__ */ new Map();
  return e.forEach((r) => {
    const [i, n] = r.split(":");
    t.set(i.trim(), n == null ? void 0 : n.trim());
  }), t;
}, "styles2Map"), Ef = /* @__PURE__ */ d((e) => e === "color" || e === "font-size" || e === "font-family" || e === "font-weight" || e === "font-style" || e === "text-decoration" || e === "text-align" || e === "text-transform" || e === "line-height" || e === "letter-spacing" || e === "word-spacing" || e === "text-shadow" || e === "text-overflow" || e === "white-space" || e === "word-wrap" || e === "word-break" || e === "overflow-wrap" || e === "hyphens", "isLabelStyle"), Y = /* @__PURE__ */ d((e) => {
  const { stylesArray: t } = Br(e), r = [], i = [], n = [], a = [];
  return t.forEach((o) => {
    const s = o[0];
    Ef(s) ? r.push(o.join(":") + " !important") : (i.push(o.join(":") + " !important"), s.includes("stroke") && n.push(o.join(":") + " !important"), s === "fill" && a.push(o.join(":") + " !important"));
  }), {
    labelStyles: r.join(";"),
    nodeStyles: i.join(";"),
    stylesArray: t,
    borderStyles: n,
    backgroundStyles: a
  };
}, "styles2String"), H = /* @__PURE__ */ d((e, t) => {
  var c;
  const { themeVariables: r, handDrawnSeed: i } = nt(), { nodeBorder: n, mainBkg: a } = r, { stylesMap: o } = Br(e);
  return Object.assign(
    {
      roughness: 0.7,
      fill: o.get("fill") || a,
      fillStyle: "hachure",
      // solid fill
      fillWeight: 4,
      hachureGap: 5.2,
      stroke: o.get("stroke") || n,
      seed: i,
      strokeWidth: ((c = o.get("stroke-width")) == null ? void 0 : c.replace("px", "")) || 1.3,
      fillLineDash: [0, 0]
    },
    t
  );
}, "userNodeOverrides"), Of = /* @__PURE__ */ d(async (e, t) => {
  E.info("Creating subgraph rect for ", t.id, t);
  const r = nt(), { themeVariables: i, handDrawnSeed: n } = r, { clusterBkg: a, clusterBorder: o } = i, { labelStyles: s, nodeStyles: c, borderStyles: l, backgroundStyles: h } = Y(t), u = e.insert("g").attr("class", "cluster " + t.cssClasses).attr("id", t.id).attr("data-look", t.look), f = gt(r.flowchart.htmlLabels), p = u.insert("g").attr("class", "cluster-label "), g = await Be(p, t.label, {
    style: t.labelStyle,
    useHtmlLabels: f,
    isNode: !0
  });
  let m = g.getBBox();
  if (gt(r.flowchart.htmlLabels)) {
    const w = g.children[0], O = et(g);
    m = w.getBoundingClientRect(), O.attr("width", m.width), O.attr("height", m.height);
  }
  const y = t.width <= m.width + t.padding ? m.width + t.padding : t.width;
  t.width <= m.width + t.padding ? t.diff = (y - t.width) / 2 - t.padding : t.diff = -t.padding;
  const x = t.height, b = t.x - y / 2, _ = t.y - x / 2;
  E.trace("Data ", t, JSON.stringify(t));
  let S;
  if (t.look === "handDrawn") {
    const w = W.svg(u), O = H(t, {
      roughness: 0.7,
      fill: a,
      // fill: 'red',
      stroke: o,
      fillWeight: 3,
      seed: n
    }), I = w.path(pe(b, _, y, x, 0), O);
    S = u.insert(() => (E.debug("Rough node insert CXC", I), I), ":first-child"), S.select("path:nth-child(2)").attr("style", l.join(";")), S.select("path").attr("style", h.join(";").replace("fill", "stroke"));
  } else
    S = u.insert("rect", ":first-child"), S.attr("style", c).attr("rx", t.rx).attr("ry", t.ry).attr("x", b).attr("y", _).attr("width", y).attr("height", x);
  const { subGraphTitleTopMargin: k } = ws(r);
  if (p.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x - m.width / 2}, ${t.y - t.height / 2 + k})`
  ), s) {
    const w = p.select("span");
    w && w.attr("style", s);
  }
  const C = S.node().getBBox();
  return t.offsetX = 0, t.width = C.width, t.height = C.height, t.offsetY = m.height - t.padding / 2, t.intersect = function(w) {
    return Tr(t, w);
  }, { cluster: u, labelBBox: m };
}, "rect"), aw = /* @__PURE__ */ d((e, t) => {
  const r = e.insert("g").attr("class", "note-cluster").attr("id", t.id), i = r.insert("rect", ":first-child"), n = 0 * t.padding, a = n / 2;
  i.attr("rx", t.rx).attr("ry", t.ry).attr("x", t.x - t.width / 2 - a).attr("y", t.y - t.height / 2 - a).attr("width", t.width + n).attr("height", t.height + n).attr("fill", "none");
  const o = i.node().getBBox();
  return t.width = o.width, t.height = o.height, t.intersect = function(s) {
    return Tr(t, s);
  }, { cluster: r, labelBBox: { width: 0, height: 0 } };
}, "noteGroup"), sw = /* @__PURE__ */ d(async (e, t) => {
  const r = nt(), { themeVariables: i, handDrawnSeed: n } = r, { altBackground: a, compositeBackground: o, compositeTitleBackground: s, nodeBorder: c } = i, l = e.insert("g").attr("class", t.cssClasses).attr("id", t.id).attr("data-id", t.id).attr("data-look", t.look), h = l.insert("g", ":first-child"), u = l.insert("g").attr("class", "cluster-label");
  let f = l.append("rect");
  const p = u.node().appendChild(await Re(t.label, t.labelStyle, void 0, !0));
  let g = p.getBBox();
  if (gt(r.flowchart.htmlLabels)) {
    const I = p.children[0], F = et(p);
    g = I.getBoundingClientRect(), F.attr("width", g.width), F.attr("height", g.height);
  }
  const m = 0 * t.padding, y = m / 2, x = (t.width <= g.width + t.padding ? g.width + t.padding : t.width) + m;
  t.width <= g.width + t.padding ? t.diff = (x - t.width) / 2 - t.padding : t.diff = -t.padding;
  const b = t.height + m, _ = t.height + m - g.height - 6, S = t.x - x / 2, k = t.y - b / 2;
  t.width = x;
  const C = t.y - t.height / 2 - y + g.height + 2;
  let w;
  if (t.look === "handDrawn") {
    const I = t.cssClasses.includes("statediagram-cluster-alt"), F = W.svg(l), M = t.rx || t.ry ? F.path(pe(S, k, x, b, 10), {
      roughness: 0.7,
      fill: s,
      fillStyle: "solid",
      stroke: c,
      seed: n
    }) : F.rectangle(S, k, x, b, { seed: n });
    w = l.insert(() => M, ":first-child");
    const P = F.rectangle(S, C, x, _, {
      fill: I ? a : o,
      fillStyle: I ? "hachure" : "solid",
      stroke: c,
      seed: n
    });
    w = l.insert(() => M, ":first-child"), f = l.insert(() => P);
  } else
    w = h.insert("rect", ":first-child"), w.attr("class", "outer").attr("x", S).attr("y", k).attr("width", x).attr("height", b).attr("data-look", t.look), f.attr("class", "inner").attr("x", S).attr("y", C).attr("width", x).attr("height", _);
  u.attr(
    "transform",
    `translate(${t.x - g.width / 2}, ${k + 1 - (gt(r.flowchart.htmlLabels) ? 0 : 3)})`
  );
  const O = w.node().getBBox();
  return t.height = O.height, t.offsetX = 0, t.offsetY = g.height - t.padding / 2, t.labelBBox = g, t.intersect = function(I) {
    return Tr(t, I);
  }, { cluster: l, labelBBox: g };
}, "roundedWithTitle"), ow = /* @__PURE__ */ d(async (e, t) => {
  E.info("Creating subgraph rect for ", t.id, t);
  const r = nt(), { themeVariables: i, handDrawnSeed: n } = r, { clusterBkg: a, clusterBorder: o } = i, { labelStyles: s, nodeStyles: c, borderStyles: l, backgroundStyles: h } = Y(t), u = e.insert("g").attr("class", "cluster " + t.cssClasses).attr("id", t.id).attr("data-look", t.look), f = gt(r.flowchart.htmlLabels), p = u.insert("g").attr("class", "cluster-label "), g = await Be(p, t.label, {
    style: t.labelStyle,
    useHtmlLabels: f,
    isNode: !0,
    width: t.width
  });
  let m = g.getBBox();
  if (gt(r.flowchart.htmlLabels)) {
    const w = g.children[0], O = et(g);
    m = w.getBoundingClientRect(), O.attr("width", m.width), O.attr("height", m.height);
  }
  const y = t.width <= m.width + t.padding ? m.width + t.padding : t.width;
  t.width <= m.width + t.padding ? t.diff = (y - t.width) / 2 - t.padding : t.diff = -t.padding;
  const x = t.height, b = t.x - y / 2, _ = t.y - x / 2;
  E.trace("Data ", t, JSON.stringify(t));
  let S;
  if (t.look === "handDrawn") {
    const w = W.svg(u), O = H(t, {
      roughness: 0.7,
      fill: a,
      // fill: 'red',
      stroke: o,
      fillWeight: 4,
      seed: n
    }), I = w.path(pe(b, _, y, x, t.rx), O);
    S = u.insert(() => (E.debug("Rough node insert CXC", I), I), ":first-child"), S.select("path:nth-child(2)").attr("style", l.join(";")), S.select("path").attr("style", h.join(";").replace("fill", "stroke"));
  } else
    S = u.insert("rect", ":first-child"), S.attr("style", c).attr("rx", t.rx).attr("ry", t.ry).attr("x", b).attr("y", _).attr("width", y).attr("height", x);
  const { subGraphTitleTopMargin: k } = ws(r);
  if (p.attr(
    "transform",
    // This puts the label on top of the box instead of inside it
    `translate(${t.x - m.width / 2}, ${t.y - t.height / 2 + k})`
  ), s) {
    const w = p.select("span");
    w && w.attr("style", s);
  }
  const C = S.node().getBBox();
  return t.offsetX = 0, t.width = C.width, t.height = C.height, t.offsetY = m.height - t.padding / 2, t.intersect = function(w) {
    return Tr(t, w);
  }, { cluster: u, labelBBox: m };
}, "kanbanSection"), lw = /* @__PURE__ */ d((e, t) => {
  const r = nt(), { themeVariables: i, handDrawnSeed: n } = r, { nodeBorder: a } = i, o = e.insert("g").attr("class", t.cssClasses).attr("id", t.id).attr("data-look", t.look), s = o.insert("g", ":first-child"), c = 0 * t.padding, l = t.width + c;
  t.diff = -t.padding;
  const h = t.height + c, u = t.x - l / 2, f = t.y - h / 2;
  t.width = l;
  let p;
  if (t.look === "handDrawn") {
    const y = W.svg(o).rectangle(u, f, l, h, {
      fill: "lightgrey",
      roughness: 0.5,
      strokeLineDash: [5],
      stroke: a,
      seed: n
    });
    p = o.insert(() => y, ":first-child");
  } else
    p = s.insert("rect", ":first-child"), p.attr("class", "divider").attr("x", u).attr("y", f).attr("width", l).attr("height", h).attr("data-look", t.look);
  const g = p.node().getBBox();
  return t.height = g.height, t.offsetX = 0, t.offsetY = 0, t.intersect = function(m) {
    return Tr(t, m);
  }, { cluster: o, labelBBox: {} };
}, "divider"), cw = Of, hw = {
  rect: Of,
  squareRect: cw,
  roundedWithTitle: sw,
  noteGroup: aw,
  divider: lw,
  kanbanSection: ow
}, Df = /* @__PURE__ */ new Map(), uw = /* @__PURE__ */ d(async (e, t) => {
  const r = t.shape || "rect", i = await hw[r](e, t);
  return Df.set(t.id, i), i;
}, "insertCluster"), $T = /* @__PURE__ */ d(() => {
  Df = /* @__PURE__ */ new Map();
}, "clear");
function Rf(e, t) {
  return e.intersect(t);
}
d(Rf, "intersectNode");
var fw = Rf;
function If(e, t, r, i) {
  var n = e.x, a = e.y, o = n - i.x, s = a - i.y, c = Math.sqrt(t * t * s * s + r * r * o * o), l = Math.abs(t * r * o / c);
  i.x < n && (l = -l);
  var h = Math.abs(t * r * s / c);
  return i.y < a && (h = -h), { x: n + l, y: a + h };
}
d(If, "intersectEllipse");
var Pf = If;
function Nf(e, t, r) {
  return Pf(e, t, t, r);
}
d(Nf, "intersectCircle");
var pw = Nf;
function zf(e, t, r, i) {
  var n, a, o, s, c, l, h, u, f, p, g, m, y, x, b;
  if (n = t.y - e.y, o = e.x - t.x, c = t.x * e.y - e.x * t.y, f = n * r.x + o * r.y + c, p = n * i.x + o * i.y + c, !(f !== 0 && p !== 0 && Ka(f, p)) && (a = i.y - r.y, s = r.x - i.x, l = i.x * r.y - r.x * i.y, h = a * e.x + s * e.y + l, u = a * t.x + s * t.y + l, !(h !== 0 && u !== 0 && Ka(h, u)) && (g = n * s - a * o, g !== 0)))
    return m = Math.abs(g / 2), y = o * l - s * c, x = y < 0 ? (y - m) / g : (y + m) / g, y = a * c - n * l, b = y < 0 ? (y - m) / g : (y + m) / g, { x, y: b };
}
d(zf, "intersectLine");
function Ka(e, t) {
  return e * t > 0;
}
d(Ka, "sameSign");
var dw = zf;
function qf(e, t, r) {
  let i = e.x, n = e.y, a = [], o = Number.POSITIVE_INFINITY, s = Number.POSITIVE_INFINITY;
  typeof t.forEach == "function" ? t.forEach(function(h) {
    o = Math.min(o, h.x), s = Math.min(s, h.y);
  }) : (o = Math.min(o, t.x), s = Math.min(s, t.y));
  let c = i - e.width / 2 - o, l = n - e.height / 2 - s;
  for (let h = 0; h < t.length; h++) {
    let u = t[h], f = t[h < t.length - 1 ? h + 1 : 0], p = dw(
      e,
      r,
      { x: c + u.x, y: l + u.y },
      { x: c + f.x, y: l + f.y }
    );
    p && a.push(p);
  }
  return a.length ? (a.length > 1 && a.sort(function(h, u) {
    let f = h.x - r.x, p = h.y - r.y, g = Math.sqrt(f * f + p * p), m = u.x - r.x, y = u.y - r.y, x = Math.sqrt(m * m + y * y);
    return g < x ? -1 : g === x ? 0 : 1;
  }), a[0]) : e;
}
d(qf, "intersectPolygon");
var gw = qf, q = {
  node: fw,
  circle: pw,
  ellipse: Pf,
  polygon: gw,
  rect: Tr
};
function Wf(e, t) {
  const { labelStyles: r } = Y(t);
  t.labelStyle = r;
  const i = Z(t);
  let n = i;
  i || (n = "anchor");
  const a = e.insert("g").attr("class", n).attr("id", t.domId || t.id), o = 1, { cssStyles: s } = t, c = W.svg(a), l = H(t, { fill: "black", stroke: "none", fillStyle: "solid" });
  t.look !== "handDrawn" && (l.roughness = 0);
  const h = c.circle(0, 0, o * 2, l), u = a.insert(() => h, ":first-child");
  return u.attr("class", "anchor").attr("style", Lt(s)), j(t, u), t.intersect = function(f) {
    return E.info("Circle intersect", t, o, f), q.circle(t, o, f);
  }, a;
}
d(Wf, "anchor");
function Qa(e, t, r, i, n, a, o) {
  const c = (e + r) / 2, l = (t + i) / 2, h = Math.atan2(i - t, r - e), u = (r - e) / 2, f = (i - t) / 2, p = u / n, g = f / a, m = Math.sqrt(p ** 2 + g ** 2);
  if (m > 1)
    throw new Error("The given radii are too small to create an arc between the points.");
  const y = Math.sqrt(1 - m ** 2), x = c + y * a * Math.sin(h) * (o ? -1 : 1), b = l - y * n * Math.cos(h) * (o ? -1 : 1), _ = Math.atan2((t - b) / a, (e - x) / n);
  let k = Math.atan2((i - b) / a, (r - x) / n) - _;
  o && k < 0 && (k += 2 * Math.PI), !o && k > 0 && (k -= 2 * Math.PI);
  const C = [];
  for (let w = 0; w < 20; w++) {
    const O = w / 19, I = _ + O * k, F = x + n * Math.cos(I), M = b + a * Math.sin(I);
    C.push({ x: F, y: M });
  }
  return C;
}
d(Qa, "generateArcPoints");
async function Hf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = a.width + t.padding + 20, s = a.height + t.padding, c = s / 2, l = c / (2.5 + s / 50), { cssStyles: h } = t, u = [
    { x: o / 2, y: -s / 2 },
    { x: -o / 2, y: -s / 2 },
    ...Qa(-o / 2, -s / 2, -o / 2, s / 2, l, c, !1),
    { x: o / 2, y: s / 2 },
    ...Qa(o / 2, s / 2, o / 2, -s / 2, l, c, !0)
  ], f = W.svg(n), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = rt(u), m = f.path(g, p), y = n.insert(() => m, ":first-child");
  return y.attr("class", "basic label-container"), h && t.look !== "handDrawn" && y.selectAll("path").attr("style", h), i && t.look !== "handDrawn" && y.selectAll("path").attr("style", i), y.attr("transform", `translate(${l / 2}, 0)`), j(t, y), t.intersect = function(x) {
    return q.polygon(t, u, x);
  }, n;
}
d(Hf, "bowTieRect");
function de(e, t, r, i) {
  return e.insert("polygon", ":first-child").attr(
    "points",
    i.map(function(n) {
      return n.x + "," + n.y;
    }).join(" ")
  ).attr("class", "label-container").attr("transform", "translate(" + -t / 2 + "," + r / 2 + ")");
}
d(de, "insertPolygonShape");
async function jf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = a.height + t.padding, s = 12, c = a.width + t.padding + s, l = 0, h = c, u = -o, f = 0, p = [
    { x: l + s, y: u },
    { x: h, y: u },
    { x: h, y: f },
    { x: l, y: f },
    { x: l, y: u + s },
    { x: l + s, y: u }
  ];
  let g;
  const { cssStyles: m } = t;
  if (t.look === "handDrawn") {
    const y = W.svg(n), x = H(t, {}), b = rt(p), _ = y.path(b, x);
    g = n.insert(() => _, ":first-child").attr("transform", `translate(${-c / 2}, ${o / 2})`), m && g.attr("style", m);
  } else
    g = de(n, c, o, p);
  return i && g.attr("style", i), j(t, g), t.intersect = function(y) {
    return q.polygon(t, p, y);
  }, n;
}
d(jf, "card");
function Yf(e, t) {
  const { nodeStyles: r } = Y(t);
  t.label = "";
  const i = e.insert("g").attr("class", Z(t)).attr("id", t.domId ?? t.id), { cssStyles: n } = t, a = Math.max(28, t.width ?? 0), o = [
    { x: 0, y: a / 2 },
    { x: a / 2, y: 0 },
    { x: 0, y: -a / 2 },
    { x: -a / 2, y: 0 }
  ], s = W.svg(i), c = H(t, {});
  t.look !== "handDrawn" && (c.roughness = 0, c.fillStyle = "solid");
  const l = rt(o), h = s.path(l, c), u = i.insert(() => h, ":first-child");
  return n && t.look !== "handDrawn" && u.selectAll("path").attr("style", n), r && t.look !== "handDrawn" && u.selectAll("path").attr("style", r), t.width = 28, t.height = 28, t.intersect = function(f) {
    return q.polygon(t, o, f);
  }, i;
}
d(Yf, "choice");
async function Gf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, halfPadding: o } = await J(e, t, Z(t)), s = a.width / 2 + o;
  let c;
  const { cssStyles: l } = t;
  if (t.look === "handDrawn") {
    const h = W.svg(n), u = H(t, {}), f = h.circle(0, 0, s * 2, u);
    c = n.insert(() => f, ":first-child"), c.attr("class", "basic label-container").attr("style", Lt(l));
  } else
    c = n.insert("circle", ":first-child").attr("class", "basic label-container").attr("style", i).attr("r", s).attr("cx", 0).attr("cy", 0);
  return j(t, c), t.intersect = function(h) {
    return E.info("Circle intersect", t, s, h), q.circle(t, s, h);
  }, n;
}
d(Gf, "circle");
function Uf(e) {
  const t = Math.cos(Math.PI / 4), r = Math.sin(Math.PI / 4), i = e * 2, n = { x: i / 2 * t, y: i / 2 * r }, a = { x: -(i / 2) * t, y: i / 2 * r }, o = { x: -(i / 2) * t, y: -(i / 2) * r }, s = { x: i / 2 * t, y: -(i / 2) * r };
  return `M ${a.x},${a.y} L ${s.x},${s.y}
                   M ${n.x},${n.y} L ${o.x},${o.y}`;
}
d(Uf, "createLine");
function Xf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r, t.label = "";
  const n = e.insert("g").attr("class", Z(t)).attr("id", t.domId ?? t.id), a = Math.max(30, (t == null ? void 0 : t.width) ?? 0), { cssStyles: o } = t, s = W.svg(n), c = H(t, {});
  t.look !== "handDrawn" && (c.roughness = 0, c.fillStyle = "solid");
  const l = s.circle(0, 0, a * 2, c), h = Uf(a), u = s.path(h, c), f = n.insert(() => l, ":first-child");
  return f.insert(() => u), o && t.look !== "handDrawn" && f.selectAll("path").attr("style", o), i && t.look !== "handDrawn" && f.selectAll("path").attr("style", i), j(t, f), t.intersect = function(p) {
    return E.info("crossedCircle intersect", t, { radius: a, point: p }), q.circle(t, a, p);
  }, n;
}
d(Xf, "crossedCircle");
function ne(e, t, r, i = 100, n = 0, a = 180) {
  const o = [], s = n * Math.PI / 180, h = (a * Math.PI / 180 - s) / (i - 1);
  for (let u = 0; u < i; u++) {
    const f = s + u * h, p = e + r * Math.cos(f), g = t + r * Math.sin(f);
    o.push({ x: -p, y: -g });
  }
  return o;
}
d(ne, "generateCirclePoints");
async function Vf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = a.width + (t.padding ?? 0), c = a.height + (t.padding ?? 0), l = Math.max(5, c * 0.1), { cssStyles: h } = t, u = [
    ...ne(s / 2, -c / 2, l, 30, -90, 0),
    { x: -s / 2 - l, y: l },
    ...ne(s / 2 + l * 2, -l, l, 20, -180, -270),
    ...ne(s / 2 + l * 2, l, l, 20, -90, -180),
    { x: -s / 2 - l, y: -c / 2 },
    ...ne(s / 2, c / 2, l, 20, 0, 90)
  ], f = [
    { x: s / 2, y: -c / 2 - l },
    { x: -s / 2, y: -c / 2 - l },
    ...ne(s / 2, -c / 2, l, 20, -90, 0),
    { x: -s / 2 - l, y: -l },
    ...ne(s / 2 + s * 0.1, -l, l, 20, -180, -270),
    ...ne(s / 2 + s * 0.1, l, l, 20, -90, -180),
    { x: -s / 2 - l, y: c / 2 },
    ...ne(s / 2, c / 2, l, 20, 0, 90),
    { x: -s / 2, y: c / 2 + l },
    { x: s / 2, y: c / 2 + l }
  ], p = W.svg(n), g = H(t, { fill: "none" });
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const y = rt(u).replace("Z", ""), x = p.path(y, g), b = rt(f), _ = p.path(b, { ...g }), S = n.insert("g", ":first-child");
  return S.insert(() => _, ":first-child").attr("stroke-opacity", 0), S.insert(() => x, ":first-child"), S.attr("class", "text"), h && t.look !== "handDrawn" && S.selectAll("path").attr("style", h), i && t.look !== "handDrawn" && S.selectAll("path").attr("style", i), S.attr("transform", `translate(${l}, 0)`), o.attr(
    "transform",
    `translate(${-s / 2 + l - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, S), t.intersect = function(k) {
    return q.polygon(t, f, k);
  }, n;
}
d(Vf, "curlyBraceLeft");
function ae(e, t, r, i = 100, n = 0, a = 180) {
  const o = [], s = n * Math.PI / 180, h = (a * Math.PI / 180 - s) / (i - 1);
  for (let u = 0; u < i; u++) {
    const f = s + u * h, p = e + r * Math.cos(f), g = t + r * Math.sin(f);
    o.push({ x: p, y: g });
  }
  return o;
}
d(ae, "generateCirclePoints");
async function Zf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = a.width + (t.padding ?? 0), c = a.height + (t.padding ?? 0), l = Math.max(5, c * 0.1), { cssStyles: h } = t, u = [
    ...ae(s / 2, -c / 2, l, 20, -90, 0),
    { x: s / 2 + l, y: -l },
    ...ae(s / 2 + l * 2, -l, l, 20, -180, -270),
    ...ae(s / 2 + l * 2, l, l, 20, -90, -180),
    { x: s / 2 + l, y: c / 2 },
    ...ae(s / 2, c / 2, l, 20, 0, 90)
  ], f = [
    { x: -s / 2, y: -c / 2 - l },
    { x: s / 2, y: -c / 2 - l },
    ...ae(s / 2, -c / 2, l, 20, -90, 0),
    { x: s / 2 + l, y: -l },
    ...ae(s / 2 + l * 2, -l, l, 20, -180, -270),
    ...ae(s / 2 + l * 2, l, l, 20, -90, -180),
    { x: s / 2 + l, y: c / 2 },
    ...ae(s / 2, c / 2, l, 20, 0, 90),
    { x: s / 2, y: c / 2 + l },
    { x: -s / 2, y: c / 2 + l }
  ], p = W.svg(n), g = H(t, { fill: "none" });
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const y = rt(u).replace("Z", ""), x = p.path(y, g), b = rt(f), _ = p.path(b, { ...g }), S = n.insert("g", ":first-child");
  return S.insert(() => _, ":first-child").attr("stroke-opacity", 0), S.insert(() => x, ":first-child"), S.attr("class", "text"), h && t.look !== "handDrawn" && S.selectAll("path").attr("style", h), i && t.look !== "handDrawn" && S.selectAll("path").attr("style", i), S.attr("transform", `translate(${-l}, 0)`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) / 2 - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, S), t.intersect = function(k) {
    return q.polygon(t, f, k);
  }, n;
}
d(Zf, "curlyBraceRight");
function xt(e, t, r, i = 100, n = 0, a = 180) {
  const o = [], s = n * Math.PI / 180, h = (a * Math.PI / 180 - s) / (i - 1);
  for (let u = 0; u < i; u++) {
    const f = s + u * h, p = e + r * Math.cos(f), g = t + r * Math.sin(f);
    o.push({ x: -p, y: -g });
  }
  return o;
}
d(xt, "generateCirclePoints");
async function Kf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = a.width + (t.padding ?? 0), c = a.height + (t.padding ?? 0), l = Math.max(5, c * 0.1), { cssStyles: h } = t, u = [
    ...xt(s / 2, -c / 2, l, 30, -90, 0),
    { x: -s / 2 - l, y: l },
    ...xt(s / 2 + l * 2, -l, l, 20, -180, -270),
    ...xt(s / 2 + l * 2, l, l, 20, -90, -180),
    { x: -s / 2 - l, y: -c / 2 },
    ...xt(s / 2, c / 2, l, 20, 0, 90)
  ], f = [
    ...xt(-s / 2 + l + l / 2, -c / 2, l, 20, -90, -180),
    { x: s / 2 - l / 2, y: l },
    ...xt(-s / 2 - l / 2, -l, l, 20, 0, 90),
    ...xt(-s / 2 - l / 2, l, l, 20, -90, 0),
    { x: s / 2 - l / 2, y: -l },
    ...xt(-s / 2 + l + l / 2, c / 2, l, 30, -180, -270)
  ], p = [
    { x: s / 2, y: -c / 2 - l },
    { x: -s / 2, y: -c / 2 - l },
    ...xt(s / 2, -c / 2, l, 20, -90, 0),
    { x: -s / 2 - l, y: -l },
    ...xt(s / 2 + l * 2, -l, l, 20, -180, -270),
    ...xt(s / 2 + l * 2, l, l, 20, -90, -180),
    { x: -s / 2 - l, y: c / 2 },
    ...xt(s / 2, c / 2, l, 20, 0, 90),
    { x: -s / 2, y: c / 2 + l },
    { x: s / 2 - l - l / 2, y: c / 2 + l },
    ...xt(-s / 2 + l + l / 2, -c / 2, l, 20, -90, -180),
    { x: s / 2 - l / 2, y: l },
    ...xt(-s / 2 - l / 2, -l, l, 20, 0, 90),
    ...xt(-s / 2 - l / 2, l, l, 20, -90, 0),
    { x: s / 2 - l / 2, y: -l },
    ...xt(-s / 2 + l + l / 2, c / 2, l, 30, -180, -270)
  ], g = W.svg(n), m = H(t, { fill: "none" });
  t.look !== "handDrawn" && (m.roughness = 0, m.fillStyle = "solid");
  const x = rt(u).replace("Z", ""), b = g.path(x, m), S = rt(f).replace("Z", ""), k = g.path(S, m), C = rt(p), w = g.path(C, { ...m }), O = n.insert("g", ":first-child");
  return O.insert(() => w, ":first-child").attr("stroke-opacity", 0), O.insert(() => b, ":first-child"), O.insert(() => k, ":first-child"), O.attr("class", "text"), h && t.look !== "handDrawn" && O.selectAll("path").attr("style", h), i && t.look !== "handDrawn" && O.selectAll("path").attr("style", i), O.attr("transform", `translate(${l - l / 4}, 0)`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) / 2 - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, O), t.intersect = function(I) {
    return q.polygon(t, p, I);
  }, n;
}
d(Kf, "curlyBraces");
async function Qf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = 80, s = 20, c = Math.max(o, (a.width + (t.padding ?? 0) * 2) * 1.25, (t == null ? void 0 : t.width) ?? 0), l = Math.max(s, a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), h = l / 2, { cssStyles: u } = t, f = W.svg(n), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = c, m = l, y = g - h, x = m / 4, b = [
    { x: y, y: 0 },
    { x, y: 0 },
    { x: 0, y: m / 2 },
    { x, y: m },
    { x: y, y: m },
    ...no(-y, -m / 2, h, 50, 270, 90)
  ], _ = rt(b), S = f.path(_, p), k = n.insert(() => S, ":first-child");
  return k.attr("class", "basic label-container"), u && t.look !== "handDrawn" && k.selectChildren("path").attr("style", u), i && t.look !== "handDrawn" && k.selectChildren("path").attr("style", i), k.attr("transform", `translate(${-c / 2}, ${-l / 2})`), j(t, k), t.intersect = function(C) {
    return q.polygon(t, b, C);
  }, n;
}
d(Qf, "curvedTrapezoid");
var mw = /* @__PURE__ */ d((e, t, r, i, n, a) => [
  `M${e},${t + a}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `a${n},${a} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `l0,${-i}`
].join(" "), "createCylinderPathD"), yw = /* @__PURE__ */ d((e, t, r, i, n, a) => [
  `M${e},${t + a}`,
  `M${e + r},${t + a}`,
  `a${n},${a} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `l0,${-i}`
].join(" "), "createOuterCylinderPathD"), xw = /* @__PURE__ */ d((e, t, r, i, n, a) => [`M${e - r / 2},${-i / 2}`, `a${n},${a} 0,0,0 ${r},0`].join(" "), "createInnerCylinderPathD");
async function Jf(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + t.padding, t.width ?? 0), c = s / 2, l = c / (2.5 + s / 50), h = Math.max(a.height + l + t.padding, t.height ?? 0);
  let u;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const p = W.svg(n), g = yw(0, 0, s, h, c, l), m = xw(0, l, s, h, c, l), y = p.path(g, H(t, {})), x = p.path(m, H(t, { fill: "none" }));
    u = n.insert(() => x, ":first-child"), u = n.insert(() => y, ":first-child"), u.attr("class", "basic label-container"), f && u.attr("style", f);
  } else {
    const p = mw(0, 0, s, h, c, l);
    u = n.insert("path", ":first-child").attr("d", p).attr("class", "basic label-container").attr("style", Lt(f)).attr("style", i);
  }
  return u.attr("label-offset-y", l), u.attr("transform", `translate(${-s / 2}, ${-(h / 2 + l)})`), j(t, u), o.attr(
    "transform",
    `translate(${-(a.width / 2) - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + (t.padding ?? 0) / 1.5 - (a.y - (a.top ?? 0))})`
  ), t.intersect = function(p) {
    const g = q.rect(t, p), m = g.x - (t.x ?? 0);
    if (c != 0 && (Math.abs(m) < (t.width ?? 0) / 2 || Math.abs(m) == (t.width ?? 0) / 2 && Math.abs(g.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - l)) {
      let y = l * l * (1 - m * m / (c * c));
      y > 0 && (y = Math.sqrt(y)), y = l - y, p.y - (t.y ?? 0) > 0 && (y = -y), g.y += y;
    }
    return g;
  }, n;
}
d(Jf, "cylinder");
async function tp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = a.width + t.padding, c = a.height + t.padding, l = c * 0.2, h = -s / 2, u = -c / 2 - l / 2, { cssStyles: f } = t, p = W.svg(n), g = H(t, {});
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const m = [
    { x: h, y: u + l },
    { x: -h, y: u + l },
    { x: -h, y: -u },
    { x: h, y: -u },
    { x: h, y: u },
    { x: -h, y: u },
    { x: -h, y: u + l }
  ], y = p.polygon(
    m.map((b) => [b.x, b.y]),
    g
  ), x = n.insert(() => y, ":first-child");
  return x.attr("class", "basic label-container"), f && t.look !== "handDrawn" && x.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && x.selectAll("path").attr("style", i), o.attr(
    "transform",
    `translate(${h + (t.padding ?? 0) / 2 - (a.x - (a.left ?? 0))}, ${u + l + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, x), t.intersect = function(b) {
    return q.rect(t, b);
  }, n;
}
d(tp, "dividedRectangle");
async function ep(e, t) {
  var f, p;
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, halfPadding: o } = await J(e, t, Z(t)), c = a.width / 2 + o + 5, l = a.width / 2 + o;
  let h;
  const { cssStyles: u } = t;
  if (t.look === "handDrawn") {
    const g = W.svg(n), m = H(t, { roughness: 0.2, strokeWidth: 2.5 }), y = H(t, { roughness: 0.2, strokeWidth: 1.5 }), x = g.circle(0, 0, c * 2, m), b = g.circle(0, 0, l * 2, y);
    h = n.insert("g", ":first-child"), h.attr("class", Lt(t.cssClasses)).attr("style", Lt(u)), (f = h.node()) == null || f.appendChild(x), (p = h.node()) == null || p.appendChild(b);
  } else {
    h = n.insert("g", ":first-child");
    const g = h.insert("circle", ":first-child"), m = h.insert("circle");
    h.attr("class", "basic label-container").attr("style", i), g.attr("class", "outer-circle").attr("style", i).attr("r", c).attr("cx", 0).attr("cy", 0), m.attr("class", "inner-circle").attr("style", i).attr("r", l).attr("cx", 0).attr("cy", 0);
  }
  return j(t, h), t.intersect = function(g) {
    return E.info("DoubleCircle intersect", t, c, g), q.circle(t, c, g);
  }, n;
}
d(ep, "doublecircle");
function rp(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: n } = Y(t);
  t.label = "", t.labelStyle = i;
  const a = e.insert("g").attr("class", Z(t)).attr("id", t.domId ?? t.id), o = 7, { cssStyles: s } = t, c = W.svg(a), { nodeBorder: l } = r, h = H(t, { fillStyle: "solid" });
  t.look !== "handDrawn" && (h.roughness = 0);
  const u = c.circle(0, 0, o * 2, h), f = a.insert(() => u, ":first-child");
  return f.selectAll("path").attr("style", `fill: ${l} !important;`), s && s.length > 0 && t.look !== "handDrawn" && f.selectAll("path").attr("style", s), n && t.look !== "handDrawn" && f.selectAll("path").attr("style", n), j(t, f), t.intersect = function(p) {
    return E.info("filledCircle intersect", t, { radius: o, point: p }), q.circle(t, o, p);
  }, a;
}
d(rp, "filledCircle");
async function ip(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = a.width + (t.padding ?? 0), c = s + a.height, l = s + a.height, h = [
    { x: 0, y: -c },
    { x: l, y: -c },
    { x: l / 2, y: 0 }
  ], { cssStyles: u } = t, f = W.svg(n), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = rt(h), m = f.path(g, p), y = n.insert(() => m, ":first-child").attr("transform", `translate(${-c / 2}, ${c / 2})`);
  return u && t.look !== "handDrawn" && y.selectChildren("path").attr("style", u), i && t.look !== "handDrawn" && y.selectChildren("path").attr("style", i), t.width = s, t.height = c, j(t, y), o.attr(
    "transform",
    `translate(${-a.width / 2 - (a.x - (a.left ?? 0))}, ${-c / 2 + (t.padding ?? 0) / 2 + (a.y - (a.top ?? 0))})`
  ), t.intersect = function(x) {
    return E.info("Triangle intersect", t, h, x), q.polygon(t, h, x);
  }, n;
}
d(ip, "flippedTriangle");
function np(e, t, { dir: r, config: { state: i, themeVariables: n } }) {
  const { nodeStyles: a } = Y(t);
  t.label = "";
  const o = e.insert("g").attr("class", Z(t)).attr("id", t.domId ?? t.id), { cssStyles: s } = t;
  let c = Math.max(70, (t == null ? void 0 : t.width) ?? 0), l = Math.max(10, (t == null ? void 0 : t.height) ?? 0);
  r === "LR" && (c = Math.max(10, (t == null ? void 0 : t.width) ?? 0), l = Math.max(70, (t == null ? void 0 : t.height) ?? 0));
  const h = -1 * c / 2, u = -1 * l / 2, f = W.svg(o), p = H(t, {
    stroke: n.lineColor,
    fill: n.lineColor
  });
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = f.rectangle(h, u, c, l, p), m = o.insert(() => g, ":first-child");
  s && t.look !== "handDrawn" && m.selectAll("path").attr("style", s), a && t.look !== "handDrawn" && m.selectAll("path").attr("style", a), j(t, m);
  const y = (i == null ? void 0 : i.padding) ?? 0;
  return t.width && t.height && (t.width += y / 2 || 0, t.height += y / 2 || 0), t.intersect = function(x) {
    return q.rect(t, x);
  }, o;
}
d(np, "forkJoin");
async function ap(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const n = 80, a = 50, { shapeSvg: o, bbox: s } = await J(e, t, Z(t)), c = Math.max(n, s.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), l = Math.max(a, s.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), h = l / 2, { cssStyles: u } = t, f = W.svg(o), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = [
    { x: -c / 2, y: -l / 2 },
    { x: c / 2 - h, y: -l / 2 },
    ...no(-c / 2 + h, 0, h, 50, 90, 270),
    { x: c / 2 - h, y: l / 2 },
    { x: -c / 2, y: l / 2 }
  ], m = rt(g), y = f.path(m, p), x = o.insert(() => y, ":first-child");
  return x.attr("class", "basic label-container"), u && t.look !== "handDrawn" && x.selectChildren("path").attr("style", u), i && t.look !== "handDrawn" && x.selectChildren("path").attr("style", i), j(t, x), t.intersect = function(b) {
    return E.info("Pill intersect", t, { radius: h, point: b }), q.polygon(t, g, b);
  }, o;
}
d(ap, "halfRoundedRectangle");
var bw = /* @__PURE__ */ d((e, t, r, i, n) => [
  `M${e + n},${t}`,
  `L${e + r - n},${t}`,
  `L${e + r},${t - i / 2}`,
  `L${e + r - n},${t - i}`,
  `L${e + n},${t - i}`,
  `L${e},${t - i / 2}`,
  "Z"
].join(" "), "createHexagonPathD");
async function sp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = 4, s = a.height + t.padding, c = s / o, l = a.width + 2 * c + t.padding, h = [
    { x: c, y: 0 },
    { x: l - c, y: 0 },
    { x: l, y: -s / 2 },
    { x: l - c, y: -s },
    { x: c, y: -s },
    { x: 0, y: -s / 2 }
  ];
  let u;
  const { cssStyles: f } = t;
  if (t.look === "handDrawn") {
    const p = W.svg(n), g = H(t, {}), m = bw(0, 0, l, s, c), y = p.path(m, g);
    u = n.insert(() => y, ":first-child").attr("transform", `translate(${-l / 2}, ${s / 2})`), f && u.attr("style", f);
  } else
    u = de(n, l, s, h);
  return i && u.attr("style", i), t.width = l, t.height = s, j(t, u), t.intersect = function(p) {
    return q.polygon(t, h, p);
  }, n;
}
d(sp, "hexagon");
async function op(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.label = "", t.labelStyle = r;
  const { shapeSvg: n } = await J(e, t, Z(t)), a = Math.max(30, (t == null ? void 0 : t.width) ?? 0), o = Math.max(30, (t == null ? void 0 : t.height) ?? 0), { cssStyles: s } = t, c = W.svg(n), l = H(t, {});
  t.look !== "handDrawn" && (l.roughness = 0, l.fillStyle = "solid");
  const h = [
    { x: 0, y: 0 },
    { x: a, y: 0 },
    { x: 0, y: o },
    { x: a, y: o }
  ], u = rt(h), f = c.path(u, l), p = n.insert(() => f, ":first-child");
  return p.attr("class", "basic label-container"), s && t.look !== "handDrawn" && p.selectChildren("path").attr("style", s), i && t.look !== "handDrawn" && p.selectChildren("path").attr("style", i), p.attr("transform", `translate(${-a / 2}, ${-o / 2})`), j(t, p), t.intersect = function(g) {
    return E.info("Pill intersect", t, { points: h }), q.polygon(t, h, g);
  }, n;
}
d(op, "hourglass");
async function lp(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: n } = Y(t);
  t.labelStyle = n;
  const a = t.assetHeight ?? 48, o = t.assetWidth ?? 48, s = Math.max(a, o), c = i == null ? void 0 : i.wrappingWidth;
  t.width = Math.max(s, c ?? 0);
  const { shapeSvg: l, bbox: h, label: u } = await J(e, t, "icon-shape default"), f = t.pos === "t", p = s, g = s, { nodeBorder: m } = r, { stylesMap: y } = Br(t), x = -g / 2, b = -p / 2, _ = t.label ? 8 : 0, S = W.svg(l), k = H(t, { stroke: "none", fill: "none" });
  t.look !== "handDrawn" && (k.roughness = 0, k.fillStyle = "solid");
  const C = S.rectangle(x, b, g, p, k), w = Math.max(g, h.width), O = p + h.height + _, I = S.rectangle(-w / 2, -O / 2, w, O, {
    ...k,
    fill: "transparent",
    stroke: "none"
  }), F = l.insert(() => C, ":first-child"), M = l.insert(() => I);
  if (t.icon) {
    const P = l.append("g");
    P.html(
      `<g>${await An(t.icon, {
        height: s,
        width: s,
        fallbackPrefix: ""
      })}</g>`
    );
    const D = P.node().getBBox(), A = D.width, L = D.height, T = D.x, $ = D.y;
    P.attr(
      "transform",
      `translate(${-A / 2 - T},${f ? h.height / 2 + _ / 2 - L / 2 - $ : -h.height / 2 - _ / 2 - L / 2 - $})`
    ), P.attr("style", `color: ${y.get("stroke") ?? m};`);
  }
  return u.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${f ? -O / 2 : O / 2 - h.height})`
  ), F.attr(
    "transform",
    `translate(0,${f ? h.height / 2 + _ / 2 : -h.height / 2 - _ / 2})`
  ), j(t, M), t.intersect = function(P) {
    if (E.info("iconSquare intersect", t, P), !t.label)
      return q.rect(t, P);
    const D = t.x ?? 0, A = t.y ?? 0, L = t.height ?? 0;
    let T = [];
    return f ? T = [
      { x: D - h.width / 2, y: A - L / 2 },
      { x: D + h.width / 2, y: A - L / 2 },
      { x: D + h.width / 2, y: A - L / 2 + h.height + _ },
      { x: D + g / 2, y: A - L / 2 + h.height + _ },
      { x: D + g / 2, y: A + L / 2 },
      { x: D - g / 2, y: A + L / 2 },
      { x: D - g / 2, y: A - L / 2 + h.height + _ },
      { x: D - h.width / 2, y: A - L / 2 + h.height + _ }
    ] : T = [
      { x: D - g / 2, y: A - L / 2 },
      { x: D + g / 2, y: A - L / 2 },
      { x: D + g / 2, y: A - L / 2 + p },
      { x: D + h.width / 2, y: A - L / 2 + p },
      { x: D + h.width / 2 / 2, y: A + L / 2 },
      { x: D - h.width / 2, y: A + L / 2 },
      { x: D - h.width / 2, y: A - L / 2 + p },
      { x: D - g / 2, y: A - L / 2 + p }
    ], q.polygon(t, T, P);
  }, l;
}
d(lp, "icon");
async function cp(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: n } = Y(t);
  t.labelStyle = n;
  const a = t.assetHeight ?? 48, o = t.assetWidth ?? 48, s = Math.max(a, o), c = i == null ? void 0 : i.wrappingWidth;
  t.width = Math.max(s, c ?? 0);
  const { shapeSvg: l, bbox: h, label: u } = await J(e, t, "icon-shape default"), f = 20, p = t.label ? 8 : 0, g = t.pos === "t", { nodeBorder: m, mainBkg: y } = r, { stylesMap: x } = Br(t), b = W.svg(l), _ = H(t, {});
  t.look !== "handDrawn" && (_.roughness = 0, _.fillStyle = "solid");
  const S = x.get("fill");
  _.stroke = S ?? y;
  const k = l.append("g");
  t.icon && k.html(
    `<g>${await An(t.icon, {
      height: s,
      width: s,
      fallbackPrefix: ""
    })}</g>`
  );
  const C = k.node().getBBox(), w = C.width, O = C.height, I = C.x, F = C.y, M = Math.max(w, O) * Math.SQRT2 + f * 2, P = b.circle(0, 0, M, _), D = Math.max(M, h.width), A = M + h.height + p, L = b.rectangle(-D / 2, -A / 2, D, A, {
    ..._,
    fill: "transparent",
    stroke: "none"
  }), T = l.insert(() => P, ":first-child"), $ = l.insert(() => L);
  return k.attr(
    "transform",
    `translate(${-w / 2 - I},${g ? h.height / 2 + p / 2 - O / 2 - F : -h.height / 2 - p / 2 - O / 2 - F})`
  ), k.attr("style", `color: ${x.get("stroke") ?? m};`), u.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${g ? -A / 2 : A / 2 - h.height})`
  ), T.attr(
    "transform",
    `translate(0,${g ? h.height / 2 + p / 2 : -h.height / 2 - p / 2})`
  ), j(t, $), t.intersect = function(B) {
    return E.info("iconSquare intersect", t, B), q.rect(t, B);
  }, l;
}
d(cp, "iconCircle");
async function hp(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: n } = Y(t);
  t.labelStyle = n;
  const a = t.assetHeight ?? 48, o = t.assetWidth ?? 48, s = Math.max(a, o), c = i == null ? void 0 : i.wrappingWidth;
  t.width = Math.max(s, c ?? 0);
  const { shapeSvg: l, bbox: h, halfPadding: u, label: f } = await J(
    e,
    t,
    "icon-shape default"
  ), p = t.pos === "t", g = s + u * 2, m = s + u * 2, { nodeBorder: y, mainBkg: x } = r, { stylesMap: b } = Br(t), _ = -m / 2, S = -g / 2, k = t.label ? 8 : 0, C = W.svg(l), w = H(t, {});
  t.look !== "handDrawn" && (w.roughness = 0, w.fillStyle = "solid");
  const O = b.get("fill");
  w.stroke = O ?? x;
  const I = C.path(pe(_, S, m, g, 5), w), F = Math.max(m, h.width), M = g + h.height + k, P = C.rectangle(-F / 2, -M / 2, F, M, {
    ...w,
    fill: "transparent",
    stroke: "none"
  }), D = l.insert(() => I, ":first-child").attr("class", "icon-shape2"), A = l.insert(() => P);
  if (t.icon) {
    const L = l.append("g");
    L.html(
      `<g>${await An(t.icon, {
        height: s,
        width: s,
        fallbackPrefix: ""
      })}</g>`
    );
    const T = L.node().getBBox(), $ = T.width, B = T.height, N = T.x, G = T.y;
    L.attr(
      "transform",
      `translate(${-$ / 2 - N},${p ? h.height / 2 + k / 2 - B / 2 - G : -h.height / 2 - k / 2 - B / 2 - G})`
    ), L.attr("style", `color: ${b.get("stroke") ?? y};`);
  }
  return f.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${p ? -M / 2 : M / 2 - h.height})`
  ), D.attr(
    "transform",
    `translate(0,${p ? h.height / 2 + k / 2 : -h.height / 2 - k / 2})`
  ), j(t, A), t.intersect = function(L) {
    if (E.info("iconSquare intersect", t, L), !t.label)
      return q.rect(t, L);
    const T = t.x ?? 0, $ = t.y ?? 0, B = t.height ?? 0;
    let N = [];
    return p ? N = [
      { x: T - h.width / 2, y: $ - B / 2 },
      { x: T + h.width / 2, y: $ - B / 2 },
      { x: T + h.width / 2, y: $ - B / 2 + h.height + k },
      { x: T + m / 2, y: $ - B / 2 + h.height + k },
      { x: T + m / 2, y: $ + B / 2 },
      { x: T - m / 2, y: $ + B / 2 },
      { x: T - m / 2, y: $ - B / 2 + h.height + k },
      { x: T - h.width / 2, y: $ - B / 2 + h.height + k }
    ] : N = [
      { x: T - m / 2, y: $ - B / 2 },
      { x: T + m / 2, y: $ - B / 2 },
      { x: T + m / 2, y: $ - B / 2 + g },
      { x: T + h.width / 2, y: $ - B / 2 + g },
      { x: T + h.width / 2 / 2, y: $ + B / 2 },
      { x: T - h.width / 2, y: $ + B / 2 },
      { x: T - h.width / 2, y: $ - B / 2 + g },
      { x: T - m / 2, y: $ - B / 2 + g }
    ], q.polygon(t, N, L);
  }, l;
}
d(hp, "iconRounded");
async function up(e, t, { config: { themeVariables: r, flowchart: i } }) {
  const { labelStyles: n } = Y(t);
  t.labelStyle = n;
  const a = t.assetHeight ?? 48, o = t.assetWidth ?? 48, s = Math.max(a, o), c = i == null ? void 0 : i.wrappingWidth;
  t.width = Math.max(s, c ?? 0);
  const { shapeSvg: l, bbox: h, halfPadding: u, label: f } = await J(
    e,
    t,
    "icon-shape default"
  ), p = t.pos === "t", g = s + u * 2, m = s + u * 2, { nodeBorder: y, mainBkg: x } = r, { stylesMap: b } = Br(t), _ = -m / 2, S = -g / 2, k = t.label ? 8 : 0, C = W.svg(l), w = H(t, {});
  t.look !== "handDrawn" && (w.roughness = 0, w.fillStyle = "solid");
  const O = b.get("fill");
  w.stroke = O ?? x;
  const I = C.path(pe(_, S, m, g, 0.1), w), F = Math.max(m, h.width), M = g + h.height + k, P = C.rectangle(-F / 2, -M / 2, F, M, {
    ...w,
    fill: "transparent",
    stroke: "none"
  }), D = l.insert(() => I, ":first-child"), A = l.insert(() => P);
  if (t.icon) {
    const L = l.append("g");
    L.html(
      `<g>${await An(t.icon, {
        height: s,
        width: s,
        fallbackPrefix: ""
      })}</g>`
    );
    const T = L.node().getBBox(), $ = T.width, B = T.height, N = T.x, G = T.y;
    L.attr(
      "transform",
      `translate(${-$ / 2 - N},${p ? h.height / 2 + k / 2 - B / 2 - G : -h.height / 2 - k / 2 - B / 2 - G})`
    ), L.attr("style", `color: ${b.get("stroke") ?? y};`);
  }
  return f.attr(
    "transform",
    `translate(${-h.width / 2 - (h.x - (h.left ?? 0))},${p ? -M / 2 : M / 2 - h.height})`
  ), D.attr(
    "transform",
    `translate(0,${p ? h.height / 2 + k / 2 : -h.height / 2 - k / 2})`
  ), j(t, A), t.intersect = function(L) {
    if (E.info("iconSquare intersect", t, L), !t.label)
      return q.rect(t, L);
    const T = t.x ?? 0, $ = t.y ?? 0, B = t.height ?? 0;
    let N = [];
    return p ? N = [
      { x: T - h.width / 2, y: $ - B / 2 },
      { x: T + h.width / 2, y: $ - B / 2 },
      { x: T + h.width / 2, y: $ - B / 2 + h.height + k },
      { x: T + m / 2, y: $ - B / 2 + h.height + k },
      { x: T + m / 2, y: $ + B / 2 },
      { x: T - m / 2, y: $ + B / 2 },
      { x: T - m / 2, y: $ - B / 2 + h.height + k },
      { x: T - h.width / 2, y: $ - B / 2 + h.height + k }
    ] : N = [
      { x: T - m / 2, y: $ - B / 2 },
      { x: T + m / 2, y: $ - B / 2 },
      { x: T + m / 2, y: $ - B / 2 + g },
      { x: T + h.width / 2, y: $ - B / 2 + g },
      { x: T + h.width / 2 / 2, y: $ + B / 2 },
      { x: T - h.width / 2, y: $ + B / 2 },
      { x: T - h.width / 2, y: $ - B / 2 + g },
      { x: T - m / 2, y: $ - B / 2 + g }
    ], q.polygon(t, N, L);
  }, l;
}
d(up, "iconSquare");
async function fp(e, t, { config: { flowchart: r } }) {
  const i = new Image();
  i.src = (t == null ? void 0 : t.img) ?? "", await i.decode();
  const n = Number(i.naturalWidth.toString().replace("px", "")), a = Number(i.naturalHeight.toString().replace("px", ""));
  t.imageAspectRatio = n / a;
  const { labelStyles: o } = Y(t);
  t.labelStyle = o;
  const s = r == null ? void 0 : r.wrappingWidth;
  t.defaultWidth = r == null ? void 0 : r.wrappingWidth;
  const c = Math.max(
    t.label ? s ?? 0 : 0,
    (t == null ? void 0 : t.assetWidth) ?? n
  ), l = t.constraint === "on" && t != null && t.assetHeight ? t.assetHeight * t.imageAspectRatio : c, h = t.constraint === "on" ? l / t.imageAspectRatio : (t == null ? void 0 : t.assetHeight) ?? a;
  t.width = Math.max(l, s ?? 0);
  const { shapeSvg: u, bbox: f, label: p } = await J(e, t, "image-shape default"), g = t.pos === "t", m = -l / 2, y = -h / 2, x = t.label ? 8 : 0, b = W.svg(u), _ = H(t, {});
  t.look !== "handDrawn" && (_.roughness = 0, _.fillStyle = "solid");
  const S = b.rectangle(m, y, l, h, _), k = Math.max(l, f.width), C = h + f.height + x, w = b.rectangle(-k / 2, -C / 2, k, C, {
    ..._,
    fill: "none",
    stroke: "none"
  }), O = u.insert(() => S, ":first-child"), I = u.insert(() => w);
  if (t.img) {
    const F = u.append("image");
    F.attr("href", t.img), F.attr("width", l), F.attr("height", h), F.attr("preserveAspectRatio", "none"), F.attr(
      "transform",
      `translate(${-l / 2},${g ? C / 2 - h : -C / 2})`
    );
  }
  return p.attr(
    "transform",
    `translate(${-f.width / 2 - (f.x - (f.left ?? 0))},${g ? -h / 2 - f.height / 2 - x / 2 : h / 2 - f.height / 2 + x / 2})`
  ), O.attr(
    "transform",
    `translate(0,${g ? f.height / 2 + x / 2 : -f.height / 2 - x / 2})`
  ), j(t, I), t.intersect = function(F) {
    if (E.info("iconSquare intersect", t, F), !t.label)
      return q.rect(t, F);
    const M = t.x ?? 0, P = t.y ?? 0, D = t.height ?? 0;
    let A = [];
    return g ? A = [
      { x: M - f.width / 2, y: P - D / 2 },
      { x: M + f.width / 2, y: P - D / 2 },
      { x: M + f.width / 2, y: P - D / 2 + f.height + x },
      { x: M + l / 2, y: P - D / 2 + f.height + x },
      { x: M + l / 2, y: P + D / 2 },
      { x: M - l / 2, y: P + D / 2 },
      { x: M - l / 2, y: P - D / 2 + f.height + x },
      { x: M - f.width / 2, y: P - D / 2 + f.height + x }
    ] : A = [
      { x: M - l / 2, y: P - D / 2 },
      { x: M + l / 2, y: P - D / 2 },
      { x: M + l / 2, y: P - D / 2 + h },
      { x: M + f.width / 2, y: P - D / 2 + h },
      { x: M + f.width / 2 / 2, y: P + D / 2 },
      { x: M - f.width / 2, y: P + D / 2 },
      { x: M - f.width / 2, y: P - D / 2 + h },
      { x: M - l / 2, y: P - D / 2 + h }
    ], q.polygon(t, A, F);
  }, u;
}
d(fp, "imageSquare");
async function pp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), s = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), c = [
    { x: 0, y: 0 },
    { x: o, y: 0 },
    { x: o + 3 * s / 6, y: -s },
    { x: -3 * s / 6, y: -s }
  ];
  let l;
  const { cssStyles: h } = t;
  if (t.look === "handDrawn") {
    const u = W.svg(n), f = H(t, {}), p = rt(c), g = u.path(p, f);
    l = n.insert(() => g, ":first-child").attr("transform", `translate(${-o / 2}, ${s / 2})`), h && l.attr("style", h);
  } else
    l = de(n, o, s, c);
  return i && l.attr("style", i), t.width = o, t.height = s, j(t, l), t.intersect = function(u) {
    return q.polygon(t, c, u);
  }, n;
}
d(pp, "inv_trapezoid");
async function yi(e, t, r) {
  const { labelStyles: i, nodeStyles: n } = Y(t);
  t.labelStyle = i;
  const { shapeSvg: a, bbox: o } = await J(e, t, Z(t)), s = Math.max(o.width + r.labelPaddingX * 2, (t == null ? void 0 : t.width) || 0), c = Math.max(o.height + r.labelPaddingY * 2, (t == null ? void 0 : t.height) || 0), l = -s / 2, h = -c / 2;
  let u, { rx: f, ry: p } = t;
  const { cssStyles: g } = t;
  if (r != null && r.rx && r.ry && (f = r.rx, p = r.ry), t.look === "handDrawn") {
    const m = W.svg(a), y = H(t, {}), x = f || p ? m.path(pe(l, h, s, c, f || 0), y) : m.rectangle(l, h, s, c, y);
    u = a.insert(() => x, ":first-child"), u.attr("class", "basic label-container").attr("style", Lt(g));
  } else
    u = a.insert("rect", ":first-child"), u.attr("class", "basic label-container").attr("style", n).attr("rx", Lt(f)).attr("ry", Lt(p)).attr("x", l).attr("y", h).attr("width", s).attr("height", c);
  return j(t, u), t.intersect = function(m) {
    return q.rect(t, m);
  }, a;
}
d(yi, "drawRect");
async function dp(e, t) {
  const { shapeSvg: r, bbox: i, label: n } = await J(e, t, "label"), a = r.insert("rect", ":first-child");
  return a.attr("width", 0.1).attr("height", 0.1), r.attr("class", "label edgeLabel"), n.attr(
    "transform",
    `translate(${-(i.width / 2) - (i.x - (i.left ?? 0))}, ${-(i.height / 2) - (i.y - (i.top ?? 0))})`
  ), j(t, a), t.intersect = function(c) {
    return q.rect(t, c);
  }, r;
}
d(dp, "labelRect");
async function gp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = Math.max(a.width + (t.padding ?? 0), (t == null ? void 0 : t.width) ?? 0), s = Math.max(a.height + (t.padding ?? 0), (t == null ? void 0 : t.height) ?? 0), c = [
    { x: 0, y: 0 },
    { x: o + 3 * s / 6, y: 0 },
    { x: o, y: -s },
    { x: -(3 * s) / 6, y: -s }
  ];
  let l;
  const { cssStyles: h } = t;
  if (t.look === "handDrawn") {
    const u = W.svg(n), f = H(t, {}), p = rt(c), g = u.path(p, f);
    l = n.insert(() => g, ":first-child").attr("transform", `translate(${-o / 2}, ${s / 2})`), h && l.attr("style", h);
  } else
    l = de(n, o, s, c);
  return i && l.attr("style", i), t.width = o, t.height = s, j(t, l), t.intersect = function(u) {
    return q.polygon(t, c, u);
  }, n;
}
d(gp, "lean_left");
async function mp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = Math.max(a.width + (t.padding ?? 0), (t == null ? void 0 : t.width) ?? 0), s = Math.max(a.height + (t.padding ?? 0), (t == null ? void 0 : t.height) ?? 0), c = [
    { x: -3 * s / 6, y: 0 },
    { x: o, y: 0 },
    { x: o + 3 * s / 6, y: -s },
    { x: 0, y: -s }
  ];
  let l;
  const { cssStyles: h } = t;
  if (t.look === "handDrawn") {
    const u = W.svg(n), f = H(t, {}), p = rt(c), g = u.path(p, f);
    l = n.insert(() => g, ":first-child").attr("transform", `translate(${-o / 2}, ${s / 2})`), h && l.attr("style", h);
  } else
    l = de(n, o, s, c);
  return i && l.attr("style", i), t.width = o, t.height = s, j(t, l), t.intersect = function(u) {
    return q.polygon(t, c, u);
  }, n;
}
d(mp, "lean_right");
function yp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.label = "", t.labelStyle = r;
  const n = e.insert("g").attr("class", Z(t)).attr("id", t.domId ?? t.id), { cssStyles: a } = t, o = Math.max(35, (t == null ? void 0 : t.width) ?? 0), s = Math.max(35, (t == null ? void 0 : t.height) ?? 0), c = 7, l = [
    { x: o, y: 0 },
    { x: 0, y: s + c / 2 },
    { x: o - 2 * c, y: s + c / 2 },
    { x: 0, y: 2 * s },
    { x: o, y: s - c / 2 },
    { x: 2 * c, y: s - c / 2 }
  ], h = W.svg(n), u = H(t, {});
  t.look !== "handDrawn" && (u.roughness = 0, u.fillStyle = "solid");
  const f = rt(l), p = h.path(f, u), g = n.insert(() => p, ":first-child");
  return a && t.look !== "handDrawn" && g.selectAll("path").attr("style", a), i && t.look !== "handDrawn" && g.selectAll("path").attr("style", i), g.attr("transform", `translate(-${o / 2},${-s})`), j(t, g), t.intersect = function(m) {
    return E.info("lightningBolt intersect", t, m), q.polygon(t, l, m);
  }, n;
}
d(yp, "lightningBolt");
var Cw = /* @__PURE__ */ d((e, t, r, i, n, a, o) => [
  `M${e},${t + a}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `a${n},${a} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `l0,${-i}`,
  `M${e},${t + a + o}`,
  `a${n},${a} 0,0,0 ${r},0`
].join(" "), "createCylinderPathD"), _w = /* @__PURE__ */ d((e, t, r, i, n, a, o) => [
  `M${e},${t + a}`,
  `M${e + r},${t + a}`,
  `a${n},${a} 0,0,0 ${-r},0`,
  `l0,${i}`,
  `a${n},${a} 0,0,0 ${r},0`,
  `l0,${-i}`,
  `M${e},${t + a + o}`,
  `a${n},${a} 0,0,0 ${r},0`
].join(" "), "createOuterCylinderPathD"), ww = /* @__PURE__ */ d((e, t, r, i, n, a) => [`M${e - r / 2},${-i / 2}`, `a${n},${a} 0,0,0 ${r},0`].join(" "), "createInnerCylinderPathD");
async function xp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0), t.width ?? 0), c = s / 2, l = c / (2.5 + s / 50), h = Math.max(a.height + l + (t.padding ?? 0), t.height ?? 0), u = h * 0.1;
  let f;
  const { cssStyles: p } = t;
  if (t.look === "handDrawn") {
    const g = W.svg(n), m = _w(0, 0, s, h, c, l, u), y = ww(0, l, s, h, c, l), x = H(t, {}), b = g.path(m, x), _ = g.path(y, x);
    n.insert(() => _, ":first-child").attr("class", "line"), f = n.insert(() => b, ":first-child"), f.attr("class", "basic label-container"), p && f.attr("style", p);
  } else {
    const g = Cw(0, 0, s, h, c, l, u);
    f = n.insert("path", ":first-child").attr("d", g).attr("class", "basic label-container").attr("style", Lt(p)).attr("style", i);
  }
  return f.attr("label-offset-y", l), f.attr("transform", `translate(${-s / 2}, ${-(h / 2 + l)})`), j(t, f), o.attr(
    "transform",
    `translate(${-(a.width / 2) - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + l - (a.y - (a.top ?? 0))})`
  ), t.intersect = function(g) {
    const m = q.rect(t, g), y = m.x - (t.x ?? 0);
    if (c != 0 && (Math.abs(y) < (t.width ?? 0) / 2 || Math.abs(y) == (t.width ?? 0) / 2 && Math.abs(m.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - l)) {
      let x = l * l * (1 - y * y / (c * c));
      x > 0 && (x = Math.sqrt(x)), x = l - x, g.y - (t.y ?? 0) > 0 && (x = -x), m.y += x;
    }
    return m;
  }, n;
}
d(xp, "linedCylinder");
async function bp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = c / 4, h = c + l, { cssStyles: u } = t, f = W.svg(n), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = [
    { x: -s / 2 - s / 2 * 0.1, y: -h / 2 },
    { x: -s / 2 - s / 2 * 0.1, y: h / 2 },
    ...Se(
      -s / 2 - s / 2 * 0.1,
      h / 2,
      s / 2 + s / 2 * 0.1,
      h / 2,
      l,
      0.8
    ),
    { x: s / 2 + s / 2 * 0.1, y: -h / 2 },
    { x: -s / 2 - s / 2 * 0.1, y: -h / 2 },
    { x: -s / 2, y: -h / 2 },
    { x: -s / 2, y: h / 2 * 1.1 },
    { x: -s / 2, y: -h / 2 }
  ], m = f.polygon(
    g.map((x) => [x.x, x.y]),
    p
  ), y = n.insert(() => m, ":first-child");
  return y.attr("class", "basic label-container"), u && t.look !== "handDrawn" && y.selectAll("path").attr("style", u), i && t.look !== "handDrawn" && y.selectAll("path").attr("style", i), y.attr("transform", `translate(0,${-l / 2})`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) + s / 2 * 0.1 / 2 - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) - l / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, y), t.intersect = function(x) {
    return q.polygon(t, g, x);
  }, n;
}
d(bp, "linedWaveEdgedRect");
async function Cp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = 5, h = -s / 2, u = -c / 2, { cssStyles: f } = t, p = W.svg(n), g = H(t, {}), m = [
    { x: h - l, y: u + l },
    { x: h - l, y: u + c + l },
    { x: h + s - l, y: u + c + l },
    { x: h + s - l, y: u + c },
    { x: h + s, y: u + c },
    { x: h + s, y: u + c - l },
    { x: h + s + l, y: u + c - l },
    { x: h + s + l, y: u - l },
    { x: h + l, y: u - l },
    { x: h + l, y: u },
    { x: h, y: u },
    { x: h, y: u + l }
  ], y = [
    { x: h, y: u + l },
    { x: h + s - l, y: u + l },
    { x: h + s - l, y: u + c },
    { x: h + s, y: u + c },
    { x: h + s, y: u },
    { x: h, y: u }
  ];
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const x = rt(m), b = p.path(x, g), _ = rt(y), S = p.path(_, { ...g, fill: "none" }), k = n.insert(() => S, ":first-child");
  return k.insert(() => b, ":first-child"), k.attr("class", "basic label-container"), f && t.look !== "handDrawn" && k.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && k.selectAll("path").attr("style", i), o.attr(
    "transform",
    `translate(${-(a.width / 2) - l - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + l - (a.y - (a.top ?? 0))})`
  ), j(t, k), t.intersect = function(C) {
    return q.polygon(t, m, C);
  }, n;
}
d(Cp, "multiRect");
async function _p(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = c / 4, h = c + l, u = -s / 2, f = -h / 2, p = 5, { cssStyles: g } = t, m = Se(
    u - p,
    f + h + p,
    u + s - p,
    f + h + p,
    l,
    0.8
  ), y = m == null ? void 0 : m[m.length - 1], x = [
    { x: u - p, y: f + p },
    { x: u - p, y: f + h + p },
    ...m,
    { x: u + s - p, y: y.y - p },
    { x: u + s, y: y.y - p },
    { x: u + s, y: y.y - 2 * p },
    { x: u + s + p, y: y.y - 2 * p },
    { x: u + s + p, y: f - p },
    { x: u + p, y: f - p },
    { x: u + p, y: f },
    { x: u, y: f },
    { x: u, y: f + p }
  ], b = [
    { x: u, y: f + p },
    { x: u + s - p, y: f + p },
    { x: u + s - p, y: y.y - p },
    { x: u + s, y: y.y - p },
    { x: u + s, y: f },
    { x: u, y: f }
  ], _ = W.svg(n), S = H(t, {});
  t.look !== "handDrawn" && (S.roughness = 0, S.fillStyle = "solid");
  const k = rt(x), C = _.path(k, S), w = rt(b), O = _.path(w, S), I = n.insert(() => C, ":first-child");
  return I.insert(() => O), I.attr("class", "basic label-container"), g && t.look !== "handDrawn" && I.selectAll("path").attr("style", g), i && t.look !== "handDrawn" && I.selectAll("path").attr("style", i), I.attr("transform", `translate(0,${-l / 2})`), o.attr(
    "transform",
    `translate(${-(a.width / 2) - p - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + p - l / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, I), t.intersect = function(F) {
    return q.polygon(t, x, F);
  }, n;
}
d(_p, "multiWaveEdgedRectangle");
async function wp(e, t, { config: { themeVariables: r } }) {
  var x;
  const { labelStyles: i, nodeStyles: n } = Y(t);
  t.labelStyle = i, t.useHtmlLabels || ((x = Et().flowchart) == null ? void 0 : x.htmlLabels) !== !1 || (t.centerLabel = !0);
  const { shapeSvg: o, bbox: s } = await J(e, t, Z(t)), c = Math.max(s.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), l = Math.max(s.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), h = -c / 2, u = -l / 2, { cssStyles: f } = t, p = W.svg(o), g = H(t, {
    fill: r.noteBkgColor,
    stroke: r.noteBorderColor
  });
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const m = p.rectangle(h, u, c, l, g), y = o.insert(() => m, ":first-child");
  return y.attr("class", "basic label-container"), f && t.look !== "handDrawn" && y.selectAll("path").attr("style", f), n && t.look !== "handDrawn" && y.selectAll("path").attr("style", n), j(t, y), t.intersect = function(b) {
    return q.rect(t, b);
  }, o;
}
d(wp, "note");
var kw = /* @__PURE__ */ d((e, t, r) => [
  `M${e + r / 2},${t}`,
  `L${e + r},${t - r / 2}`,
  `L${e + r / 2},${t - r}`,
  `L${e},${t - r / 2}`,
  "Z"
].join(" "), "createDecisionBoxPathD");
async function kp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = a.width + t.padding, s = a.height + t.padding, c = o + s, l = [
    { x: c / 2, y: 0 },
    { x: c, y: -c / 2 },
    { x: c / 2, y: -c },
    { x: 0, y: -c / 2 }
  ];
  let h;
  const { cssStyles: u } = t;
  if (t.look === "handDrawn") {
    const f = W.svg(n), p = H(t, {}), g = kw(0, 0, c), m = f.path(g, p);
    h = n.insert(() => m, ":first-child").attr("transform", `translate(${-c / 2}, ${c / 2})`), u && h.attr("style", u);
  } else
    h = de(n, c, c, l);
  return i && h.attr("style", i), j(t, h), t.intersect = function(f) {
    return E.debug(
      `APA12 Intersect called SPLIT
point:`,
      f,
      `
node:
`,
      t,
      `
res:`,
      q.polygon(t, l, f)
    ), q.polygon(t, l, f);
  }, n;
}
d(kp, "question");
async function vp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0), (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0), (t == null ? void 0 : t.height) ?? 0), l = -s / 2, h = -c / 2, u = h / 2, f = [
    { x: l + u, y: h },
    { x: l, y: 0 },
    { x: l + u, y: -h },
    { x: -l, y: -h },
    { x: -l, y: h }
  ], { cssStyles: p } = t, g = W.svg(n), m = H(t, {});
  t.look !== "handDrawn" && (m.roughness = 0, m.fillStyle = "solid");
  const y = rt(f), x = g.path(y, m), b = n.insert(() => x, ":first-child");
  return b.attr("class", "basic label-container"), p && t.look !== "handDrawn" && b.selectAll("path").attr("style", p), i && t.look !== "handDrawn" && b.selectAll("path").attr("style", i), b.attr("transform", `translate(${-u / 2},0)`), o.attr(
    "transform",
    `translate(${-u / 2 - a.width / 2 - (a.x - (a.left ?? 0))}, ${-(a.height / 2) - (a.y - (a.top ?? 0))})`
  ), j(t, b), t.intersect = function(_) {
    return q.polygon(t, f, _);
  }, n;
}
d(vp, "rect_left_inv_arrow");
async function Sp(e, t) {
  var O, I;
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  let n;
  t.cssClasses ? n = "node " + t.cssClasses : n = "node default";
  const a = e.insert("g").attr("class", n).attr("id", t.domId || t.id), o = a.insert("g"), s = a.insert("g").attr("class", "label").attr("style", i), c = t.description, l = t.label, h = s.node().appendChild(await Re(l, t.labelStyle, !0, !0));
  let u = { width: 0, height: 0 };
  if (gt((I = (O = nt()) == null ? void 0 : O.flowchart) == null ? void 0 : I.htmlLabels)) {
    const F = h.children[0], M = et(h);
    u = F.getBoundingClientRect(), M.attr("width", u.width), M.attr("height", u.height);
  }
  E.info("Text 2", c);
  const f = c || [], p = h.getBBox(), g = s.node().appendChild(
    await Re(
      f.join ? f.join("<br/>") : f,
      t.labelStyle,
      !0,
      !0
    )
  ), m = g.children[0], y = et(g);
  u = m.getBoundingClientRect(), y.attr("width", u.width), y.attr("height", u.height);
  const x = (t.padding || 0) / 2;
  et(g).attr(
    "transform",
    "translate( " + (u.width > p.width ? 0 : (p.width - u.width) / 2) + ", " + (p.height + x + 5) + ")"
  ), et(h).attr(
    "transform",
    "translate( " + (u.width < p.width ? 0 : -(p.width - u.width) / 2) + ", 0)"
  ), u = s.node().getBBox(), s.attr(
    "transform",
    "translate(" + -u.width / 2 + ", " + (-u.height / 2 - x + 3) + ")"
  );
  const b = u.width + (t.padding || 0), _ = u.height + (t.padding || 0), S = -u.width / 2 - x, k = -u.height / 2 - x;
  let C, w;
  if (t.look === "handDrawn") {
    const F = W.svg(a), M = H(t, {}), P = F.path(
      pe(S, k, b, _, t.rx || 0),
      M
    ), D = F.line(
      -u.width / 2 - x,
      -u.height / 2 - x + p.height + x,
      u.width / 2 + x,
      -u.height / 2 - x + p.height + x,
      M
    );
    w = a.insert(() => (E.debug("Rough node insert CXC", P), D), ":first-child"), C = a.insert(() => (E.debug("Rough node insert CXC", P), P), ":first-child");
  } else
    C = o.insert("rect", ":first-child"), w = o.insert("line"), C.attr("class", "outer title-state").attr("style", i).attr("x", -u.width / 2 - x).attr("y", -u.height / 2 - x).attr("width", u.width + (t.padding || 0)).attr("height", u.height + (t.padding || 0)), w.attr("class", "divider").attr("x1", -u.width / 2 - x).attr("x2", u.width / 2 + x).attr("y1", -u.height / 2 - x + p.height + x).attr("y2", -u.height / 2 - x + p.height + x);
  return j(t, C), t.intersect = function(F) {
    return q.rect(t, F);
  }, a;
}
d(Sp, "rectWithTitle");
async function Tp(e, t) {
  const r = {
    rx: 5,
    ry: 5,
    labelPaddingX: ((t == null ? void 0 : t.padding) || 0) * 1,
    labelPaddingY: ((t == null ? void 0 : t.padding) || 0) * 1
  };
  return yi(e, t, r);
}
d(Tp, "roundedRect");
async function Bp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = (t == null ? void 0 : t.padding) ?? 0, c = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), l = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), h = -a.width / 2 - s, u = -a.height / 2 - s, { cssStyles: f } = t, p = W.svg(n), g = H(t, {});
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const m = [
    { x: h, y: u },
    { x: h + c + 8, y: u },
    { x: h + c + 8, y: u + l },
    { x: h - 8, y: u + l },
    { x: h - 8, y: u },
    { x: h, y: u },
    { x: h, y: u + l }
  ], y = p.polygon(
    m.map((b) => [b.x, b.y]),
    g
  ), x = n.insert(() => y, ":first-child");
  return x.attr("class", "basic label-container").attr("style", Lt(f)), i && t.look !== "handDrawn" && x.selectAll("path").attr("style", i), f && t.look !== "handDrawn" && x.selectAll("path").attr("style", i), o.attr(
    "transform",
    `translate(${-c / 2 + 4 + (t.padding ?? 0) - (a.x - (a.left ?? 0))},${-l / 2 + (t.padding ?? 0) - (a.y - (a.top ?? 0))})`
  ), j(t, x), t.intersect = function(b) {
    return q.rect(t, b);
  }, n;
}
d(Bp, "shadedProcess");
async function Lp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = -s / 2, h = -c / 2, { cssStyles: u } = t, f = W.svg(n), p = H(t, {});
  t.look !== "handDrawn" && (p.roughness = 0, p.fillStyle = "solid");
  const g = [
    { x: l, y: h },
    { x: l, y: h + c },
    { x: l + s, y: h + c },
    { x: l + s, y: h - c / 2 }
  ], m = rt(g), y = f.path(m, p), x = n.insert(() => y, ":first-child");
  return x.attr("class", "basic label-container"), u && t.look !== "handDrawn" && x.selectChildren("path").attr("style", u), i && t.look !== "handDrawn" && x.selectChildren("path").attr("style", i), x.attr("transform", `translate(0, ${c / 4})`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) - (a.x - (a.left ?? 0))}, ${-c / 4 + (t.padding ?? 0) - (a.y - (a.top ?? 0))})`
  ), j(t, x), t.intersect = function(b) {
    return q.polygon(t, g, b);
  }, n;
}
d(Lp, "slopedRect");
async function Mp(e, t) {
  const r = {
    rx: 0,
    ry: 0,
    labelPaddingX: ((t == null ? void 0 : t.padding) || 0) * 2,
    labelPaddingY: ((t == null ? void 0 : t.padding) || 0) * 1
  };
  return yi(e, t, r);
}
d(Mp, "squareRect");
async function Ap(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = a.height + t.padding, s = a.width + o / 4 + t.padding;
  let c;
  const { cssStyles: l } = t;
  if (t.look === "handDrawn") {
    const h = W.svg(n), u = H(t, {}), f = pe(-s / 2, -o / 2, s, o, o / 2), p = h.path(f, u);
    c = n.insert(() => p, ":first-child"), c.attr("class", "basic label-container").attr("style", Lt(l));
  } else
    c = n.insert("rect", ":first-child"), c.attr("class", "basic label-container").attr("style", i).attr("rx", o / 2).attr("ry", o / 2).attr("x", -s / 2).attr("y", -o / 2).attr("width", s).attr("height", o);
  return j(t, c), t.intersect = function(h) {
    return q.rect(t, h);
  }, n;
}
d(Ap, "stadium");
async function $p(e, t) {
  return yi(e, t, {
    rx: 5,
    ry: 5
  });
}
d($p, "state");
function Fp(e, t, { config: { themeVariables: r } }) {
  const { labelStyles: i, nodeStyles: n } = Y(t);
  t.labelStyle = i;
  const { cssStyles: a } = t, { lineColor: o, stateBorder: s, nodeBorder: c } = r, l = e.insert("g").attr("class", "node default").attr("id", t.domId || t.id), h = W.svg(l), u = H(t, {});
  t.look !== "handDrawn" && (u.roughness = 0, u.fillStyle = "solid");
  const f = h.circle(0, 0, 14, {
    ...u,
    stroke: o,
    strokeWidth: 2
  }), p = s ?? c, g = h.circle(0, 0, 5, {
    ...u,
    fill: p,
    stroke: p,
    strokeWidth: 2,
    fillStyle: "solid"
  }), m = l.insert(() => f, ":first-child");
  return m.insert(() => g), a && m.selectAll("path").attr("style", a), n && m.selectAll("path").attr("style", n), j(t, m), t.intersect = function(y) {
    return q.circle(t, 7, y);
  }, l;
}
d(Fp, "stateEnd");
function Ep(e, t, { config: { themeVariables: r } }) {
  const { lineColor: i } = r, n = e.insert("g").attr("class", "node default").attr("id", t.domId || t.id);
  let a;
  if (t.look === "handDrawn") {
    const s = W.svg(n).circle(0, 0, 14, iw(i));
    a = n.insert(() => s), a.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  } else
    a = n.insert("circle", ":first-child"), a.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  return j(t, a), t.intersect = function(o) {
    return q.circle(t, 7, o);
  }, n;
}
d(Ep, "stateStart");
async function Op(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = ((t == null ? void 0 : t.padding) || 0) / 2, s = a.width + t.padding, c = a.height + t.padding, l = -a.width / 2 - o, h = -a.height / 2 - o, u = [
    { x: 0, y: 0 },
    { x: s, y: 0 },
    { x: s, y: -c },
    { x: 0, y: -c },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: s + 8, y: 0 },
    { x: s + 8, y: -c },
    { x: -8, y: -c },
    { x: -8, y: 0 }
  ];
  if (t.look === "handDrawn") {
    const f = W.svg(n), p = H(t, {}), g = f.rectangle(l - 8, h, s + 16, c, p), m = f.line(l, h, l, h + c, p), y = f.line(l + s, h, l + s, h + c, p);
    n.insert(() => m, ":first-child"), n.insert(() => y, ":first-child");
    const x = n.insert(() => g, ":first-child"), { cssStyles: b } = t;
    x.attr("class", "basic label-container").attr("style", Lt(b)), j(t, x);
  } else {
    const f = de(n, s, c, u);
    i && f.attr("style", i), j(t, f);
  }
  return t.intersect = function(f) {
    return q.polygon(t, u, f);
  }, n;
}
d(Op, "subroutine");
async function Dp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), s = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), c = -o / 2, l = -s / 2, h = 0.2 * s, u = 0.2 * s, { cssStyles: f } = t, p = W.svg(n), g = H(t, {}), m = [
    { x: c - h / 2, y: l },
    { x: c + o + h / 2, y: l },
    { x: c + o + h / 2, y: l + s },
    { x: c - h / 2, y: l + s }
  ], y = [
    { x: c + o - h / 2, y: l + s },
    { x: c + o + h / 2, y: l + s },
    { x: c + o + h / 2, y: l + s - u }
  ];
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const x = rt(m), b = p.path(x, g), _ = rt(y), S = p.path(_, { ...g, fillStyle: "solid" }), k = n.insert(() => S, ":first-child");
  return k.insert(() => b, ":first-child"), k.attr("class", "basic label-container"), f && t.look !== "handDrawn" && k.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && k.selectAll("path").attr("style", i), j(t, k), t.intersect = function(C) {
    return q.polygon(t, m, C);
  }, n;
}
d(Dp, "taggedRect");
async function Rp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = c / 4, h = 0.2 * s, u = 0.2 * c, f = c + l, { cssStyles: p } = t, g = W.svg(n), m = H(t, {});
  t.look !== "handDrawn" && (m.roughness = 0, m.fillStyle = "solid");
  const y = [
    { x: -s / 2 - s / 2 * 0.1, y: f / 2 },
    ...Se(
      -s / 2 - s / 2 * 0.1,
      f / 2,
      s / 2 + s / 2 * 0.1,
      f / 2,
      l,
      0.8
    ),
    { x: s / 2 + s / 2 * 0.1, y: -f / 2 },
    { x: -s / 2 - s / 2 * 0.1, y: -f / 2 }
  ], x = -s / 2 + s / 2 * 0.1, b = -f / 2 - u * 0.4, _ = [
    { x: x + s - h, y: (b + c) * 1.4 },
    { x: x + s, y: b + c - u },
    { x: x + s, y: (b + c) * 0.9 },
    ...Se(
      x + s,
      (b + c) * 1.3,
      x + s - h,
      (b + c) * 1.5,
      -c * 0.03,
      0.5
    )
  ], S = rt(y), k = g.path(S, m), C = rt(_), w = g.path(C, {
    ...m,
    fillStyle: "solid"
  }), O = n.insert(() => w, ":first-child");
  return O.insert(() => k, ":first-child"), O.attr("class", "basic label-container"), p && t.look !== "handDrawn" && O.selectAll("path").attr("style", p), i && t.look !== "handDrawn" && O.selectAll("path").attr("style", i), O.attr("transform", `translate(0,${-l / 2})`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) - l / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, O), t.intersect = function(I) {
    return q.polygon(t, y, I);
  }, n;
}
d(Rp, "taggedWaveEdgedRectangle");
async function Ip(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = Math.max(a.width + t.padding, (t == null ? void 0 : t.width) || 0), s = Math.max(a.height + t.padding, (t == null ? void 0 : t.height) || 0), c = -o / 2, l = -s / 2, h = n.insert("rect", ":first-child");
  return h.attr("class", "text").attr("style", i).attr("rx", 0).attr("ry", 0).attr("x", c).attr("y", l).attr("width", o).attr("height", s), j(t, h), t.intersect = function(u) {
    return q.rect(t, u);
  }, n;
}
d(Ip, "text");
var vw = /* @__PURE__ */ d((e, t, r, i, n, a) => `M${e},${t}
    a${n},${a} 0,0,1 0,${-i}
    l${r},0
    a${n},${a} 0,0,1 0,${i}
    M${r},${-i}
    a${n},${a} 0,0,0 0,${i}
    l${-r},0`, "createCylinderPathD"), Sw = /* @__PURE__ */ d((e, t, r, i, n, a) => [
  `M${e},${t}`,
  `M${e + r},${t}`,
  `a${n},${a} 0,0,0 0,${-i}`,
  `l${-r},0`,
  `a${n},${a} 0,0,0 0,${i}`,
  `l${r},0`
].join(" "), "createOuterCylinderPathD"), Tw = /* @__PURE__ */ d((e, t, r, i, n, a) => [`M${e + r / 2},${-i / 2}`, `a${n},${a} 0,0,0 0,${i}`].join(" "), "createInnerCylinderPathD");
async function Pp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o, halfPadding: s } = await J(
    e,
    t,
    Z(t)
  ), c = t.look === "neo" ? s * 2 : s, l = a.height + c, h = l / 2, u = h / (2.5 + l / 50), f = a.width + u + c, { cssStyles: p } = t;
  let g;
  if (t.look === "handDrawn") {
    const m = W.svg(n), y = Sw(0, 0, f, l, u, h), x = Tw(0, 0, f, l, u, h), b = m.path(y, H(t, {})), _ = m.path(x, H(t, { fill: "none" }));
    g = n.insert(() => _, ":first-child"), g = n.insert(() => b, ":first-child"), g.attr("class", "basic label-container"), p && g.attr("style", p);
  } else {
    const m = vw(0, 0, f, l, u, h);
    g = n.insert("path", ":first-child").attr("d", m).attr("class", "basic label-container").attr("style", Lt(p)).attr("style", i), g.attr("class", "basic label-container"), p && g.selectAll("path").attr("style", p), i && g.selectAll("path").attr("style", i);
  }
  return g.attr("label-offset-x", u), g.attr("transform", `translate(${-f / 2}, ${l / 2} )`), o.attr(
    "transform",
    `translate(${-(a.width / 2) - u - (a.x - (a.left ?? 0))}, ${-(a.height / 2) - (a.y - (a.top ?? 0))})`
  ), j(t, g), t.intersect = function(m) {
    const y = q.rect(t, m), x = y.y - (t.y ?? 0);
    if (h != 0 && (Math.abs(x) < (t.height ?? 0) / 2 || Math.abs(x) == (t.height ?? 0) / 2 && Math.abs(y.x - (t.x ?? 0)) > (t.width ?? 0) / 2 - u)) {
      let b = u * u * (1 - x * x / (h * h));
      b != 0 && (b = Math.sqrt(Math.abs(b))), b = u - b, m.x - (t.x ?? 0) > 0 && (b = -b), y.x += b;
    }
    return y;
  }, n;
}
d(Pp, "tiltedCylinder");
async function Np(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = a.width + t.padding, s = a.height + t.padding, c = [
    { x: -3 * s / 6, y: 0 },
    { x: o + 3 * s / 6, y: 0 },
    { x: o, y: -s },
    { x: 0, y: -s }
  ];
  let l;
  const { cssStyles: h } = t;
  if (t.look === "handDrawn") {
    const u = W.svg(n), f = H(t, {}), p = rt(c), g = u.path(p, f);
    l = n.insert(() => g, ":first-child").attr("transform", `translate(${-o / 2}, ${s / 2})`), h && l.attr("style", h);
  } else
    l = de(n, o, s, c);
  return i && l.attr("style", i), t.width = o, t.height = s, j(t, l), t.intersect = function(u) {
    return q.polygon(t, c, u);
  }, n;
}
d(Np, "trapezoid");
async function zp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = 60, s = 20, c = Math.max(o, a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), l = Math.max(s, a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), { cssStyles: h } = t, u = W.svg(n), f = H(t, {});
  t.look !== "handDrawn" && (f.roughness = 0, f.fillStyle = "solid");
  const p = [
    { x: -c / 2 * 0.8, y: -l / 2 },
    { x: c / 2 * 0.8, y: -l / 2 },
    { x: c / 2, y: -l / 2 * 0.6 },
    { x: c / 2, y: l / 2 },
    { x: -c / 2, y: l / 2 },
    { x: -c / 2, y: -l / 2 * 0.6 }
  ], g = rt(p), m = u.path(g, f), y = n.insert(() => m, ":first-child");
  return y.attr("class", "basic label-container"), h && t.look !== "handDrawn" && y.selectChildren("path").attr("style", h), i && t.look !== "handDrawn" && y.selectChildren("path").attr("style", i), j(t, y), t.intersect = function(x) {
    return q.polygon(t, p, x);
  }, n;
}
d(zp, "trapezoidalPentagon");
async function qp(e, t) {
  var b;
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = gt((b = nt().flowchart) == null ? void 0 : b.htmlLabels), c = a.width + (t.padding ?? 0), l = c + a.height, h = c + a.height, u = [
    { x: 0, y: 0 },
    { x: h, y: 0 },
    { x: h / 2, y: -l }
  ], { cssStyles: f } = t, p = W.svg(n), g = H(t, {});
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const m = rt(u), y = p.path(m, g), x = n.insert(() => y, ":first-child").attr("transform", `translate(${-l / 2}, ${l / 2})`);
  return f && t.look !== "handDrawn" && x.selectChildren("path").attr("style", f), i && t.look !== "handDrawn" && x.selectChildren("path").attr("style", i), t.width = c, t.height = l, j(t, x), o.attr(
    "transform",
    `translate(${-a.width / 2 - (a.x - (a.left ?? 0))}, ${l / 2 - (a.height + (t.padding ?? 0) / (s ? 2 : 1) - (a.y - (a.top ?? 0)))})`
  ), t.intersect = function(_) {
    return E.info("Triangle intersect", t, u, _), q.polygon(t, u, _);
  }, n;
}
d(qp, "triangle");
async function Wp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = c / 8, h = c + l, { cssStyles: u } = t, p = 70 - s, g = p > 0 ? p / 2 : 0, m = W.svg(n), y = H(t, {});
  t.look !== "handDrawn" && (y.roughness = 0, y.fillStyle = "solid");
  const x = [
    { x: -s / 2 - g, y: h / 2 },
    ...Se(
      -s / 2 - g,
      h / 2,
      s / 2 + g,
      h / 2,
      l,
      0.8
    ),
    { x: s / 2 + g, y: -h / 2 },
    { x: -s / 2 - g, y: -h / 2 }
  ], b = rt(x), _ = m.path(b, y), S = n.insert(() => _, ":first-child");
  return S.attr("class", "basic label-container"), u && t.look !== "handDrawn" && S.selectAll("path").attr("style", u), i && t.look !== "handDrawn" && S.selectAll("path").attr("style", i), S.attr("transform", `translate(0,${-l / 2})`), o.attr(
    "transform",
    `translate(${-s / 2 + (t.padding ?? 0) - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) - l - (a.y - (a.top ?? 0))})`
  ), j(t, S), t.intersect = function(k) {
    return q.polygon(t, x, k);
  }, n;
}
d(Wp, "waveEdgedRectangle");
async function Hp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a } = await J(e, t, Z(t)), o = 100, s = 50, c = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), l = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), h = c / l;
  let u = c, f = l;
  u > f * h ? f = u / h : u = f * h, u = Math.max(u, o), f = Math.max(f, s);
  const p = Math.min(f * 0.2, f / 4), g = f + p * 2, { cssStyles: m } = t, y = W.svg(n), x = H(t, {});
  t.look !== "handDrawn" && (x.roughness = 0, x.fillStyle = "solid");
  const b = [
    { x: -u / 2, y: g / 2 },
    ...Se(-u / 2, g / 2, u / 2, g / 2, p, 1),
    { x: u / 2, y: -g / 2 },
    ...Se(u / 2, -g / 2, -u / 2, -g / 2, p, -1)
  ], _ = rt(b), S = y.path(_, x), k = n.insert(() => S, ":first-child");
  return k.attr("class", "basic label-container"), m && t.look !== "handDrawn" && k.selectAll("path").attr("style", m), i && t.look !== "handDrawn" && k.selectAll("path").attr("style", i), j(t, k), t.intersect = function(C) {
    return q.polygon(t, b, C);
  }, n;
}
d(Hp, "waveRectangle");
async function jp(e, t) {
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const { shapeSvg: n, bbox: a, label: o } = await J(e, t, Z(t)), s = Math.max(a.width + (t.padding ?? 0) * 2, (t == null ? void 0 : t.width) ?? 0), c = Math.max(a.height + (t.padding ?? 0) * 2, (t == null ? void 0 : t.height) ?? 0), l = 5, h = -s / 2, u = -c / 2, { cssStyles: f } = t, p = W.svg(n), g = H(t, {}), m = [
    { x: h - l, y: u - l },
    { x: h - l, y: u + c },
    { x: h + s, y: u + c },
    { x: h + s, y: u - l }
  ], y = `M${h - l},${u - l} L${h + s},${u - l} L${h + s},${u + c} L${h - l},${u + c} L${h - l},${u - l}
                M${h - l},${u} L${h + s},${u}
                M${h},${u - l} L${h},${u + c}`;
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const x = p.path(y, g), b = n.insert(() => x, ":first-child");
  return b.attr("transform", `translate(${l / 2}, ${l / 2})`), b.attr("class", "basic label-container"), f && t.look !== "handDrawn" && b.selectAll("path").attr("style", f), i && t.look !== "handDrawn" && b.selectAll("path").attr("style", i), o.attr(
    "transform",
    `translate(${-(a.width / 2) + l / 2 - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + l / 2 - (a.y - (a.top ?? 0))})`
  ), j(t, b), t.intersect = function(_) {
    return q.polygon(t, m, _);
  }, n;
}
d(jp, "windowPane");
async function ao(e, t) {
  var N, G, tt;
  const r = t;
  if (r.alias && (t.label = r.alias), t.look === "handDrawn") {
    const { themeVariables: K } = Et(), { background: it } = K, ot = {
      ...t,
      id: t.id + "-background",
      look: "default",
      cssStyles: ["stroke: none", `fill: ${it}`]
    };
    await ao(e, ot);
  }
  const i = Et();
  t.useHtmlLabels = i.htmlLabels;
  let n = ((N = i.er) == null ? void 0 : N.diagramPadding) ?? 10, a = ((G = i.er) == null ? void 0 : G.entityPadding) ?? 6;
  const { cssStyles: o } = t, { labelStyles: s } = Y(t);
  if (r.attributes.length === 0 && t.label) {
    const K = {
      rx: 0,
      ry: 0,
      labelPaddingX: n,
      labelPaddingY: n * 1.5
    };
    ue(t.label, i) + K.labelPaddingX * 2 < i.er.minEntityWidth && (t.width = i.er.minEntityWidth);
    const it = await yi(e, t, K);
    if (!gt(i.htmlLabels)) {
      const ot = it.select("text"), ct = (tt = ot.node()) == null ? void 0 : tt.getBBox();
      ot.attr("transform", `translate(${-ct.width / 2}, 0)`);
    }
    return it;
  }
  i.htmlLabels || (n *= 1.25, a *= 1.25);
  let c = Z(t);
  c || (c = "node default");
  const l = e.insert("g").attr("class", c).attr("id", t.domId || t.id), h = await Je(l, t.label ?? "", i, 0, 0, ["name"], s);
  h.height += a;
  let u = 0;
  const f = [];
  let p = 0, g = 0, m = 0, y = 0, x = !0, b = !0;
  for (const K of r.attributes) {
    const it = await Je(
      l,
      K.type,
      i,
      0,
      u,
      ["attribute-type"],
      s
    );
    p = Math.max(p, it.width + n);
    const ot = await Je(
      l,
      K.name,
      i,
      0,
      u,
      ["attribute-name"],
      s
    );
    g = Math.max(g, ot.width + n);
    const ct = await Je(
      l,
      K.keys.join(),
      i,
      0,
      u,
      ["attribute-keys"],
      s
    );
    m = Math.max(m, ct.width + n);
    const Pt = await Je(
      l,
      K.comment,
      i,
      0,
      u,
      ["attribute-comment"],
      s
    );
    y = Math.max(y, Pt.width + n), u += Math.max(it.height, ot.height, ct.height, Pt.height) + a, f.push(u);
  }
  f.pop();
  let _ = 4;
  m <= n && (x = !1, m = 0, _--), y <= n && (b = !1, y = 0, _--);
  const S = l.node().getBBox();
  if (h.width + n * 2 - (p + g + m + y) > 0) {
    const K = h.width + n * 2 - (p + g + m + y);
    p += K / _, g += K / _, m > 0 && (m += K / _), y > 0 && (y += K / _);
  }
  const k = p + g + m + y, C = W.svg(l), w = H(t, {});
  t.look !== "handDrawn" && (w.roughness = 0, w.fillStyle = "solid");
  const O = Math.max(S.width + n * 2, (t == null ? void 0 : t.width) || 0, k), I = Math.max(S.height + (f[0] || u) + a, (t == null ? void 0 : t.height) || 0), F = -O / 2, M = -I / 2;
  l.selectAll("g:not(:first-child)").each((K, it, ot) => {
    const ct = et(ot[it]), Pt = ct.attr("transform");
    let Ot = 0, ge = 0;
    if (Pt) {
      const mt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(Pt);
      mt && (Ot = parseFloat(mt[1]), ge = parseFloat(mt[2]), ct.attr("class").includes("attribute-name") ? Ot += p : ct.attr("class").includes("attribute-keys") ? Ot += p + g : ct.attr("class").includes("attribute-comment") && (Ot += p + g + m));
    }
    ct.attr(
      "transform",
      `translate(${F + n / 2 + Ot}, ${ge + M + h.height + a / 2})`
    );
  }), l.select(".name").attr("transform", "translate(" + -h.width / 2 + ", " + (M + a / 2) + ")");
  const P = C.rectangle(F, M, O, I, w), D = l.insert(() => P, ":first-child").attr("style", o.join("")), { themeVariables: A } = Et(), { rowEven: L, rowOdd: T, nodeBorder: $ } = A;
  f.push(0);
  for (const [K, it] of f.entries()) {
    if (K === 0 && f.length > 1)
      continue;
    const ot = K % 2 === 0 && it !== 0, ct = C.rectangle(F, h.height + M + it, O, h.height, {
      ...w,
      fill: ot ? L : T,
      stroke: $
    });
    l.insert(() => ct, "g.label").attr("style", o.join("")).attr("class", `row-rect-${K % 2 === 0 ? "even" : "odd"}`);
  }
  let B = C.line(F, h.height + M, O + F, h.height + M, w);
  l.insert(() => B).attr("class", "divider"), B = C.line(p + F, h.height + M, p + F, I + M, w), l.insert(() => B).attr("class", "divider"), x && (B = C.line(
    p + g + F,
    h.height + M,
    p + g + F,
    I + M,
    w
  ), l.insert(() => B).attr("class", "divider")), b && (B = C.line(
    p + g + m + F,
    h.height + M,
    p + g + m + F,
    I + M,
    w
  ), l.insert(() => B).attr("class", "divider"));
  for (const K of f)
    B = C.line(
      F,
      h.height + M + K,
      O + F,
      h.height + M + K,
      w
    ), l.insert(() => B).attr("class", "divider");
  return j(t, D), t.intersect = function(K) {
    return q.rect(t, K);
  }, l;
}
d(ao, "erBox");
async function Je(e, t, r, i = 0, n = 0, a = [], o = "") {
  const s = e.insert("g").attr("class", `label ${a.join(" ")}`).attr("transform", `translate(${i}, ${n})`).attr("style", o);
  t !== fo(t) && (t = fo(t), t = t.replaceAll("<", "&lt;").replaceAll(">", "&gt;"));
  const c = s.node().appendChild(
    await Be(
      s,
      t,
      {
        width: ue(t, r) + 100,
        style: o,
        useHtmlLabels: r.htmlLabels
      },
      r
    )
  );
  if (t.includes("&lt;") || t.includes("&gt;")) {
    let h = c.children[0];
    for (h.textContent = h.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">"); h.childNodes[0]; )
      h = h.childNodes[0], h.textContent = h.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
  }
  let l = c.getBBox();
  if (gt(r.htmlLabels)) {
    const h = c.children[0];
    h.style.textAlign = "start";
    const u = et(c);
    l = h.getBoundingClientRect(), u.attr("width", l.width), u.attr("height", l.height);
  }
  return l;
}
d(Je, "addText");
async function Yp(e, t, r, i, n = r.class.padding ?? 12) {
  const a = i ? 0 : 3, o = e.insert("g").attr("class", Z(t)).attr("id", t.domId || t.id);
  let s = null, c = null, l = null, h = null, u = 0, f = 0, p = 0;
  if (s = o.insert("g").attr("class", "annotation-group text"), t.annotations.length > 0) {
    const b = t.annotations[0];
    await Wr(s, { text: `«${b}»` }, 0), u = s.node().getBBox().height;
  }
  c = o.insert("g").attr("class", "label-group text"), await Wr(c, t, 0, ["font-weight: bolder"]);
  const g = c.node().getBBox();
  f = g.height, l = o.insert("g").attr("class", "members-group text");
  let m = 0;
  for (const b of t.members) {
    const _ = await Wr(l, b, m, [b.parseClassifier()]);
    m += _ + a;
  }
  p = l.node().getBBox().height, p <= 0 && (p = n / 2), h = o.insert("g").attr("class", "methods-group text");
  let y = 0;
  for (const b of t.methods) {
    const _ = await Wr(h, b, y, [b.parseClassifier()]);
    y += _ + a;
  }
  let x = o.node().getBBox();
  if (s !== null) {
    const b = s.node().getBBox();
    s.attr("transform", `translate(${-b.width / 2})`);
  }
  return c.attr("transform", `translate(${-g.width / 2}, ${u})`), x = o.node().getBBox(), l.attr(
    "transform",
    `translate(0, ${u + f + n * 2})`
  ), x = o.node().getBBox(), h.attr(
    "transform",
    `translate(0, ${u + f + (p ? p + n * 4 : n * 2)})`
  ), x = o.node().getBBox(), { shapeSvg: o, bbox: x };
}
d(Yp, "textHelper");
async function Wr(e, t, r, i = []) {
  const n = e.insert("g").attr("class", "label").attr("style", i.join("; ")), a = Et();
  let o = "useHtmlLabels" in t ? t.useHtmlLabels : gt(a.htmlLabels) ?? !0, s = "";
  "text" in t ? s = t.text : s = t.label, !o && s.startsWith("\\") && (s = s.substring(1)), mr(s) && (o = !0);
  const c = await Be(
    n,
    ds(Xe(s)),
    {
      width: ue(s, a) + 50,
      // Add room for error when splitting text into multiple lines
      classes: "markdown-node-label",
      useHtmlLabels: o
    },
    a
  );
  let l, h = 1;
  if (o) {
    const u = c.children[0], f = et(c);
    h = u.innerHTML.split("<br>").length, u.innerHTML.includes("</math>") && (h += u.innerHTML.split("<mrow>").length - 1);
    const p = u.getElementsByTagName("img");
    if (p) {
      const g = s.replace(/<img[^>]*>/g, "").trim() === "";
      await Promise.all(
        [...p].map(
          (m) => new Promise((y) => {
            function x() {
              var b;
              if (m.style.display = "flex", m.style.flexDirection = "column", g) {
                const _ = ((b = a.fontSize) == null ? void 0 : b.toString()) ?? window.getComputedStyle(document.body).fontSize, k = parseInt(_, 10) * 5 + "px";
                m.style.minWidth = k, m.style.maxWidth = k;
              } else
                m.style.width = "100%";
              y(m);
            }
            d(x, "setupImage"), setTimeout(() => {
              m.complete && x();
            }), m.addEventListener("error", x), m.addEventListener("load", x);
          })
        )
      );
    }
    l = u.getBoundingClientRect(), f.attr("width", l.width), f.attr("height", l.height);
  } else {
    i.includes("font-weight: bolder") && et(c).selectAll("tspan").attr("font-weight", ""), h = c.children.length;
    const u = c.children[0];
    (c.textContent === "" || c.textContent.includes("&gt")) && (u.textContent = s[0] + s.substring(1).replaceAll("&gt;", ">").replaceAll("&lt;", "<").trim(), s[1] === " " && (u.textContent = u.textContent[0] + " " + u.textContent.substring(1))), u.textContent === "undefined" && (u.textContent = ""), l = c.getBBox();
  }
  return n.attr("transform", "translate(0," + (-l.height / (2 * h) + r) + ")"), l.height;
}
d(Wr, "addText");
async function Gp(e, t) {
  var I, F;
  const r = nt(), i = r.class.padding ?? 12, n = i, a = t.useHtmlLabels ?? gt(r.htmlLabels) ?? !0, o = t;
  o.annotations = o.annotations ?? [], o.members = o.members ?? [], o.methods = o.methods ?? [];
  const { shapeSvg: s, bbox: c } = await Yp(e, t, r, a, n), { labelStyles: l, nodeStyles: h } = Y(t);
  t.labelStyle = l, t.cssStyles = o.styles || "";
  const u = ((I = o.styles) == null ? void 0 : I.join(";")) || h || "";
  t.cssStyles || (t.cssStyles = u.replaceAll("!important", "").split(";"));
  const f = o.members.length === 0 && o.methods.length === 0 && !((F = r.class) != null && F.hideEmptyMembersBox), p = W.svg(s), g = H(t, {});
  t.look !== "handDrawn" && (g.roughness = 0, g.fillStyle = "solid");
  const m = c.width;
  let y = c.height;
  o.members.length === 0 && o.methods.length === 0 ? y += n : o.members.length > 0 && o.methods.length === 0 && (y += n * 2);
  const x = -m / 2, b = -y / 2, _ = p.rectangle(
    x - i,
    b - i - (f ? i : o.members.length === 0 && o.methods.length === 0 ? -i / 2 : 0),
    m + 2 * i,
    y + 2 * i + (f ? i * 2 : o.members.length === 0 && o.methods.length === 0 ? -i : 0),
    g
  ), S = s.insert(() => _, ":first-child");
  S.attr("class", "basic label-container");
  const k = S.node().getBBox();
  s.selectAll(".text").each((M, P, D) => {
    var N;
    const A = et(D[P]), L = A.attr("transform");
    let T = 0;
    if (L) {
      const tt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(L);
      tt && (T = parseFloat(tt[2]));
    }
    let $ = T + b + i - (f ? i : o.members.length === 0 && o.methods.length === 0 ? -i / 2 : 0);
    a || ($ -= 4);
    let B = x;
    (A.attr("class").includes("label-group") || A.attr("class").includes("annotation-group")) && (B = -((N = A.node()) == null ? void 0 : N.getBBox().width) / 2 || 0, s.selectAll("text").each(function(G, tt, K) {
      window.getComputedStyle(K[tt]).textAnchor === "middle" && (B = 0);
    })), A.attr("transform", `translate(${B}, ${$})`);
  });
  const C = s.select(".annotation-group").node().getBBox().height - (f ? i / 2 : 0) || 0, w = s.select(".label-group").node().getBBox().height - (f ? i / 2 : 0) || 0, O = s.select(".members-group").node().getBBox().height - (f ? i / 2 : 0) || 0;
  if (o.members.length > 0 || o.methods.length > 0 || f) {
    const M = p.line(
      k.x,
      C + w + b + i,
      k.x + k.width,
      C + w + b + i,
      g
    );
    s.insert(() => M).attr("class", "divider").attr("style", u);
  }
  if (f || o.members.length > 0 || o.methods.length > 0) {
    const M = p.line(
      k.x,
      C + w + O + b + n * 2 + i,
      k.x + k.width,
      C + w + O + b + i + n * 2,
      g
    );
    s.insert(() => M).attr("class", "divider").attr("style", u);
  }
  if (o.look !== "handDrawn" && s.selectAll("path").attr("style", u), S.select(":nth-child(2)").attr("style", u), s.selectAll(".divider").select("path").attr("style", u), t.labelStyle ? s.selectAll("span").attr("style", t.labelStyle) : s.selectAll("span").attr("style", u), !a) {
    const M = RegExp(/color\s*:\s*([^;]*)/), P = M.exec(u);
    if (P) {
      const D = P[0].replace("color", "fill");
      s.selectAll("tspan").attr("style", D);
    } else if (l) {
      const D = M.exec(l);
      if (D) {
        const A = D[0].replace("color", "fill");
        s.selectAll("tspan").attr("style", A);
      }
    }
  }
  return j(t, S), t.intersect = function(M) {
    return q.rect(t, M);
  }, s;
}
d(Gp, "classBox");
async function Up(e, t) {
  var C, w;
  const { labelStyles: r, nodeStyles: i } = Y(t);
  t.labelStyle = r;
  const n = t, a = t, o = 20, s = 20, c = "verifyMethod" in t, l = Z(t), h = e.insert("g").attr("class", l).attr("id", t.domId ?? t.id);
  let u;
  c ? u = await Ut(
    h,
    `&lt;&lt;${n.type}&gt;&gt;`,
    0,
    t.labelStyle
  ) : u = await Ut(h, "&lt;&lt;Element&gt;&gt;", 0, t.labelStyle);
  let f = u;
  const p = await Ut(
    h,
    n.name,
    f,
    t.labelStyle + "; font-weight: bold;"
  );
  if (f += p + s, c) {
    const O = await Ut(
      h,
      `${n.requirementId ? `Id: ${n.requirementId}` : ""}`,
      f,
      t.labelStyle
    );
    f += O;
    const I = await Ut(
      h,
      `${n.text ? `Text: ${n.text}` : ""}`,
      f,
      t.labelStyle
    );
    f += I;
    const F = await Ut(
      h,
      `${n.risk ? `Risk: ${n.risk}` : ""}`,
      f,
      t.labelStyle
    );
    f += F, await Ut(
      h,
      `${n.verifyMethod ? `Verification: ${n.verifyMethod}` : ""}`,
      f,
      t.labelStyle
    );
  } else {
    const O = await Ut(
      h,
      `${a.type ? `Type: ${a.type}` : ""}`,
      f,
      t.labelStyle
    );
    f += O, await Ut(
      h,
      `${a.docRef ? `Doc Ref: ${a.docRef}` : ""}`,
      f,
      t.labelStyle
    );
  }
  const g = (((C = h.node()) == null ? void 0 : C.getBBox().width) ?? 200) + o, m = (((w = h.node()) == null ? void 0 : w.getBBox().height) ?? 200) + o, y = -g / 2, x = -m / 2, b = W.svg(h), _ = H(t, {});
  t.look !== "handDrawn" && (_.roughness = 0, _.fillStyle = "solid");
  const S = b.rectangle(y, x, g, m, _), k = h.insert(() => S, ":first-child");
  if (k.attr("class", "basic label-container").attr("style", i), h.selectAll(".label").each((O, I, F) => {
    const M = et(F[I]), P = M.attr("transform");
    let D = 0, A = 0;
    if (P) {
      const B = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(P);
      B && (D = parseFloat(B[1]), A = parseFloat(B[2]));
    }
    const L = A - m / 2;
    let T = y + o / 2;
    (I === 0 || I === 1) && (T = D), M.attr("transform", `translate(${T}, ${L + o})`);
  }), f > u + p + s) {
    const O = b.line(
      y,
      x + u + p + s,
      y + g,
      x + u + p + s,
      _
    );
    h.insert(() => O).attr("style", i);
  }
  return j(t, k), t.intersect = function(O) {
    return q.rect(t, O);
  }, h;
}
d(Up, "requirementBox");
async function Ut(e, t, r, i = "") {
  if (t === "")
    return 0;
  const n = e.insert("g").attr("class", "label").attr("style", i), a = nt(), o = a.htmlLabels ?? !0, s = await Be(
    n,
    ds(Xe(t)),
    {
      width: ue(t, a) + 50,
      // Add room for error when splitting text into multiple lines
      classes: "markdown-node-label",
      useHtmlLabels: o,
      style: i
    },
    a
  );
  let c;
  if (o) {
    const l = s.children[0], h = et(s);
    c = l.getBoundingClientRect(), h.attr("width", c.width), h.attr("height", c.height);
  } else {
    const l = s.children[0];
    for (const h of l.children)
      h.textContent = h.textContent.replaceAll("&gt;", ">").replaceAll("&lt;", "<"), i && h.setAttribute("style", i);
    c = s.getBBox(), c.height += 6;
  }
  return n.attr("transform", `translate(${-c.width / 2},${-c.height / 2 + r})`), c.height;
}
d(Ut, "addText");
var Bw = /* @__PURE__ */ d((e) => {
  switch (e) {
    case "Very High":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return null;
    case "Low":
      return "blue";
    case "Very Low":
      return "lightblue";
  }
}, "colorFromPriority");
async function Xp(e, t, { config: r }) {
  var P, D;
  const { labelStyles: i, nodeStyles: n } = Y(t);
  t.labelStyle = i || "";
  const a = 10, o = t.width;
  t.width = (t.width ?? 200) - 10;
  const {
    shapeSvg: s,
    bbox: c,
    label: l
  } = await J(e, t, Z(t)), h = t.padding || 10;
  let u = "", f;
  "ticket" in t && t.ticket && ((P = r == null ? void 0 : r.kanban) != null && P.ticketBaseUrl) && (u = (D = r == null ? void 0 : r.kanban) == null ? void 0 : D.ticketBaseUrl.replace("#TICKET#", t.ticket), f = s.insert("svg:a", ":first-child").attr("class", "kanban-ticket-link").attr("xlink:href", u).attr("target", "_blank"));
  const p = {
    useHtmlLabels: t.useHtmlLabels,
    labelStyle: t.labelStyle || "",
    width: t.width,
    img: t.img,
    padding: t.padding || 8,
    centerLabel: !1
  };
  let g, m;
  f ? { label: g, bbox: m } = await ca(
    f,
    "ticket" in t && t.ticket || "",
    p
  ) : { label: g, bbox: m } = await ca(
    s,
    "ticket" in t && t.ticket || "",
    p
  );
  const { label: y, bbox: x } = await ca(
    s,
    "assigned" in t && t.assigned || "",
    p
  );
  t.width = o;
  const b = 10, _ = (t == null ? void 0 : t.width) || 0, S = Math.max(m.height, x.height) / 2, k = Math.max(c.height + b * 2, (t == null ? void 0 : t.height) || 0) + S, C = -_ / 2, w = -k / 2;
  l.attr(
    "transform",
    "translate(" + (h - _ / 2) + ", " + (-S - c.height / 2) + ")"
  ), g.attr(
    "transform",
    "translate(" + (h - _ / 2) + ", " + (-S + c.height / 2) + ")"
  ), y.attr(
    "transform",
    "translate(" + (h + _ / 2 - x.width - 2 * a) + ", " + (-S + c.height / 2) + ")"
  );
  let O;
  const { rx: I, ry: F } = t, { cssStyles: M } = t;
  if (t.look === "handDrawn") {
    const A = W.svg(s), L = H(t, {}), T = I || F ? A.path(pe(C, w, _, k, I || 0), L) : A.rectangle(C, w, _, k, L);
    O = s.insert(() => T, ":first-child"), O.attr("class", "basic label-container").attr("style", M || null);
  } else {
    O = s.insert("rect", ":first-child"), O.attr("class", "basic label-container __APA__").attr("style", n).attr("rx", I ?? 5).attr("ry", F ?? 5).attr("x", C).attr("y", w).attr("width", _).attr("height", k);
    const A = "priority" in t && t.priority;
    if (A) {
      const L = s.append("line"), T = C + 2, $ = w + Math.floor((I ?? 0) / 2), B = w + k - Math.floor((I ?? 0) / 2);
      L.attr("x1", T).attr("y1", $).attr("x2", T).attr("y2", B).attr("stroke-width", "4").attr("stroke", Bw(A));
    }
  }
  return j(t, O), t.height = k, t.intersect = function(A) {
    return q.rect(t, A);
  }, s;
}
d(Xp, "kanbanItem");
var Lw = [
  {
    semanticName: "Process",
    name: "Rectangle",
    shortName: "rect",
    description: "Standard process shape",
    aliases: ["proc", "process", "rectangle"],
    internalAliases: ["squareRect"],
    handler: Mp
  },
  {
    semanticName: "Event",
    name: "Rounded Rectangle",
    shortName: "rounded",
    description: "Represents an event",
    aliases: ["event"],
    internalAliases: ["roundedRect"],
    handler: Tp
  },
  {
    semanticName: "Terminal Point",
    name: "Stadium",
    shortName: "stadium",
    description: "Terminal point",
    aliases: ["terminal", "pill"],
    handler: Ap
  },
  {
    semanticName: "Subprocess",
    name: "Framed Rectangle",
    shortName: "fr-rect",
    description: "Subprocess",
    aliases: ["subprocess", "subproc", "framed-rectangle", "subroutine"],
    handler: Op
  },
  {
    semanticName: "Database",
    name: "Cylinder",
    shortName: "cyl",
    description: "Database storage",
    aliases: ["db", "database", "cylinder"],
    handler: Jf
  },
  {
    semanticName: "Start",
    name: "Circle",
    shortName: "circle",
    description: "Starting point",
    aliases: ["circ"],
    handler: Gf
  },
  {
    semanticName: "Decision",
    name: "Diamond",
    shortName: "diam",
    description: "Decision-making step",
    aliases: ["decision", "diamond", "question"],
    handler: kp
  },
  {
    semanticName: "Prepare Conditional",
    name: "Hexagon",
    shortName: "hex",
    description: "Preparation or condition step",
    aliases: ["hexagon", "prepare"],
    handler: sp
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Right",
    shortName: "lean-r",
    description: "Represents input or output",
    aliases: ["lean-right", "in-out"],
    internalAliases: ["lean_right"],
    handler: mp
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Left",
    shortName: "lean-l",
    description: "Represents output or input",
    aliases: ["lean-left", "out-in"],
    internalAliases: ["lean_left"],
    handler: gp
  },
  {
    semanticName: "Priority Action",
    name: "Trapezoid Base Bottom",
    shortName: "trap-b",
    description: "Priority action",
    aliases: ["priority", "trapezoid-bottom", "trapezoid"],
    handler: Np
  },
  {
    semanticName: "Manual Operation",
    name: "Trapezoid Base Top",
    shortName: "trap-t",
    description: "Represents a manual task",
    aliases: ["manual", "trapezoid-top", "inv-trapezoid"],
    internalAliases: ["inv_trapezoid"],
    handler: pp
  },
  {
    semanticName: "Stop",
    name: "Double Circle",
    shortName: "dbl-circ",
    description: "Represents a stop point",
    aliases: ["double-circle"],
    internalAliases: ["doublecircle"],
    handler: ep
  },
  {
    semanticName: "Text Block",
    name: "Text Block",
    shortName: "text",
    description: "Text block",
    handler: Ip
  },
  {
    semanticName: "Card",
    name: "Notched Rectangle",
    shortName: "notch-rect",
    description: "Represents a card",
    aliases: ["card", "notched-rectangle"],
    handler: jf
  },
  {
    semanticName: "Lined/Shaded Process",
    name: "Lined Rectangle",
    shortName: "lin-rect",
    description: "Lined process shape",
    aliases: ["lined-rectangle", "lined-process", "lin-proc", "shaded-process"],
    handler: Bp
  },
  {
    semanticName: "Start",
    name: "Small Circle",
    shortName: "sm-circ",
    description: "Small starting point",
    aliases: ["start", "small-circle"],
    internalAliases: ["stateStart"],
    handler: Ep
  },
  {
    semanticName: "Stop",
    name: "Framed Circle",
    shortName: "fr-circ",
    description: "Stop point",
    aliases: ["stop", "framed-circle"],
    internalAliases: ["stateEnd"],
    handler: Fp
  },
  {
    semanticName: "Fork/Join",
    name: "Filled Rectangle",
    shortName: "fork",
    description: "Fork or join in process flow",
    aliases: ["join"],
    internalAliases: ["forkJoin"],
    handler: np
  },
  {
    semanticName: "Collate",
    name: "Hourglass",
    shortName: "hourglass",
    description: "Represents a collate operation",
    aliases: ["hourglass", "collate"],
    handler: op
  },
  {
    semanticName: "Comment",
    name: "Curly Brace",
    shortName: "brace",
    description: "Adds a comment",
    aliases: ["comment", "brace-l"],
    handler: Vf
  },
  {
    semanticName: "Comment Right",
    name: "Curly Brace",
    shortName: "brace-r",
    description: "Adds a comment",
    handler: Zf
  },
  {
    semanticName: "Comment with braces on both sides",
    name: "Curly Braces",
    shortName: "braces",
    description: "Adds a comment",
    handler: Kf
  },
  {
    semanticName: "Com Link",
    name: "Lightning Bolt",
    shortName: "bolt",
    description: "Communication link",
    aliases: ["com-link", "lightning-bolt"],
    handler: yp
  },
  {
    semanticName: "Document",
    name: "Document",
    shortName: "doc",
    description: "Represents a document",
    aliases: ["doc", "document"],
    handler: Wp
  },
  {
    semanticName: "Delay",
    name: "Half-Rounded Rectangle",
    shortName: "delay",
    description: "Represents a delay",
    aliases: ["half-rounded-rectangle"],
    handler: ap
  },
  {
    semanticName: "Direct Access Storage",
    name: "Horizontal Cylinder",
    shortName: "h-cyl",
    description: "Direct access storage",
    aliases: ["das", "horizontal-cylinder"],
    handler: Pp
  },
  {
    semanticName: "Disk Storage",
    name: "Lined Cylinder",
    shortName: "lin-cyl",
    description: "Disk storage",
    aliases: ["disk", "lined-cylinder"],
    handler: xp
  },
  {
    semanticName: "Display",
    name: "Curved Trapezoid",
    shortName: "curv-trap",
    description: "Represents a display",
    aliases: ["curved-trapezoid", "display"],
    handler: Qf
  },
  {
    semanticName: "Divided Process",
    name: "Divided Rectangle",
    shortName: "div-rect",
    description: "Divided process shape",
    aliases: ["div-proc", "divided-rectangle", "divided-process"],
    handler: tp
  },
  {
    semanticName: "Extract",
    name: "Triangle",
    shortName: "tri",
    description: "Extraction process",
    aliases: ["extract", "triangle"],
    handler: qp
  },
  {
    semanticName: "Internal Storage",
    name: "Window Pane",
    shortName: "win-pane",
    description: "Internal storage",
    aliases: ["internal-storage", "window-pane"],
    handler: jp
  },
  {
    semanticName: "Junction",
    name: "Filled Circle",
    shortName: "f-circ",
    description: "Junction point",
    aliases: ["junction", "filled-circle"],
    handler: rp
  },
  {
    semanticName: "Loop Limit",
    name: "Trapezoidal Pentagon",
    shortName: "notch-pent",
    description: "Loop limit step",
    aliases: ["loop-limit", "notched-pentagon"],
    handler: zp
  },
  {
    semanticName: "Manual File",
    name: "Flipped Triangle",
    shortName: "flip-tri",
    description: "Manual file operation",
    aliases: ["manual-file", "flipped-triangle"],
    handler: ip
  },
  {
    semanticName: "Manual Input",
    name: "Sloped Rectangle",
    shortName: "sl-rect",
    description: "Manual input step",
    aliases: ["manual-input", "sloped-rectangle"],
    handler: Lp
  },
  {
    semanticName: "Multi-Document",
    name: "Stacked Document",
    shortName: "docs",
    description: "Multiple documents",
    aliases: ["documents", "st-doc", "stacked-document"],
    handler: _p
  },
  {
    semanticName: "Multi-Process",
    name: "Stacked Rectangle",
    shortName: "st-rect",
    description: "Multiple processes",
    aliases: ["procs", "processes", "stacked-rectangle"],
    handler: Cp
  },
  {
    semanticName: "Stored Data",
    name: "Bow Tie Rectangle",
    shortName: "bow-rect",
    description: "Stored data",
    aliases: ["stored-data", "bow-tie-rectangle"],
    handler: Hf
  },
  {
    semanticName: "Summary",
    name: "Crossed Circle",
    shortName: "cross-circ",
    description: "Summary",
    aliases: ["summary", "crossed-circle"],
    handler: Xf
  },
  {
    semanticName: "Tagged Document",
    name: "Tagged Document",
    shortName: "tag-doc",
    description: "Tagged document",
    aliases: ["tag-doc", "tagged-document"],
    handler: Rp
  },
  {
    semanticName: "Tagged Process",
    name: "Tagged Rectangle",
    shortName: "tag-rect",
    description: "Tagged process",
    aliases: ["tagged-rectangle", "tag-proc", "tagged-process"],
    handler: Dp
  },
  {
    semanticName: "Paper Tape",
    name: "Flag",
    shortName: "flag",
    description: "Paper tape",
    aliases: ["paper-tape"],
    handler: Hp
  },
  {
    semanticName: "Odd",
    name: "Odd",
    shortName: "odd",
    description: "Odd shape",
    internalAliases: ["rect_left_inv_arrow"],
    handler: vp
  },
  {
    semanticName: "Lined Document",
    name: "Lined Document",
    shortName: "lin-doc",
    description: "Lined document",
    aliases: ["lined-document"],
    handler: bp
  }
], Mw = /* @__PURE__ */ d(() => {
  const t = [
    ...Object.entries({
      // States
      state: $p,
      choice: Yf,
      note: wp,
      // Rectangles
      rectWithTitle: Sp,
      labelRect: dp,
      // Icons
      iconSquare: up,
      iconCircle: cp,
      icon: lp,
      iconRounded: hp,
      imageSquare: fp,
      anchor: Wf,
      // Kanban diagram
      kanbanItem: Xp,
      // class diagram
      classBox: Gp,
      // er diagram
      erBox: ao,
      // Requirement diagram
      requirementBox: Up
    }),
    ...Lw.flatMap((r) => [
      r.shortName,
      ..."aliases" in r ? r.aliases : [],
      ..."internalAliases" in r ? r.internalAliases : []
    ].map((n) => [n, r.handler]))
  ];
  return Object.fromEntries(t);
}, "generateShapeMap"), Vp = Mw();
function Aw(e) {
  return e in Vp;
}
d(Aw, "isValidShape");
var Un = /* @__PURE__ */ new Map();
async function Zp(e, t, r) {
  let i, n;
  t.shape === "rect" && (t.rx && t.ry ? t.shape = "roundedRect" : t.shape = "squareRect");
  const a = t.shape ? Vp[t.shape] : void 0;
  if (!a)
    throw new Error(`No such shape: ${t.shape}. Please check your syntax.`);
  if (t.link) {
    let o;
    r.config.securityLevel === "sandbox" ? o = "_top" : t.linkTarget && (o = t.linkTarget || "_blank"), i = e.insert("svg:a").attr("xlink:href", t.link).attr("target", o ?? null), n = await a(i, t, r);
  } else
    n = await a(e, t, r), i = n;
  return t.tooltip && n.attr("title", t.tooltip), Un.set(t.id, i), t.haveCallback && i.attr("class", i.attr("class") + " clickable"), i;
}
d(Zp, "insertNode");
var FT = /* @__PURE__ */ d((e, t) => {
  Un.set(t.id, e);
}, "setNodeElem"), ET = /* @__PURE__ */ d(() => {
  Un.clear();
}, "clear"), OT = /* @__PURE__ */ d((e) => {
  const t = Un.get(e.id);
  E.trace(
    "Transforming node",
    e.diff,
    e,
    "translate(" + (e.x - e.width / 2 - 5) + ", " + e.width / 2 + ")"
  );
  const r = 8, i = e.diff || 0;
  return e.clusterNode ? t.attr(
    "transform",
    "translate(" + (e.x + i - e.width / 2) + ", " + (e.y - e.height / 2 - r) + ")"
  ) : t.attr("transform", "translate(" + e.x + ", " + e.y + ")"), i;
}, "positionNode"), $w = /* @__PURE__ */ d((e, t, r, i, n, a) => {
  t.arrowTypeStart && xl(e, "start", t.arrowTypeStart, r, i, n, a), t.arrowTypeEnd && xl(e, "end", t.arrowTypeEnd, r, i, n, a);
}, "addEdgeMarkers"), Fw = {
  arrow_cross: { type: "cross", fill: !1 },
  arrow_point: { type: "point", fill: !0 },
  arrow_barb: { type: "barb", fill: !0 },
  arrow_circle: { type: "circle", fill: !1 },
  aggregation: { type: "aggregation", fill: !1 },
  extension: { type: "extension", fill: !1 },
  composition: { type: "composition", fill: !0 },
  dependency: { type: "dependency", fill: !0 },
  lollipop: { type: "lollipop", fill: !1 },
  only_one: { type: "onlyOne", fill: !1 },
  zero_or_one: { type: "zeroOrOne", fill: !1 },
  one_or_more: { type: "oneOrMore", fill: !1 },
  zero_or_more: { type: "zeroOrMore", fill: !1 },
  requirement_arrow: { type: "requirement_arrow", fill: !1 },
  requirement_contains: { type: "requirement_contains", fill: !1 }
}, xl = /* @__PURE__ */ d((e, t, r, i, n, a, o) => {
  var u;
  const s = Fw[r];
  if (!s) {
    E.warn(`Unknown arrow type: ${r}`);
    return;
  }
  const c = s.type, h = `${n}_${a}-${c}${t === "start" ? "Start" : "End"}`;
  if (o && o.trim() !== "") {
    const f = o.replace(/[^\dA-Za-z]/g, "_"), p = `${h}_${f}`;
    if (!document.getElementById(p)) {
      const g = document.getElementById(h);
      if (g) {
        const m = g.cloneNode(!0);
        m.id = p, m.querySelectorAll("path, circle, line").forEach((x) => {
          x.setAttribute("stroke", o), s.fill && x.setAttribute("fill", o);
        }), (u = g.parentNode) == null || u.appendChild(m);
      }
    }
    e.attr(`marker-${t}`, `url(${i}#${p})`);
  } else
    e.attr(`marker-${t}`, `url(${i}#${h})`);
}, "addEdgeMarker"), wn = /* @__PURE__ */ new Map(), bt = /* @__PURE__ */ new Map(), DT = /* @__PURE__ */ d(() => {
  wn.clear(), bt.clear();
}, "clear"), Rr = /* @__PURE__ */ d((e) => e ? e.reduce((r, i) => r + ";" + i, "") : "", "getLabelStyles"), Ew = /* @__PURE__ */ d(async (e, t) => {
  let r = gt(nt().flowchart.htmlLabels);
  const i = await Be(e, t.label, {
    style: Rr(t.labelStyle),
    useHtmlLabels: r,
    addSvgBackground: !0,
    isNode: !1
  });
  E.info("abc82", t, t.labelType);
  const n = e.insert("g").attr("class", "edgeLabel"), a = n.insert("g").attr("class", "label");
  a.node().appendChild(i);
  let o = i.getBBox();
  if (r) {
    const c = i.children[0], l = et(i);
    o = c.getBoundingClientRect(), l.attr("width", o.width), l.attr("height", o.height);
  }
  a.attr("transform", "translate(" + -o.width / 2 + ", " + -o.height / 2 + ")"), wn.set(t.id, n), t.width = o.width, t.height = o.height;
  let s;
  if (t.startLabelLeft) {
    const c = await Re(
      t.startLabelLeft,
      Rr(t.labelStyle)
    ), l = e.insert("g").attr("class", "edgeTerminals"), h = l.insert("g").attr("class", "inner");
    s = h.node().appendChild(c);
    const u = c.getBBox();
    h.attr("transform", "translate(" + -u.width / 2 + ", " + -u.height / 2 + ")"), bt.get(t.id) || bt.set(t.id, {}), bt.get(t.id).startLeft = l, Hr(s, t.startLabelLeft);
  }
  if (t.startLabelRight) {
    const c = await Re(
      t.startLabelRight,
      Rr(t.labelStyle)
    ), l = e.insert("g").attr("class", "edgeTerminals"), h = l.insert("g").attr("class", "inner");
    s = l.node().appendChild(c), h.node().appendChild(c);
    const u = c.getBBox();
    h.attr("transform", "translate(" + -u.width / 2 + ", " + -u.height / 2 + ")"), bt.get(t.id) || bt.set(t.id, {}), bt.get(t.id).startRight = l, Hr(s, t.startLabelRight);
  }
  if (t.endLabelLeft) {
    const c = await Re(t.endLabelLeft, Rr(t.labelStyle)), l = e.insert("g").attr("class", "edgeTerminals"), h = l.insert("g").attr("class", "inner");
    s = h.node().appendChild(c);
    const u = c.getBBox();
    h.attr("transform", "translate(" + -u.width / 2 + ", " + -u.height / 2 + ")"), l.node().appendChild(c), bt.get(t.id) || bt.set(t.id, {}), bt.get(t.id).endLeft = l, Hr(s, t.endLabelLeft);
  }
  if (t.endLabelRight) {
    const c = await Re(t.endLabelRight, Rr(t.labelStyle)), l = e.insert("g").attr("class", "edgeTerminals"), h = l.insert("g").attr("class", "inner");
    s = h.node().appendChild(c);
    const u = c.getBBox();
    h.attr("transform", "translate(" + -u.width / 2 + ", " + -u.height / 2 + ")"), l.node().appendChild(c), bt.get(t.id) || bt.set(t.id, {}), bt.get(t.id).endRight = l, Hr(s, t.endLabelRight);
  }
  return i;
}, "insertEdgeLabel");
function Hr(e, t) {
  nt().flowchart.htmlLabels && e && (e.style.width = t.length * 9 + "px", e.style.height = "12px");
}
d(Hr, "setTerminalWidth");
var Ow = /* @__PURE__ */ d((e, t) => {
  E.debug("Moving label abc88 ", e.id, e.label, wn.get(e.id), t);
  let r = t.updatedPath ? t.updatedPath : t.originalPath;
  const i = nt(), { subGraphTitleTotalMargin: n } = ws(i);
  if (e.label) {
    const a = wn.get(e.id);
    let o = e.x, s = e.y;
    if (r) {
      const c = Vt.calcLabelPosition(r);
      E.debug(
        "Moving label " + e.label + " from (",
        o,
        ",",
        s,
        ") to (",
        c.x,
        ",",
        c.y,
        ") abc88"
      ), t.updatedPath && (o = c.x, s = c.y);
    }
    a.attr("transform", `translate(${o}, ${s + n / 2})`);
  }
  if (e.startLabelLeft) {
    const a = bt.get(e.id).startLeft;
    let o = e.x, s = e.y;
    if (r) {
      const c = Vt.calcTerminalLabelPosition(e.arrowTypeStart ? 10 : 0, "start_left", r);
      o = c.x, s = c.y;
    }
    a.attr("transform", `translate(${o}, ${s})`);
  }
  if (e.startLabelRight) {
    const a = bt.get(e.id).startRight;
    let o = e.x, s = e.y;
    if (r) {
      const c = Vt.calcTerminalLabelPosition(
        e.arrowTypeStart ? 10 : 0,
        "start_right",
        r
      );
      o = c.x, s = c.y;
    }
    a.attr("transform", `translate(${o}, ${s})`);
  }
  if (e.endLabelLeft) {
    const a = bt.get(e.id).endLeft;
    let o = e.x, s = e.y;
    if (r) {
      const c = Vt.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_left", r);
      o = c.x, s = c.y;
    }
    a.attr("transform", `translate(${o}, ${s})`);
  }
  if (e.endLabelRight) {
    const a = bt.get(e.id).endRight;
    let o = e.x, s = e.y;
    if (r) {
      const c = Vt.calcTerminalLabelPosition(e.arrowTypeEnd ? 10 : 0, "end_right", r);
      o = c.x, s = c.y;
    }
    a.attr("transform", `translate(${o}, ${s})`);
  }
}, "positionEdgeLabel"), Dw = /* @__PURE__ */ d((e, t) => {
  const r = e.x, i = e.y, n = Math.abs(t.x - r), a = Math.abs(t.y - i), o = e.width / 2, s = e.height / 2;
  return n >= o || a >= s;
}, "outsideNode"), Rw = /* @__PURE__ */ d((e, t, r) => {
  E.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(t)}
  insidePoint : ${JSON.stringify(r)}
  node        : x:${e.x} y:${e.y} w:${e.width} h:${e.height}`);
  const i = e.x, n = e.y, a = Math.abs(i - r.x), o = e.width / 2;
  let s = r.x < t.x ? o - a : o + a;
  const c = e.height / 2, l = Math.abs(t.y - r.y), h = Math.abs(t.x - r.x);
  if (Math.abs(n - t.y) * o > Math.abs(i - t.x) * c) {
    let u = r.y < t.y ? t.y - c - n : n - c - t.y;
    s = h * u / l;
    const f = {
      x: r.x < t.x ? r.x + s : r.x - h + s,
      y: r.y < t.y ? r.y + l - u : r.y - l + u
    };
    return s === 0 && (f.x = t.x, f.y = t.y), h === 0 && (f.x = t.x), l === 0 && (f.y = t.y), E.debug(`abc89 top/bottom calc, Q ${l}, q ${u}, R ${h}, r ${s}`, f), f;
  } else {
    r.x < t.x ? s = t.x - o - i : s = i - o - t.x;
    let u = l * s / h, f = r.x < t.x ? r.x + h - s : r.x - h + s, p = r.y < t.y ? r.y + u : r.y - u;
    return E.debug(`sides calc abc89, Q ${l}, q ${u}, R ${h}, r ${s}`, { _x: f, _y: p }), s === 0 && (f = t.x, p = t.y), h === 0 && (f = t.x), l === 0 && (p = t.y), { x: f, y: p };
  }
}, "intersection"), bl = /* @__PURE__ */ d((e, t) => {
  E.warn("abc88 cutPathAtIntersect", e, t);
  let r = [], i = e[0], n = !1;
  return e.forEach((a) => {
    if (E.info("abc88 checking point", a, t), !Dw(t, a) && !n) {
      const o = Rw(t, i, a);
      E.debug("abc88 inside", a, i, o), E.debug("abc88 intersection", o, t);
      let s = !1;
      r.forEach((c) => {
        s = s || c.x === o.x && c.y === o.y;
      }), r.some((c) => c.x === o.x && c.y === o.y) ? E.warn("abc88 no intersect", o, r) : r.push(o), n = !0;
    } else
      E.warn("abc88 outside", a, i), i = a, n || r.push(a);
  }), E.debug("returning points", r), r;
}, "cutPathAtIntersect");
function Kp(e) {
  const t = [], r = [];
  for (let i = 1; i < e.length - 1; i++) {
    const n = e[i - 1], a = e[i], o = e[i + 1];
    (n.x === a.x && a.y === o.y && Math.abs(a.x - o.x) > 5 && Math.abs(a.y - n.y) > 5 || n.y === a.y && a.x === o.x && Math.abs(a.x - n.x) > 5 && Math.abs(a.y - o.y) > 5) && (t.push(a), r.push(i));
  }
  return { cornerPoints: t, cornerPointPositions: r };
}
d(Kp, "extractCornerPoints");
var Cl = /* @__PURE__ */ d(function(e, t, r) {
  const i = t.x - e.x, n = t.y - e.y, a = Math.sqrt(i * i + n * n), o = r / a;
  return { x: t.x - o * i, y: t.y - o * n };
}, "findAdjacentPoint"), Iw = /* @__PURE__ */ d(function(e) {
  const { cornerPointPositions: t } = Kp(e), r = [];
  for (let i = 0; i < e.length; i++)
    if (t.includes(i)) {
      const n = e[i - 1], a = e[i + 1], o = e[i], s = Cl(n, o, 5), c = Cl(a, o, 5), l = c.x - s.x, h = c.y - s.y;
      r.push(s);
      const u = Math.sqrt(2) * 2;
      let f = { x: o.x, y: o.y };
      if (Math.abs(a.x - n.x) > 10 && Math.abs(a.y - n.y) >= 10) {
        E.debug(
          "Corner point fixing",
          Math.abs(a.x - n.x),
          Math.abs(a.y - n.y)
        );
        const p = 5;
        o.x === s.x ? f = {
          x: l < 0 ? s.x - p + u : s.x + p - u,
          y: h < 0 ? s.y - u : s.y + u
        } : f = {
          x: l < 0 ? s.x - u : s.x + u,
          y: h < 0 ? s.y - p + u : s.y + p - u
        };
      } else
        E.debug(
          "Corner point skipping fixing",
          Math.abs(a.x - n.x),
          Math.abs(a.y - n.y)
        );
      r.push(f, c);
    } else
      r.push(e[i]);
  return r;
}, "fixCorners"), Pw = /* @__PURE__ */ d(function(e, t, r, i, n, a, o) {
  var I;
  const { handDrawnSeed: s } = nt();
  let c = t.points, l = !1;
  const h = n;
  var u = a;
  const f = [];
  for (const F in t.cssCompiledStyles)
    Ef(F) || f.push(t.cssCompiledStyles[F]);
  u.intersect && h.intersect && (c = c.slice(1, t.points.length - 1), c.unshift(h.intersect(c[0])), E.debug(
    "Last point APA12",
    t.start,
    "-->",
    t.end,
    c[c.length - 1],
    u,
    u.intersect(c[c.length - 1])
  ), c.push(u.intersect(c[c.length - 1]))), t.toCluster && (E.info("to cluster abc88", r.get(t.toCluster)), c = bl(t.points, r.get(t.toCluster).node), l = !0), t.fromCluster && (E.debug(
    "from cluster abc88",
    r.get(t.fromCluster),
    JSON.stringify(c, null, 2)
  ), c = bl(c.reverse(), r.get(t.fromCluster).node).reverse(), l = !0);
  let p = c.filter((F) => !Number.isNaN(F.y));
  p = Iw(p);
  let g = Di;
  switch (g = sn, t.curve) {
    case "linear":
      g = sn;
      break;
    case "basis":
      g = Di;
      break;
    case "cardinal":
      g = bu;
      break;
    case "bumpX":
      g = du;
      break;
    case "bumpY":
      g = gu;
      break;
    case "catmullRom":
      g = _u;
      break;
    case "monotoneX":
      g = Bu;
      break;
    case "monotoneY":
      g = Lu;
      break;
    case "natural":
      g = Au;
      break;
    case "step":
      g = $u;
      break;
    case "stepAfter":
      g = Eu;
      break;
    case "stepBefore":
      g = Fu;
      break;
    default:
      g = Di;
  }
  const { x: m, y } = sm(t), x = e1().x(m).y(y).curve(g);
  let b;
  switch (t.thickness) {
    case "normal":
      b = "edge-thickness-normal";
      break;
    case "thick":
      b = "edge-thickness-thick";
      break;
    case "invisible":
      b = "edge-thickness-invisible";
      break;
    default:
      b = "edge-thickness-normal";
  }
  switch (t.pattern) {
    case "solid":
      b += " edge-pattern-solid";
      break;
    case "dotted":
      b += " edge-pattern-dotted";
      break;
    case "dashed":
      b += " edge-pattern-dashed";
      break;
    default:
      b += " edge-pattern-solid";
  }
  let _, S = x(p);
  const k = Array.isArray(t.style) ? t.style : [t.style];
  let C = k.find((F) => F == null ? void 0 : F.startsWith("stroke:"));
  if (t.look === "handDrawn") {
    const F = W.svg(e);
    Object.assign([], p);
    const M = F.path(S, {
      roughness: 0.3,
      seed: s
    });
    b += " transition", _ = et(M).select("path").attr("id", t.id).attr("class", " " + b + (t.classes ? " " + t.classes : "")).attr("style", k ? k.reduce((D, A) => D + ";" + A, "") : "");
    let P = _.attr("d");
    _.attr("d", P), e.node().appendChild(_.node());
  } else {
    const F = f.join(";"), M = k ? k.reduce((A, L) => A + L + ";", "") : "";
    let P = "";
    t.animate && (P = " edge-animation-fast"), t.animation && (P = " edge-animation-" + t.animation);
    const D = F ? F + ";" + M + ";" : M;
    _ = e.append("path").attr("d", S).attr("id", t.id).attr(
      "class",
      " " + b + (t.classes ? " " + t.classes : "") + (P ?? "")
    ).attr("style", D), C = (I = D.match(/stroke:([^;]+)/)) == null ? void 0 : I[1];
  }
  let w = "";
  (nt().flowchart.arrowMarkerAbsolute || nt().state.arrowMarkerAbsolute) && (w = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search, w = w.replace(/\(/g, "\\(").replace(/\)/g, "\\)")), E.info("arrowTypeStart", t.arrowTypeStart), E.info("arrowTypeEnd", t.arrowTypeEnd), $w(_, t, w, o, i, C);
  let O = {};
  return l && (O.updatedPath = c), O.originalPath = t.points, O;
}, "insertEdge"), Nw = /* @__PURE__ */ d((e, t, r, i) => {
  t.forEach((n) => {
    ek[n](e, r, i);
  });
}, "insertMarkers"), zw = /* @__PURE__ */ d((e, t, r) => {
  E.trace("Making markers for ", r), e.append("defs").append("marker").attr("id", r + "_" + t + "-extensionStart").attr("class", "marker extension " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 1,7 L18,13 V 1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-extensionEnd").attr("class", "marker extension " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 1,1 V 13 L18,7 Z");
}, "extension"), qw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionStart").attr("class", "marker composition " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-compositionEnd").attr("class", "marker composition " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "composition"), Ww = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationStart").attr("class", "marker aggregation " + t).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-aggregationEnd").attr("class", "marker aggregation " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "aggregation"), Hw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyStart").attr("class", "marker dependency " + t).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z"), e.append("defs").append("marker").attr("id", r + "_" + t + "-dependencyEnd").attr("class", "marker dependency " + t).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "dependency"), jw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopStart").attr("class", "marker lollipop " + t).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6), e.append("defs").append("marker").attr("id", r + "_" + t + "-lollipopEnd").attr("class", "marker lollipop " + t).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
}, "lollipop"), Yw = /* @__PURE__ */ d((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-pointEnd").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-pointStart").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "point"), Gw = /* @__PURE__ */ d((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-circleEnd").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-circleStart").attr("class", "marker " + t).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "circle"), Uw = /* @__PURE__ */ d((e, t, r) => {
  e.append("marker").attr("id", r + "_" + t + "-crossEnd").attr("class", "marker cross " + t).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0"), e.append("marker").attr("id", r + "_" + t + "-crossStart").attr("class", "marker cross " + t).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
}, "cross"), Xw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "barb"), Vw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneStart").attr("class", "marker onlyOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M9,0 L9,18 M15,0 L15,18"), e.append("defs").append("marker").attr("id", r + "_" + t + "-onlyOneEnd").attr("class", "marker onlyOne " + t).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M3,0 L3,18 M9,0 L9,18");
}, "only_one"), Zw = /* @__PURE__ */ d((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneStart").attr("class", "marker zeroOrOne " + t).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  i.append("circle").attr("fill", "white").attr("cx", 21).attr("cy", 9).attr("r", 6), i.append("path").attr("d", "M9,0 L9,18");
  const n = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrOneEnd").attr("class", "marker zeroOrOne " + t).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  n.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 9).attr("r", 6), n.append("path").attr("d", "M21,0 L21,18");
}, "zero_or_one"), Kw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreStart").attr("class", "marker oneOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27"), e.append("defs").append("marker").attr("id", r + "_" + t + "-oneOrMoreEnd").attr("class", "marker oneOrMore " + t).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18");
}, "one_or_more"), Qw = /* @__PURE__ */ d((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreStart").attr("class", "marker zeroOrMore " + t).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  i.append("circle").attr("fill", "white").attr("cx", 48).attr("cy", 18).attr("r", 6), i.append("path").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18");
  const n = e.append("defs").append("marker").attr("id", r + "_" + t + "-zeroOrMoreEnd").attr("class", "marker zeroOrMore " + t).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  n.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 18).attr("r", 6), n.append("path").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18");
}, "zero_or_more"), Jw = /* @__PURE__ */ d((e, t, r) => {
  e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_arrowEnd").attr("refX", 20).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("path").attr(
    "d",
    `M0,0
      L20,10
      M20,10
      L0,20`
  );
}, "requirement_arrow"), tk = /* @__PURE__ */ d((e, t, r) => {
  const i = e.append("defs").append("marker").attr("id", r + "_" + t + "-requirement_containsStart").attr("refX", 0).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("g");
  i.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 9).attr("fill", "none"), i.append("line").attr("x1", 1).attr("x2", 19).attr("y1", 10).attr("y2", 10), i.append("line").attr("y1", 1).attr("y2", 19).attr("x1", 10).attr("x2", 10);
}, "requirement_contains"), ek = {
  extension: zw,
  composition: qw,
  aggregation: Ww,
  dependency: Hw,
  lollipop: jw,
  point: Yw,
  circle: Gw,
  cross: Uw,
  barb: Xw,
  only_one: Vw,
  zero_or_one: Zw,
  one_or_more: Kw,
  zero_or_more: Qw,
  requirement_arrow: Jw,
  requirement_contains: tk
}, rk = Nw, ik = {
  common: kr,
  getConfig: Et,
  insertCluster: uw,
  insertEdge: Pw,
  insertEdgeLabel: Ew,
  insertMarkers: rk,
  insertNode: Zp,
  interpolateToCurve: zs,
  labelHelper: J,
  log: E,
  positionEdgeLabel: Ow
}, si = {}, Qp = /* @__PURE__ */ d((e) => {
  for (const t of e)
    si[t.name] = t;
}, "registerLayoutLoaders"), nk = /* @__PURE__ */ d(() => {
  Qp([
    {
      name: "dagre",
      loader: /* @__PURE__ */ d(async () => await import("./dagre-OKDRZEBW-CG0eFd70.js"), "loader")
    }
  ]);
}, "registerDefaultLayoutLoaders");
nk();
var RT = /* @__PURE__ */ d(async (e, t) => {
  if (!(e.layoutAlgorithm in si))
    throw new Error(`Unknown layout algorithm: ${e.layoutAlgorithm}`);
  const r = si[e.layoutAlgorithm];
  return (await r.loader()).render(e, t, ik, {
    algorithm: r.algorithm
  });
}, "render"), IT = /* @__PURE__ */ d((e = "", { fallback: t = "dagre" } = {}) => {
  if (e in si)
    return e;
  if (t in si)
    return E.warn(`Layout algorithm ${e} is not registered. Using ${t} as fallback.`), t;
  throw new Error(`Both layout algorithms ${e} and ${t} are not registered.`);
}, "getRegisteredLayoutAlgorithm"), _l = {
  name: "mermaid",
  version: "11.6.0",
  description: "Markdown-ish syntax for generating flowcharts, mindmaps, sequence diagrams, class diagrams, gantt charts, git graphs and more.",
  type: "module",
  module: "./dist/mermaid.core.mjs",
  types: "./dist/mermaid.d.ts",
  exports: {
    ".": {
      types: "./dist/mermaid.d.ts",
      import: "./dist/mermaid.core.mjs",
      default: "./dist/mermaid.core.mjs"
    },
    "./*": "./*"
  },
  keywords: [
    "diagram",
    "markdown",
    "flowchart",
    "sequence diagram",
    "gantt",
    "class diagram",
    "git graph",
    "mindmap",
    "packet diagram",
    "c4 diagram",
    "er diagram",
    "pie chart",
    "pie diagram",
    "quadrant chart",
    "requirement diagram",
    "graph"
  ],
  scripts: {
    clean: "rimraf dist",
    dev: "pnpm -w dev",
    "docs:code": "typedoc src/defaultConfig.ts src/config.ts src/mermaid.ts && prettier --write ./src/docs/config/setup",
    "docs:build": "rimraf ../../docs && pnpm docs:code && pnpm docs:spellcheck && tsx scripts/docs.cli.mts",
    "docs:verify": "pnpm docs:code && pnpm docs:spellcheck && tsx scripts/docs.cli.mts --verify",
    "docs:pre:vitepress": "pnpm --filter ./src/docs prefetch && rimraf src/vitepress && pnpm docs:code && tsx scripts/docs.cli.mts --vitepress && pnpm --filter ./src/vitepress install --no-frozen-lockfile --ignore-scripts",
    "docs:build:vitepress": "pnpm docs:pre:vitepress && (cd src/vitepress && pnpm run build) && cpy --flat src/docs/landing/ ./src/vitepress/.vitepress/dist/landing",
    "docs:dev": 'pnpm docs:pre:vitepress && concurrently "pnpm --filter ./src/vitepress dev" "tsx scripts/docs.cli.mts --watch --vitepress"',
    "docs:dev:docker": 'pnpm docs:pre:vitepress && concurrently "pnpm --filter ./src/vitepress dev:docker" "tsx scripts/docs.cli.mts --watch --vitepress"',
    "docs:serve": "pnpm docs:build:vitepress && vitepress serve src/vitepress",
    "docs:spellcheck": 'cspell "src/docs/**/*.md"',
    "docs:release-version": "tsx scripts/update-release-version.mts",
    "docs:verify-version": "tsx scripts/update-release-version.mts --verify",
    "types:build-config": "tsx scripts/create-types-from-json-schema.mts",
    "types:verify-config": "tsx scripts/create-types-from-json-schema.mts --verify",
    checkCircle: "npx madge --circular ./src",
    prepublishOnly: "pnpm docs:verify-version"
  },
  repository: {
    type: "git",
    url: "https://github.com/mermaid-js/mermaid"
  },
  author: "Knut Sveidqvist",
  license: "MIT",
  standard: {
    ignore: [
      "**/parser/*.js",
      "dist/**/*.js",
      "cypress/**/*.js"
    ],
    globals: [
      "page"
    ]
  },
  dependencies: {
    "@braintree/sanitize-url": "^7.0.4",
    "@iconify/utils": "^2.1.33",
    "@mermaid-js/parser": "workspace:^",
    "@types/d3": "^7.4.3",
    cytoscape: "^3.29.3",
    "cytoscape-cose-bilkent": "^4.1.0",
    "cytoscape-fcose": "^2.2.0",
    d3: "^7.9.0",
    "d3-sankey": "^0.12.3",
    "dagre-d3-es": "7.0.11",
    dayjs: "^1.11.13",
    dompurify: "^3.2.4",
    katex: "^0.16.9",
    khroma: "^2.1.0",
    "lodash-es": "^4.17.21",
    marked: "^15.0.7",
    roughjs: "^4.6.6",
    stylis: "^4.3.6",
    "ts-dedent": "^2.2.0",
    uuid: "^11.1.0"
  },
  devDependencies: {
    "@adobe/jsonschema2md": "^8.0.2",
    "@iconify/types": "^2.0.0",
    "@types/cytoscape": "^3.21.9",
    "@types/cytoscape-fcose": "^2.2.4",
    "@types/d3-sankey": "^0.12.4",
    "@types/d3-scale": "^4.0.9",
    "@types/d3-scale-chromatic": "^3.1.0",
    "@types/d3-selection": "^3.0.11",
    "@types/d3-shape": "^3.1.7",
    "@types/jsdom": "^21.1.7",
    "@types/katex": "^0.16.7",
    "@types/lodash-es": "^4.17.12",
    "@types/micromatch": "^4.0.9",
    "@types/stylis": "^4.2.7",
    "@types/uuid": "^10.0.0",
    ajv: "^8.17.1",
    chokidar: "^4.0.3",
    concurrently: "^9.1.2",
    "csstree-validator": "^4.0.1",
    globby: "^14.0.2",
    jison: "^0.4.18",
    "js-base64": "^3.7.7",
    jsdom: "^26.0.0",
    "json-schema-to-typescript": "^15.0.4",
    micromatch: "^4.0.8",
    "path-browserify": "^1.0.1",
    prettier: "^3.5.2",
    remark: "^15.0.1",
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.1",
    rimraf: "^6.0.1",
    "start-server-and-test": "^2.0.10",
    "type-fest": "^4.35.0",
    typedoc: "^0.27.8",
    "typedoc-plugin-markdown": "^4.4.2",
    typescript: "~5.7.3",
    "unist-util-flatmap": "^1.0.0",
    "unist-util-visit": "^5.0.0",
    vitepress: "^1.0.2",
    "vitepress-plugin-search": "1.0.4-alpha.22"
  },
  files: [
    "dist/",
    "README.md"
  ],
  publishConfig: {
    access: "public"
  }
}, ak = /* @__PURE__ */ d((e) => {
  var n;
  const { securityLevel: t } = nt();
  let r = et("body");
  if (t === "sandbox") {
    const o = ((n = et(`#i${e}`).node()) == null ? void 0 : n.contentDocument) ?? document;
    r = et(o.body);
  }
  return r.select(`#${e}`);
}, "selectSvgElement"), Jp = "comm", td = "rule", ed = "decl", sk = "@import", ok = "@namespace", lk = "@keyframes", ck = "@layer", rd = Math.abs, so = String.fromCharCode;
function id(e) {
  return e.trim();
}
function Ni(e, t, r) {
  return e.replace(t, r);
}
function hk(e, t, r) {
  return e.indexOf(t, r);
}
function ir(e, t) {
  return e.charCodeAt(t) | 0;
}
function _r(e, t, r) {
  return e.slice(t, r);
}
function Xt(e) {
  return e.length;
}
function uk(e) {
  return e.length;
}
function Bi(e, t) {
  return t.push(e), e;
}
var Xn = 1, wr = 1, nd = 0, qt = 0, pt = 0, Lr = "";
function oo(e, t, r, i, n, a, o, s) {
  return { value: e, root: t, parent: r, type: i, props: n, children: a, line: Xn, column: wr, length: o, return: "", siblings: s };
}
function fk() {
  return pt;
}
function pk() {
  return pt = qt > 0 ? ir(Lr, --qt) : 0, wr--, pt === 10 && (wr = 1, Xn--), pt;
}
function jt() {
  return pt = qt < nd ? ir(Lr, qt++) : 0, wr++, pt === 10 && (wr = 1, Xn++), pt;
}
function Ce() {
  return ir(Lr, qt);
}
function zi() {
  return qt;
}
function Vn(e, t) {
  return _r(Lr, e, t);
}
function oi(e) {
  switch (e) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4;
    case 58:
      return 3;
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function dk(e) {
  return Xn = wr = 1, nd = Xt(Lr = e), qt = 0, [];
}
function gk(e) {
  return Lr = "", e;
}
function ha(e) {
  return id(Vn(qt - 1, Ja(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function mk(e) {
  for (; (pt = Ce()) && pt < 33; )
    jt();
  return oi(e) > 2 || oi(pt) > 3 ? "" : " ";
}
function yk(e, t) {
  for (; --t && jt() && !(pt < 48 || pt > 102 || pt > 57 && pt < 65 || pt > 70 && pt < 97); )
    ;
  return Vn(e, zi() + (t < 6 && Ce() == 32 && jt() == 32));
}
function Ja(e) {
  for (; jt(); )
    switch (pt) {
      case e:
        return qt;
      case 34:
      case 39:
        e !== 34 && e !== 39 && Ja(pt);
        break;
      case 40:
        e === 41 && Ja(e);
        break;
      case 92:
        jt();
        break;
    }
  return qt;
}
function xk(e, t) {
  for (; jt() && e + pt !== 57; )
    if (e + pt === 84 && Ce() === 47)
      break;
  return "/*" + Vn(t, qt - 1) + "*" + so(e === 47 ? e : jt());
}
function bk(e) {
  for (; !oi(Ce()); )
    jt();
  return Vn(e, qt);
}
function Ck(e) {
  return gk(qi("", null, null, null, [""], e = dk(e), 0, [0], e));
}
function qi(e, t, r, i, n, a, o, s, c) {
  for (var l = 0, h = 0, u = o, f = 0, p = 0, g = 0, m = 1, y = 1, x = 1, b = 0, _ = "", S = n, k = a, C = i, w = _; y; )
    switch (g = b, b = jt()) {
      case 40:
        if (g != 108 && ir(w, u - 1) == 58) {
          hk(w += Ni(ha(b), "&", "&\f"), "&\f", rd(l ? s[l - 1] : 0)) != -1 && (x = -1);
          break;
        }
      case 34:
      case 39:
      case 91:
        w += ha(b);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        w += mk(g);
        break;
      case 92:
        w += yk(zi() - 1, 7);
        continue;
      case 47:
        switch (Ce()) {
          case 42:
          case 47:
            Bi(_k(xk(jt(), zi()), t, r, c), c), (oi(g || 1) == 5 || oi(Ce() || 1) == 5) && Xt(w) && _r(w, -1, void 0) !== " " && (w += " ");
            break;
          default:
            w += "/";
        }
        break;
      case 123 * m:
        s[l++] = Xt(w) * x;
      case 125 * m:
      case 59:
      case 0:
        switch (b) {
          case 0:
          case 125:
            y = 0;
          case 59 + h:
            x == -1 && (w = Ni(w, /\f/g, "")), p > 0 && (Xt(w) - u || m === 0 && g === 47) && Bi(p > 32 ? kl(w + ";", i, r, u - 1, c) : kl(Ni(w, " ", "") + ";", i, r, u - 2, c), c);
            break;
          case 59:
            w += ";";
          default:
            if (Bi(C = wl(w, t, r, l, h, n, s, _, S = [], k = [], u, a), a), b === 123)
              if (h === 0)
                qi(w, t, C, C, S, a, u, s, k);
              else {
                switch (f) {
                  case 99:
                    if (ir(w, 3) === 110) break;
                  case 108:
                    if (ir(w, 2) === 97) break;
                  default:
                    h = 0;
                  case 100:
                  case 109:
                  case 115:
                }
                h ? qi(e, C, C, i && Bi(wl(e, C, C, 0, 0, n, s, _, n, S = [], u, k), k), n, k, u, s, i ? S : k) : qi(w, C, C, C, [""], k, 0, s, k);
              }
        }
        l = h = p = 0, m = x = 1, _ = w = "", u = o;
        break;
      case 58:
        u = 1 + Xt(w), p = g;
      default:
        if (m < 1) {
          if (b == 123)
            --m;
          else if (b == 125 && m++ == 0 && pk() == 125)
            continue;
        }
        switch (w += so(b), b * m) {
          case 38:
            x = h > 0 ? 1 : (w += "\f", -1);
            break;
          case 44:
            s[l++] = (Xt(w) - 1) * x, x = 1;
            break;
          case 64:
            Ce() === 45 && (w += ha(jt())), f = Ce(), h = u = Xt(_ = w += bk(zi())), b++;
            break;
          case 45:
            g === 45 && Xt(w) == 2 && (m = 0);
        }
    }
  return a;
}
function wl(e, t, r, i, n, a, o, s, c, l, h, u) {
  for (var f = n - 1, p = n === 0 ? a : [""], g = uk(p), m = 0, y = 0, x = 0; m < i; ++m)
    for (var b = 0, _ = _r(e, f + 1, f = rd(y = o[m])), S = e; b < g; ++b)
      (S = id(y > 0 ? p[b] + " " + _ : Ni(_, /&\f/g, p[b]))) && (c[x++] = S);
  return oo(e, t, r, n === 0 ? td : s, c, l, h, u);
}
function _k(e, t, r, i) {
  return oo(e, t, r, Jp, so(fk()), _r(e, 2, -2), 0, i);
}
function kl(e, t, r, i, n) {
  return oo(e, t, r, ed, _r(e, 0, i), _r(e, i + 1, -1), i, n);
}
function ts(e, t) {
  for (var r = "", i = 0; i < e.length; i++)
    r += t(e[i], i, e, t) || "";
  return r;
}
function wk(e, t, r, i) {
  switch (e.type) {
    case ck:
      if (e.children.length) break;
    case sk:
    case ok:
    case ed:
      return e.return = e.return || e.value;
    case Jp:
      return "";
    case lk:
      return e.return = e.value + "{" + ts(e.children, i) + "}";
    case td:
      if (!Xt(e.value = e.props.join(","))) return "";
  }
  return Xt(r = ts(e.children, i)) ? e.return = e.value + "{" + r + "}" : "";
}
var kk = Iu(Object.keys, Object), vk = Object.prototype, Sk = vk.hasOwnProperty;
function Tk(e) {
  if (!Nn(e))
    return kk(e);
  var t = [];
  for (var r in Object(e))
    Sk.call(e, r) && r != "constructor" && t.push(r);
  return t;
}
var es = Ue(te, "DataView"), rs = Ue(te, "Promise"), is = Ue(te, "Set"), ns = Ue(te, "WeakMap"), vl = "[object Map]", Bk = "[object Object]", Sl = "[object Promise]", Tl = "[object Set]", Bl = "[object WeakMap]", Ll = "[object DataView]", Lk = Ge(es), Mk = Ge(ai), Ak = Ge(rs), $k = Ge(is), Fk = Ge(ns), $e = vr;
(es && $e(new es(new ArrayBuffer(1))) != Ll || ai && $e(new ai()) != vl || rs && $e(rs.resolve()) != Sl || is && $e(new is()) != Tl || ns && $e(new ns()) != Bl) && ($e = function(e) {
  var t = vr(e), r = t == Bk ? e.constructor : void 0, i = r ? Ge(r) : "";
  if (i)
    switch (i) {
      case Lk:
        return Ll;
      case Mk:
        return vl;
      case Ak:
        return Sl;
      case $k:
        return Tl;
      case Fk:
        return Bl;
    }
  return t;
});
var Ek = "[object Map]", Ok = "[object Set]", Dk = Object.prototype, Rk = Dk.hasOwnProperty;
function Ml(e) {
  if (e == null)
    return !0;
  if (zn(e) && (pn(e) || typeof e == "string" || typeof e.splice == "function" || Ps(e) || Ns(e) || fn(e)))
    return !e.length;
  var t = $e(e);
  if (t == Ek || t == Ok)
    return !e.size;
  if (Nn(e))
    return !Tk(e).length;
  for (var r in e)
    if (Rk.call(e, r))
      return !1;
  return !0;
}
var ad = "c4", Ik = /* @__PURE__ */ d((e) => /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(e), "detector"), Pk = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./c4Diagram-VJAJSXHY-wAWw64r2.js");
  return { id: ad, diagram: e };
}, "loader"), Nk = {
  id: ad,
  detector: Ik,
  loader: Pk
}, zk = Nk, sd = "flowchart", qk = /* @__PURE__ */ d((e, t) => {
  var r, i;
  return ((r = t == null ? void 0 : t.flowchart) == null ? void 0 : r.defaultRenderer) === "dagre-wrapper" || ((i = t == null ? void 0 : t.flowchart) == null ? void 0 : i.defaultRenderer) === "elk" ? !1 : /^\s*graph/.test(e);
}, "detector"), Wk = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./flowDiagram-4HSFHLVR-GNifcGOu.js");
  return { id: sd, diagram: e };
}, "loader"), Hk = {
  id: sd,
  detector: qk,
  loader: Wk
}, jk = Hk, od = "flowchart-v2", Yk = /* @__PURE__ */ d((e, t) => {
  var r, i, n;
  return ((r = t == null ? void 0 : t.flowchart) == null ? void 0 : r.defaultRenderer) === "dagre-d3" ? !1 : (((i = t == null ? void 0 : t.flowchart) == null ? void 0 : i.defaultRenderer) === "elk" && (t.layout = "elk"), /^\s*graph/.test(e) && ((n = t == null ? void 0 : t.flowchart) == null ? void 0 : n.defaultRenderer) === "dagre-wrapper" ? !0 : /^\s*flowchart/.test(e));
}, "detector"), Gk = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./flowDiagram-4HSFHLVR-GNifcGOu.js");
  return { id: od, diagram: e };
}, "loader"), Uk = {
  id: od,
  detector: Yk,
  loader: Gk
}, Xk = Uk, ld = "er", Vk = /* @__PURE__ */ d((e) => /^\s*erDiagram/.test(e), "detector"), Zk = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./erDiagram-Q7BY3M3F-CmHvKBrg.js");
  return { id: ld, diagram: e };
}, "loader"), Kk = {
  id: ld,
  detector: Vk,
  loader: Zk
}, Qk = Kk, cd = "gitGraph", Jk = /* @__PURE__ */ d((e) => /^\s*gitGraph/.test(e), "detector"), tv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./gitGraphDiagram-7IBYFJ6S-B4dB7bDi.js");
  return { id: cd, diagram: e };
}, "loader"), ev = {
  id: cd,
  detector: Jk,
  loader: tv
}, rv = ev, hd = "gantt", iv = /* @__PURE__ */ d((e) => /^\s*gantt/.test(e), "detector"), nv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./ganttDiagram-APWFNJXF-Cp1RUivL.js");
  return { id: hd, diagram: e };
}, "loader"), av = {
  id: hd,
  detector: iv,
  loader: nv
}, sv = av, ud = "info", ov = /* @__PURE__ */ d((e) => /^\s*info/.test(e), "detector"), lv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./infoDiagram-PH2N3AL5-BNmaEfLy.js");
  return { id: ud, diagram: e };
}, "loader"), cv = {
  id: ud,
  detector: ov,
  loader: lv
}, fd = "pie", hv = /* @__PURE__ */ d((e) => /^\s*pie/.test(e), "detector"), uv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./pieDiagram-IB7DONF6-BzD8esLw.js");
  return { id: fd, diagram: e };
}, "loader"), fv = {
  id: fd,
  detector: hv,
  loader: uv
}, pd = "quadrantChart", pv = /* @__PURE__ */ d((e) => /^\s*quadrantChart/.test(e), "detector"), dv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./quadrantDiagram-7GDLP6J5-CyVrcEyA.js");
  return { id: pd, diagram: e };
}, "loader"), gv = {
  id: pd,
  detector: pv,
  loader: dv
}, mv = gv, dd = "xychart", yv = /* @__PURE__ */ d((e) => /^\s*xychart-beta/.test(e), "detector"), xv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./xychartDiagram-VJFVF3MP-BI2bIWYg.js");
  return { id: dd, diagram: e };
}, "loader"), bv = {
  id: dd,
  detector: yv,
  loader: xv
}, Cv = bv, gd = "requirement", _v = /* @__PURE__ */ d((e) => /^\s*requirement(Diagram)?/.test(e), "detector"), wv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./requirementDiagram-KVF5MWMF-De9UqphM.js");
  return { id: gd, diagram: e };
}, "loader"), kv = {
  id: gd,
  detector: _v,
  loader: wv
}, vv = kv, md = "sequence", Sv = /* @__PURE__ */ d((e) => /^\s*sequenceDiagram/.test(e), "detector"), Tv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./sequenceDiagram-X6HHIX6F-D2XqorOs.js");
  return { id: md, diagram: e };
}, "loader"), Bv = {
  id: md,
  detector: Sv,
  loader: Tv
}, Lv = Bv, yd = "class", Mv = /* @__PURE__ */ d((e, t) => {
  var r;
  return ((r = t == null ? void 0 : t.class) == null ? void 0 : r.defaultRenderer) === "dagre-wrapper" ? !1 : /^\s*classDiagram/.test(e);
}, "detector"), Av = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./classDiagram-GIVACNV2-D1iqqH7o.js");
  return { id: yd, diagram: e };
}, "loader"), $v = {
  id: yd,
  detector: Mv,
  loader: Av
}, Fv = $v, xd = "classDiagram", Ev = /* @__PURE__ */ d((e, t) => {
  var r;
  return /^\s*classDiagram/.test(e) && ((r = t == null ? void 0 : t.class) == null ? void 0 : r.defaultRenderer) === "dagre-wrapper" ? !0 : /^\s*classDiagram-v2/.test(e);
}, "detector"), Ov = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./classDiagram-v2-COTLJTTW-D1iqqH7o.js");
  return { id: xd, diagram: e };
}, "loader"), Dv = {
  id: xd,
  detector: Ev,
  loader: Ov
}, Rv = Dv, bd = "state", Iv = /* @__PURE__ */ d((e, t) => {
  var r;
  return ((r = t == null ? void 0 : t.state) == null ? void 0 : r.defaultRenderer) === "dagre-wrapper" ? !1 : /^\s*stateDiagram/.test(e);
}, "detector"), Pv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./stateDiagram-DGXRK772-D_-c0p7U.js");
  return { id: bd, diagram: e };
}, "loader"), Nv = {
  id: bd,
  detector: Iv,
  loader: Pv
}, zv = Nv, Cd = "stateDiagram", qv = /* @__PURE__ */ d((e, t) => {
  var r;
  return !!(/^\s*stateDiagram-v2/.test(e) || /^\s*stateDiagram/.test(e) && ((r = t == null ? void 0 : t.state) == null ? void 0 : r.defaultRenderer) === "dagre-wrapper");
}, "detector"), Wv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./stateDiagram-v2-YXO3MK2T-B__nr2z9.js");
  return { id: Cd, diagram: e };
}, "loader"), Hv = {
  id: Cd,
  detector: qv,
  loader: Wv
}, jv = Hv, _d = "journey", Yv = /* @__PURE__ */ d((e) => /^\s*journey/.test(e), "detector"), Gv = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./journeyDiagram-U35MCT3I-qGJD9a8d.js");
  return { id: _d, diagram: e };
}, "loader"), Uv = {
  id: _d,
  detector: Yv,
  loader: Gv
}, Xv = Uv, Vv = /* @__PURE__ */ d((e, t, r) => {
  E.debug(`rendering svg for syntax error
`);
  const i = ak(t), n = i.append("g");
  i.attr("viewBox", "0 0 2412 512"), Jl(i, 100, 512, !0), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"
  ), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"
  ), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"
  ), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"
  ), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"
  ), n.append("path").attr("class", "error-icon").attr(
    "d",
    "m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"
  ), n.append("text").attr("class", "error-text").attr("x", 1440).attr("y", 250).attr("font-size", "150px").style("text-anchor", "middle").text("Syntax error in text"), n.append("text").attr("class", "error-text").attr("x", 1250).attr("y", 400).attr("font-size", "100px").style("text-anchor", "middle").text(`mermaid version ${r}`);
}, "draw"), wd = { draw: Vv }, Zv = wd, Kv = {
  db: {},
  renderer: wd,
  parser: {
    parse: /* @__PURE__ */ d(() => {
    }, "parse")
  }
}, Qv = Kv, kd = "flowchart-elk", Jv = /* @__PURE__ */ d((e, t = {}) => {
  var r;
  return (
    // If diagram explicitly states flowchart-elk
    /^\s*flowchart-elk/.test(e) || // If a flowchart/graph diagram has their default renderer set to elk
    /^\s*flowchart|graph/.test(e) && ((r = t == null ? void 0 : t.flowchart) == null ? void 0 : r.defaultRenderer) === "elk" ? (t.layout = "elk", !0) : !1
  );
}, "detector"), tS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./flowDiagram-4HSFHLVR-GNifcGOu.js");
  return { id: kd, diagram: e };
}, "loader"), eS = {
  id: kd,
  detector: Jv,
  loader: tS
}, rS = eS, vd = "timeline", iS = /* @__PURE__ */ d((e) => /^\s*timeline/.test(e), "detector"), nS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./timeline-definition-BDJGKUSR-Db9vgeXt.js");
  return { id: vd, diagram: e };
}, "loader"), aS = {
  id: vd,
  detector: iS,
  loader: nS
}, sS = aS, Sd = "mindmap", oS = /* @__PURE__ */ d((e) => /^\s*mindmap/.test(e), "detector"), lS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./mindmap-definition-ALO5MXBD-Dly0Mtz6.js");
  return { id: Sd, diagram: e };
}, "loader"), cS = {
  id: Sd,
  detector: oS,
  loader: lS
}, hS = cS, Td = "kanban", uS = /* @__PURE__ */ d((e) => /^\s*kanban/.test(e), "detector"), fS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./kanban-definition-NDS4AKOZ-CqE2n50D.js");
  return { id: Td, diagram: e };
}, "loader"), pS = {
  id: Td,
  detector: uS,
  loader: fS
}, dS = pS, Bd = "sankey", gS = /* @__PURE__ */ d((e) => /^\s*sankey-beta/.test(e), "detector"), mS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./sankeyDiagram-QLVOVGJD-BHK6C9vu.js");
  return { id: Bd, diagram: e };
}, "loader"), yS = {
  id: Bd,
  detector: gS,
  loader: mS
}, xS = yS, Ld = "packet", bS = /* @__PURE__ */ d((e) => /^\s*packet-beta/.test(e), "detector"), CS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./diagram-VNBRO52H-Bo9fQzwi.js");
  return { id: Ld, diagram: e };
}, "loader"), _S = {
  id: Ld,
  detector: bS,
  loader: CS
}, Md = "radar", wS = /* @__PURE__ */ d((e) => /^\s*radar-beta/.test(e), "detector"), kS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./diagram-SSKATNLV-BtaJNDgN.js");
  return { id: Md, diagram: e };
}, "loader"), vS = {
  id: Md,
  detector: wS,
  loader: kS
}, Ad = "block", SS = /* @__PURE__ */ d((e) => /^\s*block-beta/.test(e), "detector"), TS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./blockDiagram-JOT3LUYC-C46kg98w.js");
  return { id: Ad, diagram: e };
}, "loader"), BS = {
  id: Ad,
  detector: SS,
  loader: TS
}, LS = BS, $d = "architecture", MS = /* @__PURE__ */ d((e) => /^\s*architecture/.test(e), "detector"), AS = /* @__PURE__ */ d(async () => {
  const { diagram: e } = await import("./architectureDiagram-IEHRJDOE-CsDMVvxI.js");
  return { id: $d, diagram: e };
}, "loader"), $S = {
  id: $d,
  detector: MS,
  loader: AS
}, FS = $S, Al = !1, Zn = /* @__PURE__ */ d(() => {
  Al || (Al = !0, Yi("error", Qv, (e) => e.toLowerCase().trim() === "error"), Yi(
    "---",
    // --- diagram type may appear if YAML front-matter is not parsed correctly
    {
      db: {
        clear: /* @__PURE__ */ d(() => {
        }, "clear")
      },
      styles: {},
      // should never be used
      renderer: {
        draw: /* @__PURE__ */ d(() => {
        }, "draw")
      },
      parser: {
        parse: /* @__PURE__ */ d(() => {
          throw new Error(
            "Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks"
          );
        }, "parse")
      },
      init: /* @__PURE__ */ d(() => null, "init")
      // no op
    },
    (e) => e.toLowerCase().trimStart().startsWith("---")
  ), zl(
    zk,
    dS,
    Rv,
    Fv,
    Qk,
    sv,
    cv,
    fv,
    vv,
    Lv,
    rS,
    Xk,
    jk,
    hS,
    sS,
    rv,
    jv,
    zv,
    Xv,
    mv,
    xS,
    _S,
    Cv,
    LS,
    FS,
    vS
  ));
}, "addDiagrams"), ES = /* @__PURE__ */ d(async () => {
  E.debug("Loading registered diagrams");
  const t = (await Promise.allSettled(
    Object.entries(pr).map(async ([r, { detector: i, loader: n }]) => {
      if (n)
        try {
          ma(r);
        } catch {
          try {
            const { diagram: a, id: o } = await n();
            Yi(o, a, i);
          } catch (a) {
            throw E.error(`Failed to load external diagram with key ${r}. Removing from detectors.`), delete pr[r], a;
          }
        }
    })
  )).filter((r) => r.status === "rejected");
  if (t.length > 0) {
    E.error(`Failed to load ${t.length} external diagrams`);
    for (const r of t)
      E.error(r);
    throw new Error(`Failed to load ${t.length} external diagrams`);
  }
}, "loadRegisteredDiagrams"), OS = "graphics-document document";
function Fd(e, t) {
  e.attr("role", OS), t !== "" && e.attr("aria-roledescription", t);
}
d(Fd, "setA11yDiagramInfo");
function Ed(e, t, r, i) {
  if (e.insert !== void 0) {
    if (r) {
      const n = `chart-desc-${i}`;
      e.attr("aria-describedby", n), e.insert("desc", ":first-child").attr("id", n).text(r);
    }
    if (t) {
      const n = `chart-title-${i}`;
      e.attr("aria-labelledby", n), e.insert("title", ":first-child").attr("id", n).text(t);
    }
  }
}
d(Ed, "addSVGa11yTitleDescription");
var Pe, as = (Pe = class {
  constructor(t, r, i, n, a) {
    this.type = t, this.text = r, this.db = i, this.parser = n, this.renderer = a;
  }
  static async fromText(t, r = {}) {
    var l, h;
    const i = Et(), n = ls(t, i);
    t = e_(t) + `
`;
    try {
      ma(n);
    } catch {
      const u = sg(n);
      if (!u)
        throw new Nl(`Diagram ${n} not found.`);
      const { id: f, diagram: p } = await u();
      Yi(f, p);
    }
    const { db: a, parser: o, renderer: s, init: c } = ma(n);
    return o.parser && (o.parser.yy = a), (l = a.clear) == null || l.call(a), c == null || c(i), r.title && ((h = a.setDiagramTitle) == null || h.call(a, r.title)), await o.parse(t), new Pe(n, t, a, o, s);
  }
  async render(t, r) {
    await this.renderer.draw(this.text, t, r, this);
  }
  getParser() {
    return this.parser;
  }
  getType() {
    return this.type;
  }
}, d(Pe, "Diagram"), Pe), $l = [], DS = /* @__PURE__ */ d(() => {
  $l.forEach((e) => {
    e();
  }), $l = [];
}, "attachFunctions"), RS = /* @__PURE__ */ d((e) => e.replace(/^\s*%%(?!{)[^\n]+\n?/gm, "").trimStart(), "cleanupComments");
function Od(e) {
  const t = e.match(Pl);
  if (!t)
    return {
      text: e,
      metadata: {}
    };
  let r = am(t[1], {
    // To support config, we need JSON schema.
    // https://www.yaml.org/spec/1.2/spec.html#id2803231
    schema: nm
  }) ?? {};
  r = typeof r == "object" && !Array.isArray(r) ? r : {};
  const i = {};
  return r.displayMode && (i.displayMode = r.displayMode.toString()), r.title && (i.title = r.title.toString()), r.config && (i.config = r.config), {
    text: e.slice(t[0].length),
    metadata: i
  };
}
d(Od, "extractFrontMatter");
var IS = /* @__PURE__ */ d((e) => e.replace(/\r\n?/g, `
`).replace(
  /<(\w+)([^>]*)>/g,
  (t, r, i) => "<" + r + i.replace(/="([^"]*)"/g, "='$1'") + ">"
), "cleanupText"), PS = /* @__PURE__ */ d((e) => {
  const { text: t, metadata: r } = Od(e), { displayMode: i, title: n, config: a = {} } = r;
  return i && (a.gantt || (a.gantt = {}), a.gantt.displayMode = i), { title: n, config: a, text: t };
}, "processFrontmatter"), NS = /* @__PURE__ */ d((e) => {
  const t = Vt.detectInit(e) ?? {}, r = Vt.detectDirective(e, "wrap");
  return Array.isArray(r) ? t.wrap = r.some(({ type: i }) => i === "wrap") : (r == null ? void 0 : r.type) === "wrap" && (t.wrap = !0), {
    text: WC(e),
    directive: t
  };
}, "processDirectives");
function lo(e) {
  const t = IS(e), r = PS(t), i = NS(r.text), n = Ys(r.config, i.directive);
  return e = RS(i.text), {
    code: e,
    title: r.title,
    config: n
  };
}
d(lo, "preprocessDiagram");
function Dd(e) {
  const t = new TextEncoder().encode(e), r = Array.from(t, (i) => String.fromCodePoint(i)).join("");
  return btoa(r);
}
d(Dd, "toBase64");
var zS = 5e4, qS = "graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa", WS = "sandbox", HS = "loose", jS = "http://www.w3.org/2000/svg", YS = "http://www.w3.org/1999/xlink", GS = "http://www.w3.org/1999/xhtml", US = "100%", XS = "100%", VS = "border:0;margin:0;", ZS = "margin:0", KS = "allow-top-navigation-by-user-activation allow-popups", QS = 'The "iframe" tag is not supported by your browser.', JS = ["foreignobject"], tT = ["dominant-baseline"];
function co(e) {
  const t = lo(e);
  return Hi(), wg(t.config ?? {}), t;
}
d(co, "processAndSetConfigs");
async function Rd(e, t) {
  Zn();
  try {
    const { code: r, config: i } = co(e);
    return { diagramType: (await Pd(r)).type, config: i };
  } catch (r) {
    if (t != null && t.suppressErrors)
      return !1;
    throw r;
  }
}
d(Rd, "parse");
var Fl = /* @__PURE__ */ d((e, t, r = []) => `
.${e} ${t} { ${r.join(" !important; ")} !important; }`, "cssImportantStyles"), eT = /* @__PURE__ */ d((e, t = /* @__PURE__ */ new Map()) => {
  var i;
  let r = "";
  if (e.themeCSS !== void 0 && (r += `
${e.themeCSS}`), e.fontFamily !== void 0 && (r += `
:root { --mermaid-font-family: ${e.fontFamily}}`), e.altFontFamily !== void 0 && (r += `
:root { --mermaid-alt-font-family: ${e.altFontFamily}}`), t instanceof Map) {
    const s = e.htmlLabels ?? ((i = e.flowchart) == null ? void 0 : i.htmlLabels) ? ["> *", "span"] : ["rect", "polygon", "ellipse", "circle", "path"];
    t.forEach((c) => {
      Ml(c.styles) || s.forEach((l) => {
        r += Fl(c.id, l, c.styles);
      }), Ml(c.textStyles) || (r += Fl(
        c.id,
        "tspan",
        ((c == null ? void 0 : c.textStyles) || []).map((l) => l.replace("color", "fill"))
      ));
    });
  }
  return r;
}, "createCssStyles"), rT = /* @__PURE__ */ d((e, t, r, i) => {
  const n = eT(e, r), a = qg(t, n, e.themeVariables);
  return ts(Ck(`${i}{${a}}`), wk);
}, "createUserStyles"), iT = /* @__PURE__ */ d((e = "", t, r) => {
  let i = e;
  return !r && !t && (i = i.replace(
    /marker-end="url\([\d+./:=?A-Za-z-]*?#/g,
    'marker-end="url(#'
  )), i = Xe(i), i = i.replace(/<br>/g, "<br/>"), i;
}, "cleanUpSvgCode"), nT = /* @__PURE__ */ d((e = "", t) => {
  var n, a;
  const r = (a = (n = t == null ? void 0 : t.viewBox) == null ? void 0 : n.baseVal) != null && a.height ? t.viewBox.baseVal.height + "px" : XS, i = Dd(`<body style="${ZS}">${e}</body>`);
  return `<iframe style="width:${US};height:${r};${VS}" src="data:text/html;charset=UTF-8;base64,${i}" sandbox="${KS}">
  ${QS}
</iframe>`;
}, "putIntoIFrame"), El = /* @__PURE__ */ d((e, t, r, i, n) => {
  const a = e.append("div");
  a.attr("id", r), i && a.attr("style", i);
  const o = a.append("svg").attr("id", t).attr("width", "100%").attr("xmlns", jS);
  return n && o.attr("xmlns:xlink", n), o.append("g"), e;
}, "appendDivSvgG");
function ss(e, t) {
  return e.append("iframe").attr("id", t).attr("style", "width: 100%; height: 100%;").attr("sandbox", "");
}
d(ss, "sandboxedIframe");
var aT = /* @__PURE__ */ d((e, t, r, i) => {
  var n, a, o;
  (n = e.getElementById(t)) == null || n.remove(), (a = e.getElementById(r)) == null || a.remove(), (o = e.getElementById(i)) == null || o.remove();
}, "removeExistingElements"), sT = /* @__PURE__ */ d(async function(e, t, r) {
  var P, D, A, L, T, $;
  Zn();
  const i = co(t);
  t = i.code;
  const n = Et();
  E.debug(n), t.length > ((n == null ? void 0 : n.maxTextSize) ?? zS) && (t = qS);
  const a = "#" + e, o = "i" + e, s = "#" + o, c = "d" + e, l = "#" + c, h = /* @__PURE__ */ d(() => {
    const N = et(f ? s : l).node();
    N && "remove" in N && N.remove();
  }, "removeTempElements");
  let u = et("body");
  const f = n.securityLevel === WS, p = n.securityLevel === HS, g = n.fontFamily;
  if (r !== void 0) {
    if (r && (r.innerHTML = ""), f) {
      const B = ss(et(r), o);
      u = et(B.nodes()[0].contentDocument.body), u.node().style.margin = 0;
    } else
      u = et(r);
    El(u, e, c, `font-family: ${g}`, YS);
  } else {
    if (aT(document, e, c, o), f) {
      const B = ss(et("body"), o);
      u = et(B.nodes()[0].contentDocument.body), u.node().style.margin = 0;
    } else
      u = et("body");
    El(u, e, c);
  }
  let m, y;
  try {
    m = await as.fromText(t, { title: i.title });
  } catch (B) {
    if (n.suppressErrorRendering)
      throw h(), B;
    m = await as.fromText("error"), y = B;
  }
  const x = u.select(l).node(), b = m.type, _ = x.firstChild, S = _.firstChild, k = (D = (P = m.renderer).getClasses) == null ? void 0 : D.call(P, t, m), C = rT(n, b, k, a), w = document.createElement("style");
  w.innerHTML = C, _.insertBefore(w, S);
  try {
    await m.renderer.draw(t, e, _l.version, m);
  } catch (B) {
    throw n.suppressErrorRendering ? h() : Zv.draw(t, e, _l.version), B;
  }
  const O = u.select(`${l} svg`), I = (L = (A = m.db).getAccTitle) == null ? void 0 : L.call(A), F = ($ = (T = m.db).getAccDescription) == null ? void 0 : $.call(T);
  Nd(b, O, I, F), u.select(`[id="${e}"]`).selectAll("foreignobject > *").attr("xmlns", GS);
  let M = u.select(l).node().innerHTML;
  if (E.debug("config.arrowMarkerAbsolute", n.arrowMarkerAbsolute), M = iT(M, f, gt(n.arrowMarkerAbsolute)), f) {
    const B = u.select(l + " svg").node();
    M = nT(M, B);
  } else p || (M = fr.sanitize(M, {
    ADD_TAGS: JS,
    ADD_ATTR: tT,
    HTML_INTEGRATION_POINTS: { foreignobject: !0 }
  }));
  if (DS(), y)
    throw y;
  return h(), {
    diagramType: b,
    svg: M,
    bindFunctions: m.db.bindFunctions
  };
}, "render");
function Id(e = {}) {
  var i;
  const t = Ct({}, e);
  t != null && t.fontFamily && !((i = t.themeVariables) != null && i.fontFamily) && (t.themeVariables || (t.themeVariables = {}), t.themeVariables.fontFamily = t.fontFamily), Cg(t), t != null && t.theme && t.theme in le ? t.themeVariables = le[t.theme].getThemeVariables(
    t.themeVariables
  ) : t && (t.themeVariables = le.default.getThemeVariables(t.themeVariables));
  const r = typeof t == "object" ? bg(t) : Gl();
  os(r.logLevel), Zn();
}
d(Id, "initialize");
var Pd = /* @__PURE__ */ d((e, t = {}) => {
  const { code: r } = lo(e);
  return as.fromText(r, t);
}, "getDiagramFromText");
function Nd(e, t, r, i) {
  Fd(t, e), Ed(t, r, i, t.attr("id"));
}
d(Nd, "addA11yInfo");
var je = Object.freeze({
  render: sT,
  parse: Rd,
  getDiagramFromText: Pd,
  initialize: Id,
  getConfig: Et,
  setConfig: Ul,
  getSiteConfig: Gl,
  updateSiteConfig: _g,
  reset: /* @__PURE__ */ d(() => {
    Hi();
  }, "reset"),
  globalReset: /* @__PURE__ */ d(() => {
    Hi(dr);
  }, "globalReset"),
  defaultConfig: dr
});
os(Et().logLevel);
Hi(Et());
var oT = /* @__PURE__ */ d((e, t, r) => {
  E.warn(e), js(e) ? (r && r(e.str, e.hash), t.push({ ...e, message: e.str, error: e })) : (r && r(e), e instanceof Error && t.push({
    str: e.message,
    message: e.message,
    hash: e.name,
    error: e
  }));
}, "handleError"), zd = /* @__PURE__ */ d(async function(e = {
  querySelector: ".mermaid"
}) {
  try {
    await lT(e);
  } catch (t) {
    if (js(t) && E.error(t.str), Rt.parseError && Rt.parseError(t), !e.suppressErrors)
      throw E.error("Use the suppressErrors option to suppress these errors"), t;
  }
}, "run"), lT = /* @__PURE__ */ d(async function({ postRenderCallback: e, querySelector: t, nodes: r } = {
  querySelector: ".mermaid"
}) {
  const i = je.getConfig();
  E.debug(`${e ? "" : "No "}Callback function found`);
  let n;
  if (r)
    n = r;
  else if (t)
    n = document.querySelectorAll(t);
  else
    throw new Error("Nodes and querySelector are both undefined");
  E.debug(`Found ${n.length} diagrams`), (i == null ? void 0 : i.startOnLoad) !== void 0 && (E.debug("Start On Load: " + (i == null ? void 0 : i.startOnLoad)), je.updateSiteConfig({ startOnLoad: i == null ? void 0 : i.startOnLoad }));
  const a = new Vt.InitIDGenerator(i.deterministicIds, i.deterministicIDSeed);
  let o;
  const s = [];
  for (const c of Array.from(n)) {
    if (E.info("Rendering diagram: " + c.id), c.getAttribute("data-processed"))
      continue;
    c.setAttribute("data-processed", "true");
    const l = `mermaid-${a.next()}`;
    o = c.innerHTML, o = df(Vt.entityDecode(o)).trim().replace(/<br\s*\/?>/gi, "<br/>");
    const h = Vt.detectInit(o);
    h && E.debug("Detected early reinit: ", h);
    try {
      const { svg: u, bindFunctions: f } = await jd(l, o, c);
      c.innerHTML = u, e && await e(l), f && f(c);
    } catch (u) {
      oT(u, s, Rt.parseError);
    }
  }
  if (s.length > 0)
    throw s[0];
}, "runThrowsErrors"), qd = /* @__PURE__ */ d(function(e) {
  je.initialize(e);
}, "initialize"), cT = /* @__PURE__ */ d(async function(e, t, r) {
  E.warn("mermaid.init is deprecated. Please use run instead."), e && qd(e);
  const i = { postRenderCallback: r, querySelector: ".mermaid" };
  typeof t == "string" ? i.querySelector = t : t && (t instanceof HTMLElement ? i.nodes = [t] : i.nodes = t), await zd(i);
}, "init"), hT = /* @__PURE__ */ d(async (e, {
  lazyLoad: t = !0
} = {}) => {
  Zn(), zl(...e), t === !1 && await ES();
}, "registerExternalDiagrams"), Wd = /* @__PURE__ */ d(function() {
  if (Rt.startOnLoad) {
    const { startOnLoad: e } = je.getConfig();
    e && Rt.run().catch((t) => E.error("Mermaid failed to initialize", t));
  }
}, "contentLoaded");
typeof document < "u" && window.addEventListener("load", Wd, !1);
var uT = /* @__PURE__ */ d(function(e) {
  Rt.parseError = e;
}, "setParseErrorHandler"), kn = [], ua = !1, Hd = /* @__PURE__ */ d(async () => {
  if (!ua) {
    for (ua = !0; kn.length > 0; ) {
      const e = kn.shift();
      if (e)
        try {
          await e();
        } catch (t) {
          E.error("Error executing queue", t);
        }
    }
    ua = !1;
  }
}, "executeQueue"), fT = /* @__PURE__ */ d(async (e, t) => new Promise((r, i) => {
  const n = /* @__PURE__ */ d(() => new Promise((a, o) => {
    je.parse(e, t).then(
      (s) => {
        a(s), r(s);
      },
      (s) => {
        var c;
        E.error("Error parsing", s), (c = Rt.parseError) == null || c.call(Rt, s), o(s), i(s);
      }
    );
  }), "performCall");
  kn.push(n), Hd().catch(i);
}), "parse"), jd = /* @__PURE__ */ d((e, t, r) => new Promise((i, n) => {
  const a = /* @__PURE__ */ d(() => new Promise((o, s) => {
    je.render(e, t, r).then(
      (c) => {
        o(c), i(c);
      },
      (c) => {
        var l;
        E.error("Error parsing", c), (l = Rt.parseError) == null || l.call(Rt, c), s(c), n(c);
      }
    );
  }), "performCall");
  kn.push(a), Hd().catch(n);
}), "render"), Rt = {
  startOnLoad: !0,
  mermaidAPI: je,
  parse: fT,
  render: jd,
  init: cT,
  run: zd,
  registerExternalDiagrams: hT,
  registerLayoutLoaders: Qp,
  initialize: qd,
  parseError: void 0,
  contentLoaded: Wd,
  setParseErrorHandler: uT,
  detectType: ls,
  registerIconPacks: Lm
}, pT = Rt;
/*! Check if previously processed */
/*!
 * Wait for document loaded before starting the execution
 */
const PT = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: pT
}, Symbol.toStringTag, { value: "Module" }));
export {
  Kb as $,
  Yr as A,
  ng as B,
  Zg as C,
  Ys as D,
  Et as E,
  jl as F,
  UC as G,
  ak as H,
  _l as I,
  nm as J,
  fg as K,
  mr as L,
  mT as M,
  qn as N,
  cs as O,
  fo as P,
  e1 as Q,
  Di as R,
  GC as S,
  ci as T,
  Pg as U,
  li as V,
  z as W,
  X,
  tc as Y,
  PC as Z,
  d as _,
  jg as a,
  be as a$,
  $s as a0,
  wT as a1,
  ST as a2,
  Ze as a3,
  No as a4,
  Po as a5,
  BT as a6,
  TT as a7,
  vT as a8,
  CT as a9,
  T2 as aA,
  BC as aB,
  Rs as aC,
  Ml as aD,
  P_ as aE,
  Qb as aF,
  An as aG,
  Lm as aH,
  Bm as aI,
  Ye as aJ,
  DC as aK,
  Yu as aL,
  Rn as aM,
  zn as aN,
  pn as aO,
  Uu as aP,
  ju as aQ,
  uC as aR,
  Ft as aS,
  vx as aT,
  Ts as aU,
  Qh as aV,
  fi as aW,
  eu as aX,
  bT as aY,
  Zd as aZ,
  Bs as a_,
  _T as aa,
  MT as ab,
  kT as ac,
  LT as ad,
  uw as ae,
  Zp as af,
  OT as ag,
  sm as ah,
  gt as ai,
  Be as aj,
  ws as ak,
  vf as al,
  Xe as am,
  Ju as an,
  Q as ao,
  Kt as ap,
  rk as aq,
  ET as ar,
  DT as as,
  $T as at,
  j as au,
  FT as av,
  Pw as aw,
  Ow as ax,
  Ew as ay,
  OC as az,
  Hg as b,
  Fo as b0,
  $x as b1,
  ri as b2,
  EC as b3,
  TC as b4,
  p2 as b5,
  Is as b6,
  oC as b7,
  IC as b8,
  di as b9,
  vr as ba,
  hn as bb,
  xC as bc,
  Tk as bd,
  pi as be,
  fn as bf,
  fC as bg,
  Pu as bh,
  m2 as bi,
  y2 as bj,
  $e as bk,
  tl as bl,
  x2 as bm,
  Ps as bn,
  g2 as bo,
  _2 as bp,
  Sr as bq,
  Te as br,
  Vo as bs,
  Ns as bt,
  zu as bu,
  is as bv,
  RC as bw,
  Nn as bx,
  PT as by,
  nt as c,
  et as d,
  Jl as e,
  Ct as f,
  Gg as g,
  ue as h,
  Ne as i,
  Ph as j,
  kr as k,
  E as l,
  ef as m,
  yT as n,
  IT as o,
  Ug as p,
  Xg as q,
  RT as r,
  Yg as s,
  am as t,
  Vt as u,
  Aw as v,
  ZC as w,
  AT as x,
  Wg as y,
  xT as z
};
