import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SettingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)}>
        <Text>Open Settings Menu</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Pressable
              style={styles.item}
              onPress={() => {
                setOpen(false);
               router.push("/settings" as any);
              }}
            >
              <Text>Add / Remove Folders</Text>
            </Pressable>

            <Pressable
              style={styles.item}
              onPress={() => {
                setOpen(false);
                router.push("/settings?tab=export" as any);
              }}
            >
              <Text>Backup / Export</Text>
            </Pressable>

            <Pressable
              style={styles.item}
              onPress={() => setOpen(false)}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: 250,
  },
  item: {
    paddingVertical: 10,
  },
});
