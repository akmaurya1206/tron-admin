import { Button } from "react-bootstrap";

const ClearCookie = () => {
    const handleClick = () => {
        localStorage.clear();
        alert("Cookies cleared successfully");
        window.location.href = "/login";
    };

  return (
    <>
    <Button variant="danger" onClick={handleClick}>Clear Cookies</Button>
    </>
  );
};

export default ClearCookie;