import React, { useState } from "react";

export default function Sidebar({ setDraggedAction, sprites, setSprites }) {
  const [inputValues, setInputValues] = useState({
    "Go to x:__ y:__": { x: "", y: "" },
    "Say __ for __ seconds": { message: "", duration: "" },
    "Think __ for __ seconds": { message: "", duration: "" },
    "Move __ steps": { steps: "" },
    "Turn __ degrees left": { degrees: "" },
    "Turn __ degrees right": { degrees: "" },
  });

  const actionBlocks = {
    Motion: [
      { label: "Move __ steps" },
      { label: "Turn __ degrees left" },
      { label: "Turn __ degrees right" },
      { label: "Go to x:__ y:__" },
    ],
    Looks: [
      { label: "Say __ for __ seconds" },
      { label: "Think __ for __ seconds" },
    ],
  };

  const handleInputChange = (label, field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        [field]: value,
      },
    }));
  };

  const handleDropOnSidebar = (e) => {
    e.preventDefault();
    const actionData = e.dataTransfer.getData("text/plain");
    if (!actionData) return;

    try {
      const { spriteId, actionId, source } = JSON.parse(actionData);
      console.log("Dropped on Sidebar:", { spriteId, actionId, source });

      if (source === "midarea" && Array.isArray(sprites)) {
        console.log("Before removal - Sprites:", sprites);
        const updatedSprites = sprites.map((sprite) =>
          sprite.id === spriteId
            ? {
                ...sprite,
                actions: sprite.actions.filter(
                  (action) => action.id !== actionId
                ),
              }
            : sprite
        );
        console.log("After removal - Updated Sprites:", updatedSprites);
        setSprites(updatedSprites);
      }
    } catch (error) {
      console.error("Error handling drop on Sidebar:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderLabelWithInputs = (label, inputs) => {
    const parts = label.split(/(__)/);
    let inputIndex = 0;
    const inputFields = {
      "Go to x:__ y:__": ["x", "y"],
      "Say __ for __ seconds": ["message", "duration"],
      "Think __ for __ seconds": ["message", "duration"],
      "Move __ steps": ["steps"],
      "Turn __ degrees left": ["degrees"],
      "Turn __ degrees right": ["degrees"],
    };
    const fields = inputFields[label] || [];

    return parts.map((part, index) => {
      if (part === "__") {
        const field = fields[inputIndex];
        inputIndex++;
        const isNumber = field !== "message";
        return (
          <input
            key={`${label}-${field}-${index}`}
            type={isNumber ? "number" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={inputs[field] || ""}
            onChange={(e) => handleInputChange(label, field, e.target.value)}
            className='w-12 px-1 mx-1 text-black rounded inline-block align-middle'
            style={{ height: "20px", fontSize: "12px" }}
            onDragStart={(e) => e.stopPropagation()}
          />
        );
      }
      return (
        <span key={`${label}-${index}`} className='inline-block align-middle'>
          {part}
        </span>
      );
    });
  };

  return (
    <div
      className='w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200'
      onDrop={handleDropOnSidebar}
      onDragOver={handleDragOver}
    >
      {Object.entries(actionBlocks).map(([category, blocks]) => (
        <div key={category} className='mb-4 w-full'>
          <div className='font-bold mb-1'>{category}</div>
          {blocks.map((block, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => {
                const action = {
                  category,
                  label: block.label,
                  inputs: inputValues[block.label] || {},
                };
                e.dataTransfer.setData("text/plain", JSON.stringify(action));
                if (typeof setDraggedAction === "function") {
                  setDraggedAction(action);
                }
              }}
              className={`flex flex-row items-center px-2 py-1 my-1 text-sm cursor-pointer rounded ${
                category === "Motion"
                  ? "bg-blue-500"
                  : category === "Looks"
                  ? "bg-purple-500"
                  : "bg-yellow-500"
              } text-white`}
            >
              {renderLabelWithInputs(block.label, inputValues[block.label])}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
