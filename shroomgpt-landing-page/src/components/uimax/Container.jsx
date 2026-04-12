import { forwardRef } from "react";
import styles from "./Container.module.css";

export const Container = forwardRef(function Container(
  { className = "", wide = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`${styles.root} ${wide ? styles.rootWide : ""} ${className}`.trim()}
      {...props}
    />
  );
});
