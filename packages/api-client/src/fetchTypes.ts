export type ApiClientCredentials = "omit" | "include" | "same-origin";

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export interface ApiRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  credentials?: ApiClientCredentials;
}

export type FetchLike = (url: string, init: ApiRequestInit) => Promise<FetchResponseLike>;

