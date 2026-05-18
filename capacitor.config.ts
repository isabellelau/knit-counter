import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stitchecho.knit',
  appName: '织影',
  webDir: 'www',
  server: {
    iosScheme: 'stitchecho',
  },
  ios: {
    // 确保 WebView 延伸到状态栏下方，safe-area inset 正确生效
    contentInset: 'always',
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
