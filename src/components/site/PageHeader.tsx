import { displayTitleClass, eyebrowClass } from "@/lib/site-ui";

export function PageHeader({
  eyebrow,
  title,
  meta,
  action,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h1 className={displayTitleClass}>{title}</h1>
        {meta && <p className="mt-1 text-sm text-black/40">{meta}</p>}
      </div>
      {action}
    </div>
  );
}
