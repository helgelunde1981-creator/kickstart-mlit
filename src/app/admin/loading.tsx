export default function AdminLoading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Laster">
      <div className="card h-10 w-56 animate-pulse bg-surface-2" />
      <div className="card h-20 animate-pulse bg-surface-2" />
      <div className="card h-20 animate-pulse bg-surface-2" />
      <div className="card h-20 animate-pulse bg-surface-2" />
    </div>
  );
}
