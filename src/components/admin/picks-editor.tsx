"use client";

import { useState, useTransition } from "react";
import { setPicks } from "@/app/admin/actions";
import { useT } from "../lang-provider";

type Item = { id: string; title: string; creator: string };

/** Hand-ordered editor's picks. */
export function PicksEditor({ picks, candidates }: { picks: Item[]; candidates: Item[] }) {
  const [list, setList] = useState(picks);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const d = useT();
  const pool = candidates.filter((c) => !list.some((p) => p.id === c.id));
  const small = "t-link t-caption text-ink disabled:opacity-40 disabled:no-underline";

  const commit = (next: Item[]) => {
    setList(next);
    setSaved(false);
    start(async () => {
      await setPicks(next.map((i) => i.id));
      setSaved(true);
    });
  };
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {list.length === 0 && <p className="t-caption">{d.common.none}</p>}
      <ol className="divide-y divide-hair border-y border-hair">
        {list.map((p, i) => (
          <li key={p.id} className="flex items-center gap-4 py-3">
            <span className="w-6 t-caption text-ink">{i + 1}</span>
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="text-[15px] truncate">{p.title}</span>
              <span className="t-caption">{p.creator}</span>
            </span>
            <div className="flex gap-4">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || pending} className={small}>
                {d.studio.moveUp}
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1 || pending} className={small}>
                {d.studio.moveDown}
              </button>
              <button type="button" onClick={() => commit(list.filter((x) => x.id !== p.id))} disabled={pending} className={small}>
                {d.admin.removePick}
              </button>
            </div>
          </li>
        ))}
      </ol>
      {pool.length > 0 && (
        <label className="flex flex-col gap-1.5 t-caption text-ink max-w-[420px]">
          {d.admin.addPick}
          <select
            className="field h-11 text-[15px]"
            value=""
            disabled={pending}
            onChange={(e) => {
              const item = pool.find((c) => c.id === e.target.value);
              if (item) commit([...list, item]);
            }}
          >
            <option value="">—</option>
            {pool.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} · {c.creator}
              </option>
            ))}
          </select>
        </label>
      )}
      {saved && <span className="t-caption">{d.studio.saved}</span>}
    </div>
  );
}
