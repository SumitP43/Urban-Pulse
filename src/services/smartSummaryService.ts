export interface SmartSummaryRequest {
  title: string;
  content: string;
  publisher?: string;
  category?: string;
  location?: string;
  sourceId?: string;
}

export interface SmartSummaryResult {
  urbanPlanning: string;
  policyImpact: string;
  communityImpact: string;
  cachedAt?: string;
  fromCache?: boolean;
  fallback?: boolean;
}

export interface SmartSummaryServiceOptions {
  signal?: AbortSignal;
  forceRefresh?: boolean;
  timeoutMs?: number;
}

/**
 * SmartSummaryService interfaces with the Gemini API to analyze urban research text
 * and synthesize findings into exactly 3 structured bullet points:
 * 1. Urban Planning Impact
 * 2. Policy / Government Impact
 * 3. Infrastructure / Community Impact
 */
export class SmartSummaryService {
  private cache: Map<string, SmartSummaryResult> = new Map();
  private pendingRequests: Map<string, Promise<SmartSummaryResult>> = new Map();

  /**
   * Generates a unique cache key based on source ID or content fingerprint.
   */
  public getCacheKey(request: SmartSummaryRequest): string {
    if (request.sourceId) {
      return `id:${request.sourceId}`;
    }
    const cleanTitle = (request.title || '').trim().slice(0, 40);
    const cleanSnippet = (request.content || '').trim().slice(0, 80);
    return `${cleanTitle}::${cleanSnippet}`;
  }

  /**
   * Retrieves a cached summary if available in the current session.
   */
  public getCached(request: SmartSummaryRequest): SmartSummaryResult | undefined {
    const key = this.getCacheKey(request);
    return this.cache.get(key);
  }

  /**
   * Manually sets or pre-seeds a cached summary.
   */
  public setCached(request: SmartSummaryRequest, result: SmartSummaryResult): void {
    const key = this.getCacheKey(request);
    this.cache.set(key, { ...result, fromCache: true });
  }

  /**
   * Clears the in-memory session cache.
   */
  public clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Performs an asynchronous request to the Gemini API backend proxy to analyze and condense
   * research text into 3 structured bullet points.
   */
  public async generateSummary(
    request: SmartSummaryRequest,
    options: SmartSummaryServiceOptions = {}
  ): Promise<SmartSummaryResult> {
    const { forceRefresh = false, timeoutMs = 12000, signal } = options;

    if (!request.content || !request.content.trim()) {
      throw new Error('Research text content cannot be empty for Smart Summary analysis.');
    }

    const cacheKey = this.getCacheKey(request);

    // Return cached summary if available and not forced to refresh
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        ...cached,
        fromCache: true,
      };
    }

    // Deduplicate in-flight concurrent requests for the same source/content
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async (): Promise<SmartSummaryResult> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // If external signal is provided, forward abort
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }

      try {
        const response = await fetch('/api/research/smart-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: request.title,
            content: request.content,
            publisher: request.publisher,
            category: request.category || 'Urban Infrastructure',
            location: request.location,
            sourceId: request.sourceId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}`;
          try {
            const errJson = await response.json();
            if (errJson?.error) errorDetail = errJson.error;
          } catch {
            // fallback
          }

          if (response.status === 429) {
            throw new Error('Gemini API rate limit reached. Please wait a moment before retrying.');
          } else if (response.status === 503) {
            throw new Error('AI analysis service temporarily unavailable. Please retry in a few moments.');
          } else {
            throw new Error(`Unable to complete Smart Summary: ${errorDetail}`);
          }
        }

        const data = await response.json();

        // Validate structure
        const validatedResult: SmartSummaryResult = {
          urbanPlanning:
            data.urbanPlanning || 'The source does not provide sufficient information for urban planning impact.',
          policyImpact:
            data.policyImpact || 'The source does not provide sufficient information for policy or government impact.',
          communityImpact:
            data.communityImpact || 'The source does not provide sufficient information for infrastructure or community impact.',
          cachedAt: data.cachedAt || new Date().toISOString(),
          fromCache: false,
          fallback: !!data.fallback,
        };

        // Cache for current session
        this.cache.set(cacheKey, validatedResult);
        return validatedResult;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError' || controller.signal.aborted) {
          throw new Error('Request timed out while analyzing with Gemini API. Please check your connection and retry.');
        }
        throw err;
      } finally {
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }
}

// Export singleton instance for app-wide reuse
export const smartSummaryService = new SmartSummaryService();
