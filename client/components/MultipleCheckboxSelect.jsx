const MultiCheckboxSelect = ({ options, value, onChange, label }) => {
  const handleChange = (option) => {
    const newValue = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-1">
        {options.map((option) => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={value?.includes(option)}
              onChange={() => handleChange(option)}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultiCheckboxSelect;
