import React from "react";

const Sprite = ({
  sprite,
  handleMouseDown,
  handleActionDrop,
  removeSprite,
}) => {
  return (
    <div
      key={sprite.id}
      className='absolute w-24 h-24'
      style={{
        left: `${sprite.position.x}px`,
        top: `${sprite.position.y}px`,
        transform: `rotate(${sprite.rotation}deg)`,
      }}
      onMouseDown={(e) => handleMouseDown(e, sprite)}
      onDrop={(e) => handleActionDrop(e, sprite.id)}
      onDragOver={(e) => e.preventDefault()}
    >
      <img
        src={sprite.src}
        alt={sprite.name}
        className='w-full h-full object-contain cursor-move'
        draggable={false}
      />
      {sprite.speechBubble && (
        <div
          className={`absolute -top-12 left-1/2 transform -translate-x-1/2 p-2 text-sm rounded-lg max-w-[120px] text-center z-50 ${
            sprite.speechBubble.type === "say"
              ? "bg-white border border-gray-300"
              : "bg-gray-200 border border-gray-400"
          }`}
          style={{
            pointerEvents: "none",
            wordBreak: "break-word",
          }}
        >
          {sprite.speechBubble.message}
        </div>
      )}
      <button
        onClick={() => removeSprite(sprite.id)}
        className='absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded'
      >
        ✕
      </button>
    </div>
  );
};

export default Sprite;
