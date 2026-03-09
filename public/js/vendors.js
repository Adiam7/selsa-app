var fu = Object.defineProperty;
var au = (e, t, n) => t in e ? fu(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: n
}) : e[t] = n;
var Et = (e, t, n) => (au(e, typeof t != "symbol" ? t + "" : t, n), n);
function Br(e, t) {
    const n = new Set(e.split(","));
    return t ? r => n.has(r.toLowerCase()) : r => n.has(r)
}
const Q = {},
    qt = [],
    we = () => {},
    du = () => !1,
    Dn = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
    Js = e => e.startsWith("onUpdate:"),
    oe = Object.assign,
    zs = (e, t) => {
        const n = e.indexOf(t);
        n > -1 && e.splice(n, 1)
    },
    hu = Object.prototype.hasOwnProperty,
    z = (e, t) => hu.call(e, t),
    $ = Array.isArray,
    Gt = e => an(e) === "[object Map]",
    Bt = e => an(e) === "[object Set]",
    Vo = e => an(e) === "[object Date]",
    pu = e => an(e) === "[object RegExp]",
    K = e => typeof e == "function",
    ie = e => typeof e == "string",
    at = e => typeof e == "symbol",
    te = e => e !== null && typeof e == "object",
    Qs = e => (te(e) || K(e)) && K(e.then) && K(e.catch),
    ji = Object.prototype.toString,
    an = e => ji.call(e),
    gu = e => an(e).slice(8, -1),
    Wi = e => an(e) === "[object Object]",
    Zs = e => ie(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e,
    Jt = Br(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),
    Hr = e => {
        const t = Object.create(null);
        return n => t[n] || (t[n] = e(n))
    },
    mu = /-(\w)/g,
    _e = Hr(e => e.replace(mu, (t, n) => n ? n.toUpperCase() : "")),
    yu = /\B([A-Z])/g,
    Ae = Hr(e => e.replace(yu, "-$1").toLowerCase()),
    $n = Hr(e => e.charAt(0).toUpperCase() + e.slice(1)),
    vn = Hr(e => e ? `on${$n(e)}` : ""),
    ke = (e, t) => !Object.is(e, t),
    zt = (e, t) => {
        for (let n = 0; n < e.length; n++)
            e[n](t)
    },
    wr = (e, t, n) => {
        Object.defineProperty(e, t, {
            configurable: !0,
            enumerable: !1,
            value: n
        })
    },
    Rn = e => {
        const t = parseFloat(e);
        return isNaN(t) ? e : t
    },
    Er = e => {
        const t = ie(e) ? Number(e) : NaN;
        return isNaN(t) ? e : t
    };
let Bo;
const Ui = () => Bo || (Bo = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}),
    bu = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error",
    _u = Br(bu);
function jn(e) {
    if ($(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++) {
            const r = e[n],
                s = ie(r) ? Cu(r) : jn(r);
            if (s)
                for (const o in s)
                    t[o] = s[o]
        }
        return t
    } else if (ie(e) || te(e))
        return e
}
const vu = /;(?![^(]*\))/g,
    wu = /:([^]+)/,
    Eu = /\/\*[^]*?\*\//g;
function Cu(e) {
    const t = {};
    return e.replace(Eu, "").split(vu).forEach(n => {
        if (n) {
            const r = n.split(wu);
            r.length > 1 && (t[r[0].trim()] = r[1].trim())
        }
    }), t
}
function Wn(e) {
    let t = "";
    if (ie(e))
        t = e;
    else if ($(e))
        for (let n = 0; n < e.length; n++) {
            const r = Wn(e[n]);
            r && (t += r + " ")
        }
    else if (te(e))
        for (const n in e)
            e[n] && (t += n + " ");
    return t.trim()
}
function Su(e) {
    if (!e)
        return null;
    let {class: t, style: n} = e;
    return t && !ie(t) && (e.class = Wn(t)), n && (e.style = jn(n)), e
}
const Tu = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
    xu = Br(Tu);
function Ki(e) {
    return !!e || e === ""
}
function Au(e, t) {
    if (e.length !== t.length)
        return !1;
    let n = !0;
    for (let r = 0; n && r < e.length; r++)
        n = dt(e[r], t[r]);
    return n
}
function dt(e, t) {
    if (e === t)
        return !0;
    let n = Vo(e),
        r = Vo(t);
    if (n || r)
        return n && r ? e.getTime() === t.getTime() : !1;
    if (n = at(e), r = at(t), n || r)
        return e === t;
    if (n = $(e), r = $(t), n || r)
        return n && r ? Au(e, t) : !1;
    if (n = te(e), r = te(t), n || r) {
        if (!n || !r)
            return !1;
        const s = Object.keys(e).length,
            o = Object.keys(t).length;
        if (s !== o)
            return !1;
        for (const i in e) {
            const l = e.hasOwnProperty(i),
                c = t.hasOwnProperty(i);
            if (l && !c || !l && c || !dt(e[i], t[i]))
                return !1
        }
    }
    return String(e) === String(t)
}
function Dr(e, t) {
    return e.findIndex(n => dt(n, t))
}
const Ou = e => ie(e) ? e : e == null ? "" : $(e) || te(e) && (e.toString === ji || !K(e.toString)) ? JSON.stringify(e, Xi, 2) : String(e),
    Xi = (e, t) => t && t.__v_isRef ? Xi(e, t.value) : Gt(t) ? {
        [`Map(${t.size})`]: [...t.entries()].reduce((n, [r, s], o) => (n[ds(r, o) + " =>"] = s, n), {})
    } : Bt(t) ? {
        [`Set(${t.size})`]: [...t.values()].map(n => ds(n))
    } : at(t) ? ds(t) : te(t) && !$(t) && !Wi(t) ? String(t) : t,
    ds = (e, t="") => {
        var n;
        return at(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
    };
let Te;
class eo {
    constructor(t=!1)
    {
        this.detached = t,
        this._active = !0,
        this.effects = [],
        this.cleanups = [],
        this.parent = Te,
        !t && Te && (this.index = (Te.scopes || (Te.scopes = [])).push(this) - 1)
    }
    get active()
    {
        return this._active
    }
    run(t)
    {
        if (this._active) {
            const n = Te;
            try {
                return Te = this, t()
            } finally {
                Te = n
            }
        }
    }
    on()
    {
        Te = this
    }
    off()
    {
        Te = this.parent
    }
    stop(t)
    {
        if (this._active) {
            let n,
                r;
            for (n = 0, r = this.effects.length; n < r; n++)
                this.effects[n].stop();
            for (n = 0, r = this.cleanups.length; n < r; n++)
                this.cleanups[n]();
            if (this.scopes)
                for (n = 0, r = this.scopes.length; n < r; n++)
                    this.scopes[n].stop(!0);
            if (!this.detached && this.parent && !t) {
                const s = this.parent.scopes.pop();
                s && s !== this && (this.parent.scopes[this.index] = s, s.index = this.index)
            }
            this.parent = void 0,
            this._active = !1
        }
    }
}
function to(e) {
    return new eo(e)
}
function Yi(e, t=Te) {
    t && t.active && t.effects.push(e)
}
function Un() {
    return Te
}
function $r(e) {
    Te && Te.cleanups.push(e)
}
let Ot;
class sn {
    constructor(t, n, r, s)
    {
        this.fn = t,
        this.trigger = n,
        this.scheduler = r,
        this.active = !0,
        this.deps = [],
        this._dirtyLevel = 4,
        this._trackId = 0,
        this._runnings = 0,
        this._shouldSchedule = !1,
        this._depsLength = 0,
        Yi(this, s)
    }
    get dirty()
    {
        if (this._dirtyLevel === 2 || this._dirtyLevel === 3) {
            this._dirtyLevel = 1,
            Ht();
            for (let t = 0; t < this._depsLength; t++) {
                const n = this.deps[t];
                if (n.computed && (Ru(n.computed), this._dirtyLevel >= 4))
                    break
            }
            this._dirtyLevel === 1 && (this._dirtyLevel = 0),
            Dt()
        }
        return this._dirtyLevel >= 4
    }
    set dirty(t)
    {
        this._dirtyLevel = t ? 4 : 0
    }
    run()
    {
        if (this._dirtyLevel = 0, !this.active)
            return this.fn();
        let t = ft,
            n = Ot;
        try {
            return ft = !0, Ot = this, this._runnings++, Ho(this), this.fn()
        } finally {
            Do(this),
            this._runnings--,
            Ot = n,
            ft = t
        }
    }
    stop()
    {
        var t;
        this.active && (Ho(this), Do(this), (t = this.onStop) == null || t.call(this), this.active = !1)
    }
}
function Ru(e) {
    return e.value
}
function Ho(e) {
    e._trackId++,
    e._depsLength = 0
}
function Do(e) {
    if (e.deps.length > e._depsLength) {
        for (let t = e._depsLength; t < e.deps.length; t++)
            qi(e.deps[t], e);
        e.deps.length = e._depsLength
    }
}
function qi(e, t) {
    const n = e.get(t);
    n !== void 0 && t._trackId !== n && (e.delete(t), e.size === 0 && e.cleanup())
}
function Pu(e, t) {
    e.effect instanceof sn && (e = e.effect.fn);
    const n = new sn(e, we, () => {
        n.dirty && n.run()
    });
    t && (oe(n, t), t.scope && Yi(n, t.scope)),
    (!t || !t.lazy) && n.run();
    const r = n.run.bind(n);
    return r.effect = n, r
}
function Nu(e) {
    e.effect.stop()
}
let ft = !0,
    Ts = 0;
const Gi = [];
function Ht() {
    Gi.push(ft),
    ft = !1
}
function Dt() {
    const e = Gi.pop();
    ft = e === void 0 ? !0 : e
}
function no() {
    Ts++
}
function ro() {
    for (Ts--; !Ts && xs.length;)
        xs.shift()()
}
function Ji(e, t, n) {
    if (t.get(e) !== e._trackId) {
        t.set(e, e._trackId);
        const r = e.deps[e._depsLength];
        r !== t ? (r && qi(r, e), e.deps[e._depsLength++] = t) : e._depsLength++
    }
}
const xs = [];
function zi(e, t, n) {
    no();
    for (const r of e.keys()) {
        let s;
        r._dirtyLevel < t && (s ?? (s = e.get(r) === r._trackId)) && (r._shouldSchedule || (r._shouldSchedule = r._dirtyLevel === 0), r._dirtyLevel = t),
        r._shouldSchedule && (s ?? (s = e.get(r) === r._trackId)) && (r.trigger(), (!r._runnings || r.allowRecurse) && r._dirtyLevel !== 2 && (r._shouldSchedule = !1, r.scheduler && xs.push(r.scheduler)))
    }
    ro()
}
const Qi = (e, t) => {
        const n = new Map;
        return n.cleanup = e, n.computed = t, n
    },
    Cr = new WeakMap,
    Rt = Symbol(""),
    As = Symbol("");
function Ce(e, t, n) {
    if (ft && Ot) {
        let r = Cr.get(e);
        r || Cr.set(e, r = new Map);
        let s = r.get(n);
        s || r.set(n, s = Qi(() => r.delete(n))),
        Ji(Ot, s)
    }
}
function Je(e, t, n, r, s, o) {
    const i = Cr.get(e);
    if (!i)
        return;
    let l = [];
    if (t === "clear")
        l = [...i.values()];
    else if (n === "length" && $(e)) {
        const c = Number(r);
        i.forEach((u, f) => {
            (f === "length" || !at(f) && f >= c) && l.push(u)
        })
    } else
        switch (n !== void 0 && l.push(i.get(n)), t) {
        case "add":
            $(e) ? Zs(n) && l.push(i.get("length")) : (l.push(i.get(Rt)), Gt(e) && l.push(i.get(As)));
            break;
        case "delete":
            $(e) || (l.push(i.get(Rt)), Gt(e) && l.push(i.get(As)));
            break;
        case "set":
            Gt(e) && l.push(i.get(Rt));
            break
        }
    no();
    for (const c of l)
        c && zi(c, 4);
    ro()
}
function Lu(e, t) {
    var n;
    return (n = Cr.get(e)) == null ? void 0 : n.get(t)
}
const Mu = Br("__proto__,__v_isRef,__isVue"),
    Zi = new Set(Object.getOwnPropertyNames(Symbol).filter(e => e !== "arguments" && e !== "caller").map(e => Symbol[e]).filter(at)),
    $o = Iu();
function Iu() {
    const e = {};
    return ["includes", "indexOf", "lastIndexOf"].forEach(t => {
        e[t] = function(...n) {
            const r = G(this);
            for (let o = 0, i = this.length; o < i; o++)
                Ce(r, "get", o + "");
            const s = r[t](...n);
            return s === -1 || s === !1 ? r[t](...n.map(G)) : s
        }
    }), ["push", "pop", "shift", "unshift", "splice"].forEach(t => {
        e[t] = function(...n) {
            Ht(),
            no();
            const r = G(this)[t].apply(this, n);
            return ro(), Dt(), r
        }
    }), e
}
function Fu(e) {
    const t = G(this);
    return Ce(t, "has", e), t.hasOwnProperty(e)
}
class el {
    constructor(t=!1, n=!1)
    {
        this._isReadonly = t,
        this._isShallow = n
    }
    get(t, n, r)
    {
        const s = this._isReadonly,
            o = this._isShallow;
        if (n === "__v_isReactive")
            return !s;
        if (n === "__v_isReadonly")
            return s;
        if (n === "__v_isShallow")
            return o;
        if (n === "__v_raw")
            return r === (s ? o ? il : ol : o ? sl : rl).get(t) || Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
        const i = $(t);
        if (!s) {
            if (i && z($o, n))
                return Reflect.get($o, n, r);
            if (n === "hasOwnProperty")
                return Fu
        }
        const l = Reflect.get(t, n, r);
        return (at(n) ? Zi.has(n) : Mu(n)) || (s || Ce(t, "get", n), o) ? l : le(l) ? i && Zs(n) ? l : l.value : te(l) ? s ? Ur(l) : ht(l) : l
    }
}
class tl extends el {
    constructor(t=!1)
    {
        super(!1, t)
    }
    set(t, n, r, s)
    {
        let o = t[n];
        if (!this._isShallow) {
            const c = Lt(o);
            if (!Pn(r) && !Lt(r) && (o = G(o), r = G(r)), !$(t) && le(o) && !le(r))
                return c ? !1 : (o.value = r, !0)
        }
        const i = $(t) && Zs(n) ? Number(n) < t.length : z(t, n),
            l = Reflect.set(t, n, r, s);
        return t === G(s) && (i ? ke(r, o) && Je(t, "set", n, r) : Je(t, "add", n, r)), l
    }
    deleteProperty(t, n)
    {
        const r = z(t, n);
        t[n];
        const s = Reflect.deleteProperty(t, n);
        return s && r && Je(t, "delete", n, void 0), s
    }
    has(t, n)
    {
        const r = Reflect.has(t, n);
        return (!at(n) || !Zi.has(n)) && Ce(t, "has", n), r
    }
    ownKeys(t)
    {
        return Ce(t, "iterate", $(t) ? "length" : Rt), Reflect.ownKeys(t)
    }
}
class nl extends el {
    constructor(t=!1)
    {
        super(!0, t)
    }
    set(t, n)
    {
        return !0
    }
    deleteProperty(t, n)
    {
        return !0
    }
}
const ku = new tl,
    Vu = new nl,
    Bu = new tl(!0),
    Hu = new nl(!0),
    so = e => e,
    jr = e => Reflect.getPrototypeOf(e);
function Zn(e, t, n=!1, r=!1) {
    e = e.__v_raw;
    const s = G(e),
        o = G(t);
    n || (ke(t, o) && Ce(s, "get", t), Ce(s, "get", o));
    const {has: i} = jr(s),
        l = r ? so : n ? oo : Nn;
    if (i.call(s, t))
        return l(e.get(t));
    if (i.call(s, o))
        return l(e.get(o));
    e !== s && e.get(t)
}
function er(e, t=!1) {
    const n = this.__v_raw,
        r = G(n),
        s = G(e);
    return t || (ke(e, s) && Ce(r, "has", e), Ce(r, "has", s)), e === s ? n.has(e) : n.has(e) || n.has(s)
}
function tr(e, t=!1) {
    return e = e.__v_raw, !t && Ce(G(e), "iterate", Rt), Reflect.get(e, "size", e)
}
function jo(e) {
    e = G(e);
    const t = G(this);
    return jr(t).has.call(t, e) || (t.add(e), Je(t, "add", e, e)), this
}
function Wo(e, t) {
    t = G(t);
    const n = G(this),
        {has: r, get: s} = jr(n);
    let o = r.call(n, e);
    o || (e = G(e), o = r.call(n, e));
    const i = s.call(n, e);
    return n.set(e, t), o ? ke(t, i) && Je(n, "set", e, t) : Je(n, "add", e, t), this
}
function Uo(e) {
    const t = G(this),
        {has: n, get: r} = jr(t);
    let s = n.call(t, e);
    s || (e = G(e), s = n.call(t, e)),
    r && r.call(t, e);
    const o = t.delete(e);
    return s && Je(t, "delete", e, void 0), o
}
function Ko() {
    const e = G(this),
        t = e.size !== 0,
        n = e.clear();
    return t && Je(e, "clear", void 0, void 0), n
}
function nr(e, t) {
    return function(r, s) {
        const o = this,
            i = o.__v_raw,
            l = G(i),
            c = t ? so : e ? oo : Nn;
        return !e && Ce(l, "iterate", Rt), i.forEach((u, f) => r.call(s, c(u), c(f), o))
    }
}
function rr(e, t, n) {
    return function(...r) {
        const s = this.__v_raw,
            o = G(s),
            i = Gt(o),
            l = e === "entries" || e === Symbol.iterator && i,
            c = e === "keys" && i,
            u = s[e](...r),
            f = n ? so : t ? oo : Nn;
        return !t && Ce(o, "iterate", c ? As : Rt), {
            next() {
                const {value: a, done: d} = u.next();
                return d ? {
                    value: a,
                    done: d
                } : {
                    value: l ? [f(a[0]), f(a[1])] : f(a),
                    done: d
                }
            },
            [Symbol.iterator]() {
                return this
            }
        }
    }
}
function et(e) {
    return function(...t) {
        return e === "delete" ? !1 : e === "clear" ? void 0 : this
    }
}
function Du() {
    const e = {
            get(o) {
                return Zn(this, o)
            },
            get size() {
                return tr(this)
            },
            has: er,
            add: jo,
            set: Wo,
            delete: Uo,
            clear: Ko,
            forEach: nr(!1, !1)
        },
        t = {
            get(o) {
                return Zn(this, o, !1, !0)
            },
            get size() {
                return tr(this)
            },
            has: er,
            add: jo,
            set: Wo,
            delete: Uo,
            clear: Ko,
            forEach: nr(!1, !0)
        },
        n = {
            get(o) {
                return Zn(this, o, !0)
            },
            get size() {
                return tr(this, !0)
            },
            has(o) {
                return er.call(this, o, !0)
            },
            add: et("add"),
            set: et("set"),
            delete: et("delete"),
            clear: et("clear"),
            forEach: nr(!0, !1)
        },
        r = {
            get(o) {
                return Zn(this, o, !0, !0)
            },
            get size() {
                return tr(this, !0)
            },
            has(o) {
                return er.call(this, o, !0)
            },
            add: et("add"),
            set: et("set"),
            delete: et("delete"),
            clear: et("clear"),
            forEach: nr(!0, !0)
        };
    return ["keys", "values", "entries", Symbol.iterator].forEach(o => {
        e[o] = rr(o, !1, !1),
        n[o] = rr(o, !0, !1),
        t[o] = rr(o, !1, !0),
        r[o] = rr(o, !0, !0)
    }), [e, n, t, r]
}
const [$u, ju, Wu, Uu] = Du();
function Wr(e, t) {
    const n = t ? e ? Uu : Wu : e ? ju : $u;
    return (r, s, o) => s === "__v_isReactive" ? !e : s === "__v_isReadonly" ? e : s === "__v_raw" ? r : Reflect.get(z(n, s) && s in r ? n : r, s, o)
}
const Ku = {
        get: Wr(!1, !1)
    },
    Xu = {
        get: Wr(!1, !0)
    },
    Yu = {
        get: Wr(!0, !1)
    },
    qu = {
        get: Wr(!0, !0)
    },
    rl = new WeakMap,
    sl = new WeakMap,
    ol = new WeakMap,
    il = new WeakMap;
function Gu(e) {
    switch (e) {
    case "Object":
    case "Array":
        return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
        return 2;
    default:
        return 0
    }
}
function Ju(e) {
    return e.__v_skip || !Object.isExtensible(e) ? 0 : Gu(gu(e))
}
function ht(e) {
    return Lt(e) ? e : Kr(e, !1, ku, Ku, rl)
}
function ll(e) {
    return Kr(e, !1, Bu, Xu, sl)
}
function Ur(e) {
    return Kr(e, !0, Vu, Yu, ol)
}
function Tt(e) {
    return Kr(e, !0, Hu, qu, il)
}
function Kr(e, t, n, r, s) {
    if (!te(e) || e.__v_raw && !(t && e.__v_isReactive))
        return e;
    const o = s.get(e);
    if (o)
        return o;
    const i = Ju(e);
    if (i === 0)
        return e;
    const l = new Proxy(e, i === 2 ? r : n);
    return s.set(e, l), l
}
function We(e) {
    return Lt(e) ? We(e.__v_raw) : !!(e && e.__v_isReactive)
}
function Lt(e) {
    return !!(e && e.__v_isReadonly)
}
function Pn(e) {
    return !!(e && e.__v_isShallow)
}
function Xr(e) {
    return We(e) || Lt(e)
}
function G(e) {
    const t = e && e.__v_raw;
    return t ? G(t) : e
}
function $t(e) {
    return Object.isExtensible(e) && wr(e, "__v_skip", !0), e
}
const Nn = e => te(e) ? ht(e) : e,
    oo = e => te(e) ? Ur(e) : e;
class cl {
    constructor(t, n, r, s)
    {
        this.getter = t,
        this._setter = n,
        this.dep = void 0,
        this.__v_isRef = !0,
        this.__v_isReadonly = !1,
        this.effect = new sn(() => t(this._value), () => Qt(this, this.effect._dirtyLevel === 2 ? 2 : 3)),
        this.effect.computed = this,
        this.effect.active = this._cacheable = !s,
        this.__v_isReadonly = r
    }
    get value()
    {
        const t = G(this);
        return (!t._cacheable || t.effect.dirty) && ke(t._value, t._value = t.effect.run()) && Qt(t, 4), io(t), t.effect._dirtyLevel >= 2 && Qt(t, 2), t._value
    }
    set value(t)
    {
        this._setter(t)
    }
    get _dirty()
    {
        return this.effect.dirty
    }
    set _dirty(t)
    {
        this.effect.dirty = t
    }
}
function zu(e, t, n=!1) {
    let r,
        s;
    const o = K(e);
    return o ? (r = e, s = we) : (r = e.get, s = e.set), new cl(r, s, o || !s, n)
}
function io(e) {
    var t;
    ft && Ot && (e = G(e), Ji(Ot, (t = e.dep) != null ? t : e.dep = Qi(() => e.dep = void 0, e instanceof cl ? e : void 0)))
}
function Qt(e, t=4, n) {
    e = G(e);
    const r = e.dep;
    r && zi(r, t)
}
function le(e) {
    return !!(e && e.__v_isRef === !0)
}
function ge(e) {
    return ul(e, !1)
}
function lo(e) {
    return ul(e, !0)
}
function ul(e, t) {
    return le(e) ? e : new Qu(e, t)
}
class Qu {
    constructor(t, n)
    {
        this.__v_isShallow = n,
        this.dep = void 0,
        this.__v_isRef = !0,
        this._rawValue = n ? t : G(t),
        this._value = n ? t : Nn(t)
    }
    get value()
    {
        return io(this), this._value
    }
    set value(t)
    {
        const n = this.__v_isShallow || Pn(t) || Lt(t);
        t = n ? t : G(t),
        ke(t, this._rawValue) && (this._rawValue = t, this._value = n ? t : Nn(t), Qt(this, 4))
    }
}
function Zu(e) {
    Qt(e, 4)
}
function dn(e) {
    return le(e) ? e.value : e
}
function ef(e) {
    return K(e) ? e() : dn(e)
}
const tf = {
    get: (e, t, n) => dn(Reflect.get(e, t, n)),
    set: (e, t, n, r) => {
        const s = e[t];
        return le(s) && !le(n) ? (s.value = n, !0) : Reflect.set(e, t, n, r)
    }
};
function co(e) {
    return We(e) ? e : new Proxy(e, tf)
}
class nf {
    constructor(t)
    {
        this.dep = void 0,
        this.__v_isRef = !0;
        const {get: n, set: r} = t(() => io(this), () => Qt(this));
        this._get = n,
        this._set = r
    }
    get value()
    {
        return this._get()
    }
    set value(t)
    {
        this._set(t)
    }
}
function fl(e) {
    return new nf(e)
}
function al(e) {
    const t = $(e) ? new Array(e.length) : {};
    for (const n in e)
        t[n] = hl(e, n);
    return t
}
class rf {
    constructor(t, n, r)
    {
        this._object = t,
        this._key = n,
        this._defaultValue = r,
        this.__v_isRef = !0
    }
    get value()
    {
        const t = this._object[this._key];
        return t === void 0 ? this._defaultValue : t
    }
    set value(t)
    {
        this._object[this._key] = t
    }
    get dep()
    {
        return Lu(G(this._object), this._key)
    }
}
class sf {
    constructor(t)
    {
        this._getter = t,
        this.__v_isRef = !0,
        this.__v_isReadonly = !0
    }
    get value()
    {
        return this._getter()
    }
}
function dl(e, t, n) {
    return le(e) ? e : K(e) ? new sf(e) : te(e) && arguments.length > 1 ? hl(e, t, n) : ge(e)
}
function hl(e, t, n) {
    const r = e[t];
    return le(r) ? r : new rf(e, t, n)
}
const of = {
        GET: "get",
        HAS: "has",
        ITERATE: "iterate"
    },
    lf = {
        SET: "set",
        ADD: "add",
        DELETE: "delete",
        CLEAR: "clear"
    };
function cf(e, t) {}
const uf = {
        SETUP_FUNCTION: 0,
        0: "SETUP_FUNCTION",
        RENDER_FUNCTION: 1,
        1: "RENDER_FUNCTION",
        WATCH_GETTER: 2,
        2: "WATCH_GETTER",
        WATCH_CALLBACK: 3,
        3: "WATCH_CALLBACK",
        WATCH_CLEANUP: 4,
        4: "WATCH_CLEANUP",
        NATIVE_EVENT_HANDLER: 5,
        5: "NATIVE_EVENT_HANDLER",
        COMPONENT_EVENT_HANDLER: 6,
        6: "COMPONENT_EVENT_HANDLER",
        VNODE_HOOK: 7,
        7: "VNODE_HOOK",
        DIRECTIVE_HOOK: 8,
        8: "DIRECTIVE_HOOK",
        TRANSITION_HOOK: 9,
        9: "TRANSITION_HOOK",
        APP_ERROR_HANDLER: 10,
        10: "APP_ERROR_HANDLER",
        APP_WARN_HANDLER: 11,
        11: "APP_WARN_HANDLER",
        FUNCTION_REF: 12,
        12: "FUNCTION_REF",
        ASYNC_COMPONENT_LOADER: 13,
        13: "ASYNC_COMPONENT_LOADER",
        SCHEDULER: 14,
        14: "SCHEDULER"
    },
    ff = {
        sp: "serverPrefetch hook",
        bc: "beforeCreate hook",
        c: "created hook",
        bm: "beforeMount hook",
        m: "mounted hook",
        bu: "beforeUpdate hook",
        u: "updated",
        bum: "beforeUnmount hook",
        um: "unmounted hook",
        a: "activated hook",
        da: "deactivated hook",
        ec: "errorCaptured hook",
        rtc: "renderTracked hook",
        rtg: "renderTriggered hook",
        0: "setup function",
        1: "render function",
        2: "watcher getter",
        3: "watcher callback",
        4: "watcher cleanup function",
        5: "native event handler",
        6: "component event handler",
        7: "vnode hook",
        8: "directive hook",
        9: "transition hook",
        10: "app errorHandler",
        11: "app warnHandler",
        12: "ref function",
        13: "async component loader",
        14: "scheduler flush. This is likely a Vue internals bug. Please open an issue at https://github.com/vuejs/core ."
    };
function ze(e, t, n, r) {
    try {
        return r ? e(...r) : e()
    } catch (s) {
        yt(s, t, n)
    }
}
function Oe(e, t, n, r) {
    if (K(e)) {
        const o = ze(e, t, n, r);
        return o && Qs(o) && o.catch(i => {
            yt(i, t, n)
        }), o
    }
    const s = [];
    for (let o = 0; o < e.length; o++)
        s.push(Oe(e[o], t, n, r));
    return s
}
function yt(e, t, n, r=!0) {
    const s = t ? t.vnode : null;
    if (t) {
        let o = t.parent;
        const i = t.proxy,
            l = `https://vuejs.org/error-reference/#runtime-${n}`;
        for (; o;) {
            const u = o.ec;
            if (u) {
                for (let f = 0; f < u.length; f++)
                    if (u[f](e, i, l) === !1)
                        return
            }
            o = o.parent
        }
        const c = t.appContext.config.errorHandler;
        if (c) {
            ze(c, null, 10, [e, i, l]);
            return
        }
    }
    af(e, n, s, r)
}
function af(e, t, n, r=!0) {
    console.error(e)
}
let Ln = !1,
    Os = !1;
const me = [];
let je = 0;
const Zt = [];
let it = null,
    xt = 0;
const pl = Promise.resolve();
let uo = null;
function bt(e) {
    const t = uo || pl;
    return e ? t.then(this ? e.bind(this) : e) : t
}
function df(e) {
    let t = je + 1,
        n = me.length;
    for (; t < n;) {
        const r = t + n >>> 1,
            s = me[r],
            o = Mn(s);
        o < e || o === e && s.pre ? t = r + 1 : n = r
    }
    return t
}
function Yr(e) {
    (!me.length || !me.includes(e, Ln && e.allowRecurse ? je + 1 : je)) && (e.id == null ? me.push(e) : me.splice(df(e.id), 0, e), gl())
}
function gl() {
    !Ln && !Os && (Os = !0, uo = pl.then(ml))
}
function hf(e) {
    const t = me.indexOf(e);
    t > je && me.splice(t, 1)
}
function Sr(e) {
    $(e) ? Zt.push(...e) : (!it || !it.includes(e, e.allowRecurse ? xt + 1 : xt)) && Zt.push(e),
    gl()
}
function Xo(e, t, n=Ln ? je + 1 : 0) {
    for (; n < me.length; n++) {
        const r = me[n];
        if (r && r.pre) {
            if (e && r.id !== e.uid)
                continue;
            me.splice(n, 1),
            n--,
            r()
        }
    }
}
function Tr(e) {
    if (Zt.length) {
        const t = [...new Set(Zt)].sort((n, r) => Mn(n) - Mn(r));
        if (Zt.length = 0, it) {
            it.push(...t);
            return
        }
        for (it = t, xt = 0; xt < it.length; xt++)
            it[xt]();
        it = null,
        xt = 0
    }
}
const Mn = e => e.id == null ? 1 / 0 : e.id,
    pf = (e, t) => {
        const n = Mn(e) - Mn(t);
        if (n === 0) {
            if (e.pre && !t.pre)
                return -1;
            if (t.pre && !e.pre)
                return 1
        }
        return n
    };
function ml(e) {
    Os = !1,
    Ln = !0,
    me.sort(pf);
    try {
        for (je = 0; je < me.length; je++) {
            const t = me[je];
            t && t.active !== !1 && ze(t, null, 14)
        }
    } finally {
        je = 0,
        me.length = 0,
        Tr(),
        Ln = !1,
        uo = null,
        (me.length || Zt.length) && ml()
    }
}
let Xt,
    sr = [];
function yl(e, t) {
    var n,
        r;
    Xt = e,
    Xt ? (Xt.enabled = !0, sr.forEach(({event: s, args: o}) => Xt.emit(s, ...o)), sr = []) : typeof window < "u" && window.HTMLElement && !((r = (n = window.navigator) == null ? void 0 : n.userAgent) != null && r.includes("jsdom")) ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push(o => {
        yl(o, t)
    }), setTimeout(() => {
        Xt || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, sr = [])
    }, 3e3)) : sr = []
}
function gf(e, t, ...n) {
    if (e.isUnmounted)
        return;
    const r = e.vnode.props || Q;
    let s = n;
    const o = t.startsWith("update:"),
        i = o && t.slice(7);
    if (i && i in r) {
        const f = `${i === "modelValue" ? "model" : i}Modifiers`,
            {number: a, trim: d} = r[f] || Q;
        d && (s = n.map(g => ie(g) ? g.trim() : g)),
        a && (s = n.map(Rn))
    }
    let l,
        c = r[l = vn(t)] || r[l = vn(_e(t))];
    !c && o && (c = r[l = vn(Ae(t))]),
    c && Oe(c, e, 6, s);
    const u = r[l + "Once"];
    if (u) {
        if (!e.emitted)
            e.emitted = {};
        else if (e.emitted[l])
            return;
        e.emitted[l] = !0,
        Oe(u, e, 6, s)
    }
}
function bl(e, t, n=!1) {
    const r = t.emitsCache,
        s = r.get(e);
    if (s !== void 0)
        return s;
    const o = e.emits;
    let i = {},
        l = !1;
    if (!K(e)) {
        const c = u => {
            const f = bl(u, t, !0);
            f && (l = !0, oe(i, f))
        };
        !n && t.mixins.length && t.mixins.forEach(c),
        e.extends && c(e.extends),
        e.mixins && e.mixins.forEach(c)
    }
    return !o && !l ? (te(e) && r.set(e, null), null) : ($(o) ? o.forEach(c => i[c] = null) : oe(i, o), te(e) && r.set(e, i), i)
}
function qr(e, t) {
    return !e || !Dn(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), z(e, t[0].toLowerCase() + t.slice(1)) || z(e, Ae(t)) || z(e, t))
}
let ce = null,
    Gr = null;
