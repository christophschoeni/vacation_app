import AsyncStorage from '@react-native-async-storage/async-storage';

async function checkStorage() {
  console.log('\n=== Checking AsyncStorage ===\n');

  // Check all possible keys
  const keys = [
    'expenses',
    '@vacation_assist:expenses',
    '@vacation_assist:vacations',
  ];

  for (const key of keys) {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`\n${key}:`);
      console.log(`  Count: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
      console.log(`  Data: ${JSON.stringify(parsed, null, 2).substring(0, 500)}...`);
    } else {
      console.log(`\n${key}: (empty)`);
    }
  }

  console.log('\n=== All Storage Keys ===');
  const allKeys = await AsyncStorage.getAllKeys();
  console.log(allKeys);
}

checkStorage();
