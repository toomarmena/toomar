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
    <div className="flex flex-col gap-3">
      {list.length === 0 && <p className="text-sm text-muted">{d.common.none}</p>}
      <ol className="flex flex-col gap-2">
        {list.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3 p-2.5 bg-surface border border-hair">
            <span className="font-display text-xl w-8 text-center">{i + 1}</span>
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="font-semibold truncate">{p.title}</span>
              <span className="text-xs text-muted">{p.creator}</span>
            </span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || pending} className="h-9 px-3 text-xs font-semibold border border-hair bg-white disabled:opacity-40">
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1 || pending} className="h-9 px-3 text-xs font-semibold border border-hair bg-white disabled:opacity-40">
              ↓
            </button>
            <button type="button" onClick={() => commit(list.filter((x) => x.id !== p.id))} disabled={pending} className="h-9 px-3 text-xs font-semibold border border-hair bg-white text-[#B3261E]">
              {d.admin.removePick}
            </button>
          </li>
        ))}
      </ol>
      {pool.length > 0 && (
        <label className="flex items-center gap-3 text-sm font-semibold">
          {d.admin.addPick}
          <select
            className="h-10 px-3 border border-hair bg-white font-normal"
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
      {saved && <span className="text-xs text-[#0E7C4A]">{d.studio.saved}</span>}
    </div>
  );
}
