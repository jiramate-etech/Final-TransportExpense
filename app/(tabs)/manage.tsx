
import { View, Text, FlatList, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { ExpenseItem } from '../../constants/types';

export default function ManageScreen() {
    const [items, setItems] = useState<ExpenseItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const jsonValue = await AsyncStorage.getItem('travel_data');
        const data = jsonValue != null ? JSON.parse(jsonValue) : [];
        
        data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setItems(data);
};

    const confirmDelete = (id: string) => {
        Alert.alert('ยืนยันลบรายการ', 'ข้อมูลจะหายไปถาวรเลยนะ?', [
            { text: 'เก็บไว้ก่อน', style: 'cancel' },
            { text: 'ลบเลย', style: 'destructive', onPress: () => deleteItem(id) }
        ]);
    };

    const deleteItem = async (id: string) => {
        const newData = items.filter(item => item.id !== id);
        setItems(newData);
        await AsyncStorage.setItem('travel_data', JSON.stringify(newData));
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>จัดการประวัติ</Text>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />

                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.date}>
                                {item.date ? new Date(item.date).toLocaleDateString('th-TH') : 'ไม่ระบุวัน'} • {item.amount} บ.
                            </Text>
                        </View>

                        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.btnDelete}>
                            <FontAwesome6 name="trash-can" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { fontSize: 20, fontWeight: 'bold', marginVertical: 20, textAlign: 'center', color: '#333' },
    card: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 3 },
    thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eee' },
    title: { fontSize: 16, fontWeight: '500', color: '#333' },
    date: { color: '#888', fontSize: 12, marginTop: 2 },
    btnDelete: { padding: 10, backgroundColor: '#FFF0F0', borderRadius: 8 }
});