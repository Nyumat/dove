"use client";

import {
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Stack,
  useDisclosure,
  useMergeRefs,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { forwardRef, useRef, useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export const PinField = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const router = useRouter();
    const { isOpen, onToggle } = useDisclosure();
    const inputRef = useRef<HTMLInputElement>(null);
    const [pin, setPin] = useState("");
    const [error, setError] = useState<string | undefined>();

    const mergeRef = useMergeRefs(inputRef, ref);
    const onClickReveal = () => {
      onToggle();
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLDivElement>) => {
      event.preventDefault();
      try {
        const response = await fetch(`${API_HOST}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pin }),
        });
        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem("token", token);
          router.push("/view");
        } else {
          setError("Invalid pin");
        }
      } catch (error) {
        setError("Invalid pin");
      }
    };

    return (
      <>
        <FormControl as="form" onSubmit={handleSubmit}>
          <FormLabel htmlFor="pin">Pin</FormLabel>
          <InputGroup>
            <InputRightElement>
              <IconButton
                variant="text"
                aria-label={isOpen ? "Hide Pin" : "Reveal Pin"}
                icon={isOpen ? <HiEyeOff /> : <HiEye />}
                onClick={onClickReveal}
              />
            </InputRightElement>
            <Input
              id="pin"
              ref={mergeRef}
              name="pin"
              type={isOpen ? "text" : "password"}
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              {...props}
              errorBorderColor="red.300"
              isRequired
              isInvalid={error !== undefined}
            />
          </InputGroup>
          {error && (
            <FormLabel htmlFor="pin" color="red.300" mt={2}>
              {error}
            </FormLabel>
          )}
          <Stack spacing="6">
            <Button type="submit" mt={4}>
              Authenticate
            </Button>
          </Stack>
        </FormControl>
      </>
    );
  },
);
