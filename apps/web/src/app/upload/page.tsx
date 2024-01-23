"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadResponse } from "./UploadResponse";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function Upload() {
  const [response, setResponse] = useState<{ message: string } | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  // next.js....thanks...
    let token: unknown;
  if (global?.window !== undefined) {
    localStorage.getItem("token");
  }

  const onDrop = useCallback(async (acceptedFiles: any) => {
    setIsLoading(true);

    const formData = new FormData();
    acceptedFiles.forEach((file: any) => {
      formData.append(`image`, file);
    });

    try {
      const result = await fetch(`${API_HOST}/upload_photo`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await result.json();
      setResponse(response);
    } catch (err) {
      console.error(err);
      setError("Unable to upload file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const videoOnDrop = useCallback(async (acceptedFiles: any) => {
    setIsLoading(true);

    const formData = new FormData();
    console.log(acceptedFiles);
    acceptedFiles.forEach((file: any) => {
      formData.append(`video`, file);
    });

    try {
      const result = await fetch(`${API_HOST}/upload_video`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await result.json();

      setResponse(response);
    } catch (err) {
      console.error(err);
      setError("Unable to upload file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    onDrop: videoOnDrop,
    multiple: true,
  });

  const onReset = () => {
    setError(undefined);
    setResponse(null);
  };

  return (
    <VStack spacing={5} mt={24}>
      <Heading my={2}>Upload Shit</Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <FormControl id="file">
          <Box
            {...getRootProps()}
            border="2px"
            borderRadius="md"
            p={5}
            maxW="sm"
            mx="auto"
            borderColor={isDragActive ? "blue.500" : "gray.500"}
          >
            <FormLabel>Upload Image</FormLabel>
            <input {...getInputProps()} />
            <Text>
              {isDragActive
                ? "Drop the files here ..."
                : "Drag 'n' drop some files here, or click to select files"}
            </Text>
          </Box>
        </FormControl>
        <FormControl id="video">
          <Box
            {...getVideoRootProps()}
            border="2px"
            borderRadius="md"
            p={5}
            maxW="sm"
            mx="auto"
            borderColor={isVideoDragActive ? "blue.500" : "gray.500"}
          >
            <FormLabel>Upload Video</FormLabel>
            <input {...getVideoInputProps()} />
            <Text>
              {isVideoDragActive
                ? "Drop the videos here ..."
                : "Drag 'n' drop some videos here, or click to select videos"}
            </Text>
          </Box>
        </FormControl>
      </Grid>
      <Button onClick={onReset} isLoading={isLoading}>
        Upload
      </Button>
      {error && (
        <Box bg="red.500" color="white" p={3} rounded="md">
          <Heading size="md">Error</Heading>
          <Text>{error}</Text>
        </Box>
      )}
      {response && <UploadResponse message={response.message} />}
      {isLoading && <Spinner />}
    </VStack>
  );
}
