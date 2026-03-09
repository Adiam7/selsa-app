// import React, { useState } from "react";
// import Image from "next/image";

// interface PrintfulVariant {
//   printful_variant_id: number;
//   name: string;
//   price: string;
//   sku?: string | null;
//   image_url?: string | null;
// }

// interface PrintfulProduct {
//   id: number;
//   printful_id: number;
//   name: string;
//   description?: string;
//   image_url?: string | null;
//   variants: PrintfulVariant[];
// }

// async function fetchPrintfulProduct(id: string): Promise<PrintfulProduct> {
//   const res = await fetch(`http://localhost:8000/api/printful/products/${id}/`, {
//     cache: "no-store",
//   });
//   if (!res.ok) {
//     throw new Error("Failed to fetch Printful product");
//   }
//   return res.json();
// }

// export default async function PrintfulProductDetailPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   let product: PrintfulProduct;

//   try {
//     product = await fetchPrintfulProduct(params.id);
//   } catch (error) {
//     return (
//       <div className="max-w-3xl mx-auto py-10 text-center">
//         <h1 className="text-2xl font-semibold text-red-600">
//           Error loading product
//         </h1>
//         <p className="text-gray-500">{(error as Error).message}</p>
//       </div>
//     );
//   }

//   const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
//     null
//   );
//   const [quantity, setQuantity] = useState(1);

//   const lowestPrice = Math.min(
//     ...product.variants.map((v) => Number(v.price))
//   );

//   const handleAddToCart = () => {
//     if (!selectedVariantId) {
//       alert("Please select a variant before adding to cart.");
//       return;
//     }
//     alert(
//       `Added variant ${selectedVariantId} x${quantity} of "${product.name}" to cart`
//     );
//   };

//   const isColorVariant = (variantName: string) =>
//     variantName.toLowerCase().includes("color") ||
//     variantName.toLowerCase().includes("colour") ||
//     variantName.toLowerCase().includes("white") ||
//     variantName.toLowerCase().includes("black") ||
//     variantName.toLowerCase().includes("red") ||
//     variantName.toLowerCase().includes("blue") ||
//     variantName.toLowerCase().includes("green");

//   return (
//     <section className="product-detail-container flex flex-col md:flex-row gap-8 px-6 py-10 max-w-7xl mx-auto">
//       {/* Product Image */}
//       <div className="flex flex-col gap-4">
//         {product.image_url ? (
//           <Image
//             src={product.image_url}
//             alt={product.name}
//             width={500}
//             height={500}
//             className="rounded-xl object-cover"
//           />
//         ) : (
//           <div className="bg-gray-200 w-[500px] h-[500px] flex items-center justify-center rounded-xl">
//             No Image
//           </div>
//         )}
//       </div>

//       {/* Product Info */}
//       <div className="flex-1">
//         <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
//         <p className="text-xl text-primary mb-4">
//           From ${lowestPrice.toFixed(2)}
//         </p>

//         {/* Variants - Swatch Picker & Segmented Controls */}
//         <div className="space-y-4 mb-6">
//           <label className="block font-medium text-gray-800">
//             Select a variant:
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {product.variants.map((variant) =>
//               isColorVariant(variant.name) ? (
//                 // Swatch Picker
//                 <button
//                   key={variant.printful_variant_id}
//                   type="button"
//                   onClick={() =>
//                     setSelectedVariantId(variant.printful_variant_id)
//                   }
//                   className={`w-10 h-10 rounded-full border-2 transition-all
//                     ${
//                       selectedVariantId === variant.printful_variant_id
//                         ? "border-blue-600 scale-110"
//                         : "border-gray-300"
//                     }
//                   `}
//                   style={{
//                     backgroundColor: variant.name.toLowerCase(),
//                   }}
//                   title={variant.name}
//                 />
//               ) : (
//                 // Segmented Control
//                 <button
//                   key={variant.printful_variant_id}
//                   type="button"
//                   onClick={() =>
//                     setSelectedVariantId(variant.printful_variant_id)
//                   }
//                   className={`px-4 py-2 rounded border transition-all
//                     ${
//                       selectedVariantId === variant.printful_variant_id
//                         ? "bg-blue-600 text-white border-blue-600"
//                         : "bg-white border-gray-300 text-gray-800 hover:border-blue-600"
//                     }
//                   `}
//                 >
//                   {variant.name}
//                 </button>
//               )
//             )}
//           </div>
//         </div>

//         {/* Quantity */}
//         <div className="mb-4">
//           <label htmlFor="quantity" className="block font-medium mb-1">
//             Quantity:
//           </label>
//           <input
//             type="number"
//             id="quantity"
//             value={quantity}
//             min={1}
//             onChange={(e) => setQuantity(Number(e.target.value))}
//             className="border rounded px-2 py-1 w-20"
//           />
//         </div>

//         {/* Add to Cart */}
//         <button
//           type="button"
//           onClick={handleAddToCart}
//           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
//         >
//           Add to Cart
//         </button>

//         {/* Description */}
//         {product.description && (
//           <div className="mt-6">
//             <h2 className="text-lg font-semibold mb-2">Product Details</h2>
//             <p className="text-gray-700">{product.description}</p>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
