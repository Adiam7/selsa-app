export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-4 w-full max-w-md rounded bg-muted" />
      <div className="h-4 w-3/4 max-w-sm rounded bg-muted" />
    </div>
  );
}
