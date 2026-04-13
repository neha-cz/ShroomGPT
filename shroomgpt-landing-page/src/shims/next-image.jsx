/**
 * Vite shim for `next/image` — only what `@splinetool/react-spline/next` needs.
 * @see https://nextjs.org/docs/app/api-reference/components/image
 */
export default function NextImageStub({ src, alt, style, width, height, ...rest }) {
  const url = typeof src === "string" ? src : src?.src ?? "";
  return (
    <img
      src={url || undefined}
      alt={alt ?? ""}
      style={style}
      width={width}
      height={height}
      {...rest}
    />
  );
}
