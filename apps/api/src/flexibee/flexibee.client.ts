import { BadGatewayException, Injectable, Logger } from "@nestjs/common";
import { type FlexibeeConfig, loadFlexibeeConfig } from "./flexibee.config";

const REQUEST_TIMEOUT_MS = 5_000;
const USER_AGENT = "loci-api/0.1.4";

type FlexibeeRow = Record<string, unknown>;

const entityName = (entity: string): string => entity.split("/")[0] ?? entity;

type FlexibeeResponse = {
  winstrom?: Record<string, unknown>;
};

/**
 * Minimal read-only client for the Flexibee REST API.
 * @see https://www.flexibee.eu/api/dokumentace/
 */
@Injectable()
export class FlexibeeClient {
  private readonly logger = new Logger(FlexibeeClient.name);

  async list(
    entity: string,
    query: Record<string, string>,
    config: FlexibeeConfig = loadFlexibeeConfig(),
  ): Promise<FlexibeeRow[]> {
    const url = this.buildUrl(entity, query, config);
    const credentials = Buffer.from(
      `${config.user}:${config.password}`,
    ).toString("base64");

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${credentials}`,
          // The public Flexibee demo rejects Node's default `node` User-Agent with 403.
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error(`Flexibee unreachable: ${String(error)}`);
      throw new BadGatewayException("Flexibee is unreachable");
    }

    if (!response.ok) {
      this.logger.error(`Flexibee responded with HTTP ${response.status}`);
      throw new BadGatewayException("Flexibee returned an error");
    }

    const body = (await response.json()) as FlexibeeResponse;
    // Filtered paths such as `cenik/(id=1)` are answered under the bare entity name.
    const rows = body.winstrom?.[entityName(entity)];

    return Array.isArray(rows) ? (rows as FlexibeeRow[]) : [];
  }

  private buildUrl(
    entity: string,
    query: Record<string, string>,
    config: FlexibeeConfig,
  ): URL {
    const base = config.url.replace(/\/+$/, "");
    const url = new URL(
      `${base}/c/${encodeURIComponent(config.company)}/${entity}.json`,
    );

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    return url;
  }
}
