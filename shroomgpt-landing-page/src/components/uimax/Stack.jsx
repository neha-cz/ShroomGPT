import { forwardRef } from "react";
import styles from "./Stack.module.css";

export const Stack = forwardRef(function Stack(
  { className = "", row = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`${styles.root} ${row ? styles.row : ""} ${className}`.trim()}
      {...props}
    />
  );
});
