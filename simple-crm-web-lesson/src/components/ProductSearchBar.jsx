import { memo } from "react";
// src/components/ProductSearchBar.jsx
function ProductSearchBar({ value, onChange }) {
  console.log("ProductSearchBar rendered");
  return (
    <div>
      <label htmlFor="search">Search by name: </label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Wireless Mouse"
      />
    </div>
  );
}

export default memo(ProductSearchBar);
