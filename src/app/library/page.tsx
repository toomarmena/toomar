export const metadata = { title: "مكتبتي" };

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-3">
      <h1 className="font-display text-[34px] leading-tight">مكتبتي</h1>
      <p className="text-ink-2">ما تتابعه يظهر هنا.</p>
    </div>
  );
}
