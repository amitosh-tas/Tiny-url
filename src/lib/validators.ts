import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl : z
  .url("Please enter a valid URL")
  .refine(
    (url) => ['http:', 'https:'].includes(new URL(url).protocol),
    "Only HTTP and HTTPS URLs are allowed"
  ),
});