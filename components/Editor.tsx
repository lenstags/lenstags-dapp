import React from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

const Editor = (props) => {
  return (
    <SunEditor
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
};
export default Editor;
