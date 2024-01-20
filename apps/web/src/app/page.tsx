"use client";

import {
  Button,
  Container,
  Stack,
  chakra,
  useColorMode,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
// Here we have used react-icons package for the icons
import { FaMoon, FaRegSun } from "react-icons/fa";

const HeroSection = () => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Container p={{ base: 8, sm: 14 }}>
      <Stack direction="row" spacing={4} align="center" justify="flex-end">
        <Button
          leftIcon={
            colorMode === "light" ? <FaMoon /> : <FaRegSun color="yellow" />
          }
          onClick={toggleColorMode}
        >
          {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </Stack>
      <Stack direction="column" spacing={6} alignItems="center" mt={24}>
        <chakra.h1
          fontSize={{ base: "4xl", sm: "7xl" }}
          fontWeight="bold"
          textAlign="center"
          whiteSpace={{ base: "inherit", sm: "nowrap" }}
          maxW="600px"
        >
          Nyumat's hub for
          <br />
          <chakra.span
            color="teal"
            bg="linear-gradient(transparent 50%, #83e9e7 50%)"
          >
            images n shit.
          </chakra.span>
        </chakra.h1>
        <Stack
          direction={{ base: "column", sm: "row" }}
          w={{ base: "100%", sm: "auto" }}
          spacing={5}
        >
          <Button
            colorScheme="teal"
            variant="outline"
            rounded="md"
            size="lg"
            height="3.5rem"
            fontSize="1.2rem"
            onClick={() => router.push("/auth")}
          >
            Go To Portal
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default function Page() {
  return (
    <div>
      <HeroSection />
    </div>
  );
}
