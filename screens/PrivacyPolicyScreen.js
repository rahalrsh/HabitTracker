import { StyleSheet, Text, View, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function PrivacyPolicyScreen({ navigation }) {
  const handleEmailPress = () => {
    Linking.openURL('mailto:rahalrsh@gmail.com');
  };

  const handleViewOnlinePress = () => {
    Linking.openURL('https://rahalrsh.github.io/HabitTracker/privacy_policy/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="left" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy – "Habit" App</Text>
          <Text style={styles.muted}>Last updated: January 1, 2026</Text>
          
          <Pressable 
            onPress={handleViewOnlinePress}
            style={styles.onlineButton}
          >
            <AntDesign name="link" size={16} color="#3b82f6" />
            <Text style={styles.onlineButtonText}>View Privacy Policy Online</Text>
          </Pressable>

          <Text style={styles.heading}>Summary</Text>
          <Text style={styles.paragraph}>
            "Habit" is designed to work without collecting personal information.
            Your habit data is stored locally on your device.
          </Text>

          <Text style={styles.heading}>Data We Collect</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Personal Data:</Text> We do not collect personal data such as
            your name, email address, phone number, or precise location.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Habit Data:</Text> Habits you create (titles, schedules,
            completions, and notes) are stored only on your device.
          </Text>

          <Text style={styles.heading}>Analytics, Tracking, and Advertising</Text>
          <Text style={styles.paragraph}>
            We do not use advertising and we do not track users across apps or
            websites for advertising purposes.
          </Text>
          <Text style={styles.paragraph}>
            The app may rely on standard platform services to maintain stability
            (for example, basic diagnostics provided by the operating system or app
            distribution services). This information is not used to identify you.
          </Text>

          <Text style={styles.heading}>Sharing Your Data</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or share your personal information with third
            parties.
          </Text>

          <Text style={styles.heading}>Data Retention</Text>
          <Text style={styles.paragraph}>
            Your habit data remains on your device unless you delete it in the app
            or uninstall the app.
          </Text>

          <Text style={styles.heading}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            "Habit" is not intended to collect personal information from
            children. If you believe a child has provided personal information,
            please contact us.
          </Text>

          <View style={styles.contactBox}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Contact</Text>{'\n'}
              If you have any questions about this Privacy Policy, email:
              {'\n'}
              <Text style={styles.email} onPress={handleEmailPress}>
                rahalrsh@gmail.com
              </Text>
            </Text>
          </View>

          <Text style={styles.heading}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. Changes will be
            reflected by updating the "Last updated" date above.
          </Text>

          <Text style={styles.footer}>© 2026 "Habit"</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2c2c2c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  muted: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  onlineButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  heading: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  paragraph: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
  },
  contactBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    marginBottom: 16,
  },
  email: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  footer: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});

