/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import {
  SandpackFile, SandpackProvider,
  SandpackSetup
} from '@codesandbox/sandpack-react';
import React from 'react';
import { CustomPreset } from './CustomPreset';


type SandpackProps = {
  children: React.ReactNode;
  autorun?: boolean;
  setup?: SandpackSetup;
};

const sandboxStyle = `
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 20px;
  padding: 0;
}

h1 {
  margin-top: 0;
  font-size: 22px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

h3 {
  margin-top: 0;
  font-size: 18px;
}

h4 {
  margin-top: 0;
  font-size: 16px;
}

h5 {
  margin-top: 0;
  font-size: 14px;
}

h6 {
  margin-top: 0;
  font-size: 12px;
}

ul {
  padding-left: 20px;
}
`.trim();

function Sandpack(props: SandpackProps) {
  let { children, setup, autorun = true } = props;
  let [resetKey, setResetKey] = React.useState(0);
  let codeSnippets = React.Children.toArray(children) as React.ReactElement[];
  let isSingleFile = true;

  const files = codeSnippets.reduce(
    (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
      if (codeSnippet.props.mdxType !== 'pre') {
        return result;
      }
      const { props } = codeSnippet.props.children;
      let filePath; // path in the folder structure
      let fileHidden = false; // if the file is available as a tab
      let fileActive = false; // if the file tab is shown by default

      if (props.metastring) {
        const [name, ...params] = props.metastring.split(' ');
        filePath = '/' + name;
        if (params.includes('hidden')) {
          fileHidden = true;
        }
        if (params.includes('active')) {
          fileActive = true;
        }
        isSingleFile = false;
      } else {
        if (props.className === 'language-js') {
          filePath = '/App.js';
        } else if (props.className === 'language-css') {
          filePath = '/styles.css';
        } else {
          throw new Error(
            `Code block is missing a filename: ${props.children}`
          );
        }
      }
      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique path name`
        );
      }
      result[filePath] = {
        code: props.children as string,
        hidden: fileHidden,
        active: fileActive,
      };

      return result;
    },
    {}
  );

  files['/styles.css'] = {
    code: [sandboxStyle, files['/styles.css']?.code ?? ''].join('\n\n'),
    hidden: true,
  };

  let key = String(resetKey);
  if (process.env.NODE_ENV !== 'production') {
    // Remount on any source change in development.
    key +=
      '-' +
      JSON.stringify({
        ...props,
        children: files,
      });
  }

  return (
    <div className="my-8" translate="no">
      <SandpackProvider
        key={key}
        template="react"
        recompileMode='delayed'
        recompileDelay={5000}
        customSetup={{ ...setup, files: files }}
        autorun={autorun}>
        <CustomPreset
          isSingleFile={isSingleFile}
          onReset={() => {
            setResetKey((k) => k + 1);
          }}
        />
      </SandpackProvider>
    </div>
  );
}

Sandpack.displayName = 'Sandpack';

export default Sandpack;
