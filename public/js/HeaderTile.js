import { F as Te, u as ke, c as pe, b as Ae, h as Ce, j as Se, O as _e, l as we, t as Ie, m as J, v as se, Q as i, W as Oe, r as Fe, w as Ne, x as Re, n as Be, R as A, o as He, p as Z, z as le, y as Me, U as ge, I as b, E as ce, H as ue, J as de, V as Ue } from "./website.js";
import { A as Pe } from "./ActionLink.js";
import { _ as $e } from "./PictureContainer.vue_vue_type_script_setup_true_lang.js";
import { _ as Ge } from "./TileTitle.vue_vue_type_script_setup_true_lang.js";
import { A as We } from "./website-icons.js";
import { p as Ve, r as w, c as o, o as De, J as qe, v as ze, M as B, z as h, x as T, L as Q, A as j, Q as Xe, R as Qe, S as je, C as Ye, H, a0 as Je, D as f, E as x, G as K } from "./vendor.js";
function Ze(e) {
    switch (e) {
    case i.FULLSCREEN_CENTER:
        return "fullscreen-center";
    case i.FULLSCREEN_LEFT:
        return "fullscreen-left";
    case i.FULLSCREEN_CENTER_LEFT:
        return "fullscreen-center-left";
    case i.FULLSCREEN_RIGHT:
        return "fullscreen-right";
    case i.FULLSCREEN_BOTTOM:
        return "fullscreen-bottom";
    case i.FULLSCREEN_BOTTOM_RIGHT:
        return "fullscreen-bottom-right";
    case i.FULLSCREEN_BOTTOM_LEFT:
        return "fullscreen-bottom-left";
    case i.FULLSCREEN_TOP:
        return "fullscreen-top";
    case i.SIDEBAR_RIGHT:
        return "sidebar-right";
    case i.SIDEBAR_LEFT:
        return "sidebar-left";
    case i.HALFSCREEN_LEFT:
        return "halfscreen-left";
    case i.HALFSCREEN_CENTER:
        return "halfscreen-center";
    case i.COLLAGE_BOTTOM:
        return "collage-bottom";
    case i.COLLAGE_LEFT:
        return "collage-left";
    default:
        return "fullscreen-center"
    }
}
function Ke(e, n, t, r) {
    if (!(e === i.COLLAGE_BOTTOM || e === i.COLLAGE_LEFT) && !t)
        switch (n) {
        case A.NONE:
            return;
        case A.PARALLAX:
            return "ins-tile__background--parallax";
        case A.FIXED:
            return r ? void 0 : "ins-tile__background--fixed";
        case A.ZOOM_OUT:
            return "ins-tile__background--scale";
        default:
            return
        }
}
function xe(e, n, t) {
    const r = n / t;
    switch (e) {
    case i.HALFSCREEN_LEFT:
    case i.HALFSCREEN_CENTER:
        return r * 2;
    default:
        return r
    }
}
function en(e, n, t, r) {
    const l = n ?? 0,
        c = t ?? 0,
        u = r ?? 0,
        v = u / 4,
        y = -xe(e, u, 4),
        m = (l - c) / 4;
    return {
        transform: `translateY(${Math.min(v, Math.max(y, m))}px)`
    }
}
function nn(e, n, t) {
    const r = e ?? 0,
        s = n ?? 0,
        l = t ?? 0,
        c = l / .12,
        u = 1.3,
        v = 1,
        y = 1 - (r - s - l) / c,
        m = Math.min(u, Math.max(v, y));
    return Number.isNaN(m) ? {} : {
        transform: `scale(${m})`
    }
}
function tn(e, n, t, r, s, l) {
    if (!(typeof document > "u") && !l && !(e === i.COLLAGE_BOTTOM || e === i.COLLAGE_LEFT))
        switch (n) {
        case A.PARALLAX:
            return en(e, t, r, s);
        case A.ZOOM_OUT:
            return nn(t, r, s);
        default:
            return
        }
}
function on(e, n) {
    var k,
        p,
        M,
        U,
        P,
        g,
        I,
        $,
        G,
        W,
        V,
        D,
        O,
        q,
        C,
        S,
        _,
        F,
        N,
        z;
    const t = {
            ...n == null ? void 0 : n.general,
            ...e.general,
            background: {
                ...(k = n == null ? void 0 : n.general) == null ? void 0 : k.background,
                ...(p = e.general) == null ? void 0 : p.background,
                solid: {
                    ...(U = (M = n == null ? void 0 : n.general) == null ? void 0 : M.background) == null ? void 0 : U.solid,
                    ...(g = (P = e.general) == null ? void 0 : P.background) == null ? void 0 : g.solid
                },
                gradient: {
                    ...($ = (I = n == null ? void 0 : n.general) == null ? void 0 : I.background) == null ? void 0 : $.gradient,
                    ...(W = (G = e.general) == null ? void 0 : G.background) == null ? void 0 : W.gradient
                }
            }
        },
        r = {
            ...n == null ? void 0 : n.tagline,
            ...e.tagline
        },
        s = {
            ...n == null ? void 0 : n.headline,
            ...e.headline
        },
        l = {
            ...n == null ? void 0 : n.description,
            ...e.description
        },
        c = {
            ...n == null ? void 0 : n.primaryActionLink,
            ...e.primaryActionLink
        },
        u = {
            ...n == null ? void 0 : n.secondaryActionLink,
            ...e.secondaryActionLink
        },
        v = {
            ...n == null ? void 0 : n.mobileView,
            ...e.mobileView
        },
        y = {
            ...n == null ? void 0 : n.image,
            ...e.image,
            overlay: {
                ...(V = n == null ? void 0 : n.image) == null ? void 0 : V.overlay,
                ...(D = e.image) == null ? void 0 : D.overlay,
                solid: {
                    ...(q = (O = n == null ? void 0 : n.image) == null ? void 0 : O.overlay) == null ? void 0 : q.solid,
                    ...(S = (C = e.image) == null ? void 0 : C.overlay) == null ? void 0 : S.solid
                },
                gradient: {
                    ...(F = (_ = n == null ? void 0 : n.image) == null ? void 0 : _.overlay) == null ? void 0 : F.gradient,
                    ...(z = (N = e.image) == null ? void 0 : N.overlay) == null ? void 0 : z.gradient
                }
            }
        },
        m = {
            ...n == null ? void 0 : n.arrow,
            ...e.arrow
        },
        E = {
            ...n == null ? void 0 : n.sidebar,
            ...e.sidebar
        };
    return {
        layout: e.layout,
        general: t,
        tagline: r,
        headline: s,
        description: l,
        primaryActionLink: c,
        secondaryActionLink: u,
        mobileView: v,
        image: y,
        arrow: m,
        sidebar: E
    }
}
function rn(e) {
    let n = [];
    return (e == null ? void 0 : e.color) !== void 0 && (n = [...n, ...de("--arrow-color", e.color)]), n
}
function an(e) {
    let n = [];
    return (e == null ? void 0 : e.color) !== void 0 && (n = [...n, ...de("--sidebar-solid-color", e.color)]), n
}
function sn(e, n) {
    let t = [...He(e.general), ...Z("tagline", e.tagline), ...Z("headline", e.headline), ...Z("description", e.description), ...le("primary-button", e.primaryActionLink), ...le("secondary-button", e.secondaryActionLink), ...Me("image", e.image), ...an(e.sidebar)];
    return n && (t = [...t, ...rn(e.arrow)]), t
}
function ln(e, n, t, r) {
    const s = e ?? 0,
        l = n ?? 0,
        c = t ?? 0,
        u = r ?? 0;
    if (!s || !c)
        return [];
    const v = c / s,
        y = u / l;
    let m = s,
        E = l,
        k = 0,
        p = 0;
    return v < y ? (E = u / v, p = (l - E) / 2) : (m = c / y, k = (s - m) / 2), [{
        key: "--background-size-x",
        value: `${m + 1}px`
    }, {
        key: "--background-size-y",
        value: `${E + 1}px`
    }, {
        key: "--background-position-x",
        value: `${k - .5}px`
    }, {
        key: "--background-position-y",
        value: `${p - .5}px`
    }]
}
function cn(e, n, t, r) {
    var s,
        l,
        c,
        u;
    return n === A.FIXED && !ge() ? ln(t, r, (l = (s = e == null ? void 0 : e.set) == null ? void 0 : s["default-1200x1200"]) == null ? void 0 : l.width, (u = (c = e == null ? void 0 : e.set) == null ? void 0 : c["default-1200x1200"]) == null ? void 0 : u.height) : []
}
function un(e) {
    const n = w(0),
        t = w(0);
    function r() {
        e.value === void 0 || e.value === null || (n.value = e.value.offsetWidth, t.value = e.value.offsetHeight)
    }
    function s() {
        const l = Ue(r, 120);
        window.addEventListener("resize", l),
        r()
    }
    return {
        bgContainerWidth: n,
        bgContainerHeight: t,
        subscribeOnBackgroundOffsetChange: s
    }
}
function gn(e) {
    function n() {
        if (e.value === void 0)
            return;
        const t = e.value.offsetTop,
            r = e.value.offsetHeight;
        window.scrollTo({
            top: t + r,
            behavior: "smooth"
        })
    }
    return n
}
function dn(e) {
    switch (e) {
    case i.COLLAGE_BOTTOM:
    case i.COLLAGE_LEFT:
        return !0;
    default:
        return !1
    }
}
function mn(e) {
    switch (e) {
    case i.FULLSCREEN_CENTER:
    case i.FULLSCREEN_CENTER_LEFT:
    case i.FULLSCREEN_RIGHT:
        return !0;
    default:
        return !1
    }
}
function vn() {
    return [{
        thumbnail: b.url200,
        image1x: b.url1200,
        image2x: b.url1200
    }, {
        thumbnail: b.url200,
        image1x: b.url600,
        image2x: b.url1200,
        breakpointMediaQuery: ce(ue.S)
    }, {
        thumbnail: b.url200,
        image1x: b.url2000,
        image2x: b.url2000,
        breakpointMediaQuery: ce(ue.L)
    }]
}
const yn = Ve({
        components: {
            ArrowDownIcon: We,
            FontLoader: Te,
            ActionLink: Pe,
            TileTitle: Ge,
            PictureContainer: $e
        },
        props: {
            tileId: {
                required: !0,
                type: String
            },
            tileType: {
                required: !1,
                default: void 0,
                type: String
            },
            content: {
                required: !0,
                type: Object
            },
            design: {
                required: !0,
                type: Object
            },
            viewportSettings: {
                required: !0,
                type: Object
            },
            isFirstTileWithTitle: {
                required: !0,
                type: Boolean
            },
            isBackgroundSamePrev: {
                required: !0,
                type: Boolean
            },
            tileIndexInList: {
                required: !1,
                default: null,
                type: Number
            }
        },
        emits: ["tile-loaded", "tile-unloaded"],
        setup(e, {attrs: n, emit: t}) {
            const r = ke(),
                s = pe(),
                l = Ae(r.$state),
                c = w(),
                u = w(),
                {windowScrollTop: v, subscribeOnWindowScrollChange: y} = Ce(),
                {tileOffsetTop: m, tileOffsetHeight: E, subscribeOnTileOffsetChange: k} = Se(c),
                {bgContainerWidth: p, bgContainerHeight: M, subscribeOnBackgroundOffsetChange: U} = un(u),
                P = o(() => `ins-tile--${Ze(e.design.layout)}`),
                g = o(() => {
                    const a = _e(e.design.layout);
                    return on(e.design, a)
                }),
                I = w(!1),
                $ = () => {
                    I.value = ge()
                },
                G = w(!1),
                W = o(() => we(G, e.viewportSettings, v.value, m.value, E.value)),
                V = o(() => {
                    var a,
                        d,
                        L,
                        R,
                        ae;
                    return [(a = g.value.tagline) == null ? void 0 : a.font, (d = g.value.headline) == null ? void 0 : d.font, (L = g.value.description) == null ? void 0 : L.font, (R = g.value.primaryActionLink) == null ? void 0 : R.font, (ae = g.value.secondaryActionLink) == null ? void 0 : ae.font]
                }),
                D = o(() => dn(e.design.layout)),
                O = o(() => mn(e.design.layout)),
                q = o(() => {
                    var d;
                    let a = [];
                    return a = [...sn(g.value, O.value), ...cn(e.content.image, (d = g.value.image) == null ? void 0 : d.scrollEffect, p.value, M.value)], Ie(`#${n.id}`, a)
                }),
                C = o(() => {
                    var L;
                    const a = (L = g.value.tagline) == null ? void 0 : L.visible,
                        d = J(e.content.tagline);
                    return a && d
                }),
                S = o(() => {
                    var L;
                    const a = (L = g.value.headline) == null ? void 0 : L.visible,
                        d = J(e.content.headline);
                    return a && d
                }),
                _ = o(() => {
                    var L;
                    const a = (L = g.value.description) == null ? void 0 : L.visible,
                        d = J(e.content.description);
                    return a && d
                }),
                F = o(() => e.content.image !== void 0),
                N = o(() => {
                    var d;
                    return ((d = g.value.arrow) == null ? void 0 : d.visible) && O.value
                }),
                z = gn(c),
                ee = o(() => e.content.primaryActionLink),
                ne = o(() => g.value.primaryActionLink),
                te = o(() => e.content.secondaryActionLink),
                ie = o(() => g.value.secondaryActionLink),
                oe = s.isPreviewMode,
                Y = o(() => {
                    const a = se(ee, ne),
                        d = se(te, ie);
                    return a || d
                }),
                X = o(() => {
                    var R;
                    const a = e.design.layout !== i.COLLAGE_BOTTOM && e.design.layout !== i.COLLAGE_LEFT && e.design.layout !== i.SIDEBAR_LEFT && e.design.layout !== i.SIDEBAR_RIGHT,
                        d = (R = e.design.mobileView) == null ? void 0 : R.adaptiveCover,
                        L = e.viewportSettings.width !== void 0 && e.viewportSettings.width < Oe;
                    return d && L && a
                }),
                me = o(() => !X.value || S.value || C.value || _.value || Y.value),
                ve = o(() => {
                    var a;
                    return Ke(e.design.layout, (a = g.value.image) == null ? void 0 : a.scrollEffect, X.value, I.value)
                }),
                ye = o(() => {
                    var a;
                    return tn(e.design.layout, (a = g.value.image) == null ? void 0 : a.scrollEffect, v.value, m.value, E.value, X.value)
                }),
                re = o(() => Fe(e.tileId, "image")),
                Le = o(() => re.value !== void 0),
                he = o(() => Ne(re.value, e.content.image)),
                Ee = o(() => vn()),
                fe = o(() => oe || C.value || S.value || _.value || F.value || Y.value || N);
            De(() => {
                t("tile-loaded"),
                y(),
                k(),
                U(),
                $()
            }),
            qe(() => {
                t("tile-unloaded")
            });
            const be = Re(e.tileIndexInList);
            return {
                i18n: l,
                tileRef: c,
                bgContainerRef: u,
                layoutClass: P,
                fonts: V,
                styleSelector: q,
                hasTagline: C,
                hasHeadline: S,
                hasDescription: _,
                hasImage: F,
                layoutHasInlineImage: D,
                hasAnyActionLink: Y,
                hasArrow: N,
                performArrowAction: z,
                primaryActionLinkContent: ee,
                primaryActionLinkDesign: ne,
                secondaryActionLinkContent: te,
                secondaryActionLinkDesign: ie,
                isAdaptiveCover: X,
                isPreview: oe,
                isShowTileTextContent: me,
                scrollEffectClass: ve,
                scrollEffectStyle: ye,
                isUploadingImage: Le,
                isTileShown: W,
                tileNeedRender: fe,
                imageSet: he,
                imageBreakpointSet: Ee,
                getAndAssignFetchPriority: be,
                cleanHtmlTagsIfEnabled: Be
            }
        }
    }),
    Ln = yn,
    hn = ["aria-label"],
    En = {
        key: 1,
        class: "ins-tile__wrap ins-tile__animated"
    },
    fn = ["innerHTML"],
    bn = {
        class: "ins-tile__footer"
    },
    Tn = ["innerHTML"],
    kn = {
        key: 1,
        class: "ins-tile__buttons"
    },
    pn = x("div", {
        class: "ins-tile__spacer"
    }, null, -1),
    An = {
        key: 3,
        class: "ins-tile__arrow"
    },
    Cn = ["aria-label"];
