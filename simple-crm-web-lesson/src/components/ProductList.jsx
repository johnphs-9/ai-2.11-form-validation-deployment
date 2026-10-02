import { memo } from "react";
import styles from "../pages/ProductsPage.module.css";

function ProductList({ products }) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <div className={styles.card} key={product.id}>
          <h3>{product.name}</h3>
          <div className={styles.priceRow}>
            <span className={styles.price}>
              ${product.discountedPrice.toFixed(2)}
            </span>
            <span className={styles.originalPrice}>
              ${product.price.toFixed(2)}
            </span>
          </div>
          <span>{product.inStock ? "In Stock" : "Out of Stock"}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(ProductList);
