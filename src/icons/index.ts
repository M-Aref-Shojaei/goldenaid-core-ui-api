/**
 * Icon system entry point (TASK-145).
 *
 * All icon components and lucide-react's shared types are re-exported here so
 * that consuming apps (`store`, `admin`, `dashboard`, `articles`) never need
 * to depend on `lucide-react` directly. `lucide-react` is tree-shakeable, so
 * re-exporting its full set here has no bundle-size cost beyond the icons an
 * app actually imports.
 *
 * Use the plain icon components (`ShoppingCart`, `Search`, ...) when you need
 * full control over size/stroke/color, or wrap them in {@link Icon} to pick
 * up this project's default sizing (20px, 1.75 stroke width).
 */
export * from "lucide-react";
export { Icon, ICON_DEFAULTS } from "./Icon";
export type { IconProps } from "./Icon";
