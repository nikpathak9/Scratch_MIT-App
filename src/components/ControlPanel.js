import React from "react";

const ControlPanel = ({ setIsModalOpen, playActions, isPlaying }) => {
  return (
    <div className='flex gap-2 justify-center border-t p-2 bg-gray-50'>
      <button
        className={`bg-green-500 text-white px-4 py-2 font-bold rounded cpanel ${
          isPlaying ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={playActions}
        disabled={isPlaying}
      >
        Play Actions
      </button>
      <button
        className='bg-blue-500 text-white px-4 py-2 rounded font-bold cpanel'
        onClick={() => setIsModalOpen(true)}
      >
        Add Sprite
      </button>
    </div>
  );
};

export default ControlPanel;
