export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function OptionalMark() {
  return <span className="font-normal text-muted-foreground"> (opcjonalnie)</span>;
}

export function fieldClassName(error?: string): string {
  return error ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary';
}
