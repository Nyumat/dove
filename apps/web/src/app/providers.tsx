// app/providers.tsx
"use client";

import {
  ChakraProvider,
  ColorModeScript,
  extendTheme,
  type ThemeConfig,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

const theme = extendTheme({ config });

export function Providers({ children }: { children: React.ReactNode }) {
  let token: unknown;
  if (global?.window !== undefined) {
    localStorage.getItem("token");
  }
  const router = useRouter();

  useLayoutEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_HOST}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          return;
        }

        if (response.status !== 200) {
          router.push("/auth");
        }
      } catch (error) {
        router.push("/auth");
      }
    };

    if (!token || token === "undefined") {
      router.push("/auth");
    } else {
      verifyToken();
    }
  }, [token, router]);
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      {children}
    </ChakraProvider>
  );
}
