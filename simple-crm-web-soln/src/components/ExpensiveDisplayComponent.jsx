import { memo } from "react";

function ExpensiveDisplayComponent() {
  console.log("ExpensiveDisplayComponent rendered");
  // If this is too slow on your machine, reduce the `length`
  const items = Array.from({ length: 10_000 }, () => "ITEM");
  return (
    <div
      style={{
        height: "100px",
        overflowY: "scroll",
        border: "1px solid #ccc",
        padding: "4px",
        marginBottom: "16px",
      }}
    >
      <h3>Expensive Display Component (memoized)</h3>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "4px",
            fontSize: "8px",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          {item}-{i}
        </span>
      ))}
    </div>
  );
}

export default memo(ExpensiveDisplayComponent);
// export default ExpensiveDisplayComponent;
