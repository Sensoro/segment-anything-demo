import React, { useContext } from "react";
import PhotoAlbum from "react-photo-album";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import AppContext from "../../hooks/createContext";
import photos from "../../helpers/photos";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { handleSelectedImage } = useContext(AppContext)!;

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop: (acceptedFile) => {
      try {
        if (acceptedFile.length === 0) {
          alert("File not accepted! Try again.");
          return;
        }
        if (acceptedFile.length > 1) {
          alert("Too many files! Try again with 1 file.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          navigate("/main");
          handleSelectedImage(acceptedFile[0]);
        };
        reader.readAsDataURL(acceptedFile[0]);
      } catch (error) {
        console.log(error);
      }
    },
    maxSize: 50_000_000,
  });

  return (
    <>
      <div className="flex flex-row py-5 text-sm align-middle md:text-lg">
        {/* <AiOutlineArrowDown className="mr-2" /> */}
        <div className="flex items-center">
          <span>选择图片, 或者</span>
          <span {...getRootProps()}>
            <input {...getInputProps()} />
            <button className="ml-1 text-blue-700 underline">上传图片</button>
          </span>
        </div>
      </div>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        columns={1}
        onClick={(e: any) => {
          handleSelectedImage(new URL(e.photo.src, location.origin), {
            shouldDownload: false,
          });
          pathname !== "/main" && navigate("/main");
        }}
        renderPhoto={({ imageProps }) => {
          const { src, style, onClick } = imageProps;
          return (
            <img
              className="m-0 lg:hover:opacity-50 active:opacity-50"
              src={src}
              style={style}
              onClick={(e) => {
                onClick!(e);
              }}
            />
          );
        }}
      />
    </>
  );
};

export default Home;
