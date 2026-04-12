import { forwardRef } from "react";
import styles from "./Input.module.css";

export const Input = forwardRef(function Input(
  { className = "", label, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div ref={ref} className={`${styles.field} ${className}`.trim()}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={styles.input} {...props} />
    </div>
  );
});