function Sn(e, n, t, r, s, l) {
    const c = B("FontLoader"),
        u = B("PictureContainer"),
        v = B("TileTitle"),
        y = B("ActionLink"),
        m = B("ArrowDownIcon");
    return e.tileNeedRender ? (h(), T("div", {
        key: 0,
        ref: "tileRef",
        role: "region",
        "aria-label": e.content.headline,
        class: H(["ins-tile", "ins-tile--cover", e.layoutClass, {
            "ins-tile--adaptive": e.isAdaptiveCover && e.hasImage
        }, {
            "ins-tile--shown": e.isTileShown
        }, {
            "ins-tile--same-prev-background": e.isBackgroundSamePrev
        }])
    }, [Q(c, {
        fonts: e.fonts
    }, null, 8, ["fonts"]), (h(), j(Ye("style"), null, {
        default: Xe(() => [Qe(je(e.styleSelector), 1)]),
        _: 1
    })), e.layoutHasInlineImage ? f("", !0) : (h(), T("div", {
        key: 0,
        ref: "bgContainerRef",
        class: H(["ins-tile__background", e.scrollEffectClass])
    }, [e.hasImage || e.isUploadingImage ? (h(), j(u, {
        key: 0,
        "image-set": e.imageSet,
        "image-breakpoint-set": e.imageBreakpointSet,
        "use-background-layout": !e.isAdaptiveCover,
        class: H({
            "ins-tile__image": !0,
            "ins-tile__image--loading": e.isUploadingImage
        }),
        "fetch-priority": e.getAndAssignFetchPriority(),
        style: Je([e.scrollEffectStyle])
    }, null, 8, ["image-set", "image-breakpoint-set", "use-background-layout", "class", "fetch-priority", "style"])) : f("", !0)], 2)), e.isShowTileTextContent ? (h(), T("div", En, [e.hasTagline ? (h(), T("div", {
        key: 0,
        role: "heading",
        "aria-level": "2",
        class: "ins-tile__tagline",
        innerHTML: e.cleanHtmlTagsIfEnabled(e.content.tagline)
    }, null, 8, fn)) : f("", !0), e.layoutHasInlineImage ? (h(), T("div", {
        key: 1,
        class: H(["ins-tile__background", e.scrollEffectClass])
    }, [e.hasImage || e.isUploadingImage ? (h(), j(u, {
        key: 0,
        "image-set": e.imageSet,
        "image-breakpoint-set": e.imageBreakpointSet,
        "use-background-layout": !e.isAdaptiveCover,
        class: H({
            "ins-tile__image": !0,
            "ins-tile__image--loading": e.isUploadingImage
        })
    }, null, 8, ["image-set", "image-breakpoint-set", "use-background-layout", "class"])) : f("", !0)], 2)) : f("", !0), e.hasHeadline ? (h(), j(v, {
        key: 2,
        class: "ins-tile__headline",
        title: e.content.headline,
        "is-first-tile-with-title": e.isFirstTileWithTitle
    }, null, 8, ["title", "is-first-tile-with-title"])) : f("", !0), x("div", bn, [e.hasDescription ? (h(), T("div", {
        key: 0,
        class: "ins-tile__description ins-tile__format",
        innerHTML: e.cleanHtmlTagsIfEnabled(e.content.description)
    }, null, 8, Tn)) : f("", !0), e.hasAnyActionLink ? (h(), T("div", kn, [Q(y, {
        content: e.primaryActionLinkContent,
        design: e.primaryActionLinkDesign,
        "preview-mode": e.isPreview,
        class: "ins-tile__button ins-tile__button--primary"
    }, null, 8, ["content", "design", "preview-mode"]), Q(y, {
        content: e.secondaryActionLinkContent,
        design: e.secondaryActionLinkDesign,
        "preview-mode": e.isPreview,
        class: "ins-tile__button ins-tile__button--secondary"
    }, null, 8, ["content", "design", "preview-mode"])])) : f("", !0)]), pn, e.hasArrow ? (h(), T("div", An, [x("div", {
        role: "button",
        "aria-label": e.i18n("Cover.NextTab.Icon.ADA.context"),
        tabindex: "0",
        class: "ins-tile__arrow-inner",
        onClick: n[0] || (n[0] = (...E) => e.performArrowAction && e.performArrowAction(...E))
    }, [Q(m)], 8, Cn)])) : f("", !0)])) : f("", !0), K(e.$slots, "hover-label"), K(e.$slots, "hovered-border"), K(e.$slots, "selected-border")], 10, hn)) : f("", !0)
}
const Rn = ze(Ln, [["render", Sn]]);
export { Rn as default };
