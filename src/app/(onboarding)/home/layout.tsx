import { AssetsHeaderObserver } from "@/components/Observers/AssetsHeaderObserver";
import { AssetsScrollObserver } from "@/components/Observers/AssetsScrollObserver";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <>
      <AssetsScrollObserver />
      <AssetsHeaderObserver />
      {children}
    </>
  );
}
