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
        const info = await MediaLibrary.getAssetInfoAsync(id as string);
        setAsset(info);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!asset) return <View />;

  const rotate = async () => {
    const result = await ImageManipulator.manipulateAsync(asset.uri, [{ rotate: 90 }], { compress: 0.9 });
    // save as new asset
    const created = await MediaLibrary.createAssetAsync(result.uri);
    // optionally replace old asset or keep both
    Alert.alert('Rotated', 'Saved rotated copy.');
    setAsset(created);
  };

  const crop = async () => {
    // simple square crop center example
    const result = await ImageManipulator.manipulateAsync(asset.uri, [{ crop: { originX: 0, originY: 0, width: asset.width, height: asset.width } }], { compress: 0.9 });
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
// This component allows viewing, rotating, cropping, sharing, and deleting a photo asset.
// It uses MediaLibrary for asset management and ImageManipulator for image editing.