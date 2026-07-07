import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // خروجی برای CommonJS و ES Modules
  dts: true, // تولید فایل‌های Declaration (.d.ts) برای تایپ‌اسکریپت
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'axios', 'lucide-react'], // جلوگیری از باندل شدن وابستگی‌های خارجی
});
