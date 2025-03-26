import https from "node:https";

import { XMLParser } from "fast-xml-parser";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@smithy/protocol-http";
import {
    getSignedUrl,
    S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";
import {IncomingMessage} from "node:http";


export interface bucketType {
    bucketName: string;
    key: string;
    region: string;
}

export const createPresignedUrlWithoutClient = async ({ region, bucketName, key } : bucketType) => {
    const url = parseUrl(`https://${bucketName}.s3.${region}.amazonaws.com/${key}`);
    const presigner = new S3RequestPresigner({
        credentials: fromIni(),
        region,
        sha256: Hash.bind(null, "sha256"),
    });

    const signedUrlObject = await presigner.presign(
        new HttpRequest({ ...url, method: "PUT" }),
    );
    return formatUrl(signedUrlObject);
};

export const createPresignedUrlWithClient = ({ region, bucketName, key } : bucketType) => {
    const client = new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    });
    const command = new PutObjectCommand({ Bucket: bucketName, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};


export const put = (url: string, data: string) => {
    return new Promise((resolve, reject) => {
        const req = https.request(
            url,
            { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
            (res: IncomingMessage) => {
                let responseBody = "";
                res.on("data", (chunk) => {
                    responseBody += chunk;
                });
                res.on("end", () => {
                    const parser = new XMLParser();
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve(parser.parse(responseBody, true));
                    } else {
                        reject(parser.parse(responseBody, true));
                    }
                });
            },
        );
        req.on("error", (err) => {
            reject(err);
        });
        req.write(data);
        req.end();
    });
};

export const put_buffer = (url: string, data: Buffer, mimetype?: string) => {
    const headers: Record<string, string | number> = {
        "Content-Length": data.length,
    };
    if (mimetype) {
        headers["Content-Type"] = mimetype;
    }
    return new Promise((resolve, reject) => {
        const req = https.request(
            url,
            {
                method: "PUT",
                headers
            },
            (res: IncomingMessage) => {
                let responseBody = "";
                res.on("data", (chunk) => {
                    responseBody += chunk;
                });
                res.on("end", () => {
                    const parser = new XMLParser();
                    const trimmedResponse = responseBody.trim();
                    if (!trimmedResponse) {
                        resolve({ message: "Success" });
                        return;
                    }
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode <= 299) {
                        resolve(parser.parse(responseBody, true));
                    } else {
                        reject(parser.parse(responseBody, true));
                    }
                });
            },
        );
        req.on("error", (err) => {
            reject(err);
        });
        req.write(data);
        req.end();
    });
};

