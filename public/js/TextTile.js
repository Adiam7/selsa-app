import { c as re, h as ue, j as ce, k as de, l as ve, t as fe, m as c, F as Te, n as U, T as i, o as be, p as d } from "./website.js";
import { _ as ge } from "./TileTitle.vue_vue_type_script_setup_true_lang.js";
import { p as pe, a9 as me, r as W, c as l, o as Se, J as he, z as r, x as v, L as _e, A as F, Q as ye, R as Ce, S as ke, C as we, E as Le, D as u, aa as $, G as f, H as Ee } from "./vendor.js";
const Ne = ["aria-label"],
    Oe = {
        class: "ins-tile__wrap ins-tile__animated"
    },
    He = ["innerHTML"],
    Ie = ["innerHTML"],
    De = pe({
        __name: "TextTile",
        props: {
            content: {},
            design: {},
            viewportSettings: {},
            isFirstTileWithTitle: {
                type: Boolean
            },
            isBackgroundSamePrev: {
                type: Boolean
            }
        },
        emits: ["tile-loaded", "tile-unloaded"],
        setup(P, {emit: G}) {
            function x(e) {
                switch (e) {
                case i.TITLE_LEFT:
                    return "title-left";
                case i.SUBTITLE_RIGHT:
                    return "subtitle-right";
                case i.ONE_COLUMN:
                    return "one-column";
                case i.TWO_COLUMNS:
                    return "two-columns";
                case i.CENTER:
                    return "center";
                case i.DESCRIPTION_RIGHT:
                    return "description-right";
                default:
                    return "title-left"
                }
            }
            function z(e, s) {
                let t = [...be(e.general), ...d("title", e.title), ...d("description", e.description)];
                return s && (t = [...t, ...d("subtitle", e.subtitle)]), t
            }
            function A(e) {
                return e === i.ONE_COLUMN || e === i.TITLE_LEFT || e === i.SUBTITLE_RIGHT || e === i.TWO_COLUMNS || e === i.CENTER
            }
            const o = P,
                T = G,
                j = me(),
                J = re(),
                b = W(),
                {windowScrollTop: Q, subscribeOnWindowScrollChange: q} = ue(),
                {tileOffsetTop: K, tileOffsetHeight: X, subscribeOnTileOffsetChange: Y} = ce(b),
                Z = l(() => `ins-tile--${x(o.design.layout)}`),
                a = l(() => de(o.design.layout)),
                n = l(() => {
                    var h,
                        _,
                        y,
                        C,
                        k,
                        w,
                        L,
                        E,
                        N,
                        O,
                        H,
                        I,
                        R,
                        B,
                        M,
                        D,
                        V;
                    const e = o.design,
                        s = {
                            ...(h = a.value) == null ? void 0 : h.general,
                            ...e.general,
                            background: {
                                ...(y = (_ = a.value) == null ? void 0 : _.general) == null ? void 0 : y.background,
                                ...(C = e.general) == null ? void 0 : C.background,
                                solid: {
                                    ...(L = (w = (k = a.value) == null ? void 0 : k.general) == null ? void 0 : w.background) == null ? void 0 : L.solid,
                                    ...(N = (E = e.general) == null ? void 0 : E.background) == null ? void 0 : N.solid
                                },
                                gradient: {
                                    ...(I = (H = (O = a.value) == null ? void 0 : O.general) == null ? void 0 : H.background) == null ? void 0 : I.gradient,
                                    ...(B = (R = e.general) == null ? void 0 : R.background) == null ? void 0 : B.gradient
                                }
                            }
                        },
                        t = {
                            ...(M = a.value) == null ? void 0 : M.title,
                            ...e.title
                        },
                        oe = {
                            ...(D = a.value) == null ? void 0 : D.subtitle,
                            ...e.subtitle
                        },
                        ae = {
                            ...(V = a.value) == null ? void 0 : V.description,
                            ...e.description
                        };
                    return {
                        layout: e.layout,
                        general: s,
                        title: t,
                        subtitle: oe,
                        description: ae
                    }
                }),
                ee = W(!1),
                te = l(() => ve(ee, o.viewportSettings, Q.value, K.value, X.value)),
                se = l(() => {
                    var e,
                        s,
                        t;
                    return [(e = n.value.title) == null ? void 0 : e.font, (s = n.value.subtitle) == null ? void 0 : s.font, (t = n.value.description) == null ? void 0 : t.font]
                }),
                g = l(() => A(n.value.layout)),
                ie = l(() => {
                    const e = z(n.value, g.value);
                    return fe(`#${j.id}`, e)
                }),
                p = l(() => {
                    var t;
                    const e = (t = n.value.title) == null ? void 0 : t.visible,
                        s = c(o.content.title);
                    return e && s
                }),
                m = l(() => {
                    var t;
                    const e = (t = n.value.subtitle) == null ? void 0 : t.visible,
                        s = c(o.content.subtitle);
                    return e && s
                }),
                S = l(() => {
                    var t;
                    const e = (t = n.value.description) == null ? void 0 : t.visible,
                        s = c(o.content.description);
                    return e && s
                }),
                le = J.isPreviewMode,
                ne = l(() => le || p.value || m.value || S.value);
            return Se(() => {
                T("tile-loaded"),
                q(),
                Y()
            }), he(() => {
                T("tile-unloaded")
            }), (e, s) => ne.value ? (r(), v("div", {
                key: 0,
                ref_key: "tileRef",
                ref: b,
                role: "region",
                "aria-label": e.content.title || e.content.subtitle,
                class: Ee(["ins-tile", "ins-tile--text", Z.value, {
                    "ins-tile--shown": te.value
                }, {
                    "ins-tile--same-prev-background": e.isBackgroundSamePrev
                }])
            }, [_e(Te, {
                fonts: se.value
            }, null, 8, ["fonts"]), (r(), F(we("style"), null, {
                default: ye(() => [Ce(ke(ie.value), 1)]),
                _: 1
            })), Le("div", Oe, [p.value ? (r(), F(ge, {
                key: 0,
                class: "ins-tile__title",
                title: e.content.title,
                "is-first-tile-with-title": e.isFirstTileWithTitle
            }, null, 8, ["title", "is-first-tile-with-title"])) : u("", !0), m.value && g.value ? (r(), v("div", {
                key: 1,
                role: "heading",
                "aria-level": "2",
                class: "ins-tile__subtitle ins-tile__format",
                innerHTML: $(U)(e.content.subtitle)
            }, null, 8, He)) : u("", !0), S.value ? (r(), v("div", {
                key: 2,
                class: "ins-tile__description ins-tile__format",
                innerHTML: $(U)(e.content.description)
            }, null, 8, Ie)) : u("", !0)]), f(e.$slots, "hover-label"), f(e.$slots, "hovered-border"), f(e.$slots, "selected-border")], 10, Ne)) : u("", !0)
        }
    });
export { De as default };
