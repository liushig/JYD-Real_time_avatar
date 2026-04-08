var v;
(function(t) {
  t.LOAD = "LOAD", t.EXEC = "EXEC", t.FFPROBE = "FFPROBE", t.WRITE_FILE = "WRITE_FILE", t.READ_FILE = "READ_FILE", t.DELETE_FILE = "DELETE_FILE", t.RENAME = "RENAME", t.CREATE_DIR = "CREATE_DIR", t.LIST_DIR = "LIST_DIR", t.DELETE_DIR = "DELETE_DIR", t.ERROR = "ERROR", t.DOWNLOAD = "DOWNLOAD", t.PROGRESS = "PROGRESS", t.LOG = "LOG", t.MOUNT = "MOUNT", t.UNMOUNT = "UNMOUNT";
})(v || (v = {}));
var N;
(function(t) {
  t.MEMFS = "MEMFS", t.NODEFS = "NODEFS", t.NODERAWFS = "NODERAWFS", t.IDBFS = "IDBFS", t.WORKERFS = "WORKERFS", t.PROXYFS = "PROXYFS";
})(N || (N = {}));
const {
  SvelteComponent: q,
  append_hydration: K,
  attr: h,
  binding_callbacks: V,
  children: S,
  claim_element: A,
  claim_text: Z,
  detach: a,
  element: k,
  empty: D,
  init: Y,
  insert_hydration: L,
  is_function: W,
  listen: I,
  noop: w,
  run_all: j,
  safe_not_equal: z,
  set_data: M,
  src_url_equal: U,
  text: T,
  toggle_class: E
} = window.__gradio__svelte__internal;
function C(t) {
  let l;
  function e(u, i) {
    return H;
  }
  let o = e()(t);
  return {
    c() {
      o.c(), l = D();
    },
    l(u) {
      o.l(u), l = D();
    },
    m(u, i) {
      o.m(u, i), L(u, l, i);
    },
    p(u, i) {
      o.p(u, i);
    },
    d(u) {
      u && a(l), o.d(u);
    }
  };
}
function H(t) {
  let l, e, n, o, u;
  return {
    c() {
      l = k("div"), e = k("video"), this.h();
    },
    l(i) {
      l = A(i, "DIV", { class: !0 });
      var c = S(l);
      e = A(c, "VIDEO", { src: !0 }), S(e).forEach(a), c.forEach(a), this.h();
    },
    h() {
      var i;
      U(e.src, n = /*value*/
      (i = t[2]) == null ? void 0 : i.video.url) || h(e, "src", n), h(l, "class", "container svelte-1uoo7dd"), E(
        l,
        "table",
        /*type*/
        t[0] === "table"
      ), E(
        l,
        "gallery",
        /*type*/
        t[0] === "gallery"
      ), E(
        l,
        "selected",
        /*selected*/
        t[1]
      );
    },
    m(i, c) {
      L(i, l, c), K(l, e), t[6](e), o || (u = [
        I(
          e,
          "loadeddata",
          /*init*/
          t[4]
        ),
        I(e, "mouseover", function() {
          W(
            /*video*/
            t[3].play.bind(
              /*video*/
              t[3]
            )
          ) && t[3].play.bind(
            /*video*/
            t[3]
          ).apply(this, arguments);
        }),
        I(e, "mouseout", function() {
          W(
            /*video*/
            t[3].pause.bind(
              /*video*/
              t[3]
            )
          ) && t[3].pause.bind(
            /*video*/
            t[3]
          ).apply(this, arguments);
        })
      ], o = !0);
    },
    p(i, c) {
      var _;
      t = i, c & /*value*/
      4 && !U(e.src, n = /*value*/
      (_ = t[2]) == null ? void 0 : _.video.url) && h(e, "src", n), c & /*type*/
      1 && E(
        l,
        "table",
        /*type*/
        t[0] === "table"
      ), c & /*type*/
      1 && E(
        l,
        "gallery",
        /*type*/
        t[0] === "gallery"
      ), c & /*selected*/
      2 && E(
        l,
        "selected",
        /*selected*/
        t[1]
      );
    },
    d(i) {
      i && a(l), t[6](null), o = !1, j(u);
    }
  };
}
function J(t) {
  let l, e = (
    /*value*/
    t[2] && C(t)
  );
  return {
    c() {
      e && e.c(), l = D();
    },
    l(n) {
      e && e.l(n), l = D();
    },
    m(n, o) {
      e && e.m(n, o), L(n, l, o);
    },
    p(n, [o]) {
      /*value*/
      n[2] ? e ? e.p(n, o) : (e = C(n), e.c(), e.m(l.parentNode, l)) : e && (e.d(1), e = null);
    },
    i: w,
    o: w,
    d(n) {
      n && a(l), e && e.d(n);
    }
  };
}
function Q(t, l, e) {
  var n = this && this.__awaiter || function(f, B, R, s) {
    function G(d) {
      return d instanceof R ? d : new R(function(O) {
        O(d);
      });
    }
    return new (R || (R = Promise))(function(d, O) {
      function P(r) {
        try {
          m(s.next(r));
        } catch (b) {
          O(b);
        }
      }
      function X(r) {
        try {
          m(s.throw(r));
        } catch (b) {
          O(b);
        }
      }
      function m(r) {
        r.done ? d(r.value) : G(r.value).then(P, X);
      }
      m((s = s.apply(f, B || [])).next());
    });
  };
  let { type: o } = l, { selected: u = !1 } = l, { value: i } = l, { loop: c } = l, _;
  function p() {
    return n(this, void 0, void 0, function* () {
      e(3, _.muted = !0, _), e(3, _.playsInline = !0, _), e(3, _.controls = !1, _), _.setAttribute("muted", ""), yield _.play(), _.pause();
    });
  }
  function y(f) {
    V[f ? "unshift" : "push"](() => {
      _ = f, e(3, _);
    });
  }
  return t.$$set = (f) => {
    "type" in f && e(0, o = f.type), "selected" in f && e(1, u = f.selected), "value" in f && e(2, i = f.value), "loop" in f && e(5, c = f.loop);
  }, [o, u, i, _, p, c, y];
}
class g extends q {
  constructor(l) {
    super(), Y(this, l, Q, J, z, { type: 0, selected: 1, value: 2, loop: 5 });
  }
}
export {
  g as default
};
