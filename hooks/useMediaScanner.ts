// hooks/useMediaScanner.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';

const SELECTED_ALBUMS_KEY = 'selected_albums_v1';
const MAX_PER_ALBUM = 500; // adjust for performance

export function useMediaScanner() {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[] | null>(null);

  const loadSelectedAlbums = useCallback(async () => {
    const raw = await AsyncStorage.getItem(SELECTED_ALBUMS_KEY);
    if (!raw) {
      setSelectedAlbumIds(null); // null = include ALL albums by default
      return;
    }
    try {
      setSelectedAlbumIds(JSON.parse(raw));
    } catch {
      setSelectedAlbumIds(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSelectedAlbums();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setAlbums([]);
        setAssets([]);
        setLoading(false);
        return;
      }

      const al = await MediaLibrary.getAlbumsAsync();
      setAlbums(al || []);

      // If user has selected specific albums, fetch per album, else fetch recent assets across all
      let collected: MediaLibrary.Asset[] = [];

      try {
        if (selectedAlbumIds && selectedAlbumIds.length > 0) {
          // fetch per selected album
          for (const aid of selectedAlbumIds) {
            const res = await MediaLibrary.getAssetsAsync({
              album: aid,
              first: MAX_PER_ALBUM,
              mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
              sortBy: [MediaLibrary.SortBy.creationTime],
            });
            collected = collected.concat(res.assets);
          }
        } else {
          // fetch latest assets across device - paginated
          let after: string | undefined = undefined;
          const pageSize = 200;
          while (true) {
            const res = await MediaLibrary.getAssetsAsync({
              first: pageSize,
              after,
              mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
              sortBy: [MediaLibrary.SortBy.creationTime],
            });
            collected = collected.concat(res.assets);
            if (!res.hasNextPage || collected.length >= 1000) break;
            after = res.endCursor ?? undefined;
          }
        }
      } catch (e) {
        console.warn('scan error', e);
      }

      // Ensure unique & sorted (desc by creationTime)
      const uniq = new Map(collected.map(a => [a.id, a]));
      const arr = Array.from(uniq.values()).sort((a, b) => (b.creationTime ?? 0) - (a.creationTime ?? 0));
      setAssets(arr);
      setLoading(false);
    })();
  }, [selectedAlbumIds, loadSelectedAlbums]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadSelectedAlbums();
    setLoading(false);
  }, [loadSelectedAlbums]);

  const saveSelectedAlbums = useCallback(async (ids: string[] | null) => {
    if (!ids) {
      await AsyncStorage.removeItem(SELECTED_ALBUMS_KEY);
      setSelectedAlbumIds(null);
      return;
    }
    await AsyncStorage.setItem(SELECTED_ALBUMS_KEY, JSON.stringify(ids));
    setSelectedAlbumIds(ids);
  }, []);

  return { assets, albums, loading, refresh, selectedAlbumIds, saveSelectedAlbums };
}
