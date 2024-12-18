export const detectBrowser = (): string => {
  const userAgent: string = navigator.userAgent;

  // Table des correspondances pour détecter les navigateurs
  const browsers: Map<string, () => boolean> = new Map([
    ["Brave", () => Boolean(navigator.brave)],
    [
      "Google Chrome",
      () => userAgent.includes("Chrome") && !userAgent.includes("Edg"),
    ],
    ["Mozilla Firefox", () => userAgent.includes("Firefox")],
    [
      "Safari",
      () => userAgent.includes("Safari") && !userAgent.includes("Chrome"),
    ],
    ["Microsoft Edge", () => userAgent.includes("Edg")],
    ["Opera", () => userAgent.includes("OPR") || userAgent.includes("Opera")],
    ["Internet Explorer", () => userAgent.includes("Trident")],
  ]);
  for (const [name, test] of browsers) {
    if (test()) {
      console.log(name);
      return name;
    }
  }

  return "Navigateur inconnu"; // Fallback
};
