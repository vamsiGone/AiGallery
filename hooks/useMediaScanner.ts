// hooks/useMediaScanner.ts
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';

export function useMediaScanner() {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        mediaType: [MediaLibrary.MediaType.photo],
        first: 100, // adjust as needed
      });

      setAssets(media.assets);
      setLoading(false);
    })();
  }, []);

  return { assets, loading };
}
