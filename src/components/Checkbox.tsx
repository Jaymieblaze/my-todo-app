const Checkbox = ({ checked, onChange, id, label, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
    />
    {label && <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
  </div>
);

export default Checkbox;