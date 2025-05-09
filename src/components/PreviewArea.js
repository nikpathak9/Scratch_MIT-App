import React, { useState, useRef, useEffect } from "react";
import Sprite from "./Sprite";
import ControlPanel from "./ControlPanel";
import SpriteModal from "./SpriteModal";

const SPRITE_SIZE = 24;
const COLLISION_RADIUS = 70;

const spriteOptions = [
  {
    name: "Cat",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/bcf454acf82e4504149f7ffe07081dbc.svg/get/",
  },
  {
    name: "Dog",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/35cd78a8a71546a16c530d0b2d7d5a7f.svg/get/",
  },
  {
    name: "Robot",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/35070c1078c4eec153ea2769516c922c.svg/get/",
  },
  {
    name: "Bear",
    src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/deef1eaa96d550ae6fc11524a1935024.svg/get/",
  },
];

const PreviewArea = ({ sprites, setSprites }) => {
  const [selectedSprite, setSelectedSprite] = useState(spriteOptions[0].src);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 350 });
  const [isPlaying, setIsPlaying] = useState(false);

  const draggingSprite = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const previewRef = useRef(null);

  useEffect(() => {
    setIsInitial(true);
  }, [sprites.length]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (previewRef.current) {
        const { clientWidth, clientHeight } = previewRef.current;
        setCanvasSize({
          width: clientWidth || 500,
          height: clientHeight || 350,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const addSprite = () => {
    const selected = spriteOptions.find((s) => s.src === selectedSprite);
    if (!selected) return;

    const last = sprites[sprites.length - 1];
    const newPos = last
      ? { x: last.position.x + 100, y: last.position.y }
      : { x: 0, y: 0 };

    const newSprite = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      name: selected.name,
      src: selected.src,
      actions: [],
      position: newPos,
      dragPosition: newPos,
      rotation: 0,
      speechBubble: null,
    };

    setSprites((prev) => [...prev, newSprite]);
    setIsModalOpen(false);
    setIsInitial(true);
  };

  const removeSprite = (id) => {
    setSprites((prev) => prev.filter((s) => s.id !== id));
  };

  const handleActionDrop = (e, spriteId) => {
    e.preventDefault();
    try {
      const action = JSON.parse(e.dataTransfer.getData("text/plain"));
      setSprites((prev) =>
        prev.map((s) =>
          s.id === spriteId ? { ...s, actions: [...s.actions, action] } : s
        )
      );
    } catch (err) {
      console.error("Invalid action data", err);
    }
  };

  const checkCollision = (a, b) => {
    const centerA = {
      x: a.position.x + SPRITE_SIZE / 2,
      y: a.position.y + SPRITE_SIZE / 2,
    };
    const centerB = {
      x: b.position.x + SPRITE_SIZE / 2,
      y: b.position.y + SPRITE_SIZE / 2,
    };
    const distance = Math.sqrt(
      (centerA.x - centerB.x) ** 2 + (centerA.y - centerB.y) ** 2
    );
    return distance <= COLLISION_RADIUS;
  };

  const swapActions = (id1, id2) => {
    setSprites((prev) => {
      const clone = prev.map((sprite) => ({
        ...sprite,
        actions: [...sprite.actions],
      }));
      const i1 = clone.findIndex((s) => s.id === id1);
      const i2 = clone.findIndex((s) => s.id === id2);
      if (i1 !== -1 && i2 !== -1) {
        [clone[i1].actions, clone[i2].actions] = [
          [...clone[i2].actions],
          [...clone[i1].actions],
        ];
      }
      return clone;
    });
  };

  const executeSingleAction = async (
    sprite,
    action,
    allSprites,
    updateState
  ) => {
    console.log(`Executing: ${action.label}, Category: ${action.category}`);
    const maxX = canvasSize.width - SPRITE_SIZE;
    const maxY = canvasSize.height * 0.7 - SPRITE_SIZE;

    let pos = { ...sprite.position };
    let rot = sprite.rotation;
    let currentSprite = { ...sprite, actions: [...sprite.actions] };

    const getTargetPosition = (dx = 0, dy = 0) => ({
      x: Math.max(0, Math.min(pos.x + dx, maxX)),
      y: Math.max(0, Math.min(pos.y + dy, maxY)),
    });

    if (action.label === "Go to x:__ y:__") {
      const dx = parseInt(action.inputs?.x || 0, 10);
      const dy = parseInt(action.inputs?.y || 0, 10);
      const target = getTargetPosition(dx, dy);
      const temp = { ...currentSprite, position: target };

      const collided = allSprites.find(
        (s) => s.id !== currentSprite.id && checkCollision(temp, s)
      );
      if (collided && !isInitial) {
        swapActions(currentSprite.id, collided.id);
        const updatedSprites = allSprites.map((s) => ({
          ...s,
          actions: [...s.actions],
        }));
        const updatedSpriteIndex = updatedSprites.findIndex(
          (s) => s.id === currentSprite.id
        );
        const collidedSpriteIndex = updatedSprites.findIndex(
          (s) => s.id === collided.id
        );
        if (updatedSpriteIndex !== -1 && collidedSpriteIndex !== -1) {
          [
            updatedSprites[updatedSpriteIndex].actions,
            updatedSprites[collidedSpriteIndex].actions,
          ] = [
            [...updatedSprites[collidedSpriteIndex].actions],
            [...updatedSprites[updatedSpriteIndex].actions],
          ];
          currentSprite = {
            ...currentSprite,
            actions: [...updatedSprites[updatedSpriteIndex].actions],
          };
          updateState(updatedSprites);
        }
      }
      pos = target;
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id ? { ...s, position: pos } : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate animation
    } else if (action.label === "Move __ steps") {
      const steps = parseInt(action.inputs?.steps || 10, 10);
      const angle = (rot * Math.PI) / 180;
      const dx = steps * Math.cos(angle);
      const dy = -steps * Math.sin(angle); // Negative for correct direction
      const target = getTargetPosition(dx, dy);
      const temp = { ...currentSprite, position: target };

      const collided = allSprites.find(
        (s) => s.id !== currentSprite.id && checkCollision(temp, s)
      );
      if (collided && !isInitial) {
        swapActions(currentSprite.id, collided.id);
        const updatedSprites = allSprites.map((s) => ({
          ...s,
          actions: [...s.actions],
        }));
        const updatedSpriteIndex = updatedSprites.findIndex(
          (s) => s.id === currentSprite.id
        );
        const collidedSpriteIndex = updatedSprites.findIndex(
          (s) => s.id === collided.id
        );
        if (updatedSpriteIndex !== -1 && collidedSpriteIndex !== -1) {
          [
            updatedSprites[updatedSpriteIndex].actions,
            updatedSprites[collidedSpriteIndex].actions,
          ] = [
            [...updatedSprites[collidedSpriteIndex].actions],
            [...updatedSprites[updatedSpriteIndex].actions],
          ];
          currentSprite = {
            ...currentSprite,
            actions: [...updatedSprites[updatedSpriteIndex].actions],
          };
          updateState(updatedSprites);
        }
      }
      pos = target;
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id ? { ...s, position: pos } : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate animation
    } else if (action.label === "Turn __ degrees left") {
      rot -= parseInt(action.inputs?.degrees || 15, 10);
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id ? { ...s, rotation: rot } : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate animation
    } else if (action.label === "Turn __ degrees right") {
      rot += parseInt(action.inputs?.degrees || 15, 10);
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id ? { ...s, rotation: rot } : s
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate animation
    } else if (
      ["Say __ for __ seconds", "Think __ for __ seconds"].includes(
        action.label
      )
    ) {
      const duration = parseInt(action.inputs?.duration || 2, 10) * 1000;
      const message = action.inputs?.message || "Hello!";
      const type = action.label.includes("Say") ? "say" : "think";

      // Set speech bubble
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id
            ? { ...s, speechBubble: { message, duration, type } }
            : s
        )
      );

      // Wait for duration
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Clear speech bubble
      updateState((prev) =>
        prev.map((s) =>
          s.id === currentSprite.id ? { ...s, speechBubble: null } : s
        )
      );
    }

    return {
      ...currentSprite,
      position: pos,
      rotation: rot,
      speechBubble: null,
    };
  };

  const executeSpriteActions = async (sprite, allSprites, updateState) => {
    let currentSprite = { ...sprite, actions: [...sprite.actions] };
    for (const action of currentSprite.actions) {
      currentSprite = await executeSingleAction(
        currentSprite,
        action,
        allSprites,
        updateState
      );
      // Small delay to ensure rendering
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return currentSprite;
  };

  const playActions = async () => {
    if (isPlaying || canvasSize.width === 0 || canvasSize.height === 0) {
      if (canvasSize.width === 0 || canvasSize.height === 0) {
        setTimeout(playActions, 100);
      }
      return;
    }

    setIsPlaying(true);
    let updated = [...sprites];
    for (const sprite of sprites) {
      const updatedSprite = await executeSpriteActions(
        sprite,
        updated,
        (updater) => {
          updated = typeof updater === "function" ? updater(updated) : updater;
          setSprites(updated); // Immediate state update
          return updated;
        }
      );
      updated = updated.map((s) => (s.id === sprite.id ? updatedSprite : s));
    }
    setSprites(updated);
    setIsInitial(false);
    setIsPlaying(false);
  };

  const handleMouseDown = (e, sprite) => {
    draggingSprite.current = sprite.id;
    const rect = e.target.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = (e) => {
    if (!draggingSprite.current) return;
    const bounds = previewRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left - offset.current.x;
    const y = e.clientY - bounds.top - offset.current.y;

    setSprites((prev) =>
      prev.map((s) =>
        s.id === draggingSprite.current
          ? {
              ...s,
              position: {
                x: Math.max(0, Math.min(x, bounds.width - SPRITE_SIZE)),
                y: Math.max(0, Math.min(y, bounds.height - SPRITE_SIZE)),
              },
            }
          : s
      )
    );
  };

  const handleMouseUp = () => {
    if (draggingSprite.current) {
      setSprites((prev) =>
        prev.map((s) =>
          s.id === draggingSprite.current
            ? { ...s, dragPosition: { ...s.position } }
            : s
        )
      );
    }
    draggingSprite.current = null;
  };

  return (
    <div
      ref={previewRef}
      className='w-full h-full relative preview-container'
      style={{ position: "relative", overflow: "visible" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className='p-2 w-full h-[400px] relative overflow-visible'>
        {sprites.map((sprite) => (
          <Sprite
            sprite={sprite}
            handleMouseDown={handleMouseDown}
            handleActionDrop={handleActionDrop}
            removeSprite={removeSprite}
          />
        ))}
      </div>

      <ControlPanel
        setIsModalOpen={setIsModalOpen}
        playActions={playActions}
        isPlaying={isPlaying}
      />

      {isModalOpen && (
        <SpriteModal
          spriteOptions={spriteOptions}
          onClose={() => setIsModalOpen(false)}
          selectedSprite={selectedSprite}
          setSelectedSprite={setSelectedSprite}
          addSprite={addSprite}
        />
      )}
    </div>
  );
};

export default PreviewArea;
