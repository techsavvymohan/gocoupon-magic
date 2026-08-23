/**
 * @file vercel.d.ts
 * @description Ambient TypeScript declarations for @vercel/node serverless function handlers.
 */

declare module "@vercel/node" {
  import type { IncomingMessage, ServerResponse } from "node:http";

  export interface VercelRequestQuery {
    [key: string]: string | string[] | undefined;
  }

  export interface VercelRequestCookies {
    [key: string]: string;
  }

  export interface VercelRequest extends IncomingMessage {
    query: VercelRequestQuery;
    cookies?: VercelRequestCookies;
    body?: any;
  }

  export interface VercelResponse extends ServerResponse {
    send: (body: any) => VercelResponse;
    json: (jsonBody: any) => VercelResponse;
    status: (statusCode: number) => VercelResponse;
    redirect: (statusOrUrl: string | number, url?: string) => VercelResponse;
  }
}