function In(e) {
    const t = ce;
    return ce = e, Gr = e && e.type.__scopeId || null, t
}
function mf(e) {
    Gr = e
}
function yf() {
    Gr = null
}
const bf = e => fo;
function fo(e, t=ce, n) {
    if (!t || e._n)
        return e;
    const r = (...s) => {
        r._d && ks(-1);
        const o = In(t);
        let i;
        try {
            i = e(...s)
        } finally {
            In(o),
            r._d && ks(1)
        }
        return i
    };
    return r._n = !0, r._c = !0, r._d = !0, r
}
function pr(e) {
    const {type: t, vnode: n, proxy: r, withProxy: s, props: o, propsOptions: [i], slots: l, attrs: c, emit: u, render: f, renderCache: a, data: d, setupState: g, ctx: E, inheritAttrs: x} = e;
    let O,
        I;
    const T = In(e);
    try {
        if (n.shapeFlag & 4) {
            const p = s || r,
                b = p;
            O = xe(f.call(b, p, a, o, g, d, E)),
            I = c
        } else {
            const p = t;
            O = xe(p.length > 1 ? p(o, {
                attrs: c,
                slots: l,
                emit: u
            }) : p(o, null)),
            I = t.props ? c : vf(c)
        }
    } catch (p) {
        Cn.length = 0,
        yt(p, e, 1),
        O = re(pe)
    }
    let m = O;
    if (I && x !== !1) {
        const p = Object.keys(I),
            {shapeFlag: b} = m;
        p.length && b & 7 && (i && p.some(Js) && (I = wf(I, i)), m = Ue(m, I))
    }
    return n.dirs && (m = Ue(m), m.dirs = m.dirs ? m.dirs.concat(n.dirs) : n.dirs), n.transition && (m.transition = n.transition), O = m, In(T), O
}
function _f(e, t=!0) {
    let n;
    for (let r = 0; r < e.length; r++) {
        const s = e[r];
        if (Qe(s)) {
            if (s.type !== pe || s.children === "v-if") {
                if (n)
                    return;
                n = s
            }
        } else
            return
    }
    return n
}
const vf = e => {
        let t;
        for (const n in e)
            (n === "class" || n === "style" || Dn(n)) && ((t || (t = {}))[n] = e[n]);
        return t
    },
    wf = (e, t) => {
        const n = {};
        for (const r in e)
            (!Js(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
        return n
    };
function Ef(e, t, n) {
    const {props: r, children: s, component: o} = e,
        {props: i, children: l, patchFlag: c} = t,
        u = o.emitsOptions;
    if (t.dirs || t.transition)
        return !0;
    if (n && c >= 0) {
        if (c & 1024)
            return !0;
        if (c & 16)
            return r ? Yo(r, i, u) : !!i;
        if (c & 8) {
            const f = t.dynamicProps;
            for (let a = 0; a < f.length; a++) {
                const d = f[a];
                if (i[d] !== r[d] && !qr(u, d))
                    return !0
            }
        }
    } else
        return (s || l) && (!l || !l.$stable) ? !0 : r === i ? !1 : r ? i ? Yo(r, i, u) : !0 : !!i;
    return !1
}
function Yo(e, t, n) {
    const r = Object.keys(t);
    if (r.length !== Object.keys(e).length)
        return !0;
    for (let s = 0; s < r.length; s++) {
        const o = r[s];
        if (t[o] !== e[o] && !qr(n, o))
            return !0
    }
    return !1
}
function ao({vnode: e, parent: t}, n) {
    for (; t;) {
        const r = t.subTree;
        if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e)
            (e = t.vnode).el = n,
            t = t.parent;
        else
            break
    }
}
const ho = "components",
    Cf = "directives";
function Sf(e, t) {
    return po(ho, e, !0, t) || e
}
const _l = Symbol.for("v-ndc");
function Tf(e) {
    return ie(e) ? po(ho, e, !1) || e : e || _l
}
function xf(e) {
    return po(Cf, e)
}
function po(e, t, n=!0, r=!1) {
    const s = ce || ue;
    if (s) {
        const o = s.type;
        if (e === ho) {
            const l = $s(o, !1);
            if (l && (l === t || l === _e(t) || l === $n(_e(t))))
                return o
        }
        const i = qo(s[e] || o[e], t) || qo(s.appContext[e], t);
        return !i && r ? o : i
    }
}
function qo(e, t) {
    return e && (e[t] || e[_e(t)] || e[$n(_e(t))])
}
const vl = e => e.__isSuspense;
let Rs = 0;
const Af = {
        name: "Suspense",
        __isSuspense: !0,
        process(e, t, n, r, s, o, i, l, c, u) {
            if (e == null)
                Rf(t, n, r, s, o, i, l, c, u);
            else {
                if (o && o.deps > 0 && !e.suspense.isInFallback) {
                    t.suspense = e.suspense,
                    t.suspense.vnode = t,
                    t.el = e.el;
                    return
                }
                Pf(e, t, n, r, s, i, l, c, u)
            }
        },
        hydrate: Nf,
        create: go,
        normalize: Lf
    },
    Of = Af;
function Fn(e, t) {
    const n = e.props && e.props[t];
    K(n) && n()
}
function Rf(e, t, n, r, s, o, i, l, c) {
    const {p: u, o: {createElement: f}} = c,
        a = f("div"),
        d = e.suspense = go(e, s, r, t, a, n, o, i, l, c);
    u(null, d.pendingBranch = e.ssContent, a, null, r, d, o, i),
    d.deps > 0 ? (Fn(e, "onPending"), Fn(e, "onFallback"), u(null, e.ssFallback, t, n, r, null, o, i), en(d, e.ssFallback)) : d.resolve(!1, !0)
}
function Pf(e, t, n, r, s, o, i, l, {p: c, um: u, o: {createElement: f}}) {
    const a = t.suspense = e.suspense;
    a.vnode = t,
    t.el = e.el;
    const d = t.ssContent,
        g = t.ssFallback,
        {activeBranch: E, pendingBranch: x, isInFallback: O, isHydrating: I} = a;
    if (x)
        a.pendingBranch = d,
        Fe(d, x) ? (c(x, d, a.hiddenContainer, null, s, a, o, i, l), a.deps <= 0 ? a.resolve() : O && (I || (c(E, g, n, r, s, null, o, i, l), en(a, g)))) : (a.pendingId = Rs++, I ? (a.isHydrating = !1, a.activeBranch = x) : u(x, s, a), a.deps = 0, a.effects.length = 0, a.hiddenContainer = f("div"), O ? (c(null, d, a.hiddenContainer, null, s, a, o, i, l), a.deps <= 0 ? a.resolve() : (c(E, g, n, r, s, null, o, i, l), en(a, g))) : E && Fe(d, E) ? (c(E, d, n, r, s, a, o, i, l), a.resolve(!0)) : (c(null, d, a.hiddenContainer, null, s, a, o, i, l), a.deps <= 0 && a.resolve()));
    else if (E && Fe(d, E))
        c(E, d, n, r, s, a, o, i, l),
        en(a, d);
    else if (Fn(t, "onPending"), a.pendingBranch = d, d.shapeFlag & 512 ? a.pendingId = d.component.suspenseId : a.pendingId = Rs++, c(null, d, a.hiddenContainer, null, s, a, o, i, l), a.deps <= 0)
        a.resolve();
    else {
        const {timeout: T, pendingId: m} = a;
        T > 0 ? setTimeout(() => {
            a.pendingId === m && a.fallback(g)
        }, T) : T === 0 && a.fallback(g)
    }
}
function go(e, t, n, r, s, o, i, l, c, u, f=!1) {
    const {p: a, m: d, um: g, n: E, o: {parentNode: x, remove: O}} = u;
    let I;
    const T = Mf(e);
    T && t != null && t.pendingBranch && (I = t.pendingId, t.deps++);
    const m = e.props ? Er(e.props.timeout) : void 0,
        p = o,
        b = {
            vnode: e,
            parent: t,
            parentComponent: n,
            namespace: i,
            container: r,
            hiddenContainer: s,
            deps: 0,
            pendingId: Rs++,
            timeout: typeof m == "number" ? m : -1,
            activeBranch: null,
            pendingBranch: null,
            isInFallback: !f,
            isHydrating: f,
            isUnmounted: !1,
            effects: [],
            resolve(w=!1, A=!1) {
                const {vnode: C, activeBranch: _, pendingBranch: v, pendingId: k, effects: N, parentComponent: X, container: ne} = b;
                let Z = !1;
                b.isHydrating ? b.isHydrating = !1 : w || (Z = _ && v.transition && v.transition.mode === "out-in", Z && (_.transition.afterLeave = () => {
                    k === b.pendingId && (d(v, ne, o === p ? E(_) : o, 0), Sr(N))
                }), _ && (x(_.el) !== b.hiddenContainer && (o = E(_)), g(_, X, b, !0)), Z || d(v, ne, o, 0)),
                en(b, v),
                b.pendingBranch = null,
                b.isInFallback = !1;
                let H = b.parent,
                    q = !1;
                for (; H;) {
                    if (H.pendingBranch) {
                        H.effects.push(...N),
                        q = !0;
                        break
                    }
                    H = H.parent
                }
                !q && !Z && Sr(N),
                b.effects = [],
                T && t && t.pendingBranch && I === t.pendingId && (t.deps--, t.deps === 0 && !A && t.resolve()),
                Fn(C, "onResolve")
            },
            fallback(w) {
                if (!b.pendingBranch)
                    return;
                const {vnode: A, activeBranch: C, parentComponent: _, container: v, namespace: k} = b;
                Fn(A, "onFallback");
                const N = E(C),
                    X = () => {
                        b.isInFallback && (a(null, w, v, N, _, null, k, l, c), en(b, w))
                    },
                    ne = w.transition && w.transition.mode === "out-in";
                ne && (C.transition.afterLeave = X),
                b.isInFallback = !0,
                g(C, _, null, !0),
                ne || X()
            },
            move(w, A, C) {
                b.activeBranch && d(b.activeBranch, w, A, C),
                b.container = w
            },
            next() {
                return b.activeBranch && E(b.activeBranch)
            },
            registerDep(w, A) {
                const C = !!b.pendingBranch;
                C && b.deps++;
                const _ = w.vnode.el;
                w.asyncDep.catch(v => {
                    yt(v, w, 0)
                }).then(v => {
                    if (w.isUnmounted || b.isUnmounted || b.pendingId !== w.suspenseId)
                        return;
                    w.asyncResolved = !0;
                    const {vnode: k} = w;
                    Hs(w, v, !1),
                    _ && (k.el = _);
                    const N = !_ && w.subTree.el;
                    A(w, k, x(_ || w.subTree.el), _ ? null : E(w.subTree), b, i, c),
                    N && O(N),
                    ao(w, k.el),
                    C && --b.deps === 0 && b.resolve()
                })
            },
            unmount(w, A) {
                b.isUnmounted = !0,
                b.activeBranch && g(b.activeBranch, n, w, A),
                b.pendingBranch && g(b.pendingBranch, n, w, A)
            }
        };
    return b
}
function Nf(e, t, n, r, s, o, i, l, c) {
    const u = t.suspense = go(t, r, n, e.parentNode, document.createElement("div"), null, s, o, i, l, !0),
        f = c(e, u.pendingBranch = t.ssContent, n, u, o, i);
    return u.deps === 0 && u.resolve(!1, !0), f
}
function Lf(e) {
    const {shapeFlag: t, children: n} = e,
        r = t & 32;
    e.ssContent = Go(r ? n.default : n),
    e.ssFallback = r ? Go(n.fallback) : re(pe)
}
function Go(e) {
    let t;
    if (K(e)) {
        const n = Ft && e._c;
        n && (e._d = !1, es()),
        e = e(),
        n && (e._d = !0, t = Ee, tc())
    }
    return $(e) && (e = _f(e)), e = xe(e), t && !e.dynamicChildren && (e.dynamicChildren = t.filter(n => n !== e)), e
}
function wl(e, t) {
    t && t.pendingBranch ? $(e) ? t.effects.push(...e) : t.effects.push(e) : Sr(e)
}
function en(e, t) {
    e.activeBranch = t;
    const {vnode: n, parentComponent: r} = e;
    let s = t.el;
    for (; !s && t.component;)
        t = t.component.subTree,
        s = t.el;
    n.el = s,
    r && r.subTree === n && (r.vnode.el = s, ao(r, s))
}
function Mf(e) {
    var t;
    return ((t = e.props) == null ? void 0 : t.suspensible) != null && e.props.suspensible !== !1
}
const El = Symbol.for("v-scx"),
    Cl = () => nn(El);
function If(e, t) {
    return Kn(e, null, t)
}
function Sl(e, t) {
    return Kn(e, null, {
        flush: "post"
    })
}
function Tl(e, t) {
    return Kn(e, null, {
        flush: "sync"
    })
}
const or = {};
function Ne(e, t, n) {
    return Kn(e, t, n)
}
function Kn(e, t, {immediate: n, deep: r, flush: s, once: o, onTrack: i, onTrigger: l}=Q) {
    if (t && o) {
        const w = t;
        t = (...A) => {
            w(...A),
            b()
        }
    }
    const c = ue,
        u = w => r === !0 ? w : At(w, r === !1 ? 1 : void 0);
    let f,
        a = !1,
        d = !1;
    if (le(e) ? (f = () => e.value, a = Pn(e)) : We(e) ? (f = () => u(e), a = !0) : $(e) ? (d = !0, a = e.some(w => We(w) || Pn(w)), f = () => e.map(w => {
        if (le(w))
            return w.value;
        if (We(w))
            return u(w);
        if (K(w))
            return ze(w, c, 2)
    })) : K(e) ? t ? f = () => ze(e, c, 2) : f = () => (g && g(), Oe(e, c, 3, [E])) : f = we, t && r) {
        const w = f;
        f = () => At(w())
    }
    let g,
        E = w => {
            g = m.onStop = () => {
                ze(w, c, 4),
                g = m.onStop = void 0
            }
        },
        x;
    if (qn)
        if (E = we, t ? n && Oe(t, c, 3, [f(), d ? [] : void 0, E]) : f(), s === "sync") {
            const w = Cl();
            x = w.__watcherHandles || (w.__watcherHandles = [])
        } else
            return we;
    let O = d ? new Array(e.length).fill(or) : or;
    const I = () => {
        if (!(!m.active || !m.dirty))
            if (t) {
                const w = m.run();
                (r || a || (d ? w.some((A, C) => ke(A, O[C])) : ke(w, O))) && (g && g(), Oe(t, c, 3, [w, O === or ? void 0 : d && O[0] === or ? [] : O, E]), O = w)
            } else
                m.run()
    };
    I.allowRecurse = !!t;
    let T;
    s === "sync" ? T = I : s === "post" ? T = () => de(I, c && c.suspense) : (I.pre = !0, c && (I.id = c.uid), T = () => Yr(I));
    const m = new sn(f, we, T),
        p = Un(),
        b = () => {
            m.stop(),
            p && zs(p.effects, m)
        };
    return t ? n ? I() : O = m.run() : s === "post" ? de(m.run.bind(m), c && c.suspense) : m.run(), x && x.push(b), b
}
function Ff(e, t, n) {
    const r = this.proxy,
        s = ie(e) ? e.includes(".") ? xl(r, e) : () => r[e] : e.bind(r, r);
    let o;
    K(t) ? o = t : (o = t.handler, n = t);
    const i = kt(this),
        l = Kn(s, o.bind(r), n);
    return i(), l
}
function xl(e, t) {
    const n = t.split(".");
    return () => {
        let r = e;
        for (let s = 0; s < n.length && r; s++)
            r = r[n[s]];
        return r
    }
}
function At(e, t, n=0, r) {
    if (!te(e) || e.__v_skip)
        return e;
    if (t && t > 0) {
        if (n >= t)
            return e;
        n++
    }
    if (r = r || new Set, r.has(e))
        return e;
    if (r.add(e), le(e))
        At(e.value, t, n, r);
    else if ($(e))
        for (let s = 0; s < e.length; s++)
            At(e[s], t, n, r);
    else if (Bt(e) || Gt(e))
        e.forEach(s => {
            At(s, t, n, r)
        });
    else if (Wi(e))
        for (const s in e)
            At(e[s], t, n, r);
    return e
}
function kf(e, t) {
    if (ce === null)
        return e;
    const n = ns(ce) || ce.proxy,
        r = e.dirs || (e.dirs = []);
    for (let s = 0; s < t.length; s++) {
        let [o, i, l, c=Q] = t[s];
        o && (K(o) && (o = {
            mounted: o,
            updated: o
        }), o.deep && At(i), r.push({
            dir: o,
            instance: n,
            value: i,
            oldValue: void 0,
            arg: l,
            modifiers: c
        }))
    }
    return e
}
function $e(e, t, n, r) {
    const s = e.dirs,
        o = t && t.dirs;
    for (let i = 0; i < s.length; i++) {
        const l = s[i];
        o && (l.oldValue = o[i].value);
        let c = l.dir[r];
        c && (Ht(), Oe(c, n, 8, [e.el, l, e, t]), Dt())
    }
}
const lt = Symbol("_leaveCb"),
    ir = Symbol("_enterCb");
function mo() {
    const e = {
        isMounted: !1,
        isLeaving: !1,
        isUnmounting: !1,
        leavingVNodes: new Map
    };
    return _t(() => {
        e.isMounted = !0
    }), Zr(() => {
        e.isUnmounting = !0
    }), e
}
const Pe = [Function, Array],
    yo = {
        mode: String,
        appear: Boolean,
        persisted: Boolean,
        onBeforeEnter: Pe,
        onEnter: Pe,
        onAfterEnter: Pe,
        onEnterCancelled: Pe,
        onBeforeLeave: Pe,
        onLeave: Pe,
        onAfterLeave: Pe,
        onLeaveCancelled: Pe,
        onBeforeAppear: Pe,
        onAppear: Pe,
        onAfterAppear: Pe,
        onAppearCancelled: Pe
    },
    Vf = {
        name: "BaseTransition",
        props: yo,
        setup(e, {slots: t}) {
            const n = ae(),
                r = mo();
            return () => {
                const s = t.default && Jr(t.default(), !0);
                if (!s || !s.length)
                    return;
                let o = s[0];
                if (s.length > 1) {
                    for (const d of s)
                        if (d.type !== pe) {
                            o = d;
                            break
                        }
                }
                const i = G(e),
                    {mode: l} = i;
                if (r.isLeaving)
                    return hs(o);
                const c = Jo(o);
                if (!c)
                    return hs(o);
                const u = on(c, i, r, n);
                Mt(c, u);
                const f = n.subTree,
                    a = f && Jo(f);
                if (a && a.type !== pe && !Fe(c, a)) {
                    const d = on(a, i, r, n);
                    if (Mt(a, d), l === "out-in")
                        return r.isLeaving = !0, d.afterLeave = () => {
                            r.isLeaving = !1,
                            n.update.active !== !1 && (n.effect.dirty = !0, n.update())
                        }, hs(o);
                    l === "in-out" && c.type !== pe && (d.delayLeave = (g, E, x) => {
                        const O = Ol(r, a);
                        O[String(a.key)] = a,
                        g[lt] = () => {
                            E(),
                            g[lt] = void 0,
                            delete u.delayedLeave
                        },
                        u.delayedLeave = x
                    })
                }
                return o
            }
        }
    },
    Al = Vf;
function Ol(e, t) {
    const {leavingVNodes: n} = e;
    let r = n.get(t.type);
    return r || (r = Object.create(null), n.set(t.type, r)), r
}
function on(e, t, n, r) {
    const {appear: s, mode: o, persisted: i=!1, onBeforeEnter: l, onEnter: c, onAfterEnter: u, onEnterCancelled: f, onBeforeLeave: a, onLeave: d, onAfterLeave: g, onLeaveCancelled: E, onBeforeAppear: x, onAppear: O, onAfterAppear: I, onAppearCancelled: T} = t,
        m = String(e.key),
        p = Ol(n, e),
        b = (C, _) => {
            C && Oe(C, r, 9, _)
        },
        w = (C, _) => {
            const v = _[1];
            b(C, _),
            $(C) ? C.every(k => k.length <= 1) && v() : C.length <= 1 && v()
        },
        A = {
            mode: o,
            persisted: i,
            beforeEnter(C) {
                let _ = l;
                if (!n.isMounted)
                    if (s)
                        _ = x || l;
                    else
                        return;
                C[lt] && C[lt](!0);
                const v = p[m];
                v && Fe(e, v) && v.el[lt] && v.el[lt](),
                b(_, [C])
            },
            enter(C) {
                let _ = c,
                    v = u,
                    k = f;
                if (!n.isMounted)
                    if (s)
                        _ = O || c,
                        v = I || u,
                        k = T || f;
                    else
                        return;
                let N = !1;
                const X = C[ir] = ne => {
                    N || (N = !0, ne ? b(k, [C]) : b(v, [C]), A.delayedLeave && A.delayedLeave(), C[ir] = void 0)
                };
                _ ? w(_, [C, X]) : X()
            },
            leave(C, _) {
                const v = String(e.key);
                if (C[ir] && C[ir](!0), n.isUnmounting)
                    return _();
                b(a, [C]);
                let k = !1;
                const N = C[lt] = X => {
                    k || (k = !0, _(), X ? b(E, [C]) : b(g, [C]), C[lt] = void 0, p[v] === e && delete p[v])
                };
                p[v] = e,
                d ? w(d, [C, N]) : N()
            },
            clone(C) {
                return on(C, t, n, r)
            }
        };
    return A
}
function hs(e) {
    if (Yn(e))
        return e = Ue(e), e.children = null, e
}
function Jo(e) {
    return Yn(e) ? e.children ? e.children[0] : void 0 : e
}
function Mt(e, t) {
    e.shapeFlag & 6 && e.component ? Mt(e.component.subTree, t) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t
}
function Jr(e, t=!1, n) {
    let r = [],
        s = 0;
    for (let o = 0; o < e.length; o++) {
        let i = e[o];
        const l = n == null ? i.key : String(n) + String(i.key != null ? i.key : o);
        i.type === he ? (i.patchFlag & 128 && s++, r = r.concat(Jr(i.children, t, l))) : (t || i.type !== pe) && r.push(l != null ? Ue(i, {
            key: l
        }) : i)
    }
    if (s > 1)
        for (let o = 0; o < r.length; o++)
            r[o].patchFlag = -2;
    return r
}
function Xn(e, t) {
    return K(e) ? oe({
        name: e.name
    }, t, {
        setup: e
    }) : e
}
const Pt = e => !!e.type.__asyncLoader;
function Bf(e) {
    K(e) && (e = {
        loader: e
    });
    const {loader: t, loadingComponent: n, errorComponent: r, delay: s=200, timeout: o, suspensible: i=!0, onError: l} = e;
    let c = null,
        u,
        f = 0;
    const a = () => (f++, c = null, d()),
        d = () => {
            let g;
            return c || (g = c = t().catch(E => {
                    if (E = E instanceof Error ? E : new Error(String(E)), l)
                        return new Promise((x, O) => {
                            l(E, () => x(a()), () => O(E), f + 1)
                        });
                    throw E
                }).then(E => g !== c && c ? c : (E && (E.__esModule || E[Symbol.toStringTag] === "Module") && (E = E.default), u = E, E)))
        };
    return Xn({
        name: "AsyncComponentWrapper",
        __asyncLoader: d,
        get __asyncResolved() {
            return u
        },
        setup() {
            const g = ue;
            if (u)
                return () => ps(u, g);
            const E = T => {
                c = null,
                yt(T, g, 13, !r)
            };
            if (i && g.suspense || qn)
                return d().then(T => () => ps(T, g)).catch(T => (E(T), () => r ? re(r, {
                    error: T
                }) : null));
            const x = ge(!1),
                O = ge(),
                I = ge(!!s);
            return s && setTimeout(() => {
                I.value = !1
            }, s), o != null && setTimeout(() => {
                if (!x.value && !O.value) {
                    const T = new Error(`Async component timed out after ${o}ms.`);
                    E(T),
                    O.value = T
                }
            }, o), d().then(() => {
                x.value = !0,
                g.parent && Yn(g.parent.vnode) && (g.parent.effect.dirty = !0, Yr(g.parent.update))
            }).catch(T => {
                E(T),
                O.value = T
            }), () => {
                if (x.value && u)
                    return ps(u, g);
                if (O.value && r)
                    return re(r, {
                        error: O.value
                    });
                if (n && !I.value)
                    return re(n)
            }
        }
    })
}
function ps(e, t) {
    const {ref: n, props: r, children: s, ce: o} = t.vnode,
        i = re(e, r, s);
    return i.ref = n, i.ce = o, delete t.vnode.ce, i
}
const Yn = e => e.type.__isKeepAlive,
    Hf = {
        name: "KeepAlive",
        __isKeepAlive: !0,
        props: {
            include: [String, RegExp, Array],
            exclude: [String, RegExp, Array],
            max: [String, Number]
        },
        setup(e, {slots: t}) {
            const n = ae(),
                r = n.ctx;
            if (!r.renderer)
                return () => {
                    const T = t.default && t.default();
                    return T && T.length === 1 ? T[0] : T
                };
            const s = new Map,
                o = new Set;
            let i = null;
            const l = n.suspense,
                {renderer: {p: c, m: u, um: f, o: {createElement: a}}} = r,
                d = a("div");
            r.activate = (T, m, p, b, w) => {
                const A = T.component;
                u(T, m, p, 0, l),
                c(A.vnode, T, m, p, A, l, b, T.slotScopeIds, w),
                de(() => {
                    A.isDeactivated = !1,
                    A.a && zt(A.a);
                    const C = T.props && T.props.onVnodeMounted;
                    C && ve(C, A.parent, T)
                }, l)
            },
            r.deactivate = T => {
                const m = T.component;
                u(T, d, null, 1, l),
                de(() => {
                    m.da && zt(m.da);
                    const p = T.props && T.props.onVnodeUnmounted;
                    p && ve(p, m.parent, T),
                    m.isDeactivated = !0
                }, l)
            };
            function g(T) {
                gs(T),
                f(T, n, l, !0)
            }
            function E(T) {
                s.forEach((m, p) => {
                    const b = $s(m.type);
                    b && (!T || !T(b)) && x(p)
                })
            }
            function x(T) {
                const m = s.get(T);
                !i || !Fe(m, i) ? g(m) : i && gs(i),
                s.delete(T),
                o.delete(T)
            }
            Ne(() => [e.include, e.exclude], ([T, m]) => {
                T && E(p => bn(T, p)),
                m && E(p => !bn(m, p))
            }, {
                flush: "post",
                deep: !0
            });
            let O = null;
            const I = () => {
                O != null && s.set(O, ms(n.subTree))
            };
            return _t(I), Qr(I), Zr(() => {
                s.forEach(T => {
                    const {subTree: m, suspense: p} = n,
                        b = ms(m);
                    if (T.type === b.type && T.key === b.key) {
                        gs(b);
                        const w = b.component.da;
                        w && de(w, p);
                        return
                    }
                    g(T)
                })
            }), () => {
                if (O = null, !t.default)
                    return null;
                const T = t.default(),
                    m = T[0];
                if (T.length > 1)
                    return i = null, T;
                if (!Qe(m) || !(m.shapeFlag & 4) && !(m.shapeFlag & 128))
                    return i = null, m;
                let p = ms(m);
                const b = p.type,
                    w = $s(Pt(p) ? p.type.__asyncResolved || {} : b),
                    {include: A, exclude: C, max: _} = e;
                if (A && (!w || !bn(A, w)) || C && w && bn(C, w))
                    return i = p, m;
                const v = p.key == null ? b : p.key,
                    k = s.get(v);
                return p.el && (p = Ue(p), m.shapeFlag & 128 && (m.ssContent = p)), O = v, k ? (p.el = k.el, p.component = k.component, p.transition && Mt(p, p.transition), p.shapeFlag |= 512, o.delete(v), o.add(v)) : (o.add(v), _ && o.size > parseInt(_, 10) && x(o.values().next().value)), p.shapeFlag |= 256, i = p, vl(m.type) ? m : p
            }
        }
    },
    Df = Hf;
function bn(e, t) {
    return $(e) ? e.some(n => bn(n, t)) : ie(e) ? e.split(",").includes(t) : pu(e) ? e.test(t) : !1
}
function Rl(e, t) {
    Nl(e, "a", t)
}
function Pl(e, t) {
    Nl(e, "da", t)
}
function Nl(e, t, n=ue) {
    const r = e.__wdc || (e.__wdc = () => {
        let s = n;
        for (; s;) {
            if (s.isDeactivated)
                return;
            s = s.parent
        }
        return e()
    });
    if (zr(t, r, n), n) {
        let s = n.parent;
        for (; s && s.parent;)
            Yn(s.parent.vnode) && $f(r, t, n, s),
            s = s.parent
    }
}
function $f(e, t, n, r) {
    const s = zr(t, e, r, !0);
    hn(() => {
        zs(r[t], s)
    }, n)
}
function gs(e) {
    e.shapeFlag &= -257,
    e.shapeFlag &= -513
}
function ms(e) {
    return e.shapeFlag & 128 ? e.ssContent : e
}
function zr(e, t, n=ue, r=!1) {
    if (n) {
        const s = n[e] || (n[e] = []),
            o = t.__weh || (t.__weh = (...i) => {
                if (n.isUnmounted)
                    return;
                Ht();
                const l = kt(n),
                    c = Oe(t, n, e, i);
                return l(), Dt(), c
            });
        return r ? s.unshift(o) : s.push(o), o
    }
}
const Ze = e => (t, n=ue) => (!qn || e === "sp") && zr(e, (...r) => t(...r), n),
    bo = Ze("bm"),
    _t = Ze("m"),
    Ll = Ze("bu"),
    Qr = Ze("u"),
    Zr = Ze("bum"),
    hn = Ze("um"),
    Ml = Ze("sp"),
    Il = Ze("rtg"),
    Fl = Ze("rtc");
function kl(e, t=ue) {
    zr("ec", e, t)
}
function jf(e, t, n, r) {
    let s;
    const o = n && n[r];
    if ($(e) || ie(e)) {
        s = new Array(e.length);
        for (let i = 0, l = e.length; i < l; i++)
            s[i] = t(e[i], i, void 0, o && o[i])
    } else if (typeof e == "number") {
        s = new Array(e);
        for (let i = 0; i < e; i++)
            s[i] = t(i + 1, i, void 0, o && o[i])
    } else if (te(e))
        if (e[Symbol.iterator])
            s = Array.from(e, (i, l) => t(i, l, void 0, o && o[l]));
        else {
            const i = Object.keys(e);
            s = new Array(i.length);
            for (let l = 0, c = i.length; l < c; l++) {
                const u = i[l];
                s[l] = t(e[u], u, l, o && o[l])
            }
        }
    else
        s = [];
    return n && (n[r] = s), s
}
function Wf(e, t) {
    for (let n = 0; n < t.length; n++) {
        const r = t[n];
        if ($(r))
            for (let s = 0; s < r.length; s++)
                e[r[s].name] = r[s].fn;
        else
            r && (e[r.name] = r.key ? (...s) => {
                const o = r.fn(...s);
                return o && (o.key = r.key), o
            } : r.fn)
    }
    return e
}
function Uf(e, t, n={}, r, s) {
    if (ce.isCE || ce.parent && Pt(ce.parent) && ce.parent.isCE)
        return t !== "default" && (n.name = t), re("slot", n, r && r());
    let o = e[t];
    o && o._c && (o._d = !1),
    es();
    const i = o && Vl(o(n)),
        l = Eo(he, {
            key: n.key || i && i.key || `_${t}`
        }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
    return !s && l.scopeId && (l.slotScopeIds = [l.scopeId + "-s"]), o && o._c && (o._d = !0), l
}
function Vl(e) {
    return e.some(t => Qe(t) ? !(t.type === pe || t.type === he && !Vl(t.children)) : !0) ? e : null
}
function Kf(e, t) {
    const n = {};
    for (const r in e)
        n[t && /[A-Z]/.test(r) ? `on:${r}` : vn(r)] = e[r];
    return n
}
const Ps = e => e ? lc(e) ? ns(e) || e.proxy : Ps(e.parent) : null,
    wn = oe(Object.create(null), {
        $: e => e,
        $el: e => e.vnode.el,
        $data: e => e.data,
        $props: e => e.props,
        $attrs: e => e.attrs,
        $slots: e => e.slots,
        $refs: e => e.refs,
        $parent: e => Ps(e.parent),
        $root: e => Ps(e.root),
        $emit: e => e.emit,
        $options: e => _o(e),
        $forceUpdate: e => e.f || (e.f = () => {
            e.effect.dirty = !0,
            Yr(e.update)
        }),
        $nextTick: e => e.n || (e.n = bt.bind(e.proxy)),
        $watch: e => Ff.bind(e)
    }),
    ys = (e, t) => e !== Q && !e.__isScriptSetup && z(e, t),
    Ns = {
        get({_: e}, t) {
            const {ctx: n, setupState: r, data: s, props: o, accessCache: i, type: l, appContext: c} = e;
            let u;
            if (t[0] !== "$") {
                const g = i[t];
                if (g !== void 0)
                    switch (g) {
                    case 1:
                        return r[t];
                    case 2:
                        return s[t];
                    case 4:
                        return n[t];
                    case 3:
                        return o[t]
                    }
                else {
                    if (ys(r, t))
                        return i[t] = 1, r[t];
                    if (s !== Q && z(s, t))
                        return i[t] = 2, s[t];
                    if ((u = e.propsOptions[0]) && z(u, t))
                        return i[t] = 3, o[t];
                    if (n !== Q && z(n, t))
                        return i[t] = 4, n[t];
                    Ls && (i[t] = 0)
                }
            }
            const f = wn[t];
            let a,
                d;
            if (f)
                return t === "$attrs" && Ce(e, "get", t), f(e);
            if ((a = l.__cssModules) && (a = a[t]))
                return a;
            if (n !== Q && z(n, t))
                return i[t] = 4, n[t];
            if (d = c.config.globalProperties, z(d, t))
                return d[t]
        },
        set({_: e}, t, n) {
            const {data: r, setupState: s, ctx: o} = e;
            return ys(s, t) ? (s[t] = n, !0) : r !== Q && z(r, t) ? (r[t] = n, !0) : z(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = n, !0)
        },
        has({_: {data: e, setupState: t, accessCache: n, ctx: r, appContext: s, propsOptions: o}}, i) {
            let l;
            return !!n[i] || e !== Q && z(e, i) || ys(t, i) || (l = o[0]) && z(l, i) || z(r, i) || z(wn, i) || z(s.config.globalProperties, i)
        },
        defineProperty(e, t, n) {
            return n.get != null ? e._.accessCache[t] = 0 : z(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n)
        }
    },
    Xf = oe({}, Ns, {
        get(e, t) {
            if (t !== Symbol.unscopables)
                return Ns.get(e, t, e)
        },
        has(e, t) {
            return t[0] !== "_" && !_u(t)
        }
    });
function Yf() {
    return null
}
function qf() {
    return null
}
function Gf(e) {}
function Jf(e) {}
function zf() {
    return null
}
function Qf() {}
function Zf(e, t) {
    return null
}
function ea() {
    return Bl().slots
}
function ta() {
    return Bl().attrs
}
function Bl() {
    const e = ae();
    return e.setupContext || (e.setupContext = fc(e))
}
function kn(e) {
    return $(e) ? e.reduce((t, n) => (t[n] = null, t), {}) : e
}
function na(e, t) {
    const n = kn(e);
    for (const r in t) {
        if (r.startsWith("__skip"))
            continue;
        let s = n[r];
        s ? $(s) || K(s) ? s = n[r] = {
            type: s,
            default: t[r]
        } : s.default = t[r] : s === null && (s = n[r] = {
            default: t[r]
        }),
        s && t[`__skip_${r}`] && (s.skipFactory = !0)
    }
    return n
}
function ra(e, t) {
    return !e || !t ? e || t : $(e) && $(t) ? e.concat(t) : oe({}, kn(e), kn(t))
}
function sa(e, t) {
    const n = {};
    for (const r in e)
        t.includes(r) || Object.defineProperty(n, r, {
            enumerable: !0,
            get: () => e[r]
        });
    return n
}
function oa(e) {
    const t = ae();
    let n = e();
    return Bs(), Qs(n) && (n = n.catch(r => {
        throw kt(t), r
    })), [n, () => kt(t)]
}
let Ls = !0;
function ia(e) {
    const t = _o(e),
        n = e.proxy,
        r = e.ctx;
    Ls = !1,
    t.beforeCreate && zo(t.beforeCreate, e, "bc");
    const {data: s, computed: o, methods: i, watch: l, provide: c, inject: u, created: f, beforeMount: a, mounted: d, beforeUpdate: g, updated: E, activated: x, deactivated: O, beforeDestroy: I, beforeUnmount: T, destroyed: m, unmounted: p, render: b, renderTracked: w, renderTriggered: A, errorCaptured: C, serverPrefetch: _, expose: v, inheritAttrs: k, components: N, directives: X, filters: ne} = t;
    if (u && la(u, r, null), i)
        for (const q in i) {
            const W = i[q];
            K(W) && (r[q] = W.bind(n))
        }
    if (s) {
        const q = s.call(n, n);
        te(q) && (e.data = ht(q))
    }
    if (Ls = !0, o)
        for (const q in o) {
            const W = o[q],
                Xe = K(W) ? W.bind(n, n) : K(W.get) ? W.get.bind(n, n) : we,
                zn = !K(W) && K(W.set) ? W.set.bind(n) : we,
                wt = be({
                    get: Xe,
                    set: zn
                });
            Object.defineProperty(r, q, {
                enumerable: !0,
                configurable: !0,
                get: () => wt.value,
                set: He => wt.value = He
            })
        }
    if (l)
        for (const q in l)
            Hl(l[q], r, n, q);
    if (c) {
        const q = K(c) ? c.call(n) : c;
        Reflect.ownKeys(q).forEach(W => {
            $l(W, q[W])
        })
    }
    f && zo(f, e, "c");
    function H(q, W) {
        $(W) ? W.forEach(Xe => q(Xe.bind(n))) : W && q(W.bind(n))
    }
    if (H(bo, a), H(_t, d), H(Ll, g), H(Qr, E), H(Rl, x), H(Pl, O), H(kl, C), H(Fl, w), H(Il, A), H(Zr, T), H(hn, p), H(Ml, _), $(v))
        if (v.length) {
            const q = e.exposed || (e.exposed = {});
            v.forEach(W => {
                Object.defineProperty(q, W, {
                    get: () => n[W],
                    set: Xe => n[W] = Xe
                })
            })
        } else
            e.exposed || (e.exposed = {});
    b && e.render === we && (e.render = b),
    k != null && (e.inheritAttrs = k),
    N && (e.components = N),
    X && (e.directives = X)
}
function la(e, t, n=we) {
    $(e) && (e = Ms(e));
    for (const r in e) {
        const s = e[r];
        let o;
        te(s) ? "default" in s ? o = nn(s.from || r, s.default, !0) : o = nn(s.from || r) : o = nn(s),
        le(o) ? Object.defineProperty(t, r, {
            enumerable: !0,
            configurable: !0,
            get: () => o.value,
            set: i => o.value = i
        }) : t[r] = o
    }
}
function zo(e, t, n) {
    Oe($(e) ? e.map(r => r.bind(t.proxy)) : e.bind(t.proxy), t, n)
}
function Hl(e, t, n, r) {
    const s = r.includes(".") ? xl(n, r) : () => n[r];
    if (ie(e)) {
        const o = t[e];
        K(o) && Ne(s, o)
    } else if (K(e))
        Ne(s, e.bind(n));
    else if (te(e))
        if ($(e))
            e.forEach(o => Hl(o, t, n, r));
        else {
            const o = K(e.handler) ? e.handler.bind(n) : t[e.handler];
            K(o) && Ne(s, o, e)
        }
}
function _o(e) {
    const t = e.type,
        {mixins: n, extends: r} = t,
        {mixins: s, optionsCache: o, config: {optionMergeStrategies: i}} = e.appContext,
        l = o.get(t);
    let c;
    return l ? c = l : !s.length && !n && !r ? c = t : (c = {}, s.length && s.forEach(u => xr(c, u, i, !0)), xr(c, t, i)), te(t) && o.set(t, c), c
}
function xr(e, t, n, r=!1) {
    const {mixins: s, extends: o} = t;
    o && xr(e, o, n, !0),
    s && s.forEach(i => xr(e, i, n, !0));
    for (const i in t)
        if (!(r && i === "expose")) {
            const l = ca[i] || n && n[i];
            e[i] = l ? l(e[i], t[i]) : t[i]
        }
    return e
}
const ca = {
    data: Qo,
    props: Zo,
    emits: Zo,
    methods: _n,
    computed: _n,
    beforeCreate: ye,
    created: ye,
    beforeMount: ye,
    mounted: ye,
    beforeUpdate: ye,
    updated: ye,
    beforeDestroy: ye,
    beforeUnmount: ye,
    destroyed: ye,
    unmounted: ye,
    activated: ye,
    deactivated: ye,
    errorCaptured: ye,
    serverPrefetch: ye,
    components: _n,
    directives: _n,
    watch: fa,
    provide: Qo,
    inject: ua
};
function Qo(e, t) {
    return t ? e ? function() {
        return oe(K(e) ? e.call(this, this) : e, K(t) ? t.call(this, this) : t)
    } : t : e
}
function ua(e, t) {
    return _n(Ms(e), Ms(t))
}
function Ms(e) {
    if ($(e)) {
        const t = {};
        for (let n = 0; n < e.length; n++)
            t[e[n]] = e[n];
        return t
    }
    return e
}
function ye(e, t) {
    return e ? [...new Set([].concat(e, t))] : t
}
function _n(e, t) {
    return e ? oe(Object.create(null), e, t) : t
}
function Zo(e, t) {
    return e ? $(e) && $(t) ? [...new Set([...e, ...t])] : oe(Object.create(null), kn(e), kn(t ?? {})) : t
}
function fa(e, t) {
    if (!e)
        return t;
    if (!t)
        return e;
    const n = oe(Object.create(null), e);
    for (const r in t)
        n[r] = ye(e[r], t[r]);
    return n
}
function Dl() {
    return {
        app: null,
        config: {
            isNativeTag: du,
            performance: !1,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: void 0,
            warnHandler: void 0,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap,
        propsCache: new WeakMap,
        emitsCache: new WeakMap
    }
}
let aa = 0;
function da(e, t) {
    return function(r, s=null) {
        K(r) || (r = oe({}, r)),
        s != null && !te(s) && (s = null);
        const o = Dl(),
            i = new WeakSet;
        let l = !1;
        const c = o.app = {
            _uid: aa++,
            _component: r,
            _props: s,
            _container: null,
            _context: o,
            _instance: null,
            version: dc,
            get config() {
                return o.config
            },
            set config(u) {},
            use(u, ...f) {
                return i.has(u) || (u && K(u.install) ? (i.add(u), u.install(c, ...f)) : K(u) && (i.add(u), u(c, ...f))), c
            },
            mixin(u) {
                return o.mixins.includes(u) || o.mixins.push(u), c
            },
            component(u, f) {
                return f ? (o.components[u] = f, c) : o.components[u]
            },
            directive(u, f) {
                return f ? (o.directives[u] = f, c) : o.directives[u]
            },
            mount(u, f, a) {
                if (!l) {
                    const d = re(r, s);
                    return d.appContext = o, a === !0 ? a = "svg" : a === !1 && (a = void 0), f && t ? t(d, u) : e(d, u, a), l = !0, c._container = u, u.__vue_app__ = c, ns(d.component) || d.component.proxy
                }
            },
            unmount() {
                l && (e(null, c._container), delete c._container.__vue_app__)
            },
            provide(u, f) {
                return o.provides[u] = f, c
            },
            runWithContext(u) {
                const f = tn;
                tn = c;
                try {
                    return u()
                } finally {
                    tn = f
                }
            }
        };
        return c
    }
}
let tn = null;
function $l(e, t) {
    if (ue) {
        let n = ue.provides;
        const r = ue.parent && ue.parent.provides;
        r === n && (n = ue.provides = Object.create(r)),
        n[e] = t
    }
}
function nn(e, t, n=!1) {
    const r = ue || ce;
    if (r || tn) {
        const s = r ? r.parent == null ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : tn._context.provides;
        if (s && e in s)
            return s[e];
        if (arguments.length > 1)
            return n && K(t) ? t.call(r && r.proxy) : t
    }
}
function jl() {
    return !!(ue || ce || tn)
}
function ha(e, t, n, r=!1) {
    const s = {},
        o = {};
    wr(o, ts, 1),
    e.propsDefaults = Object.create(null),
    Wl(e, t, s, o);
    for (const i in e.propsOptions[0])
        i in s || (s[i] = void 0);
    n ? e.props = r ? s : ll(s) : e.type.props ? e.props = s : e.props = o,
    e.attrs = o
}
function pa(e, t, n, r) {
    const {props: s, attrs: o, vnode: {patchFlag: i}} = e,
        l = G(s),
        [c] = e.propsOptions;
    let u = !1;
    if ((r || i > 0) && !(i & 16)) {
        if (i & 8) {
            const f = e.vnode.dynamicProps;
            for (let a = 0; a < f.length; a++) {
                let d = f[a];
                if (qr(e.emitsOptions, d))
                    continue;
                const g = t[d];
                if (c)
                    if (z(o, d))
                        g !== o[d] && (o[d] = g, u = !0);
                    else {
                        const E = _e(d);
                        s[E] = Is(c, l, E, g, e, !1)
                    }
                else
                    g !== o[d] && (o[d] = g, u = !0)
            }
        }
    } else {
        Wl(e, t, s, o) && (u = !0);
        let f;
        for (const a in l)
            (!t || !z(t, a) && ((f = Ae(a)) === a || !z(t, f))) && (c ? n && (n[a] !== void 0 || n[f] !== void 0) && (s[a] = Is(c, l, a, void 0, e, !0)) : delete s[a]);
        if (o !== l)
            for (const a in o)
                (!t || !z(t, a)) && (delete o[a], u = !0)
    }
    u && Je(e, "set", "$attrs")
}
function Wl(e, t, n, r) {
    const [s, o] = e.propsOptions;
    let i = !1,
        l;
    if (t)
        for (let c in t) {
            if (Jt(c))
                continue;
            const u = t[c];
            let f;
            s && z(s, f = _e(c)) ? !o || !o.includes(f) ? n[f] = u : (l || (l = {}))[f] = u : qr(e.emitsOptions, c) || (!(c in r) || u !== r[c]) && (r[c] = u, i = !0)
        }
    if (o) {
        const c = G(n),
            u = l || Q;
        for (let f = 0; f < o.length; f++) {
            const a = o[f];
            n[a] = Is(s, c, a, u[a], e, !z(u, a))
        }
    }
    return i
}
function Is(e, t, n, r, s, o) {
    const i = e[n];
    if (i != null) {
        const l = z(i, "default");
        if (l && r === void 0) {
            const c = i.default;
            if (i.type !== Function && !i.skipFactory && K(c)) {
                const {propsDefaults: u} = s;
                if (n in u)
                    r = u[n];
                else {
                    const f = kt(s);
                    r = u[n] = c.call(null, t),
                    f()
                }
            } else
                r = c
        }
        i[0] && (o && !l ? r = !1 : i[1] && (r === "" || r === Ae(n)) && (r = !0))
    }
    return r
}
function Ul(e, t, n=!1) {
    const r = t.propsCache,
        s = r.get(e);
    if (s)
        return s;
    const o = e.props,
        i = {},
        l = [];
    let c = !1;
    if (!K(e)) {
        const f = a => {
            c = !0;
            const [d, g] = Ul(a, t, !0);
            oe(i, d),
            g && l.push(...g)
        };
        !n && t.mixins.length && t.mixins.forEach(f),
        e.extends && f(e.extends),
        e.mixins && e.mixins.forEach(f)
    }
    if (!o && !c)
        return te(e) && r.set(e, qt), qt;
    if ($(o))
        for (let f = 0; f < o.length; f++) {
            const a = _e(o[f]);
            ei(a) && (i[a] = Q)
        }
    else if (o)
        for (const f in o) {
            const a = _e(f);
            if (ei(a)) {
                const d = o[f],
                    g = i[a] = $(d) || K(d) ? {
                        type: d
                    } : oe({}, d);
                if (g) {
                    const E = ri(Boolean, g.type),
                        x = ri(String, g.type);
                    g[0] = E > -1,
                    g[1] = x < 0 || E < x,
                    (E > -1 || z(g, "default")) && l.push(a)
                }
            }
        }
    const u = [i, l];
    return te(e) && r.set(e, u), u
}
function ei(e) {
    return e[0] !== "$" && !Jt(e)
}
function ti(e) {
    return e === null ? "null" : typeof e == "function" ? e.name || "" : typeof e == "object" && e.constructor && e.constructor.name || ""
}
function ni(e, t) {
    return ti(e) === ti(t)
}
function ri(e, t) {
    return $(t) ? t.findIndex(n => ni(n, e)) : K(t) && ni(t, e) ? 0 : -1
}
const Kl = e => e[0] === "_" || e === "$stable",
    vo = e => $(e) ? e.map(xe) : [xe(e)],
    ga = (e, t, n) => {
        if (t._n)
            return t;
        const r = fo((...s) => vo(t(...s)), n);
        return r._c = !1, r
    },
    Xl = (e, t, n) => {
        const r = e._ctx;
        for (const s in e) {
            if (Kl(s))
                continue;
            const o = e[s];
            if (K(o))
                t[s] = ga(s, o, r);
            else if (o != null) {
                const i = vo(o);
                t[s] = () => i
            }
        }
    },
    Yl = (e, t) => {
        const n = vo(t);
        e.slots.default = () => n
    },
    ma = (e, t) => {
        if (e.vnode.shapeFlag & 32) {
            const n = t._;
            n ? (e.slots = G(t), wr(t, "_", n)) : Xl(t, e.slots = {})
        } else
            e.slots = {},
            t && Yl(e, t);
        wr(e.slots, ts, 1)
    },
    ya = (e, t, n) => {
        const {vnode: r, slots: s} = e;
        let o = !0,
            i = Q;
        if (r.shapeFlag & 32) {
            const l = t._;
            l ? n && l === 1 ? o = !1 : (oe(s, t), !n && l === 1 && delete s._) : (o = !t.$stable, Xl(t, s)),
            i = t
        } else
            t && (Yl(e, t), i = {
                default: 1
            });
        if (o)
            for (const l in s)
                !Kl(l) && i[l] == null && delete s[l]
    };
function Ar(e, t, n, r, s=!1) {
    if ($(e)) {
        e.forEach((d, g) => Ar(d, t && ($(t) ? t[g] : t), n, r, s));
        return
    }
    if (Pt(r) && !s)
        return;
    const o = r.shapeFlag & 4 ? ns(r.component) || r.component.proxy : r.el,
        i = s ? null : o,
        {i: l, r: c} = e,
        u = t && t.r,
        f = l.refs === Q ? l.refs = {} : l.refs,
        a = l.setupState;
    if (u != null && u !== c && (ie(u) ? (f[u] = null, z(a, u) && (a[u] = null)) : le(u) && (u.value = null)), K(c))
        ze(c, l, 12, [i, f]);
    else {
        const d = ie(c),
            g = le(c);
        if (d || g) {
            const E = () => {
                if (e.f) {
                    const x = d ? z(a, c) ? a[c] : f[c] : c.value;
                    s ? $(x) && zs(x, o) : $(x) ? x.includes(o) || x.push(o) : d ? (f[c] = [o], z(a, c) && (a[c] = f[c])) : (c.value = [o], e.k && (f[e.k] = c.value))
                } else
                    d ? (f[c] = i, z(a, c) && (a[c] = i)) : g && (c.value = i, e.k && (f[e.k] = i))
            };
            i ? (E.id = -1, de(E, n)) : E()
        }
    }
}
let tt = !1;
const ba = e => e.namespaceURI.includes("svg") && e.tagName !== "foreignObject",
    _a = e => e.namespaceURI.includes("MathML"),
    lr = e => {
        if (ba(e))
            return "svg";
        if (_a(e))
            return "mathml"
    },
    cr = e => e.nodeType === 8;
function va(e) {
    const {mt: t, p: n, o: {patchProp: r, createText: s, nextSibling: o, parentNode: i, remove: l, insert: c, createComment: u}} = e,
        f = (m, p) => {
            if (!p.hasChildNodes()) {
                n(null, m, p),
                Tr(),
                p._vnode = m;
                return
            }
            tt = !1,
            a(p.firstChild, m, null, null, null),
            Tr(),
            p._vnode = m,
            tt && console.error("Hydration completed but contains mismatches.")
        },
        a = (m, p, b, w, A, C=!1) => {
            const _ = cr(m) && m.data === "[",
                v = () => x(m, p, b, w, A, _),
                {type: k, ref: N, shapeFlag: X, patchFlag: ne} = p;
            let Z = m.nodeType;
            p.el = m,
            ne === -2 && (C = !1, p.dynamicChildren = null);
            let H = null;
            switch (k) {
            case It:
                Z !== 3 ? p.children === "" ? (c(p.el = s(""), i(m), m), H = m) : H = v() : (m.data !== p.children && (tt = !0, m.data = p.children), H = o(m));
                break;
            case pe:
                T(m) ? (H = o(m), I(p.el = m.content.firstChild, m, b)) : Z !== 8 || _ ? H = v() : H = o(m);
                break;
            case Nt:
                if (_ && (m = o(m), Z = m.nodeType), Z === 1 || Z === 3) {
                    H = m;
                    const q = !p.children.length;
                    for (let W = 0; W < p.staticCount; W++)
                        q && (p.children += H.nodeType === 1 ? H.outerHTML : H.data),
                        W === p.staticCount - 1 && (p.anchor = H),
                        H = o(H);
                    return _ ? o(H) : H
                } else
                    v();
                break;
            case he:
                _ ? H = E(m, p, b, w, A, C) : H = v();
                break;
            default:
                if (X & 1)
                    (Z !== 1 || p.type.toLowerCase() !== m.tagName.toLowerCase()) && !T(m) ? H = v() : H = d(m, p, b, w, A, C);
                else if (X & 6) {
                    p.slotScopeIds = A;
                    const q = i(m);
                    if (_ ? H = O(m) : cr(m) && m.data === "teleport start" ? H = O(m, m.data, "teleport end") : H = o(m), t(p, q, null, b, w, lr(q), C), Pt(p)) {
                        let W;
                        _ ? (W = re(he), W.anchor = H ? H.previousSibling : q.lastChild) : W = m.nodeType === 3 ? So("") : re("div"),
                        W.el = m,
                        p.component.subTree = W
                    }
                } else
                    X & 64 ? Z !== 8 ? H = v() : H = p.type.hydrate(m, p, b, w, A, C, e, g) : X & 128 && (H = p.type.hydrate(m, p, b, w, lr(i(m)), A, C, e, a))
            }
            return N != null && Ar(N, null, w, p), H
        },
        d = (m, p, b, w, A, C) => {
            C = C || !!p.dynamicChildren;
            const {type: _, props: v, patchFlag: k, shapeFlag: N, dirs: X, transition: ne} = p,
                Z = _ === "input" || _ === "option";
            if (Z || k !== -1) {
                X && $e(p, null, b, "created");
                let H = !1;
                if (T(m)) {
                    H = zl(w, ne) && b && b.vnode.props && b.vnode.props.appear;
                    const W = m.content.firstChild;
                    H && ne.beforeEnter(W),
                    I(W, m, b),
                    p.el = m = W
                }
                if (N & 16 && !(v && (v.innerHTML || v.textContent))) {
                    let W = g(m.firstChild, p, m, b, w, A, C);
                    for (; W;) {
                        tt = !0;
                        const Xe = W;
                        W = W.nextSibling,
                        l(Xe)
                    }
                } else
                    N & 8 && m.textContent !== p.children && (tt = !0, m.textContent = p.children);
                if (v)
                    if (Z || !C || k & 48)
                        for (const W in v)
                            (Z && (W.endsWith("value") || W === "indeterminate") || Dn(W) && !Jt(W) || W[0] === ".") && r(m, W, null, v[W], void 0, void 0, b);
                    else
                        v.onClick && r(m, "onClick", null, v.onClick, void 0, void 0, b);
                let q;
                (q = v && v.onVnodeBeforeMount) && ve(q, b, p),
                X && $e(p, null, b, "beforeMount"),
                ((q = v && v.onVnodeMounted) || X || H) && wl(() => {
                    q && ve(q, b, p),
                    H && ne.enter(m),
                    X && $e(p, null, b, "mounted")
                }, w)
            }
            return m.nextSibling
        },
        g = (m, p, b, w, A, C, _) => {
            _ = _ || !!p.dynamicChildren;
            const v = p.children,
                k = v.length;
            for (let N = 0; N < k; N++) {
                const X = _ ? v[N] : v[N] = xe(v[N]);
                if (m)
                    m = a(m, X, w, A, C, _);
                else {
                    if (X.type === It && !X.children)
                        continue;
                    tt = !0,
                    n(null, X, b, null, w, A, lr(b), C)
                }
            }
            return m
        },
        E = (m, p, b, w, A, C) => {
            const {slotScopeIds: _} = p;
            _ && (A = A ? A.concat(_) : _);
            const v = i(m),
                k = g(o(m), p, v, b, w, A, C);
            return k && cr(k) && k.data === "]" ? o(p.anchor = k) : (tt = !0, c(p.anchor = u("]"), v, k), k)
        },
        x = (m, p, b, w, A, C) => {
            if (tt = !0, p.el = null, C) {
                const k = O(m);
                for (;;) {
                    const N = o(m);
                    if (N && N !== k)
                        l(N);
                    else
                        break
                }
            }
            const _ = o(m),
                v = i(m);
            return l(m), n(null, p, v, _, b, w, lr(v), A), _
        },
        O = (m, p="[", b="]") => {
            let w = 0;
            for (; m;)
                if (m = o(m), m && cr(m) && (m.data === p && w++, m.data === b)) {
                    if (w === 0)
                        return o(m);
                    w--
                }
            return m
        },
        I = (m, p, b) => {
            const w = p.parentNode;
            w && w.replaceChild(m, p);
            let A = b;
            for (; A;)
                A.vnode.el === p && (A.vnode.el = A.subTree.el = m),
                A = A.parent
        },
        T = m => m.nodeType === 1 && m.tagName.toLowerCase() === "template";
    return [f, a]
}
const de = wl;
function ql(e) {
    return Jl(e)
}
function Gl(e) {
    return Jl(e, va)
}
function Jl(e, t) {
    const n = Ui();
    n.__VUE__ = !0;
    const {insert: r, remove: s, patchProp: o, createElement: i, createText: l, createComment: c, setText: u, setElementText: f, parentNode: a, nextSibling: d, setScopeId: g=we, insertStaticContent: E} = e,
        x = (h, y, S, R=null, P=null, F=null, B=void 0, M=null, V=!!y.dynamicChildren) => {
            if (h === y)
                return;
            h && !Fe(h, y) && (R = Qn(h), He(h, P, F, !0), h = null),
            y.patchFlag === -2 && (V = !1, y.dynamicChildren = null);
            const {type: L, ref: D, shapeFlag: U} = y;
            switch (L) {
            case It:
                O(h, y, S, R);
                break;
            case pe:
                I(h, y, S, R);
                break;
            case Nt:
                h == null && T(y, S, R, B);
                break;
            case he:
                N(h, y, S, R, P, F, B, M, V);
                break;
            default:
                U & 1 ? b(h, y, S, R, P, F, B, M, V) : U & 6 ? X(h, y, S, R, P, F, B, M, V) : (U & 64 || U & 128) && L.process(h, y, S, R, P, F, B, M, V, Wt)
            }
            D != null && P && Ar(D, h && h.ref, F, y || h, !y)
        },
        O = (h, y, S, R) => {
            if (h == null)
                r(y.el = l(y.children), S, R);
            else {
                const P = y.el = h.el;
                y.children !== h.children && u(P, y.children)
            }
        },
        I = (h, y, S, R) => {
            h == null ? r(y.el = c(y.children || ""), S, R) : y.el = h.el
        },
        T = (h, y, S, R) => {
            [h.el, h.anchor] = E(h.children, y, S, R, h.el, h.anchor)
        },
        m = ({el: h, anchor: y}, S, R) => {
            let P;
            for (; h && h !== y;)
                P = d(h),
                r(h, S, R),
                h = P;
            r(y, S, R)
        },
        p = ({el: h, anchor: y}) => {
            let S;
            for (; h && h !== y;)
                S = d(h),
                s(h),
                h = S;
            s(y)
        },
        b = (h, y, S, R, P, F, B, M, V) => {
            y.type === "svg" ? B = "svg" : y.type === "math" && (B = "mathml"),
            h == null ? w(y, S, R, P, F, B, M, V) : _(h, y, P, F, B, M, V)
        },
        w = (h, y, S, R, P, F, B, M) => {
            let V,
                L;
            const {props: D, shapeFlag: U, transition: j, dirs: Y} = h;
            if (V = h.el = i(h.type, F, D && D.is, D), U & 8 ? f(V, h.children) : U & 16 && C(h.children, V, null, R, P, bs(h, F), B, M), Y && $e(h, null, R, "created"), A(V, h, h.scopeId, B, R), D) {
                for (const ee in D)
                    ee !== "value" && !Jt(ee) && o(V, ee, null, D[ee], F, h.children, R, P, Ye);
                "value" in D && o(V, "value", null, D.value, F),
                (L = D.onVnodeBeforeMount) && ve(L, R, h)
            }
            Y && $e(h, null, R, "beforeMount");
            const J = zl(P, j);
            J && j.beforeEnter(V),
            r(V, y, S),
            ((L = D && D.onVnodeMounted) || J || Y) && de(() => {
                L && ve(L, R, h),
                J && j.enter(V),
                Y && $e(h, null, R, "mounted")
            }, P)
        },
        A = (h, y, S, R, P) => {
            if (S && g(h, S), R)
                for (let F = 0; F < R.length; F++)
                    g(h, R[F]);
            if (P) {
                let F = P.subTree;
                if (y === F) {
                    const B = P.vnode;
                    A(h, B, B.scopeId, B.slotScopeIds, P.parent)
                }
            }
        },
        C = (h, y, S, R, P, F, B, M, V=0) => {
            for (let L = V; L < h.length; L++) {
                const D = h[L] = M ? ct(h[L]) : xe(h[L]);
                x(null, D, y, S, R, P, F, B, M)
            }
        },
        _ = (h, y, S, R, P, F, B) => {
            const M = y.el = h.el;
            let {patchFlag: V, dynamicChildren: L, dirs: D} = y;
            V |= h.patchFlag & 16;
            const U = h.props || Q,
                j = y.props || Q;
            let Y;
            if (S && Ct(S, !1), (Y = j.onVnodeBeforeUpdate) && ve(Y, S, y, h), D && $e(y, h, S, "beforeUpdate"), S && Ct(S, !0), L ? v(h.dynamicChildren, L, M, S, R, bs(y, P), F) : B || W(h, y, M, null, S, R, bs(y, P), F, !1), V > 0) {
                if (V & 16)
                    k(M, y, U, j, S, R, P);
                else if (V & 2 && U.class !== j.class && o(M, "class", null, j.class, P), V & 4 && o(M, "style", U.style, j.style, P), V & 8) {
                    const J = y.dynamicProps;
                    for (let ee = 0; ee < J.length; ee++) {
                        const se = J[ee],
                            fe = U[se],
                            Ie = j[se];
                        (Ie !== fe || se === "value") && o(M, se, fe, Ie, P, h.children, S, R, Ye)
                    }
                }
                V & 1 && h.children !== y.children && f(M, y.children)
            } else
                !B && L == null && k(M, y, U, j, S, R, P);
            ((Y = j.onVnodeUpdated) || D) && de(() => {
                Y && ve(Y, S, y, h),
                D && $e(y, h, S, "updated")
            }, R)
        },
        v = (h, y, S, R, P, F, B) => {
            for (let M = 0; M < y.length; M++) {
                const V = h[M],
                    L = y[M],
                    D = V.el && (V.type === he || !Fe(V, L) || V.shapeFlag & 70) ? a(V.el) : S;
                x(V, L, D, null, R, P, F, B, !0)
            }
        },
        k = (h, y, S, R, P, F, B) => {
            if (S !== R) {
                if (S !== Q)
                    for (const M in S)
                        !Jt(M) && !(M in R) && o(h, M, S[M], null, B, y.children, P, F, Ye);
                for (const M in R) {
                    if (Jt(M))
                        continue;
                    const V = R[M],
                        L = S[M];
                    V !== L && M !== "value" && o(h, M, L, V, B, y.children, P, F, Ye)
                }
                "value" in R && o(h, "value", S.value, R.value, B)
            }
        },
        N = (h, y, S, R, P, F, B, M, V) => {
            const L = y.el = h ? h.el : l(""),
                D = y.anchor = h ? h.anchor : l("");
            let {patchFlag: U, dynamicChildren: j, slotScopeIds: Y} = y;
            Y && (M = M ? M.concat(Y) : Y),
            h == null ? (r(L, S, R), r(D, S, R), C(y.children || [], S, D, P, F, B, M, V)) : U > 0 && U & 64 && j && h.dynamicChildren ? (v(h.dynamicChildren, j, S, P, F, B, M), (y.key != null || P && y === P.subTree) && wo(h, y, !0)) : W(h, y, S, D, P, F, B, M, V)
        },
        X = (h, y, S, R, P, F, B, M, V) => {
            y.slotScopeIds = M,
            h == null ? y.shapeFlag & 512 ? P.ctx.activate(y, S, R, B, V) : ne(y, S, R, P, F, B, V) : Z(h, y, V)
        },
        ne = (h, y, S, R, P, F, B) => {
            const M = h.component = ic(h, R, P);
            if (Yn(h) && (M.ctx.renderer = Wt), cc(M), M.asyncDep) {
                if (P && P.registerDep(M, H), !h.el) {
                    const V = M.subTree = re(pe);
                    I(null, V, y, S)
                }
            } else
                H(M, h, y, S, P, F, B)
        },
        Z = (h, y, S) => {
            const R = y.component = h.component;
            if (Ef(h, y, S))
                if (R.asyncDep && !R.asyncResolved) {
                    q(R, y, S);
                    return
                } else
                    R.next = y,
                    hf(R.update),
                    R.effect.dirty = !0,
                    R.update();
            else
                y.el = h.el,
                R.vnode = y
        },
        H = (h, y, S, R, P, F, B) => {
            const M = () => {
                    if (h.isMounted) {
                        let {next: D, bu: U, u: j, parent: Y, vnode: J} = h;
                        {
                            const Ut = Ql(h);
                            if (Ut) {
                                D && (D.el = J.el, q(h, D, B)),
                                Ut.asyncDep.then(() => {
                                    h.isUnmounted || M()
                                });
                                return
                            }
                        }
                        let ee = D,
                            se;
                        Ct(h, !1),
                        D ? (D.el = J.el, q(h, D, B)) : D = J,
                        U && zt(U),
                        (se = D.props && D.props.onVnodeBeforeUpdate) && ve(se, Y, D, J),
                        Ct(h, !0);
                        const fe = pr(h),
                            Ie = h.subTree;
                        h.subTree = fe,
                        x(Ie, fe, a(Ie.el), Qn(Ie), h, P, F),
                        D.el = fe.el,
                        ee === null && ao(h, fe.el),
                        j && de(j, P),
                        (se = D.props && D.props.onVnodeUpdated) && de(() => ve(se, Y, D, J), P)
                    } else {
                        let D;
                        const {el: U, props: j} = y,
                            {bm: Y, m: J, parent: ee} = h,
                            se = Pt(y);
                        if (Ct(h, !1), Y && zt(Y), !se && (D = j && j.onVnodeBeforeMount) && ve(D, ee, y), Ct(h, !0), U && as) {
                            const fe = () => {
                                h.subTree = pr(h),
                                as(U, h.subTree, h, P, null)
                            };
                            se ? y.type.__asyncLoader().then(() => !h.isUnmounted && fe()) : fe()
                        } else {
                            const fe = h.subTree = pr(h);
                            x(null, fe, S, R, h, P, F),
                            y.el = fe.el
                        }
                        if (J && de(J, P), !se && (D = j && j.onVnodeMounted)) {
                            const fe = y;
                            de(() => ve(D, ee, fe), P)
                        }
                        (y.shapeFlag & 256 || ee && Pt(ee.vnode) && ee.vnode.shapeFlag & 256) && h.a && de(h.a, P),
                        h.isMounted = !0,
                        y = S = R = null
                    }
                },
                V = h.effect = new sn(M, we, () => Yr(L), h.scope),
                L = h.update = () => {
                    V.dirty && V.run()
                };
            L.id = h.uid,
            Ct(h, !0),
            L()
        },
        q = (h, y, S) => {
            y.component = h;
            const R = h.vnode.props;
            h.vnode = y,
            h.next = null,
            pa(h, y.props, R, S),
            ya(h, y.children, S),
            Ht(),
            Xo(h),
            Dt()
        },
        W = (h, y, S, R, P, F, B, M, V=!1) => {
            const L = h && h.children,
                D = h ? h.shapeFlag : 0,
                U = y.children,
                {patchFlag: j, shapeFlag: Y} = y;
            if (j > 0) {
                if (j & 128) {
                    zn(L, U, S, R, P, F, B, M, V);
                    return
                } else if (j & 256) {
                    Xe(L, U, S, R, P, F, B, M, V);
                    return
                }
            }
            Y & 8 ? (D & 16 && Ye(L, P, F), U !== L && f(S, U)) : D & 16 ? Y & 16 ? zn(L, U, S, R, P, F, B, M, V) : Ye(L, P, F, !0) : (D & 8 && f(S, ""), Y & 16 && C(U, S, R, P, F, B, M, V))
        },
        Xe = (h, y, S, R, P, F, B, M, V) => {
            h = h || qt,
            y = y || qt;
            const L = h.length,
                D = y.length,
                U = Math.min(L, D);
            let j;
            for (j = 0; j < U; j++) {
                const Y = y[j] = V ? ct(y[j]) : xe(y[j]);
                x(h[j], Y, S, null, P, F, B, M, V)
            }
            L > D ? Ye(h, P, F, !0, !1, U) : C(y, S, R, P, F, B, M, V, U)
        },
        zn = (h, y, S, R, P, F, B, M, V) => {
            let L = 0;
            const D = y.length;
            let U = h.length - 1,
                j = D - 1;
            for (; L <= U && L <= j;) {
                const Y = h[L],
                    J = y[L] = V ? ct(y[L]) : xe(y[L]);
                if (Fe(Y, J))
                    x(Y, J, S, null, P, F, B, M, V);
                else
                    break;
                L++
            }
            for (; L <= U && L <= j;) {
                const Y = h[U],
                    J = y[j] = V ? ct(y[j]) : xe(y[j]);
                if (Fe(Y, J))
                    x(Y, J, S, null, P, F, B, M, V);
                else
                    break;
                U--,
                j--
            }
            if (L > U) {
                if (L <= j) {
                    const Y = j + 1,
                        J = Y < D ? y[Y].el : R;
                    for (; L <= j;)
                        x(null, y[L] = V ? ct(y[L]) : xe(y[L]), S, J, P, F, B, M, V),
                        L++
                }
            } else if (L > j)
                for (; L <= U;)
                    He(h[L], P, F, !0),
                    L++;
            else {
                const Y = L,
                    J = L,
                    ee = new Map;
                for (L = J; L <= j; L++) {
                    const Se = y[L] = V ? ct(y[L]) : xe(y[L]);
                    Se.key != null && ee.set(Se.key, L)
                }
                let se,
                    fe = 0;
                const Ie = j - J + 1;
                let Ut = !1,
                    Io = 0;
                const pn = new Array(Ie);
                for (L = 0; L < Ie; L++)
                    pn[L] = 0;
                for (L = Y; L <= U; L++) {
                    const Se = h[L];
                    if (fe >= Ie) {
                        He(Se, P, F, !0);
                        continue
                    }
                    let De;
                    if (Se.key != null)
                        De = ee.get(Se.key);
                    else
                        for (se = J; se <= j; se++)
                            if (pn[se - J] === 0 && Fe(Se, y[se])) {
                                De = se;
                                break
                            }
                    De === void 0 ? He(Se, P, F, !0) : (pn[De - J] = L + 1, De >= Io ? Io = De : Ut = !0, x(Se, y[De], S, null, P, F, B, M, V), fe++)
                }
                const Fo = Ut ? wa(pn) : qt;
                for (se = Fo.length - 1, L = Ie - 1; L >= 0; L--) {
                    const Se = J + L,
                        De = y[Se],
                        ko = Se + 1 < D ? y[Se + 1].el : R;
                    pn[L] === 0 ? x(null, De, S, ko, P, F, B, M, V) : Ut && (se < 0 || L !== Fo[se] ? wt(De, S, ko, 2) : se--)
                }
            }
        },
        wt = (h, y, S, R, P=null) => {
            const {el: F, type: B, transition: M, children: V, shapeFlag: L} = h;
            if (L & 6) {
                wt(h.component.subTree, y, S, R);
                return
            }
            if (L & 128) {
                h.suspense.move(y, S, R);
                return
            }
            if (L & 64) {
                B.move(h, y, S, Wt);
                return
            }
            if (B === he) {
                r(F, y, S);
                for (let U = 0; U < V.length; U++)
                    wt(V[U], y, S, R);
                r(h.anchor, y, S);
                return
            }
            if (B === Nt) {
                m(h, y, S);
                return
            }
            if (R !== 2 && L & 1 && M)
                if (R === 0)
                    M.beforeEnter(F),
                    r(F, y, S),
                    de(() => M.enter(F), P);
                else {
                    const {leave: U, delayLeave: j, afterLeave: Y} = M,
                        J = () => r(F, y, S),
                        ee = () => {
                            U(F, () => {
                                J(),
                                Y && Y()
                            })
                        };
                    j ? j(F, J, ee) : ee()
                }
            else
                r(F, y, S)
        },
        He = (h, y, S, R=!1, P=!1) => {
            const {type: F, props: B, ref: M, children: V, dynamicChildren: L, shapeFlag: D, patchFlag: U, dirs: j} = h;
            if (M != null && Ar(M, null, S, h, !0), D & 256) {
                y.ctx.deactivate(h);
                return
            }
            const Y = D & 1 && j,
                J = !Pt(h);
            let ee;
            if (J && (ee = B && B.onVnodeBeforeUnmount) && ve(ee, y, h), D & 6)
                uu(h.component, S, R);
            else {
                if (D & 128) {
                    h.suspense.unmount(S, R);
                    return
                }
                Y && $e(h, null, y, "beforeUnmount"),
                D & 64 ? h.type.remove(h, y, S, P, Wt, R) : L && (F !== he || U > 0 && U & 64) ? Ye(L, y, S, !1, !0) : (F === he && U & 384 || !P && D & 16) && Ye(V, y, S),
                R && Lo(h)
            }
            (J && (ee = B && B.onVnodeUnmounted) || Y) && de(() => {
                ee && ve(ee, y, h),
                Y && $e(h, null, y, "unmounted")
            }, S)
        },
        Lo = h => {
            const {type: y, el: S, anchor: R, transition: P} = h;
            if (y === he) {
                cu(S, R);
                return
            }
            if (y === Nt) {
                p(h);
                return
            }
            const F = () => {
                s(S),
                P && !P.persisted && P.afterLeave && P.afterLeave()
            };
            if (h.shapeFlag & 1 && P && !P.persisted) {
                const {leave: B, delayLeave: M} = P,
                    V = () => B(S, F);
                M ? M(h.el, F, V) : V()
            } else
                F()
        },
        cu = (h, y) => {
            let S;
            for (; h !== y;)
                S = d(h),
                s(h),
                h = S;
            s(y)
        },
        uu = (h, y, S) => {
            const {bum: R, scope: P, update: F, subTree: B, um: M} = h;
            R && zt(R),
            P.stop(),
            F && (F.active = !1, He(B, h, y, S)),
            M && de(M, y),
            de(() => {
                h.isUnmounted = !0
            }, y),
            y && y.pendingBranch && !y.isUnmounted && h.asyncDep && !h.asyncResolved && h.suspenseId === y.pendingId && (y.deps--, y.deps === 0 && y.resolve())
        },
        Ye = (h, y, S, R=!1, P=!1, F=0) => {
            for (let B = F; B < h.length; B++)
                He(h[B], y, S, R, P)
        },
        Qn = h => h.shapeFlag & 6 ? Qn(h.component.subTree) : h.shapeFlag & 128 ? h.suspense.next() : d(h.anchor || h.el);
    let us = !1;
    const Mo = (h, y, S) => {
            h == null ? y._vnode && He(y._vnode, null, null, !0) : x(y._vnode || null, h, y, null, null, null, S),
            us || (us = !0, Xo(), Tr(), us = !1),
            y._vnode = h
        },
        Wt = {
            p: x,
            um: He,
            m: wt,
            r: Lo,
            mt: ne,
            mc: C,
            pc: W,
            pbc: v,
            n: Qn,
            o: e
        };
    let fs,
        as;
    return t && ([fs, as] = t(Wt)), {
        render: Mo,
        hydrate: fs,
        createApp: da(Mo, fs)
    }
}
function bs({type: e, props: t}, n) {
    return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n
}
function Ct({effect: e, update: t}, n) {
    e.allowRecurse = t.allowRecurse = n
}
function zl(e, t) {
    return (!e || e && !e.pendingBranch) && t && !t.persisted
}
function wo(e, t, n=!1) {
    const r = e.children,
        s = t.children;
    if ($(r) && $(s))
        for (let o = 0; o < r.length; o++) {
            const i = r[o];
            let l = s[o];
            l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = s[o] = ct(s[o]), l.el = i.el), n || wo(i, l)),
            l.type === It && (l.el = i.el)
        }
}
function wa(e) {
    const t = e.slice(),
        n = [0];
    let r,
        s,
        o,
        i,
        l;
    const c = e.length;
    for (r = 0; r < c; r++) {
        const u = e[r];
        if (u !== 0) {
            if (s = n[n.length - 1], e[s] < u) {
                t[r] = s,
                n.push(r);
                continue
            }
            for (o = 0, i = n.length - 1; o < i;)
                l = o + i >> 1,
                e[n[l]] < u ? o = l + 1 : i = l;
            u < e[n[o]] && (o > 0 && (t[r] = n[o - 1]), n[o] = r)
        }
    }
    for (o = n.length, i = n[o - 1]; o-- > 0;)
        n[o] = i,
        i = t[i];
    return n
}
function Ql(e) {
    const t = e.subTree.component;
    if (t)
        return t.asyncDep && !t.asyncResolved ? t : Ql(t)
}
const Ea = e => e.__isTeleport,
    En = e => e && (e.disabled || e.disabled === ""),
    si = e => typeof SVGElement < "u" && e instanceof SVGElement,
    oi = e => typeof MathMLElement == "function" && e instanceof MathMLElement,
    Fs = (e, t) => {
        const n = e && e.to;
        return ie(n) ? t ? t(n) : null : n
    },
    Ca = {
        name: "Teleport",
        __isTeleport: !0,
        process(e, t, n, r, s, o, i, l, c, u) {
            const {mc: f, pc: a, pbc: d, o: {insert: g, querySelector: E, createText: x, createComment: O}} = u,
                I = En(t.props);
            let {shapeFlag: T, children: m, dynamicChildren: p} = t;
            if (e == null) {
                const b = t.el = x(""),
                    w = t.anchor = x("");
                g(b, n, r),
                g(w, n, r);
                const A = t.target = Fs(t.props, E),
                    C = t.targetAnchor = x("");
                A && (g(C, A), i === "svg" || si(A) ? i = "svg" : (i === "mathml" || oi(A)) && (i = "mathml"));
                const _ = (v, k) => {
                    T & 16 && f(m, v, k, s, o, i, l, c)
                };
                I ? _(n, w) : A && _(A, C)
            } else {
                t.el = e.el;
                const b = t.anchor = e.anchor,
                    w = t.target = e.target,
                    A = t.targetAnchor = e.targetAnchor,
                    C = En(e.props),
                    _ = C ? n : w,
                    v = C ? b : A;
                if (i === "svg" || si(w) ? i = "svg" : (i === "mathml" || oi(w)) && (i = "mathml"), p ? (d(e.dynamicChildren, p, _, s, o, i, l), wo(e, t, !0)) : c || a(e, t, _, v, s, o, i, l, !1), I)
                    C ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : ur(t, n, b, u, 1);
                else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
                    const k = t.target = Fs(t.props, E);
                    k && ur(t, k, null, u, 0)
                } else
                    C && ur(t, w, A, u, 1)
            }
            ec(t)
        },
        remove(e, t, n, r, {um: s, o: {remove: o}}, i) {
            const {shapeFlag: l, children: c, anchor: u, targetAnchor: f, target: a, props: d} = e;
            if (a && o(f), i && o(u), l & 16) {
                const g = i || !En(d);
                for (let E = 0; E < c.length; E++) {
                    const x = c[E];
                    s(x, t, n, g, !!x.dynamicChildren)
                }
            }
        },
        move: ur,
        hydrate: Sa
    };
