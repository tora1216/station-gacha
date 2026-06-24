"use client";

import { LINES_BY_OPERATOR, type Line } from "../_data/lines";
import { setLinesExcluded, useExcludedLines } from "../_lib/lineSelection";
import OperatorLogo from "./OperatorLogo";

type Props = {
  onClose: () => void;
};

function OperatorRow({
  operator,
  lines,
  excluded,
}: {
  operator: string;
  lines: Line[];
  excluded: ReadonlySet<string>;
}) {
  const excludedCount = lines.filter((l) => excluded.has(l.code)).length;
  const allExcluded = excludedCount === lines.length;
  const noneExcluded = excludedCount === 0;

  return (
    <div className="flex flex-col gap-2 py-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={noneExcluded}
          ref={(el) => {
            if (el) el.indeterminate = !allExcluded && !noneExcluded;
          }}
          onChange={() => setLinesExcluded(lines.map((l) => l.code), noneExcluded)}
          className="size-4 accent-green-500"
        />
        <OperatorLogo operator={operator} className="h-5 w-14" />
        <span className="font-semibold text-gray-900 dark:text-white">{operator}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({lines.length - excludedCount}/{lines.length})
        </span>
      </label>
      <div className="ml-6 flex flex-col gap-1.5">
        {lines.map((line) => (
          <label key={line.code} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!excluded.has(line.code)}
              onChange={() => setLinesExcluded([line.code], !excluded.has(line.code))}
              className="size-4 accent-green-500"
            />
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: line.color }}
            >
              {line.code}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{line.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function LineSettings({ onClose }: Props) {
  const excluded = useExcludedLines();
  const allCodes = LINES_BY_OPERATOR.flatMap((g) => g.lines.map((l) => l.code));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90dvh] overflow-y-auto dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">対象路線の設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="閉じる"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pt-3 text-sm">
          <button
            onClick={() => setLinesExcluded(allCodes, false)}
            className="text-green-600 hover:underline dark:text-green-400"
          >
            すべて選択
          </button>
          <button
            onClick={() => setLinesExcluded(allCodes, true)}
            className="text-gray-400 hover:underline dark:text-gray-500"
          >
            すべて解除
          </button>
        </div>

        <div className="px-6 pb-6 divide-y divide-gray-100 dark:divide-gray-800">
          {LINES_BY_OPERATOR.map((group) => (
            <OperatorRow
              key={group.operator}
              operator={group.operator}
              lines={group.lines}
              excluded={excluded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
