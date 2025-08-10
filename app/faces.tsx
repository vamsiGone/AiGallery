// app/faces.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMediaScanner } from '../hooks/useMediaScanner';

const PERSONS_KEY = 'persons_v1';

type Person = { id: string; name: string; assetIds: string[] };

export default function FacesScreen() {
  const { assets } = useMediaScanner();
  const [persons, setPersons] = useState<Person[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(PERSONS_KEY);
      if (raw) setPersons(JSON.parse(raw));
    })();
  }, []);

  const save = async (ps: Person[]) => {
    setPersons(ps);
    await AsyncStorage.setItem(PERSONS_KEY, JSON.stringify(ps));
  };

  const addPerson = async () => {
    if (!name.trim()) return Alert.alert('Name required');
    const id = Math.random().toString(36).slice(2, 9);
    const p = { id, name: name.trim(), assetIds: [] };
    await save([...persons, p]);
    setName('');
  };

  const assignToPerson = async (personId: string, assetId: string) => {
    const ps = persons.map(p => p.id === personId ? { ...p, assetIds: Array.from(new Set([...(p.assetIds || []), assetId])) } : p);
    await save(ps);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <Text style={{ fontWeight: '700' }}>Create Person</Text>
        <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, marginTop: 8, padding: 8 }} />
        <Button title="Add person" onPress={addPerson} />
      </View>

      <Text style={{ padding: 12, fontWeight: '700' }}>People</Text>
      <FlatList
        data={persons}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '700' }}>{item.name}</Text>
            <Text>{(item.assetIds || []).length} photos</Text>
          </View>
        )}
      />

      <Text style={{ padding: 12, fontWeight: '700' }}>Assign photo to person (tap image)</Text>
      <FlatList
        data={assets.slice(0, 200)} // show sample
        keyExtractor={a => a.id}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (persons.length === 0) return Alert.alert('Create a person first');
              // quick assign to first person — for demo. Ideally open a sheet to pick person
              assignToPerson(persons[0].id, item.id);
              Alert.alert('Assigned', `Assigned to ${persons[0].name}`);
            }}>
            <Image source={{ uri: item.uri }} style={{ width: 90, height: 90, margin: 6 }} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
