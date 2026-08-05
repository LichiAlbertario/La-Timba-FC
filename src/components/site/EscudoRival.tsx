import Image from "next/image";

const variantes = {
  dark: "bg-white/10 text-white",
  light: "bg-timba-navy/10 text-timba-navy/50",
};

export function EscudoRival({
  nombre,
  escudoUrl,
  size = 40,
  variant = "light",
}: {
  nombre: string;
  escudoUrl: string | null;
  size?: number;
  variant?: "dark" | "light";
}) {
  if (escudoUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${
          variant === "dark" ? "" : "bg-white"
        }`}
        style={{ width: size, height: size }}
      >
        <Image
          src={escudoUrl}
          alt={nombre}
          fill
          className={variant === "dark" ? "object-contain" : "object-cover"}
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase ${variantes[variant]}`}
      style={{ width: size, height: size }}
    >
      {nombre.slice(0, 2)}
    </div>
  );
}
