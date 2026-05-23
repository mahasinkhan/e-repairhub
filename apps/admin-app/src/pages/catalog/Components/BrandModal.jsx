import { useState } from "react";

export default function BrandModal({
  onSave,
  onClose
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = () => {
    const formData = new FormData();

    formData.append("name", name);
    formData.append(
      "description",
      description
    );

    if (image) {
      formData.append("image", image);
    }

    onSave(formData);
  };

  return (
    <div className="bg-white p-5 rounded">
      <h2 className="font-semibold mb-4">
        Add Brand
      </h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Brand Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="file"
        onChange={(e) =>
          setImage(e.target.files[0])
        }
      />

      <div className="flex gap-2 mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white"
          onClick={handleSubmit}
        >
          Save
        </button>

        <button
          className="px-4 py-2 border"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}