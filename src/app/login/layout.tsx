import { BackgroundEffects } from "@/components/background-effects";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundEffects />
      <div className="relative z-10">{children}</div>
    </>
  );
}
