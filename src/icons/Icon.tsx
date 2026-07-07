import type { LucideIcon, LucideProps } from "lucide-react";

/** Design-system defaults applied to every icon rendered through {@link Icon}. */
export const ICON_DEFAULTS = {
  size: 20,
  strokeWidth: 1.75,
} as const;

export interface IconProps extends Omit<LucideProps, "ref"> {
  /** The lucide-react icon component to render (e.g. `ShoppingCart`). */
  icon: LucideIcon;
}

/**
 * Thin wrapper around lucide-react icons that applies this project's default
 * size and stroke width so every icon across store/admin/dashboard/articles
 * looks consistent out of the box.
 *
 * Prefer importing icon components directly from `core-ui-api` (re-exported
 * from lucide-react) rather than depending on `lucide-react` in app code —
 * this keeps the icon set self-hosted behind one package and gives us a
 * single place to retune defaults (size, stroke width, color) later.
 *
 * @example
 * import { Icon, ShoppingCart } from "core-ui-api";
 * <Icon icon={ShoppingCart} className="text-gold" />
 */
export function Icon({
  icon: IconComponent,
  size = ICON_DEFAULTS.size,
  strokeWidth = ICON_DEFAULTS.strokeWidth,
  className = "",
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}
