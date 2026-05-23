type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Search..."
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="border rounded px-3 py-2"
    />
  );
}