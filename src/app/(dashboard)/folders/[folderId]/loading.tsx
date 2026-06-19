

export default function FolderLoading() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-[240px] rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-10 w-32 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-10 w-32 rounded-xl bg-emerald-100 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="hidden md:flex w-full bg-slate-50/90 border-b border-slate-100 px-6 py-4 gap-4">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center px-6 py-4 gap-4 border-b border-slate-50">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="hidden md:block h-4 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="hidden md:block h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
