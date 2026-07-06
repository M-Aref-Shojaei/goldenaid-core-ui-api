/** Props for the {@link FormError} component. */
interface FormErrorProps {
  message: string | null;
  className?: string;
}

/** Dismissible form-level error banner; renders nothing when message is null. */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className={`bg-semantic-red-extralight border border-semantic-red-light/30 rounded-lg p-4 ${className ?? ""}`}>
      <p className="text-semantic-red text-sm">{message}</p>
    </div>
  );
}