function ur(e, t, n, {o: {insert: r}, m: s}, o=2) {
    o === 0 && r(e.targetAnchor, t, n);
    const {el: i, anchor: l, shapeFlag: c, children: u, props: f} = e,
        a = o === 2;
    if (a && r(i, t, n), (!a || En(f)) && c & 16)
        for (let d = 0; d < u.length; d++)
            s(u[d], t, n, 2);
    a && r(l, t, n)
}
function Sa(e, t, n, r, s, o, {o: {nextSibling: i, parentNode: l, querySelector: c}}, u) {
    const f = t.target = Fs(t.props, c);
    if (f) {
        const a = f._lpa || f.firstChild;
        if (t.shapeFlag & 16)
            if (En(t.props))
                t.anchor = u(i(e), t, l(e), n, r, s, o),
                t.targetAnchor = a;
            else {
                t.anchor = i(e);
                let d = a;
                for (; d;)
                    if (d = i(d), d && d.nodeType === 8 && d.data === "teleport anchor") {
                        t.targetAnchor = d,
                        f._lpa = t.targetAnchor && i(t.targetAnchor);
                        break
                    }
                u(a, t, f, n, r, s, o)
            }
        ec(t)
    }
    return t.anchor && i(t.anchor)
}
const Zl = Ca;
function ec(e) {
    const t = e.ctx;
    if (t && t.ut) {
        let n = e.children[0].el;
        for (; n && n !== e.targetAnchor;)
            n.nodeType === 1 && n.setAttribute("data-v-owner", t.uid),
            n = n.nextSibling;
        t.ut()
    }
}
const he = Symbol.for("v-fgt"),
    It = Symbol.for("v-txt"),
    pe = Symbol.for("v-cmt"),
    Nt = Symbol.for("v-stc"),
    Cn = [];
