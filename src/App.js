import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import "./index.css";

export default function App() {
  const [sprites, setSprites] = useState([
    {
      id: "1",
      name: "Cat",
      src: "https://cdn.assets.scratch.mit.edu/internalapi/asset/bcf454acf82e4504149f7ffe07081dbc.svg/get/",
      actions: [],
      position: { x: 100, y: 100 },
      dragPosition: { x: 0, y: 0 },
      rotation: 0,
      speechBubble: null,
    },
  ]);

  return (
    <>
      <nav
        className='flex justify-between items-center p-4 text-white font-bold text-xl'
        style={{ backgroundColor: "hsla(260, 60%, 60%, 1)" }}
      >
        <h1>
          <img
            src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Scratch_Logo.svg/1280px-Scratch_Logo.svg.png'
            alt='Scratch App'
            className='w-50 h-20 mr-2'
          />
        </h1>
      </nav>
      <div className='bg-blue-100 pt-6 font-sans min-h-screen'>
        <div className='h-screen flex flex-row'>
          <div className='flex-1 h-full flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2'>
            <Sidebar sprites={sprites} setSprites={setSprites} />
            <MidArea sprites={sprites} setSprites={setSprites} />
          </div>
          <div className='w-1/3 h-full bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2'>
            <PreviewArea sprites={sprites} setSprites={setSprites} />
          </div>
        </div>
      </div>
    </>
  );
}
