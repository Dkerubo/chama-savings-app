type Props = {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
  
  const ConfirmDialog = ({ message, onConfirm, onCancel }: Props) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
          <p className="mb-4">{message}</p>
          <div className="flex justify-center gap-4">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Yes, Delete</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmDialog;
  