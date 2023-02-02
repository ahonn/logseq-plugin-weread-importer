import React, { useImperativeHandle, useState } from 'react';
import { BarLoader } from 'react-spinners';
import 'virtual:windi.css';

export interface IApp {
  setProgressMessage: (message: string) => void;
}

const App: React.ForwardRefRenderFunction<IApp> = (_, ref) => {
  const [progressMessage, setProgressMessage] = useState('');

  useImperativeHandle(ref, () => ({
    setProgressMessage,
  }));

  return (
    <div className="w-screen h-screen bg-black bg-opacity-75 flex justify-center items-center">
      <div className="w-1/2 flex flex-col">
        <BarLoader className="mb-2" width="100%" height="5px" color="#36d7b7" />
        <span className="text-lg" style={{ color: '#36d7b7' }}>
          {progressMessage}
        </span>
      </div>
    </div>
  );
};

export default React.forwardRef(App);
