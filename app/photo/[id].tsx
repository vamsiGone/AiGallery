// app/photo/[id].tsx
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

export default function PhotoViewer() {
  const { id } = useLocalSearchParams();
  const [asset, setAsset] = useState<MediaLibrary.Asset | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        // sometimes including location metadata requires ACCESS_MEDIA_LOCATION on Android
        const info = await MediaLibrary.getAssetInfoAsync(id as string);
        setAsset(info);
      } catch (e: any) {
        console.error('Failed to get asset info', e);
        if (String(e).includes('ExifInterface') || String(e).includes('ACCESS_MEDIA_LOCATION')) {
          Alert.alert(
            'Permission required',
            'Accessing GPS / EXIF location requires ACCESS_MEDIA_LOCATION on Android. For full functionality make a development build with that permission.',
          );
        }
      }
    })();
  }, [id]);

  if (!asset) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  const rotate = async () => {
    const result = await ImageManipulator.manipulateAsync(asset.uri, [{ rotate: 90 }], { compress: 0.9 });
    const created = await MediaLibrary.createAssetAsync(result.uri);
    Alert.alert('Rotated', 'Saved rotated copy.');
    setAsset(created);
  };

  const crop = async () => {
    const size = Math.min(asset.width ?? 1000, asset.height ?? 1000);
    const result = await ImageManipulator.manipulateAsync(asset.uri, [{ crop: { originX: 0, originY: 0, width: size, height: size } }], { compress: 0.9 });
    const created = await MediaLibrary.createAssetAsync(result.uri);
    setAsset(created);
  };

  const share = async () => {
    await Sharing.shareAsync(asset.uri);
  };

  const del = async () => {
    const ok = await MediaLibrary.deleteAssetsAsync([asset.id]);
    if (ok) {
      Alert.alert('Deleted');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: asset.uri }} style={styles.image} contentFit="contain" />
      <View style={styles.row}>
        <Button title="Rotate" onPress={rotate} />
        <Button title="Crop" onPress={crop} />
        <Button title="Share" onPress={share} />
        <Button title="Delete" onPress={del} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
});
