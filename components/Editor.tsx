import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; // Sun Editor's CSS File

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
          'formatBlock',
          'font',
          'fontSize',
          'fontColor',
          'align',
          'paragraphStyle',
          'blockquote'
        ],
        [
          'bold',
          'underline',
          'italic',
          'strike',
          'subscript',
          'superscript',
          'hiliteColor'
        ],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['table', 'list', 'codeView'],
        ['link', 'image', 'video'],
        ['preview', 'save']
      ]
    }}
  />
);
export default Editor;