let Ee = null;
function es(e=!1) {
    Cn.push(Ee = e ? null : [])
}
function tc() {
    Cn.pop(),
    Ee = Cn[Cn.length - 1] || null
}
let Ft = 1;
function ks(e) {
    Ft += e
}
function nc(e) {
    return e.dynamicChildren = Ft > 0 ? Ee || qt : null, tc(), Ft > 0 && Ee && Ee.push(e), e
}
function Ta(e, t, n, r, s, o) {
    return nc(Co(e, t, n, r, s, o, !0))
}
function Eo(e, t, n, r, s) {
    return nc(re(e, t, n, r, s, !0))
}
function Qe(e) {
    return e ? e.__v_isVNode === !0 : !1
}
function Fe(e, t) {
    return e.type === t.type && e.key === t.key
}
function xa(e) {}
const ts = "__vInternal",
    rc = ({key: e}) => e ?? null,
    gr = ({ref: e, ref_key: t, ref_for: n}) => (typeof e == "number" && (e = "" + e), e != null ? ie(e) || le(e) || K(e) ? {
        i: ce,
        r: e,
        k: t,
        f: !!n
    } : e : null);
function Co(e, t=null, n=null, r=0, s=null, o=e === he ? 0 : 1, i=!1, l=!1) {
    const c = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e,
        props: t,
        key: t && rc(t),
        ref: t && gr(t),
        scopeId: Gr,
        slotScopeIds: null,
        children: n,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag: o,
        patchFlag: r,
        dynamicProps: s,
        dynamicChildren: null,
        appContext: null,
        ctx: ce
    };
    return l ? (To(c, n), o & 128 && e.normalize(c)) : n && (c.shapeFlag |= ie(n) ? 8 : 16), Ft > 0 && !i && Ee && (c.patchFlag > 0 || o & 6) && c.patchFlag !== 32 && Ee.push(c), c
}
const re = Aa;
function Aa(e, t=null, n=null, r=0, s=null, o=!1) {
    if ((!e || e === _l) && (e = pe), Qe(e)) {
        const l = Ue(e, t, !0);
        return n && To(l, n), Ft > 0 && !o && Ee && (l.shapeFlag & 6 ? Ee[Ee.indexOf(e)] = l : Ee.push(l)), l.patchFlag |= -2, l
    }
    if (ka(e) && (e = e.__vccOpts), t) {
        t = sc(t);
        let {class: l, style: c} = t;
        l && !ie(l) && (t.class = Wn(l)),
        te(c) && (Xr(c) && !$(c) && (c = oe({}, c)), t.style = jn(c))
    }
    const i = ie(e) ? 1 : vl(e) ? 128 : Ea(e) ? 64 : te(e) ? 4 : K(e) ? 2 : 0;
    return Co(e, t, n, r, s, i, o, !0)
}
function sc(e) {
    return e ? Xr(e) || ts in e ? oe({}, e) : e : null
}
function Ue(e, t, n=!1) {
    const {props: r, ref: s, patchFlag: o, children: i} = e,
        l = t ? oc(r || {}, t) : r;
    return {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e.type,
        props: l,
        key: l && rc(l),
        ref: t && t.ref ? n && s ? $(s) ? s.concat(gr(t)) : [s, gr(t)] : gr(t) : s,
        scopeId: e.scopeId,
        slotScopeIds: e.slotScopeIds,
        children: i,
        target: e.target,
        targetAnchor: e.targetAnchor,
        staticCount: e.staticCount,
        shapeFlag: e.shapeFlag,
        patchFlag: t && e.type !== he ? o === -1 ? 16 : o | 16 : o,
        dynamicProps: e.dynamicProps,
        dynamicChildren: e.dynamicChildren,
        appContext: e.appContext,
        dirs: e.dirs,
        transition: e.transition,
        component: e.component,
        suspense: e.suspense,
        ssContent: e.ssContent && Ue(e.ssContent),
        ssFallback: e.ssFallback && Ue(e.ssFallback),
        el: e.el,
        anchor: e.anchor,
        ctx: e.ctx,
        ce: e.ce
    }
}
function So(e=" ", t=0) {
    return re(It, null, e, t)
}
function Oa(e, t) {
    const n = re(Nt, null, e);
    return n.staticCount = t, n
}
function Ra(e="", t=!1) {
    return t ? (es(), Eo(pe, null, e)) : re(pe, null, e)
}
function xe(e) {
    return e == null || typeof e == "boolean" ? re(pe) : $(e) ? re(he, null, e.slice()) : typeof e == "object" ? ct(e) : re(It, null, String(e))
}
function ct(e) {
    return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ue(e)
}
function To(e, t) {
    let n = 0;
    const {shapeFlag: r} = e;
    if (t == null)
        t = null;
    else if ($(t))
        n = 16;
    else if (typeof t == "object")
        if (r & 65) {
            const s = t.default;
            s && (s._c && (s._d = !1), To(e, s()), s._c && (s._d = !0));
            return
        } else {
            n = 32;
            const s = t._;
            !s && !(ts in t) ? t._ctx = ce : s === 3 && ce && (ce.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024))
        }
    else
        K(t) ? (t = {
            default: t,
            _ctx: ce
        }, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [So(t)]) : n = 8);
    e.children = t,
    e.shapeFlag |= n
}
function oc(...e) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
        const r = e[n];
        for (const s in r)
            if (s === "class")
                t.class !== r.class && (t.class = Wn([t.class, r.class]));
            else if (s === "style")
                t.style = jn([t.style, r.style]);
            else if (Dn(s)) {
                const o = t[s],
                    i = r[s];
                i && o !== i && !($(o) && o.includes(i)) && (t[s] = o ? [].concat(o, i) : i)
            } else
                s !== "" && (t[s] = r[s])
    }
    return t
}
function ve(e, t, n, r=null) {
    Oe(e, t, 7, [n, r])
}
const Pa = Dl();
let Na = 0;
function ic(e, t, n) {
    const r = e.type,
        s = (t ? t.appContext : e.appContext) || Pa,
        o = {
            uid: Na++,
            vnode: e,
            type: r,
            parent: t,
            appContext: s,
            root: null,
            next: null,
            subTree: null,
            effect: null,
            update: null,
            scope: new eo(!0),
            render: null,
            proxy: null,
            exposed: null,
            exposeProxy: null,
            withProxy: null,
            provides: t ? t.provides : Object.create(s.provides),
            accessCache: null,
            renderCache: [],
            components: null,
            directives: null,
            propsOptions: Ul(r, s),
            emitsOptions: bl(r, s),
            emit: null,
            emitted: null,
            propsDefaults: Q,
            inheritAttrs: r.inheritAttrs,
            ctx: Q,
            data: Q,
            props: Q,
            attrs: Q,
            slots: Q,
            refs: Q,
            setupState: Q,
            setupContext: null,
            attrsProxy: null,
            slotsProxy: null,
            suspense: n,
            suspenseId: n ? n.pendingId : 0,
            asyncDep: null,
            asyncResolved: !1,
            isMounted: !1,
            isUnmounted: !1,
            isDeactivated: !1,
            bc: null,
            c: null,
            bm: null,
            m: null,
            bu: null,
            u: null,
            um: null,
            bum: null,
            da: null,
            a: null,
            rtg: null,
            rtc: null,
            ec: null,
            sp: null
        };
    return o.ctx = {
        _: o
    }, o.root = t ? t.root : o, o.emit = gf.bind(null, o), e.ce && e.ce(o), o
}
let ue = null;
const ae = () => ue || ce;
let Or,
    Vs;
{
    const e = Ui(),
        t = (n, r) => {
            let s;
            return (s = e[n]) || (s = e[n] = []), s.push(r), o => {
                s.length > 1 ? s.forEach(i => i(o)) : s[0](o)
            }
        };
    Or = t("__VUE_INSTANCE_SETTERS__", n => ue = n),
    Vs = t("__VUE_SSR_SETTERS__", n => qn = n)
}
const kt = e => {
        const t = ue;
        return Or(e), e.scope.on(), () => {
            e.scope.off(),
            Or(t)
        }
    },
    Bs = () => {
        ue && ue.scope.off(),
        Or(null)
    };
