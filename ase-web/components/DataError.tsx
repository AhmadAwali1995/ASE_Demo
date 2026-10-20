export function DataError({ title, message, note }: { title: string; message: string; note: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-serif text-3xl text-ink">{title}</p>
      <p className="mt-3 text-muted">{message}</p>
      <p className="mt-6 text-sm text-muted">{note}</p>
    </main>
  );
}
