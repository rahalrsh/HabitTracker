import { StyleSheet, Text, View, Pressable, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';

const { width } = Dimensions.get('window');
const MODAL_PADDING = 40; // 20px on each side
const COLOR_GAP = 12;
const COLOR_BUTTON_SIZE = (width - MODAL_PADDING - (COLOR_GAP * 4)) / 5; // 5 columns with 4 gaps between them

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
];

export const ICONS = [
    // Core / Progress
    'circle-check',
    'calendar',
    'clock',
    'fire',
    'trophy',
    'bullseye',
    'chart-line',
  
    // Health & Fitness
    'heart',
    'shield-heart',
    'droplet',
    'utensils',
    'bed',
    'moon',
    'sun',
    'dumbbell',
    'person-running',
    'leaf',
  
    // Mind, Learning & Self-Care
    'brain',
    'book-open',
    'graduation-cap',
    'pen',
    'face-smile',
    'lotus-flower',
    'seedling',
  
    // Lifestyle
    'mug-saucer',
    'house',
    'music',
    'paw',
  
    // Productivity & Work
    'list-check',
    'stopwatch',
    'briefcase',
    'laptop',
    'envelope',
    'bell',
  
    // Personal Care & Finance
    'tooth',
    'shower',
    'wallet',
  
    // Environment & Values
    'recycle',
  
    // Social
    'users',

    // Travel & Leisure
    'plane',
    'suitcase',
    'map-location',
    'camera',
    'car',
    'bicycle',

    // Entertainment
    'tv',
    'gamepad',
    'masks-theater',
    'clapperboard',
    'palette',
];
  
  

export default function ModalNewHabit({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[3]); // default to green
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]); // default to circle-check

  const handleSave = () => {
    // TODO: Save habit logic here
    console.log('Saving habit:', { name, description, color: selectedColor, icon: selectedIcon });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalInner}
          >
            <View style={styles.modalHeader}>
              <Text className="text-2xl font-bold text-white text-center">New Habit</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <FontAwesome6 name="xmark" size={24} color="#ffffff" />
              </Pressable>
            </View>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter habit name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  className="text-white"
                />
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter habit description"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-white"
                />
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-3">Color</Text>
                <View style={styles.colorGrid}>
                  {COLORS.map((color, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorButtonSelected,
                        (index % 5 === 4) && styles.colorButtonLastInRow
                      ]}
                    >
                      {selectedColor === color && (
                        <FontAwesome6 name="check" size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-3">Icon</Text>
                <View style={styles.iconGrid}>
                  {ICONS.map((icon, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedIcon(icon)}
                      style={[
                        styles.iconButton,
                        selectedIcon === icon && styles.iconButtonSelected,
                        (index % 5 === 4) && styles.iconButtonLastInRow
                      ]}
                    >
                      <FontAwesome6 
                        name={icon} 
                        size={24} 
                        color={selectedIcon === icon ? selectedColor : '#9ca3af'} 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={[styles.saveButtonContainer, { paddingBottom: insets.bottom }]}>
              <Pressable 
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: selectedColor }]}
              >
                <Text className="text-white font-semibold text-base">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2c2c2c',
    flex: 1,
  },
  modalInner: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  modalBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  saveButtonContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#2c2c2c',
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: COLOR_BUTTON_SIZE,
    height: COLOR_BUTTON_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: COLOR_GAP,
    marginBottom: COLOR_GAP,
  },
  colorButtonLastInRow: {
    marginRight: 0,
  },
  colorButtonSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: COLOR_BUTTON_SIZE,
    height: COLOR_BUTTON_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#404040',
    backgroundColor: '#1c1c1c',
    marginRight: COLOR_GAP,
    marginBottom: COLOR_GAP,
  },
  iconButtonLastInRow: {
    marginRight: 0,
  },
  iconButtonSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
    backgroundColor: '#2c2c2c',
  },
});

