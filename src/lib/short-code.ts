import { randomBytes } from "crypto";


export function generateShortCode(length = 6){
  return randomBytes(8)
  .toString("base64url")
  .slice(0, length);
}