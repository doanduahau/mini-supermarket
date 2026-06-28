import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập | Quản lý nhân sự siêu thị',
  description: 'Đăng nhập vào hệ thống quản trị nhân sự',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-2xl font-bold italic">Mini</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dành cho Ban quản lý và Nhân viên siêu thị
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
