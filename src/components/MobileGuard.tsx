import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const MOBILE_MAX_WIDTH = 767;

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
        <div style={styles.glow}></div>
        <div style={styles.content}>
          <h1 style={styles.title}>📱 Mobile Only</h1>
          <p style={styles.message}>Please view Mallu Cupid on a mobile device.</p>
          <span style={styles.hint}>This app is optimized for mobile screens only.</span>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  block: {
    height: "100vh",
    background: "radial-gradient(circle at top, #2a0c3f 0%, #090a0f 52%, #050508 100%)",
    color: "#f6f2ff",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "40px",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  glow: {
    position: "absolute" as const,
    width: "460px",
    height: "460px",
    borderRadius: "50%",
    background: "conic-gradient(from 120deg, #ff9fc5, #ff4d6d, #ff6b9d, #ff9fc5)",
    filter: "blur(90px)",
    opacity: 0.25,
    top: "-220px",
    right: "-180px",
  },
  content: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: "400px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 16px",
    color: "#f6f2ff",
  },
  message: {
    fontSize: "18px",
    margin: "0 0 12px",
    opacity: 0.9,
    lineHeight: "1.5",
  },
  hint: {
    fontSize: "14px",
    opacity: 0.6,
    display: "block",
  },
};
