"use client";

import { Box, Flex, HStack, IconButton, Image } from "@chakra-ui/react";
import copy from "copy-text-to-clipboard";
import { useRouter } from "next/navigation";
import { FaCopy, FaEye, FaTrash } from "react-icons/fa";

type ImageCardProps = {
  id: string;
  imageName: string;
  imageUrl: string;
  onDelete: (id: string, type: string) => void;
};

export const ImageCard: React.FC<ImageCardProps> = ({
  id,
  imageName,
  imageUrl,
  onDelete,
}) => {
  const router = useRouter();

  const onView = () => {
    router.push(`/view?id=${id}`);
  };

  const onCopy = () => {
    copy(imageUrl);
  };

  console.log({ imageUrl });

  return (
    <HStack key={id} spacing={5} position="relative">
      <Image
        w="100%"
        borderRadius="xl"
        mb={2}
        dir="inline-block"
        src={imageUrl}
        alt={imageName}
      />
      <Box position="absolute" top="5" right="5">
        <Flex direction="column">
          <IconButton
            aria-label="Delete"
            icon={<FaTrash />}
            colorScheme="red"
            mb={2}
            onClick={() => onDelete(id, "photo")}
          />
          <IconButton
            aria-label="View"
            icon={<FaEye />}
            colorScheme="blue"
            mb={2}
            onClick={onView}
          />
          <IconButton
            aria-label="Copy"
            icon={<FaCopy />}
            colorScheme="teal"
            onClick={onCopy}
          />
        </Flex>
      </Box>
    </HStack>
  );
};

type VideoCardProps = {
  id: string;
  videoName: string;
  videoUrl: string;
  onDelete: (id: string, type: string) => void;
};

export const VideoCard: React.FC<VideoCardProps> = ({
  id,
  videoName,
  videoUrl,
  onDelete,
}) => {
  const router = useRouter();

  const onView = () => {
    router.push(`/view?id=${id}`);
  };

  const onCopy = () => {
    copy(videoUrl);
  };

  return (
    <HStack key={id} spacing={5} position="relative">
      <video controls width="100%" height="auto">
        <source src={videoUrl} type="video/mp4" />
      </video>
      <Box position="absolute" top="5" right="5" h={"full"}>
        <Flex direction="column" gap={4}>
          <IconButton
            aria-label="Delete"
            icon={<FaTrash />}
            colorScheme="red"
            onClick={() => onDelete(id, "video")}
          />
          <IconButton
            aria-label="Copy"
            icon={<FaCopy />}
            colorScheme="teal"
            onClick={onCopy}
          />
          <IconButton
            aria-label="View"
            icon={<FaEye />}
            colorScheme="blue"
            onClick={onView}
          />
        </Flex>
      </Box>
    </HStack>
  );
};
