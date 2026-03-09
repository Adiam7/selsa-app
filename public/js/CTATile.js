import { c as De, h as Pe, j as Ge, q as Ve, l as We, t as Ue, m as oe, r as $e, v as Qe, w as Ye, x as ze, F as Je, n as je, C as t, o as qe, p as re, y as Ke, z as Xe, B as Ze, I as o, E as p, H as f, J as et } from "./website.js";
import { A as tt } from "./ActionLink.js";
import { _ as at } from "./PictureContainer.vue_vue_type_script_setup_true_lang.js";
import { _ as it } from "./TileTitle.vue_vue_type_script_setup_true_lang.js";
import { p as nt, a9 as st, r as ce, c as i, o as lt, J as ot, z as c, x as d, L as y, A as ue, Q as rt, R as ct, S as ut, C as dt, E as de, aa as T, H as ge, D as u, G as h } from "./vendor.js";
import "./website-icons.js";
const gt = ["aria-label"],
    mt = {
        class: "ins-tile__wrap ins-tile__animated"
    },
    vt = {
        key: 0,
        class: "ins-tile__image"
    },
    _t = {
        key: 1,
        class: "ins-tile__body"
    },
    pt = {
        class: "ins-tile__body-inner"
    },
    ft = ["innerHTML"],
    St = nt({
        __name: "CTATile",
        props: {
            tileId: {},
            tileIndexInList: {
                default: void 0
            },
            content: {},
            design: {},
            viewportSettings: {},
            isFirstTileWithTitle: {
                type: Boolean
            },
            isBackgroundSamePrev: {
                type: Boolean
            },
            tileType: {
                default: void 0
            }
        },
        emits: ["tile-loaded", "tile-unloaded"],
        setup(me, {emit: ve}) {
            function _e(e) {
                switch (e) {
                case t.BANNER_CENTER:
                    return "banner-center";
                case t.BANNER_RIGHT:
                    return "banner-right";
                case t.BANNER_BOTTOM:
                    return "banner-bottom";
                case t.BANNER_LEFT:
                    return "banner-left";
                case t.PROMO_BAR_LEFT:
                    return "promo-bar-left";
                case t.PROMO_BAR_RIGHT:
                    return "promo-bar-right";
                case t.STORY_RIGHT:
                    return "story-right";
                case t.STORY_LEFT:
                    return "story-left";
                case t.FULLWIDTH_CENTER:
                    return "fullwidth-center";
                case t.FULLWIDTH_LEFT:
                    return "fullwidth-left";
                default:
                    return "banner-left"
                }
            }
            function pe(e) {
                let a = [];
                return (e == null ? void 0 : e.color) !== void 0 && (a = [...a, ...et("--sidebar-solid-color", e.color)]), a
            }
            function fe(e, a) {
                let n;
                return (e.layout === t.PROMO_BAR_LEFT || e.layout === t.PROMO_BAR_RIGHT) && (n = e == null ? void 0 : e.sidebar), [...qe(e.general), ...re("title", e.title), ...re("description", e.description), ...Ke("image", e.image), ...Xe("button", e.actionLink), ...Ze("image", a), ...pe(n)]
            }
            function ye(e) {
                switch (e) {
                case t.BANNER_CENTER:
                case t.BANNER_LEFT:
                case t.BANNER_RIGHT:
                case t.BANNER_BOTTOM:
                case t.FULLWIDTH_CENTER:
                case t.FULLWIDTH_LEFT:
                    return [{
                        image1x: o.urlCropped500,
                        image2x: o.urlCropped1000
                    }, {
                        image1x: o.url1200,
                        image2x: o.url2000,
                        breakpointMediaQuery: p(f.S)
                    }, {
                        image1x: o.url2000,
                        image2x: o.url2000,
                        breakpointMediaQuery: p(f.L)
                    }];
                case t.PROMO_BAR_LEFT:
                case t.PROMO_BAR_RIGHT:
                case t.STORY_LEFT:
                case t.STORY_RIGHT:
                    return [{
                        image1x: o.url600,
                        image2x: o.url1200
                    }, {
                        image1x: o.url1200,
                        image2x: o.url2000,
                        breakpointMediaQuery: p(f.S)
                    }];
                default:
                    return []
                }
            }
            const s = me,
                b = ve,
                Te = st(),
                he = De(),
                k = ce(),
                {windowScrollTop: be, subscribeOnWindowScrollChange: ke} = Pe(),
                {tileOffsetTop: Re, tileOffsetHeight: Se, subscribeOnTileOffsetChange: Le} = Ge(k),
                Ee = i(() => `ins-tile--${_e(s.design.layout)}`),
                l = i(() => Ve(s.design.layout)),
                r = i(() => {
                    var O,
                        A,
                        N,
                        C,
                        w,
                        F,
                        H,
                        M,
                        x,
                        D,
                        P,
                        G,
                        V,
                        W,
                        U,
                        $,
                        Q,
                        Y,
                        z,
                        J,
                        j,
                        q,
                        K,
                        X,
                        Z,
                        ee,
                        te,
                        ae,
                        ie,
                        ne,
                        se,
                        le;
                    const e = s.design,
                        a = {
                            ...(O = l.value) == null ? void 0 : O.general,
                            ...e.general,
                            background: {
                                ...(N = (A = l.value) == null ? void 0 : A.general) == null ? void 0 : N.background,
                                ...(C = e.general) == null ? void 0 : C.background,
                                solid: {
                                    ...(H = (F = (w = l.value) == null ? void 0 : w.general) == null ? void 0 : F.background) == null ? void 0 : H.solid,
                                    ...(x = (M = e.general) == null ? void 0 : M.background) == null ? void 0 : x.solid
                                },
                                gradient: {
                                    ...(G = (P = (D = l.value) == null ? void 0 : D.general) == null ? void 0 : P.background) == null ? void 0 : G.gradient,
                                    ...(W = (V = e.general) == null ? void 0 : V.background) == null ? void 0 : W.gradient
                                }
                            }
                        },
                        n = {
                            ...(U = l.value) == null ? void 0 : U.title,
                            ...e.title
                        },
                        B = {
                            ...($ = l.value) == null ? void 0 : $.description,
                            ...e.description
                        },
                        He = {
                            ...(Q = l.value) == null ? void 0 : Q.actionLink,
                            ...e.actionLink
                        },
                        Me = {
                            ...(Y = l.value) == null ? void 0 : Y.image,
                            ...e.image,
                            overlay: {
                                ...(J = (z = l.value) == null ? void 0 : z.image) == null ? void 0 : J.overlay,
                                ...(j = e.image) == null ? void 0 : j.overlay,
                                solid: {
                                    ...(X = (K = (q = l.value) == null ? void 0 : q.image) == null ? void 0 : K.overlay) == null ? void 0 : X.solid,
                                    ...(ee = (Z = e.image) == null ? void 0 : Z.overlay) == null ? void 0 : ee.solid
                                },
                                gradient: {
                                    ...(ie = (ae = (te = l.value) == null ? void 0 : te.image) == null ? void 0 : ae.overlay) == null ? void 0 : ie.gradient,
                                    ...(se = (ne = e.image) == null ? void 0 : ne.overlay) == null ? void 0 : se.gradient
                                }
                            }
                        },
                        xe = {
                            ...(le = l.value) == null ? void 0 : le.sidebar,
                            ...e.sidebar
                        };
                    return {
                        layout: e.layout,
                        general: a,
                        title: n,
                        description: B,
                        actionLink: He,
                        image: Me,
                        sidebar: xe
                    }
                }),
                Ie = ce(!1),
                Be = i(() => We(Ie, s.viewportSettings, be.value, Re.value, Se.value)),
                Oe = i(() => {
                    var e,
                        a,
                        n;
                    return [(e = r.value.title) == null ? void 0 : e.font, (a = r.value.description) == null ? void 0 : a.font, (n = r.value.actionLink) == null ? void 0 : n.font]
                }),
                Ae = i(() => {
                    const e = fe(r.value, s.content.image);
                    return Ue(`#${Te.id}`, e)
                }),
                g = i(() => {
                    var n;
                    const e = (n = r.value.title) == null ? void 0 : n.visible,
                        a = oe(s.content.title);
                    return e && a
                }),
                m = i(() => {
                    var n;
                    const e = (n = r.value.description) == null ? void 0 : n.visible,
                        a = oe(s.content.description);
                    return e && a
                }),
                v = i(() => {
                    var n;
                    const e = (n = r.value.image) == null ? void 0 : n.visible,
                        a = s.content.image !== void 0;
                    return e && a
                }),
                R = i(() => $e(s.tileId, "image")),
                _ = i(() => R.value !== void 0),
                S = i(() => s.content.actionLink),
                L = i(() => r.value.actionLink),
                E = i(() => Qe(S, L)),
                I = he.isPreviewMode,
                Ne = i(() => Ye(R.value, s.content.image)),
                Ce = i(() => ye(r.value.layout)),
                we = i(() => I || g.value || m.value || E.value || v.value);
            lt(() => {
                b("tile-loaded"),
                ke(),
                Le()
            }),
            ot(() => {
                b("tile-unloaded")
            });
            const Fe = ze(s.tileIndexInList);
            return (e, a) => we.value ? (c(), d("div", {
                key: 0,
                ref_key: "tileRef",
                ref: k,
                role: "region",
                "aria-label": e.content.title,
                class: ge(["ins-tile", "ins-tile--cta", Ee.value, {
                    "ins-tile--shown": Be.value
                }, {
                    "ins-tile--has-image": v.value || _.value
                }, {
                    "ins-tile--same-prev-background": e.isBackgroundSamePrev
                }])
            }, [y(Je, {
                fonts: Oe.value
            }, null, 8, ["fonts"]), (c(), ue(dt("style"), null, {
                default: rt(() => [ct(ut(Ae.value), 1)]),
                _: 1
            })), de("div", mt, [v.value || _.value ? (c(), d("div", vt, [y(at, {
                "image-set": Ne.value,
                "image-breakpoint-set": Ce.value,
                "has-thumbnail": !1,
                "allow-contain-layout": !0,
                "fetch-priority": T(Fe)(),
                class: ge({
                    "ins-tile__picture": !0,
                    "ins-tile__picture--loading": _.value
                })
            }, null, 8, ["image-set", "image-breakpoint-set", "fetch-priority", "class"])])) : u("", !0), g.value || m.value || E.value ? (c(), d("div", _t, [de("div", pt, [g.value ? (c(), ue(it, {
                key: 0,
                class: "ins-tile__title",
                title: e.content.title,
                "is-first-tile-with-title": e.isFirstTileWithTitle
            }, null, 8, ["title", "is-first-tile-with-title"])) : u("", !0), m.value ? (c(), d("div", {
                key: 1,
                role: "heading",
                "aria-level": "2",
                class: "ins-tile__description ins-tile__format",
                innerHTML: T(je)(e.content.description)
            }, null, 8, ft)) : u("", !0), y(tt, {
                content: S.value,
                design: L.value,
                "preview-mode": T(I),
                class: "ins-tile__button"
            }, null, 8, ["content", "design", "preview-mode"])])])) : u("", !0)]), h(e.$slots, "hover-label"), h(e.$slots, "hovered-border"), h(e.$slots, "selected-border")], 10, gt)) : u("", !0)
        }
    });
export { St as default };
