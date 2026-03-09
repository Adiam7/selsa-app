import "./website.js";
import "./vendor.js";
import { p as s, x as t, aa as i, z as l } from "./vendor.js";
const o = ["innerHTML"],
    r = ["innerHTML"],
    m = s({
        __name: "TileTitle",
        props: {
            title: {},
            isFirstTileWithTitle: {
                type: Boolean
            }
        },
        setup(a) {
            return (e, p) => e.isFirstTileWithTitle ? (l(), t("h1", {
                key: 0,
                innerHTML: i(e.title)
            }, null, 8, o)) : (l(), t("h2", {
                key: 1,
                innerHTML: i(e.title)
            }, null, 8, r))
        }
    });
export { m as _ };