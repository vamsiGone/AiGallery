// utils/duplicates.ts
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-media-library';
import { sha256 } from 'js-sha256';

export function findCandidateDuplicates(assets: Asset[]) {
  const map = new Map<string, Asset[]>();
  for (const a of assets) {
    const key = `${a.filename}_${a.width}x${a.height}_${Math.floor((a.creationTime ?? 0)/ (60*60*24))}`; // same day & same name/size
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.values()).filter(g => g.length > 1);
}

export async function computeHashForAsset(a: Asset) {
  const uri = a.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return sha256(base64);
}
