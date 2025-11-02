import React from "react";
import "./SelectedVariantPreview.css";

interface SelectedVariantPreviewProps {
  image?: string;
  color?: string | null;
  size?: string | null;
  price?: number | null;
  sku?: string | null;
}

function money(v: number | string | undefined, c?: string) {
  const num = typeof v === "string" ? Number(v) || 0 : v ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c || "USD",
  }).format(num);
}

export const SelectedVariantPreview: React.FC<SelectedVariantPreviewProps> = ({
  image,
  color,
  size,
  price,
  sku,
}) => {
  if (!color && !size) return null; // Don't render until user selects something

  return (
    <div className="variant-preview">
      {image && (
        <img
          src={image}
          alt={`${color} ${size}`}
          className="variant-image"
          loading="lazy"
        />
      )}
      <div className="variant-info">
        <h4 className="variant-title">Selected Variant</h4>
        <p className="variant-details">
          {color && <span>Color: <strong>{color}</strong></span>}{" "}
          {size && <span>Size: <strong>{size}</strong></span>}
          
        </p>
        {price && <p className="variant-price">{money(price, "USD")}</p>}
        {sku && <p className="variant-sku text-gray-500 text-sm">SKU: {sku}</p>}
      </div>
    </div>
  );
};
