export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="h-6 w-40 animate-pulse rounded bg-[#f4f3ef]" />
      <div className="mt-3 h-10 w-80 animate-pulse rounded bg-[#f4f3ef]" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-[#e6e5e0] bg-[#fbfbfa]"
          />
        ))}
      </div>
    </div>
  );
}
