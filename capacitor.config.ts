import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgetmitra.app',
  appName: 'BudgetMitra',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0F766E',
      sound: 'beep.wav',
    },
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
