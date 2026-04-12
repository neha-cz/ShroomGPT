import { forwardRef } from "react";
import styles from "./Card.module.css";

export const Card = forwardRef(function Card({ className = "", ...props }, ref) {
  return <div ref={ref} className={`${styles.root} ${className}`.trim()} {...props} />;
});
