import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProviderNode, ServiceRecord, User, UserRole } from '../models/types';

const USER_KEY = '@road_sos_user';
const USER_ROLE_KEY = '@road_sos_user_role';
const PROVIDER_NODE_KEY = '@road_sos_provider_nodes';
const SERVICES_KEY = '@road_sos_services';

export async function saveUserSession(user: User) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUserSession(): Promise<User | null> {
  const stored = await AsyncStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function saveUserProfile(user: User) {
  await saveUserSession(user);
}

export async function loadUserProfile(): Promise<User | null> {
  return loadUserSession();
}

export async function saveUserRole(role: UserRole) {
  await AsyncStorage.setItem(USER_ROLE_KEY, role);
}

export async function loadUserRole(): Promise<UserRole | null> {
  const stored = await AsyncStorage.getItem(USER_ROLE_KEY);
  return stored === 'citizen' || stored === 'provider' ? stored : null;
}

export async function saveProviderNode(node: ProviderNode) {
  const existing = await loadProviderNodes();
  await AsyncStorage.setItem(PROVIDER_NODE_KEY, JSON.stringify([...existing, node]));
}

export async function loadProviderNodes(): Promise<ProviderNode[]> {
  const stored = await AsyncStorage.getItem(PROVIDER_NODE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveServiceRecords(services: ServiceRecord[]) {
  await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

export async function loadServiceRecords(): Promise<ServiceRecord[]> {
  const stored = await AsyncStorage.getItem(SERVICES_KEY);
  return stored ? JSON.parse(stored) : [];
}