function lc(e) {
    return e.vnode.shapeFlag & 4
}
let qn = !1;
function cc(e, t=!1) {
    t && Vs(t);
    const {props: n, children: r} = e.vnode,
        s = lc(e);
    ha(e, n, s, t),
    ma(e, r);
    const o = s ? La(e, t) : void 0;
    return t && Vs(!1), o
}
function La(e, t) {
    const n = e.type;
    e.accessCache = Object.create(null),
    e.proxy = $t(new Proxy(e.ctx, Ns));
    const {setup: r} = n;
    if (r) {
        const s = e.setupContext = r.length > 1 ? fc(e) : null,
            o = kt(e);
        Ht();
        const i = ze(r, e, 0, [e.props, s]);
        if (Dt(), o(), Qs(i)) {
            if (i.then(Bs, Bs), t)
                return i.then(l => {
                    Hs(e, l, t)
                }).catch(l => {
                    yt(l, e, 0)
                });
            e.asyncDep = i
        } else
            Hs(e, i, t)
    } else
        uc(e, t)
}
function Hs(e, t, n) {
    K(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : te(t) && (e.setupState = co(t)),
    uc(e, n)
}
let Rr,
    Ds;
function Ma(e) {
    Rr = e,
    Ds = t => {
        t.render._rc && (t.withProxy = new Proxy(t.ctx, Xf))
    }
}
const Ia = () => !Rr;
function uc(e, t, n) {
    const r = e.type;
    if (!e.render) {
        if (!t && Rr && !r.render) {
            const s = r.template || _o(e).template;
            if (s) {
                const {isCustomElement: o, compilerOptions: i} = e.appContext.config,
                    {delimiters: l, compilerOptions: c} = r,
                    u = oe(oe({
                        isCustomElement: o,
                        delimiters: l
                    }, i), c);
                r.render = Rr(s, u)
            }
        }
        e.render = r.render || we,
        Ds && Ds(e)
    }
    {
        const s = kt(e);
        Ht();
        try {
            ia(e)
        } finally {
            Dt(),
            s()
        }
    }
}
function Fa(e) {
    return e.attrsProxy || (e.attrsProxy = new Proxy(e.attrs, {
            get(t, n) {
                return Ce(e, "get", "$attrs"), t[n]
            }
        }))
}
function fc(e) {
    const t = n => {
        e.exposed = n || {}
    };
    return {
        get attrs() {
            return Fa(e)
        },
        slots: e.slots,
        emit: e.emit,
        expose: t
    }
}
function ns(e) {
    if (e.exposed)
        return e.exposeProxy || (e.exposeProxy = new Proxy(co($t(e.exposed)), {
                get(t, n) {
                    if (n in t)
                        return t[n];
                    if (n in wn)
                        return wn[n](e)
                },
                has(t, n) {
                    return n in t || n in wn
                }
            }))
}
function $s(e, t=!0) {
    return K(e) ? e.displayName || e.name : e.name || t && e.__name
}
function ka(e) {
    return K(e) && "__vccOpts" in e
}
const be = (e, t) => zu(e, t, qn);
function Va(e, t, n=Q) {
    const r = ae(),
        s = _e(t),
        o = Ae(t),
        i = fl((c, u) => {
            let f;
            return Tl(() => {
                const a = e[t];
                ke(f, a) && (f = a, u())
            }), {
                get() {
                    return c(), n.get ? n.get(f) : f
                },
                set(a) {
                    const d = r.vnode.props;
                    !(d && (t in d || s in d || o in d) && (`onUpdate:${t}` in d || `onUpdate:${s}` in d || `onUpdate:${o}` in d)) && ke(a, f) && (f = a, u()),
                    r.emit(`update:${t}`, n.set ? n.set(a) : a)
                }
            }
        }),
        l = t === "modelValue" ? "modelModifiers" : `${t}Modifiers`;
    return i[Symbol.iterator] = () => {
        let c = 0;
        return {
            next() {
                return c < 2 ? {
                    value: c++ ? e[l] || {} : i,
                    done: !1
                } : {
                    done: !0
                }
            }
        }
    }, i
}
function Gn(e, t, n) {
    const r = arguments.length;
    return r === 2 ? te(t) && !$(t) ? Qe(t) ? re(e, null, [t]) : re(e, t) : re(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && Qe(n) && (n = [n]), re(e, t, n))
}
function Ba() {}
function Ha(e, t, n, r) {
    const s = n[r];
    if (s && ac(s, e))
        return s;
    const o = t();
    return o.memo = e.slice(), n[r] = o
}
function ac(e, t) {
    const n = e.memo;
    if (n.length != t.length)
        return !1;
    for (let r = 0; r < n.length; r++)
        if (ke(n[r], t[r]))
            return !1;
    return Ft > 0 && Ee && Ee.push(e), !0
}
const dc = "3.4.21",
    Da = we,
    $a = ff,
    ja = Xt,
    Wa = yl,
    Ua = {
        createComponentInstance: ic,
        setupComponent: cc,
        renderComponentRoot: pr,
        setCurrentRenderingInstance: In,
        isVNode: Qe,
        normalizeVNode: xe
    },
    Ka = Ua,
    Xa = null,
    Ya = null,
    qa = null;
const Ga = "http://www.w3.org/2000/svg",
    Ja = "http://www.w3.org/1998/Math/MathML",
    ut = typeof document < "u" ? document : null,
    ii = ut && ut.createElement("template"),
    za = {
        insert: (e, t, n) => {
            t.insertBefore(e, n || null)
        },
        remove: e => {
            const t = e.parentNode;
            t && t.removeChild(e)
        },
        createElement: (e, t, n, r) => {
            const s = t === "svg" ? ut.createElementNS(Ga, e) : t === "mathml" ? ut.createElementNS(Ja, e) : ut.createElement(e, n ? {
                is: n
            } : void 0);
            return e === "select" && r && r.multiple != null && s.setAttribute("multiple", r.multiple), s
        },
        createText: e => ut.createTextNode(e),
        createComment: e => ut.createComment(e),
        setText: (e, t) => {
            e.nodeValue = t
        },
        setElementText: (e, t) => {
            e.textContent = t
        },
        parentNode: e => e.parentNode,
        nextSibling: e => e.nextSibling,
        querySelector: e => ut.querySelector(e),
        setScopeId(e, t) {
            e.setAttribute(t, "")
        },
        insertStaticContent(e, t, n, r, s, o) {
            const i = n ? n.previousSibling : t.lastChild;
            if (s && (s === o || s.nextSibling))
                for (; t.insertBefore(s.cloneNode(!0), n), !(s === o || !(s = s.nextSibling));)
                    ;
            else {
                ii.innerHTML = r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e;
                const l = ii.content;
                if (r === "svg" || r === "mathml") {
                    const c = l.firstChild;
                    for (; c.firstChild;)
                        l.appendChild(c.firstChild);
                    l.removeChild(c)
                }
                t.insertBefore(l, n)
            }
            return [i ? i.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild]
        }
    },
    nt = "transition",
    gn = "animation",
    ln = Symbol("_vtc"),
    xo = (e, {slots: t}) => Gn(Al, pc(e), t);
xo.displayName = "Transition";
const hc = {
        name: String,
        type: String,
        css: {
            type: Boolean,
            default: !0
        },
        duration: [String, Number, Object],
        enterFromClass: String,
        enterActiveClass: String,
        enterToClass: String,
        appearFromClass: String,
        appearActiveClass: String,
        appearToClass: String,
        leaveFromClass: String,
        leaveActiveClass: String,
        leaveToClass: String
    },
    Qa = xo.props = oe({}, yo, hc),
    St = (e, t=[]) => {
        $(e) ? e.forEach(n => n(...t)) : e && e(...t)
    },
    li = e => e ? $(e) ? e.some(t => t.length > 1) : e.length > 1 : !1;
function pc(e) {
    const t = {};
    for (const N in e)
        N in hc || (t[N] = e[N]);
    if (e.css === !1)
        return t;
    const {name: n="v", type: r, duration: s, enterFromClass: o=`${n}-enter-from`, enterActiveClass: i=`${n}-enter-active`, enterToClass: l=`${n}-enter-to`, appearFromClass: c=o, appearActiveClass: u=i, appearToClass: f=l, leaveFromClass: a=`${n}-leave-from`, leaveActiveClass: d=`${n}-leave-active`, leaveToClass: g=`${n}-leave-to`} = e,
        E = Za(s),
        x = E && E[0],
        O = E && E[1],
        {onBeforeEnter: I, onEnter: T, onEnterCancelled: m, onLeave: p, onLeaveCancelled: b, onBeforeAppear: w=I, onAppear: A=T, onAppearCancelled: C=m} = t,
        _ = (N, X, ne) => {
            st(N, X ? f : l),
            st(N, X ? u : i),
            ne && ne()
        },
        v = (N, X) => {
            N._isLeaving = !1,
            st(N, a),
            st(N, g),
            st(N, d),
            X && X()
        },
        k = N => (X, ne) => {
            const Z = N ? A : T,
                H = () => _(X, N, ne);
            St(Z, [X, H]),
            ci(() => {
                st(X, N ? c : o),
                qe(X, N ? f : l),
                li(Z) || ui(X, r, x, H)
            })
        };
    return oe(t, {
        onBeforeEnter(N) {
            St(I, [N]),
            qe(N, o),
            qe(N, i)
        },
        onBeforeAppear(N) {
            St(w, [N]),
            qe(N, c),
            qe(N, u)
        },
        onEnter: k(!1),
        onAppear: k(!0),
        onLeave(N, X) {
            N._isLeaving = !0;
            const ne = () => v(N, X);
            qe(N, a),
            mc(),
            qe(N, d),
            ci(() => {
                N._isLeaving && (st(N, a), qe(N, g), li(p) || ui(N, r, O, ne))
            }),
            St(p, [N, ne])
        },
        onEnterCancelled(N) {
            _(N, !1),
            St(m, [N])
        },
        onAppearCancelled(N) {
            _(N, !0),
            St(C, [N])
        },
        onLeaveCancelled(N) {
            v(N),
            St(b, [N])
        }
    })
}
function Za(e) {
    if (e == null)
        return null;
    if (te(e))
        return [_s(e.enter), _s(e.leave)];
    {
        const t = _s(e);
        return [t, t]
    }
}
function _s(e) {
    return Er(e)
}
function qe(e, t) {
    t.split(/\s+/).forEach(n => n && e.classList.add(n)),
    (e[ln] || (e[ln] = new Set)).add(t)
}
function st(e, t) {
    t.split(/\s+/).forEach(r => r && e.classList.remove(r));
    const n = e[ln];
    n && (n.delete(t), n.size || (e[ln] = void 0))
}
function ci(e) {
    requestAnimationFrame(() => {
        requestAnimationFrame(e)
    })
}
let ed = 0;
function ui(e, t, n, r) {
    const s = e._endId = ++ed,
        o = () => {
            s === e._endId && r()
        };
    if (n)
        return setTimeout(o, n);
    const {type: i, timeout: l, propCount: c} = gc(e, t);
    if (!i)
        return r();
    const u = i + "end";
    let f = 0;
    const a = () => {
            e.removeEventListener(u, d),
            o()
        },
        d = g => {
            g.target === e && ++f >= c && a()
        };
    setTimeout(() => {
        f < c && a()
    }, l + 1),
    e.addEventListener(u, d)
}
function gc(e, t) {
    const n = window.getComputedStyle(e),
        r = E => (n[E] || "").split(", "),
        s = r(`${nt}Delay`),
        o = r(`${nt}Duration`),
        i = fi(s, o),
        l = r(`${gn}Delay`),
        c = r(`${gn}Duration`),
        u = fi(l, c);
    let f = null,
        a = 0,
        d = 0;
    t === nt ? i > 0 && (f = nt, a = i, d = o.length) : t === gn ? u > 0 && (f = gn, a = u, d = c.length) : (a = Math.max(i, u), f = a > 0 ? i > u ? nt : gn : null, d = f ? f === nt ? o.length : c.length : 0);
    const g = f === nt && /\b(transform|all)(,|$)/.test(r(`${nt}Property`).toString());
    return {
        type: f,
        timeout: a,
        propCount: d,
        hasTransform: g
    }
}
function fi(e, t) {
    for (; e.length < t.length;)
        e = e.concat(e);
    return Math.max(...t.map((n, r) => ai(n) + ai(e[r])))
}
function ai(e) {
    return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3
}
function mc() {
    return document.body.offsetHeight
}
function td(e, t, n) {
    const r = e[ln];
    r && (t = (t ? [t, ...r] : [...r]).join(" ")),
    t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t
}
const Pr = Symbol("_vod"),
    yc = Symbol("_vsh"),
    bc = {
        beforeMount(e, {value: t}, {transition: n}) {
            e[Pr] = e.style.display === "none" ? "" : e.style.display,
            n && t ? n.beforeEnter(e) : mn(e, t)
        },
        mounted(e, {value: t}, {transition: n}) {
            n && t && n.enter(e)
        },
        updated(e, {value: t, oldValue: n}, {transition: r}) {
            !t != !n && (r ? t ? (r.beforeEnter(e), mn(e, !0), r.enter(e)) : r.leave(e, () => {
                mn(e, !1)
            }) : mn(e, t))
        },
        beforeUnmount(e, {value: t}) {
            mn(e, t)
        }
    };
function mn(e, t) {
    e.style.display = t ? e[Pr] : "none",
    e[yc] = !t
}
function nd() {
    bc.getSSRProps = ({value: e}) => {
        if (!e)
            return {
                style: {
                    display: "none"
                }
            }
    }
}
const _c = Symbol("");
function rd(e) {
    const t = ae();
    if (!t)
        return;
    const n = t.ut = (s=e(t.proxy)) => {
            Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach(o => Ws(o, s))
        },
        r = () => {
            const s = e(t.proxy);
            js(t.subTree, s),
            n(s)
        };
    Sl(r),
    _t(() => {
        const s = new MutationObserver(r);
        s.observe(t.subTree.el.parentNode, {
            childList: !0
        }),
        hn(() => s.disconnect())
    })
}
function js(e, t) {
    if (e.shapeFlag & 128) {
        const n = e.suspense;
        e = n.activeBranch,
        n.pendingBranch && !n.isHydrating && n.effects.push(() => {
            js(n.activeBranch, t)
        })
    }
    for (; e.component;)
        e = e.component.subTree;
    if (e.shapeFlag & 1 && e.el)
        Ws(e.el, t);
    else if (e.type === he)
        e.children.forEach(n => js(n, t));
    else if (e.type === Nt) {
        let {el: n, anchor: r} = e;
        for (; n && (Ws(n, t), n !== r);)
            n = n.nextSibling
    }
}
function Ws(e, t) {
    if (e.nodeType === 1) {
        const n = e.style;
        let r = "";
        for (const s in t)
            n.setProperty(`--${s}`, t[s]),
            r += `--${s}: ${t[s]};`;
        n[_c] = r
    }
}
const sd = /(^|;)\s*display\s*:/;
function od(e, t, n) {
    const r = e.style,
        s = ie(n);
    let o = !1;
    if (n && !s) {
        if (t)
            if (ie(t))
                for (const i of t.split(";")) {
                    const l = i.slice(0, i.indexOf(":")).trim();
                    n[l] == null && mr(r, l, "")
                }
            else
                for (const i in t)
                    n[i] == null && mr(r, i, "");
        for (const i in n)
            i === "display" && (o = !0),
            mr(r, i, n[i])
    } else if (s) {
        if (t !== n) {
            const i = r[_c];
            i && (n += ";" + i),
            r.cssText = n,
            o = sd.test(n)
        }
    } else
        t && e.removeAttribute("style");
    Pr in e && (e[Pr] = o ? r.display : "", e[yc] && (r.display = "none"))
}
const di = /\s*!important$/;
function mr(e, t, n) {
    if ($(n))
        n.forEach(r => mr(e, t, r));
    else if (n == null && (n = ""), t.startsWith("--"))
        e.setProperty(t, n);
    else {
        const r = id(e, t);
        di.test(n) ? e.setProperty(Ae(r), n.replace(di, ""), "important") : e[r] = n
    }
}
const hi = ["Webkit", "Moz", "ms"],
    vs = {};
function id(e, t) {
    const n = vs[t];
    if (n)
        return n;
    let r = _e(t);
    if (r !== "filter" && r in e)
        return vs[t] = r;
    r = $n(r);
    for (let s = 0; s < hi.length; s++) {
        const o = hi[s] + r;
        if (o in e)
            return vs[t] = o
    }
    return t
}
const pi = "http://www.w3.org/1999/xlink";
function ld(e, t, n, r, s) {
    if (r && t.startsWith("xlink:"))
        n == null ? e.removeAttributeNS(pi, t.slice(6, t.length)) : e.setAttributeNS(pi, t, n);
    else {
        const o = xu(t);
        n == null || o && !Ki(n) ? e.removeAttribute(t) : e.setAttribute(t, o ? "" : n)
    }
}
function cd(e, t, n, r, s, o, i) {
    if (t === "innerHTML" || t === "textContent") {
        r && i(r, s, o),
        e[t] = n ?? "";
        return
    }
    const l = e.tagName;
    if (t === "value" && l !== "PROGRESS" && !l.includes("-")) {
        const u = l === "OPTION" ? e.getAttribute("value") || "" : e.value,
            f = n ?? "";
        (u !== f || !("_value" in e)) && (e.value = f),
        n == null && e.removeAttribute(t),
        e._value = n;
        return
    }
    let c = !1;
    if (n === "" || n == null) {
        const u = typeof e[t];
        u === "boolean" ? n = Ki(n) : n == null && u === "string" ? (n = "", c = !0) : u === "number" && (n = 0, c = !0)
    }
    try {
        e[t] = n
    } catch {}
    c && e.removeAttribute(t)
}
function Ge(e, t, n, r) {
    e.addEventListener(t, n, r)
}
function ud(e, t, n, r) {
    e.removeEventListener(t, n, r)
}
const gi = Symbol("_vei");
function fd(e, t, n, r, s=null) {
    const o = e[gi] || (e[gi] = {}),
        i = o[t];
    if (r && i)
        i.value = r;
    else {
        const [l, c] = ad(t);
        if (r) {
            const u = o[t] = pd(r, s);
            Ge(e, l, u, c)
        } else
            i && (ud(e, l, i, c), o[t] = void 0)
    }
}
const mi = /(?:Once|Passive|Capture)$/;
function ad(e) {
    let t;
    if (mi.test(e)) {
        t = {};
        let r;
        for (; r = e.match(mi);)
            e = e.slice(0, e.length - r[0].length),
            t[r[0].toLowerCase()] = !0
    }
    return [e[2] === ":" ? e.slice(3) : Ae(e.slice(2)), t]
}
let ws = 0;
const dd = Promise.resolve(),
    hd = () => ws || (dd.then(() => ws = 0), ws = Date.now());
function pd(e, t) {
    const n = r => {
        if (!r._vts)
            r._vts = Date.now();
        else if (r._vts <= n.attached)
            return;
        Oe(gd(r, n.value), t, 5, [r])
    };
    return n.value = e, n.attached = hd(), n
}
function gd(e, t) {
    if ($(t)) {
        const n = e.stopImmediatePropagation;
        return e.stopImmediatePropagation = () => {
            n.call(e),
            e._stopped = !0
        }, t.map(r => s => !s._stopped && r && r(s))
    } else
        return t
}
const yi = e => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123,
    md = (e, t, n, r, s, o, i, l, c) => {
        const u = s === "svg";
        t === "class" ? td(e, r, u) : t === "style" ? od(e, n, r) : Dn(t) ? Js(t) || fd(e, t, n, r, i) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : yd(e, t, r, u)) ? cd(e, t, r, o, i, l, c) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), ld(e, t, r, u))
    };
function yd(e, t, n, r) {
    if (r)
        return !!(t === "innerHTML" || t === "textContent" || t in e && yi(t) && K(n));
    if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
        return !1;
    if (t === "width" || t === "height") {
        const s = e.tagName;
        if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE")
            return !1
    }
    return yi(t) && ie(n) ? !1 : t in e
}
function vc(e, t) {
    const n = Xn(e);
    class r extends rs {
        constructor(o)
        {
            super(n, o, t)
        }
    }
    return r.def = n, r
}
const bd = e => vc(e, Nc),
    _d = typeof HTMLElement < "u" ? HTMLElement : class {}
    ;
class rs extends _d {
    constructor(t, n={}, r)
    {
        super(),
        this._def = t,
        this._props = n,
        this._instance = null,
        this._connected = !1,
        this._resolved = !1,
        this._numberProps = null,
        this._ob = null,
        this.shadowRoot && r ? r(this._createVNode(), this.shadowRoot) : (this.attachShadow({
            mode: "open"
        }), this._def.__asyncLoader || this._resolveProps(this._def))
    }
    connectedCallback()
    {
        this._connected = !0,
        this._instance || (this._resolved ? this._update() : this._resolveDef())
    }
    disconnectedCallback()
    {
        this._connected = !1,
        this._ob && (this._ob.disconnect(), this._ob = null),
        bt(() => {
            this._connected || (Us(null, this.shadowRoot), this._instance = null)
        })
    }
    _resolveDef()
    {
        this._resolved = !0;
        for (let r = 0; r < this.attributes.length; r++)
            this._setAttr(this.attributes[r].name);
        this._ob = new MutationObserver(r => {
            for (const s of r)
                this._setAttr(s.attributeName)
        }),
        this._ob.observe(this, {
            attributes: !0
        });
        const t = (r, s=!1) => {
                const {props: o, styles: i} = r;
                let l;
                if (o && !$(o))
                    for (const c in o) {
                        const u = o[c];
                        (u === Number || u && u.type === Number) && (c in this._props && (this._props[c] = Er(this._props[c])), (l || (l = Object.create(null)))[_e(c)] = !0)
                    }
                this._numberProps = l,
                s && this._resolveProps(r),
                this._applyStyles(i),
                this._update()
            },
            n = this._def.__asyncLoader;
        n ? n().then(r => t(r, !0)) : t(this._def)
    }
    _resolveProps(t)
    {
        const {props: n} = t,
            r = $(n) ? n : Object.keys(n || {});
        for (const s of Object.keys(this))
            s[0] !== "_" && r.includes(s) && this._setProp(s, this[s], !0, !1);
        for (const s of r.map(_e))
            Object.defineProperty(this, s, {
                get() {
                    return this._getProp(s)
                },
                set(o) {
                    this._setProp(s, o)
                }
            })
    }
    _setAttr(t)
    {
        let n = this.getAttribute(t);
        const r = _e(t);
        this._numberProps && this._numberProps[r] && (n = Er(n)),
        this._setProp(r, n, !1)
    }
    _getProp(t)
    {
        return this._props[t]
    }
    _setProp(t, n, r=!0, s=!0)
    {
        n !== this._props[t] && (this._props[t] = n, s && this._instance && this._update(), r && (n === !0 ? this.setAttribute(Ae(t), "") : typeof n == "string" || typeof n == "number" ? this.setAttribute(Ae(t), n + "") : n || this.removeAttribute(Ae(t))))
    }
    _update()
    {
        Us(this._createVNode(), this.shadowRoot)
    }
    _createVNode()
    {
        const t = re(this._def, oe({}, this._props));
        return this._instance || (t.ce = n => {
            this._instance = n,
            n.isCE = !0;
            const r = (o, i) => {
                this.dispatchEvent(new CustomEvent(o, {
                    detail: i
                }))
            };
            n.emit = (o, ...i) => {
                r(o, i),
                Ae(o) !== o && r(Ae(o), i)
            };
            let s = this;
            for (; s = s && (s.parentNode || s.host);)
                if (s instanceof rs) {
                    n.parent = s._instance,
                    n.provides = s._instance.provides;
                    break
                }
        }), t
    }
    _applyStyles(t)
    {
        t && t.forEach(n => {
            const r = document.createElement("style");
            r.textContent = n,
            this.shadowRoot.appendChild(r)
        })
    }
}
function vd(e="$style") {
    {
        const t = ae();
        if (!t)
            return Q;
        const n = t.type.__cssModules;
        if (!n)
            return Q;
        const r = n[e];
        return r || Q
    }
}
const wc = new WeakMap,
    Ec = new WeakMap,
    Nr = Symbol("_moveCb"),
    bi = Symbol("_enterCb"),
    Cc = {
        name: "TransitionGroup",
        props: oe({}, Qa, {
            tag: String,
            moveClass: String
        }),
        setup(e, {slots: t}) {
            const n = ae(),
                r = mo();
            let s,
                o;
            return Qr(() => {
                if (!s.length)
                    return;
                const i = e.moveClass || `${e.name || "v"}-move`;
                if (!xd(s[0].el, n.vnode.el, i))
                    return;
                s.forEach(Cd),
                s.forEach(Sd);
                const l = s.filter(Td);
                mc(),
                l.forEach(c => {
                    const u = c.el,
                        f = u.style;
                    qe(u, i),
                    f.transform = f.webkitTransform = f.transitionDuration = "";
                    const a = u[Nr] = d => {
                        d && d.target !== u || (!d || /transform$/.test(d.propertyName)) && (u.removeEventListener("transitionend", a), u[Nr] = null, st(u, i))
                    };
                    u.addEventListener("transitionend", a)
                })
            }), () => {
                const i = G(e),
                    l = pc(i);
                let c = i.tag || he;
                s = o,
                o = t.default ? Jr(t.default()) : [];
                for (let u = 0; u < o.length; u++) {
                    const f = o[u];
                    f.key != null && Mt(f, on(f, l, r, n))
                }
                if (s)
                    for (let u = 0; u < s.length; u++) {
                        const f = s[u];
                        Mt(f, on(f, l, r, n)),
                        wc.set(f, f.el.getBoundingClientRect())
                    }
                return re(c, null, o)
            }
        }
    },
    wd = e => delete e.mode;
Cc.props;
const Ed = Cc;
function Cd(e) {
    const t = e.el;
    t[Nr] && t[Nr](),
    t[bi] && t[bi]()
}
function Sd(e) {
    Ec.set(e, e.el.getBoundingClientRect())
}
function Td(e) {
    const t = wc.get(e),
        n = Ec.get(e),
        r = t.left - n.left,
        s = t.top - n.top;
    if (r || s) {
        const o = e.el.style;
        return o.transform = o.webkitTransform = `translate(${r}px,${s}px)`, o.transitionDuration = "0s", e
    }
}
function xd(e, t, n) {
    const r = e.cloneNode(),
        s = e[ln];
    s && s.forEach(l => {
        l.split(/\s+/).forEach(c => c && r.classList.remove(c))
    }),
    n.split(/\s+/).forEach(l => l && r.classList.add(l)),
    r.style.display = "none";
    const o = t.nodeType === 1 ? t : t.parentNode;
    o.appendChild(r);
    const {hasTransform: i} = gc(r);
    return o.removeChild(r), i
}
const pt = e => {
    const t = e.props["onUpdate:modelValue"] || !1;
    return $(t) ? n => zt(t, n) : t
};
function Ad(e) {
    e.target.composing = !0
}
function _i(e) {
    const t = e.target;
    t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")))
}
const Le = Symbol("_assign"),
    Lr = {
        created(e, {modifiers: {lazy: t, trim: n, number: r}}, s) {
            e[Le] = pt(s);
            const o = r || s.props && s.props.type === "number";
            Ge(e, t ? "change" : "input", i => {
                if (i.target.composing)
                    return;
                let l = e.value;
                n && (l = l.trim()),
                o && (l = Rn(l)),
                e[Le](l)
            }),
            n && Ge(e, "change", () => {
                e.value = e.value.trim()
            }),
            t || (Ge(e, "compositionstart", Ad), Ge(e, "compositionend", _i), Ge(e, "change", _i))
        },
        mounted(e, {value: t}) {
            e.value = t ?? ""
        },
        beforeUpdate(e, {value: t, modifiers: {lazy: n, trim: r, number: s}}, o) {
            if (e[Le] = pt(o), e.composing)
                return;
            const i = s || e.type === "number" ? Rn(e.value) : e.value,
                l = t ?? "";
            i !== l && (document.activeElement === e && e.type !== "range" && (n || r && e.value.trim() === l) || (e.value = l))
        }
    },
    Ao = {
        deep: !0,
        created(e, t, n) {
            e[Le] = pt(n),
            Ge(e, "change", () => {
                const r = e._modelValue,
                    s = cn(e),
                    o = e.checked,
                    i = e[Le];
                if ($(r)) {
                    const l = Dr(r, s),
                        c = l !== -1;
                    if (o && !c)
                        i(r.concat(s));
                    else if (!o && c) {
                        const u = [...r];
                        u.splice(l, 1),
                        i(u)
                    }
                } else if (Bt(r)) {
                    const l = new Set(r);
                    o ? l.add(s) : l.delete(s),
                    i(l)
                } else
                    i(Tc(e, o))
            })
        },
        mounted: vi,
        beforeUpdate(e, t, n) {
            e[Le] = pt(n),
            vi(e, t, n)
        }
    };
