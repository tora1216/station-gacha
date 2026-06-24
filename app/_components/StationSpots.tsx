"use client";

import { useState, type FormEvent } from "react";
import { addSpot, removeSpot, useStationSpots } from "../_lib/spots";

type Props = {
  stationCode: string;
  stationName: string;
};

export default function StationSpots({ stationCode, stationName }: Props) {
  const spots = useStationSpots(stationCode);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [url, setUrl] = useState("");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addSpot(stationCode, trimmedName, memo.trim() || undefined, url.trim() || undefined);
    setName("");
    setMemo("");
    setUrl("");
    setOpen(false);
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {stationName}駅のおすすめスポット
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
        >
          {open ? "閉じる" : "+ 追加"}
        </button>
      </div>

      {spots.length === 0 && !open && (
        <span className="text-sm text-gray-400 dark:text-gray-500">まだ登録されていません</span>
      )}

      {spots.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {spots.map((spot) => (
            <li
              key={spot.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
            >
              <div className="flex flex-col">
                {spot.url ? (
                  <a
                    href={spot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:underline dark:text-green-400"
                  >
                    {spot.name}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{spot.name}</span>
                )}
                {spot.memo && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{spot.memo}</span>
                )}
              </div>
              <button
                onClick={() => removeSpot(stationCode, spot.id)}
                aria-label={`${spot.name}を削除`}
                className="shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 pt-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="スポット名(例: 〇〇ラーメン店)"
            autoFocus
            required
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[16px] text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ(任意)"
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[16px] text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            placeholder="食べログなどのURL(任意)"
            className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-[16px] text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="rounded-full bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
          >
            登録する
          </button>
        </form>
      )}
    </div>
  );
}
