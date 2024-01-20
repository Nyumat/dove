"use client";

import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

type UploadResponseProps = {
  message: string;
};

export const UploadResponse: React.FC<UploadResponseProps> = ({ message }) => {
  const router = useRouter();

  const onView = () => {
    router.push(`/view`);
  };

  return (
    <Box>
      <Heading size="md">Upload complete!</Heading>
      <Text>{message}</Text>
      <Button colorScheme="blue" onClick={onView}>
        View
      </Button>
    </Box>
  );
};
