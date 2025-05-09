import React from "react";

const SpriteModal = ({
  spriteOptions,
  selectedSprite,
  setSelectedSprite,
  addSprite,
  onClose,
}) => {
  return (
    <>
      <div className='absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center z-10'>
        <div className='bg-white p-6 rounded-xl shadow-lg w-[300px] text-center'>
          <h2 className='text-lg font-semibold mb-4'>Choose a Sprite</h2>
          <div className='flex flex-wrap gap-2 justify-center mb-4'>
            {spriteOptions.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSprite(s.src)}
                className={`p-1 border rounded hover:bg-gray-200 ${
                  selectedSprite === s.src ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <img
                  src={s.src}
                  alt={s.name}
                  className='w-12 h-12 object-contain'
                />
              </button>
            ))}
          </div>
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded mr-2'
            onClick={addSprite}
          >
            Add
          </button>
          <button
            className='bg-gray-300 text-black px-4 py-2 rounded'
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default SpriteModal;
