"use client";

import { Box, Container, Heading, Stack } from "@chakra-ui/react";
import { Logo } from "./Logo";

import { PinField } from "./PinField";

export default function Auth() {
  return (
    <Container
      maxW="lg"
      py={{ base: "12", md: "24" }}
      px={{ base: "0", sm: "8" }}
    >
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo />
          <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
            <Heading size={{ base: "xs", md: "sm" }}>Welcome Back Tom!</Heading>
          </Stack>
        </Stack>
        <Box
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          bg={{ base: "transparent", sm: "bg.surface" }}
          boxShadow={{ base: "none", sm: "md" }}
          borderRadius={{ base: "none", sm: "xl" }}
          border={{ base: "none", sm: "1px solid" }}
        >
          <Stack spacing="6">
            <Stack spacing="5">
              <PinField />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