function vi(e, {value: t, oldValue: n}, r) {
    e._modelValue = t,
    $(t) ? e.checked = Dr(t, r.props.value) > -1 : Bt(t) ? e.checked = t.has(r.props.value) : t !== n && (e.checked = dt(t, Tc(e, !0)))
}
const Oo = {
        created(e, {value: t}, n) {
            e.checked = dt(t, n.props.value),
            e[Le] = pt(n),
            Ge(e, "change", () => {
                e[Le](cn(e))
            })
        },
        beforeUpdate(e, {value: t, oldValue: n}, r) {
            e[Le] = pt(r),
            t !== n && (e.checked = dt(t, r.props.value))
        }
    },
    Sc = {
        deep: !0,
        created(e, {value: t, modifiers: {number: n}}, r) {
            const s = Bt(t);
            Ge(e, "change", () => {
                const o = Array.prototype.filter.call(e.options, i => i.selected).map(i => n ? Rn(cn(i)) : cn(i));
                e[Le](e.multiple ? s ? new Set(o) : o : o[0]),
                e._assigning = !0,
                bt(() => {
                    e._assigning = !1
                })
            }),
            e[Le] = pt(r)
        },
        mounted(e, {value: t, modifiers: {number: n}}) {
            wi(e, t, n)
        },
        beforeUpdate(e, t, n) {
            e[Le] = pt(n)
        },
        updated(e, {value: t, modifiers: {number: n}}) {
            e._assigning || wi(e, t, n)
        }
    };
function wi(e, t, n) {
    const r = e.multiple,
        s = $(t);
    if (!(r && !s && !Bt(t))) {
        for (let o = 0, i = e.options.length; o < i; o++) {
            const l = e.options[o],
                c = cn(l);
            if (r)
                if (s) {
                    const u = typeof c;
                    u === "string" || u === "number" ? l.selected = t.includes(n ? Rn(c) : c) : l.selected = Dr(t, c) > -1
                } else
                    l.selected = t.has(c);
            else if (dt(cn(l), t)) {
                e.selectedIndex !== o && (e.selectedIndex = o);
                return
            }
        }
        !r && e.selectedIndex !== -1 && (e.selectedIndex = -1)
    }
}
function cn(e) {
    return "_value" in e ? e._value : e.value
}
function Tc(e, t) {
    const n = t ? "_trueValue" : "_falseValue";
    return n in e ? e[n] : t
}
const xc = {
    created(e, t, n) {
        fr(e, t, n, null, "created")
    },
    mounted(e, t, n) {
        fr(e, t, n, null, "mounted")
    },
    beforeUpdate(e, t, n, r) {
        fr(e, t, n, r, "beforeUpdate")
    },
    updated(e, t, n, r) {
        fr(e, t, n, r, "updated")
    }
};
function Ac(e, t) {
    switch (e) {
    case "SELECT":
        return Sc;
    case "TEXTAREA":
        return Lr;
    default:
        switch (t) {
        case "checkbox":
            return Ao;
        case "radio":
            return Oo;
        default:
            return Lr
        }
    }
}
function fr(e, t, n, r, s) {
    const i = Ac(e.tagName, n.props && n.props.type)[s];
    i && i(e, t, n, r)
}
function Od() {
    Lr.getSSRProps = ({value: e}) => ({
        value: e
    }),
    Oo.getSSRProps = ({value: e}, t) => {
        if (t.props && dt(t.props.value, e))
            return {
                checked: !0
            }
    },
    Ao.getSSRProps = ({value: e}, t) => {
        if ($(e)) {
            if (t.props && Dr(e, t.props.value) > -1)
                return {
                    checked: !0
                }
        } else if (Bt(e)) {
            if (t.props && e.has(t.props.value))
                return {
                    checked: !0
                }
        } else if (e)
            return {
                checked: !0
            }
    },
    xc.getSSRProps = (e, t) => {
        if (typeof t.type != "string")
            return;
        const n = Ac(t.type.toUpperCase(), t.props && t.props.type);
        if (n.getSSRProps)
            return n.getSSRProps(e, t)
    }
}
const Rd = ["ctrl", "shift", "alt", "meta"],
    Pd = {
        stop: e => e.stopPropagation(),
        prevent: e => e.preventDefault(),
        self: e => e.target !== e.currentTarget,
        ctrl: e => !e.ctrlKey,
        shift: e => !e.shiftKey,
        alt: e => !e.altKey,
        meta: e => !e.metaKey,
        left: e => "button" in e && e.button !== 0,
        middle: e => "button" in e && e.button !== 1,
        right: e => "button" in e && e.button !== 2,
        exact: (e, t) => Rd.some(n => e[`${n}Key`] && !t.includes(n))
    },
    Nd = (e, t) => {
        const n = e._withMods || (e._withMods = {}),
            r = t.join(".");
        return n[r] || (n[r] = (s, ...o) => {
                for (let i = 0; i < t.length; i++) {
                    const l = Pd[t[i]];
                    if (l && l(s, t))
                        return
                }
                return e(s, ...o)
            })
    },
    Ld = {
        esc: "escape",
        space: " ",
        up: "arrow-up",
        left: "arrow-left",
        right: "arrow-right",
        down: "arrow-down",
        delete: "backspace"
    },
    Md = (e, t) => {
        const n = e._withKeys || (e._withKeys = {}),
            r = t.join(".");
        return n[r] || (n[r] = s => {
                if (!("key" in s))
                    return;
                const o = Ae(s.key);
                if (t.some(i => i === o || Ld[i] === o))
                    return e(s)
            })
    },
    Oc = oe({
        patchProp: md
    }, za);
let Sn,
    Ei = !1;
function Rc() {
    return Sn || (Sn = ql(Oc))
}
function Pc() {
    return Sn = Ei ? Sn : Gl(Oc), Ei = !0, Sn
}
const Us = (...e) => {
        Rc().render(...e)
    },
    Nc = (...e) => {
        Pc().hydrate(...e)
    },
    Id = (...e) => {
        const t = Rc().createApp(...e),
            {mount: n} = t;
        return t.mount = r => {
            const s = Mc(r);
            if (!s)
                return;
            const o = t._component;
            !K(o) && !o.render && !o.template && (o.template = s.innerHTML),
            s.innerHTML = "";
            const i = n(s, !1, Lc(s));
            return s instanceof Element && (s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")), i
        }, t
    },
    Fd = (...e) => {
        const t = Pc().createApp(...e),
            {mount: n} = t;
        return t.mount = r => {
            const s = Mc(r);
            if (s)
                return n(s, !0, Lc(s))
        }, t
    };
function Lc(e) {
    if (e instanceof SVGElement)
        return "svg";
    if (typeof MathMLElement == "function" && e instanceof MathMLElement)
        return "mathml"
}
function Mc(e) {
    return ie(e) ? document.querySelector(e) : e
}
let Ci = !1;
const kd = () => {
    Ci || (Ci = !0, Od(), nd())
};
const Vd = () => {},
    Tp = Object.freeze(Object.defineProperty({
        __proto__: null,
        BaseTransition: Al,
        BaseTransitionPropsValidators: yo,
        Comment: pe,
        DeprecationTypes: qa,
        EffectScope: eo,
        ErrorCodes: uf,
        ErrorTypeStrings: $a,
        Fragment: he,
        KeepAlive: Df,
        ReactiveEffect: sn,
        Static: Nt,
        Suspense: Of,
        Teleport: Zl,
        Text: It,
        TrackOpTypes: of,
        Transition: xo,
        TransitionGroup: Ed,
        TriggerOpTypes: lf,
        VueElement: rs,
        assertNumber: cf,
        callWithAsyncErrorHandling: Oe,
        callWithErrorHandling: ze,
        camelize: _e,
        capitalize: $n,
        cloneVNode: Ue,
        compatUtils: Ya,
        compile: Vd,
        computed: be,
        createApp: Id,
        createBlock: Eo,
        createCommentVNode: Ra,
        createElementBlock: Ta,
        createElementVNode: Co,
        createHydrationRenderer: Gl,
        createPropsRestProxy: sa,
        createRenderer: ql,
        createSSRApp: Fd,
        createSlots: Wf,
        createStaticVNode: Oa,
        createTextVNode: So,
        createVNode: re,
        customRef: fl,
        defineAsyncComponent: Bf,
        defineComponent: Xn,
        defineCustomElement: vc,
        defineEmits: qf,
        defineExpose: Gf,
        defineModel: Qf,
        defineOptions: Jf,
        defineProps: Yf,
        defineSSRCustomElement: bd,
        defineSlots: zf,
        devtools: ja,
        effect: Pu,
        effectScope: to,
        getCurrentInstance: ae,
        getCurrentScope: Un,
        getTransitionRawChildren: Jr,
        guardReactiveProps: sc,
        h: Gn,
        handleError: yt,
        hasInjectionContext: jl,
        hydrate: Nc,
        initCustomFormatter: Ba,
        initDirectivesForSSR: kd,
        inject: nn,
        isMemoSame: ac,
        isProxy: Xr,
        isReactive: We,
        isReadonly: Lt,
        isRef: le,
        isRuntimeOnly: Ia,
        isShallow: Pn,
        isVNode: Qe,
        markRaw: $t,
        mergeDefaults: na,
        mergeModels: ra,
        mergeProps: oc,
        nextTick: bt,
        normalizeClass: Wn,
        normalizeProps: Su,
        normalizeStyle: jn,
        onActivated: Rl,
        onBeforeMount: bo,
        onBeforeUnmount: Zr,
        onBeforeUpdate: Ll,
        onDeactivated: Pl,
        onErrorCaptured: kl,
        onMounted: _t,
        onRenderTracked: Fl,
        onRenderTriggered: Il,
        onScopeDispose: $r,
        onServerPrefetch: Ml,
        onUnmounted: hn,
        onUpdated: Qr,
        openBlock: es,
        popScopeId: yf,
        provide: $l,
        proxyRefs: co,
        pushScopeId: mf,
        queuePostFlushCb: Sr,
        reactive: ht,
        readonly: Ur,
        ref: ge,
        registerRuntimeCompiler: Ma,
        render: Us,
        renderList: jf,
        renderSlot: Uf,
        resolveComponent: Sf,
        resolveDirective: xf,
        resolveDynamicComponent: Tf,
        resolveFilter: Xa,
        resolveTransitionHooks: on,
        setBlockTracking: ks,
        setDevtoolsHook: Wa,
        setTransitionHooks: Mt,
        shallowReactive: ll,
        shallowReadonly: Tt,
        shallowRef: lo,
        ssrContextKey: El,
        ssrUtils: Ka,
        stop: Nu,
        toDisplayString: Ou,
        toHandlerKey: vn,
        toHandlers: Kf,
        toRaw: G,
        toRef: dl,
        toRefs: al,
        toValue: ef,
        transformVNodeArgs: xa,
        triggerRef: Zu,
        unref: dn,
        useAttrs: ta,
        useCssModule: vd,
        useCssVars: rd,
        useModel: Va,
        useSSRContext: Cl,
        useSlots: ea,
        useTransitionState: mo,
        vModelCheckbox: Ao,
        vModelDynamic: xc,
        vModelRadio: Oo,
        vModelSelect: Sc,
        vModelText: Lr,
        vShow: bc,
        version: dc,
        warn: Da,
        watch: Ne,
        watchEffect: If,
        watchPostEffect: Sl,
        watchSyncEffect: Tl,
        withAsyncContext: oa,
        withCtx: fo,
        withDefaults: Zf,
        withDirectives: kf,
        withKeys: Md,
        withMemo: Ha,
        withModifiers: Nd,
        withScopeId: bf
    }, Symbol.toStringTag, {
        value: "Module"
    }));
var Bd = !1;
let Ic;
const ss = e => Ic = e,
    Fc = Symbol();
function Ks(e) {
    return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function"
}
var Tn;
(function(e) {
    e.direct = "direct",
    e.patchObject = "patch object",
    e.patchFunction = "patch function"
})(Tn || (Tn = {}));
function xp() {
    const e = to(!0),
        t = e.run(() => ge({}));
    let n = [],
        r = [];
    const s = $t({
        install(o) {
            ss(s),
            s._a = o,
            o.provide(Fc, s),
            o.config.globalProperties.$pinia = s,
            r.forEach(i => n.push(i)),
            r = []
        },
        use(o) {
            return !this._a && !Bd ? r.push(o) : n.push(o), this
        },
        _p: n,
        _a: null,
        _e: e,
        _s: new Map,
        state: t
    });
    return s
}
const kc = () => {};
function Si(e, t, n, r=kc) {
    e.push(t);
    const s = () => {
        const o = e.indexOf(t);
        o > -1 && (e.splice(o, 1), r())
    };
    return !n && Un() && $r(s), s
}
function Kt(e, ...t) {
    e.slice().forEach(n => {
        n(...t)
    })
}
const Hd = e => e();
function Xs(e, t) {
    e instanceof Map && t instanceof Map && t.forEach((n, r) => e.set(r, n)),
    e instanceof Set && t instanceof Set && t.forEach(e.add, e);
    for (const n in t) {
        if (!t.hasOwnProperty(n))
            continue;
        const r = t[n],
            s = e[n];
        Ks(s) && Ks(r) && e.hasOwnProperty(n) && !le(r) && !We(r) ? e[n] = Xs(s, r) : e[n] = r
    }
    return e
}
const Dd = Symbol();
function $d(e) {
    return !Ks(e) || !e.hasOwnProperty(Dd)
}
const {assign: ot} = Object;
function jd(e) {
    return !!(le(e) && e.effect)
}
function Wd(e, t, n, r) {
    const {state: s, actions: o, getters: i} = t,
        l = n.state.value[e];
    let c;
    function u() {
        l || (n.state.value[e] = s ? s() : {});
        const f = al(n.state.value[e]);
        return ot(f, o, Object.keys(i || {}).reduce((a, d) => (a[d] = $t(be(() => {
            ss(n);
            const g = n._s.get(e);
            return i[d].call(g, g)
        })), a), {}))
    }
    return c = Vc(e, u, t, n, r, !0), c
}
function Vc(e, t, n={}, r, s, o) {
    let i;
    const l = ot({
            actions: {}
        }, n),
        c = {
            deep: !0
        };
    let u,
        f,
        a = [],
        d = [],
        g;
    const E = r.state.value[e];
    !o && !E && (r.state.value[e] = {}),
    ge({});
    let x;
    function O(C) {
        let _;
        u = f = !1,
        typeof C == "function" ? (C(r.state.value[e]), _ = {
            type: Tn.patchFunction,
            storeId: e,
            events: g
        }) : (Xs(r.state.value[e], C), _ = {
            type: Tn.patchObject,
            payload: C,
            storeId: e,
            events: g
        });
        const v = x = Symbol();
        bt().then(() => {
            x === v && (u = !0)
        }),
        f = !0,
        Kt(a, _, r.state.value[e])
    }
    const I = o ? function() {
        const {state: _} = n,
            v = _ ? _() : {};
        this.$patch(k => {
            ot(k, v)
        })
    } : kc;
    function T() {
        i.stop(),
        a = [],
        d = [],
        r._s.delete(e)
    }
    function m(C, _) {
        return function() {
            ss(r);
            const v = Array.from(arguments),
                k = [],
                N = [];
            function X(H) {
                k.push(H)
            }
            function ne(H) {
                N.push(H)
            }
            Kt(d, {
                args: v,
                name: C,
                store: b,
                after: X,
                onError: ne
            });
            let Z;
            try {
                Z = _.apply(this && this.$id === e ? this : b, v)
            } catch (H) {
                throw Kt(N, H), H
            }
            return Z instanceof Promise ? Z.then(H => (Kt(k, H), H)).catch(H => (Kt(N, H), Promise.reject(H))) : (Kt(k, Z), Z)
        }
    }
    const p = {
            _p: r,
            $id: e,
            $onAction: Si.bind(null, d),
            $patch: O,
            $reset: I,
            $subscribe(C, _={}) {
                const v = Si(a, C, _.detached, () => k()),
                    k = i.run(() => Ne(() => r.state.value[e], N => {
                        (_.flush === "sync" ? f : u) && C({
                            storeId: e,
                            type: Tn.direct,
                            events: g
                        }, N)
                    }, ot({}, c, _)));
                return v
            },
            $dispose: T
        },
        b = ht(p);
    r._s.set(e, b);
    const A = (r._a && r._a.runWithContext || Hd)(() => r._e.run(() => (i = to()).run(t)));
    for (const C in A) {
        const _ = A[C];
        if (le(_) && !jd(_) || We(_))
            o || (E && $d(_) && (le(_) ? _.value = E[C] : Xs(_, E[C])), r.state.value[e][C] = _);
        else if (typeof _ == "function") {
            const v = m(C, _);
            A[C] = v,
            l.actions[C] = _
        }
    }
    return ot(b, A), ot(G(b), A), Object.defineProperty(b, "$state", {
        get: () => r.state.value[e],
        set: C => {
            O(_ => {
                ot(_, C)
            })
        }
    }), r._p.forEach(C => {
        ot(b, i.run(() => C({
            store: b,
            app: r._a,
            pinia: r,
            options: l
        })))
    }), E && o && n.hydrate && n.hydrate(b.$state, E), u = !0, f = !0, b
}
function Ap(e, t, n) {
    let r,
        s;
    const o = typeof t == "function";
    typeof e == "string" ? (r = e, s = o ? n : t) : (s = e, r = e.id);
    function i(l, c) {
        const u = jl();
        return l = l || (u ? nn(Fc, null) : null), l && ss(l), l = Ic, l._s.has(r) || (o ? Vc(r, t, s, l) : Wd(r, s, l)), l._s.get(r)
    }
    return i.$id = r, i
}
function Op(e) {
    {
        e = G(e);
        const t = {};
        for (const n in e) {
            const r = e[n];
            (le(r) || We(r)) && (t[n] = dl(e, n))
        }
        return t
    }
}
var Ti = function(e, t, n) {
        if (n || arguments.length === 2)
            for (var r = 0, s = t.length, o; r < s; r++)
                (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), o[r] = t[r]);
        return e.concat(o || Array.prototype.slice.call(t))
    },
    Ud = function() {
        function e(t, n, r) {
            this.name = t,
            this.version = n,
            this.os = r,
            this.type = "browser"
        }
        return e
    }(),
    Kd = function() {
        function e(t) {
            this.version = t,
            this.type = "node",
            this.name = "node",
            this.os = process.platform
        }
        return e
    }(),
    Xd = function() {
        function e(t, n, r, s) {
            this.name = t,
            this.version = n,
            this.os = r,
            this.bot = s,
            this.type = "bot-device"
        }
        return e
    }(),
    Yd = function() {
        function e() {
            this.type = "bot",
            this.bot = !0,
            this.name = "bot",
            this.version = null,
            this.os = null
        }
        return e
    }(),
    qd = function() {
        function e() {
            this.type = "react-native",
            this.name = "react-native",
            this.version = null,
            this.os = null
        }
        return e
    }(),
    Gd = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/,
    Jd = /(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/,
    xi = 3,
    zd = [["aol", /AOLShield\/([0-9\._]+)/], ["edge", /Edge\/([0-9\._]+)/], ["edge-ios", /EdgiOS\/([0-9\._]+)/], ["yandexbrowser", /YaBrowser\/([0-9\._]+)/], ["kakaotalk", /KAKAOTALK\s([0-9\.]+)/], ["samsung", /SamsungBrowser\/([0-9\.]+)/], ["silk", /\bSilk\/([0-9._-]+)\b/], ["miui", /MiuiBrowser\/([0-9\.]+)$/], ["beaker", /BeakerBrowser\/([0-9\.]+)/], ["edge-chromium", /EdgA?\/([0-9\.]+)/], ["chromium-webview", /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/], ["chrome", /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/], ["phantomjs", /PhantomJS\/([0-9\.]+)(:?\s|$)/], ["crios", /CriOS\/([0-9\.]+)(:?\s|$)/], ["firefox", /Firefox\/([0-9\.]+)(?:\s|$)/], ["fxios", /FxiOS\/([0-9\.]+)/], ["opera-mini", /Opera Mini.*Version\/([0-9\.]+)/], ["opera", /Opera\/([0-9\.]+)(?:\s|$)/], ["opera", /OPR\/([0-9\.]+)(:?\s|$)/], ["pie", /^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/], ["pie", /^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/], ["netfront", /^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/], ["ie", /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/], ["ie", /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/], ["ie", /MSIE\s(7\.0)/], ["bb10", /BB10;\sTouch.*Version\/([0-9\.]+)/], ["android", /Android\s([0-9\.]+)/], ["ios", /Version\/([0-9\._]+).*Mobile.*Safari.*/], ["safari", /Version\/([0-9\._]+).*Safari/], ["facebook", /FB[AS]V\/([0-9\.]+)/], ["instagram", /Instagram\s([0-9\.]+)/], ["ios-webview", /AppleWebKit\/([0-9\.]+).*Mobile/], ["ios-webview", /AppleWebKit\/([0-9\.]+).*Gecko\)$/], ["curl", /^curl\/([0-9\.]+)$/], ["searchbot", Gd]],
    Ai = [["iOS", /iP(hone|od|ad)/], ["Android OS", /Android/], ["BlackBerry OS", /BlackBerry|BB10/], ["Windows Mobile", /IEMobile/], ["Amazon OS", /Kindle/], ["Windows 3.11", /Win16/], ["Windows 95", /(Windows 95)|(Win95)|(Windows_95)/], ["Windows 98", /(Windows 98)|(Win98)/], ["Windows 2000", /(Windows NT 5.0)|(Windows 2000)/], ["Windows XP", /(Windows NT 5.1)|(Windows XP)/], ["Windows Server 2003", /(Windows NT 5.2)/], ["Windows Vista", /(Windows NT 6.0)/], ["Windows 7", /(Windows NT 6.1)/], ["Windows 8", /(Windows NT 6.2)/], ["Windows 8.1", /(Windows NT 6.3)/], ["Windows 10", /(Windows NT 10.0)/], ["Windows ME", /Windows ME/], ["Windows CE", /Windows CE|WinCE|Microsoft Pocket Internet Explorer/], ["Open BSD", /OpenBSD/], ["Sun OS", /SunOS/], ["Chrome OS", /CrOS/], ["Linux", /(Linux)|(X11)/], ["Mac OS", /(Mac_PowerPC)|(Macintosh)/], ["QNX", /QNX/], ["BeOS", /BeOS/], ["OS/2", /OS\/2/]];
function Rp(e) {
    return e ? Oi(e) : typeof document > "u" && typeof navigator < "u" && navigator.product === "ReactNative" ? new qd : typeof navigator < "u" ? Oi(navigator.userAgent) : eh()
}
function Qd(e) {
    return e !== "" && zd.reduce(function(t, n) {
            var r = n[0],
                s = n[1];
            if (t)
                return t;
            var o = s.exec(e);
            return !!o && [r, o]
        }, !1)
}
function Oi(e) {
    var t = Qd(e);
    if (!t)
        return null;
    var n = t[0],
        r = t[1];
    if (n === "searchbot")
        return new Yd;
    var s = r[1] && r[1].split(".").join("_").split("_").slice(0, 3);
    s ? s.length < xi && (s = Ti(Ti([], s, !0), th(xi - s.length), !0)) : s = [];
    var o = s.join("."),
        i = Zd(e),
        l = Jd.exec(e);
    return l && l[1] ? new Xd(n, o, i, l[1]) : new Ud(n, o, i)
}
function Zd(e) {
    for (var t = 0, n = Ai.length; t < n; t++) {
        var r = Ai[t],
            s = r[0],
            o = r[1],
            i = o.exec(e);
        if (i)
            return s
    }
    return null
}
function eh() {
    var e = typeof process < "u" && process.version;
    return e ? new Kd(process.version.slice(1)) : null
}
function th(e) {
    for (var t = [], n = 0; n < e; n++)
        t.push("0");
    return t
}
const nh = (e, t) => (n, r) => {
        let s = -1;
        if (r.reduce((o, i, l) => {
            const c = e(o, i);
            return c !== o ? (s = l, c) : o
        }, t), s > -1)
            return n[s]
    },
    rh = nh((e, t) => {
        const {depth: n} = t;
        return !e || n > e ? n : e
    });
var sh = Object.freeze({
    __proto__: null,
    setup: e => {
        let t = 0;
        if (e.vm) {
            let {vm: n} = e;
            do n.parent && (t++, n = n.parent);
            while (n && n.parent && n !== n.root)
        }
        e.depth = t
    },
    resolve: rh
});
const oh = {
        body: {
            tag: "script",
            to: "body"
        },
        base: {
            valueAttribute: "href"
        },
        charset: {
            tag: "meta",
            nameless: !0,
            valueAttribute: "charset"
        },
        description: {
            tag: "meta"
        },
        og: {
            group: !0,
            namespacedAttribute: !0,
            tag: "meta",
            keyAttribute: "property"
        },
        twitter: {
            group: !0,
            namespacedAttribute: !0,
            tag: "meta"
        },
        htmlAttrs: {
            attributesFor: "html"
        },
        headAttrs: {
            attributesFor: "head"
        },
        bodyAttrs: {
            attributesFor: "body"
        }
    },
    ih = {
        title: {
            attributes: !1
        },
        base: {
            contentAsAttribute: !0,
            attributes: ["href", "target"]
        },
        meta: {
            contentAsAttribute: !0,
            keyAttribute: "name",
            attributes: ["content", "name", "http-equiv", "charset"]
        },
        link: {
            contentAsAttribute: !0,
            attributes: ["href", "crossorigin", "rel", "media", "integrity", "hreflang", "type", "referrerpolicy", "sizes", "imagesrcset", "imagesizes", "as", "color"]
        },
        style: {
            attributes: ["media"]
        },
        script: {
            attributes: ["src", "type", "nomodule", "async", "defer", "crossorigin", "integrity", "referrerpolicy"]
        },
        noscript: {
            attributes: !1
        }
    },
    Me = Array.isArray,
    yr = e => typeof e == "function",
    Ri = e => typeof e == "string",
    os = e => e !== null && typeof e == "object",
    lh = Object.prototype.toString,
    xn = e => lh.call(e) === "[object Object]",
    Pi = Symbol("kIsProxy"),
    ch = Symbol("kProxySources"),
    Bc = Symbol("kProxyTarget"),
    Yt = Symbol("kResolveContext");
function Vn(e) {
    if (Me(e))
        return e.map(Vn);
    if (os(e)) {
        const t = {};
        for (const n in e)
            t[n] = n === "context" ? e[n] : Vn(e[n]);
        return t
    }
    return e
}
const br = (e, t, n) => {
        const r = [];
        for (const s of e)
            s && t in s && (r.push(s[t]), n && n(s));
        return r
    },
    Mr = (e, t=[], n, r) => {
        if (!n && !r && ({active: n, sources: r} = e, t.length))
            for (let i = 0; i < t.length; i++) {
                const l = t[i];
                if (!n || !n[l])
                    return void console.error(`recompute: segment ${l} not found on target`, t, n);
                n = n[l],
                r = r.map(c => c[l]).filter(Boolean)
            }
        if (!n || !r)
            return;
        const s = ((i, ...l) => {
                const c = i ? Object.keys(i) : [];
                if (l) {
                    for (const u of l)
                        if (u && os(u))
                            for (const f in u)
                                c.includes(f) || c.push(f)
                }
                return c
            })(...r),
            o = Object.keys(n);
        for (const i of o)
            s.includes(i) || delete n[i];
        for (const i of s) {
            let l = !1;
            for (let a = 0; a < r.length; a++) {
                const d = r[a];
                if (d && i in d && d[i] !== void 0) {
                    l = xn(d[i]);
                    break
                }
            }
            if (l) {
                n[i] || (n[i] = {});
                const a = [];
                for (const d of r)
                    i in d && a.push(d[i]);
                Mr(e, [...t, i], n[i], a);
                continue
            }
            !n[i] && Me(r[0][i]) && (n[i] = []);
            const c = [],
                u = br(r, i, a => c.push(a[Yt]));
            let f = e.resolve(u, c, n[i], i, t);
            xn(f) && (f = Vn(f)),
            n[i] = f
        }
    },
    Hc = (e, t, n, r=[]) => {
        const s = uh(e, n, r),
            o = $t(new Proxy(t, s));
        return !r.length && e.sources && e.sources.push(o), o
    },
    uh = (e, t, n=[]) => ({
        get: (r, s, o) => {
            if (s === Pi)
                return !0;
            if (s === ch)
                return e.sources;
            if (s === Bc)
                return r;
            if (s === Yt)
                return t;
            let i = Reflect.get(r, s, o);
            if (!os(i))
                return i;
            if (!i[Pi]) {
                const l = [...n, s];
                i = Hc(e, i, t, l),
                Reflect.set(r, s, i)
            }
            return i
        },
        set: (r, s, o) => {
            const i = Reflect.set(r, s, o);
            if (i) {
                const l = Me(r);
                let c,
                    u = !1,
                    {sources: f, active: a} = e,
                    d = 0;
                for (const O of n) {
                    if (f = br(f, O), l && d === n.length - 1) {
                        c = O;
                        break
                    }
                    Me(a) && (u = !0),
                    a = a[O],
                    d++
                }
                if (u)
                    return Mr(e), i;
                if (xn(o))
                    return Mr(e, n), i;
                let g,
                    E = [];
                l ? (g = f, E = f.map(O => O[Yt])) : g = br(f, s, O => E.push(O[Yt]));
                let x = e.resolve(g, E, a, s, n);
                xn(x) && (x = Vn(x)),
                l && c ? a[c] = x : a[s] = x
            }
            return i
        },
        deleteProperty: (r, s) => {
            const o = Reflect.deleteProperty(r, s);
            if (o) {
                const i = Me(r);
                let l,
                    c = e.sources,
                    u = e.active,
                    f = 0;
                for (const a of n) {
                    if (c = c.map(d => d && d[a]), i && f === n.length - 1) {
                        l = a;
                        break
                    }
                    u = u[a],
                    f++
                }
                if (c.some(a => a && s in a)) {
                    let a,
                        d = [];
                    i ? (a = c, d = c.map(E => E[Yt])) : a = br(c, s, E => d.push(E[Yt]));
                    let g = e.resolve(a, d, u, s, n);
                    xn(g) && (g = Vn(g)),
                    i && l ? u[l] = g : u[s] = g
                } else
                    delete u[s]
            }
            return o
        }
    }),
    Es = {};
