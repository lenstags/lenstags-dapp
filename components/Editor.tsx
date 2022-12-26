import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import React, { useState } from "react";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface Props {
  initialContent?: string;
  onChange: (content: string) => void;
}

const Editor = ({ initialContent = "", onChange }: Props) => (
  <SunEditor
    setContents={initialContent}
    // onChange={(c) => {
    //   return onChange(c);
    // }}
    onChange={onChange}
    // onChange={(content) => {
    //   console.log("CON ", content);
    //   setContent(content);
    //   const contentTestContainer = document.createElement("div");
    //   contentTestContainer.innerHTML = content;
    //   const textContent = contentTestContainer.textContent;

    //   // if (textContent) {
    //   //   props.getFieldHelpers("description").setValue(content);
    //   // }
    // }}
    height="30vh"
    width="100%"
    setOptions={{
      buttonList: [
        ["undo", "redo"],
        [
          "formatBlock",
          "font",
          "fontSize",
          "fontColor",
          "align",
          "paragraphStyle",
          "blockquote",
        ],
        [
          "bold",
          "underline",
          "italic",
          "strike",
          "subscript",
          "superscript",
          "hiliteColor",
        ],
        ["removeFormat"],
        ["outdent", "indent"],
        ["table", "list", "codeView"],
        ["link", "image", "video"],
        ["preview", "save"],
      ],
    }}
  />
);
export default Editor;
