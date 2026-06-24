"use client";

import { useMemo, useRef, useState } from "react";
import { pickRandomLine, pickRandomStation, type GachaResult } from "../_lib/gacha";
import { LINES, type Line, type Station } from "../_data/lines";
import { useExcludedLines } from "../_lib/lineSelection";
import OperatorLogo from "./OperatorLogo";
import StationSpots from "./StationSpots";

const LINE_SPIN_INTERVAL_MS = 60;
const LINE_SPIN_DURATION_MS = 700;
const STATION_SPIN_INTERVAL_MS = 60;
const STATION_SPIN_DURATION_MS = 700;

type Phase = "idle" | "spinningLine" | "lineReady" | "spinningStation" | "done";

export default function Gacha() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayLine, setDisplayLine] = useState<Line | null>(null);
  const [displayStation, setDisplayStation] = useState<Station | null>(null);
  const [history, setHistory] = useState<GachaResult[]>([]);
  const lineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const excluded = useExcludedLines();
  const activeLines = useMemo(
    () => LINES.filter((line) => !excluded.has(line.code)),
    [excluded]
  );
  const activeStationCount = useMemo(
    () => activeLines.reduce((sum, line) => sum + line.stations.length, 0),
    [activeLines]
  );

  const isSpinning = phase === "spinningLine" || phase === "spinningStation";
  const lineDisabled = isSpinning || activeLines.length === 0;
  const stationDisabled = isSpinning || !displayLine;

  function handleSpinLine() {
    if (lineDisabled) return;

    setPhase("spinningLine");
    setDisplayStation(null);

    const startedAt = Date.now();
    lineTimerRef.current = setInterval(() => {
      setDisplayLine(pickRandomLine(activeLines));

      if (Date.now() - startedAt >= LINE_SPIN_DURATION_MS) {
        if (lineTimerRef.current) clearInterval(lineTimerRef.current);
        setDisplayLine(pickRandomLine(activeLines));
        setPhase("lineReady");
      }
    }, LINE_SPIN_INTERVAL_MS);
  }

  function handleSpinStation() {
    if (stationDisabled || !displayLine) return;
    const line = displayLine;

    setPhase("spinningStation");

    const startedAt = Date.now();
    stationTimerRef.current = setInterval(() => {
      setDisplayStation(pickRandomStation(line));

      if (Date.now() - startedAt >= STATION_SPIN_DURATION_MS) {
        if (stationTimerRef.current) clearInterval(stationTimerRef.current);

        const finalStation = pickRandomStation(line);
        setDisplayStation(finalStation);
        setPhase("done");
        setHistory((prev) => [{ line, station: finalStation }, ...prev].slice(0, 5));
      }
    }, STATION_SPIN_INTERVAL_MS);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="flex w-full flex-col gap-3">
        <div className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {displayLine ? (
            <>
              <span
                className="rounded-full px-3 py-0.5 text-sm font-bold tracking-wide text-white"
                style={{ backgroundColor: displayLine.color }}
              >
                {displayLine.code}
              </span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {displayLine.name}
              </span>
              <span className="flex items-center gap-1.5">
                <OperatorLogo operator={displayLine.operator} className="h-4 w-10" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {displayLine.operator}
                </span>
              </span>
            </>
          ) : activeLines.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500 px-6 text-center">
              対象路線がありません。設定から路線を選択してください
            </span>
          ) : (
            <span className="text-gray-300 dark:text-gray-600">路線</span>
          )}
        </div>

        <button
          onClick={handleSpinLine}
          disabled={lineDisabled}
          className="flex h-12 w-full items-center justify-center rounded-full bg-green-500 px-6 text-base font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-60"
        >
          {phase === "spinningLine" ? "路線を選択中..." : "路線を回す"}
        </button>

        <div className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {displayStation ? (
            <>
              <span
                className="rounded-full px-4 py-1 text-lg font-bold tracking-wide text-white"
                style={{ backgroundColor: displayLine?.color }}
              >
                {displayStation.code}
              </span>
              <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                {displayStation.name}駅
              </span>
            </>
          ) : phase === "spinningLine" ? (
            <span className="text-gray-300 dark:text-gray-600">次は駅を選びます</span>
          ) : !displayLine ? (
            <span className="text-gray-300 dark:text-gray-600">駅</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              ボタンを押して駅を決めよう
            </span>
          )}
        </div>

        <button
          onClick={handleSpinStation}
          disabled={stationDisabled}
          className="flex h-12 w-full items-center justify-center rounded-full bg-green-500 px-6 text-base font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-60"
        >
          {phase === "spinningStation" ? "駅を選択中..." : "駅を回す"}
        </button>
      </div>

      {displayStation && !isSpinning && (
        <StationSpots stationCode={displayStation.code} stationName={displayStation.name} />
      )}

      {history.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            これまでの結果
          </span>
          <ul className="flex flex-col gap-1">
            {history.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-800"
              >
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: item.line.color }}
                >
                  {item.station.code}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.station.name}駅
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.line.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <span className="text-xs text-gray-400 dark:text-gray-500">
        対象路線数: {activeLines.length} / 対象駅数: {activeStationCount}
        {activeLines.length !== LINES.length && ` (全${LINES.length}路線)`}
      </span>
    </div>
  );
}
