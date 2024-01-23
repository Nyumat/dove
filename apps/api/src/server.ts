import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { Upload } from "@aws-sdk/lib-storage";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import multer from "fastify-multer";
import fs from "fs";
import { dbClient } from ".";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const BUCKET_NAME = process.env.BUCKET_NAME || "nyumat-global";
const BUCKET_REGION = process.env.BUCKET_REGION || "us-west-2";
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY || "";
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY || "";
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID || "";
const DISTRIBUTION_ID = process.env.DISTRIBUTION_ID || "";
const CLOUDFRONT_BASE_URL = process.env.CLOUDFRONT_BASE_URL || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const PIN = process.env.PIN || "";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

const cloudFrontClient = new CloudFrontClient({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

export const createServer = () => {
  const app = fastify({ logger: true });

  app.register(cors);
  app.register(upload.contentParser);

  app.register(fastifyJwt, {
    secret: JWT_SECRET,
  });

  app.addHook("onRequest", async (request, reply) => {
    if (
      request.url === "/all" ||
      request.url === "/auth" ||
      request.url === "/auth/verify"
    ) {
      return;
    }

    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  app.get("/auth/verify", async (request, reply) => {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      reply.status(401);
      return { ok: false };
    }

    const decoded = app.jwt.decode(token);

    if (!decoded) {
      reply.status(401);
      return { ok: false };
    }

    const pin = (decoded as Record<string, string>).pin;

    if (!pin) {
      reply.status(401);
      return { ok: false };
    }

    const existingAdmin = await dbClient.admin.findFirst();

    if (!existingAdmin) {
      reply.status(401);
      return { ok: false };
    }

    if (existingAdmin.pin !== pin) {
      reply.status(401);
      return { ok: false };
    }

    return { ok: true };
  });

  app.post("/auth", async (request, reply) => {
    if (!request.body) {
      reply.status(401);
      return { ok: false };
    }
    const body = request.body as Record<string, string>;

    if (body.pin !== PIN) {
      reply.status(401);
      return { ok: false };
    }

    const existingAdmin = await dbClient.admin.findFirst();

    if (existingAdmin) {
      await dbClient.admin.delete({ where: { id: existingAdmin.id } });
    }

    await dbClient.admin.create({
      data: {
        pin: body.pin,
      },
    });

    const token = app.jwt.sign({ pin: body.pin });
    return { ok: true, token };
  });

  app.get("/all", async () => {
    const images = await dbClient.photo.findMany({
      orderBy: [{ id: "desc" }],
    });

    const videos = await dbClient.video.findMany({
      orderBy: [{ id: "desc" }],
    });

    for (const video of videos) {
      video.videoUrl = getSignedUrl({
        url: `${CLOUDFRONT_BASE_URL}/${video.videoName}`,
        dateLessThan: `${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)}`,
        privateKey: CLOUDFRONT_PRIVATE_KEY,
        keyPairId: CLOUDFRONT_KEY_PAIR_ID,
      });
    }

    for (const image of images) {
      // If I ever don't want to sign the URL, I can just do this:
      //image.imageUrl = `https://d3uraa353l50l1.cloudfront.net/${image.imageName}`;
      image.imageUrl = getSignedUrl({
        url: `${CLOUDFRONT_BASE_URL}/${image.imageName}`,
        dateLessThan: `${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)}`,
        privateKey: CLOUDFRONT_PRIVATE_KEY,
        keyPairId: CLOUDFRONT_KEY_PAIR_ID,
      });
    }

    return { images, videos };
  });

  app.delete("/delete/:id/:modal", async (request) => {
    const id = Number((request.params as Record<string, string>).id);
    const modal = (request.params as Record<string, string>).modal;
    let video;
    let photo;

    if (modal === "video") {
      video = await dbClient.video.findUnique({
        where: { id },
      });
    } else if (modal === "photo") {
      photo = await dbClient.photo.findUnique({
        where: { id },
      });
    } else {
      return { ok: false };
    }

    if (!video && !photo) {
      return { ok: false };
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: video ? video.videoName : photo?.imageName ?? "",
    });

    const invalidateCommand = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: video ? video.videoName : photo?.imageName ?? "",
        Paths: {
          Quantity: 1,
          Items: [`/${video ? video.videoName : photo?.imageName ?? ""}`],
        },
      },
    });

    try {
      await cloudFrontClient.send(invalidateCommand);
    } catch (error) {
      console.log(error);
      return { ok: false };
    }

    try {
      await s3Client.send(command);
    } catch (error) {
      console.log(error);
      return { ok: false };
    }

    try {
      video
        ? await dbClient.video.delete({ where: { id } })
        : await dbClient.photo.delete({ where: { id } });
    } catch (error) {
      console.log(error);
      return { ok: false };
    }

    return { ok: true };
  });

  app.post(
    "/upload_video",
    { preHandler: upload.single("video") },
    async (request) => {
      //@ts-expect-error This package doesn't have types
      const file = request.file;
      const fileContent = fs.readFileSync(file.path);
      fs.unlinkSync(file.path);

      const params = {
        Bucket: BUCKET_NAME,
        Key: file.filename,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const upload = new Upload({
        client: s3Client,
        params,
      });

      try {
        await upload.done();
      } catch (error) {
        console.log(error);
        return { ok: false };
      }

      try {
        const videoUrl = CLOUDFRONT_BASE_URL + "/" + file.filename;
        const item = await dbClient.video.create({
          data: {
            videoUrl,
            videoName: file.filename,
          },
        });
        return { ok: true, id: item.id };
      } catch (error) {
        console.log(error);
        return { ok: false };
      }
    },
  );

  app.post(
    "/upload_photo",
    { preHandler: upload.single("image") },
    async (request) => {
      //@ts-expect-error This package doesn't have types
      const file = request.file;
      const fileContent = fs.readFileSync(file.path);

      const params = {
        Bucket: BUCKET_NAME,
        Key: file.filename,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const upload = new Upload({
        client: s3Client,
        params,
      });

      try {
        await upload.done();
      } catch (error) {
        console.log(error);
        return { ok: false };
      }

      try {
        const imageUrl = CLOUDFRONT_BASE_URL + "/" + file.filename;
        const item = await dbClient.photo.create({
          data: {
            imageUrl,
            imageName: file.filename,
          },
        });
        return { ok: true, id: item.id };
      } catch (error) {
        console.log(error);
        return { ok: false };
      }
    },
  );

  app.get("/health", async () => {
    return { ok: true };
  });

  return app;
};
