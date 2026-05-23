type Props = {
  checked: boolean;
  onChange: () => void;
};

export default function StatusToggle({
  checked,
  onChange,
}: Props) {
  return (
    <button
      onClick={onChange}
      className={
        checked
          ? "bg-green-500 text-white px-3 py-1 rounded"
          : "bg-gray-300 px-3 py-1 rounded"
      }
    >
      {checked ? "Active" : "Inactive"}
    </button>
  );
}