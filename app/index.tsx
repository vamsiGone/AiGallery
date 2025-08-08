// app/index.tsx
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMediaScanner } from '../hooks/useMediaScanner';

type Section = {
  title: string;
  data: any[];
};

export default function Home() {
  const { assets, loading } = useMediaScanner();
  const router = useRouter();

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of assets) {
      // asset.creationTime is seconds (MediaLibrary) -> convert to ms
      const ts = (a.creationTime ?? Date.now()) * 1000;
      const day = format(new Date(ts), 'yyyy-MM-dd');
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(a);
    }
    // convert to array with sorted keys (desc)
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([title, data]) => ({ title, data }));
  }, [assets]);

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}><Text style={styles.headerText}>{title}</Text></View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/photo/${item.id}`)}>
            <Image style={styles.thumb} source={{ uri: item.uri }} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 8 },
  headerText: { fontWeight: '700', fontSize: 16 },
  thumb: { width: 120, height: 120, margin: 4, borderRadius: 6 },
});
// This is the main entry point for the app, displaying a list of media assets grouped by date.