import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stitchecho.knit',
  appName: '织影',
  webDir: 'www',
  server: {
    iosScheme: 'stitchecho',
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
