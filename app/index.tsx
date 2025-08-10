// app/index.tsx
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SettingsMenu from '../components/SettingsMenu';
import { useMediaScanner } from '../hooks/useMediaScanner';
import { chunk } from '../utils/chunk';

const NUM_COLUMNS = 3;
const WINDOW_WIDTH = Dimensions.get('window').width;

export default function Home() {
  const { assets, loading } = useMediaScanner();
  const router = useRouter();

  const sections = useMemo(() => {
    // group by day (creationTime is seconds)
    const map = new Map<number, any[]>();
    for (const a of assets) {
      const ts = a.creationTime ?? Date.now();
      const startOfDay = new Date(ts).setHours(0, 0, 0, 0);

      if (!map.has(startOfDay)) map.set(startOfDay, []);
      map.get(startOfDay)!.push(a);
    }
    // sort keys desc (recent first)
    return Array.from(map.entries())
      .sort((a, b) => (b[0] - a[0]))
      .map(([titleTs, items]) => ({
        titleTs,
        title: format(new Date(titleTs), 'dd-MMM-yyyy'),
        data: chunk(items, NUM_COLUMNS), // each row = array of assets
      }));
  }, [assets]);

  return (
    <View style={{ flex: 1 }}>
      <SettingsMenu />
      <SectionList
        sections={sections}
        keyExtractor={(itemRow, index) => itemRow.map((it: any) => it.id).join('_') + '_' + index}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}><Text style={styles.headerText}>{title}</Text></View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((it: any) => (
              <TouchableOpacity key={it.id} style={styles.cell} onPress={() => router.push(`/photo/${it.id}`)}>
                <Image source={{ uri: it.uri }} style={styles.thumb} contentFit="cover" />
              </TouchableOpacity>
            ))}
            {/* fill empty cells for alignment */}
            {row.length < NUM_COLUMNS && Array.from({ length: NUM_COLUMNS - row.length }).map((_, i) => <View key={`empty-${i}`} style={styles.cell} />)}
          </View>
        )}
        contentContainerStyle={{ padding: 8 }}
      />
      {loading && <Text style={{ textAlign: 'center', padding: 8 }}>Loading...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 8 },
  headerText: { fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 8 },
  cell: { flex: 1, marginHorizontal: 4, aspectRatio: 1, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
});
