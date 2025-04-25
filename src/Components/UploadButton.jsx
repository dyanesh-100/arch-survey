import { useNavigate } from "react-router-dom";

const UploadButton = ({ label, navigateTo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(navigateTo);
  };

  return <button className="cursor-pointer" onClick={handleClick}>{label}</button>;
};

export default UploadButton;
