// // selsa-frontend/src/components/SizeSelector.tsx

// "use client";

// import React from "react";
// import "./SizeSelector.css";

// interface SizeSelectorProps {
//   sizes: string[];
//   selectedSize: string | null;
//   onSelect: (size: string) => void;
//   disabledSizes?: string[]; // optional
// }

// export const SizeSelector: React.FC<SizeSelectorProps> = ({
//   sizes,
//   selectedSize,
//   onSelect,
//   disabledSizes = [],
// }) => {
//   if (!sizes || sizes.length === 0) return null;

//   // Sort sizes logically (XS, S, M, L, XL, 2XL, etc.)
//   const orderedSizes = [...sizes].sort((a, b) => {
//     const order = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
//     const ia = order.indexOf(a.toUpperCase());
//     const ib = order.indexOf(b.toUpperCase());
//     return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
//   });

//   return (
//     <div className="product-option mb-4">
//       <label className="block selector-label font-medium mb-1 text-gray-800">Size:</label>

//       <div className="flex flex-wrap size-options">
//         {orderedSizes.map((size) => {
//           const isSelected = selectedSize === size;
//           const isDisabled = disabledSizes.includes(size);

//           return (
//             <span
//               key={size}
//               role="button"
//               disabled={isDisabled}
//               onClick={() => !isDisabled && onSelect(size)}
//               className={`px-3 py-1 rounded-md border text-sm font-medium transition-all 
//                 size-option-active
//                  size-option size-option:hover size-option:selected size-option:disabled size-selector`
//                 + (isSelected ? " selected" : "")
//                 + (isDisabled ? " disabled" : "")
//               }
                
//             >
//               {size}
//             </span>
//           );
//         })}
//       </div>
//     </div>
//   );
// };



            // <span
            //   key={`${s.size}-${idx}`} // ensure unique key
            //   onClick={() => !isDisabled && onSelect(s.size)}
            //   className={`px-3 py-1 rounded-md border text-sm font-medium transition-all
            //     ${isSelected ? "bg-black text-white" : "bg-white text-black"}
            //     ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            // >
            //   {s.size}
            // </span>



  "use client";

  import React from "react";
  import { useTranslation } from "react-i18next";
  import "./SizeSelector.css";

  interface SizeOption {
    size: string;
    available: boolean;
  }

  interface SizeSelectorProps {
    sizes: SizeOption[];
    selectedSize: string | null;
    onSelect: (size: string) => void;
  }

  export const SizeSelector: React.FC<SizeSelectorProps> = ({
    sizes,
    selectedSize,
    onSelect,
  }) => {
    const { t } = useTranslation();
    if (!sizes || sizes.length === 0) return null;

    const orderedSizes = [...sizes].sort((a, b) => {
      const order = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
      const ia = a.size ? order.indexOf(a.size.toUpperCase()) : 999;
      const ib = b.size ? order.indexOf(b.size.toUpperCase()) : 999;
      return ia - ib;
    });


    return (
      <div className="product-option mb-4">
        <label className="block font-medium mb-1 text-gray-800 ">{t('Size')}:</label>
        <div className="flex flex-wrap gap-2 size-options">
          {orderedSizes.map((s, idx) => {
            if (!s.size) return null; // skip invalid sizes
            const isSelected = selectedSize === s.size;
            const isDisabled = !s.available;

            return (
              <span
                  key={`${s.size}-${idx}`} // ensure unique key
                  role="button"
                  aria-disabled={isDisabled}
                  onClick={() => !isDisabled && onSelect(s.size)}
                  className={`px-3 py-1 rounded-md border text-sm font-medium transition-all size-option
                              ${isSelected ? "selected" : ""}
                              ${isDisabled ? "disabled" : "cursor-pointer"}`}
                >
                  {s.size}
              </span>
            );
          })}

        </div>
      </div>
    );
  };
