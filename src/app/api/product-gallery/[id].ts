// // pages/api/product-gallery/[id].ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { fetch_printful_product_detail } from "printful_sync/services.py";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { id } = req.query;

//   if (!id) return res.status(400).json({ error: "Missing product id" });

//   try {
//     const raw = await fetch_printful_product_detail(Number(id));

//     const product = raw.result?.sync_product;
//     const variants = raw.result?.sync_variants ?? [];

//     const seen = new Set<string>();
//     const gallery: string[] = [];

//     // 1️⃣ Main product image
//     if (product?.image) {
//       seen.add(product.image);
//       gallery.push(product.image);
//     }

//     // 2️⃣ Variant mockups (only type === "mockup")
//     for (const v of variants) {
//       for (const f of v.files ?? []) {
//         if (f.type !== "mockup") continue;
//         const url = f.preview_url ?? f.thumbnail_url ?? f.url;
//         if (url && !seen.has(url)) {
//           seen.add(url);
//           gallery.push(url);
//         }
//       }
//     }

//     res.status(200).json({ gallery });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch product gallery" });
//   }
// }
