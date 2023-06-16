import 'suneditor/dist/css/suneditor.min.css';

import dynamic from 'next/dynamic';

// import '/styles/suneditor/suneditor.css';

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

interface Props {
  initialContent?: string;
  onChange: (content: string) => void;
}

const Editor = ({ initialContent = '', onChange }: Props) => (
  <SunEditor
    setContents={initialContent}
    onChange={onChange}
    height="30vh"
    width="100%"
    setDefaultStyle="font-family: Inter; font-size: 12px;"
    setOptions={{
      mode: 'balloon',
      buttonList: [
        ['undo', 'redo', 'formatBlock'],
        ['bold', 'underline', 'italic', 'removeFormat'],
        ['outdent', 'indent', 'align', 'horizontalRule', 'list']
      ]
    }}
  />
);
export default Editor;
