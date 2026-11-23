import { ServiceUnavailableException } from "@nestjs/common";

export type FlexibeeConfig = {
  url: string;
  company: string;
  user: string;
  password: string;
};

const REQUIRED_VARIABLES = {
  url: "FLEXI_URL",
  company: "FLEXI_COMPANY",
  user: "FLEXI_USER",
  password: "FLEXI_PASSWORD",
} as const;

/**
 * Reads Flexibee settings from the environment on demand, so the API still
 * boots (and its non-Flexibee routes still work) when the variables are absent.
 */
export const loadFlexibeeConfig = (
  env: NodeJS.ProcessEnv = process.env,
): FlexibeeConfig => {
  const missing = Object.values(REQUIRED_VARIABLES).filter(
    (name) => !env[name],
  );

  if (missing.length > 0) {
    throw new ServiceUnavailableException(
      `Flexibee is not configured, missing: ${missing.join(", ")}`,
    );
  }

  return {
    url: env[REQUIRED_VARIABLES.url] as string,
    company: env[REQUIRED_VARIABLES.company] as string,
    user: env[REQUIRED_VARIABLES.user] as string,
    password: env[REQUIRED_VARIABLES.password] as string,
  };
};
