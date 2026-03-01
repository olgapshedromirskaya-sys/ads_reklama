type LoadingScreenProps = {
  text?: string;
  fullscreen?: boolean;
};

export function LoadingScreen({ text = "Loading...", fullscreen = false }: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center text-sm text-[color:var(--tg-hint-color)] ${
        fullscreen ? "min-h-screen" : "min-h-[40vh]"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--tg-hint-color)] border-t-transparent"
          role="status"
          aria-label="Loading"
        />
        <span>{text}</span>
      </div>
    </div>
  );
}
