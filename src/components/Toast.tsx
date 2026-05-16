import { CheckCircle2 } from "lucide-react";

type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} aria-hidden="true" />
      {message}
    </div>
  );
}
