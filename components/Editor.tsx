import 'suneditor/dist/css/suneditor.min.css'; // Sun Editor's CSS File

import dynamic from 'next/dynamic';

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
    setOptions={{
      buttonList: [
        ['undo', 'redo'],
        [
          'font',
          'fontSize',
          'fontColor',
          'align',
          'paragraphStyle',
          'blockquote'
        ],
        ['bold', 'underline', 'italic'],
        ['removeFormat']
        // ['table', 'list', 'codeView'],
        // ['preview', 'save']
      ]
    }}
  />
);
export default Editor;