function fh(e, t, n, r) {
    return "attributesFor" in r ? function(s, o, i, l) {
        const {attributesFor: c} = l;
        if (!c || !i)
            return;
        if (s.isSSR)
            return {
                to: "",
                vnode: Gn(`ssr-${c}`, i)
            };
        if (!Es[c]) {
            const [d, g] = Array.from(document.querySelectorAll(c));
            if (!d)
                return void console.error("Could not find element for selector", c, ", won't render attributes");
            g && console.warn("Found multiple elements for selector", c),
            Es[c] = {
                el: d,
                attrs: []
            }
        }
        const {el: u, attrs: f} = Es[c];
        for (const d in i) {
            let g = _r(s, `${o}(${d})`, i[d], i);
            Me(g) && (g = g.join(",")),
            u.setAttribute(d, g || ""),
            f.includes(d) || f.push(d)
        }
        const a = f.filter(d => !i[d]);
        for (const d of a)
            u.removeAttribute(d)
    }(e, t, n, r) : "group" in r ? function(s, o, i, l) {
        return Me(i) ? (console.warn("Specifying an array for group properties isnt supported"), []) : Object.keys(i).map(c => {
            const u = {
                group: o,
                data: i
            };
            if (l.namespaced)
                u.tagNamespace = l.namespaced === !0 ? o : l.namespaced;
            else if (l.namespacedAttribute) {
                const f = l.namespacedAttribute === !0 ? o : l.namespacedAttribute;
                u.fullName = `${f}:${c}`,
                u.slotName = `${f}(${c})`
            }
            return Ir(s, o, i[c], l, u)
        }).filter(Boolean).flat()
    }(e, t, n, r) : Ir(e, t, n, r)
}
function Ir(e, t, n, r={}, s) {
    const o = ["content", "json", "rawContent"],
        i = O => function(I, T) {
            for (const m of I) {
                const p = ih[m];
                if (m && p)
                    return p[T]
            }
        }([l, r.tag], O);
    if (Me(n))
        return n.map(O => Ir(e, t, O, r, s)).filter(Boolean).flat();
    const {tag: l=r.tag || t} = n;
    let c = "",
        u = !1,
        f = !1;
    if (Ri(n))
        c = n;
    else if (n.children && Me(n.children))
        u = !0,
        c = n.children.map(O => {
            const I = Ir(e, t, O, r, s);
            return Me(I) ? I.map(({vnode: T}) => T) : I && I.vnode
        });
    else {
        let O = 0;
        for (const I of o) {
            if (!c && n[I]) {
                c = O === 1 ? JSON.stringify(n[I]) : n[I],
                f = O > 1;
                break
            }
            O++
        }
    }
    const a = s && s.fullName || t,
        d = s && s.slotName || t;
    let {attrs: g} = n;
    if (g || typeof n != "object")
        g || (g = {});
    else {
        g = {
            ...n
        },
        delete g.tag,
        delete g.children,
        delete g.to;
        for (const O of o)
            delete g[O]
    }
    if (u)
        c = _r(e, d, c, n);
    else {
        const O = !!i("contentAsAttribute");
        let {valueAttribute: I} = r;
        if (!I && O) {
            const [T] = i("attributes");
            I = Ri(O) ? O : T
        }
        if (I) {
            const {nameless: T} = r;
            if (!T) {
                const m = r.keyAttribute || i("keyAttribute");
                m && (g[m] = a)
            }
            g[I] = _r(e, d, g[I] || c, s),
            c = ""
        } else
            c = _r(e, d, c, n)
    }
    const E = s && s.tagNamespace ? `${s.tagNamespace}:${l}` : l;
    if (E === "title" && !e.isSSR)
        return void (document.title = c);
    f && c && (g.innerHTML = c);
    const x = Gn(E, g, c || void 0);
    return {
        to: n.to,
        vnode: x
    }
}
function _r({metainfo: e, slots: t}, n, r, s) {
    const o = t && t[n];
    if (!o || !yr(o))
        return r;
    const i = {
        content: r,
        metainfo: e
    };
    if (s && s.group) {
        const {group: c, data: u} = s;
        i[c] = u
    }
    const l = o(i);
    if (l && l.length) {
        const {children: c} = l[0];
        return c ? c.toString() : ""
    }
    return r
}
const ah = typeof Symbol == "function" && typeof Symbol.toStringTag == "symbol",
    dh = (e => ah ? Symbol("[vue-meta]: " + e) : "[vue-meta]: " + e)("meta_active");
function Dc(e, t, n) {
    for (const r in t)
        r in n ? os(e[r]) ? Dc(e[r], t[r], n[r]) : t[r] !== n[r] && (e[r] = t[r]) : e[r] = t[r];
    for (const r in n)
        t && r in t || delete e[r]
}
function $c(e) {
    if (e || (e = ae() || void 0), e)
        return e.appContext.config.globalProperties.$metaManager
}
function Pp(e, t) {
    const n = ae() || void 0;
    if (!t && n && (t = $c(n)), !t)
        throw new Error("No manager or current instance");
    Xr(e) && (Ne(e, (s, o) => {
        Dc(r.meta, s, o)
    }), e = e.value);
    const r = t.addMeta(e, n);
    return r
}
const hh = Xn({
    name: "Metainfo",
    inheritAttrs: !1,
    setup: (e, {slots: t}) => () => {
        const n = $c();
        if (n)
            return n.render({
                slots: t
            })
    }
});
function Ni(e, t, n, r) {
    const s = Me(r) ? r : [r];
    e ? n.endsWith("Attrs") || s.forEach(o => {
        o.props || (o.props = {}),
        o.props["data-vm-ssr"] = !0
    }) : s.forEach((o, i) => {
        o.type === pe && s.splice(i, 1)
    }),
    t[n] || (t[n] = []),
    t[n].push(...s)
}
const Np = (e=!1, t, n) => Ys.create(e, t || oh, n || sh),
    Vr = class Vr {
        constructor(t, n, r, s)
        {
            Et(this, "isSSR", !1);
            Et(this, "config");
            Et(this, "target");
            Et(this, "resolver");
            Et(this, "ssrCleanedUp", !1);
            this.isSSR = t,
            this.config = n,
            this.target = r,
            s && "setup" in s && yr(s.setup) && (this.resolver = s)
        }
        install(t)
        {
            t.component("Metainfo", hh),
            t.config.globalProperties.$metaManager = this,
            t.provide(dh, this.target.context.active)
        }
        addMeta(t, n)
        {
            n || (n = ae() || void 0);
            const r = {
                    removed: []
                },
                s = {
                    vm: n
                },
                {resolver: o} = this;
            o && o.setup && o.setup(s);
            const i = this.target.addSource(t, s, !0),
                l = c => this.unmount(!!c, i, r, n);
            return n && hn(l), {
                meta: i,
                onRemoved: c => r.removed.push(c),
                unmount: l
            }
        }
        unmount(t, n, r, s)
        {
            if (s) {
                const {$el: o} = s.proxy;
                if (o && o.offsetParent) {
                    let i = new MutationObserver(l => {
                        for (const {removedNodes: c} of l)
                            c && c.forEach(u => {
                                u === o && i && (i.disconnect(), i = void 0, this.reallyUnmount(t, n, r))
                            })
                    });
                    return void i.observe(o.parentNode, {
                        childList: !0
                    })
                }
            }
            this.reallyUnmount(t, n, r)
        }
        async reallyUnmount(t, n, r)
        {
            this.target.delSource(n),
            !t && r && await Promise.all(r.removed.map(s => s()))
        }
        render({slots: t}={})
        {
            const n = this.target.context.active,
                {isSSR: r} = this;
            if (!r && !this.ssrCleanedUp) {
                this.ssrCleanedUp = !0;
                const o = () => {
                    const i = document.querySelectorAll("[data-vm-ssr]");
                    i && i.length && i.forEach(l => l.parentNode && l.parentNode.removeChild(l))
                };
                document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", o, {
                    once: !0
                }) : o()
            }
            const s = {};
            for (const o in n) {
                const i = this.config[o] || {};
                let l = fh({
                    isSSR: r,
                    metainfo: n,
                    slots: t
                }, o, n[o], i);
                if (!l)
                    continue;
                Me(l) || (l = [l]);
                let c = o !== "base" && n[o].to;
                !c && "to" in i && (c = i.to),
                !c && "attributesFor" in i && (c = o);
                for (const {to: u, vnode: f} of l)
                    Ni(this.isSSR, s, u || c || "head", f)
            }
            if (t)
                for (const o in t) {
                    const i = o === "default" ? "head" : o;
                    if (i !== "head" && i !== "body")
                        continue;
                    const l = t[o];
                    yr(l) && Ni(this.isSSR, s, i, l({
                        metainfo: n
                    }))
                }
            return Object.keys(s).map(o => Gn(Zl, {
                to: o
            }, s[o]))
        }
    }
    ;
Et(Vr, "create", (t, n, r) => {
    const s = ((o, i) => {
        const l = [],
            c = {
                active: i,
                resolve: o,
                sources: l
            },
            u = () => Mr(c);
        return {
            context: c,
            compute: u,
            addSource: (f, a, d=!1) => {
                const g = Hc(c, f, a || {});
                return d && u(), g
            },
            delSource: (f, a=!0) => {
                const d = l.findIndex(g => g === f || g[Bc] === f);
                return d > -1 && (l.splice(d, 1), a && u(), !0)
            }
        }
    })((o, i, l, c, u) => yr(r) ? r(o, i, l, c, u) : r.resolve(o, i, l, c, u), ht({}));
    return new Vr(t, n, s, r)
});
let Ys = Vr;
const ph = "modulepreload",
    gh = function(e, t) {
        return new URL(e, t).href
    },
    Li = {},
    Lp = function(t, n, r) {
        let s = Promise.resolve();
        if (n && n.length > 0) {
            const o = document.getElementsByTagName("link");
            s = Promise.all(n.map(i => {
                if (i = gh(i, r), i in Li)
                    return;
                Li[i] = !0;
                const l = i.endsWith(".css"),
                    c = l ? '[rel="stylesheet"]' : "";
                if (!!r)
                    for (let a = o.length - 1; a >= 0; a--) {
                        const d = o[a];
                        if (d.href === i && (!l || d.rel === "stylesheet"))
                            return
                    }
                else if (document.querySelector(`link[href="${i}"]${c}`))
                    return;
                const f = document.createElement("link");
                if (f.rel = l ? "stylesheet" : ph, l || (f.as = "script", f.crossOrigin = ""), f.href = i, document.head.appendChild(f), l)
                    return new Promise((a, d) => {
                        f.addEventListener("load", a),
                        f.addEventListener("error", () => d(new Error(`Unable to preload CSS for ${i}`)))
                    })
            }))
        }
        return s.then(() => t()).catch(o => {
            const i = new Event("vite:preloadError", {
                cancelable: !0
            });
            if (i.payload = o, window.dispatchEvent(i), !i.defaultPrevented)
                throw o
        })
    },
    Mp = (e, t) => {
        const n = e[t];
        return n ? typeof n == "function" ? n() : Promise.resolve(n) : new Promise((r, s) => {
            (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(s.bind(null, new Error("Unknown variable dynamic import: " + t)))
        })
    };
function mh() {
    let e = [];
    return {
        cleanup: () => {
            e = e.filter(r => (r(), !1))
        },
        onCleanup: r => {
            e.push(r)
        }
    }
}
function yh(e) {
    let t = () => {};
    const n = new Promise(s => {
        t = () => {
            e(),
            s()
        }
    });
    return {
        promise: n,
        resolvePromise: t,
        onResolvedPromise: s => {
            n.then(s)
        }
    }
}
function bh(e) {
    const t = e.effect.fn,
        n = e.render;
    e.render = (...r) => {
        e.effect.fn = () => n(...r);
        const s = e.effect.run();
        return e.effect.fn = t, e.render = n, s
    }
}
const jc = e => typeof e == "function",
    _h = e => e !== null && typeof e == "object";
function vr(e, t) {
    if (Qe(e) && (t(e), e.children !== null)) {
        if (Array.isArray(e.children)) {
            e.children.forEach(n => vr(n, t));
            return
        }
        _h(e.children) && Object.keys(e.children).forEach(n => {
            if (!jc(e.children[n]))
                return;
            const r = e.children[n]();
            if (Array.isArray(r)) {
                r.forEach(s => vr(s, t));
                return
            }
            vr(r, t)
        })
    }
}
function vh(e) {
    var t,
        n;
    return ((t = e.type) == null ? void 0 : t.__asyncLoader) && ((n = e.type) == null ? void 0 : n.name) === "AsyncComponentWrapper"
}
function wh({subTree: e}, t) {
    const n = [];
    if (vr(e, r => {
        vh(r) && n.push(r.type.__asyncLoader())
    }), n.length > 0) {
        Promise.all(n).then(t);
        return
    }
    t()
}
function Eh(e) {
    if (!e || !e.subTree)
        return;
    const t = e.subTree.el,
        n = e.u;
    e.u === null && (e.u = []),
    e.u.push(() => {
        e.subTree.el === null && (e.subTree.el = t),
        e.u = n
    })
}
function Ch() {
    const e = ae();
    if (!e || e.isMounted)
        throw new Error("useLazyHydration must be called from the setup method.");
    const t = e.vnode.el !== null;
    if (e.vnode.type.__isLazilyHydrated = !0, !t)
        return {
            willPerformHydration: t,
            onHydrated: () => {}
        };
    const {cleanup: n, onCleanup: r} = mh(),
        {promise: s, resolvePromise: o, onResolvedPromise: i} = yh(n),
        l = c => i(() => bt(() => wh(e, c)));
    return e.type.__asyncLoader = () => s, Eh(e.parent), bo(() => {
        e.asyncDep = new Promise(c => {
            c(!0)
        })
    }), i(() => {
        bh(e),
        e.asyncDep = null
    }), hn(n), {
        willPerformHydration: t,
        hydrate: o,
        onHydrated: l,
        onCleanup: r
    }
}
function Sh({willPerformHydration: e, hydrate: t, onCleanup: n}, r=2e3) {
    if (!e)
        return;
    if (!ae())
        throw new Error("useHydrateWhenIdle must be called from the setup or lifecycle hook methods.");
    if (!("requestIdleCallback" in window)) {
        t();
        return
    }
    const s = requestIdleCallback(() => {
        t()
    }, {
        timeout: r
    });
    n(() => {
        cancelIdleCallback(s)
    })
}
const Wc = {
        ELEMENT: 1,
        TEXT: 3,
        COMMENT: 8
    },
    Mi = e => e && e.nodeType === Wc.ELEMENT,
    Uc = e => e && e.nodeType === Wc.COMMENT,
    Th = e => Uc(e) && (e == null ? void 0 : e.data) === "[",
    xh = e => Uc(e) && (e == null ? void 0 : e.data) === "]";
function Kc({vnode: e, subTree: t}) {
    if (!e || e.el === null)
        return [];
    if (Mi(e.el))
        return [e.el];
    const n = [];
    if (t && Th(t.el) && xh(t.anchor)) {
        let r = e.el.nextSibling;
        for (; r;) {
            if (r && Mi(r) && n.push(r), r === t.anchor)
                return n;
            r = r.nextSibling
        }
    }
    return n
}
function Ah({willPerformHydration: e, hydrate: t, onCleanup: n}, r=["focus"]) {
    if (!e)
        return;
    const s = ae();
    if (!s || s.isMounted)
        throw new Error("useHydrateOnInteraction must be called from the setup method.");
    const o = dn(r);
    _t(() => {
        const i = Kc(s),
            l = i.length > 1 ? i[0].parentElement || document : i[0],
            c = {
                capture: !0,
                once: !1,
                passive: !0
            },
            u = f => {
                f.stopPropagation();
                const a = f.composedPath && f.composedPath() || f.path;
                if (!a) {
                    let d = f.target;
                    for (; d;) {
                        if (i.includes(d)) {
                            t();
                            return
                        }
                        if (d === l)
                            return;
                        d = d.parentElement
                    }
                    return
                }
                i.forEach(d => {
                    a.includes(d) && t()
                })
            };
        o.forEach(f => {
            l.addEventListener(f, u, c)
        }),
        n(() => {
            o.forEach(f => {
                l.removeEventListener(f, u, c)
            })
        })
    })
}
const Cs = new Map;
function Oh(e) {
    const t = typeof IntersectionObserver < "u";
    if (!t)
        return {
            supported: t
        };
    const n = JSON.stringify(e);
    if (Cs.has(n))
        return {
            supported: t,
            observer: Cs.get(n)
        };
    const r = new IntersectionObserver(s => {
        s.forEach(o => {
            !(o.isIntersecting || o.intersectionRatio > 0) || !o.target.hydrate || o.target.hydrate()
        })
    }, e);
    return Cs.set(n, r), {
        supported: t,
        observer: r
    }
}
function Rh({willPerformHydration: e, hydrate: t, onCleanup: n}, r) {
    if (!e)
        return;
    const s = ae();
    if (!s || s.isMounted)
        throw new Error("useHydrateWhenVisible must be called from the setup method.");
    const {supported: o, observer: i} = Oh(r);
    if (!o) {
        t();
        return
    }
    _t(() => {
        const l = Kc(s);
        l.forEach(c => {
            c.hydrate = t,
            i.observe(c)
        }),
        n(() => {
            l.forEach(c => {
                delete c.hydrate,
                i.unobserve(c)
            })
        })
    })
}
function ar(e, {vnode: {ref: t, props: n, children: r}}) {
    const s = re(e, n, r);
    return s.ref = t, s
}
function is(e, t) {
    let n = null,
        r;
    const s = jc(e) ? e : () => Promise.resolve(e),
        o = () => {
            let i;
            return n !== null ? n : i = n = s().catch(l => {
                throw l instanceof Error ? l : new Error(String(l))
            }).then(l => i !== n && n !== null ? n : (l && (l.__esModule || l[Symbol.toStringTag] === "Module") && (l = l.default), r = l, l))
        };
    return $t(Xn({
        name: "LazyHydrationWrapper",
        inheritAttrs: !1,
        suspensible: !1,
        emits: ["hydrated"],
        get __asyncResolved() {
            return r
        },
        setup(i, {emit: l}) {
            const c = ae(),
                u = g => {
                    n = null,
                    yt(g, c, 13)
                },
                f = ge(!1),
                a = Ch();
            if (typeof window > "u")
                return o().then(g => () => ar(g, c)).catch(g => (u(g), () => null));
            if (!a.willPerformHydration)
                return r ? () => ar(r, c) : (o().then(() => {
                    f.value = !0
                }).catch(g => {
                    u(g)
                }), () => f.value && r ? ar(r, c) : null);
            const {hydrate: d} = a;
            return a.hydrate = () => o().then(() => {
                f.value = !0,
                d()
            }).catch(g => {
                u(g)
            }), a.onHydrated(() => l("hydrated")), t(a), () => ar(r, c)
        }
    }))
}
function Ip(e) {
    return is(e, () => {})
}
function Fp(e, t=2e3) {
    return is(e, n => {
        Sh(n, t)
    })
}
function kp(e, t) {
    return is(e, n => {
        Rh(n, t)
    })
}
function Vp(e, t=["focus"]) {
    return is(e, n => {
        Ah(n, t)
    })
}
function Ph(e) {
    return Un() ? ($r(e), !0) : !1
}
function un(e) {
    return typeof e == "function" ? e() : dn(e)
}
const Nh = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
const Lh = Object.prototype.toString,
    Mh = e => Lh.call(e) === "[object Object]",
    Bp = () => Date.now(),
    Vt = () => {};
function Xc(e, t) {
    function n(...r) {
        return new Promise((s, o) => {
            Promise.resolve(e(() => t.apply(this, r), {
                fn: t,
                thisArg: this,
                args: r
            })).then(s).catch(o)
        })
    }
    return n
}
const Yc = e => e();
function Ih(e, t={}) {
    let n,
        r,
        s = Vt;
    const o = l => {
        clearTimeout(l),
        s(),
        s = Vt
    };
    return l => {
        const c = un(e),
            u = un(t.maxWait);
        return n && o(n), c <= 0 || u !== void 0 && u <= 0 ? (r && (o(r), r = null), Promise.resolve(l())) : new Promise((f, a) => {
            s = t.rejectOnCancel ? a : f,
            u && !r && (r = setTimeout(() => {
                n && o(n),
                r = null,
                f(l())
            }, u)),
            n = setTimeout(() => {
                r && o(r),
                r = null,
                f(l())
            }, c)
        })
    }
}
function Fh(...e) {
    let t = 0,
        n,
        r = !0,
        s = Vt,
        o,
        i,
        l,
        c,
        u;
    !le(e[0]) && typeof e[0] == "object" ? {delay: i, trailing: l=!0, leading: c=!0, rejectOnCancel: u=!1} = e[0] : [i, l=!0, c=!0, u=!1] = e;
    const f = () => {
        n && (clearTimeout(n), n = void 0, s(), s = Vt)
    };
    return d => {
        const g = un(i),
            E = Date.now() - t,
            x = () => o = d();
        return f(), g <= 0 ? (t = Date.now(), x()) : (E > g && (c || !r) ? (t = Date.now(), x()) : l && (o = new Promise((O, I) => {
            s = u ? I : O,
            n = setTimeout(() => {
                t = Date.now(),
                r = !0,
                O(x()),
                f()
            }, Math.max(0, g - E))
        })), !c && !n && (n = setTimeout(() => r = !0, g)), r = !1, o)
    }
}
function kh(e=Yc) {
    const t = ge(!0);
    function n() {
        t.value = !1
    }
    function r() {
        t.value = !0
    }
    const s = (...o) => {
        t.value && e(...o)
    };
    return {
        isActive: Ur(t),
        pause: n,
        resume: r,
        eventFilter: s
    }
}
function Vh(e) {
    return e || ae()
}
function Hp(e, t=200, n=!1, r=!0, s=!1) {
    return Xc(Fh(t, n, r, s), e)
}
function qc(e, t, n={}) {
    const {eventFilter: r=Yc, ...s} = n;
    return Ne(e, Xc(r, t), s)
}
function Bh(e, t, n={}) {
    const {eventFilter: r, ...s} = n,
        {eventFilter: o, pause: i, resume: l, isActive: c} = kh(r);
    return {
        stop: qc(e, t, {
            ...s,
            eventFilter: o
        }),
        pause: i,
        resume: l,
        isActive: c
    }
}
function Hh(e, t=!0, n) {
    Vh() ? _t(e, n) : t ? e() : bt(e)
}
function Dp(e, t, n={}) {
    const {debounce: r=0, maxWait: s=void 0, ...o} = n;
    return qc(e, t, {
        ...o,
        eventFilter: Ih(r, {
            maxWait: s
        })
    })
}
function Dh(e) {
    var t;
    const n = un(e);
    return (t = n == null ? void 0 : n.$el) != null ? t : n
}
const Bn = Nh ? window : void 0;
function An(...e) {
    let t,
        n,
        r,
        s;
    if (typeof e[0] == "string" || Array.isArray(e[0]) ? ([n, r, s] = e, t = Bn) : [t, n, r, s] = e, !t)
        return Vt;
    Array.isArray(n) || (n = [n]),
    Array.isArray(r) || (r = [r]);
    const o = [],
        i = () => {
            o.forEach(f => f()),
            o.length = 0
        },
        l = (f, a, d, g) => (f.addEventListener(a, d, g), () => f.removeEventListener(a, d, g)),
        c = Ne(() => [Dh(t), un(s)], ([f, a]) => {
            if (i(), !f)
                return;
            const d = Mh(a) ? {
                ...a
            } : a;
            o.push(...n.flatMap(g => r.map(E => l(f, g, E, d))))
        }, {
            immediate: !0,
            flush: "post"
        }),
        u = () => {
            c(),
            i()
        };
    return Ph(u), u
}
const dr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {},
    hr = "__vueuse_ssr_handlers__",
    $h = jh();
function jh() {
    return hr in dr || (dr[hr] = dr[hr] || {}), dr[hr]
}
function Wh(e, t) {
    return $h[e] || t
}
function Uh(e) {
    return e == null ? "any" : e instanceof Set ? "set" : e instanceof Map ? "map" : e instanceof Date ? "date" : typeof e == "boolean" ? "boolean" : typeof e == "string" ? "string" : typeof e == "object" ? "object" : Number.isNaN(e) ? "any" : "number"
}
const Kh = {
        boolean: {
            read: e => e === "true",
            write: e => String(e)
        },
        object: {
            read: e => JSON.parse(e),
            write: e => JSON.stringify(e)
        },
        number: {
            read: e => Number.parseFloat(e),
            write: e => String(e)
        },
        any: {
            read: e => e,
            write: e => String(e)
        },
        string: {
            read: e => e,
            write: e => String(e)
        },
        map: {
            read: e => new Map(JSON.parse(e)),
            write: e => JSON.stringify(Array.from(e.entries()))
        },
        set: {
            read: e => new Set(JSON.parse(e)),
            write: e => JSON.stringify(Array.from(e))
        },
        date: {
            read: e => new Date(e),
            write: e => e.toISOString()
        }
    },
    Ii = "vueuse-storage";
function Xh(e, t, n, r={}) {
    var s;
    const {flush: o="pre", deep: i=!0, listenToStorageChanges: l=!0, writeDefaults: c=!0, mergeDefaults: u=!1, shallow: f, window: a=Bn, eventFilter: d, onError: g=v => {
            console.error(v)
        }, initOnMounted: E} = r,
        x = (f ? lo : ge)(typeof t == "function" ? t() : t);
    if (!n)
        try {
            n = Wh("getDefaultStorage", () => {
                var v;
                return (v = Bn) == null ? void 0 : v.localStorage
            })()
        } catch (v) {
            g(v)
        }
    if (!n)
        return x;
    const O = un(t),
        I = Uh(O),
        T = (s = r.serializer) != null ? s : Kh[I],
        {pause: m, resume: p} = Bh(x, () => w(x.value), {
            flush: o,
            deep: i,
            eventFilter: d
        });
    a && l && Hh(() => {
        An(a, "storage", C),
        An(a, Ii, _),
        E && C()
    }),
    E || C();
    function b(v, k) {
        a && a.dispatchEvent(new CustomEvent(Ii, {
            detail: {
                key: e,
                oldValue: v,
                newValue: k,
                storageArea: n
            }
        }))
    }
    function w(v) {
        try {
            const k = n.getItem(e);
            if (v == null)
                b(k, null),
                n.removeItem(e);
            else {
                const N = T.write(v);
                k !== N && (n.setItem(e, N), b(k, N))
            }
        } catch (k) {
            g(k)
        }
    }
    function A(v) {
        const k = v ? v.newValue : n.getItem(e);
        if (k == null)
            return c && O != null && n.setItem(e, T.write(O)), O;
        if (!v && u) {
            const N = T.read(k);
            return typeof u == "function" ? u(N, O) : I === "object" && !Array.isArray(N) ? {
                ...O,
                ...N
            } : N
        } else
            return typeof k != "string" ? k : T.read(k)
    }
    function C(v) {
        if (!(v && v.storageArea !== n)) {
            if (v && v.key == null) {
                x.value = O;
                return
            }
            if (!(v && v.key !== e)) {
                m();
                try {
                    (v == null ? void 0 : v.newValue) !== T.write(x.value) && (x.value = A(v))
                } catch (k) {
                    g(k)
                } finally {
                    v ? bt(p) : p()
                }
            }
        }
    }
    function _(v) {
        C(v.detail)
    }
    return x
}
function $p(e, t, n={}) {
    const {window: r=Bn} = n;
    return Xh(e, t, r == null ? void 0 : r.sessionStorage, n)
}
function jp(e, t={}) {
    const {threshold: n=50, onSwipe: r, onSwipeEnd: s, onSwipeStart: o, passive: i=!0, window: l=Bn} = t,
        c = ht({
            x: 0,
            y: 0
        }),
        u = ht({
            x: 0,
            y: 0
        }),
        f = be(() => c.x - u.x),
        a = be(() => c.y - u.y),
        {max: d, abs: g} = Math,
        E = be(() => d(g(f.value), g(a.value)) >= n),
        x = ge(!1),
        O = be(() => E.value ? g(f.value) > g(a.value) ? f.value > 0 ? "left" : "right" : a.value > 0 ? "up" : "down" : "none"),
        I = _ => [_.touches[0].clientX, _.touches[0].clientY],
        T = (_, v) => {
            c.x = _,
            c.y = v
        },
        m = (_, v) => {
            u.x = _,
            u.y = v
        };
    let p;
    const b = Yh(l == null ? void 0 : l.document);
    i ? p = b ? {
        passive: !0
    } : {
        capture: !1
    } : p = b ? {
        passive: !1,
        capture: !0
    } : {
        capture: !0
    };
    const w = _ => {
            x.value && (s == null || s(_, O.value)),
            x.value = !1
        },
        A = [An(e, "touchstart", _ => {
            if (_.touches.length !== 1)
                return;
            p.capture && !p.passive && _.preventDefault();
            const [v, k] = I(_);
            T(v, k),
            m(v, k),
            o == null || o(_)
        }, p), An(e, "touchmove", _ => {
            if (_.touches.length !== 1)
                return;
            const [v, k] = I(_);
            m(v, k),
            !x.value && E.value && (x.value = !0),
            x.value && (r == null || r(_))
        }, p), An(e, ["touchend", "touchcancel"], w, p)];
    return {
        isPassiveEventSupported: b,
        isSwiping: x,
        direction: O,
        coordsStart: c,
        coordsEnd: u,
        lengthX: f,
        lengthY: a,
        stop: () => A.forEach(_ => _())
    }
}
function Yh(e) {
    if (!e)
        return !1;
    let t = !1;
    const n = {
        get passive() {
            return t = !0, !1
        }
    };
    return e.addEventListener("x", Vt, n), e.removeEventListener("x", Vt), t
}
function rt(e) {
    if (typeof e != "object")
        return e;
    var t,
        n,
        r = Object.prototype.toString.call(e);
    if (r === "[object Object]") {
        if (e.constructor !== Object && typeof e.constructor == "function") {
            n = new e.constructor;
            for (t in e)
                e.hasOwnProperty(t) && n[t] !== e[t] && (n[t] = rt(e[t]))
        } else {
            n = {};
            for (t in e)
                t === "__proto__" ? Object.defineProperty(n, t, {
                    value: rt(e[t]),
                    configurable: !0,
                    enumerable: !0,
                    writable: !0
                }) : n[t] = rt(e[t])
        }
        return n
    }
    if (r === "[object Array]") {
        for (t = e.length, n = Array(t); t--;)
            n[t] = rt(e[t]);
        return n
    }
    return r === "[object Set]" ? (n = new Set, e.forEach(function(s) {
        n.add(rt(s))
    }), n) : r === "[object Map]" ? (n = new Map, e.forEach(function(s, o) {
        n.set(rt(o), rt(s))
    }), n) : r === "[object Date]" ? new Date(+e) : r === "[object RegExp]" ? (n = new RegExp(e.source, e.flags), n.lastIndex = e.lastIndex, n) : r === "[object DataView]" ? new e.constructor(rt(e.buffer)) : r === "[object ArrayBuffer]" ? e.slice(0) : r.slice(-6) === "Array]" ? new e.constructor(e) : e
}
var qh = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Gc(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
}
var Jc = {
    exports: {}
};
(function(e, t) {
    (function() {
        function n() {
            var r = window,
                s = document;
            if ("scrollBehavior" in s.documentElement.style && r.__forceSmoothScrollPolyfill__ !== !0)
                return;
            var o = r.HTMLElement || r.Element,
                i = 468,
                l = {
                    scroll: r.scroll || r.scrollTo,
                    scrollBy: r.scrollBy,
                    elementScroll: o.prototype.scroll || a,
                    scrollIntoView: o.prototype.scrollIntoView
                },
                c = r.performance && r.performance.now ? r.performance.now.bind(r.performance) : Date.now;
            function u(p) {
                var b = ["MSIE ", "Trident/", "Edge/"];
                return new RegExp(b.join("|")).test(p)
            }
            var f = u(r.navigator.userAgent) ? 1 : 0;
            function a(p, b) {
                this.scrollLeft = p,
                this.scrollTop = b
            }
            function d(p) {
                return .5 * (1 - Math.cos(Math.PI * p))
            }
            function g(p) {
                if (p === null || typeof p != "object" || p.behavior === void 0 || p.behavior === "auto" || p.behavior === "instant")
                    return !0;
                if (typeof p == "object" && p.behavior === "smooth")
                    return !1;
                throw new TypeError("behavior member of ScrollOptions " + p.behavior + " is not a valid value for enumeration ScrollBehavior.")
            }
            function E(p, b) {
                if (b === "Y")
                    return p.clientHeight + f < p.scrollHeight;
                if (b === "X")
                    return p.clientWidth + f < p.scrollWidth
            }
            function x(p, b) {
                var w = r.getComputedStyle(p, null)["overflow" + b];
                return w === "auto" || w === "scroll"
            }
            function O(p) {
                var b = E(p, "Y") && x(p, "Y"),
                    w = E(p, "X") && x(p, "X");
                return b || w
            }
            function I(p) {
                for (; p !== s.body && O(p) === !1;)
                    p = p.parentNode || p.host;
                return p
            }
            function T(p) {
                var b = c(),
                    w,
                    A,
                    C,
                    _ = (b - p.startTime) / i;
                _ = _ > 1 ? 1 : _,
                w = d(_),
                A = p.startX + (p.x - p.startX) * w,
                C = p.startY + (p.y - p.startY) * w,
                p.method.call(p.scrollable, A, C),
                (A !== p.x || C !== p.y) && r.requestAnimationFrame(T.bind(r, p))
            }
            function m(p, b, w) {
                var A,
                    C,
                    _,
                    v,
                    k = c();
                p === s.body ? (A = r, C = r.scrollX || r.pageXOffset, _ = r.scrollY || r.pageYOffset, v = l.scroll) : (A = p, C = p.scrollLeft, _ = p.scrollTop, v = a),
                T({
                    scrollable: A,
                    method: v,
                    startTime: k,
                    startX: C,
                    startY: _,
                    x: b,
                    y: w
                })
            }
            r.scroll = r.scrollTo = function() {
                if (arguments[0] !== void 0) {
                    if (g(arguments[0]) === !0) {
                        l.scroll.call(r, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] != "object" ? arguments[0] : r.scrollX || r.pageXOffset, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : r.scrollY || r.pageYOffset);
                        return
                    }
                    m.call(r, s.body, arguments[0].left !== void 0 ? ~~arguments[0].left : r.scrollX || r.pageXOffset, arguments[0].top !== void 0 ? ~~arguments[0].top : r.scrollY || r.pageYOffset)
                }
            },
            r.scrollBy = function() {
                if (arguments[0] !== void 0) {
                    if (g(arguments[0])) {
                        l.scrollBy.call(r, arguments[0].left !== void 0 ? arguments[0].left : typeof arguments[0] != "object" ? arguments[0] : 0, arguments[0].top !== void 0 ? arguments[0].top : arguments[1] !== void 0 ? arguments[1] : 0);
                        return
                    }
                    m.call(r, s.body, ~~arguments[0].left + (r.scrollX || r.pageXOffset), ~~arguments[0].top + (r.scrollY || r.pageYOffset))
                }
            },
            o.prototype.scroll = o.prototype.scrollTo = function() {
                if (arguments[0] !== void 0) {
                    if (g(arguments[0]) === !0) {
                        if (typeof arguments[0] == "number" && arguments[1] === void 0)
                            throw new SyntaxError("Value could not be converted");
                        l.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left : typeof arguments[0] != "object" ? ~~arguments[0] : this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top : arguments[1] !== void 0 ? ~~arguments[1] : this.scrollTop);
                        return
                    }
                    var p = arguments[0].left,
                        b = arguments[0].top;
                    m.call(this, this, typeof p > "u" ? this.scrollLeft : ~~p, typeof b > "u" ? this.scrollTop : ~~b)
                }
            },
            o.prototype.scrollBy = function() {
                if (arguments[0] !== void 0) {
                    if (g(arguments[0]) === !0) {
                        l.elementScroll.call(this, arguments[0].left !== void 0 ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, arguments[0].top !== void 0 ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop);
                        return
                    }
                    this.scroll({
                        left: ~~arguments[0].left + this.scrollLeft,
                        top: ~~arguments[0].top + this.scrollTop,
                        behavior: arguments[0].behavior
                    })
                }
            },
            o.prototype.scrollIntoView = function() {
                if (g(arguments[0]) === !0) {
                    l.scrollIntoView.call(this, arguments[0] === void 0 ? !0 : arguments[0]);
                    return
                }
                var p = I(this),
                    b = p.getBoundingClientRect(),
                    w = this.getBoundingClientRect();
                p !== s.body ? (m.call(this, p, p.scrollLeft + w.left - b.left, p.scrollTop + w.top - b.top), r.getComputedStyle(p).position !== "fixed" && r.scrollBy({
                    left: b.left,
                    top: b.top,
                    behavior: "smooth"
                })) : r.scrollBy({
                    left: w.left,
                    top: w.top,
                    behavior: "smooth"
                })
            }
        }
        e.exports = {
            polyfill: n
        }
    })()
})(Jc);
var Gh = Jc.exports;
const Wp = Gc(Gh),
    Up = (e, t) => {
        const n = e.__vccOpts || e;
        for (const [r, s] of t)
            n[r] = s;
        return n
    };
