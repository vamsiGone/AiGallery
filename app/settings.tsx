// app/settings.tsx
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, SafeAreaView, Switch, Text, View } from 'react-native';
import { useMediaScanner } from '../hooks/useMediaScanner';

const SELECTED_ALBUMS_KEY = 'selected_albums_v1';

export default function SettingsScreen() {
  const { albums, refresh, selectedAlbumIds, saveSelectedAlbums } = useMediaScanner() as any;
  const [localSelected, setLocalSelected] = useState<string[] | null>(null);

  useEffect(() => {
    setLocalSelected(selectedAlbumIds);
  }, [selectedAlbumIds]);

  const toggleAlbum = (id: string) => {
    const arr = localSelected ? [...localSelected] : [];
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(id);
    setLocalSelected(arr);
  };

  const save = async () => {
    await saveSelectedAlbums(localSelected && localSelected.length ? localSelected : null);
    Alert.alert('Saved', 'Selected albums saved. Refreshing scan.');
    refresh();
  };

  const exportSelected = async () => {
    // Copy selected album assets to documentDirectory/backup-<ts>
    try {
      const ts = Date.now();
      const dstDir = `${FileSystem.documentDirectory}backup-${ts}/`;
      await FileSystem.makeDirectoryAsync(dstDir, { intermediates: true });

      // collect assets for selected albums (or all if none chosen)
      const sel = localSelected;
      const albumsToExport = sel && sel.length ? albums.filter((a: any) => sel.includes(a.id)) : albums;
      let copied = 0;
      for (const album of albumsToExport) {
        const res = await MediaLibrary.getAssetsAsync({ album: album.id, first: 1000 });
        for (const asset of res.assets) {
          const filename = asset.filename ?? `${asset.id}.jpg`;
          const uri = asset.uri;
          const dest = `${dstDir}${filename}`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          copied++;
        }
      }
      Alert.alert('Export complete', `Copied ${copied} files to ${dstDir}`);
    } catch (e) {
      console.error(e);
      Alert.alert('Export failed', String(e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontWeight: '700', padding: 12 }}>Add / Remove Folders (Albums)</Text>
      <FlatList
        data={albums}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => {
          const isOn = localSelected ? localSelected.includes(item.id) : false;
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
              <View style={{ flex: 1 }}>
                <Text>{item.title}</Text>
                <Text style={{ color: '#666' }}>{item.assetCount} items</Text>
              </View>
              <Switch value={isOn} onValueChange={() => toggleAlbum(item.id)} />
            </View>
          );
        }}
      />
      <View style={{ padding: 12 }}>
        <Button title="Save Selected Folders" onPress={save} />
        <View style={{ height: 12 }} />
        <Button title="Backup / Export Selected" onPress={exportSelected} />
      </View>
    </SafeAreaView>
  );
}
