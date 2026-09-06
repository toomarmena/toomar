import { Button } from "@/components/ui/button";
import { getDict } from "@/lib/lang-server";

export default async function NotFound() {
  const { d } = await getDict();
  return (
    <div className="wrap pt-20 md:pt-32 section-end flex flex-col items-start gap-6 max-w-[720px]">
      <h1 className="t-h1">{d.notFound.title}</h1>
      <p className="text-ink-2">{d.notFound.lead}</p>
      <Button href="/" variant="primary">
        {d.notFound.home}
      </Button>
    </div>
  );
}
