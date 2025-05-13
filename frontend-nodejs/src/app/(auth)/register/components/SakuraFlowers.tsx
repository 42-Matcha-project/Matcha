import React, { useEffect, useState } from "react";

export const SakuraFlowers = () => {
  const [flowers, setFlowers] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generateFlowers = () => {
      const elements = [];
      const flowerCount = 15;
      for (let i = 0; i < flowerCount; i++) {
        const randomTop = Math.random() * 100;
        const randomLeft = Math.random() * 100;
        const randomSize = Math.random() * 15 + 10;
        const randomDuration = Math.random() * 10 + 10;
        const randomDelay = Math.random() * 10;
        const randomOpacity = Math.random() * 0.5 + 0.5;
        elements.push(
          <div
            key={i}
            className="flower"
            style={{
              position: "absolute",
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              backgroundColor: "#ffccd8",
              borderRadius: "50%",
              opacity: randomOpacity,
              animation: `float ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
              zIndex: 1,
            }}
          />,
        );
      }
      return elements;
    };
    setFlowers(generateFlowers());
  }, []);

  return <>{flowers}</>;
};