var zc = {
    exports: {}
};
(function(e, t) {
    (function(n, r) {
        e.exports = r()
    })(qh, function() {
        class n {
            toCart(i)
            {
                const l = i.order.items.map(this.toCartItem),
                    c = l.reduce((u, f) => u + f.quantity, 0);
                return {
                    cartId: i.cartId,
                    items: l,
                    productsQuantity: c
                }
            }
            toCartItem(i)
            {
                return {
                    product: {
                        id: i.productId,
                        sku: i.sku,
                        name: i.name,
                        price: i.price
                    },
                    quantity: i.quantity
                }
            }
        }
        class r {
            toCart(i)
            {
                return {
                    cartId: "",
                    items: [],
                    productsQuantity: i.itemsCount
                }
            }
        }
        class s {
            constructor(i, l)
            {
                this.DEFAULT_STORE_LOCATION_PATH = "store",
                this.localStorageCartKey = this.getCartKey(i),
                this.localStorageCheckoutKey = this.getCheckoutKey(i),
                this.defaultStoreLocationPath = l ? this.unifyStoreLocationPath(l) : this.DEFAULT_STORE_LOCATION_PATH,
                this.cartConverter = new n,
                this.checkoutConverter = new r
            }
            get()
            {
                if (typeof window > "u" || !window || !window.localStorage)
                    return this.createEmptyCartPromise();
                const i = window.localStorage.getItem(this.localStorageCheckoutKey);
                if (i != null) {
                    const f = JSON.parse(i),
                        a = this.checkoutConverter.toCart(f);
                    return this.createCartPromise(a)
                }
                const l = window.localStorage.getItem(this.localStorageCartKey);
                if (l == null)
                    return this.createEmptyCartPromise();
                const c = JSON.parse(l),
                    u = this.cartConverter.toCart(c);
                return this.createCartPromise(u)
            }
            goToCheckout(i)
            {
                if (typeof window > "u" || !window || !window.location)
                    return;
                const l = i ? this.unifyStoreLocationPath(i) : this.defaultStoreLocationPath;
                window.location.href = `${window.location.origin}/${l}#!/~/cart`
            }
            unifyStoreLocationPath(i)
            {
                return i.replace(/(^\/)|(\/$)/g, "")
            }
            getCartKey(i)
            {
                return `PSecwid__${i}PScart`
            }
            getCheckoutKey(i)
            {
                return `ec-${i}-checkout`
            }
            createCartPromise(i)
            {
                return Promise.resolve(i)
            }
            createEmptyCartPromise()
            {
                return this.createCartPromise({})
            }
        }
        return class {
            constructor(o)
            {
                this.cart = new s(o.storeId, o.storeLocationPath)
            }
        }
    })
})(zc);
var Jh = zc.exports;
const Kp = Gc(Jh);
let Xp = (e=21) => crypto.getRandomValues(new Uint8Array(e)).reduce((t, n) => (n &= 63, n < 36 ? t += n.toString(36) : n < 62 ? t += (n - 26).toString(36).toUpperCase() : n > 62 ? t += "-" : t += "_", t), "");
const Fi = Math.min,
    On = Math.max,
    Fr = Math.round,
    gt = e => ({
        x: e,
        y: e
    });
function zh(e, t) {
    return typeof e == "function" ? e(t) : e
}
function Qc(e) {
    return e.split("-")[0]
}
function Qh(e) {
    return e.split("-")[1]
}
function Zh(e) {
    return e === "x" ? "y" : "x"
}
function ep(e) {
    return e === "y" ? "height" : "width"
}
function Zc(e) {
    return ["top", "bottom"].includes(Qc(e)) ? "y" : "x"
}
function tp(e) {
    return Zh(Zc(e))
}
function np(e) {
    return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...e
    }
}
function rp(e) {
    return typeof e != "number" ? np(e) : {
        top: e,
        right: e,
        bottom: e,
        left: e
    }
}
function kr(e) {
    const {x: t, y: n, width: r, height: s} = e;
    return {
        width: r,
        height: s,
        top: n,
        left: t,
        right: t + r,
        bottom: n + s,
        x: t,
        y: n
    }
}
function ki(e, t, n) {
    let {reference: r, floating: s} = e;
    const o = Zc(t),
        i = tp(t),
        l = ep(i),
        c = Qc(t),
        u = o === "y",
        f = r.x + r.width / 2 - s.width / 2,
        a = r.y + r.height / 2 - s.height / 2,
        d = r[l] / 2 - s[l] / 2;
    let g;
    switch (c) {
    case "top":
        g = {
            x: f,
            y: r.y - s.height
        };
        break;
    case "bottom":
        g = {
            x: f,
            y: r.y + r.height
        };
        break;
    case "right":
        g = {
            x: r.x + r.width,
            y: a
        };
        break;
    case "left":
        g = {
            x: r.x - s.width,
            y: a
        };
        break;
    default:
        g = {
            x: r.x,
            y: r.y
        }
    }
    switch (Qh(t)) {
    case "start":
        g[i] -= d * (n && u ? -1 : 1);
        break;
    case "end":
        g[i] += d * (n && u ? -1 : 1);
        break
    }
    return g
}
const sp = async (e, t, n) => {
    const {placement: r="bottom", strategy: s="absolute", middleware: o=[], platform: i} = n,
        l = o.filter(Boolean),
        c = await (i.isRTL == null ? void 0 : i.isRTL(t));
    let u = await i.getElementRects({
            reference: e,
            floating: t,
            strategy: s
        }),
        {x: f, y: a} = ki(u, r, c),
        d = r,
        g = {},
        E = 0;
    for (let x = 0; x < l.length; x++) {
        const {name: O, fn: I} = l[x],
            {x: T, y: m, data: p, reset: b} = await I({
                x: f,
                y: a,
                initialPlacement: r,
                placement: d,
                strategy: s,
                middlewareData: g,
                rects: u,
                platform: i,
                elements: {
                    reference: e,
                    floating: t
                }
            });
        f = T ?? f,
        a = m ?? a,
        g = {
            ...g,
            [O]: {
                ...g[O],
                ...p
            }
        },
        b && E <= 50 && (E++, typeof b == "object" && (b.placement && (d = b.placement), b.rects && (u = b.rects === !0 ? await i.getElementRects({
            reference: e,
            floating: t,
            strategy: s
        }) : b.rects), {x: f, y: a} = ki(u, d, c)), x = -1)
    }
    return {
        x: f,
        y: a,
        placement: d,
        strategy: s,
        middlewareData: g
    }
};
async function op(e, t) {
    var n;
    t === void 0 && (t = {});
    const {x: r, y: s, platform: o, rects: i, elements: l, strategy: c} = e,
        {boundary: u="clippingAncestors", rootBoundary: f="viewport", elementContext: a="floating", altBoundary: d=!1, padding: g=0} = zh(t, e),
        E = rp(g),
        O = l[d ? a === "floating" ? "reference" : "floating" : a],
        I = kr(await o.getClippingRect({
            element: (n = await (o.isElement == null ? void 0 : o.isElement(O))) == null || n ? O : O.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(l.floating)),
            boundary: u,
            rootBoundary: f,
            strategy: c
        })),
        T = a === "floating" ? {
            x: r,
            y: s,
            width: i.floating.width,
            height: i.floating.height
        } : i.reference,
        m = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l.floating)),
        p = await (o.isElement == null ? void 0 : o.isElement(m)) ? await (o.getScale == null ? void 0 : o.getScale(m)) || {
            x: 1,
            y: 1
        } : {
            x: 1,
            y: 1
        },
        b = kr(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: T,
            offsetParent: m,
            strategy: c
        }) : T);
    return {
        top: (I.top - b.top + E.top) / p.y,
        bottom: (b.bottom - I.bottom + E.bottom) / p.y,
        left: (I.left - b.left + E.left) / p.x,
        right: (b.right - I.right + E.right) / p.x
    }
}
function jt(e) {
    return Ro(e) ? (e.nodeName || "").toLowerCase() : "#document"
}
function Re(e) {
    var t;
    return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window
}
function vt(e) {
    var t;
    return (t = (Ro(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement
}
function Ro(e) {
    return e instanceof Node || e instanceof Re(e).Node
}
function Ve(e) {
    return e instanceof Element || e instanceof Re(e).Element
}
function Ke(e) {
    return e instanceof HTMLElement || e instanceof Re(e).HTMLElement
}
function Vi(e) {
    return typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Re(e).ShadowRoot
}
function Jn(e) {
    const {overflow: t, overflowX: n, overflowY: r, display: s} = Be(e);
    return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !["inline", "contents"].includes(s)
}
function ip(e) {
    return ["table", "td", "th"].includes(jt(e))
}
function ls(e) {
    return [":popover-open", ":modal"].some(t => {
        try {
            return e.matches(t)
        } catch {
            return !1
        }
    })
}
function Po(e) {
    const t = No(),
        n = Ve(e) ? Be(e) : e;
    return n.transform !== "none" || n.perspective !== "none" || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || ["transform", "perspective", "filter"].some(r => (n.willChange || "").includes(r)) || ["paint", "layout", "strict", "content"].some(r => (n.contain || "").includes(r))
}
function lp(e) {
    let t = mt(e);
    for (; Ke(t) && !fn(t);) {
        if (Po(t))
            return t;
        if (ls(t))
            return null;
        t = mt(t)
    }
    return null
}
function No() {
    return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none")
}
function fn(e) {
    return ["html", "body", "#document"].includes(jt(e))
}
function Be(e) {
    return Re(e).getComputedStyle(e)
}
function cs(e) {
    return Ve(e) ? {
        scrollLeft: e.scrollLeft,
        scrollTop: e.scrollTop
    } : {
        scrollLeft: e.scrollX,
        scrollTop: e.scrollY
    }
}
function mt(e) {
    if (jt(e) === "html")
        return e;
    const t = e.assignedSlot || e.parentNode || Vi(e) && e.host || vt(e);
    return Vi(t) ? t.host : t
}
function eu(e) {
    const t = mt(e);
    return fn(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Ke(t) && Jn(t) ? t : eu(t)
}
function qs(e, t, n) {
    var r;
    t === void 0 && (t = []),
    n === void 0 && (n = !0);
    const s = eu(e),
        o = s === ((r = e.ownerDocument) == null ? void 0 : r.body),
        i = Re(s);
    if (o) {
        const l = Gs(i);
        return t.concat(i, i.visualViewport || [], Jn(s) ? s : [], l && n ? qs(l) : [])
    }
    return t.concat(s, qs(s, [], n))
}
function Gs(e) {
    return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null
}
function tu(e) {
    const t = Be(e);
    let n = parseFloat(t.width) || 0,
        r = parseFloat(t.height) || 0;
    const s = Ke(e),
        o = s ? e.offsetWidth : n,
        i = s ? e.offsetHeight : r,
        l = Fr(n) !== o || Fr(r) !== i;
    return l && (n = o, r = i), {
        width: n,
        height: r,
        $: l
    }
}
function nu(e) {
    return Ve(e) ? e : e.contextElement
}
function rn(e) {
    const t = nu(e);
    if (!Ke(t))
        return gt(1);
    const n = t.getBoundingClientRect(),
        {width: r, height: s, $: o} = tu(t);
    let i = (o ? Fr(n.width) : n.width) / r,
        l = (o ? Fr(n.height) : n.height) / s;
    return (!i || !Number.isFinite(i)) && (i = 1), (!l || !Number.isFinite(l)) && (l = 1), {
        x: i,
        y: l
    }
}
const cp = gt(0);
function ru(e) {
    const t = Re(e);
    return !No() || !t.visualViewport ? cp : {
        x: t.visualViewport.offsetLeft,
        y: t.visualViewport.offsetTop
    }
}
function up(e, t, n) {
    return t === void 0 && (t = !1), !n || t && n !== Re(e) ? !1 : t
}
function Hn(e, t, n, r) {
    t === void 0 && (t = !1),
    n === void 0 && (n = !1);
    const s = e.getBoundingClientRect(),
        o = nu(e);
    let i = gt(1);
    t && (r ? Ve(r) && (i = rn(r)) : i = rn(e));
    const l = up(o, n, r) ? ru(o) : gt(0);
    let c = (s.left + l.x) / i.x,
        u = (s.top + l.y) / i.y,
        f = s.width / i.x,
        a = s.height / i.y;
    if (o) {
        const d = Re(o),
            g = r && Ve(r) ? Re(r) : r;
        let E = d,
            x = Gs(E);
        for (; x && r && g !== E;) {
            const O = rn(x),
                I = x.getBoundingClientRect(),
                T = Be(x),
                m = I.left + (x.clientLeft + parseFloat(T.paddingLeft)) * O.x,
                p = I.top + (x.clientTop + parseFloat(T.paddingTop)) * O.y;
            c *= O.x,
            u *= O.y,
            f *= O.x,
            a *= O.y,
            c += m,
            u += p,
            E = Re(x),
            x = Gs(E)
        }
    }
    return kr({
        width: f,
        height: a,
        x: c,
        y: u
    })
}
function fp(e) {
    let {elements: t, rect: n, offsetParent: r, strategy: s} = e;
    const o = s === "fixed",
        i = vt(r),
        l = t ? ls(t.floating) : !1;
    if (r === i || l && o)
        return n;
    let c = {
            scrollLeft: 0,
            scrollTop: 0
        },
        u = gt(1);
    const f = gt(0),
        a = Ke(r);
    if ((a || !a && !o) && ((jt(r) !== "body" || Jn(i)) && (c = cs(r)), Ke(r))) {
        const d = Hn(r);
        u = rn(r),
        f.x = d.x + r.clientLeft,
        f.y = d.y + r.clientTop
    }
    return {
        width: n.width * u.x,
        height: n.height * u.y,
        x: n.x * u.x - c.scrollLeft * u.x + f.x,
        y: n.y * u.y - c.scrollTop * u.y + f.y
    }
}
function ap(e) {
    return Array.from(e.getClientRects())
}
function su(e) {
    return Hn(vt(e)).left + cs(e).scrollLeft
}
function dp(e) {
    const t = vt(e),
        n = cs(e),
        r = e.ownerDocument.body,
        s = On(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
        o = On(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
    let i = -n.scrollLeft + su(e);
    const l = -n.scrollTop;
    return Be(r).direction === "rtl" && (i += On(t.clientWidth, r.clientWidth) - s), {
        width: s,
        height: o,
        x: i,
        y: l
    }
}
function hp(e, t) {
    const n = Re(e),
        r = vt(e),
        s = n.visualViewport;
    let o = r.clientWidth,
        i = r.clientHeight,
        l = 0,
        c = 0;
    if (s) {
        o = s.width,
        i = s.height;
        const u = No();
        (!u || u && t === "fixed") && (l = s.offsetLeft, c = s.offsetTop)
    }
    return {
        width: o,
        height: i,
        x: l,
        y: c
    }
}
function pp(e, t) {
    const n = Hn(e, !0, t === "fixed"),
        r = n.top + e.clientTop,
        s = n.left + e.clientLeft,
        o = Ke(e) ? rn(e) : gt(1),
        i = e.clientWidth * o.x,
        l = e.clientHeight * o.y,
        c = s * o.x,
        u = r * o.y;
    return {
        width: i,
        height: l,
        x: c,
        y: u
    }
}
function Bi(e, t, n) {
    let r;
    if (t === "viewport")
        r = hp(e, n);
    else if (t === "document")
        r = dp(vt(e));
    else if (Ve(t))
        r = pp(t, n);
    else {
        const s = ru(e);
        r = {
            ...t,
            x: t.x - s.x,
            y: t.y - s.y
        }
    }
    return kr(r)
}
function ou(e, t) {
    const n = mt(e);
    return n === t || !Ve(n) || fn(n) ? !1 : Be(n).position === "fixed" || ou(n, t)
}
function gp(e, t) {
    const n = t.get(e);
    if (n)
        return n;
    let r = qs(e, [], !1).filter(l => Ve(l) && jt(l) !== "body"),
        s = null;
    const o = Be(e).position === "fixed";
    let i = o ? mt(e) : e;
    for (; Ve(i) && !fn(i);) {
        const l = Be(i),
            c = Po(i);
        !c && l.position === "fixed" && (s = null),
        (o ? !c && !s : !c && l.position === "static" && !!s && ["absolute", "fixed"].includes(s.position) || Jn(i) && !c && ou(e, i)) ? r = r.filter(f => f !== i) : s = l,
        i = mt(i)
    }
    return t.set(e, r), r
}
function mp(e) {
    let {element: t, boundary: n, rootBoundary: r, strategy: s} = e;
    const i = [...n === "clippingAncestors" ? ls(t) ? [] : gp(t, this._c) : [].concat(n), r],
        l = i[0],
        c = i.reduce((u, f) => {
            const a = Bi(t, f, s);
            return u.top = On(a.top, u.top), u.right = Fi(a.right, u.right), u.bottom = Fi(a.bottom, u.bottom), u.left = On(a.left, u.left), u
        }, Bi(t, l, s));
    return {
        width: c.right - c.left,
        height: c.bottom - c.top,
        x: c.left,
        y: c.top
    }
}
function yp(e) {
    const {width: t, height: n} = tu(e);
    return {
        width: t,
        height: n
    }
}
function bp(e, t, n) {
    const r = Ke(t),
        s = vt(t),
        o = n === "fixed",
        i = Hn(e, !0, o, t);
    let l = {
        scrollLeft: 0,
        scrollTop: 0
    };
    const c = gt(0);
    if (r || !r && !o)
        if ((jt(t) !== "body" || Jn(s)) && (l = cs(t)), r) {
            const a = Hn(t, !0, o, t);
            c.x = a.x + t.clientLeft,
            c.y = a.y + t.clientTop
        } else
            s && (c.x = su(s));
    const u = i.left + l.scrollLeft - c.x,
        f = i.top + l.scrollTop - c.y;
    return {
        x: u,
        y: f,
        width: i.width,
        height: i.height
    }
}
function Ss(e) {
    return Be(e).position === "static"
}
function Hi(e, t) {
    return !Ke(e) || Be(e).position === "fixed" ? null : t ? t(e) : e.offsetParent
}
function iu(e, t) {
    const n = Re(e);
    if (ls(e))
        return n;
    if (!Ke(e)) {
        let s = mt(e);
        for (; s && !fn(s);) {
            if (Ve(s) && !Ss(s))
                return s;
            s = mt(s)
        }
        return n
    }
    let r = Hi(e, t);
    for (; r && ip(r) && Ss(r);)
        r = Hi(r, t);
    return r && fn(r) && Ss(r) && !Po(r) ? n : r || lp(e) || n
}
const _p = async function(e) {
    const t = this.getOffsetParent || iu,
        n = this.getDimensions,
        r = await n(e.floating);
    return {
        reference: bp(e.reference, await t(e.floating), e.strategy),
        floating: {
            x: 0,
            y: 0,
            width: r.width,
            height: r.height
        }
    }
};
function vp(e) {
    return Be(e).direction === "rtl"
}
const wp = {
        convertOffsetParentRelativeRectToViewportRelativeRect: fp,
        getDocumentElement: vt,
        getClippingRect: mp,
        getOffsetParent: iu,
        getElementRects: _p,
        getClientRects: ap,
        getDimensions: yp,
        getScale: rn,
        isElement: Ve,
        isRTL: vp
    },
    Yp = op,
    Ep = (e, t, n) => {
        const r = new Map,
            s = {
                platform: wp,
                ...n
            },
            o = {
                ...s.platform,
                _c: r
            };
        return sp(e, t, {
            ...s,
            platform: o
        })
    };
function Cp(e) {
    return e != null && typeof e == "object" && "$el" in e
}
function Di(e) {
    if (Cp(e)) {
        const t = e.$el;
        return Ro(t) && jt(t) === "#comment" ? null : t
    }
    return e
}
function yn(e) {
    return typeof e == "function" ? e() : dn(e)
}
function lu(e) {
    return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1
}
function $i(e, t) {
    const n = lu(e);
    return Math.round(t * n) / n
}
function qp(e, t, n) {
    n === void 0 && (n = {});
    const r = n.whileElementsMounted,
        s = be(() => {
            var A;
            return (A = yn(n.open)) != null ? A : !0
        }),
        o = be(() => yn(n.middleware)),
        i = be(() => {
            var A;
            return (A = yn(n.placement)) != null ? A : "bottom"
        }),
        l = be(() => {
            var A;
            return (A = yn(n.strategy)) != null ? A : "absolute"
        }),
        c = be(() => {
            var A;
            return (A = yn(n.transform)) != null ? A : !0
        }),
        u = be(() => Di(e.value)),
        f = be(() => Di(t.value)),
        a = ge(0),
        d = ge(0),
        g = ge(l.value),
        E = ge(i.value),
        x = lo({}),
        O = ge(!1),
        I = be(() => {
            const A = {
                position: g.value,
                left: "0",
                top: "0"
            };
            if (!f.value)
                return A;
            const C = $i(f.value, a.value),
                _ = $i(f.value, d.value);
            return c.value ? {
                ...A,
                transform: "translate(" + C + "px, " + _ + "px)",
                ...lu(f.value) >= 1.5 && {
                    willChange: "transform"
                }
            } : {
                position: g.value,
                left: C + "px",
                top: _ + "px"
            }
        });
    let T;
    function m() {
        u.value == null || f.value == null || Ep(u.value, f.value, {
            middleware: o.value,
            placement: i.value,
            strategy: l.value
        }).then(A => {
            a.value = A.x,
            d.value = A.y,
            g.value = A.strategy,
            E.value = A.placement,
            x.value = A.middlewareData,
            O.value = !0
        })
    }
    function p() {
        typeof T == "function" && (T(), T = void 0)
    }
    function b() {
        if (p(), r === void 0) {
            m();
            return
        }
        if (u.value != null && f.value != null) {
            T = r(u.value, f.value, m);
            return
        }
    }
    function w() {
        s.value || (O.value = !1)
    }
    return Ne([o, i, l], m, {
        flush: "sync"
    }), Ne([u, f], b, {
        flush: "sync"
    }), Ne(s, w, {
        flush: "sync"
    }), Un() && $r(p), {
        x: Tt(a),
        y: Tt(d),
        strategy: Tt(g),
        placement: Tt(E),
        middlewareData: Tt(x),
        isPositioned: Tt(O),
        floatingStyles: I,
        update: m
    }
}
export { Bf as $, Eo as A, Pp as B, Tf as C, Ra as D, Co as E, he as F, Uf as G, Wn as H, Kp as I, hn as J, kl as K, re as L, Sf as M, ks as N, Dp as O, Qr as P, fo as Q, So as R, Ou as S, Wf as T, xp as U, Tp as V, Np as W, Fd as X, ht as Y, Xp as Z, Mp as _, Rp as a, jn as a0, le as a1, Oa as a2, mf as a3, yf as a4, kf as a5, Ao as a6, Md as a7, Nd as a8, ta as a9, dn as aa, oc as ab, bc as ac, Sc as ad, nn as ae, Su as af, $l as ag, Kf as ah, Hp as ai, jp as aj, An as ak, xo as al, qp as am, Yp as an, Lp as b, be as c, Ap as d, If as e, Xh as f, Wp as g, Ip as h, Bp as i, kp as j, rt as k, Vp as l, Fp as m, bt as n, _t as o, Xn as p, $c as q, ge as r, Op as s, al as t, $p as u, Up as v, Ne as w, Ta as x, jf as y, es as z };
