import Image from "next/image";

export default function Loading() {
  return (
    <div className="h-screen flex flex-col items-center pt-24">
      <h1 className="font-sigmar text-xl font-medium text-sky-500 tracking-wide">
        {["L", "o", "a", "d", "i", "n", "g", ".", ".", "."].map(
          (char, index) => (
            <span
              key={index}
              className="animate-bounce delay-[100ms]"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {char}
            </span>
          )
        )}
      </h1>
      <Image
        src="/Logo.svg"
        height={100}
        width={100}
        alt="Logo Icon Loading"
        className="animate-pulse"
      />
    </div>
  );
}
