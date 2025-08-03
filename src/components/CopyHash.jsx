import React from "react";
import { useState, useRef } from "react";
import { Overlay, Tooltip } from "react-bootstrap";

const CopyHash = (props) => {
  const [copyIcon, setCopyIcon] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const targetRef = useRef(null); // Ref to target the button
  const truncateAddress = (address) => {
    if (address.length > 16) {
      return `${address.substring(0, 10)}...${address.substring(
        address.length - 10
      )}`;
    }
    return address;
  };
  const handleCopy = () => {
    navigator.clipboard
      .writeText(props.hash)
      .then(() => {
        setCopyIcon(true);
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          setCopyIcon(false);
        }, 2000);
      })
      .catch((error) => {
        alert("Failed to copy address: ", error);
        setCopyIcon(false);
        setShowTooltip(false);
      });
  };

  return (
    <>
      {truncateAddress(props.hash)}
      <span ref={targetRef} onClick={handleCopy} className="ms-1" onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        {copyIcon ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2" viewBox="0 0 16 16">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
        </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            className="bi bi-copy"
            viewBox="0 0 16 16"
            role="button"
          >
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
            />
          </svg>
        )}
      </span>
      {/* Tooltip will appear near the button */}
      <Overlay target={targetRef.current} show={showTooltip} placement="top">
        {(props) => <Tooltip {...props}>{copyIcon? 'Copied':'Copy'}</Tooltip>}
      </Overlay>
    </>
  );
};

export default CopyHash;
