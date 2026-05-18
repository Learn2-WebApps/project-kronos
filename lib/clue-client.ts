import type { ClueMetadata } from './clue-catalog';

let clientCache: ClueMetadata[] | null = null;
let fetchPromise: Promise<ClueMetadata[]> | null = null;

/**
 * 클라이언트 사이드에서 단서 카탈로그를 가져오고 캐싱합니다.
 */
export async function fetchClueCatalog(): Promise<ClueMetadata[]> {
  if (clientCache) return clientCache;
  if (fetchPromise) return fetchPromise;
  
  fetchPromise = fetch('/api/clues')
    .then(async r => {
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || '단서 카탈로그를 가져오지 못했습니다.');
      }
      return r.json();
    })
    .then((data: ClueMetadata[]) => {
      clientCache = data;
      return data;
    })
    .catch(err => {
      fetchPromise = null; // 실패 시 재시도 가능하도록 초기화
      throw err;
    });
  
  return fetchPromise;
}

/**
 * 캐시된 카탈로그에서 단서를 찾습니다. (fetchClueCatalog 호출 후 사용 권장)
 */
export function getClueFromCache(id: string): ClueMetadata | undefined {
  return clientCache?.find(c => c.id === id);
}
