import Image from "next/image";
import { OPERATOR_LOGOS } from "../_data/logos";

type Props = {
  operator: string;
  className?: string;
};

export default function OperatorLogo({ operator, className = "h-5 w-14" }: Props) {
  const src = OPERATOR_LOGOS[operator];
  if (!src) return null;

  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image
        src={src}
        alt={`${operator}のロゴ`}
        fill
        sizes="80px"
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
