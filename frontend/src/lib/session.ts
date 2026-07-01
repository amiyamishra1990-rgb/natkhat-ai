import AsyncStorage from '@react-native-async-storage/async-storage';

const K_PARENT = 'natkhat.parent';
const K_CHILD = 'natkhat.child';

export type Parent = { id: string; mobile: string; name?: string; email?: string };
export type Child = {
  id: string;
  parent_id: string;
  child_name: string;
  age: number;
  bhasha: string;
  xp: number;
  level: number;
  streak_days: number;
  has_seen_intro: boolean;
  unlocked_portals: string[];
  level_info?: {
    level: number;
    title: string;
    emoji: string;
    current_level_xp: number;
    next_level_xp: number;
  };
};

export async function saveParent(p: Parent) {
  await AsyncStorage.setItem(K_PARENT, JSON.stringify(p));
}
export async function getParent(): Promise<Parent | null> {
  const raw = await AsyncStorage.getItem(K_PARENT);
  return raw ? JSON.parse(raw) : null;
}
export async function saveChild(c: Child) {
  await AsyncStorage.setItem(K_CHILD, JSON.stringify(c));
}
export async function getChild(): Promise<Child | null> {
  const raw = await AsyncStorage.getItem(K_CHILD);
  return raw ? JSON.parse(raw) : null;
}
export async function clearSession() {
  await AsyncStorage.multiRemove([K_PARENT, K_CHILD]);
}
