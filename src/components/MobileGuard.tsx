import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const MOBILE_MAX_WIDTH = 600;

type MobileGuardProps = {
  children: ReactNode;
};

export default function MobileGuard({ children }: MobileGuardProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_MAX_WIDTH}px)`
    );

    const sync = () => setIsMobile(mediaQuery.matches);

    sync();
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", sync);
      return () => mediaQuery.removeEventListener("change", sync);
    }

    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  if (!isMobile) {
    return (
      <div style={styles.block}>
        <h1>Mobile Only</h1>
        <p>Please open Mallu Cupid on a phone-sized screen.</p>
        <span>Tablets and desktops are not supported yet.</span>
      </div>
    );
  }

  return children;
}

const styles = {
  block: {
    height: "100vh",
    background: "#08090c",
    color: "#f2f2f2",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: 24,
    gap: 12,
  },
};
