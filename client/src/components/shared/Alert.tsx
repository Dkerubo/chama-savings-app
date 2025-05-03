type Props = {
    type: "success" | "error";
    message: string;
    onClose: () => void;
  };
  
  const Alert = ({ type, message, onClose }: Props) => {
    const color = type === "success" ? "green" : "red";
    return (
      <div className={`bg-${color}-100 border-l-4 border-${color}-500 text-${color}-700 p-4 mb-4 rounded relative`}>
        <p>{message}</p>
        <button className="absolute top-1 right-2" onClick={onClose}>×</button>
      </div>
    );
  };
  
  export default Alert;
  