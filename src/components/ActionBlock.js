import React from "react";

const ActionBlock = ({
  action,
  activeSprite,
  handleActionDragStart,
  handleActionDragOver,
  removeAction,
  formatActionLabel,
  handleActionReorder,
}) => {
  return (
    <div
      key={action.id}
      draggable
      onDragStart={(e) => handleActionDragStart(e, activeSprite.id, action.id)}
      onDragOver={handleActionDragOver}
      onDrop={(e) => handleActionReorder(e, activeSprite.id, action.id)}
      className={`action-block ${action.backgroundColor} p-2 rounded mb-2 text-white flex justify-between items-center cursor-move`}
    >
      <span>{formatActionLabel(action)}</span>
      <button
        onClick={() => removeAction(activeSprite.id, action.id)}
        className='bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700'
      >
        ✕
      </button>
    </div>
  );
};

export default ActionBlock;
