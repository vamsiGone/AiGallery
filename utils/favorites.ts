// utils/favorites.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'fav_assets';

export async function getFavs(): Promise<string[]> {
  const s = await AsyncStorage.getItem(KEY);
  return s ? JSON.parse(s) : [];
}

export async function addFav(id: string) {
  const list = await getFavs();
  if (!list.includes(id)) list.push(id);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function removeFav(id: string) {
  const list = (await getFavs()).filter(x => x !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
