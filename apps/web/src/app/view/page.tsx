"use client";

import { Link } from "@chakra-ui/next-js";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { ImageCard, VideoCard } from "./Card";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

type Photo = {
  id: string;
  imageName: string;
  imageUrl: string;
};

type Video = {
  id: string;
  videoName: string;
  videoUrl: string;
};

type Response = {
  images: Photo[];
  videos: Video[];
};

export default function View() {
  const [response, setResponse] = useState<Response | null>(null);
  const [error, setError] = useState<string | undefined>();
  let token: unknown;
  if (global?.window !== undefined) {
    localStorage.get("token", token);
  }
  const onReset = () => {
    setError(undefined);
    setResponse(null);
  };

  const reFetch = async () => {
    try {
      const result = await fetch(`${API_HOST}/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await result.json();
      setResponse(response);
    } catch (err) {
      console.error(err);
      setError("Unable to refetch images");
    }
  };

  const onDelete = useCallback(async (id: string, type: string) => {
    switch (type) {
      case "photo":
        await deletePhoto(id);
        setResponse((prev) => {
          if (!prev) {
            return null;
          }
          return {
            ...prev,
            photos: prev.images.filter((photo) => photo.id !== id),
          };
        });
        break;
      case "video":
        await deleteVideo(id);
        setResponse((prev) => {
          if (!prev) {
            return null;
          }
          return {
            ...prev,
            videos: prev.videos.filter((video) => video.id !== id),
          };
        });
        break;
      default:
        break;
    }
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    try {
      const result = await fetch(`${API_HOST}/delete/${id}/photo`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok) {
        throw new Error("Error deleting image");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete image");
    }
  }, []);

  const deleteVideo = useCallback(async (id: string) => {
    try {
      const result = await fetch(`${API_HOST}/delete/${id}/video`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok) {
        throw new Error("Error deleting image");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete image");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch(`${API_HOST}/all`, {
          method: "GET",
        });
        const response = await result.json();
        setResponse(response);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch images");
      }
    })();
  }, []);

  if (!response) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <VStack spacing={5} my={12}>
        <Heading>Current Gallery</Heading>
        <Heading size="md">Photos</Heading>
        <Box
          padding={4}
          w="100%"
          mx="auto"
          sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
        >
          {response.images &&
            response.images.map((image: Photo) => (
              <ImageCard
                key={image.id}
                id={image.id}
                imageName={image.imageName}
                imageUrl={image.imageUrl}
                onDelete={onDelete}
              />
            ))}
        </Box>

        <Heading size="md">Videos</Heading>
        <Box
          padding={4}
          w="100%"
          mx="auto"
          sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
        >
          {response.videos &&
            response.videos.map((video: Video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                videoName={video.videoName}
                videoUrl={video.videoUrl}
                onDelete={onDelete}
              />
            ))}
        </Box>

        {error && (
          <Box bg="red.500" color="white" p={3} rounded="md">
            <Heading size="md">Error</Heading>
            <Text>{error}</Text>
          </Box>
        )}
        {response && (
          <Box>
            <Button colorScheme="blue" onClick={onReset}>
              Reset
            </Button>
          </Box>
        )}

        <Button colorScheme="teal" onClick={reFetch}>
          Re-fetch
        </Button>

        <Link href="/">
          <Text>Back</Text>
        </Link>
      </VStack>
    </div>
  );
}
