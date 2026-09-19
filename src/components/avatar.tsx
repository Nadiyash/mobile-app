import { View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function Avatar({
  uri,
  size = 48,
  icon = 'domain',
}: {
  uri: string | null;
  size?: number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: 10, backgroundColor: '#E4E1DA' }}
      />
    );
  }
  return (
    <View
      style={{
        width: size, height: size, borderRadius: 10,
        backgroundColor: '#E7E4FB', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.5} color="#4A3FC4" />
    </View>
  );
}