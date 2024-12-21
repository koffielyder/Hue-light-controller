const Row = ({ children, header, onMouseMove = (e) => {} }) => {
    return (
      <div className="row h-24 flex relative">
        <div className="row-header border-r w-48 flex shrink-0 bg-white z-10 h-24">
          {header || <div className="default-header"></div>}
        </div>
        <div className="row-content flex bg-white" onMouseMove={onMouseMove}>
          {children || <div className="default-content"></div>}
        </div>
      </div>
    );
  };
  
  export default Row;
  