const countries = [
  { code: "+234", label: "🇳🇬 +234" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+27", label: "🇿🇦 +27" },
];

function CountryCodeSelect({ value, onChange }) {
  return (
    <select
      className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white transition-all"
      value={value}
      onChange={onChange}
    >
      {countries.map((c) => (
        <option key={c.code} value={c.code}>{c.label}</option>
      ))}
    </select>
  );
}

export default CountryCodeSelect;