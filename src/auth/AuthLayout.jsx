import { Link } from "react-router-dom";
import { ArrowLeft } from "react-feather";

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link
        to="/"
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to home
      </Link>

      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
