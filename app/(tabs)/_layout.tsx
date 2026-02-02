
import { Tabs } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,        // ปิด Header ของแท็บ (เราจะไปสร้างเองในแต่ละหน้า)
      tabBarActiveTintColor: '#007AFF', // สีไอคอนตอนเลือก (สีฟ้า)
      tabBarStyle: { height: 90, paddingBottom: 30, paddingTop: 5 } // จัดความสูงแท็บ
    }}>
      {/* แท็บที่ 1: ภาพรวม */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'ภาพรวม',
          tabBarIcon: ({ color }) => <FontAwesome6 name="list" size={24} color={color} />
        }}
      />

      {/* แท็บที่ 2: เพิ่มข้อมูล */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'จดบันทึก',
          tabBarIcon: ({ color }) => <FontAwesome6 name="pen" size={24} color={color} />
        }}
      />

      {/* แท็บที่ 3: จัดการ (ลบ) */}
      <Tabs.Screen
        name="manage"
        options={{
          title: 'จัดการ',
          tabBarIcon: ({ color }) => <FontAwesome6 name="trash-can" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}