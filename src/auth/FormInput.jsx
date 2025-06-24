const FormInput = ({
  Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  endAdornment,
}) => (
  <div>
    <div
      className={`flex items-center border rounded-lg px-3 py-2 ${
        error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <Icon size={18} className="text-gray-400 mr-2" />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 outline-none text-gray-700 placeholder-gray-400"
      />
      {endAdornment && <div className="ml-2">{endAdornment}</div>}
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default FormInput;
