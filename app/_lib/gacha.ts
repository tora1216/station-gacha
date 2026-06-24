import type { Line, Station } from "../_data/lines";

export type GachaResult = {
  line: Line;
  station: Station;
};

export function pickRandomLine(lines: Line[]): Line {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function pickRandomStation(line: Line): Station {
  return line.stations[Math.floor(Math.random() * line.stations.length)];
}
