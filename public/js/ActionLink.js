// Ensure that 'K' and 'M' are exported from './website.js'
import { K as f, M as g } from "./website.js";
import { a as h } from "./website-icons.js";
import { p as C, c as a, t as b, v, M as L, z as e, x as A, A as c, Q as d, E as o, S as u, H as t, a8 as p, C as m, D as s, L as y } from "./vendor.js";
const w = C({
        components: {
            ControlLinkIcon: h
        },
        props: {
            content: {
                required: !0,
                type: Object
            },
            design: {
                required: !0,
                type: Object
            },
            tag: {
                required: !1,
                type: String,
                default: f.A
            }
        },
        setup(n) {
            const i = a(() => n.content),
                r = a(() => n.design),
                l = g(i, r);
            return {
                ...b(l)
            }
        }
    }),
    B = {
        class: "ins-control__button"
    },
    S = {
        class: "ins-control__wrap"
    },
    _ = {
        class: "ins-control__text"
    },
    E = {
        class: "ins-control__wrap"
    },
    M = {
        class: "ins-control__text"
    },
    T = {
        class: "ins-control__icon"
    };
function $(n, i, r, l, q, D) {
    const k = L("ControlLinkIcon");
    return n.hasElement ? (e(), A("div", {
        key: 0,
        class: t({
            "ins-button-wrap": n.isButton,
            "ins-link-wrap": n.isText
        })
    }, [n.isButton ? (e(), c(m(n.tag), {
        key: 0,
        tabindex: "0",
        role: "button",
        href: n.href,
        target: n.linkTarget,
        "aria-label": n.title,
        class: t({
            "ins-control": !0,
            "ins-control--button": !0,
            "ins-control--outline": n.isOutline,
            "ins-control--solid": n.isSolid,
            "ins-control--small": n.isSmall,
            "ins-control--medium": n.isMedium,
            "ins-control--large": n.isLarge,
            "ins-control--rect": n.isRect,
            "ins-control--pill": n.isPill,
            "ins-control--round": n.isRound
        }),
        onClick: p(n.performAction, ["prevent", "stop"])
    }, {
        default: d(() => [o("div", B, [o("div", S, [o("div", _, u(n.title), 1)])])]),
        _: 1
    }, 8, ["href", "target", "aria-label", "class", "onClick"])) : s("", !0), n.isText ? (e(), c(m(n.tag), {
        key: 1,
        role: "link",
        href: n.href,
        target: n.linkTarget,
        "aria-label": n.title,
        class: t({
            "ins-control": !0,
            "ins-control--link": !0,
            "ins-control--small": n.isSmall,
            "ins-control--medium": n.isMedium,
            "ins-control--large": n.isLarge
        }),
        tabindex: "0",
        onClick: p(n.performAction, ["prevent", "stop"])
    }, {
        default: d(() => [o("div", E, [o("div", M, u(n.title), 1), o("div", T, [y(k)])])]),
        _: 1
    }, 8, ["href", "target", "aria-label", "class", "onClick"])) : s("", !0)], 2)) : s("", !0)
}
const R = v(w, [["render", $]]);
export { R as A };
