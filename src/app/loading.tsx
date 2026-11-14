export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-4 w-36 animate-pulse rounded bg-[#f4f3ef]" />
      <div className="mt-3 h-9 w-72 max-w-full animate-pulse rounded bg-[#f4f3ef]" />
      <div className="mt-8 h-56 animate-pulse rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa]" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-60 animate-pulse rounded-xl border border-[#e6e5e0] bg-[#fbfbfa]"
          />
        ))}
      </div>
    </div>
  );
}
