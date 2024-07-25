export interface RuntimeConfig {
  node: { env: "prod" | "production" | "dev" | "development" };
  offset: {
    page: number;
    url: string;
  };
  limit: {
    page: number;
    timeout: number;
  };
  completionRateToSuccess: number;
  fatalErrorDepth: number;
}
