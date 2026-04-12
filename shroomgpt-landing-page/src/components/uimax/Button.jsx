import { forwardRef } from "react";
import styles from "./Button.module.css";

export const Button = forwardRef(function Button(
  { className = "", variant = "outline", type = "button", ...props },
  ref
) {
  const variantClass = variant === "primary" ? styles.primaryFill : "";
  return (
    <button
      ref={ref}
      type={type}
      className={`${styles.root} ${variantClass} ${className}`.trim()}
      {...props}
    />
  );
});
