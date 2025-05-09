import React, { useState, useEffect } from "react";
import ActionBlock from "./ActionBlock";

export default function MidArea({ sprites = [], setSprites }) {
  const [activeTab, setActiveTab] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const formatActionLabel = (action) => {
    if (action.label === "Go to x:__ y:__" && action.inputs) {
      return `Go to x:${action.inputs.x || 0} y:${action.inputs.y || 0}`;
    }
    if (action.label === "Say __ for __ seconds" && action.inputs) {
      return `Say "${action.inputs.message || "Default"}" for ${
        action.inputs.duration || 2
      } seconds`;
    }
    if (action.label === "Think __ for __ seconds" && action.inputs) {
      return `Think "${action.inputs.message || "Default"}" for ${
        action.inputs.duration || 2
      } seconds`;
    }
    if (action.label === "Move __ steps" && action.inputs) {
      return `Move ${action.inputs.steps || 10} steps`;
    }
    if (action.label === "Turn __ degrees left" && action.inputs) {
      return `Turn ${action.inputs.degrees || 15} degrees left`;
    }
    if (action.label === "Turn __ degrees right" && action.inputs) {
      return `Turn ${action.inputs.degrees || 15} degrees right`;
    }
    return action.label;
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const handleActionDrop = (e, spriteId) => {
    e.preventDefault();
    const actionData = e.dataTransfer.getData("text/plain");
    if (!actionData) return;

    try {
      const actionObject = JSON.parse(actionData);

      if (actionObject.source === "midarea") return;

      if (!sprites.some((sprite) => sprite.id === spriteId)) {
        console.warn("Invalid spriteId:", spriteId);
        return;
      }

      const categoryToColor = {
        Motion: "bg-blue-500",
        Looks: "bg-purple-500",
        Events: "bg-yellow-500",
      };

      const updatedAction = {
        ...actionObject,
        id: Date.now() + Math.random().toString(36).substring(2),
        inputs: actionObject.inputs || {},
        backgroundColor:
          categoryToColor[actionObject.category] || "bg-gray-500",
      };

      setSprites((prev) =>
        prev.map((sprite) =>
          sprite.id === spriteId
            ? { ...sprite, actions: [...sprite.actions, updatedAction] }
            : sprite
        )
      );
    } catch (error) {
      console.error("Error parsing dropped action:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeAction = (spriteId, actionId) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              actions: sprite.actions.filter(
                (action) => String(action.id) !== String(actionId)
              ),
            }
          : sprite
      )
    );
  };

  const handleActionDragStart = (e, spriteId, actionId) => {
    const sprite = sprites.find((sprite) => sprite.id === spriteId);
    const action = sprite.actions.find((action) => action.id === actionId);
    if (!sprite || !action) return;

    const dragData = {
      ...action,
      spriteId,
      actionId,
      source: "midarea",
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(actionId);
  };

  const handleActionDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleActionReorder = (e, spriteId, dropActionId) => {
    e.preventDefault();
    const actionData = e.dataTransfer.getData("text/plain");
    if (!actionData) return;

    try {
      const {
        spriteId: draggedSpriteId,
        actionId: draggedActionId,
        source,
      } = JSON.parse(actionData);

      if (source !== "midarea" || draggedSpriteId !== spriteId) return;

      setSprites((prev) => {
        const newSprites = prev.map((sprite) => {
          if (sprite.id === spriteId) {
            const newActions = [...sprite.actions];
            const draggedIndex = newActions.findIndex(
              (action) => action.id === draggedActionId
            );
            const dropIndex = newActions.findIndex(
              (action) => action.id === dropActionId
            );

            if (draggedIndex === -1 || dropIndex === -1) return sprite;

            const [draggedAction] = newActions.splice(draggedIndex, 1);
            newActions.splice(dropIndex, 0, draggedAction);
            console.log(
              "Reordered actions:",
              newActions.map((a) => a.label)
            );
            return { ...sprite, actions: newActions };
          }
          return sprite;
        });
        return newSprites;
      });

      setDraggedIndex(null);
    } catch (error) {
      console.error("Error reordering action:", error);
    }
  };

  useEffect(() => {
    if (
      sprites.length > 0 &&
      (activeTab === undefined || activeTab >= sprites.length)
    ) {
      setActiveTab(0);
    }
  }, [sprites, activeTab]);

  if (!sprites || sprites.length === 0) {
    return <div>No sprites available</div>;
  }

  const activeSprite = sprites[activeTab];
  if (!activeSprite) {
    return <div>Selected sprite not found</div>;
  }

  return (
    <div className='flex-1 h-full overflow-auto p-4 bg-gray-100'>
      <div className='flex space-x-4 mb-4'>
        {sprites.map((sprite, index) => (
          <button
            key={sprite.id}
            onClick={() => handleTabClick(index)}
            className={`tab py-2 px-4 rounded-t-md ${
              activeTab === index ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            {sprite.name || sprite.id}
          </button>
        ))}
      </div>

      <div
        className='action-area'
        onDrop={(e) => handleActionDrop(e, activeSprite.id)}
        onDragOver={handleDragOver}
      >
        <h2>Actions for Sprite {activeSprite.name || activeSprite.id}</h2>
        {activeSprite.actions.map((action) => (
          <ActionBlock
            action={action}
            activeSprite={activeSprite}
            handleActionDragStart={handleActionDragStart}
            handleActionDragOver={handleActionDragOver}
            removeAction={removeAction}
            formatActionLabel={formatActionLabel}
            handleActionReorder={handleActionReorder}
          />
        ))}
      </div>
    </div>
  );
}
