interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}
