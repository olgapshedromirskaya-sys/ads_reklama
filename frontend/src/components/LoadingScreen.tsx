export function LoadingScreen({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-[color:var(--tg-hint-color)]">
      {text}
    </div>
  );
}
