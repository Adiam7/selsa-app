// components/QuantitySelector.tsx
import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  qty: number;
  setQty: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  qty,
  setQty,
  min = 1,
  max = 99,
}) => {
  const handleDecrease = () => setQty(Math.max(min, qty - 1));
  const handleIncrease = () => setQty(Math.min(max, qty + 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      setQty(Math.min(max, Math.max(min, val)));
    }
  };

  return (
    <div className="product-option mb-4">
      <label htmlFor="qty" className="block font-medium mb-2 text-gray-800">
        Quantity:
      </label>

      <div className="qty-control">
        <button
          type="button"
          onClick={handleDecrease}
          className="qty-btn"
          aria-label="Decrease quantity"
          disabled={qty <= min}
        >
          <Minus className="qty-icon" />
        </button>

        <input
          id="qty"
          type="number"
          min={min}
          max={max}
          value={qty}
          onChange={handleChange}
          className="qty-input"
          inputMode="numeric"
          aria-live="polite"
        />

        <button
          type="button"
          onClick={handleIncrease}
          className="qty-btn"
          aria-label="Increase quantity"
          disabled={qty >= max}
        >
          <Plus className="qty-icon" />
        </button>
      </div>
    </div>
  );
};