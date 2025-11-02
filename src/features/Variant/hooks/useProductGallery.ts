// // useProductGallery.ts
// "use client";

// import React, { useState } from "react";
// import { useGallery } from "./useGallery"; // import your hook
// import type { Product } from "@/types/printful_product";

// interface ProductGalleryProps {
//   product: Product;
// }

// export const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
//   const { galleryState, highlightedIdx, setHighlightedIdx, galleryByColor } =
//     useGallery(product);

//   const colors = Object.keys(galleryByColor);

//   const [selectedColor, setSelectedColor] = useState<string>(colors[0] || "default");

//   const imagesToShow = galleryByColor[selectedColor] || [];

//   return (
//     <div>
//       {/* Color swatches */}
//       <div className="flex gap-2 mb-4">
//         {colors.map((color) => (
//           <button
//             key={color}
//             style={{
//               backgroundColor: color !== "default" ? color.toLowerCase() : "#ccc",
//               border: selectedColor === color ? "2px solid black" : "1px solid gray",
//               width: 24,
//               height: 24,
//               borderRadius: "50%",
//             }}
//             onClick={() => setSelectedColor(color)}
//           />
//         ))}
//       </div>

//       {/* Gallery images */}
//       <div className="flex flex-col gap-2">
//         {imagesToShow.map((item, idx) => (
//           <img
//             key={item.key}
//             src={item.url}
//             alt={item.variantId ?? "product image"}
//             className={`cursor-pointer border ${
//               highlightedIdx === idx ? "border-black" : "border-gray-200"
//             }`}
//             onClick={() => setHighlightedIdx(idx)}
//           />
//         ))}
//       </div>

//       {/* Highlighted image */}
//       {imagesToShow[highlightedIdx] && (
//         <div className="mt-4">
//           <h4>Highlighted Image</h4>
//           <img
//             src={imagesToShow[highlightedIdx].url}
//             alt="highlighted"
//             className="w-full max-w-md"
//           />
//         </div>
//       )}
//     </div>
//   );
// };
