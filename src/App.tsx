import React from 'react'
import PhotoAlbum from 'react-photo-album'

import photos from './helpers/photos'

const App: React.FC = () => {
  return (
    <>
      <PhotoAlbum
        layout="rows"
        photos={photos}
        columns={1}
        onClick={(e) => {
          console.log(e);
        }}
        renderPhoto={({ imageProps }) => {
          const { src, style, onClick } = imageProps

          return (
            <img
              className="m-0 lg:hover:opacity-50 active:opacity-50"
              src={src}
              style={style}
              onClick={(e) => onClick!(e)}
            />
          )
        }}
      />
    </>
  )
}

export default App
