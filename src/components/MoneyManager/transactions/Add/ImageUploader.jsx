// ImageUploader.jsx
import React from 'react';
import { Button } from "antd";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../services/apiService"; // Ajusta la ruta según tu estructura

const ImageUploader = ({ imageUrls, setImageUrls, voucher, setVoucher }) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const uploadedImageUrls = await Promise.all(files.map(async (file) => {
          const uploadedImageUrl = await uploadImage(file);
          return uploadedImageUrl;
        }));

        setImageUrls((prevUrls) => [...prevUrls, ...uploadedImageUrls]);
        setVoucher((prevVoucher) => `${prevVoucher}\n${uploadedImageUrls.join("\n")}`);
      } catch (error) {
        console.error("Error al subir las imágenes:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron subir algunas imágenes. Por favor, intente de nuevo.",
          confirmButtonColor: "#d33",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (index, url) => {
    setImageUrls(urls => urls.filter((_, i) => i !== index));
    setVoucher(voucher => voucher.replace(url, '').trim());
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Comprobantes
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="w-full"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="text-sm text-gray-500 mt-2">Subiendo imágenes...</div>
        )}
      </div>
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Comprobante ${index + 1}`}
                className="rounded-lg w-full h-24 object-cover"
              />
              <Button
                type="primary"
                danger
                size="small"
                icon={<IoClose />}
                onClick={() => handleRemoveImage(index, url)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;