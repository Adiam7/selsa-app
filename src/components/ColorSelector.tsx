//  Old
// "use client";

// import React from "react";
// import Image from "next/image";
// import "./ColorSelector.css";

// interface ColorOption {
//   color: string;
//   available: boolean;
// }

// interface ColorSelectorProps {
//   colors: ColorOption[];
//   selectedColor: string | null;
//   onSelect: (color: string) => void;
//   variantImages?: Record<string, string>; // { color: imageURL }
// }

// export const ColorSelector: React.FC<ColorSelectorProps> = ({
//   colors,
//   selectedColor,
//   onSelect,
//   variantImages = {},
// }) => {
//   if (!colors || colors.length === 0) return null;

//   return (
//     <div className="product-option mb-4">
//       <label className="block font-medium mb-1 text-gray-800">Color:</label>

//       {/* Color Swatches */}
//       {/* <div className="flex gap-2 mb-2">
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
//             onClick={() => handleColorClick(color)}
//           />
//         ))}
//       </div> */}

//       <div className="flex flex-wrap gap-3">
//         {colors.map((c) => {
//           const isActive = selectedColor === c.color;
//           const isDisabled = !c.available;
//           const thumb = variantImages[c.color];

//           return (
//             <span
//               key={c.color}
//               role="button"
//               onClick={() => !isDisabled && onSelect(c.color)}
//               aria-pressed={isActive}
//               className={`color-option ${isActive ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
//             >
//               {thumb ? (
//                 <Image
//                   src={thumb}
//                   alt={c.color}
//                   width={48}
//                   height={48}
//                   sizes="48px"
//                   className="object-cover"
//                 />
//               ) : (
//                 <span className="text-sm text-gray-600">{c.color}</span>
//               )}
//             </span>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // working well with gallery style
// "use client";

// import React from "react";
// import Image from "next/image";
// import "./ColorSelector.css";

// interface ColorOption {
//   color: string;
//   available: boolean;
// }

// interface ColorSelectorProps {
//   colors: ColorOption[];
//   selectedColor: string | null;
//   onSelect: (color: string) => void;
//   variantImages?: Record<string, string>;
// }

// export const ColorSelector: React.FC<ColorSelectorProps> = ({
//   colors,
//   selectedColor,
//   onSelect,
//   variantImages = {},
// }) => {
//   if (!colors || colors.length === 0) return null;

//   return (
//     <div className="product-option mb-4">
//       <label className="block font-medium mb-1 text-gray-800">Color:</label>

//       <div className="flex flex-wrap gap-3">
//         {colors.map((c, idx) => {
//           const isActive = selectedColor === c.color;
//           const isDisabled = !c.available;
//           const thumb = variantImages[c.color];

//           return (
//             <span
//               key={`${c.color}-${idx}`} // ensures uniqueness
//               role="button"
//               aria-pressed={isActive}
//               onClick={() => !isDisabled && onSelect(c.color)}
//               className={`color-option ${isActive ? "selected" : ""} ${
//                 isDisabled ? "disabled" : ""
//               }`}
//             >
//               {thumb ? (
//                 <Image
//                   src={thumb}
//                   alt={c.color}
//                   width={48}
//                   height={48}
//                   sizes="48px"
//                   className="object-cover rounded-md"
//                 />
//               ) : (
//                 <span className="text-sm text-gray-600">{c.color}</span>
//               )}
//             </span>
//           );
//         })}

//       </div>
//     </div>
//   );
// };

// New with swatch
"use client";

import React from "react";
import "./ColorSelector.css";

interface ColorOption {
  color: string;       // e.g., "Oatmeal" (used for tooltip/selection)
  value: string;       // e.g., "#f5f5dc" (actual CSS color for the swatch)
  available: boolean;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelect,
}) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="product-option mb-4">
      <label className="block font-medium mb-1 text-gray-800">Color:</label>

      <div className="swatches color-gallery flex gap-2 mb-2">
        {colors.map((c, idx) => {
          const isActive = selectedColor === c.color;
          const isDisabled = !c.available;

          return (
            <button
              key={`${c.color}-${idx}`}
              title={c.color} // tooltip shows color name
              onClick={() => !isDisabled && onSelect(c.color)}
              disabled={isDisabled}
              className={`swatches__item ${isActive ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
              style={{
                backgroundColor: c.value,       // use the value field
                border: isActive ? "2px solid black" : "1px solid gray",
                width: 24,
                height: 24,
                borderRadius: "50%",            // circular swatch
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.4 : 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
